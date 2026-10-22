import {
  AnimatedSprite,
  Application,
  Container,
  Graphics,
  Sprite,
  Texture,
  TilingSprite
} from 'pixi.js';
import { PixiTextureFactory } from './pixi-texture-factory.js?v=sprite32_1';
import { createPixiWeatherLayer } from './pixi-weather-layer.js?v=pixi_final_1';
import { preloadBoilerplateSprites } from './character-designer.js?v=sprite32_1';
import {
  drawRiverChannelRow,
  drawRiverForegroundSoil,
  drawRiverWaterline,
  getRiverVisualProfile
} from './scene-sprites.js?v=pixi_final_1';

const mountedStages = new Map();
let stageCleanupObserver = null;

function createGraphicsContext(graphics, width, height) {
  let fillStyle = '#000000';
  let globalAlpha = 1;
  let pendingRect = null;
  const stateStack = [];

  const flush = () => {
    if (!pendingRect) return;
    graphics
      .rect(pendingRect.x, pendingRect.y, pendingRect.width, pendingRect.height)
      .fill({ color: pendingRect.fillStyle, alpha: pendingRect.globalAlpha });
    pendingRect = null;
  };

  return {
    canvas: { width, height },
    get fillStyle() {
      return fillStyle;
    },
    set fillStyle(value) {
      if (fillStyle === value) return;
      flush();
      fillStyle = value;
    },
    get globalAlpha() {
      return globalAlpha;
    },
    set globalAlpha(value) {
      if (globalAlpha === value) return;
      flush();
      globalAlpha = value;
    },
    fillRect(x, y, rectWidth, rectHeight) {
      if (rectWidth <= 0 || rectHeight <= 0) return;
      if (
        pendingRect
        && pendingRect.fillStyle === fillStyle
        && pendingRect.globalAlpha === globalAlpha
        && pendingRect.y === y
        && pendingRect.height === rectHeight
        && pendingRect.x + pendingRect.width === x
      ) {
        pendingRect.width += rectWidth;
        return;
      }
      flush();
      pendingRect = {
        x,
        y,
        width: rectWidth,
        height: rectHeight,
        fillStyle,
        globalAlpha
      };
    },
    save() {
      stateStack.push({ fillStyle, globalAlpha });
    },
    restore() {
      const state = stateStack.pop();
      if (!state) return;
      flush();
      fillStyle = state.fillStyle;
      globalAlpha = state.globalAlpha;
    },
    flush
  };
}

function drawRiverWaterGraphics(graphics, riverLayers) {
  graphics.clear();
  const context = createGraphicsContext(graphics, riverLayers.width, riverLayers.height);
  const profile = getRiverVisualProfile(riverLayers.river);
  for (let y = riverLayers.horizonY + 2; y < riverLayers.height; y += 1) {
    drawRiverChannelRow(
      context,
      riverLayers.width,
      y,
      riverLayers.horizonY,
      riverLayers.pathStartY,
      riverLayers.pathEndY,
      riverLayers.height,
      profile.depthScale,
      0,
      riverLayers.landmarkId
    );
  }
  context.flush();
}

function drawRiverForegroundSoilGraphics(graphics, riverLayers) {
  graphics.clear();
  const context = createGraphicsContext(graphics, riverLayers.width, riverLayers.height);
  drawRiverForegroundSoil(
    context,
    riverLayers.width,
    riverLayers.pathEndY,
    riverLayers.height,
    riverLayers.landmarkId
  );
  context.flush();
}

function drawRiverTintGraphics(graphics, riverLayers) {
  graphics.clear();
  const context = createGraphicsContext(graphics, riverLayers.width, riverLayers.height);
  drawRiverWaterline(
    context,
    riverLayers.width,
    riverLayers.sceneFootY,
    0,
    riverLayers.horizonY,
    riverLayers.pathEndY,
    riverLayers.river,
    riverLayers.landmarkId,
    0
  );
  context.flush();
}

class ParallaxLayer extends Container {
  constructor(texture, width, height, speedFactor) {
    super();
    this.speedFactor = speedFactor;
    this.sprite = new TilingSprite({ texture, width, height, roundPixels: true });
    this.addChild(this.sprite);
  }

  updateScroll(scrollOffset) {
    this.sprite.tilePosition.x = -scrollOffset * this.speedFactor;
  }
}

function observeStageCleanup() {
  if (stageCleanupObserver || typeof MutationObserver === 'undefined') return;
  stageCleanupObserver = new MutationObserver(() => {
    for (const [sourceCanvas, stage] of mountedStages) {
      if (!sourceCanvas.isConnected) stage.destroy();
    }
    if (mountedStages.size === 0) {
      stageCleanupObserver.disconnect();
      stageCleanupObserver = null;
    }
  });
  stageCleanupObserver.observe(document.documentElement, { childList: true, subtree: true });
}

function createActorController(container, textureFactory, shadowTexture) {
  const partySprites = new Map();
  let caravanSprite = null;
  let caravanFrames = null;
  let destroyed = false;

  const createAnimatedSprite = (frames) => {
    const sprite = new AnimatedSprite(frames);
    sprite.anchor.set(0, 0);
    sprite.animationSpeed = 0;
    sprite.autoUpdate = false;
    sprite.roundPixels = true;
    sprite.gotoAndStop(0);
    return sprite;
  };

  function update(actorState) {
    if (destroyed) return 0;
    container.removeChildren();
    let actorCount = 0;
    const activePartyIds = new Set();

    if (actorState?.wagon) {
      const wagon = actorState.wagon;
      const frames = textureFactory.getCaravanFrames(wagon.oxenYokes, {
        suppressGroundShadow: wagon.suppressGroundShadow,
        floatingHull: wagon.floatingHull,
        moving: wagon.moving
      });
      if (!caravanSprite) {
        caravanSprite = createAnimatedSprite(frames);
        caravanFrames = frames;
      } else if (caravanFrames !== frames) {
        caravanSprite.textures = frames;
        caravanFrames = frames;
      }
      caravanSprite.position.set(wagon.x, wagon.y);
      caravanSprite.gotoAndStop(wagon.frameIndex % frames.length);
      caravanSprite.visible = true;
      container.addChild(caravanSprite);
      actorCount += 1;
    } else if (caravanSprite) {
      caravanSprite.visible = false;
    }

    for (const actor of actorState?.party ?? []) {
      activePartyIds.add(actor.id);
      const frames = textureFactory.getCharacterFrames(
        actor.appearance,
        'side_right',
        actor.animationMode
      );
      let record = partySprites.get(actor.id);
      if (!record) {
        record = {
          sprite: createAnimatedSprite(frames),
          shadow: new Sprite(shadowTexture),
          frames
        };
        record.shadow.anchor.set(0, 0);
        record.shadow.roundPixels = true;
        partySprites.set(actor.id, record);
      } else if (record.frames !== frames) {
        record.sprite.textures = frames;
        record.frames = frames;
      }

      const frameIndex = actor.frameIndex % frames.length;
      record.sprite.position.set(actor.x, actor.y);
      record.sprite.scale.set(actor.scale);
      record.sprite.gotoAndStop(frameIndex);
      record.sprite.visible = true;

      record.shadow.position.set(actor.shadowX, actor.shadowY);
      record.shadow.width = actor.shadowWidth;
      record.shadow.height = actor.shadowHeight;
      record.shadow.visible = actor.shadowVisible;
      container.addChild(record.shadow, record.sprite);
      actorCount += 1;
    }

    for (const [id, record] of partySprites) {
      if (activePartyIds.has(id)) continue;
      record.sprite.destroy({ texture: false, textureSource: false });
      record.shadow.destroy({ texture: false, textureSource: false });
      partySprites.delete(id);
    }

    return actorCount;
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    caravanSprite?.destroy({ texture: false, textureSource: false });
    for (const record of partySprites.values()) {
      record.sprite.destroy({ texture: false, textureSource: false });
      record.shadow.destroy({ texture: false, textureSource: false });
    }
    partySprites.clear();
    container.removeChildren();
  }

  return { update, destroy };
}

export async function mountPixiStage(sourceCanvas) {
  await preloadBoilerplateSprites();
  const frame = sourceCanvas.parentElement;
  if (!frame) {
    throw new Error('PixiJS stage requires a canvas frame.');
  }

  const view = document.createElement('canvas');
  view.className = 'pixi-renderer-canvas';
  view.setAttribute('aria-hidden', 'true');

  const application = new Application();
  let initialized = false;
  const ownedTextures = new Set();
  let textureFactory = null;
  let actorController = null;
  try {
    await application.init({
      canvas: view,
      width: sourceCanvas.width,
      height: sourceCanvas.height,
      resolution: 1,
      autoDensity: false,
      antialias: false,
      backgroundAlpha: 0,
      autoStart: false,
      sharedTicker: false,
      preference: 'webgl'
    });
    initialized = true;

    const texture = Texture.from(sourceCanvas);
    ownedTextures.add(texture);
    texture.source.scaleMode = 'nearest';
    const sceneSprite = new Sprite(texture);
    sceneSprite.width = sourceCanvas.width;
    sceneSprite.height = sourceCanvas.height;
    sceneSprite.roundPixels = true;
    const backgroundContainer = new Container();
    const actorContainer = new Container();
    const riverWaterGraphics = new Graphics();
    const riverForegroundSoilGraphics = new Graphics();
    const riverSkeletonContainer = new Container();
    const riverUnderlayGraphics = new Graphics();
    const riverOverlayGraphics = new Graphics();
    const weatherLayer = createPixiWeatherLayer(sourceCanvas.width, sourceCanvas.height);
    ownedTextures.add(weatherLayer.particleTexture);
    ownedTextures.add(weatherLayer.portalTexture);
    textureFactory = new PixiTextureFactory();
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 16;
    shadowCanvas.height = 3;
    const shadowContext = shadowCanvas.getContext('2d');
    if (!shadowContext) {
      throw new Error('Could not create the PixiJS party shadow texture.');
    }
    shadowContext.fillStyle = 'rgba(0, 0, 0, 0.16)';
    shadowContext.fillRect(2, 0, 12, 1);
    shadowContext.fillStyle = 'rgba(0, 0, 0, 0.38)';
    shadowContext.fillRect(0, 1, 16, 1);
    shadowContext.fillStyle = 'rgba(0, 0, 0, 0.18)';
    shadowContext.fillRect(1, 2, 14, 1);
    const shadowTexture = Texture.from(shadowCanvas);
    shadowTexture.source.scaleMode = 'nearest';
    ownedTextures.add(shadowTexture);
    actorController = createActorController(actorContainer, textureFactory, shadowTexture);
    application.stage.addChild(
      backgroundContainer,
      riverWaterGraphics,
      sceneSprite,
      riverForegroundSoilGraphics,
      weatherLayer.background,
      riverSkeletonContainer,
      riverUnderlayGraphics,
      actorContainer,
      riverOverlayGraphics,
      weatherLayer.foreground
    );
    let skySprite = null;
    let cloudLayer = null;
    let horizonLayer = null;
    let backgroundRevision = null;
    let foregroundSprite = null;
    let foregroundTexture = null;
    let riverSkeletonSprites = null;
    let riverRevision = null;

    let destroyed = false;
    const stage = {
      update(
        backgroundLayers,
        scrollOffset = 0,
        actors = null,
        foregroundCanvas = null,
        riverLayers = null,
        weatherLayers = null
      ) {
        if (destroyed) return;
        if (!backgroundLayers) {
          backgroundContainer.visible = false;
        } else {
          backgroundContainer.visible = true;
          if (!skySprite) {
            const skyTexture = Texture.from(backgroundLayers.sky);
            const cloudsTexture = Texture.from(backgroundLayers.clouds);
            const horizonTexture = Texture.from(backgroundLayers.horizon);
            ownedTextures.add(skyTexture);
            ownedTextures.add(cloudsTexture);
            ownedTextures.add(horizonTexture);
            skyTexture.source.scaleMode = 'nearest';
            cloudsTexture.source.scaleMode = 'nearest';
            horizonTexture.source.scaleMode = 'nearest';
            skySprite = new Sprite(skyTexture);
            skySprite.roundPixels = true;
            skySprite.width = sourceCanvas.width;
            skySprite.height = sourceCanvas.height;
            cloudLayer = new ParallaxLayer(
              cloudsTexture,
              sourceCanvas.width,
              sourceCanvas.height,
              0.15
            );
            horizonLayer = new ParallaxLayer(
              horizonTexture,
              sourceCanvas.width,
              sourceCanvas.height,
              0.3
            );
            backgroundContainer.addChild(skySprite, cloudLayer, horizonLayer);
          }
          if (backgroundRevision !== backgroundLayers.revision) {
            skySprite.texture.source.update();
            cloudLayer.sprite.texture.source.update();
            horizonLayer.sprite.texture.source.update();
            backgroundRevision = backgroundLayers.revision;
          }
          cloudLayer.updateScroll(scrollOffset);
          horizonLayer.updateScroll(scrollOffset);
        }
        if (riverLayers) {
          riverWaterGraphics.visible = true;
          riverForegroundSoilGraphics.visible = true;
          riverSkeletonContainer.visible = true;
          if (!riverSkeletonSprites) {
            riverSkeletonSprites = {};
            for (const depthLayer of ['background', 'midground', 'foreground']) {
              const remainsTexture = Texture.from(riverLayers[depthLayer]);
              remainsTexture.source.scaleMode = 'nearest';
              ownedTextures.add(remainsTexture);
              const remainsSprite = new Sprite(remainsTexture);
              remainsSprite.roundPixels = true;
              remainsSprite.width = sourceCanvas.width;
              remainsSprite.height = sourceCanvas.height;
              riverSkeletonSprites[depthLayer] = remainsSprite;
              riverSkeletonContainer.addChild(remainsSprite);
            }
          }
          if (riverRevision !== riverLayers.revision) {
            drawRiverWaterGraphics(riverWaterGraphics, riverLayers);
            drawRiverForegroundSoilGraphics(riverForegroundSoilGraphics, riverLayers);
            for (const depthLayer of ['background', 'midground', 'foreground']) {
              riverSkeletonSprites[depthLayer].texture.source.update();
            }
            if (riverLayers.isFerryScene) {
              drawRiverTintGraphics(riverUnderlayGraphics, riverLayers);
              riverOverlayGraphics.clear();
            } else {
              riverUnderlayGraphics.clear();
              drawRiverTintGraphics(riverOverlayGraphics, riverLayers);
            }
            riverRevision = riverLayers.revision;
          }
          riverUnderlayGraphics.visible = riverLayers.isFerryScene;
          riverOverlayGraphics.visible = !riverLayers.isFerryScene;
        } else {
          riverWaterGraphics.visible = false;
          riverForegroundSoilGraphics.visible = false;
          riverSkeletonContainer.visible = false;
          riverUnderlayGraphics.visible = false;
          riverOverlayGraphics.visible = false;
        }
        weatherLayer.update(weatherLayers);
        const actorCount = actorController.update(actors);
        if (foregroundCanvas) {
          if (!foregroundSprite) {
            foregroundTexture = Texture.from(foregroundCanvas);
            foregroundTexture.source.scaleMode = 'nearest';
            ownedTextures.add(foregroundTexture);
            foregroundSprite = new Sprite(foregroundTexture);
            foregroundSprite.roundPixels = true;
            foregroundSprite.width = sourceCanvas.width;
            foregroundSprite.height = sourceCanvas.height;
            application.stage.addChild(foregroundSprite);
          } else {
            foregroundTexture.source.update();
          }
          foregroundSprite.visible = true;
        } else if (foregroundSprite) {
          foregroundSprite.visible = false;
        }
        texture.source.update();
        application.renderer.render(application.stage);
        frame.dataset.pixiActorCount = String(actorCount);
        frame.dataset.pixiWeatherOverlay = weatherLayers?.overlayId ?? 'none';
      },
      destroy() {
        if (destroyed) return;
        destroyed = true;
        actorController.destroy();
        sourceCanvas.classList.remove('pixi-renderer-source');
        if (frame.dataset.renderer === 'pixi') delete frame.dataset.renderer;
        delete frame.dataset.pixiActorCount;
        delete frame.dataset.pixiWeatherOverlay;
        mountedStages.delete(sourceCanvas);
        application.destroy({ removeView: true }, {
          children: true,
          texture: false,
          textureSource: false,
          context: true
        });
        for (const ownedTexture of ownedTextures) ownedTexture.destroy(true);
        ownedTextures.clear();
        textureFactory.destroy();
      }
    };

    stage.update(null);
    frame.append(application.canvas);
    frame.dataset.renderer = 'pixi';
    sourceCanvas.classList.add('pixi-renderer-source');
    mountedStages.set(sourceCanvas, stage);
    observeStageCleanup();
    return stage;
  } catch (error) {
    if (initialized) {
      actorController?.destroy();
      application.destroy({ removeView: true }, {
        children: true,
        texture: false,
        textureSource: false,
        context: true
      });
    }
    for (const ownedTexture of ownedTextures) ownedTexture.destroy(true);
    textureFactory?.destroy();
    view.remove();
    sourceCanvas.classList.remove('pixi-renderer-source');
    if (frame.dataset.renderer === 'pixi') delete frame.dataset.renderer;
    throw error;
  }
}

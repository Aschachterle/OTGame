import {
  BACKDROPS,
  DEFAULT_PARTY_ERA_ID,
  drawEraHomeBuilding,
  drawGeneralStoreBuilding,
  drawGeneralStoreInterior,
  drawPixelBackdropParallaxLayer,
  drawPixelBackdropScene,
  getCharacterFrameGrid,
  getCharacterFrameCount,
  mapBiomeToBackdropId,
  syncAllPartyAppearancesToEra
} from './character-designer.js?v=sprite32_1';
import { GRID_SIZE } from './character-presets.js';
import {
  WEATHER_OVERLAYS,
  drawFerryOperator,
  drawFerryPlatform,
  drawOxenAndWagonCart,
  drawRiverCrossingSplashes,
  drawRiverGuideMarker,
  drawRiverWaterline,
  drawSubmergedSkeletons,
  drawWeatherOverlay,
  getRiverWaterlineSurfaceYByX,
  getRiverVisualProfile,
  getWeatherOverlayMeta,
  normalizeWeatherOverlayId,
  riverBounds
} from './scene-sprites.js?v=pixi_final_1';
import {
  hasPixiStage,
  presentCanvasWithPixi,
  shouldUsePixiForCanvas
} from './pixi-stage.js?v=pixi_final_9';

export {
  WEATHER_OVERLAYS,
  drawWeatherOverlay,
  getWeatherOverlayMeta,
  normalizeWeatherOverlayId
} from './scene-sprites.js?v=pixi_final_1';

export const FERRY_BOARDING_END = 0.2;
export const FERRY_CROSSING_END = 0.8;
const FERRY_PLATFORM_WIDTH = 72;
const FAR_HORIZON_TEXTURE_WIDTH_MULTIPLIER = 8;
const pixiBackdropLayers = new WeakMap();
const pixiForegroundLayers = new WeakMap();
const pixiRiverLayers = new WeakMap();
const PIXI_WEATHER_OVERLAYS = new Set(['rain', 'snow_storm', 'thunderstorm', 'wormhole_storm']);

export function resolveActiveWeatherOverlay(state) {
  if (!state) return 'none';
  if (typeof state.weatherOverlayOverride === 'string' && state.weatherOverlayOverride !== '') {
    return normalizeWeatherOverlayId(state.weatherOverlayOverride);
  }
  if (typeof state.weatherOverlay === 'string' && state.weatherOverlay !== '') {
    return normalizeWeatherOverlayId(state.weatherOverlay);
  }
  const tileOverlay = state.currentTrailSnapshot?.weather?.overlay;
  if (typeof tileOverlay === 'string' && tileOverlay !== '') {
    return normalizeWeatherOverlayId(tileOverlay);
  }
  return 'none';
}

function interpolate(start, end, progress) {
  return start + (end - start) * Math.max(0, Math.min(1, progress));
}

function easeProgress(progress) {
  const t = Math.max(0, Math.min(1, progress));
  return t * t * (3 - 2 * t);
}

function getStoreApproachLayout(progress, storeX, pathStartY) {
  const t = Math.max(0, Math.min(1, progress));
  const house = { x: 84, footY: pathStartY + 9 };
  const store = { x: storeX - 18, footY: pathStartY + 9 };
  const arcY = Math.sin(t * Math.PI) * 1.5;

  return {
    partyX: interpolate(house.x, store.x, t),
    footY: interpolate(house.footY, store.footY, t) + arcY,
    scale: 1
  };
}

function drawScaledCharacterGrid(ctx, grid, baseX, baseY, scale) {
  const outputSize = Math.max(1, Math.round(GRID_SIZE * scale));
  const originX = Math.round(baseX);
  const originY = Math.round(baseY);

  for (let y = 0; y < outputSize; y += 1) {
    const sourceY = Math.min(GRID_SIZE - 1, Math.floor(y / scale));
    for (let x = 0; x < outputSize; x += 1) {
      const color = grid[sourceY][Math.min(GRID_SIZE - 1, Math.floor(x / scale))];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(originX + x, originY + y, 1, 1);
    }
  }
}

function getFerryLayout(progress, riverStart, riverEnd) {
  const ferryProgress = Math.max(0, Math.min(1, progress));
  // Overlap each bank by only 5px while docked
  const nearRaftX = riverStart - 5;
  const farRaftX = riverEnd - FERRY_PLATFORM_WIDTH + 5;
  const nearCartX = 12;
  const nearPartyX = 21;
  const nearDeckCartX = nearRaftX + 3;
  const nearDeckPartyX = nearRaftX + 15;
  const farDeckCartX = farRaftX + 3;
  const farDeckPartyX = farRaftX + 15;
  const farLandCartX = riverEnd + 8;
  const farLandPartyX = riverEnd + 17;

  if (ferryProgress < FERRY_BOARDING_END) {
    const boardingProgress = ferryProgress / FERRY_BOARDING_END;
    const deckLift = Math.round(3 * boardingProgress);
    return {
      raftX: nearRaftX,
      partyX: interpolate(nearPartyX, nearDeckPartyX, boardingProgress),
      cartX: interpolate(nearCartX, nearDeckCartX, boardingProgress),
      partyLift: deckLift,
      cartLift: deckLift,
      memberSpacing: 5,
      isBoarding: true,
      isDisembarking: false,
      isOnFerry: false
    };
  }

  if (ferryProgress <= FERRY_CROSSING_END) {
    const crossingProgress = (ferryProgress - FERRY_BOARDING_END)
      / (FERRY_CROSSING_END - FERRY_BOARDING_END);
    const raftX = interpolate(nearRaftX, farRaftX, crossingProgress);
    return {
      raftX,
      partyX: raftX + 15,
      cartX: raftX + 3,
      partyLift: 3,
      cartLift: 3,
      memberSpacing: 5,
      isBoarding: false,
      isDisembarking: false,
      isOnFerry: true
    };
  }

  const disembarkingProgress = (ferryProgress - FERRY_CROSSING_END)
    / (1 - FERRY_CROSSING_END);
  const deckLift = Math.round(3 * (1 - disembarkingProgress));
  return {
    raftX: farRaftX,
    partyX: interpolate(farDeckPartyX, farLandPartyX, disembarkingProgress),
    cartX: interpolate(farDeckCartX, farLandCartX, disembarkingProgress),
    partyLift: deckLift,
    cartLift: deckLift,
    memberSpacing: 5,
    isBoarding: false,
    isDisembarking: ferryProgress < 1,
    isOnFerry: false
  };
}

export function renderGameLandscapeStage(canvas, state, animTick = 0) {
  if (!canvas) return;
  const usePixi = shouldUsePixiForCanvas(canvas);
  const splitBackground = usePixi && hasPixiStage(canvas);
  const foregroundLayer = splitBackground ? getPixiForegroundLayer(canvas) : null;
  renderGameLandscapeStageLegacy(canvas, state, animTick, {
    drawBackgroundLayers: !splitBackground,
    pixiActorLayer: splitBackground,
    foregroundContext: foregroundLayer?.context
  });
  if (!usePixi) return;

  const backgroundMeta = canvas.__pixiBackdropMeta;
  const backgrounds = splitBackground && backgroundMeta?.usesParallaxLayers
    ? getPixiBackdropLayers(canvas, backgroundMeta)
    : null;
  const riverLayers = splitBackground && canvas.__pixiRiverMeta
    ? getPixiRiverLayers(canvas, canvas.__pixiRiverMeta)
    : null;
  const weatherLayers = splitBackground ? canvas.__pixiWeatherMeta : null;
  presentCanvasWithPixi(
    canvas,
    backgrounds,
    state.landscapeScrollX || 0,
    () => renderGameLandscapeStage(canvas, state, animTick),
    canvas.__pixiActors,
    foregroundLayer?.canvas,
    riverLayers,
    weatherLayers
  );
}

function getPixiForegroundLayer(canvas) {
  let layer = pixiForegroundLayers.get(canvas);
  if (!layer || layer.canvas.width !== canvas.width || layer.canvas.height !== canvas.height) {
    const foreground = document.createElement('canvas');
    foreground.width = canvas.width;
    foreground.height = canvas.height;
    const context = foreground.getContext('2d');
    if (!context) {
      throw new Error('Could not create the PixiJS foreground overlay canvas.');
    }
    layer = { canvas: foreground, context };
    pixiForegroundLayers.set(canvas, layer);
  }
  return layer;
}

function getPixiBackdropLayers(canvas, { backdropId, sceneFootY, width, height }) {
  let layers = pixiBackdropLayers.get(canvas);
  if (!layers) {
    const sky = document.createElement('canvas');
    const clouds = document.createElement('canvas');
    const horizon = document.createElement('canvas');
    sky.width = width;
    sky.height = height;
    clouds.width = width;
    clouds.height = height;
    horizon.width = width * FAR_HORIZON_TEXTURE_WIDTH_MULTIPLIER;
    horizon.height = height;
    layers = {
      key: '',
      sky,
      clouds,
      horizon,
      skyContext: sky.getContext('2d'),
      cloudsContext: clouds.getContext('2d'),
      horizonContext: horizon.getContext('2d')
    };
    if (!layers.skyContext || !layers.cloudsContext || !layers.horizonContext) {
      throw new Error('Could not create PixiJS parallax texture canvases.');
    }
    pixiBackdropLayers.set(canvas, layers);
  }

  const key = `${backdropId}:${sceneFootY}:${width}:${height}`;
  if (layers.key !== key) {
    layers.skyContext.clearRect(0, 0, width, height);
    layers.cloudsContext.clearRect(0, 0, width, height);
    layers.horizonContext.clearRect(0, 0, layers.horizon.width, height);
    drawPixelBackdropParallaxLayer(layers.skyContext, width, backdropId, sceneFootY, 'sky');
    drawPixelBackdropParallaxLayer(layers.cloudsContext, width, backdropId, sceneFootY, 'clouds');
    drawPixelBackdropParallaxLayer(
      layers.horizonContext,
      layers.horizon.width,
      backdropId,
      sceneFootY,
      'horizon'
    );
    layers.key = key;
    layers.revision = key;
  }

  return layers;
}

function getPixiRiverLayers(canvas, riverMeta) {
  let layers = pixiRiverLayers.get(canvas);
  if (!layers || layers.canvases.background.width !== riverMeta.width
    || layers.canvases.background.height !== riverMeta.height) {
    const canvases = {
      background: document.createElement('canvas'),
      midground: document.createElement('canvas'),
      foreground: document.createElement('canvas')
    };
    const contexts = Object.fromEntries(
      Object.entries(canvases).map(([layer, layerCanvas]) => {
        layerCanvas.width = riverMeta.width;
        layerCanvas.height = riverMeta.height;
        return [layer, layerCanvas.getContext('2d')];
      })
    );
    if (Object.values(contexts).some((context) => !context)) {
      throw new Error('Could not create the PixiJS submerged-remains texture canvases.');
    }
    layers = { canvases, contexts, revision: '' };
    pixiRiverLayers.set(canvas, layers);
  }

  const profile = getRiverVisualProfile(riverMeta.river);
  const revision = [
    riverMeta.landmarkId,
    riverMeta.width,
    riverMeta.height,
    riverMeta.pathEndY,
    profile.depthFt,
    profile.depthScale,
    riverMeta.isFerryScene
  ].join(':');
  if (layers.revision !== revision) {
    for (const depthLayer of ['background', 'midground', 'foreground']) {
      const layerCanvas = layers.canvases[depthLayer];
      const layerContext = layers.contexts[depthLayer];
      layerContext.clearRect(0, 0, layerCanvas.width, layerCanvas.height);
      drawSubmergedSkeletons(layerContext, riverMeta.width, riverMeta.height - 2, riverMeta.river, {
        pathEndY: riverMeta.pathEndY,
        landmarkId: riverMeta.landmarkId,
        depthLayer
      });
    }
    layers.revision = revision;
  }

  return { ...layers.canvases, revision, ...riverMeta };
}

export function renderGameLandscapeStageLegacy(canvas, state, animTick = 0, options = {}) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;
  const pixiActorLayer = options.pixiActorLayer === true;
  const foregroundContext = pixiActorLayer ? options.foregroundContext : ctx;
  if (pixiActorLayer && !foregroundContext) {
    throw new Error('PixiJS actor rendering requires a foreground overlay context.');
  }
  if (pixiActorLayer) foregroundContext.clearRect(0, 0, W, H);
  const drawBackgroundLayers = options.drawBackgroundLayers !== false;
  if (!drawBackgroundLayers) ctx.clearRect(0, 0, W, H);
  const pixiActors = { wagon: null, party: [] };
  const charFootY = Math.max(55, H - 14);

  const isStoreInterior = !state.journeyStarted && state.setupStage === 'outfitting';
  const isPreTrail = !state.journeyStarted && !isStoreInterior;
  const isStoreApproach = !state.journeyStarted
    && (state.setupStage === 'prologue' || state.setupStage === 'genesis');
  const selectedTile = state.currentTrailSnapshot || {};
  const riverVisualProfile = getRiverVisualProfile(selectedTile.river, selectedTile.tileId);
  const riverCrossing = state.riverCrossingAnimation;
  const riverEncounterActive = state.activeDecision?.type === 'river-crossing';
  const riverSceneActive = riverEncounterActive || Boolean(riverCrossing);
  const visualBiome = selectedTile.biome === 'river' && !riverSceneActive ? 'plains' : selectedTile.biome;
  const backdropId = isPreTrail
    ? 'prairie'
    : riverSceneActive
      ? 'river'
      : mapBiomeToBackdropId(visualBiome, selectedTile.weather);
  const pixiRiverLayer = pixiActorLayer && backdropId === 'river';

  const isMoving = Boolean(state.landscapeMoving || state.travelAnimationActive);
  const scrollOffset = state.landscapeScrollX || 0;
  const isWagonAnimationActive = isMoving;
  const rawWalkFrame = isWagonAnimationActive && Number.isInteger(state.wagonAnimationFrame) ? Math.max(0, state.wagonAnimationFrame) : 0;
  const frameIndex = rawWalkFrame % 4;
  const isFerryScene = riverCrossing?.method === 'ferry';
  const isFerryCrossing = isFerryScene && riverCrossing.phase === 'crossing';
  // Apply the depth offset once to the whole scene, keeping the riverbed anchored below.
  const sceneLiftPx = riverSceneActive ? riverVisualProfile.waterlineOffsetPx : 0;
  const sceneFootY = charFootY - sceneLiftPx;
  const horizonY = Math.max(12, sceneFootY - 26);
  const pathStartY = Math.max(18, sceneFootY - 10);
  const pathEndY = Math.min(H - 2, sceneFootY + 6);
  canvas.__pixiBackdropMeta = {
    backdropId,
    sceneFootY,
    width: W,
    height: H,
    usesParallaxLayers: !isStoreInterior
  };
  canvas.__pixiRiverMeta = pixiRiverLayer
    ? {
        river: selectedTile.river,
        landmarkId: selectedTile.tileId,
        width: W,
        height: H,
        horizonY,
        pathStartY,
        pathEndY,
        sceneFootY,
        isFerryScene: riverCrossing?.method === 'ferry'
      }
    : null;
  const storeX = W - 86;
  const storeApproachLayout = isStoreApproach
    ? getStoreApproachLayout(state.generalStoreApproachProgress ?? 0, storeX, pathStartY)
    : null;
  const weatherOverlayId = resolveActiveWeatherOverlay(state);
  const weatherSeed = weatherOverlayId === 'none'
    ? 0
    : (state.weatherSeed ??= Math.floor(Math.random() * 1000000));
  const pixiWeatherEffects = pixiActorLayer && PIXI_WEATHER_OVERLAYS.has(weatherOverlayId);
  canvas.__pixiWeatherMeta = pixiActorLayer && !isStoreInterior
    ? {
        overlayId: weatherOverlayId,
        width: W,
        height: H,
        tick: animTick,
        scrollOffset,
        horizonY,
        pathStartY,
        pathEndY,
        weatherSeed
      }
    : null;
  let surfaceYByX;

  if (isStoreInterior) {
    drawGeneralStoreInterior(ctx, W, H, animTick);
  } else {
    drawPixelBackdropScene(
      ctx,
      W,
      H,
      backdropId,
      scrollOffset,
      sceneFootY,
      selectedTile.river,
      selectedTile.tileId,
      0,
      drawBackgroundLayers,
      !pixiRiverLayer
    );
  }
  if (weatherOverlayId !== 'none' && !isStoreInterior) {
    drawWeatherOverlay(ctx, W, H, weatherOverlayId, animTick, scrollOffset, sceneFootY, {
      layer: 'background',
      isRiverScene: riverSceneActive,
      horizonY,
      pathStartY,
      pathEndY,
      landmarkId: selectedTile.tileId,
      weatherSeed,
      pixiEffects: pixiWeatherEffects
    });
  }
  if (riverSceneActive && !pixiRiverLayer) {
    drawSubmergedSkeletons(ctx, W, H - 2, selectedTile.river, {
      pathEndY,
      landmarkId: selectedTile.tileId
    });
  }
  if (riverSceneActive && isFerryScene) {
    if (!pixiRiverLayer) {
      surfaceYByX = drawRiverWaterline(
        ctx,
        W,
        sceneFootY,
        animTick + frameIndex,
        horizonY,
        pathEndY,
        selectedTile.river,
        selectedTile.tileId,
        0
      );
    }
  }

  const eraId = state.selectedEra || DEFAULT_PARTY_ERA_ID;
  if (isPreTrail) {
    drawEraHomeBuilding(ctx, eraId, 6, charFootY - 2);
    drawGeneralStoreBuilding(ctx, storeX, charFootY - 2, animTick);

    if (eraId !== 'oregon_trail') {
      const shimmerY = charFootY - 34;
      ctx.fillStyle = animTick % 2 === 0 ? 'rgba(0, 255, 102, 0.55)' : 'rgba(49, 162, 242, 0.55)';
      ctx.fillRect(66, shimmerY, 2, 30);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(66, shimmerY + ((animTick * 3) % 27), 2, 3);
    }
  } else if (!isStoreInterior && (state.milesTraveled || 0) === 0 && scrollOffset < 180) {
    drawGeneralStoreBuilding(ctx, 16 - Math.floor(scrollOffset * 0.8), charFootY - 2, animTick);
  }

  if (!isPreTrail && !isStoreInterior && !isMoving && state.lastActionContext?.actionType === 'camp') {
    const fireX = W - 46;
    const fireY = sceneFootY - 2;
    ctx.fillStyle = '#663931';
    ctx.fillRect(fireX - 3, fireY, 7, 2);
    ctx.fillStyle = animTick % 2 === 0 ? '#ec273f' : '#e98537';
    ctx.fillRect(fireX - 2, fireY - 3, 5, 3);
    ctx.fillStyle = '#f7e26b';
    ctx.fillRect(fireX - 1, fireY - 4 - (animTick % 2), 3, 3);
  }

  const hasOxenCart = !isStoreInterior
    && (state.journeyStarted || (state.setupStage === 'outfitting' && (state.outfittingCart?.oxenYokes ?? 0) > 0));
  const riverProgress = Math.max(0, Math.min(1, riverCrossing?.progress ?? 0));
  const { start: riverStart, end: riverEnd } = riverBounds(W, selectedTile.tileId);
  const ferryLayout = isFerryScene
    ? getFerryLayout(riverProgress, riverStart, riverEnd)
    : null;
  const ferryBob = isFerryCrossing && ferryLayout?.isOnFerry ? frameIndex % 2 : 0;

  const isGuideScene = riverCrossing?.method === 'guide';
  const crossingNearCartX = isGuideScene ? 4 : 12;
  const crossingFarCartX = isGuideScene ? riverEnd + 2 : riverEnd + 8;
  const crossingArch = Math.sin(Math.PI * riverProgress);
  const memberSpacing = storeApproachLayout
    ? 16
    : isStoreInterior
      ? 22
      : riverSceneActive
        ? isFerryScene
          ? (ferryLayout?.memberSpacing ?? 5)
          : Math.round((isGuideScene ? 4 : 5) + crossingArch * 4)
        : 20;

  const caravanCartX = riverSceneActive
    ? Math.round(interpolate(crossingNearCartX, crossingFarCartX, riverProgress))
    : Math.floor(W * 0.58);
  const caravanPartyLeaderX = riverSceneActive
    ? Math.round(caravanCartX + (isGuideScene ? 10 : 9) - crossingArch * 3)
    : Math.floor(W * 0.46);

  const isWadingCrossing = riverCrossing?.phase === 'crossing'
    && ['ford', 'guide', 'caulk'].includes(riverCrossing.method);
  const crossingDepth = isWadingCrossing
    ? Math.round(crossingArch * Math.round(7 * riverVisualProfile.depthScale))
    : 0;

  const activeCartX = isFerryScene && ferryLayout ? Math.round(ferryLayout.cartX) : caravanCartX;
  const cartInWaterChannel = riverSceneActive
    && !isFerryScene
    && (activeCartX + 64 > riverStart && activeCartX + 6 < riverEnd);
  const isCaulkFloat = riverCrossing?.method === 'caulk' && riverCrossing.phase === 'crossing';

  if (hasOxenCart) {
    const cartX = riverSceneActive ? activeCartX : isPreTrail ? storeX - 64 : Math.floor(W * 0.58);
    const yokes = state.journeyStarted ? (state.wagon?.oxenYokes || 2) : (state.outfittingCart?.oxenYokes || 2);
    const cartLift = ferryLayout?.cartLift ?? 0;
    const wagonWadingDepth = !isFerryScene && !isCaulkFloat ? Math.round(crossingDepth * 0.75) : 0;
    const cartBob = isCaulkFloat && cartInWaterChannel
      ? (frameIndex % 2 === 0 ? -3 : -1)
      : ferryBob;
    const ferryCartWalking = ferryLayout?.isBoarding || ferryLayout?.isDisembarking;

    if (isFerryScene && ferryLayout) {
      drawFerryPlatform(
        ctx,
        W,
        ferryLayout.raftX,
        sceneFootY - 1,
        ferryBob ? frameIndex : 0,
        Boolean(isFerryCrossing && ferryLayout.isOnFerry && isMoving)
      );
    }

    const cartGroundY = sceneFootY - 1 - cartLift + wagonWadingDepth + cartBob;
    const cartMoving = isMoving && state.journeyStarted && (!isFerryCrossing || ferryCartWalking);
    const suppressGroundShadow = Boolean(cartInWaterChannel || (isFerryScene && ferryLayout?.isOnFerry));
    const floatingHull = Boolean(isCaulkFloat && cartInWaterChannel);
    if (pixiActorLayer) {
      pixiActors.wagon = {
        x: Math.round(cartX) - 2,
        y: Math.round(cartGroundY) - 26,
        frameIndex,
        moving: cartMoving,
        oxenYokes: yokes,
        suppressGroundShadow,
        floatingHull
      };
    } else {
      drawOxenAndWagonCart(
        ctx,
        cartX,
        cartGroundY,
        frameIndex,
        cartMoving,
        yokes,
        { suppressGroundShadow, floatingHull }
      );
    }
  }

  if (isGuideScene) {
    drawRiverGuideMarker(ctx, activeCartX, sceneFootY + crossingDepth, frameIndex, isMoving, selectedTile.tileId);
  }

  const party = (state.wagon?.party || []).filter((member) => (member.health ?? 100) > 0);
  syncAllPartyAppearancesToEra(party, eraId);

  const baseLeaderX = storeApproachLayout
    ? storeApproachLayout.partyX
    : riverSceneActive
      ? isFerryScene && ferryLayout
        ? Math.round(ferryLayout.partyX)
        : caravanPartyLeaderX
      : isStoreInterior
        ? Math.floor(W * 0.52)
        : isPreTrail
          ? (state.landscapeCharX ?? 116)
          : Math.floor(W * 0.46);

  const characterAnchors = [];

  if (isStoreInterior) {
    const floorY = Math.floor(H * 0.71);
    const shopkeeperDrawX = W - 82;
    const shopkeeperFootY = floorY + 13;
    characterAnchors.push({
      type: 'npc',
      id: 'shopkeeper',
      name: 'Matt',
      role: 'Shopkeeper',
      headX: shopkeeperDrawX + 15.5,
      headY: Math.max(8, shopkeeperFootY - 27),
      footX: shopkeeperDrawX + 15.5,
      footY: shopkeeperFootY
    });
  } else if (isPreTrail) {
    characterAnchors.push({
      type: 'npc',
      id: 'shopkeeper',
      name: 'Matt',
      role: 'Shopkeeper',
      headX: storeX + 16 + 15.5,
      headY: Math.max(8, charFootY - 30),
      footX: storeX + 16 + 15.5,
      footY: charFootY - 3
    });
  }

  if (isGuideScene) {
    const guideDrawX = Math.max(0, Math.min(W - 25, Math.round(activeCartX + 43)));
    const guideFootY = Math.round(sceneFootY + crossingDepth);
    characterAnchors.push({
      type: 'npc',
      id: 'riverGuide',
      name: 'River Guide',
      role: 'Guide',
      headX: guideDrawX + 15.5,
      headY: Math.max(8, guideFootY - 27),
      footX: guideDrawX + 15.5,
      footY: guideFootY
    });
  }

  const ferryPartyWalking = ferryLayout?.isBoarding || ferryLayout?.isDisembarking;
  const storeApproachProgress = state.generalStoreApproachProgress ?? 0;
  const isStoreWalking = isStoreApproach && storeApproachProgress > 0 && storeApproachProgress < 1;
  const effectiveAnimMode = (isStoreWalking || (isMoving && (!isFerryCrossing || ferryPartyWalking))) ? 'walk' : 'idle';
  const partyFootPositions = [];

  const renderOrder = [...party.keys()].reverse();
  for (const idx of renderOrder) {
    const member = party[idx];
    const memberFrameCount = getCharacterFrameCount(member.appearance, 'side_right', effectiveAnimMode);
    const approachFrame = Math.floor(storeApproachProgress * 64);
    const memberFrameIndex = isStoreApproach
      ? (isStoreWalking ? (approachFrame + idx) % memberFrameCount : 0)
      : (((typeof rawWalkFrame === "number" ? rawWalkFrame : frameIndex) + idx) % memberFrameCount);
    const memberGrid = pixiActorLayer
      ? null
      : getCharacterFrameGrid(member.appearance, 'side_right', effectiveAnimMode, memberFrameIndex);
    const memberScale = storeApproachLayout?.scale ?? 1;
    const drawX = baseLeaderX - idx * memberSpacing;
    const footCenterX = drawX + 15 * memberScale;
    partyFootPositions.push(drawX + 15);

    const memberInWater = riverSceneActive
      && !isFerryScene
      && footCenterX >= riverStart
      && footCenterX < riverEnd;
    const memberDepth = memberInWater ? crossingDepth : 0;
    const ferryLift = ferryLayout?.partyLift ?? 0;
    const memberFootY = (storeApproachLayout?.footY ?? sceneFootY) + memberDepth + ferryBob - ferryLift;
    const drawY = memberFootY - 30 * memberScale + (idx % 2 === 0 ? 0 : -memberScale);

    characterAnchors.push({
      type: 'party',
      id: member.id || `member_${idx}`,
      name: member.name || member.role || `Traveler ${idx + 1}`,
      role: member.role || '',
      index: idx,
      headX: Math.max(10, Math.min(W - 10, drawX + 15.5 * memberScale)),
      headY: Math.max(6, drawY + 3 * memberScale),
      footX: footCenterX,
      footY: memberFootY
    });

    const shadowW = Math.round(16 * memberScale);
    const shadowH = Math.max(2, Math.round(3 * memberScale));
    const shadowX = Math.round(drawX + 7.5 * memberScale);
    // Soles of the shoes are at drawY + 29 * memberScale; anchor shadow directly under the soles
    const shadowY = Math.round(drawY + 28 * memberScale);

    if (pixiActorLayer) {
      pixiActors.party.push({
        id: member.id || `member_${idx}`,
        appearance: member.appearance,
        x: Math.round(drawX),
        y: Math.round(drawY),
        scale: memberScale,
        frameIndex: memberFrameIndex,
        animationMode: effectiveAnimMode,
        shadowX,
        shadowY,
        shadowWidth: shadowW,
        shadowHeight: shadowH,
        shadowVisible: !memberInWater
      });
    } else if (!memberInWater) {
      // Soft rounded oval contact shadow in Canvas 2D
      ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
      ctx.fillRect(shadowX + 2, shadowY - 1, shadowW - 4, 1);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.36)';
      ctx.fillRect(shadowX, shadowY, shadowW, 1);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.fillRect(shadowX + 1, shadowY + 1, shadowW - 2, 1);
    }

    if (!pixiActorLayer) {
      drawScaledCharacterGrid(ctx, memberGrid, drawX, drawY, memberScale);
    }

    if (isMoving && !isFerryCrossing && !memberInWater && !riverSceneActive) {
      const bd = BACKDROPS[backdropId] || BACKDROPS.prairie;
      foregroundContext.fillStyle = bd.dustColor;
      const puffOffset = (frameIndex + idx) % 2;
      foregroundContext.fillRect(drawX + 8 - puffOffset, memberFootY - 1 - puffOffset, 2, 1);
    }
  }

  if (riverSceneActive) {
    const isWadingWithSplashes = riverCrossing?.phase === 'crossing'
      && ['ford', 'guide', 'caulk'].includes(riverCrossing.method);
    if (!isFerryScene) {
      if (pixiRiverLayer) {
        if (isWadingWithSplashes) {
          surfaceYByX = getRiverWaterlineSurfaceYByX(
            W,
            sceneFootY,
            horizonY,
            pathEndY,
            selectedTile.river,
            selectedTile.tileId,
            0,
            H
          );
        }
      } else {
        surfaceYByX = drawRiverWaterline(
          foregroundContext,
          W,
          sceneFootY,
          animTick + frameIndex,
          horizonY,
          pathEndY,
          selectedTile.river,
          selectedTile.tileId,
          0
        );
      }
    }
    if (isWadingWithSplashes) {
      if (!surfaceYByX) throw new Error('River crossing splashes require a rendered water surface.');
      drawRiverCrossingSplashes(foregroundContext, W, baseLeaderX, surfaceYByX, frameIndex, {
        partyFootPositions,
        memberSpacing,
        partyCount: party.length,
        cartX: activeCartX,
        method: riverCrossing.method,
        landmarkId: selectedTile.tileId
      });
    }
    if (riverCrossing?.method === 'ferry') {
      if (!ferryLayout) throw new Error('Ferry operator requires a ferry layout.');
      drawFerryOperator(foregroundContext, W, ferryLayout.raftX, sceneFootY - 1, ferryBob ? frameIndex : 0);
      const operatorDrawX = Math.min(W - 25, Math.round(ferryLayout.raftX + 46));
      const operatorFootY = Math.round(sceneFootY - 5 + (ferryBob ? frameIndex % 2 : 0));
      characterAnchors.push({
        type: 'npc',
        id: 'ferryOperator',
        name: 'Ferryman',
        role: 'Ferry Attendant',
        headX: operatorDrawX + 15.5,
        headY: Math.max(8, operatorFootY - 27),
        footX: operatorDrawX + 15.5,
        footY: operatorFootY
      });
    }
  }

  if (weatherOverlayId !== 'none' && !isStoreInterior) {
    drawWeatherOverlay(foregroundContext, W, H, weatherOverlayId, animTick, scrollOffset, sceneFootY, {
      layer: 'foreground',
      isRiverScene: riverSceneActive,
      horizonY,
      pathStartY,
      pathEndY,
      landmarkId: selectedTile.tileId,
      weatherSeed,
      pixiEffects: pixiWeatherEffects
    });
  }

  const resolvedBubble = resolveActiveSceneDialogue(state, characterAnchors);
  canvas.__characterAnchors = characterAnchors;
  canvas.__activeSpeechBubble = resolvedBubble;
  canvas.__pixiActors = pixiActorLayer ? pixiActors : null;

  if (resolvedBubble?.anchor && canvas.id !== 'creator-landscape-canvas') {
    drawCanvasSpeechIndicator(foregroundContext, resolvedBubble.anchor, animTick);
  }
  syncCanvasSpeechBubble(canvas, resolvedBubble, W, H);
}

function parseDialogueCandidateFromSource(source, party = []) {
  if (!source) return null;
  const livingParty = party.filter((member) => (member.health ?? 100) > 0 && member.status !== 'Deceased');
  const candidatePool = livingParty.length ? livingParty : party;

  const matchSpeakerFromHint = (hintText = '') => {
    const normalizedHint = String(hintText).toLowerCase();
    if (!normalizedHint.trim()) return null;

    if (/\b(matt|shopkeeper|storekeeper|merchant|outfitter)\b/i.test(normalizedHint)) {
      return { speakerId: 'shopkeeper', speakerName: 'Matt', speakerRole: 'Shopkeeper', targetType: 'npc' };
    }
    if (/\b(ferryman|ferry\s+operator|ferry\s+attendant|boatman)\b/i.test(normalizedHint)) {
      return { speakerId: 'ferryOperator', speakerName: 'Ferryman', speakerRole: 'Ferry Attendant', targetType: 'npc' };
    }
    if (/\b(river\s+guide|shoshone\s+guide|pawnee\s+guide|local\s+guide)\b/i.test(normalizedHint)) {
      return { speakerId: 'riverGuide', speakerName: 'River Guide', speakerRole: 'Guide', targetType: 'npc' };
    }

    for (const member of candidatePool) {
      const escapedName = String(member.name || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (escapedName && new RegExp(`\\b${escapedName}\\b`, 'i').test(hintText)) {
        return { speakerId: member.id, speakerName: member.name, speakerRole: member.role, targetType: 'party' };
      }
    }
    for (const member of candidatePool) {
      const roleLower = String(member.role || '').toLowerCase();
      if (roleLower && new RegExp(`\\b${roleLower}\\b`, 'i').test(normalizedHint)) {
        return { speakerId: member.id, speakerName: member.name, speakerRole: member.role, targetType: 'party' };
      }
      if (roleLower === 'youth' && /\b(youngest|child|boy|girl)\b/i.test(normalizedHint)) {
        return { speakerId: member.id, speakerName: member.name, speakerRole: member.role, targetType: 'party' };
      }
    }
    return null;
  };

  if (typeof source === 'object' && typeof source.text === 'string' && source.text.trim()) {
    const cleaned = source.text.trim().replace(/^["“]+|["”]+$/g, '').trim();
    if (cleaned) {
      const byId = candidatePool.find((m) => source.speakerId && m.id === source.speakerId);
      const matched = byId
        ? { speakerId: byId.id, speakerName: byId.name, speakerRole: byId.role, targetType: 'party' }
        : matchSpeakerFromHint(`${source.speakerName ?? ''} ${source.speakerRole ?? ''} ${source.speakerId ?? ''}`);
      if (matched) {
        return { ...matched, text: cleaned };
      }
      const fallback = candidatePool[0];
      return {
        speakerId: source.speakerId || fallback?.id || 'leader',
        speakerName: source.speakerName?.trim() || fallback?.name || 'Traveler',
        speakerRole: source.speakerRole?.trim() || fallback?.role || '',
        targetType: source.targetType || 'party',
        text: cleaned
      };
    }
  }

  if (typeof source === 'object' && source.dialogue) {
    const direct = parseDialogueCandidateFromSource(source.dialogue, party);
    if (direct) return direct;
  }

  const segments = typeof source === 'string'
    ? [source]
    : [
        ...(Array.isArray(source.lines) ? source.lines : []),
        ...(Array.isArray(source.prologueParagraphs) ? source.prologueParagraphs : []),
        typeof source.body === 'string' ? source.body : ''
      ].filter(Boolean);

  for (const segment of segments) {
    const sentences = String(segment).match(/[^.!?]+[.!?]+(?:\s*["”])?|[^.!?]+$/g) ?? [String(segment)];
    for (let idx = 0; idx < sentences.length; idx += 1) {
      const sentence = sentences[idx];
      const matches = [...sentence.matchAll(/"([^"\n]{2,})"|“([^”\n]{2,})”/g)];
      if (!matches.length) continue;

      const quoteParts = matches.map((m) => (m[1] ?? m[2] ?? '').trim()).filter(Boolean);
      const quoteText = quoteParts.join(' ').replace(/\s+/g, ' ').trim();
      if (!quoteText) continue;

      const unquotedSentence = sentence.replace(/"[^"\n]*"|“[^”\n]*”/g, ' ');
      const prevSentence = idx > 0 ? sentences[idx - 1].replace(/"[^"\n]*"|“[^”\n]*”/g, ' ') : '';
      const matched =
        matchSpeakerFromHint(unquotedSentence) ||
        matchSpeakerFromHint(prevSentence) ||
        matchSpeakerFromHint(String(segment).replace(/"[^"\n]*"|“[^”\n]*”/g, ' ')) ||
        (candidatePool[0]
          ? { speakerId: candidatePool[0].id, speakerName: candidatePool[0].name, speakerRole: candidatePool[0].role, targetType: 'party' }
          : null);

      return {
        speakerId: matched?.speakerId ?? 'leader',
        speakerName: matched?.speakerName ?? 'Traveler',
        speakerRole: matched?.speakerRole ?? '',
        targetType: matched?.targetType ?? 'party',
        text: quoteText
      };
    }
  }

  return null;
}

const speechBubbleTrackers = new WeakMap();

function getSpeechBubbleDurationMs(text = '') {
  const words = String(text).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(5500, Math.min(8000, 3200 + words * 320));
}

export function resolveActiveSceneDialogue(state, characterAnchors = []) {
  if (!state) return null;
  if (state.dialogueOverride === 'none') return null;

  const isExplicitEditorOverride = Boolean(
    state.dialogueOverride && typeof state.dialogueOverride === 'object'
  );

  if (!isExplicitEditorOverride) {
    if (!state.journeyStarted && state.setupStage === 'register') return null;
    if (!state.journeyStarted && state.setupStage === 'outfitting') return null;
    const isStoreApproach = !state.journeyStarted
      && (state.setupStage === 'prologue' || state.setupStage === 'genesis');
    if (isStoreApproach && (state.generalStoreApproachProgress ?? 0) > 0) return null;
    if (state.narrationLoading) return null;
    if (state.landscapeMoving || state.travelAnimationActive) return null;
    if (state.riverCrossingAnimation?.phase === 'crossing') return null;
  }

  const party = state.wagon?.party ?? [];
  let candidate = null;

  if (isExplicitEditorOverride) {
    candidate = parseDialogueCandidateFromSource(state.dialogueOverride, party);
  } else if (!state.journeyStarted && (state.setupStage === 'prologue' || state.setupStage === 'genesis')) {
    candidate =
      parseDialogueCandidateFromSource(state.prologueDialogue, party) ||
      parseDialogueCandidateFromSource(state.activeDialogue, party) ||
      parseDialogueCandidateFromSource({ prologueParagraphs: state.prologueParagraphs }, party);
  } else {
    candidate =
      parseDialogueCandidateFromSource(state.activeDialogue, party) ||
      parseDialogueCandidateFromSource(state.latestNarration, party) ||
      parseDialogueCandidateFromSource(state.narrationText, party);
  }

  if (!candidate || !candidate.text) return null;

  const partyAnchors = characterAnchors.filter((a) => a.type === 'party');
  const npcAnchors = characterAnchors.filter((a) => a.type === 'npc');

  let matchedAnchor = null;
  if (candidate.targetType === 'npc' || ['shopkeeper', 'ferryOperator', 'riverGuide'].includes(candidate.speakerId)) {
    matchedAnchor =
      npcAnchors.find((a) => a.id === candidate.speakerId) ||
      npcAnchors.find((a) => a.name.toLowerCase() === String(candidate.speakerName || '').toLowerCase()) ||
      npcAnchors[0];
  }

  if (!matchedAnchor) {
    matchedAnchor =
      partyAnchors.find((a) => candidate.speakerId && a.id === candidate.speakerId) ||
      partyAnchors.find((a) => a.name && String(candidate.speakerName || '').toLowerCase() === a.name.toLowerCase()) ||
      partyAnchors.find((a) => a.role && String(candidate.speakerRole || '').toLowerCase() === a.role.toLowerCase()) ||
      partyAnchors[0] ||
      npcAnchors[0] ||
      null;
  }

  if (!matchedAnchor) return null;

  const shownAtAnchor = state.activeDialogueShownAt || 0;
  const dialogueKey = isExplicitEditorOverride
    ? `editor:${matchedAnchor.id}:${candidate.text}`
    : `${state.day ?? 0}:${state.milesTraveled ?? 0}:${state.turnPhase ?? ''}:${shownAtAnchor}:${matchedAnchor.id}:${candidate.text}`;

  if (!isExplicitEditorOverride) {
    let tracker = speechBubbleTrackers.get(state);
    const now = Date.now();
    if (!tracker || tracker.key !== dialogueKey) {
      tracker = {
        key: dialogueKey,
        shownAt: shownAtAnchor > 0 && now - shownAtAnchor < 1000 ? shownAtAnchor : now,
        durationMs: getSpeechBubbleDurationMs(candidate.text),
        dismissed: false
      };
      speechBubbleTrackers.set(state, tracker);
    }
    if (tracker.dismissed || now - tracker.shownAt >= tracker.durationMs) {
      tracker.dismissed = true;
      return null;
    }
  }

  return {
    key: dialogueKey,
    speakerId: matchedAnchor.id,
    speakerName: matchedAnchor.name || candidate.speakerName || 'Traveler',
    speakerRole: matchedAnchor.role || candidate.speakerRole || '',
    text: candidate.text,
    anchor: matchedAnchor,
    isExplicitEditorOverride
  };
}

function drawCanvasSpeechIndicator(ctx, anchor, animTick = 0) {
  const bob = animTick % 2;
  const cx = Math.round(anchor.headX);
  const cy = Math.max(3, Math.round(anchor.headY - 3 - bob));

  // Tiny 8-bit speech pointer tick above the speaking character's head
  ctx.fillStyle = '#041208';
  ctx.fillRect(cx - 2, cy - 2, 5, 3);
  ctx.fillStyle = '#00ff66';
  ctx.fillRect(cx - 1, cy - 1, 3, 1);
  ctx.fillRect(cx, cy, 1, 1);
}

function syncCanvasSpeechBubble(canvas, resolvedBubble, width, height) {
  const container = canvas?.parentElement;
  if (!container || typeof container.querySelector !== 'function' || typeof document === 'undefined') {
    return;
  }
  if (canvas.id === 'creator-landscape-canvas') {
    const existing = container.querySelector('[data-character-speech-bubble]');
    if (existing) existing.hidden = true;
    return;
  }

  let bubbleEl = container.querySelector('[data-character-speech-bubble]');
  if (!resolvedBubble || !resolvedBubble.anchor || !resolvedBubble.text) {
    if (bubbleEl) {
      bubbleEl.hidden = true;
    }
    if (canvas.__speechHideTimer) {
      clearTimeout(canvas.__speechHideTimer);
      canvas.__speechHideTimer = null;
    }
    return;
  }

  if (!bubbleEl) {
    bubbleEl = document.createElement('div');
    bubbleEl.className = 'character-speech-anchor';
    bubbleEl.setAttribute('data-character-speech-bubble', 'true');
    bubbleEl.setAttribute('aria-live', 'polite');
    bubbleEl.innerHTML = `
      <div class="character-speech-box">
        <span class="character-speech-speaker" data-speech-speaker></span>
        <span class="character-speech-text" data-speech-text></span>
      </div>
      <span class="character-speech-tail" aria-hidden="true"></span>
    `;
    container.appendChild(bubbleEl);
  }

  const { anchor, speakerName, speakerRole, text, key, isExplicitEditorOverride } = resolvedBubble;
  const xPct = Math.max(6, Math.min(94, (anchor.headX / Math.max(1, width)) * 100));
  const yPct = Math.max(14, Math.min(90, (anchor.headY / Math.max(1, height)) * 100));
  const shiftPct = Math.max(12, Math.min(88, xPct));

  bubbleEl.hidden = false;
  bubbleEl.style.left = `${xPct.toFixed(2)}%`;
  bubbleEl.style.top = `${yPct.toFixed(2)}%`;
  bubbleEl.style.setProperty('--bubble-shift', `-${shiftPct.toFixed(2)}%`);

  const speakerEl = bubbleEl.querySelector('[data-speech-speaker]');
  const textEl = bubbleEl.querySelector('[data-speech-text]');
  const speakerLabel = speakerRole && !speakerName.toLowerCase().includes(speakerRole.toLowerCase())
    ? `${speakerName.toUpperCase()} (${speakerRole.toUpperCase()}):`
    : `${speakerName.toUpperCase()}:`;
  if (speakerEl) {
    speakerEl.textContent = speakerLabel;
  }
  if (textEl) {
    textEl.textContent = `"${text}"`;
  }

  if (!isExplicitEditorOverride && canvas.__lastSpeechKey !== key) {
    canvas.__lastSpeechKey = key;
    if (canvas.__speechHideTimer) {
      clearTimeout(canvas.__speechHideTimer);
    }
    const durationMs = getSpeechBubbleDurationMs(text);
    canvas.__speechHideTimer = setTimeout(() => {
      if (bubbleEl && canvas.__lastSpeechKey === key) {
        bubbleEl.hidden = true;
      }
    }, durationMs + 40);
  }
}

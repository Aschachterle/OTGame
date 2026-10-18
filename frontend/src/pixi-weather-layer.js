import {
  Container,
  Graphics,
  MeshSimple,
  Particle,
  ParticleContainer,
  Rectangle,
  Texture
} from 'pixi.js';
import {
  generateWormholeLayout,
  getAnimatedWormhole
} from './scene-sprites.js?v=pixi_final_1';

const RAIN_COLORS = [0xe6f4fc, 0x96c8eb, 0x68a6d6];
const SNOW_COLORS = [0xffffff, 0xd6ecf7];

function drawLine(graphics, x0, y0, x1, y1, color, alpha = 1, width = 1) {
  graphics
    .moveTo(Math.round(x0), Math.round(y0))
    .lineTo(Math.round(x1), Math.round(y1))
    .stroke({ color, alpha, width });
}

function drawEllipse(graphics, x, y, rx, ry, color, alpha = 1) {
  if (rx <= 0 || ry <= 0) return;
  graphics.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry)).fill({ color, alpha });
}

function drawWireEllipse(graphics, x, y, rx, ry, color, alpha = 1, width = 1) {
  if (rx <= 0 || ry <= 0) return;
  graphics.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry))
    .stroke({ color, alpha, width });
}

function drawPixel(graphics, x, y, color, alpha = 1, width = 1, height = 1) {
  graphics.rect(Math.round(x), Math.round(y), width, height).fill({ color, alpha });
}

function drawWormholePortal(body, glow, portal, tick) {
  const { x, y, rx, ry, apexX, apexY, depth } = portal;
  const isDistant = depth > 0.55;
  const alpha = Math.max(0.3, Math.min(0.9, 1 - depth * 0.55));
  const colors = isDistant
    ? {
        halo: 0x1e3a2c,
        outer: 0x22152e,
        middle: 0x160d20,
        deep: 0x0c0712,
        darkGreen: 0x345e46,
        green: 0x4c8565,
        bright: 0x78b08e,
        core: 0xb8dec6,
        purple: 0x4c3260
      }
    : {
        halo: 0x1a062c,
        outer: 0x180429,
        middle: 0x0d0218,
        deep: 0x030006,
        darkGreen: 0x00963d,
        green: 0x00e65c,
        bright: 0x39ff14,
        core: 0xd4ffe2,
        purple: 0x7b1fa2
      };

  drawEllipse(glow, x, y, rx + 4, ry + 3, colors.halo, alpha * 0.34);
  drawWireEllipse(glow, x, y, rx + 2, ry + 1, colors.bright, alpha * 0.28, 2);

  drawEllipse(body, x + (apexX - x) * 0.15, y + (apexY - y) * 0.15, rx * 0.72, ry * 0.72, colors.deep, alpha);

  const rotation = tick * 0.05;
  const meridianCount = rx >= 10 ? 8 : 6;
  for (let meridian = 0; meridian < meridianCount; meridian += 1) {
    const angle = (meridian / meridianCount) * Math.PI * 2 + rotation;
    let previousX = x + Math.cos(angle) * rx;
    let previousY = y + Math.sin(angle) * ry;
    for (let segment = 1; segment <= 8; segment += 1) {
      const t = segment / 8;
      const taper = Math.pow(1 - t, 1.45);
      const twist = t * 0.45;
      const nextX = x + (apexX - x) * t + Math.cos(angle + twist) * rx * taper;
      const nextY = y + (apexY - y) * t + Math.sin(angle + twist) * ry * taper;
      const color = segment <= 2
        ? colors.green
        : segment <= 5
          ? (meridian % 2 === 0 ? colors.darkGreen : colors.purple)
          : colors.bright;
      drawLine(glow, previousX, previousY, nextX, nextY, color, alpha * 0.3, 3);
      drawLine(glow, previousX, previousY, nextX, nextY, color, alpha, 1);
      previousX = nextX;
      previousY = nextY;
    }
  }

  for (let ring = 0; ring < 4; ring += 1) {
    const t = Math.min(0.95, ring / 4 + ((tick * 0.08) % 0.25));
    const taper = Math.pow(1 - t, 1.45);
    const ringX = x + (apexX - x) * t;
    const ringY = y + (apexY - y) * t;
    const color = t < 0.25
      ? colors.green
      : t < 0.65
        ? (ring % 2 === 0 ? colors.bright : colors.purple)
        : colors.core;
    drawWireEllipse(glow, ringX, ringY, rx * taper, ry * taper, color, alpha, 1);
    drawWireEllipse(glow, ringX, ringY, rx * taper, ry * taper, color, alpha * 0.25, 3);
  }
  drawWireEllipse(glow, x, y, rx, ry, colors.bright, alpha, 1);
  drawWireEllipse(glow, x, y, rx, ry, colors.bright, alpha * 0.22, 3);

  const streamCount = rx >= 10 ? 8 : 6;
  for (let stream = 0; stream < streamCount; stream += 1) {
    const angle = (stream / streamCount) * Math.PI * 2 - rotation * 0.8;
    const progress = (tick * 0.11 + stream / streamCount) % 1;
    let x0;
    let y0;
    let x1;
    let y1;
    let color;
    if (progress < 0.48) {
      const extT = progress / 0.48;
      const distance = 1.65 - extT * 0.65;
      const tailDistance = distance + 0.28;
      const pullX = -(apexX - x) * (1 - extT) * 0.18;
      const pullY = -(apexY - y) * (1 - extT) * 0.18;
      x0 = x + pullX + Math.cos(angle) * rx * tailDistance;
      y0 = y + pullY + Math.sin(angle) * ry * tailDistance;
      x1 = x + Math.cos(angle) * rx * distance;
      y1 = y + Math.sin(angle) * ry * distance;
      color = extT > 0.6 ? colors.core : colors.bright;
    } else {
      const intT = (progress - 0.48) / 0.52;
      const accelT = Math.pow(intT, 1.3);
      const tailT = Math.max(0, accelT - 0.22);
      const taper0 = Math.pow(1 - tailT, 1.45);
      const taper1 = Math.pow(1 - accelT, 1.45);
      x0 = x + (apexX - x) * tailT + Math.cos(angle + tailT * 0.45) * rx * taper0;
      y0 = y + (apexY - y) * tailT + Math.sin(angle + tailT * 0.45) * ry * taper0;
      x1 = x + (apexX - x) * accelT + Math.cos(angle + accelT * 0.45) * rx * taper1;
      y1 = y + (apexY - y) * accelT + Math.sin(angle + accelT * 0.45) * ry * taper1;
      color = accelT > 0.7 ? colors.core : colors.bright;
    }
    drawLine(glow, x0, y0, x1, y1, color, alpha, 1);
  }

  drawPixel(glow, apexX - 1, apexY, colors.bright, alpha, 3, 1);
  drawPixel(glow, apexX, apexY - 1, colors.bright, alpha, 1, 3);
  drawPixel(glow, apexX, apexY, colors.core, alpha);
}

function createPortalMeshData(portals) {
  const ringCount = 12;
  const segmentCount = 16;
  const vertices = [];
  const uvs = [];
  const indices = [];
  let vertexOffset = 0;

  for (const portal of portals) {
    for (let ring = 0; ring < ringCount; ring += 1) {
      const t = ring / (ringCount - 1);
      const taper = Math.pow(1 - t, 1.45);
      const centerX = portal.x + (portal.apexX - portal.x) * t;
      const centerY = portal.y + (portal.apexY - portal.y) * t;
      for (let segment = 0; segment < segmentCount; segment += 1) {
        const angle = (segment / segmentCount) * Math.PI * 2;
        vertices.push(
          centerX + Math.cos(angle) * portal.rx * taper,
          centerY + Math.sin(angle) * portal.ry * taper
        );
        uvs.push(0.5, 0.5);
      }
    }

    for (let ring = 0; ring < ringCount - 1; ring += 1) {
      for (let segment = 0; segment < segmentCount; segment += 1) {
        const nextSegment = (segment + 1) % segmentCount;
        const topLeft = vertexOffset + ring * segmentCount + segment;
        const topRight = vertexOffset + ring * segmentCount + nextSegment;
        const bottomLeft = topLeft + segmentCount;
        const bottomRight = topRight + segmentCount;
        indices.push(topLeft, bottomLeft, topRight, topRight, bottomLeft, bottomRight);
      }
    }
    vertexOffset += ringCount * segmentCount;
  }

  return {
    vertices: new Float32Array(vertices),
    uvs: new Float32Array(uvs),
    indices: new Uint32Array(indices)
  };
}

function updatePortalMesh(parent, currentMesh, portals, texture, insertionIndex, alpha) {
  const data = createPortalMeshData(portals);
  if (!currentMesh || currentMesh.vertices.length !== data.vertices.length) {
    if (currentMesh) {
      parent.removeChild(currentMesh);
      currentMesh.destroy({ texture: false, textureSource: false });
    }
    const mesh = new MeshSimple({
      texture,
      ...data,
      alpha,
      roundPixels: true
    });
    parent.addChildAt(mesh, insertionIndex);
    return mesh;
  }
  currentMesh.vertices = data.vertices;
  return currentMesh;
}

function drawMicroPortals(graphics, layout, tick, scroll, width) {
  const palette = [0x00ff66, 0x52ffa0, 0x9b51e0, 0x39ff14, 0xd4ffe2];
  for (let index = 0; index < layout.microPortals.length; index += 1) {
    const portal = layout.microPortals[index];
    if ((tick + portal.flicker) % 6 >= 5) continue;
    const alpha = Math.max(0.2, Math.min(0.5, 1 - portal.depth * 0.62));
    const centerX = (((portal.baseX + Math.floor(tick * 0.16) - Math.floor(scroll * 0.05)) % width) + width) % width;
    const centerY = portal.baseY + Math.round(Math.sin((tick + portal.flicker) * 0.12) * 1.2);
    const tipX = centerX + portal.tailDx;
    const tipY = centerY + portal.tailDy;
    const color = palette[(index + tick) % palette.length];
    drawLine(graphics, centerX - portal.size, centerY, tipX, tipY, 0x345e46, alpha);
    drawLine(graphics, centerX + portal.size, centerY, tipX, tipY, 0x4c3260, alpha);
    drawEllipse(graphics, centerX, centerY, portal.size, 1, 0x080112, alpha);
    drawWireEllipse(graphics, centerX, centerY, portal.size, 1, color, alpha);
  }
}

function updateWormholes(weatherLayer, state) {
  const {
    width,
    height,
    horizonY,
    pathStartY,
    pathEndY,
    tick,
    scrollOffset,
    weatherSeed
  } = state;
  const layout = generateWormholeLayout(weatherSeed, width, height, horizonY, pathStartY, pathEndY);

  weatherLayer.backgroundWash.clear()
    .rect(0, 0, width, height)
    .fill({ color: 0x0e0318, alpha: 0.42 })
    .rect(0, Math.max(0, horizonY - 8), width, 6)
    .fill({ color: 0x7b1fa2, alpha: 0.18 })
    .rect(0, Math.max(0, horizonY - 2), width, 1)
    .fill({ color: 0x00ff66, alpha: 0.14 });
  weatherLayer.backgroundGlow.clear();
  weatherLayer.backgroundBody.clear();
  weatherLayer.foregroundGlow.clear();
  weatherLayer.foregroundBody.clear();
  drawMicroPortals(weatherLayer.backgroundGlow, layout, tick, scrollOffset, width);
  const backgroundPortals = [];
  const foregroundPortals = [];

  for (const portal of layout.portals) {
    const animated = getAnimatedWormhole(portal, tick, scrollOffset, width);
    if (portal.layer === 'background') {
      backgroundPortals.push(animated);
      drawWormholePortal(weatherLayer.backgroundBody, weatherLayer.backgroundGlow, animated, tick);
    } else {
      foregroundPortals.push(animated);
      drawWormholePortal(weatherLayer.foregroundBody, weatherLayer.foregroundGlow, animated, tick);
    }
  }
  weatherLayer.meshes.background = updatePortalMesh(
    weatherLayer.background,
    weatherLayer.meshes.background,
    backgroundPortals,
    weatherLayer.portalTexture,
    1,
    0.76
  );
  weatherLayer.meshes.foreground = updatePortalMesh(
    weatherLayer.foreground,
    weatherLayer.meshes.foreground,
    foregroundPortals,
    weatherLayer.portalTexture,
    2,
    0.86
  );

  const motePalette = [0x39ff14, 0x00ff66, 0x9b51e0, 0xd4ffe2];
  for (let mote = 0; mote < 12; mote += 1) {
    const cycle = (tick * 2 + mote * 7) % 24;
    const pull = cycle / 23;
    const startX = (mote * 43 + (weatherSeed % 53)) % width;
    const startY = pathEndY - (mote % 6);
    const rawTarget = layout.portals[mote % layout.portals.length];
    const target = getAnimatedWormhole(rawTarget, tick, scrollOffset, width);
    const moteX = Math.round(startX + (target.x - startX) * pull);
    const moteY = Math.round(startY + (target.y - startY) * pull - Math.sin(pull * Math.PI) * 6);
    const alpha = Math.max(0.25, Math.min(0.75, 0.85 - pull * 0.45));
    const color = motePalette[(mote + tick) % motePalette.length];
    if (mote % 3 === 0 && pull < 0.7) {
      drawPixel(weatherLayer.foregroundGlow, moteX, moteY, color, alpha, 2, 1);
      drawPixel(weatherLayer.foregroundGlow, moteX, moteY + 1, color, alpha, 1, 1);
    } else {
      drawPixel(weatherLayer.foregroundGlow, moteX, moteY, color, alpha);
    }
  }
}

function updateRainParticles(particles, state) {
  const { width, height, tick, scrollOffset, pathEndY } = state;
  for (let index = 0; index < 48; index += 1) {
    const particle = particles[index];
    const speed = 5 + (index % 3);
    particle.x = (((index * 19 - tick * 3 - scrollOffset) % width) + width) % width;
    particle.y = (((index * 13 + tick * speed) % (height - 4)) + (height - 4)) % (height - 4);
    particle.scaleX = 1;
    particle.scaleY = index % 3 === 0 ? 4 : 3;
    particle.tint = RAIN_COLORS[index % 4 === 0 ? 0 : index % 2 === 0 ? 1 : 2];
    particle.alpha = 1;
  }

  let splashIndex = 48;
  for (let index = 0; index < 48; index += 1) {
    const particle = particles[index];
    if (particle.y < pathEndY - 3 || particle.y > pathEndY + 4 || index % 3 !== 0) continue;
    const splash = particles[splashIndex];
    splash.x = particle.x - 1;
    splash.y = pathEndY;
    splash.scaleX = 2;
    splash.scaleY = 1;
    splash.tint = 0xffffff;
    splash.alpha = 1;
    splashIndex += 1;
  }
}

function updateSnowParticles(particles, state) {
  const { width, height, tick, scrollOffset } = state;
  for (let index = 0; index < 64; index += 1) {
    const particle = particles[index];
    particle.x = (((index * 19 - tick * (3 + (index % 3)) - scrollOffset) % width) + width) % width;
    particle.y = (((index * 13 + tick * (2 + (index % 2))) % (height - 2)) + (height - 2)) % (height - 2);
    particle.scaleX = index % 5 === 0 ? 2 : 1;
    particle.scaleY = index % 5 === 0 ? 2 : 1;
    particle.tint = SNOW_COLORS[index % 2];
    particle.alpha = 1;
  }

  for (let index = 0; index < 10; index += 1) {
    const centerX = (((index * 37 - tick * 6 - scrollOffset) % (width - 4)) + (width - 4)) % (width - 4) + 2;
    const centerY = (((index * 23 + tick * 4) % (height - 6)) + (height - 6)) % (height - 6) + 2;
    const horizontal = particles[64 + index * 2];
    horizontal.x = centerX - 1;
    horizontal.y = centerY;
    horizontal.scaleX = 3;
    horizontal.scaleY = 1;
    horizontal.tint = 0xffffff;
    horizontal.alpha = 1;
    const vertical = particles[65 + index * 2];
    vertical.x = centerX;
    vertical.y = centerY - 1;
    vertical.scaleX = 1;
    vertical.scaleY = 3;
    vertical.tint = 0xffffff;
    vertical.alpha = 1;
  }
}

function updateSnowGusts(graphics, state) {
  const { tick, scrollOffset } = state;
  graphics.clear();
  for (let gust = 0; gust < 3; gust += 1) {
    const y = 18 + gust * 24 + ((tick + gust * 3) % 5) - 2;
    const x = (((gust * 43 - tick * 11 - scrollOffset) % (state.width + 16)) + (state.width + 16)) % (state.width + 16) - 8;
    drawLine(graphics, x, y, x + 32, y, 0xebf6ff, 0.28);
    drawLine(graphics, x + 6, y + 1, x + 26, y + 1, 0xebf6ff, 0.28);
  }
}

function updateLightning(graphics, state) {
  const { width, tick, horizonY } = state;
  const cycle = tick % 9;
  const mainStrike = cycle === 1 || cycle === 2;
  const secondaryStrike = cycle === 6;
  graphics.clear();
  if (!mainStrike && !secondaryStrike) return;

  graphics.rect(0, 0, width, state.height)
    .fill({ color: 0xb2dce8, alpha: mainStrike ? (cycle === 1 ? 0.12 : 0.07) : 0.045 });
  const boltX = mainStrike
    ? Math.floor(width * (cycle === 1 ? 0.27 : 0.68))
    : Math.floor(width * 0.48);
  const endY = horizonY + 2;
  let x = boltX;
  const points = [[x, 10]];
  for (let y = 11; y <= endY; y += 1) {
    const step = y - 10;
    if (step > 0 && step % 3 === 0) {
      const turn = ((step * 7 + (tick + 3) * 13) % 5) - 2;
      x += turn === 0 ? 1 : turn;
    }
    points.push([x, y]);
  }
  for (let index = 1; index < points.length; index += 1) {
    const [x0, y0] = points[index - 1];
    const [x1, y1] = points[index];
    drawLine(graphics, x0, y0, x1, y1, 0x31a2f2, 0.5, 5);
    drawLine(graphics, x0, y0, x1, y1, 0xb2dce8, 0.95, 2);
    drawLine(graphics, x0, y0, x1, y1, 0xffffff, 1, 1);
  }
  const branchIndex = Math.floor((points.length - 1) * 0.45);
  const [branchX, branchY] = points[branchIndex];
  const direction = (tick + 3) % 2 === 0 ? 1 : -1;
  for (let step = 1; step <= 6; step += 1) {
    drawLine(graphics, branchX, branchY, branchX + direction * step, branchY + step, 0x31a2f2, 0.6, 3);
    drawLine(graphics, branchX, branchY, branchX + direction * step, branchY + step, 0xffffff, 0.95);
  }
}

export function createPixiWeatherLayer(width, height) {
  const pixelCanvas = document.createElement('canvas');
  pixelCanvas.width = 1;
  pixelCanvas.height = 1;
  const pixelContext = pixelCanvas.getContext('2d');
  if (!pixelContext) throw new Error('Could not create the PixiJS weather-particle texture.');
  pixelContext.fillStyle = '#ffffff';
  pixelContext.fillRect(0, 0, 1, 1);
  const particleTexture = Texture.from(pixelCanvas);
  particleTexture.source.scaleMode = 'nearest';
  const portalCanvas = document.createElement('canvas');
  portalCanvas.width = 1;
  portalCanvas.height = 1;
  const portalContext = portalCanvas.getContext('2d');
  if (!portalContext) throw new Error('Could not create the PixiJS wormhole texture.');
  portalContext.fillStyle = '#180429';
  portalContext.fillRect(0, 0, 1, 1);
  const portalTexture = Texture.from(portalCanvas);
  portalTexture.source.scaleMode = 'nearest';

  const particleContainer = new ParticleContainer({
    texture: particleTexture,
    boundsArea: new Rectangle(0, 0, width, height),
    dynamicProperties: { vertex: true, position: true, color: true },
    roundPixels: true
  });
  const particles = Array.from({ length: 84 }, () => new Particle({
    texture: particleTexture,
    alpha: 0
  }));
  particleContainer.particleChildren.push(...particles);

  const background = new Container();
  const backgroundWash = new Graphics();
  const backgroundGlow = new Graphics({ blendMode: 'add' });
  const backgroundBody = new Graphics();
  background.addChild(backgroundWash, backgroundGlow, backgroundBody);

  const foreground = new Container();
  const snowGusts = new Graphics();
  const foregroundGlow = new Graphics({ blendMode: 'add' });
  const foregroundBody = new Graphics();
  const lightning = new Graphics({ blendMode: 'add' });
  foreground.addChild(particleContainer, snowGusts, foregroundGlow, foregroundBody, lightning);
  const graphics = {
    background,
    foreground,
    backgroundWash,
    backgroundGlow,
    backgroundBody,
    foregroundGlow,
    foregroundBody,
    meshes: { background: null, foreground: null },
    portalTexture
  };

  return {
    background,
    foreground,
    particleTexture,
    portalTexture,
    update(state) {
      const overlayId = state?.overlayId ?? 'none';
      const active = Boolean(state && overlayId !== 'none');
      background.visible = active && overlayId === 'wormhole_storm';
      backgroundWash.clear();
      backgroundGlow.clear();
      backgroundBody.clear();
      foregroundGlow.clear();
      foregroundBody.clear();
      lightning.clear();
      snowGusts.clear();

      for (const particle of particles) particle.alpha = 0;
      particleContainer.visible = active && (overlayId === 'rain' || overlayId === 'snow_storm');
      if (overlayId === 'rain') updateRainParticles(particles, state);
      if (overlayId === 'snow_storm') {
        updateSnowParticles(particles, state);
        updateSnowGusts(snowGusts, state);
      }
      particleContainer.update();

      if (overlayId === 'wormhole_storm') updateWormholes(graphics, state);
      if (overlayId === 'thunderstorm') updateLightning(lightning, state);
      foreground.visible = active && ['rain', 'snow_storm', 'thunderstorm', 'wormhole_storm'].includes(overlayId);
    }
  };
}

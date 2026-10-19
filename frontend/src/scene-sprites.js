import {
  NPC_APPEARANCES,
  drawCharacterGridAt,
  getCharacterFrameGrid
} from './character-designer.js?v=sprite32_1';

export function riverBounds(width) {
  const channelWidth = Math.max(1, Math.round(width * 0.6));
  const channelCenter = width * 0.5;
  const start = Math.max(0, Math.min(width - channelWidth, Math.round(channelCenter - channelWidth / 2)));
  return { start, end: start + channelWidth };
}

export const DEFAULT_RIVER_DEPTH_FT = 2.8;
export const DEFAULT_RIVER_FLOW_RATE_CFS = 205;
const RIVER_SUBMERSION_TINT = '#3476b4';

export function getRiverVisualProfile(river) {
  const rawDepthFt = Number(river?.depthFt);
  const rawFlowRate = Number(river?.flowRate);
  const depthFt = Number.isFinite(rawDepthFt) && rawDepthFt > 0
    ? rawDepthFt
    : DEFAULT_RIVER_DEPTH_FT;
  const flowRate = Number.isFinite(rawFlowRate) && rawFlowRate >= 0
    ? rawFlowRate
    : DEFAULT_RIVER_FLOW_RATE_CFS;
  const depthOffsetPx = Math.round((depthFt - DEFAULT_RIVER_DEPTH_FT) * 5);

  return {
    depthFt,
    flowRate,
    depthScale: Math.max(0.6, Math.min(1.8, depthFt / DEFAULT_RIVER_DEPTH_FT)),
    flowScale: Math.max(0.5, Math.min(2, flowRate / DEFAULT_RIVER_FLOW_RATE_CFS)),
    waterlineOffsetPx: Math.max(-8, Math.min(24, depthOffsetPx)),
    isFast: flowRate >= 250
  };
}

// The river meets the hills at the horizon without extending over them.
const RIVER_HILL_MEET_OFFSET = 0;

export function riverBoundsAtY(width, y, horizonY, pathEndY, canvasHeight = 96, landmarkId) {
  const { start, end } = riverBounds(width, landmarkId);
  const channelSpan = end - start;
  const topY = horizonY - RIVER_HILL_MEET_OFFSET;

  if (y <= pathEndY) {
    const depth = Math.max(1, pathEndY - topY);
    const distance = Math.max(0, Math.min(1, (y - topY) / depth));
    // Smooth perspective taper from the distant hills (narrower) to the foreground cut (full width)
    const inset = Math.round(channelSpan * 0.13 * (1 - distance));
    return { start: start + inset, end: end - inset };
  }

  return { start, end };
}

function getRiverDepthProfile(span, y, topY, pathEndY) {
  const riverHeight = Math.max(1, pathEndY - topY);
  const perspectiveProgress = Math.max(0, Math.min(1, (y - topY) / riverHeight));

  // Scale bank shoals proportionally with perspective so they taper toward the hills
  const jitter = ((y * 5) % 3) - 1;
  const shallowInset = Math.max(2, Math.round(span * 0.08) + jitter);
  const midInset = Math.max(5, Math.round(span * 0.20) + jitter);

  // Gradual surface depth shading from distant reflection to deeper foreground
  const mainChannelColor = perspectiveProgress >= 0.78
    ? '#1e4e7c'
    : perspectiveProgress >= 0.42
      ? '#245b8a'
      : '#3476b4';

  return { shallowInset, midInset, mainChannelColor };
}

function getRiverCrossSectionBottomY(x, bounds, waterTopY, canvasHeight, depthScale) {
  const span = Math.max(1, bounds.end - bounds.start);
  const halfSpan = Math.max(1, (span - 1) / 2);
  const centerX = (bounds.start + bounds.end - 1) / 2;
  const lateralProgress = Math.min(1, Math.abs(x - centerX) / halfSpan);

  // Smooth natural riverbed curve (gentle bank slopes into a flat-ish central channel)
  const curve = Math.cos(lateralProgress * (Math.PI / 2));
  const depthRatio = Math.pow(curve, 0.75 / depthScale);
  const availableDepth = Math.max(1, canvasHeight - waterTopY - 2);
  const cupDepth = 1 + Math.round(availableDepth * depthRatio);

  return Math.min(canvasHeight - 1, waterTopY + cupDepth);
}

function getRiverCrossSectionWaterColor(y, waterTopY, bottomY) {
  if (y === waterTopY) return '#245b8a';
  const depthProgress = (y - waterTopY) / Math.max(1, bottomY - waterTopY);
  if (depthProgress >= 0.82) return '#0d2642'; // deepest trench bed shadow
  if (depthProgress >= 0.62) return '#14385c';
  if (depthProgress >= 0.35) return '#194672';
  return '#1e5485';
}

function getRiverCrossSectionSoilColor(x, y, topSoilY) {
  const depth = y - topSoilY;
  // Crisp dark earth rim along the top of the cutaway and riverbed boundary
  if (depth === 0) return '#442434';
  if (depth === 1 && (x + y) % 3 === 0) return '#b86f50';
  if ((x * 7 + y * 11) % 17 < 3) return '#743f39';
  if ((x * 13 + y * 5) % 23 === 0) return '#8f563b';
  return '#663931';
}

export function drawRiverForegroundSoil(ctx, width, pathEndY, canvasHeight = 96, landmarkId) {
  const { start, end } = riverBounds(width, landmarkId);
  for (let y = pathEndY; y < canvasHeight; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (x >= start && x < end) continue;
      ctx.fillStyle = getRiverCrossSectionSoilColor(x, y, pathEndY);
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

function paintSurfaceWaterRow(ctx, width, y, topY, pathEndY, canvasHeight, landmarkId) {
  const bounds = riverBoundsAtY(width, y, topY + RIVER_HILL_MEET_OFFSET, pathEndY, canvasHeight, landmarkId);
  const span = Math.max(1, bounds.end - bounds.start);
  const riverHeight = Math.max(1, pathEndY - topY);
  const perspectiveProgress = Math.max(0, Math.min(1, (y - topY) / riverHeight));

  // Shoreline wet sand & soil on both banks outside water
  ctx.fillStyle = '#e4a672';
  ctx.fillRect(Math.max(0, bounds.start - 3), y, 2, 1);
  ctx.fillRect(Math.min(width - 2, bounds.end + 1), y, 2, 1);
  ctx.fillStyle = '#f6d6bd';
  ctx.fillRect(Math.max(0, bounds.start - 1), y, 1, 1);
  ctx.fillRect(Math.min(width - 1, bounds.end), y, 1, 1);

  // Progressive depth columns from banks toward the center:
  // Column 1: Crystal light aqua / pale blue across the entire water channel
  ctx.fillStyle = '#7ad8ff';
  ctx.fillRect(bounds.start, y, span, 1);

  // Insets for deeper columns (scaling with perspective span)
  const jitter = ((y * 7) % 3) - 1;
  const inset1 = Math.max(2, Math.round(span * 0.07) + jitter);
  const inset2 = Math.max(5, Math.round(span * 0.16) + jitter);
  const inset3 = Math.max(8, Math.round(span * 0.26) + jitter);
  const inset4 = Math.max(12, Math.round(span * 0.37) + jitter);
  const inset5 = Math.max(16, Math.round(span * 0.47) + jitter);

  // Column 2: Light sky blue shoal shelf
  if (span > inset1 * 2) {
    ctx.fillStyle = '#31a2f2';
    ctx.fillRect(bounds.start + inset1, y, span - inset1 * 2, 1);
  }

  // Column 3: Vibrant river blue
  if (span > inset2 * 2) {
    ctx.fillStyle = '#0098dc';
    ctx.fillRect(bounds.start + inset2, y, span - inset2 * 2, 1);
  }

  // Column 4: Transitional cerulean blue
  if (span > inset3 * 2) {
    ctx.fillStyle = '#1778b8';
    ctx.fillRect(bounds.start + inset3, y, span - inset3 * 2, 1);
  }

  // Column 5: Deep channel blue (deepens with perspective distance)
  if (span > inset4 * 2) {
    ctx.fillStyle = perspectiveProgress >= 0.5 ? '#1b5585' : '#226094';
    ctx.fillRect(bounds.start + inset4, y, span - inset4 * 2, 1);
  }

  // Column 6: Central deepest channel trench
  if (span > inset5 * 2) {
    ctx.fillStyle = perspectiveProgress >= 0.7 ? '#11365a' : '#16436e';
    ctx.fillRect(bounds.start + inset5, y, span - inset5 * 2, 1);
  }

  // Tiny angled white ripple column on the sides right at the water's edge
  // (1px near hills, 2px near foreground, with subtle natural ripple variation)
  const rippleWidth = perspectiveProgress >= 0.65 ? 2 : 1;
  const rippleGlint = ((y * 3 + bounds.start) % 4 === 0) ? '#e6f4fc' : '#ffffff';
  ctx.fillStyle = rippleGlint;
  ctx.fillRect(bounds.start, y, rippleWidth, 1);
  ctx.fillRect(bounds.end - rippleWidth, y, rippleWidth, 1);

  return bounds;
}

export function drawRiverChannelRow(
  ctx,
  width,
  y,
  horizonY,
  pathStartY,
  pathEndY,
  canvasHeight = 96,
  depthScale = 1,
  waterlineOffsetPx = 0,
  landmarkId
) {
  const topY = horizonY - RIVER_HILL_MEET_OFFSET;

  // Backfill the river to the hills before the first visible channel row.
  if (y === horizonY + 2) {
    for (let upperY = topY; upperY < horizonY + 2; upperY += 1) {
      paintSurfaceWaterRow(ctx, width, upperY, topY, pathEndY, canvasHeight, landmarkId);
    }
  }

  const sectionTopY = pathEndY - waterlineOffsetPx;
  if (y >= sectionTopY) {
    const sectionBounds = riverBounds(width, landmarkId);
    const rowBounds = y < pathEndY
      ? riverBoundsAtY(width, y, horizonY, pathEndY, canvasHeight, landmarkId)
      : sectionBounds;
    for (let x = 0; x < width; x += 1) {
      const inSection = x >= sectionBounds.start && x < sectionBounds.end;
      const inVisibleChannel = x >= rowBounds.start && x < rowBounds.end;
      if (y >= pathEndY && !inSection) {
        ctx.fillStyle = getRiverCrossSectionSoilColor(x, y, sectionTopY);
        ctx.fillRect(x, y, 1, 1);
      } else if (inSection && inVisibleChannel) {
        const waterBottomY = getRiverCrossSectionBottomY(
          x,
          sectionBounds,
          sectionTopY,
          canvasHeight,
          depthScale
        );
        if (y <= waterBottomY) {
          ctx.fillStyle = getRiverCrossSectionWaterColor(y, sectionTopY, waterBottomY);
          ctx.fillRect(x, y, 1, 1);
          // Subtle underwater perspective caustics / light ray beams
          if ((x * 5 + y * 11) % 43 === 0 && y > sectionTopY + 1) {
            ctx.fillStyle = 'rgba(190, 230, 255, 0.12)';
            ctx.fillRect(x, y, 1, 1);
          }
        } else {
          ctx.fillStyle = getRiverCrossSectionSoilColor(x, y, waterBottomY + 1);
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    return sectionBounds;
  }

  return paintSurfaceWaterRow(ctx, width, y, topY, pathEndY, canvasHeight, landmarkId);
}

export function getRiverWaterlineSurfaceYByX(
  width,
  footY,
  horizonY,
  pathEndY,
  river,
  landmarkId,
  waterlineOffsetPx = 0,
  canvasHeight = 96
) {
  const { start, end } = riverBounds(width, landmarkId);
  const riverProfile = getRiverVisualProfile(river);
  const effectiveWaterlineOffsetPx = Number.isFinite(waterlineOffsetPx)
    ? waterlineOffsetPx
    : riverProfile.waterlineOffsetPx;
  const sceneHorizonY = horizonY ?? Math.max(12, footY - 20);
  const scenePathEndY = pathEndY ?? footY + 4;
  const surfaceY = footY - 2 - effectiveWaterlineOffsetPx;
  const sectionTopY = scenePathEndY - effectiveWaterlineOffsetPx;
  const sectionBounds = { start, end };
  const surfaceYByX = Array(width).fill(footY);

  for (let x = start; x < end; x += 1) {
    const waterBottomY = getRiverCrossSectionBottomY(
      x,
      sectionBounds,
      sectionTopY,
      canvasHeight,
      riverProfile.depthScale
    );
    for (let y = surfaceY; y <= waterBottomY; y += 1) {
      const bounds = riverBoundsAtY(width, y, sceneHorizonY, scenePathEndY, canvasHeight, landmarkId);
      if (x >= bounds.start && x < bounds.end) {
        surfaceYByX[x] = y;
        break;
      }
    }
  }

  return surfaceYByX;
}

export function drawRiverWaterline(
  ctx,
  width,
  footY,
  animTick,
  horizonY,
  pathEndY,
  river,
  landmarkId,
  waterlineOffsetPx
) {
  const { start, end } = riverBounds(width, landmarkId);
  const riverProfile = getRiverVisualProfile(river);
  const effectiveWaterlineOffsetPx = Number.isFinite(waterlineOffsetPx)
    ? waterlineOffsetPx
    : riverProfile.waterlineOffsetPx;
  const canvasHeight = ctx.canvas?.height ?? 96;
  const sceneHorizonY = horizonY ?? Math.max(12, footY - 20);
  const scenePathEndY = pathEndY ?? footY + 4;
  const surfaceY = footY - 2 - effectiveWaterlineOffsetPx;
  const sectionTopY = scenePathEndY - effectiveWaterlineOffsetPx;
  const sectionBounds = { start, end };
  const surfaceYByX = Array(width);

  // 1. Re-assert opaque riverbed soil over any low-hanging character feet/wheels
  for (let x = start; x < end; x += 1) {
    const waterBottomY = getRiverCrossSectionBottomY(
      x,
      sectionBounds,
      sectionTopY,
      canvasHeight,
      riverProfile.depthScale
    );
    for (let y = waterBottomY + 1; y < canvasHeight; y += 1) {
      ctx.fillStyle = getRiverCrossSectionSoilColor(x, y, waterBottomY + 1);
      ctx.fillRect(x, y, 1, 1);
    }
  }

  // 2. Tint submerged sprites with semi-transparent water from surfaceY down to riverbed
  ctx.save();
  ctx.globalAlpha = 0.38;
  ctx.fillStyle = RIVER_SUBMERSION_TINT;
  for (let x = start; x < end; x += 1) {
    let visibleSurfaceY = null;
    const waterBottomY = getRiverCrossSectionBottomY(
      x,
      sectionBounds,
      sectionTopY,
      canvasHeight,
      riverProfile.depthScale
    );

    for (let y = surfaceY; y <= waterBottomY; y += 1) {
      const bounds = riverBoundsAtY(width, y, sceneHorizonY, scenePathEndY, canvasHeight, landmarkId);
      if (x < bounds.start || x >= bounds.end) continue;
      visibleSurfaceY ??= y;
      ctx.fillRect(x, y, 1, 1);
    }
    surfaceYByX[x] = visibleSurfaceY ?? footY;
  }
  ctx.restore();


  return surfaceYByX;
}




export function drawOxenAndWagonCart(ctx, baseX, groundY, frameIndex = 0, isMoving = false, oxenYokes = 2, options = {}) {
  const x = Math.round(baseX);
  const y = Math.round(groundY);
  const bounce = isMoving && frameIndex % 2 === 1 ? 1 : 0;
  const { suppressGroundShadow = false, floatingHull = false } = options;

  // 1. Soft grounded contact shadow beneath wheels and ox hooves
  if (!suppressGroundShadow) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
    ctx.fillRect(x - 2, y, 70, 2);
  }

  // 2. Prairie Schooner / Conestoga Covered Wagon
  // A. Canvas Bonnet (billowing hoop cover, y - 25 to y - 12)
  const canvasTopY = y - 25 + bounce;
  // Crown highlight along the top ridge
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 5, canvasTopY, 26, 2);
  ctx.fillRect(x + 4, canvasTopY + 2, 28, 2);

  // Main canvas cover (weathered pioneer linen midtone)
  ctx.fillStyle = '#f6d6bd';
  ctx.fillRect(x + 2, canvasTopY + 4, 32, 9);

  // 5 curved wooden bonnet bows / hoop seams
  ctx.fillStyle = '#c2c3c7';
  ctx.fillRect(x + 5, canvasTopY + 1, 1, 12);
  ctx.fillRect(x + 12, canvasTopY + 1, 1, 12);
  ctx.fillRect(x + 19, canvasTopY + 1, 1, 12);
  ctx.fillRect(x + 26, canvasTopY + 1, 1, 12);
  ctx.fillRect(x + 32, canvasTopY + 1, 1, 12);

  // Front puckered hood opening with packed cargo peeking through
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 33, canvasTopY + 2, 2, 11);
  ctx.fillStyle = '#24150e';
  ctx.fillRect(x + 33, canvasTopY + 4, 2, 8);
  ctx.fillStyle = '#8f563b';
  ctx.fillRect(x + 32, canvasTopY + 7, 2, 4);

  // Rear puckered gather & tied drawstring
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 1, canvasTopY + 3, 2, 10);
  ctx.fillStyle = '#362016';
  ctx.fillRect(x + 2, canvasTopY + 5, 1, 7);
  ctx.fillStyle = '#c2c3c7';
  ctx.fillRect(x + 1, canvasTopY + 11, 1, 3); // hanging tied rope end

  // B. Hardwood Wagon Bed & Sideboards (y - 13 to y - 6)
  const bedTopY = y - 13 + bounce;
  ctx.fillStyle = '#8f563b';
  ctx.fillRect(x + 1, bedTopY, 34, 7);
  // Conestoga rocker curve (raised flared ends preventing cargo spill)
  ctx.fillStyle = '#663931';
  ctx.fillRect(x, bedTopY, 2, 6);
  ctx.fillRect(x + 34, bedTopY, 2, 6);
  ctx.fillRect(x + 1, bedTopY + 2, 34, 1);
  ctx.fillRect(x + 1, bedTopY + 5, 34, 1);
  ctx.fillStyle = '#e4a672';
  ctx.fillRect(x + 3, bedTopY + 1, 30, 1); // top rail timber highlight

  // Iron bolster stakes
  ctx.fillStyle = '#362016';
  ctx.fillRect(x + 3, bedTopY, 1, 7);
  ctx.fillRect(x + 12, bedTopY, 1, 7);
  ctx.fillRect(x + 22, bedTopY, 1, 7);
  ctx.fillRect(x + 33, bedTopY, 1, 7);

  // Mounted side jockey / tool box
  ctx.fillStyle = '#442434';
  ctx.fillRect(x + 14, bedTopY + 2, 7, 4);
  ctx.fillStyle = '#f7e26b';
  ctx.fillRect(x + 17, bedTopY + 3, 1, 1); // brass lock latch

  // Driver footrest board
  ctx.fillStyle = '#663931';
  ctx.fillRect(x + 35, bedTopY + 3, 3, 2);

  // Slung axle tar bucket
  ctx.fillStyle = '#24150e';
  ctx.fillRect(x + 4, y - 5, 2, 3);

  // C. Heavy Wooden Spoked Wheels (Large rear wheel & nimble front wheel)
  const drawDetailedWheel = (wx, wy, radius, isFront) => {
    // Heavy iron tire rim
    ctx.fillStyle = '#24150e';
    ctx.fillRect(wx - radius, wy - 1, radius * 2 + 1, 3);
    ctx.fillRect(wx - 1, wy - radius, 3, radius * 2 + 1);
    ctx.fillRect(wx - radius + 1, wy - radius + 1, radius * 2 - 1, radius * 2 - 1);
    // Wooden felloe ring
    ctx.fillStyle = '#8f563b';
    ctx.fillRect(wx - radius + 2, wy - radius + 2, radius * 2 - 3, radius * 2 - 3);
    // Inner hub cutouts
    ctx.fillStyle = '#b86f50';
    ctx.fillRect(wx - radius + 3, wy - radius + 3, radius * 2 - 5, radius * 2 - 5);

    // Rotating spokes
    ctx.fillStyle = '#f7e26b';
    const phase = ((frameIndex % 4) + (isFront ? 1 : 0)) % 4;
    if (!isMoving || phase === 0) {
      ctx.fillRect(wx, wy - radius + 1, 1, radius * 2 - 1);
      ctx.fillRect(wx - radius + 1, wy, radius * 2 - 1, 1);
    } else if (phase === 1) {
      ctx.fillRect(wx - 2, wy - 2, 1, 1);
      ctx.fillRect(wx + 2, wy + 2, 1, 1);
      ctx.fillRect(wx + 2, wy - 2, 1, 1);
      ctx.fillRect(wx - 2, wy + 2, 1, 1);
    } else if (phase === 2) {
      ctx.fillRect(wx - 1, wy - radius + 1, 2, radius * 2 - 1);
      ctx.fillRect(wx - radius + 1, wy - 1, radius * 2 - 1, 2);
    } else {
      ctx.fillRect(wx - 3, wy - 1, 1, 1);
      ctx.fillRect(wx + 3, wy + 1, 1, 1);
      ctx.fillRect(wx + 1, wy - 3, 1, 1);
      ctx.fillRect(wx - 1, wy + 3, 1, 1);
    }

    // Heavy iron axle hub with brass linchpin
    ctx.fillStyle = '#362016';
    ctx.fillRect(wx - 1, wy - 1, 3, 3);
    ctx.fillStyle = '#f7e26b';
    ctx.fillRect(wx, wy, 1, 1);
  };

  // Rear large wheel (radius 5, center x+8, y-5)
  drawDetailedWheel(x + 8, y - 5, 5, false);
  // Front wheel (radius 4, center x+28, y-4)
  drawDetailedWheel(x + 28, y - 4, 4, true);

  // Caulked floating hull for river crossings
  if (floatingHull) {
    ctx.fillStyle = '#b2dce8';
    ctx.fillRect(x - 1, y - 3, 36, 1);
    ctx.fillStyle = '#ffffff';
    for (let rx = 0; rx < 32; rx += 6) {
      ctx.fillRect(x + 1 + rx + (frameIndex % 2), y - 2, 3, 1);
    }
  }

  // D. Sturdy Wooden Tongue Pole
  ctx.fillStyle = '#663931';
  ctx.fillRect(x + 32, y - 6 + bounce, 16, 2);
  ctx.fillStyle = '#8f563b';
  ctx.fillRect(x + 33, y - 6 + bounce, 14, 1);

  // 3. Draft Oxen Team (Enlarged, muscular, and anatomically detailed)
  const oxX = x + 40;
  const steerY = y + bounce;

  const drawSingleSteer = (oxOriginX, isRear = false) => {
    const colBody = isRear ? '#5a3422' : '#8f563b';
    const colHighlight = isRear ? '#7a4a32' : '#b86f50';
    const colShadow = isRear ? '#3a2016' : '#663931';
    const colDark = isRear ? '#24150e' : '#362016';
    const colPitch = '#140c1c';

    const steerBaseY = steerY + (isRear ? -1 : 0);
    const headBob = isMoving ? ((frameIndex + (isRear ? 1 : 0)) % 2 === 0 ? 0 : 1) : 0;
    const f = isMoving ? (frameIndex + (isRear ? 2 : 0)) % 4 : 0;

    // 4-phase walking gait stride offsets
    const fStrideA = !isMoving ? 0 : (f === 0 ? 2 : f === 1 ? 0 : f === 2 ? -2 : -1);
    const fStrideB = !isMoving ? 0 : (f === 2 ? 2 : f === 3 ? 0 : f === 0 ? -2 : -1);
    const rStrideA = !isMoving ? 0 : (f === 2 ? -2 : f === 3 ? -1 : f === 0 ? 2 : 0);
    const rStrideB = !isMoving ? 0 : (f === 0 ? -2 : f === 1 ? -1 : f === 2 ? 2 : 0);

    // Far legs & hooves (in shadow)
    ctx.fillStyle = colDark;
    ctx.fillRect(oxOriginX + 4 + rStrideB, steerBaseY - 7, 3, 4);
    ctx.fillRect(oxOriginX + 5 + rStrideB, steerBaseY - 3, 2, 2);
    ctx.fillStyle = colPitch;
    ctx.fillRect(oxOriginX + 5 + rStrideB, steerBaseY - 1, 3, 1); // cloven hoof

    ctx.fillStyle = colDark;
    ctx.fillRect(oxOriginX + 17 + fStrideB, steerBaseY - 7, 3, 4);
    ctx.fillRect(oxOriginX + 18 + fStrideB, steerBaseY - 3, 2, 2);
    ctx.fillStyle = colPitch;
    ctx.fillRect(oxOriginX + 18 + fStrideB, steerBaseY - 1, 3, 1);

    // Tail curving off rump with bushy dark hair switch
    const tailSwing = isMoving ? (f === 0 || f === 1 ? -1 : 1) : 0;
    ctx.fillStyle = colShadow;
    ctx.fillRect(oxOriginX + tailSwing, steerBaseY - 13, 1, 5);
    ctx.fillStyle = colPitch;
    ctx.fillRect(oxOriginX - 1 + tailSwing, steerBaseY - 8, 2, 3);

    // Muscular barrel chest, flank, and rump
    ctx.fillStyle = colShadow;
    ctx.fillRect(oxOriginX + 2, steerBaseY - 8, 19, 2); // underbelly contour
    ctx.fillStyle = colBody;
    ctx.fillRect(oxOriginX + 2, steerBaseY - 14, 19, 7); // main barrel
    ctx.fillStyle = colHighlight;
    ctx.fillRect(oxOriginX + 3, steerBaseY - 15, 17, 2); // dorsal backline
    ctx.fillRect(oxOriginX + 5, steerBaseY - 13, 12, 2); // flank sunlit sheen
    ctx.fillRect(oxOriginX + 1, steerBaseY - 14, 3, 5); // rump curve

    // Prominent withers hump (shoulder power crest)
    ctx.fillStyle = colBody;
    ctx.fillRect(oxOriginX + 13, steerBaseY - 17, 6, 3);
    ctx.fillStyle = colHighlight;
    ctx.fillRect(oxOriginX + 14, steerBaseY - 18, 4, 2);
    ctx.fillStyle = '#e4a672';
    ctx.fillRect(oxOriginX + 15, steerBaseY - 18, 2, 1); // withers peak highlight

    // Heavy neck & hanging throat dewlap
    ctx.fillStyle = colBody;
    ctx.fillRect(oxOriginX + 17, steerBaseY - 15, 6, 7);
    ctx.fillStyle = colShadow;
    ctx.fillRect(oxOriginX + 19, steerBaseY - 8, 4, 2);
    ctx.fillRect(oxOriginX + 20, steerBaseY - 7, 3, 1); // pendulous dewlap brisket

    // Bovine head with cranial ridge, eye, muzzle, and ear
    const headX = oxOriginX + 20;
    const headY = steerBaseY - 14 + headBob;
    ctx.fillStyle = colBody;
    ctx.fillRect(headX, headY, 7, 6);
    ctx.fillStyle = colHighlight;
    ctx.fillRect(headX + 1, headY - 1, 5, 2);

    // Soft cream muzzle patch with nostrils and lower jaw
    ctx.fillStyle = isRear ? '#8f563b' : '#e4a672';
    ctx.fillRect(headX + 5, headY + 3, 3, 3);
    ctx.fillStyle = '#f6d6bd';
    ctx.fillRect(headX + 6, headY + 3, 2, 2);
    ctx.fillStyle = colPitch;
    ctx.fillRect(headX + 7, headY + 4, 1, 1); // nostril
    ctx.fillStyle = colShadow;
    ctx.fillRect(headX + 4, headY + 5, 3, 1); // lower jaw

    // Expressive bovine eye with white specular glint
    ctx.fillStyle = '#0a0808';
    ctx.fillRect(headX + 3, headY + 1, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(headX + 3, headY + 1, 1, 1);

    // Steer ear angled back below horn
    ctx.fillStyle = colShadow;
    ctx.fillRect(headX - 1, headY + 2, 2, 3);
    ctx.fillStyle = '#f6d6bd';
    ctx.fillRect(headX - 1, headY + 3, 1, 1);

    // Sweeping curved horns (ivory body with sharp dark tips)
    ctx.fillStyle = isRear ? '#c2c3c7' : '#e4a672';
    ctx.fillRect(headX + 1, headY - 2, 2, 1); // horn socket
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(headX + 2, headY - 4, 2, 2);
    ctx.fillRect(headX + 3, headY - 5, 2, 2);
    ctx.fillRect(headX + 5, headY - 6, 2, 2);
    ctx.fillStyle = colDark;
    ctx.fillRect(headX + 7, headY - 6, 1, 1); // pointed horn tip

    // Near legs & cloven hooves
    // Near rear leg (stifle, hock, shank, hoof)
    ctx.fillStyle = colHighlight;
    ctx.fillRect(oxOriginX + 2 + rStrideA, steerBaseY - 7, 4, 3);
    ctx.fillStyle = colBody;
    ctx.fillRect(oxOriginX + 3 + rStrideA, steerBaseY - 4, 3, 2);
    ctx.fillRect(oxOriginX + 3 + rStrideA, steerBaseY - 2, 2, 2);
    ctx.fillStyle = colPitch;
    ctx.fillRect(oxOriginX + 2 + rStrideA, steerBaseY - 1, 3, 1);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(oxOriginX + 4 + rStrideA, steerBaseY - 1, 1, 1); // hoof notch glint

    // Near front leg (shoulder, knee, cannon, hoof)
    ctx.fillStyle = colHighlight;
    ctx.fillRect(oxOriginX + 15 + fStrideA, steerBaseY - 7, 4, 3);
    ctx.fillStyle = colBody;
    ctx.fillRect(oxOriginX + 16 + fStrideA, steerBaseY - 4, 3, 2);
    ctx.fillRect(oxOriginX + 16 + fStrideA, steerBaseY - 2, 2, 2);
    ctx.fillStyle = colPitch;
    ctx.fillRect(oxOriginX + 16 + fStrideA, steerBaseY - 1, 3, 1);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(oxOriginX + 18 + fStrideA, steerBaseY - 1, 1, 1);
  };

  // Draw off-side steer first in shadow if team has 2+ yokes
  if (oxenYokes >= 2) {
    drawSingleSteer(oxX + 3, true);
  }

  // Draw near-side lead steer
  drawSingleSteer(oxX, false);

  // 4. Carved Hardwood Yoke & Oxbow Rigging
  ctx.fillStyle = '#523321';
  ctx.fillRect(oxX + 11, y - 18 + bounce, 7, 2);
  ctx.fillStyle = '#8f563b';
  ctx.fillRect(oxX + 12, y - 18 + bounce, 5, 1);
  // Curved U-shaped oxbow under the neck with brass pins
  ctx.fillStyle = '#f3a833';
  ctx.fillRect(oxX + 12, y - 16 + bounce, 2, 8);
  ctx.fillRect(oxX + 13, y - 9 + bounce, 3, 2);
  // Iron hitch ring connecting tongue pole
  ctx.fillStyle = '#2e2624';
  ctx.fillRect(oxX + 10, y - 8 + bounce, 2, 3);
  ctx.fillStyle = '#c2c3c7';
  ctx.fillRect(oxX + 11, y - 7 + bounce, 1, 1);
}


export function drawFerryPlatform(ctx, canvasWidth, raftX, groundY, frameIndex, isMovingAcross = false) {
  const platformWidth = 72;
  const x = Math.max(0, Math.min(canvasWidth - platformWidth, Math.round(raftX)));
  const y = Math.round(groundY - 4);
  const bob = frameIndex % 2;

  // Subtle dark water shadow beneath the timber raft
  ctx.fillStyle = 'rgba(10, 28, 54, 0.55)';
  ctx.fillRect(x + 2, y + 5 + bob, platformWidth - 4, 2);

  // Upper deck rail lip & corner bollards
  ctx.fillStyle = '#442434';
  ctx.fillRect(x, y + bob, platformWidth, 2);
  ctx.fillRect(x + 1, y - 3 + bob, 2, 3);
  ctx.fillRect(x + platformWidth - 3, y - 3 + bob, 2, 3);

  // Timber pontoon logs & plank highlights
  ctx.fillStyle = '#8f563b';
  ctx.fillRect(x + 1, y + 2 + bob, platformWidth - 2, 3);
  ctx.fillStyle = '#663931';
  ctx.fillRect(x + 2, y + 4 + bob, platformWidth - 4, 1);
  ctx.fillStyle = '#e4a672';
  for (let plank = 0; plank < 6; plank += 1) {
    ctx.fillRect(x + 4 + plank * 11, y + 2 + bob, 7, 1);
  }

  // Gentle bow & stern wake ripples while ferrying across
  if (isMovingAcross) {
    ctx.fillStyle = '#b2dce8';
    ctx.fillRect(Math.max(0, x - 3), y + 4 + bob, 3, 1);
    ctx.fillRect(Math.min(canvasWidth - 4, x + platformWidth), y + 3 + bob, 4, 1);
  }
}

export function drawFerryOperator(ctx, width, raftX, groundY, frameIndex) {
  // Rendered with the 32x32 CharacterDesigner engine at the bow of the 72px raft (raftX + 54..69), clear of the oxen
  const drawX = Math.min(width - 25, Math.round(raftX + 46));
  const footY = Math.round(groundY - 4 + (frameIndex % 2));
  const drawY = footY - 30;

  const operatorGrid = getCharacterFrameGrid(
    NPC_APPEARANCES.ferryOperator,
    'side_right',
    'idle',
    frameIndex % 2
  );
  drawCharacterGridAt(ctx, operatorGrid, drawX, drawY, 1);

  // Ferryman's long ash setting pole held in front, angling down into the river channel
  const poleX = drawX + 18;
  const poleY = drawY + 15;
  for (let segment = 0; segment < 11; segment += 1) {
    const px = poleX + Math.floor(segment * 0.7);
    const py = poleY + segment * 2;
    ctx.fillStyle = segment >= 9 ? '#c2c3c7' : '#e4a672';
    ctx.fillRect(px, py, 1, 2);
  }
}

function drawSubmergedHumanSkeleton(ctx, itemX, itemY) {
  // Soft organic contact shadows ONLY directly beneath ground-touching parts (no box)
  ctx.fillStyle = 'rgba(6, 16, 28, 0.45)';
  ctx.fillRect(itemX - 24, itemY - 5, 5, 1); // under hat brim
  ctx.fillRect(itemX - 18, itemY - 1, 5, 1); // under jaw / skull base
  ctx.fillRect(itemX - 9, itemY - 2, 10, 1); // under thoracic spine & ribcage base
  ctx.fillRect(itemX + 4, itemY - 1, 5, 1);  // under pelvis
  ctx.fillRect(itemX + 10, itemY - 1, 8, 1); // under extended leg
  ctx.fillRect(itemX + 19, itemY, 6, 1);     // under boot heel & sole

  // Natural river pebbles & fine silt mounds scattered along riverbed floor
  ctx.fillStyle = '#5c3828';
  ctx.fillRect(itemX - 23, itemY + 1, 3, 1);
  ctx.fillRect(itemX - 11, itemY + 1, 2, 1);
  ctx.fillRect(itemX + 8, itemY + 1, 3, 1);
  ctx.fillRect(itemX + 21, itemY + 1, 2, 1);
  ctx.fillStyle = '#7a4d36';
  ctx.fillRect(itemX - 13, itemY + 1, 1, 1);
  ctx.fillRect(itemX + 12, itemY + 1, 1, 1);

  // --- CONTRAST PALETTE (Specially tuned to pierce 0.38 blue water submersion) ---
  const colPitch = '#02060c';                     // Pitch dark cavities / eye orbits / oral void
  const colThoraxVoid = 'rgba(4, 12, 24, 0.90)';  // Inner ribcage cavity shadow
  const colShade = 'rgba(142, 174, 192, 0.80)';   // Underside bone shade
  const colBase = 'rgba(197, 220, 232, 0.92)';    // Solid aged bone midtone
  const colHi = 'rgba(245, 250, 254, 0.98)';      // High-contrast bone ivory highlight
  const colSpec = '#ffffff';                      // Specular vertex / teeth / patella glint

  // --- 1. WATERLOGGED PIONEER SLOUCH HAT (Resting in silt behind head) ---
  ctx.fillStyle = '#2b1d14'; // Dark wet felt brim
  ctx.fillRect(itemX - 24, itemY - 6, 7, 2);
  ctx.fillStyle = '#422d1f'; // Crown
  ctx.fillRect(itemX - 23, itemY - 9, 4, 3);
  ctx.fillStyle = '#5a3d2a'; // Crown highlight
  ctx.fillRect(itemX - 22, itemY - 9, 2, 1);
  ctx.fillStyle = '#1d130d'; // Hatband
  ctx.fillRect(itemX - 23, itemY - 7, 4, 1);

  // --- 2. THE HUMAN SKULL (3/4 Tilted View with Dual Eye Orbits) ---
  // Cranial dome base
  ctx.fillStyle = colShade;
  ctx.fillRect(itemX - 19, itemY - 9, 7, 6);
  ctx.fillStyle = colBase;
  ctx.fillRect(itemX - 18, itemY - 10, 5, 7);
  // Cranial dome highlight curve
  ctx.fillStyle = colHi;
  ctx.fillRect(itemX - 17, itemY - 10, 3, 2);
  ctx.fillRect(itemX - 18, itemY - 9, 2, 1);
  ctx.fillStyle = colSpec;
  ctx.fillRect(itemX - 16, itemY - 10, 1, 1);

  // Supraorbital brow ridge
  ctx.fillStyle = colHi;
  ctx.fillRect(itemX - 18, itemY - 8, 6, 1);

  // DUAL EYE SOCKETS (Iconic 2x2 pitch hollows separated by nasal septum bridge)
  ctx.fillStyle = colPitch;
  ctx.fillRect(itemX - 18, itemY - 7, 2, 2); // Left eye orbit
  ctx.fillRect(itemX - 15, itemY - 7, 2, 2); // Right eye orbit

  // Interorbital nasal bridge & zygomatic cheekbones
  ctx.fillStyle = colBase;
  ctx.fillRect(itemX - 16, itemY - 7, 1, 2); // Nasal septum between orbits
  ctx.fillStyle = colHi;
  ctx.fillRect(itemX - 19, itemY - 6, 1, 2); // Left cheekbone arch
  ctx.fillRect(itemX - 13, itemY - 6, 1, 2); // Right cheekbone arch

  // Triangular nasal cavity
  ctx.fillStyle = colPitch;
  ctx.fillRect(itemX - 16, itemY - 5, 1, 1);

  // Maxilla (upper jaw) with distinct teeth notches
  ctx.fillStyle = colBase;
  ctx.fillRect(itemX - 17, itemY - 4, 4, 1);
  ctx.fillStyle = colSpec;
  ctx.fillRect(itemX - 17, itemY - 4, 1, 1); // Tooth notch 1
  ctx.fillRect(itemX - 15, itemY - 4, 1, 1); // Tooth notch 2
  ctx.fillRect(itemX - 14, itemY - 4, 1, 1); // Tooth notch 3

  // Open oral aperture (jaw dropped slightly in death)
  ctx.fillStyle = colPitch;
  ctx.fillRect(itemX - 17, itemY - 3, 4, 1);

  // Mandible (lower jawbone & chin prominence)
  ctx.fillStyle = colShade;
  ctx.fillRect(itemX - 18, itemY - 2, 5, 1);
  ctx.fillStyle = colBase;
  ctx.fillRect(itemX - 16, itemY - 2, 2, 1); // Chin prominence

  // --- 3. CERVICAL SPINE & CLAVICLES ---
  ctx.fillStyle = colBase;
  ctx.fillRect(itemX - 12, itemY - 4, 2, 2); // Cervical vertebrae discs
  // Clavicle flaring out to shoulder
  ctx.fillStyle = colHi;
  ctx.fillRect(itemX - 11, itemY - 6, 3, 1); // Collarbone angling up to left shoulder

  // --- 4. THORAX / CURVED HUMAN RIBCAGE ---
  // Deep thoracic hollow showing through ribs
  ctx.fillStyle = colThoraxVoid;
  ctx.fillRect(itemX - 9, itemY - 7, 13, 5);

  // Thoracic spine & sternum midline
  ctx.fillStyle = colShade;
  ctx.fillRect(itemX - 10, itemY - 3, 13, 1);
  ctx.fillStyle = colBase;
  ctx.fillRect(itemX - 9, itemY - 4, 12, 1);

  // True arching ribs (curved barrel shape, not vertical sticks)
  // Rib 1 (Upper chest)
  ctx.fillStyle = colBase;
  ctx.fillRect(itemX - 8, itemY - 6, 1, 3);
  ctx.fillStyle = colHi;
  ctx.fillRect(itemX - 8, itemY - 6, 1, 1);

  // Rib 2
  ctx.fillStyle = colBase;
  ctx.fillRect(itemX - 6, itemY - 7, 1, 4);
  ctx.fillStyle = colHi;
  ctx.fillRect(itemX - 6, itemY - 7, 1, 1);

  // Rib 3 (Thorax apex - widest rib arch)
  ctx.fillStyle = colBase;
  ctx.fillRect(itemX - 3, itemY - 8, 1, 5);
  ctx.fillStyle = colHi;
  ctx.fillRect(itemX - 3, itemY - 8, 1, 1);
  ctx.fillStyle = colSpec;
  ctx.fillRect(itemX - 3, itemY - 8, 1, 1);

  // Rib 4
  ctx.fillStyle = colBase;
  ctx.fillRect(itemX, itemY - 7, 1, 4);
  ctx.fillStyle = colHi;
  ctx.fillRect(itemX, itemY - 7, 1, 1);

  // Rib 5 (Lower rib margin)
  ctx.fillStyle = colBase;
  ctx.fillRect(itemX + 2, itemY - 6, 1, 3);
  ctx.fillStyle = colHi;
  ctx.fillRect(itemX + 2, itemY - 6, 1, 1);

  // --- 5. ARM BONES & SPLAYED HAND ---
  // Left humerus along flank
  ctx.fillStyle = colShade;
  ctx.fillRect(itemX - 9, itemY - 5, 3, 1);
  // Radius and ulna (forearm)
  ctx.fillStyle = colBase;
  ctx.fillRect(itemX - 6, itemY - 4, 3, 1);
  ctx.fillRect(itemX - 6, itemY - 5, 3, 1);
  // Carpals & delicate phalanges (fingers splayed in sand)
  ctx.fillStyle = colHi;
  ctx.fillRect(itemX - 3, itemY - 3, 2, 1);
  ctx.fillRect(itemX - 1, itemY - 2, 2, 1);
  ctx.fillRect(itemX + 1, itemY - 2, 1, 1);

  // --- 6. PELVIS & PIONEER BELT BUCKLE ---
  // Winged human pelvis (iliac crests)
  ctx.fillStyle = colShade;
  ctx.fillRect(itemX + 4, itemY - 6, 5, 4);
  ctx.fillStyle = colBase;
  ctx.fillRect(itemX + 4, itemY - 6, 5, 2);
  ctx.fillStyle = colHi;
  ctx.fillRect(itemX + 4, itemY - 6, 2, 1); // Left iliac crest
  ctx.fillRect(itemX + 7, itemY - 6, 2, 1); // Right iliac crest
  // Dark pelvic brim / foramen cavity
  ctx.fillStyle = colPitch;
  ctx.fillRect(itemX + 5, itemY - 4, 2, 2);

  // Pioneer brass belt buckle
  ctx.fillStyle = '#7a6624';
  ctx.fillRect(itemX + 5, itemY - 2, 3, 2);
  ctx.fillStyle = '#b89b38';
  ctx.fillRect(itemX + 5, itemY - 2, 1, 2);
  ctx.fillRect(itemX + 7, itemY - 2, 1, 2);
  ctx.fillStyle = '#f7e26b';
  ctx.fillRect(itemX + 6, itemY - 2, 1, 1); // Brass glint

  // --- 7. LEGS: BENT RAISED KNEE vs EXTENDED LEG WITH PIONEER BOOT ---
  // A. Bent Raised Knee (Back leg - creates iconic human corpse silhouette!)
  // Femur angling steeply UP to knee
  ctx.fillStyle = colShade;
  ctx.fillRect(itemX + 8, itemY - 5, 3, 1);
  ctx.fillRect(itemX + 10, itemY - 6, 2, 1);
  ctx.fillRect(itemX + 11, itemY - 7, 2, 1);
  ctx.fillStyle = colBase;
  ctx.fillRect(itemX + 9, itemY - 5, 2, 1);
  ctx.fillRect(itemX + 11, itemY - 6, 2, 1);
  // High elevated knee joint (patella & condyles)
  ctx.fillStyle = colHi;
  ctx.fillRect(itemX + 12, itemY - 8, 3, 2);
  ctx.fillStyle = colSpec;
  ctx.fillRect(itemX + 13, itemY - 8, 1, 1); // Patella peak highlight
  // Tibia angling DOWN from knee back to riverbed
  ctx.fillStyle = colBase;
  ctx.fillRect(itemX + 14, itemY - 6, 2, 2);
  ctx.fillStyle = colShade;
  ctx.fillRect(itemX + 15, itemY - 5, 2, 2);
  ctx.fillRect(itemX + 16, itemY - 3, 2, 2);
  // Skeletal Foot (bare bones in silt)
  ctx.fillStyle = colHi;
  ctx.fillRect(itemX + 17, itemY - 3, 2, 1); // Calcaneus (heel)
  ctx.fillRect(itemX + 18, itemY - 2, 2, 1); // Metatarsals
  ctx.fillRect(itemX + 19, itemY - 1, 1, 1); // Toes

  // B. Fore Leg with Worn Pioneer Leather Boot
  // Straight femur along bed
  ctx.fillStyle = colShade;
  ctx.fillRect(itemX + 8, itemY - 3, 5, 2);
  ctx.fillStyle = colHi;
  ctx.fillRect(itemX + 9, itemY - 3, 3, 1);
  // Knee joint
  ctx.fillStyle = colBase;
  ctx.fillRect(itemX + 13, itemY - 3, 2, 2);
  // Lower leg
  ctx.fillStyle = colShade;
  ctx.fillRect(itemX + 15, itemY - 2, 4, 1);

  // Pioneer Trail Boot (worn leather with heel and brass eyelets)
  ctx.fillStyle = '#362016'; // Worn leather upper
  ctx.fillRect(itemX + 19, itemY - 4, 4, 3);
  ctx.fillRect(itemX + 22, itemY - 3, 3, 2);
  ctx.fillStyle = '#24150e'; // Boot sole & stacked heel
  ctx.fillRect(itemX + 19, itemY - 1, 6, 1);
  ctx.fillRect(itemX + 19, itemY - 2, 2, 1); // Heel block
  ctx.fillStyle = '#523321'; // Leather highlight
  ctx.fillRect(itemX + 20, itemY - 4, 2, 1);
  ctx.fillStyle = '#d4af37'; // Brass lace eyelet
  ctx.fillRect(itemX + 21, itemY - 3, 1, 1);
}

function drawSubmergedOxSkeleton(ctx, itemX, itemY) {
  // Soft organic contact shadows directly under ground contact points (no box)
  ctx.fillStyle = 'rgba(6, 16, 28, 0.45)';
  ctx.fillRect(itemX - 13, itemY - 1, 5, 1);  // under muzzle / lower jaw
  ctx.fillRect(itemX - 6, itemY + 1, 5, 1);   // under front leg
  ctx.fillRect(itemX - 5, itemY - 2, 14, 1);  // under ribcage base
  ctx.fillRect(itemX + 11, itemY - 1, 8, 1);  // under pelvis & hind leg

  // Riverbed silt contour
  ctx.fillStyle = '#5c3828';
  ctx.fillRect(itemX - 21, itemY + 1, 3, 1);
  ctx.fillRect(itemX - 10, itemY + 1, 2, 1);
  ctx.fillRect(itemX + 11, itemY + 1, 3, 1);

  const colVoid = 'rgba(8, 20, 36, 0.95)';
  const colBase = 'rgba(172, 204, 220, 0.82)';
  const colShade = 'rgba(130, 166, 186, 0.75)';
  const colHi = 'rgba(224, 242, 250, 0.90)';
  const colSpec = '#ffffff';

  // --- BOVINE SKULL & SWEEPING HORNS (Left) ---
  // Sweeping horned ox horn arching upward and back
  ctx.fillStyle = colShade;
  ctx.fillRect(itemX - 18, itemY - 8, 3, 2);
  ctx.fillRect(itemX - 20, itemY - 10, 3, 2);
  ctx.fillStyle = colHi;
  ctx.fillRect(itemX - 21, itemY - 11, 2, 1);
  ctx.fillRect(itemX - 20, itemY - 10, 2, 1);
  ctx.fillStyle = colSpec;
  ctx.fillRect(itemX - 21, itemY - 11, 1, 1);

  // Heavy bovine cranium
  ctx.fillStyle = colShade;
  ctx.fillRect(itemX - 17, itemY - 7, 5, 4);
  ctx.fillStyle = colBase;
  ctx.fillRect(itemX - 16, itemY - 8, 4, 4);
  ctx.fillStyle = colHi;
  ctx.fillRect(itemX - 16, itemY - 8, 3, 1);

  // Large bovine eye socket
  ctx.fillStyle = colVoid;
  ctx.fillRect(itemX - 15, itemY - 6, 2, 2);

  // Elongated snout tapering down to muzzle
  ctx.fillStyle = colShade;
  ctx.fillRect(itemX - 13, itemY - 5, 5, 3);
  ctx.fillStyle = colBase;
  ctx.fillRect(itemX - 12, itemY - 5, 4, 2);
  ctx.fillStyle = colHi;
  ctx.fillRect(itemX - 12, itemY - 5, 3, 1);
  // Muzzle & upper teeth
  ctx.fillStyle = colBase;
  ctx.fillRect(itemX - 9, itemY - 3, 2, 1);
  ctx.fillStyle = colSpec;
  ctx.fillRect(itemX - 8, itemY - 3, 1, 1);
  // Lower jaw
  ctx.fillStyle = colShade;
  ctx.fillRect(itemX - 12, itemY - 2, 4, 1);

  // --- BOVINE SPINE & WITHERS CREST ---
  // High neural spines at the withers
  ctx.fillStyle = colBase;
  ctx.fillRect(itemX - 7, itemY - 8, 2, 4);
  ctx.fillRect(itemX - 5, itemY - 9, 2, 5);
  ctx.fillStyle = colHi;
  ctx.fillRect(itemX - 5, itemY - 9, 1, 1);
  ctx.fillRect(itemX - 7, itemY - 8, 1, 1);

  // Heavy vertebral column
  ctx.fillStyle = colBase;
  ctx.fillRect(itemX - 6, itemY - 4, 17, 2);
  ctx.fillStyle = colShade;
  ctx.fillRect(itemX - 6, itemY - 3, 17, 1);

  // --- DEEP CURVED BOVINE RIBCAGE (6 wide ribs) ---
  ctx.fillStyle = 'rgba(8, 20, 36, 0.78)';
  ctx.fillRect(itemX - 5, itemY - 6, 15, 3); // inner ribcage cavity

  for (let r = 0; r < 6; r += 1) {
    const rx = itemX - 5 + r * 3;
    ctx.fillStyle = colBase;
    ctx.fillRect(rx, itemY - 6, 1, 4);
    ctx.fillStyle = colHi;
    ctx.fillRect(rx, itemY - 7, 1, 1);
    ctx.fillStyle = colShade;
    ctx.fillRect(rx, itemY - 3, 1, 1);
  }

  // --- PELVIC GIRDLE ---
  ctx.fillStyle = colShade;
  ctx.fillRect(itemX + 11, itemY - 6, 6, 4);
  ctx.fillStyle = colBase;
  ctx.fillRect(itemX + 12, itemY - 6, 4, 3);
  ctx.fillStyle = colHi;
  ctx.fillRect(itemX + 13, itemY - 6, 3, 1);
  ctx.fillStyle = colVoid;
  ctx.fillRect(itemX + 13, itemY - 4, 2, 1); // pelvis cavity

  // --- LIMBS & HOOVES ---
  // Front leg collapsed under chest
  ctx.fillStyle = colShade;
  ctx.fillRect(itemX - 6, itemY - 2, 2, 3);
  ctx.fillStyle = colBase;
  ctx.fillRect(itemX - 4, itemY - 1, 2, 2);
  // Rear leg & cloven hoof
  ctx.fillStyle = colShade;
  ctx.fillRect(itemX + 13, itemY - 2, 2, 3);
  ctx.fillStyle = colBase;
  ctx.fillRect(itemX + 15, itemY - 1, 2, 2);
  ctx.fillStyle = colHi;
  ctx.fillRect(itemX + 17, itemY - 1, 2, 2); // split hoof bone
  ctx.fillStyle = colVoid;
  ctx.fillRect(itemX + 18, itemY, 1, 1); // cloven split

  // --- PIONEER DEBRIS (Broken wagon yoke) ---
  ctx.fillStyle = '#442434';
  ctx.fillRect(itemX + 5, itemY - 8, 8, 2);
  ctx.fillStyle = '#7a4d32';
  ctx.fillRect(itemX + 6, itemY - 8, 6, 1);
  ctx.fillStyle = '#2e2624';
  ctx.fillRect(itemX + 9, itemY - 9, 2, 1); // rusted iron hitch ring
  ctx.fillRect(itemX + 8, itemY - 8, 1, 2);
}

function drawSubmergedSkullAndRelics(ctx, itemX, itemY) {
  // Soft organic contact shadows directly beneath skull & relics (no box)
  ctx.fillStyle = 'rgba(6, 16, 28, 0.45)';
  ctx.fillRect(itemX - 4, itemY, 5, 1);      // under skull chin
  ctx.fillRect(itemX + 5, itemY - 1, 4, 1);  // under pocket watch
  ctx.fillRect(itemX - 11, itemY - 2, 3, 1); // under rib fragment
  ctx.fillStyle = '#5c3828';
  ctx.fillRect(itemX - 13, itemY + 1, 4, 1);
  ctx.fillRect(itemX + 8, itemY + 1, 3, 1);

  const colVoid = 'rgba(8, 20, 36, 0.95)';
  const colBase = 'rgba(172, 204, 220, 0.82)';
  const colShade = 'rgba(130, 166, 186, 0.75)';
  const colHi = 'rgba(224, 242, 250, 0.90)';
  const colSpec = '#ffffff';

  // --- HUMAN SKULL (3/4 angle, resting tilted in sand) ---
  // Cranium dome
  ctx.fillStyle = colShade;
  ctx.fillRect(itemX - 6, itemY - 7, 7, 5);
  ctx.fillStyle = colBase;
  ctx.fillRect(itemX - 5, itemY - 8, 5, 5);
  ctx.fillStyle = colHi;
  ctx.fillRect(itemX - 4, itemY - 9, 3, 2);
  ctx.fillStyle = colSpec;
  ctx.fillRect(itemX - 3, itemY - 9, 1, 1);

  // Dual eye sockets (recessed orbits)
  ctx.fillStyle = colVoid;
  ctx.fillRect(itemX - 4, itemY - 6, 2, 2); // left eye
  ctx.fillRect(itemX - 1, itemY - 6, 2, 2); // right eye

  // Supraorbital brow ridge
  ctx.fillStyle = colHi;
  ctx.fillRect(itemX - 5, itemY - 7, 6, 1);

  // Nasal cavity
  ctx.fillStyle = colVoid;
  ctx.fillRect(itemX - 2, itemY - 4, 1, 2);

  // Zygomatic arches
  ctx.fillStyle = colHi;
  ctx.fillRect(itemX - 5, itemY - 5, 1, 2);
  ctx.fillRect(itemX + 1, itemY - 5, 1, 2);

  // Maxilla & teeth notches
  ctx.fillStyle = colBase;
  ctx.fillRect(itemX - 3, itemY - 3, 4, 1);
  ctx.fillStyle = colSpec;
  ctx.fillRect(itemX - 3, itemY - 3, 1, 1);
  ctx.fillRect(itemX - 1, itemY - 3, 1, 1);
  ctx.fillRect(itemX + 1, itemY - 3, 1, 1);

  // Mandible partially buried in silt
  ctx.fillStyle = colShade;
  ctx.fillRect(itemX - 3, itemY - 2, 4, 1);
  ctx.fillStyle = colBase;
  ctx.fillRect(itemX - 2, itemY - 1, 2, 1);

  // --- PIONEER RELICS & FRACTURED BONES ---
  // Weathered rib bone fragment sticking out of silt
  ctx.fillStyle = colBase;
  ctx.fillRect(itemX - 10, itemY - 5, 3, 1);
  ctx.fillRect(itemX - 11, itemY - 4, 2, 2);
  ctx.fillStyle = colHi;
  ctx.fillRect(itemX - 9, itemY - 6, 1, 2);

  // Sunken brass pocket watch / compass half-buried
  ctx.fillStyle = '#7a6624';
  ctx.fillRect(itemX + 5, itemY - 4, 4, 3);
  ctx.fillStyle = '#b89b38';
  ctx.fillRect(itemX + 5, itemY - 4, 1, 3);
  ctx.fillRect(itemX + 8, itemY - 4, 1, 3);
  ctx.fillRect(itemX + 6, itemY - 5, 2, 1); // watch loop
  ctx.fillStyle = '#f7e26b';
  ctx.fillRect(itemX + 6, itemY - 3, 2, 2); // face glint
  ctx.fillStyle = '#2e2624';
  ctx.fillRect(itemX + 6, itemY - 2, 1, 1); // compass hand
}

function drawSubmergedWagonWreck(ctx, itemX, itemY) {
  // Soft organic contact shadows directly beneath wreckage components (no box)
  ctx.fillStyle = 'rgba(6, 16, 28, 0.45)';
  ctx.fillRect(itemX - 14, itemY - 1, 10, 1); // under bottom rim arc
  ctx.fillRect(itemX - 5, itemY - 3, 8, 1);   // under axle spindle
  ctx.fillRect(itemX + 6, itemY - 3, 4, 1);   // under skull
  ctx.fillRect(itemX + 10, itemY - 2, 8, 1);  // under crossed bones

  // --- HALF-BURIED BROKEN WAGON WHEEL ---
  // Wooden rim arc half-submerged in sediment
  ctx.fillStyle = '#442434';
  ctx.fillRect(itemX - 14, itemY - 8, 10, 7);
  ctx.fillStyle = '#7a4d32';
  ctx.fillRect(itemX - 13, itemY - 7, 8, 5);
  ctx.fillStyle = '#442434';
  ctx.fillRect(itemX - 11, itemY - 6, 4, 3); // center hub hole
  ctx.fillStyle = '#b86f50';
  ctx.fillRect(itemX - 9, itemY - 8, 1, 7); // vertical spoke
  ctx.fillRect(itemX - 13, itemY - 5, 7, 1); // horizontal spoke
  // Iron tyre strip peeled away
  ctx.fillStyle = '#2e2624';
  ctx.fillRect(itemX - 15, itemY - 8, 1, 6);
  ctx.fillRect(itemX - 14, itemY - 9, 4, 1);

  // Broken iron axle spindle
  ctx.fillStyle = '#2e2624';
  ctx.fillRect(itemX - 5, itemY - 5, 8, 2);
  ctx.fillStyle = '#5a504a';
  ctx.fillRect(itemX - 4, itemY - 5, 6, 1);

  // --- BONES RESTING IN THE WRECKAGE ---
  const colBase = 'rgba(172, 204, 220, 0.82)';
  const colHi = 'rgba(224, 242, 250, 0.90)';
  const colShade = 'rgba(130, 166, 186, 0.75)';
  const colVoid = 'rgba(8, 20, 36, 0.95)';

  // Skull resting against axle
  ctx.fillStyle = colShade;
  ctx.fillRect(itemX + 5, itemY - 7, 5, 4);
  ctx.fillStyle = colBase;
  ctx.fillRect(itemX + 6, itemY - 8, 4, 4);
  ctx.fillStyle = colHi;
  ctx.fillRect(itemX + 7, itemY - 8, 2, 1);
  ctx.fillStyle = colVoid;
  ctx.fillRect(itemX + 7, itemY - 6, 1, 2); // eye socket
  ctx.fillStyle = colBase;
  ctx.fillRect(itemX + 8, itemY - 4, 2, 1); // jaw

  // Crossed long bones (femur / tibia)
  ctx.fillStyle = colShade;
  ctx.fillRect(itemX + 11, itemY - 6, 6, 1);
  ctx.fillRect(itemX + 12, itemY - 4, 6, 1);
  ctx.fillStyle = colBase;
  ctx.fillRect(itemX + 10, itemY - 6, 2, 2); // bone head
  ctx.fillRect(itemX + 16, itemY - 7, 2, 2);
  ctx.fillRect(itemX + 11, itemY - 3, 2, 2);
  ctx.fillRect(itemX + 17, itemY - 4, 2, 2);
  ctx.fillStyle = colHi;
  ctx.fillRect(itemX + 12, itemY - 6, 4, 1);
  ctx.fillRect(itemX + 13, itemY - 4, 4, 1);
}

export function drawSubmergedSkeletons(ctx, width, bottomY, river, options = {}) {
  const profile = getRiverVisualProfile(river);
  const canvasHeight = ctx.canvas?.height ?? 96;
  const depthLayer = options.depthLayer ?? 'all';
  if (!['all', 'background', 'midground', 'foreground'].includes(depthLayer)) {
    throw new RangeError(`Unknown submerged remains depth layer: ${depthLayer}`);
  }
  const sectionBounds = riverBounds(width, options.landmarkId);
  const scenePathEndY = options.pathEndY ?? Math.round(canvasHeight * 0.81);
  const sectionTopY = scenePathEndY - profile.waterlineOffsetPx;
  const channelCenterX = Math.round((sectionBounds.start + sectionBounds.end) / 2);

  // 1. Riverbed cobblestones & silt deposits resting naturally along the riverbed floor
  // (Irregularly placed along the natural bed contour, avoiding rigid rows or floating lines)
  if (depthLayer === 'all' || depthLayer === 'background') {
    for (let x = sectionBounds.start + 10; x < sectionBounds.end - 10; x += 18) {
      const jitter = ((x * 7) % 5) - 2;
      const stoneX = x + jitter;
      const localBedY = getRiverCrossSectionBottomY(stoneX, sectionBounds, sectionTopY, canvasHeight, profile.depthScale);

      // Natural rounded river cobblestone resting in the bed silt
      ctx.fillStyle = '#442434';
      ctx.fillRect(stoneX, localBedY - 1, 3, 2);
      ctx.fillStyle = '#7a4d36';
      ctx.fillRect(stoneX, localBedY - 2, 2, 1);
      ctx.fillStyle = '#9b6247';
      ctx.fillRect(stoneX + 1, localBedY - 2, 1, 1);

      // Subtle adjacent silt / pebble cluster
      if ((stoneX * 11) % 3 === 0) {
        ctx.fillStyle = '#5c3828';
        ctx.fillRect(stoneX + 4, localBedY - 1, 2, 1);
      }
    }
  }

  // Add one submerged remains item for each complete 2.5 feet of river depth.
  const count = Math.min(5, Math.floor(profile.depthFt / 2.5));

  const allSlots = [
    // Slot 0: Primary foreground human traveler (crisp, full scale 1.0)
    { x: channelCenterX - 18, scale: 1.0,  layer: 'foreground', offset: 2, alpha: 1.0,  type: 'human' },
    // Slot 1: Midground ox skeleton on right channel flank (scale 0.78)
    { x: channelCenterX + 36, scale: 0.78, layer: 'midground',  offset: 5, alpha: 0.88, type: 'ox' },
    // Slot 2: Distant background skull & relics in upper bed on left (scale 0.62)
    { x: channelCenterX - 56, scale: 0.62, layer: 'background', offset: 8, alpha: 0.74, type: 'skull' },
    // Slot 3: Foreground wagon wreck with bones on right trench (scale 0.95)
    { x: channelCenterX + 16, scale: 0.95, layer: 'foreground', offset: 2, alpha: 1.0,  type: 'wagon_wreck' },
    // Slot 4: Midground human skeleton on left slope (scale 0.74)
    { x: channelCenterX - 42, scale: 0.74, layer: 'midground',  offset: 5, alpha: 0.86, type: 'human' }
  ];

  // Select active slots and sort background -> midground -> foreground so foreground draws on top
  const activeSlots = allSlots
    .slice(0, count)
    .filter((slot) => depthLayer === 'all' || slot.layer === depthLayer)
    .sort((a, b) => a.scale - b.scale);

  for (const slot of activeSlots) {
    const bedY = getRiverCrossSectionBottomY(
      slot.x,
      sectionBounds,
      sectionTopY,
      canvasHeight,
      profile.depthScale
    );

    // Ensure item base rests safely at or above bedY so it is NEVER obscured by soil,
    // while remaining submerged below the water surface sectionTopY
    const itemY = Math.max(sectionTopY + 7, bedY - slot.offset);

    ctx.save();
    ctx.translate(slot.x, itemY);
    ctx.scale(slot.scale, slot.scale);
    if (slot.alpha < 1) {
      ctx.globalAlpha = (ctx.globalAlpha || 1) * slot.alpha;
    }

    if (slot.type === 'human') {
      drawSubmergedHumanSkeleton(ctx, 0, 0);
    } else if (slot.type === 'ox') {
      drawSubmergedOxSkeleton(ctx, 0, 0);
    } else if (slot.type === 'skull') {
      drawSubmergedSkullAndRelics(ctx, 0, 0);
    } else if (slot.type === 'wagon_wreck') {
      drawSubmergedWagonWreck(ctx, 0, 0);
    }

    ctx.restore();
  }
}

// Backward-compatible single-item export
export function drawSubmergedSkeleton(ctx, width, bottomY) {
  drawSubmergedHumanSkeleton(ctx, Math.floor(width / 2), Math.min(bottomY - 2, ctx.canvas.height - 3));
}


export function drawRiverGuideMarker(ctx, leaderX, groundY, frameIndex, isMoving = false, landmarkId) {
  const canvasWidth = ctx.canvas?.width ?? 320;
  // Walk ahead of the lead oxen (which end at leaderX + 49) using the 32x32 CharacterDesigner engine
  const drawX = Math.max(0, Math.min(canvasWidth - 25, Math.round(leaderX + 43)));
  const footY = Math.round(groundY);
  const drawY = footY - 30;
  const footCenterX = drawX + 15;
  const { start: riverStart, end: riverEnd } = riverBounds(canvasWidth, landmarkId);
  const guideInWater = footCenterX >= riverStart && footCenterX < riverEnd;

  if (!guideInWater) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.30)';
    ctx.fillRect(drawX + 10, footY, 12, 2);
  }

  const guideGrid = getCharacterFrameGrid(
    NPC_APPEARANCES.riverGuide,
    'side_right',
    isMoving ? 'walk' : 'idle',
    frameIndex % 6
  );
  drawCharacterGridAt(ctx, guideGrid, drawX, drawY, 1);

  // Woven scout headband & eagle feather accent on the 32x32 character head
  const headBounce = isMoving && (frameIndex % 2 === 0) ? 1 : 0;
  ctx.fillStyle = '#ec273f';
  ctx.fillRect(drawX + 11, drawY + 6 + headBounce, 9, 1);
  ctx.fillStyle = '#f7e26b';
  ctx.fillRect(drawX + 13, drawY + 6 + headBounce, 2, 1);
  ctx.fillRect(drawX + 17, drawY + 6 + headBounce, 2, 1);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(drawX + 9, drawY + 3 + headBounce, 2, 3);
  ctx.fillStyle = '#442434';
  ctx.fillRect(drawX + 9, drawY + 2 + headBounce, 1, 2);

  // Tall river-sounding staff held in the guide's leading hand
  const staffX = Math.min(canvasWidth - 2, drawX + 22);
  ctx.fillStyle = '#e4a672';
  ctx.fillRect(staffX, drawY + 7 + headBounce, 1, 23);
  ctx.fillStyle = '#ac2847';
  ctx.fillRect(staffX, drawY + 12 + headBounce, 1, 2);
  ctx.fillStyle = '#f7e26b';
  ctx.fillRect(staffX, drawY + 18 + headBounce, 1, 1);
}





export function drawRiverCrossingSplashes(ctx, width, leaderX, surfaceYByX, frameIndex, options = {}) {
  const { start, end } = riverBounds(width, options.landmarkId);
  const {
    partyFootPositions = null,
    memberSpacing = 6,
    partyCount = 4,
    cartX = null,
    method = 'ford'
  } = options;

  const footPositions = Array.isArray(partyFootPositions) && partyFootPositions.length
    ? partyFootPositions
    : Array.from({ length: partyCount }, (_, idx) => Math.round(leaderX - idx * memberSpacing + 14));

  ctx.fillStyle = '#b2dce8';
  footPositions.forEach((footX, memberIndex) => {
    if (footX < start + 2 || footX >= end - 2) return;
    const baseSurfaceY = surfaceYByX[footX] ?? 78;
    const splashY = baseSurfaceY - 1 - ((frameIndex + memberIndex) % 2);
    ctx.fillRect(footX - 3, splashY, 2, 1);
    ctx.fillRect(footX + 2, splashY + 1, 2, 1);
    if ((frameIndex + memberIndex) % 2 === 0) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(footX - 1, splashY + 1, 2, 1);
      ctx.fillStyle = '#b2dce8';
    }
  });

  if (typeof cartX === 'number') {
    const splashPoints = method === 'caulk'
      ? [cartX + 35, cartX + 43]
      : [cartX + 6, cartX + 22, cartX + 35, cartX + 43];
    splashPoints.forEach((sx, idx) => {
      const px = Math.round(sx);
      if (px < start + 2 || px >= end - 2) return;
      const sy = (surfaceYByX[px] ?? 78) - 1 - ((frameIndex + idx) % 2);
      ctx.fillStyle = idx % 2 === 0 ? '#ffffff' : '#b2dce8';
      ctx.fillRect(px - 1, sy, 2, 1);
    });
  }
}

export const WEATHER_OVERLAYS = Object.freeze([
  { id: 'none', label: 'Clear Skies', shortLabel: 'CLEAR', weirdness: 0, description: 'Calm frontier skies' },
  { id: 'fog', label: 'Rolling Fog', shortLabel: 'FOG', weirdness: 1, description: 'Low-hanging misty banks' },
  { id: 'rain', label: 'Rain', shortLabel: 'RAIN', weirdness: 2, description: 'Steady prairie rain' },
  { id: 'snow_storm', label: 'Snow Storm', shortLabel: 'SNOW STORM', weirdness: 3, description: 'Blinding trail blizzard' },
  { id: 'thunderstorm', label: 'Thunderstorm', shortLabel: 'THUNDERSTORM', weirdness: 4, description: 'Heavy thunder and lightning' },
  { id: 'electrical_storm', label: 'Electrical Storm', shortLabel: 'ELECTRICAL STORM', weirdness: 7, description: 'Unnatural static auroral discharges' },
  { id: 'fire_storm', label: 'Fire Storm', shortLabel: 'FIRE STORM', weirdness: 8, description: 'Blazing cinder squall and fiery skies' },
  { id: 'wormhole_storm', label: 'Wormhole Storm', shortLabel: 'WORMHOLE STORM', weirdness: 10, description: 'Dimensional space-time vortex rift' }
]);

const WEATHER_OVERLAY_ALIASES = Object.freeze({
  '': 'none',
  none: 'none',
  clear: 'none',
  clear_skies: 'none',
  fog: 'fog',
  mist: 'fog',
  haze: 'fog',
  rolling_fog: 'fog',
  rain: 'rain',
  raining: 'rain',
  downpour: 'rain',
  shower: 'rain',
  showers: 'rain',
  thunderstorm: 'thunderstorm',
  'thunder-storm': 'thunderstorm',
  thunder_storm: 'thunderstorm',
  snow_storm: 'snow_storm',
  'snow-storm': 'snow_storm',
  snowstorm: 'snow_storm',
  blizzard: 'snow_storm',
  electrical_storm: 'electrical_storm',
  'electrical-storm': 'electrical_storm',
  electricalstorm: 'electrical_storm',
  electrical: 'electrical_storm',
  wormhole_storm: 'wormhole_storm',
  'wormhole-storm': 'wormhole_storm',
  wormholestorm: 'wormhole_storm',
  wormhole: 'wormhole_storm',
  fire_storm: 'fire_storm',
  'fire-storm': 'fire_storm',
  firestorm: 'fire_storm',
  fire: 'fire_storm'
});

export function normalizeWeatherOverlayId(value) {
  if (typeof value !== 'string') return 'none';
  const cleaned = value.trim().toLowerCase().replace(/\s+/g, '_');
  return WEATHER_OVERLAY_ALIASES[cleaned] ?? 'none';
}

export function getWeatherOverlayMeta(value) {
  const id = normalizeWeatherOverlayId(value);
  return WEATHER_OVERLAYS.find((entry) => entry.id === id) ?? WEATHER_OVERLAYS[0];
}

function drawJaggedPixelBolt(ctx, startX, startY, endY, seed, coreColor, haloColor, outerColor = null) {
  let x = Math.round(startX);
  const topY = Math.max(0, Math.round(startY));
  const bottomY = Math.max(topY + 2, Math.round(endY));

  for (let y = topY; y <= bottomY; y += 1) {
    const step = y - topY;
    if (step > 0 && step % 3 === 0) {
      const turn = ((step * 7 + seed * 13) % 5) - 2;
      x += turn === 0 ? 1 : turn;
    }
    if (outerColor) {
      ctx.fillStyle = outerColor;
      ctx.fillRect(x - 2, y, 5, 1);
    }
    if (haloColor) {
      ctx.fillStyle = haloColor;
      ctx.fillRect(x - 1, y, 3, 1);
    }
    ctx.fillStyle = coreColor;
    ctx.fillRect(x, y, 1, 1);

    if (step === Math.floor((bottomY - topY) * 0.45)) {
      const branchDir = seed % 2 === 0 ? 1 : -1;
      for (let b = 1; b <= 6; b += 1) {
        const bx = x + branchDir * b;
        const by = y + b;
        if (by <= bottomY) {
          if (haloColor) {
            ctx.fillStyle = haloColor;
            ctx.fillRect(bx - 1, by, 2, 1);
          }
          ctx.fillStyle = coreColor;
          ctx.fillRect(bx, by, 1, 1);
        }
      }
    }
  }
  return x;
}

function drawStormCloudCanopy(ctx, width, scrollOffset, topColor, midColor, bellyColor, rimColor = null) {
  const cloudShift = Math.floor(scrollOffset * 0.25);
  ctx.fillStyle = topColor;
  ctx.fillRect(0, 0, width, 6);

  ctx.fillStyle = midColor;
  ctx.fillRect(0, 5, width, 5);

  for (let i = -1; i < Math.ceil(width / 22) + 2; i += 1) {
    const lobeW = 18 + ((i * 7) % 10);
    const lobeH = 4 + ((i * 5) % 4);
    const cx = (((i * 22 - cloudShift) % (width + 32)) + (width + 32)) % (width + 32) - 16;
    const cy = 8 + ((i * 3) % 3);
    ctx.fillStyle = bellyColor;
    ctx.fillRect(cx, cy, lobeW, lobeH);
    ctx.fillRect(cx + 2, cy + lobeH, lobeW - 4, 2);
    if (rimColor) {
      ctx.fillStyle = rimColor;
      ctx.fillRect(cx + 3, cy + lobeH + 1, Math.max(4, lobeW - 6), 1);
    }
  }
}

function isLandXAtRow(width, x, y, horizonY, pathEndY, height, isRiverScene, landmarkId) {
  if (!isRiverScene) return true;
  const bounds = riverBoundsAtY(width, y, horizonY, pathEndY, height, landmarkId);
  return x < bounds.start - 2 || x > bounds.end + 2;
}

function drawPixelEllipse(ctx, cx, cy, rx, ry, fillStyle) {
  if (rx <= 0 || ry <= 0) return;
  ctx.fillStyle = fillStyle;
  const ryInt = Math.max(1, Math.round(ry));
  for (let dy = -ryInt; dy <= ryInt; dy += 1) {
    const ratio = dy / ryInt;
    const halfWidth = Math.round(rx * Math.sqrt(Math.max(0, 1 - ratio * ratio)));
    if (halfWidth >= 0) {
      ctx.fillRect(Math.round(cx - halfWidth), Math.round(cy + dy), halfWidth * 2 + 1, 1);
    }
  }
}

function drawPixelRing(ctx, cx, cy, rx, ry, innerRx, innerRy, fillStyle) {
  if (rx <= 0 || ry <= 0) return;
  ctx.fillStyle = fillStyle;
  const ryInt = Math.max(1, Math.round(ry));
  for (let dy = -ryInt; dy <= ryInt; dy += 1) {
    const ratio = dy / ryInt;
    const outerHalf = Math.round(rx * Math.sqrt(Math.max(0, 1 - ratio * ratio)));
    let innerHalf = -1;
    if (Math.abs(dy) <= innerRy && innerRy > 0) {
      const innerRatio = dy / innerRy;
      innerHalf = Math.round(innerRx * Math.sqrt(Math.max(0, 1 - innerRatio * innerRatio)));
    }
    if (innerHalf < 0) {
      ctx.fillRect(Math.round(cx - outerHalf), Math.round(cy + dy), outerHalf * 2 + 1, 1);
    } else {
      const leftWidth = outerHalf - innerHalf;
      if (leftWidth > 0) {
        ctx.fillRect(Math.round(cx - outerHalf), Math.round(cy + dy), leftWidth, 1);
        ctx.fillRect(Math.round(cx + innerHalf + 1), Math.round(cy + dy), leftWidth, 1);
      }
    }
  }
}

function drawPixelLine(ctx, x0, y0, x1, y1, fillStyle) {
  ctx.fillStyle = fillStyle;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const steps = Math.max(Math.abs(Math.round(dx)), Math.abs(Math.round(dy)), 1);
  for (let i = 0; i <= steps; i += 1) {
    const px = Math.round(x0 + (dx * i) / steps);
    const py = Math.round(y0 + (dy * i) / steps);
    ctx.fillRect(px, py, 1, 1);
  }
}

function drawPixelEllipseWireframe(ctx, cx, cy, rx, ry, fillStyle) {
  if (rx < 0.5 && ry < 0.5) {
    ctx.fillStyle = fillStyle;
    ctx.fillRect(Math.round(cx), Math.round(cy), 1, 1);
    return;
  }
  ctx.fillStyle = fillStyle;
  const steps = Math.max(14, Math.round((rx + ry) * 3.2));
  for (let i = 0; i < steps; i += 1) {
    const angle = (i / steps) * Math.PI * 2;
    const px = Math.round(cx + Math.cos(angle) * rx);
    const py = Math.round(cy + Math.sin(angle) * ry);
    ctx.fillRect(px, py, 1, 1);
  }
}

function createPrng(seed) {
  let s = (Math.abs(seed) || 123456789) % 2147483647;
  return function() {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateWormholeLayout(seed, width, height, horizonY, pathStartY, pathEndY) {
  const rng = createPrng(seed);
  const portals = [];

  // 1. Overhead hanging 3D funnel (mouth hanging down at y=15..19, conical tail tapering up to y=2..5)
  const overheadX = Math.round(width * (0.20 + rng() * 0.60));
  const overheadY = Math.round(14 + rng() * 5);
  const overheadRx = Math.round(10 + rng() * 4); // 10..14px
  const overheadRy = Math.round(3 + rng() * 1.5);
  const overheadDir = rng() > 0.5 ? 1 : -1;
  portals.push({
    orientation: 'overhead',
    baseX: overheadX,
    baseY: overheadY,
    rx: overheadRx,
    ry: overheadRy,
    coneDx: overheadDir * Math.round(6 + rng() * 6),
    coneDy: -Math.round(10 + rng() * 4), // tapers upward into deep space
    depth: 0.45 + rng() * 0.25,
    layer: 'background'
  });

  // 2. Mid-sky angled 3D conical vortices (2 to 3 funnels at distinct 3D angles)
  const skyCount = 2 + Math.floor(rng() * 2);
  for (let i = 0; i < skyCount; i += 1) {
    const x = Math.round(width * (0.14 + (i * 0.32) + rng() * 0.16));
    const y = Math.round(18 + rng() * Math.max(6, horizonY - 28));
    const rx = Math.round(7 + rng() * 4); // 7..11px
    const ry = Math.max(4, Math.round(rx * (0.52 + rng() * 0.22)));
    const sideDir = (i % 2 === 0 ? 1 : -1) * (rng() > 0.2 ? 1 : -1);
    const coneDx = sideDir * Math.round(rx * (1.25 + rng() * 0.55));
    const coneDy = Math.round((rng() > 0.45 ? -1 : 1) * ry * (1.1 + rng() * 0.6));
    portals.push({
      orientation: 'face',
      baseX: x,
      baseY: y,
      rx,
      ry,
      coneDx,
      coneDy,
      depth: 0.38 + rng() * 0.45,
      layer: 'background'
    });
  }

  // 3. Flat on the ground 3D sinkhole funnels (Homer^3 floor vortex cones plunging downward)
  // Background distant ground sinkhole
  const bgGroundX = Math.round(width * (0.22 + rng() * 0.56));
  const bgGroundY = Math.round(pathStartY + 1 + rng() * 3);
  const bgDir = rng() > 0.5 ? 1 : -1;
  portals.push({
    orientation: 'ground',
    baseX: bgGroundX,
    baseY: bgGroundY,
    rx: Math.round(8 + rng() * 4),
    ry: Math.round(2.5 + rng() * 1),
    coneDx: bgDir * Math.round(3 + rng() * 4),
    coneDy: Math.round(8 + rng() * 4), // plunges down into the ground
    depth: 0.62 + rng() * 0.22,
    layer: 'background'
  });

  // Foreground closer ground sinkhole
  const fgGroundX = Math.round(width * (0.18 + rng() * 0.64));
  const fgGroundY = Math.round(pathEndY - 9 + rng() * 3);
  const fgDir = rng() > 0.5 ? 1 : -1;
  portals.push({
    orientation: 'ground',
    baseX: fgGroundX,
    baseY: fgGroundY,
    rx: Math.round(11 + rng() * 4),
    ry: Math.round(3 + rng() * 1.2),
    coneDx: fgDir * Math.round(4 + rng() * 5),
    coneDy: Math.round(10 + rng() * 4), // deep conical spout beneath the trail
    depth: 0.20 + rng() * 0.22,
    layer: 'foreground'
  });

  // 4. Distant tiny micro-wormholes in the sky (18 to 24 tiny distant cones & pinholes)
  const microCount = 18 + Math.floor(rng() * 7);
  const microPortals = [];
  for (let i = 0; i < microCount; i += 1) {
    const mx = Math.round(6 + rng() * (width - 12));
    const my = Math.round(3 + rng() * Math.max(4, horizonY - 8));
    const dir = rng() > 0.5 ? 1 : -1;
    microPortals.push({
      baseX: mx,
      baseY: my,
      size: rng() > 0.55 ? 3 : 2,
      tailDx: dir * Math.round(2 + rng() * 3),
      tailDy: -Math.round(1 + rng() * 2),
      depth: 0.72 + rng() * 0.24,
      flicker: Math.floor(rng() * 8)
    });
  }

  return { portals, microPortals };
}

export function getAnimatedWormhole(portal, tick, scroll, width) {
  let x, y;
  if (portal.orientation === 'face') {
    x = (((portal.baseX + Math.floor(tick * 0.40) - Math.floor(scroll * 0.15)) % (width + 40)) + (width + 40)) % (width + 40) - 20;
    y = Math.round(portal.baseY + Math.sin(tick * 0.10 + portal.depth * 7) * 2.5);
  } else if (portal.orientation === 'overhead') {
    x = (((portal.baseX + Math.floor(tick * 0.22) - Math.floor(scroll * 0.10)) % (width + 50)) + (width + 50)) % (width + 50) - 25;
    y = Math.round(portal.baseY + Math.cos(tick * 0.08 + portal.depth * 5) * 1.5);
  } else {
    x = (((portal.baseX - scroll) % (width + 60)) + (width + 60)) % (width + 60) - 30;
    y = portal.baseY;
  }
  const rx = Math.max(3, Math.round(portal.rx + Math.sin(tick * 0.18 + portal.baseX) * 1.0));
  const ry = Math.max(2, Math.round(portal.ry + Math.cos(tick * 0.18 + portal.baseY) * 0.6));
  // Subtle sway of the conical tail tip
  const tipSwayX = Math.round(Math.sin(tick * 0.14 + portal.baseX) * 1.5);
  const tipSwayY = Math.round(Math.cos(tick * 0.14 + portal.baseY) * 1.0);
  return {
    ...portal,
    x,
    y,
    rx,
    ry,
    apexX: x + (portal.coneDx || 0) + tipSwayX,
    apexY: y + (portal.coneDy || 8) + tipSwayY
  };
}

function drawAtmosphericWormholePortal(ctx, portal, tick) {
  const { x, y, rx, ry, apexX, apexY, depth } = portal;
  const isDistant = depth > 0.55;

  ctx.save();
  // Atmospheric opacity fade: distant wormholes fade into the background haze
  const alpha = Math.max(0.30, Math.min(0.90, 1 - depth * 0.55));
  ctx.globalAlpha = (ctx.globalAlpha || 1) * alpha;

  // --- HOMER^3 3D WIREFRAME CONE PALETTE (GREEN & BLACK/PURPLE) ---
  const outerHaloCol = isDistant ? 'rgba(30, 58, 44, 0.20)' : 'rgba(26, 6, 44, 0.36)';
  const voidOuterCol = isDistant ? '#22152e' : '#180429';
  const voidMidCol = isDistant ? '#160d20' : '#0d0218';
  const voidDeepCol = isDistant ? '#0c0712' : '#030006';
  const wirePurpleCol = isDistant ? '#4c3260' : '#7b1fa2';
  const wireDarkGreenCol = isDistant ? '#345e46' : '#00963d';
  const wireMidGreenCol = isDistant ? '#4c8565' : '#00e65c';
  const wireBrightGreenCol = isDistant ? '#78b08e' : '#39ff14';
  const wireHotCoreCol = isDistant ? '#b8dec6' : '#d4ffe2';

  // 1. Soft atmospheric outer glow around the mouth
  drawPixelEllipse(ctx, x, y, rx + 3, ry + 2, outerHaloCol);

  // 2. Solid 3D Conical Trumpet Void Body (drawn from pointed tip back-to-front to mouth)
  // This carves out the unmistakable 3D cone silhouette in space
  const fillSlices = 18;
  for (let s = fillSlices; s >= 0; s -= 1) {
    const t = s / fillSlices; // 1 = pointed tip, 0 = wide mouth
    const taper = Math.pow(1 - t, 1.45);
    const cx = x + (apexX - x) * t;
    const cy = y + (apexY - y) * t;
    const crx = rx * taper;
    const cry = ry * taper;
    const sliceCol = t > 0.6 ? voidDeepCol : t > 0.25 ? voidMidCol : voidOuterCol;
    drawPixelEllipse(ctx, cx, cy, crx, cry, sliceCol);
  }

  // Deep black-violet throat center inside the mouth opening
  drawPixelEllipse(ctx, x + (apexX - x) * 0.15, y + (apexY - y) * 0.15, rx * 0.72, ry * 0.72, voidDeepCol);

  // 3. Curved 3D Wireframe Longitude Meridians (ribs running from mouth rim down to pointed tip)
  const meridianCount = rx >= 10 ? 8 : 6;
  const rotOffset = tick * 0.05;
  for (let m = 0; m < meridianCount; m += 1) {
    const baseAngle = (m / meridianCount) * Math.PI * 2 + rotOffset;
    let prevX = x + Math.cos(baseAngle) * rx;
    let prevY = y + Math.sin(baseAngle) * ry;
    const segments = 8;
    for (let seg = 1; seg <= segments; seg += 1) {
      const t = seg / segments;
      const taper = Math.pow(1 - t, 1.45);
      // Slight vortex twist as meridian lines plunge into the cone tip
      const twist = t * 0.45;
      const nextX = x + (apexX - x) * t + Math.cos(baseAngle + twist) * (rx * taper);
      const nextY = y + (apexY - y) * t + Math.sin(baseAngle + twist) * (ry * taper);
      const ribCol = seg <= 2
        ? wireMidGreenCol
        : seg <= 5
          ? (m % 2 === 0 ? wireDarkGreenCol : wirePurpleCol)
          : wireBrightGreenCol;
      drawPixelLine(ctx, prevX, prevY, nextX, nextY, ribCol);
      prevX = nextX;
      prevY = nextY;
    }
  }

  // 4. Animated Inward-Collapsing Wireframe Latitude Rings (sliding down the cone toward the tip)
  const ringCount = 4;
  const ringPhaseOffset = (tick * 0.08) % (1 / ringCount);
  for (let r = 0; r < ringCount; r += 1) {
    const t = Math.min(0.95, r / ringCount + ringPhaseOffset);
    const taper = Math.pow(1 - t, 1.45);
    const ringX = x + (apexX - x) * t;
    const ringY = y + (apexY - y) * t;
    const ringRx = rx * taper;
    const ringRy = ry * taper;
    const ringCol = t < 0.25
      ? wireMidGreenCol
      : t < 0.65
        ? (r % 2 === 0 ? wireBrightGreenCol : wirePurpleCol)
        : wireHotCoreCol;
    drawPixelEllipseWireframe(ctx, ringX, ringY, ringRx, ringRy, ringCol);
  }

  // Crisp neon-green wireframe rim at the mouth opening (t = 0)
  drawPixelEllipseWireframe(ctx, x, y, rx, ry, wireBrightGreenCol);

  // 5. Inward-Drawing Motion Lines (streaks pulled from outside air into the mouth and down the cone)
  const streamCount = rx >= 10 ? 8 : 6;
  for (let i = 0; i < streamCount; i += 1) {
    const streamAngle = (i / streamCount) * Math.PI * 2 - rotOffset * 0.8;
    // Phase 0..1: 0..0.45 is outside air being sucked into the rim; 0.45..1.0 is plunging down the cone
    const progress = ((tick * 0.11 + i * (1 / streamCount)) % 1.0);

    if (progress < 0.48) {
      // Exterior motion line drawing inward from surrounding space into the mouth rim
      const extT = progress / 0.48; // 0 (far out) -> 1 (at mouth rim)
      const distMult = 1.65 - extT * 0.65; // 1.65 * r -> 1.0 * r
      const tailMult = distMult + 0.28;
      // Pull from slightly in front of the mouth
      const pullShiftX = -(apexX - x) * (1 - extT) * 0.18;
      const pullShiftY = -(apexY - y) * (1 - extT) * 0.18;

      const x0 = x + pullShiftX + Math.cos(streamAngle) * (rx * tailMult);
      const y0 = y + pullShiftY + Math.sin(streamAngle) * (ry * tailMult);
      const x1 = x + Math.cos(streamAngle) * (rx * distMult);
      const y1 = y + Math.sin(streamAngle) * (ry * distMult);

      drawPixelLine(ctx, x0, y0, x1, y1, extT > 0.6 ? wireHotCoreCol : wireBrightGreenCol);
    } else {
      // Interior motion streak racing down the funnel wall into the singularity tip
      const intT = (progress - 0.48) / 0.52; // 0 (mouth) -> 1 (tip)
      const accelT = Math.pow(intT, 1.3);
      const tailT = Math.max(0, accelT - 0.22);

      const taper0 = Math.pow(1 - tailT, 1.45);
      const taper1 = Math.pow(1 - accelT, 1.45);
      const twist0 = tailT * 0.45;
      const twist1 = accelT * 0.45;

      const x0 = x + (apexX - x) * tailT + Math.cos(streamAngle + twist0) * (rx * taper0);
      const y0 = y + (apexY - y) * tailT + Math.sin(streamAngle + twist0) * (ry * taper0);
      const x1 = x + (apexX - x) * accelT + Math.cos(streamAngle + twist1) * (rx * taper1);
      const y1 = y + (apexY - y) * accelT + Math.sin(streamAngle + twist1) * (ry * taper1);

      drawPixelLine(ctx, x0, y0, x1, y1, accelT > 0.7 ? wireHotCoreCol : wireBrightGreenCol);
    }
  }

  // 6. Glowing Singularity Point at the Conical Tip
  ctx.fillStyle = wireBrightGreenCol;
  ctx.fillRect(Math.round(apexX - 1), Math.round(apexY), 3, 1);
  ctx.fillRect(Math.round(apexX), Math.round(apexY - 1), 1, 3);
  ctx.fillStyle = wireHotCoreCol;
  ctx.fillRect(Math.round(apexX), Math.round(apexY), 1, 1);

  ctx.restore();
}

export function drawWeatherOverlay(
  ctx,
  width,
  height,
  weatherOverlayId,
  animTick = 0,
  scrollOffset = 0,
  charFootY = 82,
  options = {}
) {
  const overlayId = normalizeWeatherOverlayId(weatherOverlayId);
  if (overlayId === 'none' || !ctx) return;

  const {
    layer = 'all',
    isRiverScene = false,
    horizonY = Math.max(12, charFootY - 20),
    pathStartY = Math.max(18, charFootY - 6),
    pathEndY = Math.min(height - 2, charFootY + 4),
    landmarkId,
    pixiEffects = false
  } = options;

  const drawBackground = layer === 'all' || layer === 'background';
  const drawForeground = layer === 'all' || layer === 'foreground';
  const tick = Math.max(0, Math.floor(animTick));
  const scroll = Math.floor(scrollOffset);

  if (overlayId === 'rain') {
    if (drawBackground) {
      ctx.fillStyle = 'rgba(28, 42, 60, 0.22)';
      ctx.fillRect(0, 0, width, height);

      drawStormCloudCanopy(
        ctx,
        width,
        scroll + tick,
        '#222e3c',
        '#314254',
        '#455a70',
        '#68829e'
      );

      ctx.fillStyle = 'rgba(180, 215, 238, 0.14)';
      for (let s = 0; s < 12; s += 1) {
        const sx = (((s * 27 - tick * 2 - Math.floor(scroll * 0.4)) % width) + width) % width;
        ctx.fillRect(sx, 12, 1, horizonY - 4);
      }
    }

    if (drawForeground && !pixiEffects) {
      for (let i = 0; i < 48; i += 1) {
        const speed = 5 + (i % 3);
        const rx = (((i * 19 - tick * 3 - scroll) % width) + width) % width;
        const ry = (((i * 13 + tick * speed) % (height - 4)) + (height - 4)) % (height - 4);
        const dropLen = (i % 3 === 0) ? 4 : 3;
        ctx.fillStyle = (i % 4 === 0) ? '#e6f4fc' : (i % 2 === 0) ? '#96c8eb' : '#68a6d6';
        ctx.fillRect(rx, ry, 1, dropLen);

        if (ry >= pathEndY - 3 && ry <= pathEndY + 4 && (i % 3 === 0)) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(rx - 1, pathEndY, 2, 1);
        }
      }
    }
    return;
  }

  if (overlayId === 'fog') {
    if (drawBackground) {
      ctx.fillStyle = 'rgba(215, 228, 238, 0.25)';
      ctx.fillRect(0, Math.max(0, horizonY - 14), width, 18);

      const fogColors = ['rgba(225, 236, 245, 0.32)', 'rgba(205, 220, 232, 0.28)', 'rgba(190, 210, 225, 0.24)'];
      for (let f = 0; f < 3; f += 1) {
        const fy = horizonY - 8 + f * 5;
        const fogShift = Math.floor(tick * 0.4 * (f + 1) + scroll * 0.3);
        ctx.fillStyle = fogColors[f];
        for (let x = 0; x < width; x += 8) {
          const wave = Math.sin((x + fogShift) * 0.08) * 2;
          ctx.fillRect(x, Math.round(fy + wave), 8, 3);
        }
      }
    }

    if (drawForeground) {
      ctx.fillStyle = 'rgba(235, 245, 252, 0.35)';
      const groundShift = Math.floor(tick * 0.7 + scroll * 0.6);
      for (let x = 0; x < width; x += 6) {
        const wave = Math.sin((x + groundShift) * 0.1) * 2;
        ctx.fillRect(x, Math.round(charFootY - 3 + wave), 6, 4);
      }

      ctx.fillStyle = 'rgba(210, 228, 242, 0.22)';
      for (let x = 0; x < width; x += 10) {
        const wave = Math.cos((x - groundShift * 0.8) * 0.07) * 2;
        ctx.fillRect(x, Math.round(charFootY + 1 + wave), 10, 3);
      }
    }
    return;
  }

  if (overlayId === 'thunderstorm') {
    const strikeCycle = tick % 9;
    const isMainStrike = strikeCycle === 1 || strikeCycle === 2;
    const isSecondaryStrike = strikeCycle === 6;

    if (drawBackground) {
      ctx.fillStyle = isMainStrike ? 'rgba(190, 226, 255, 0.20)' : 'rgba(14, 24, 44, 0.30)';
      ctx.fillRect(0, 0, width, height);

      drawStormCloudCanopy(
        ctx,
        width,
        scroll + tick * 2,
        '#182032',
        '#25324a',
        '#364763',
        isMainStrike ? '#b2dce8' : '#4a5d7c'
      );

      if ((isMainStrike || isSecondaryStrike) && !pixiEffects) {
        const boltX = isMainStrike
          ? Math.floor(width * (strikeCycle === 1 ? 0.27 : 0.68))
          : Math.floor(width * 0.48);
        const endY = horizonY + 2;
        const hitX = drawJaggedPixelBolt(ctx, boltX, 10, endY, tick + 3, '#ffffff', '#b2dce8', 'rgba(49, 162, 242, 0.45)');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(hitX - 3, endY - 1, 7, 2);
      }
    }

    if (drawForeground) {
      for (let i = 0; i < 46; i += 1) {
        const speed = i % 3 === 0 ? 9 : 7;
        const rx = (((i * 23 - tick * 5 - scroll) % width) + width) % width;
        const ry = (((i * 17 + tick * speed) % (height - 4)) + (height - 4)) % (height - 4);
        ctx.fillStyle = i % 3 === 0 ? '#b2dce8' : '#5c9bd6';
        ctx.fillRect(rx, ry, 1, 3);
        ctx.fillRect(rx - 1, ry + 3, 1, 2);
      }

      for (let s = 0; s < 14; s += 1) {
        const sx = (((s * 29 + tick * 11 - scroll) % (width - 6)) + (width - 6)) % (width - 6) + 2;
        const sy = pathStartY + ((s * 5 + tick) % Math.max(2, pathEndY - pathStartY + 4));
        ctx.fillStyle = '#e6f4fc';
        ctx.fillRect(sx, sy, 2, 1);
      }
    }
    return;
  }

  if (overlayId === 'snow_storm') {
    if (drawBackground) {
      ctx.fillStyle = 'rgba(220, 238, 250, 0.28)';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(240, 248, 255, 0.35)';
      ctx.fillRect(0, Math.max(0, horizonY - 8), width, 12);

      drawStormCloudCanopy(
        ctx,
        width,
        scroll + tick,
        '#7b92a8',
        '#9cb4c9',
        '#bfd4e6',
        '#e8f3fc'
      );
    }

    if (drawForeground) {
      ctx.fillStyle = 'rgba(235, 246, 255, 0.28)';
      for (let g = 0; g < 3; g += 1) {
        const gy = 18 + g * 24 + ((tick + g * 3) % 5) - 2;
        const gx = (((g * 43 - tick * 11 - scroll) % (width + 16)) + (width + 16)) % (width + 16) - 8;
        ctx.fillRect(gx, gy, 32, 1);
        ctx.fillRect(gx + 6, gy + 1, 20, 1);
      }

      if (!pixiEffects) {
        for (let i = 0; i < 64; i += 1) {
          const sx = (((i * 19 - tick * (3 + (i % 3)) - scroll) % width) + width) % width;
          const sy = (((i * 13 + tick * (2 + (i % 2))) % (height - 2)) + (height - 2)) % (height - 2);
          if (i % 5 === 0) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(sx, sy, 2, 2);
          } else {
            ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#d6ecf7';
            ctx.fillRect(sx, sy, 1, 1);
          }
        }

        ctx.fillStyle = '#ffffff';
        for (let c = 0; c < 10; c += 1) {
          const cx = (((c * 37 - tick * 6 - scroll) % (width - 4)) + (width - 4)) % (width - 4) + 2;
          const cy = (((c * 23 + tick * 4) % (height - 6)) + (height - 6)) % (height - 6) + 2;
          ctx.fillRect(cx, cy, 1, 1);
          ctx.fillRect(cx - 1, cy, 3, 1);
          ctx.fillRect(cx, cy - 1, 1, 3);
        }
      }
    }
    return;
  }

  if (overlayId === 'electrical_storm') {
    const pulse = tick % 6;
    const isFlash = pulse === 0 || pulse === 3;

    if (drawBackground) {
      ctx.fillStyle = isFlash ? 'rgba(88, 52, 164, 0.24)' : 'rgba(26, 12, 54, 0.32)';
      ctx.fillRect(0, 0, width, height);

      drawStormCloudCanopy(
        ctx,
        width,
        scroll + tick * 2,
        '#1b1035',
        '#2f1d58',
        '#4c2f82',
        pulse % 2 === 0 ? '#00e5ff' : '#b86ff0'
      );

      const spiderX = (((tick * 39) % (width - 56)) + (width - 56)) % (width - 56) + 12;
      ctx.fillStyle = '#b86ff0';
      ctx.fillRect(spiderX - 2, 11, 38, 1);
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(spiderX, 10, 32, 1);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(spiderX + 4, 10, 18, 1);

      const boltColumns = [
        Math.floor(width * (0.16 + ((tick % 3) * 0.05))),
        Math.floor(width * (0.52 + (((tick + 1) % 3) * 0.04))),
        Math.floor(width * (0.82 - ((tick % 2) * 0.06)))
      ];
      boltColumns.forEach((bx, idx) => {
        if ((tick + idx) % 2 === 0) {
          const targetY = idx === 1 ? pathStartY + 2 : horizonY + 3;
          const hitX = drawJaggedPixelBolt(
            ctx,
            bx,
            10,
            targetY,
            tick + idx * 5,
            '#ffffff',
            idx % 2 === 0 ? '#00e5ff' : '#f7e26b',
            '#9b51e0'
          );
          ctx.fillStyle = '#00e5ff';
          ctx.fillRect(hitX - 3, targetY - 1, 7, 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(hitX - 1, targetY - 2, 3, 2);
        }
      });
    }

    if (drawForeground) {
      for (let o = 0; o < 4; o += 1) {
        const ox = (((o * 79 + tick * 5 - scroll) % (width - 12)) + (width - 12)) % (width - 12) + 6;
        const oy = Math.round(horizonY - 4 + Math.sin((tick + o * 3) * 0.7) * 10 + (o % 2) * 14);
        ctx.fillStyle = '#9b51e0';
        ctx.fillRect(ox - 2, oy - 1, 5, 3);
        ctx.fillRect(ox - 1, oy - 2, 3, 5);
        ctx.fillStyle = '#00e5ff';
        ctx.fillRect(ox - 1, oy, 3, 1);
        ctx.fillRect(ox, oy - 1, 1, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(ox, oy, 1, 1);
      }

      for (let s = 0; s < 18; s += 1) {
        const sx = (((s * 23 + tick * 9) % (width - 6)) + (width - 6)) % (width - 6) + 3;
        const sy = 18 + ((s * 13 + tick * 7) % (height - 20));
        ctx.fillStyle = s % 3 === 0 ? '#f7e26b' : s % 2 === 0 ? '#00e5ff' : '#ffffff';
        ctx.fillRect(sx, sy, 2, 1);
        if ((s + tick) % 2 === 0) {
          ctx.fillRect(sx + 1, sy - 1, 1, 3);
        }
      }
    }
    return;
  }

  if (overlayId === 'wormhole_storm') {
    if (pixiEffects) return;
    const seed = options.weatherSeed ?? options.seed ?? Math.floor(Math.random() * 1000000);
    const layout = generateWormholeLayout(seed, width, height, horizonY, pathStartY, pathEndY);

    if (drawBackground) {
      // 1. Deep Homer^3 purple-black cyber-void wash
      ctx.fillStyle = 'rgba(14, 3, 24, 0.42)';
      ctx.fillRect(0, 0, width, height);

      // 2. Faint perspective wireframe horizon grid shimmer
      ctx.fillStyle = 'rgba(0, 255, 102, 0.14)';
      ctx.fillRect(0, Math.max(0, horizonY - 2), width, 1);
      ctx.fillStyle = 'rgba(123, 31, 162, 0.18)';
      ctx.fillRect(0, Math.max(0, horizonY - 8), width, 6);

      // 3. Sky filled with tiny 3D conical micro-vortices off in the distance
      const microPalette = ['#00ff66', '#52ffa0', '#9b51e0', '#39ff14', '#d4ffe2'];
      for (let i = 0; i < layout.microPortals.length; i += 1) {
        const mp = layout.microPortals[i];
        const pulse = (tick + mp.flicker) % 6;
        if (pulse < 5) {
          ctx.save();
          ctx.globalAlpha = Math.max(0.20, Math.min(0.50, 1 - mp.depth * 0.62));
          const col = microPalette[(i + tick) % microPalette.length];
          const rx = mp.size === 3 ? 2 : 1;
          const ry = 1;
          const currentMx = (((mp.baseX + Math.floor(tick * 0.16) - Math.floor(scroll * 0.05)) % width) + width) % width;
          const currentMy = mp.baseY + Math.round(Math.sin((tick + mp.flicker) * 0.12) * 1.2);
          const tipX = currentMx + mp.tailDx;
          const tipY = currentMy + mp.tailDy;
          // Tiny conical tail
          drawPixelLine(ctx, currentMx - rx, currentMy, tipX, tipY, '#345e46');
          drawPixelLine(ctx, currentMx + rx, currentMy, tipX, tipY, '#4c3260');
          drawPixelEllipse(ctx, currentMx, currentMy, rx, ry, '#080112');
          drawPixelEllipseWireframe(ctx, currentMx, currentMy, rx, ry, col);
          ctx.restore();
        }
      }

      // 4. Render background 3D wireframe conical wormhole funnels
      for (const portal of layout.portals) {
        if (portal.layer === 'background') {
          const animated = getAnimatedWormhole(portal, tick, scroll, width);
          drawAtmosphericWormholePortal(ctx, animated, tick);
        }
      }
    }

    if (drawForeground) {
      // 1. Render foreground 3D wireframe conical sinkholes
      for (const portal of layout.portals) {
        if (portal.layer === 'foreground') {
          const animated = getAnimatedWormhole(portal, tick, scroll, width);
          drawAtmosphericWormholePortal(ctx, animated, tick);
        }
      }

      // 2. Floating 3D wireframe grid fragments & green motes getting sucked into the cones
      const motePalette = ['#39ff14', '#00ff66', '#9b51e0', '#d4ffe2'];
      for (let m = 0; m < 12; m += 1) {
        const cycle = (tick * 2 + m * 7) % 24;
        const pull = cycle / 23;
        const startX = (m * 43 + (seed % 53)) % width;
        const startY = pathEndY - (m % 6);
        const rawTarget = layout.portals[m % layout.portals.length];
        const targetPortal = getAnimatedWormhole(rawTarget, tick, scroll, width);
        const mx = Math.round(startX + (targetPortal.x - startX) * pull);
        const my = Math.round(startY + (targetPortal.y - startY) * pull - Math.sin(pull * Math.PI) * 6);

        ctx.save();
        ctx.globalAlpha = Math.max(0.25, Math.min(0.75, 0.85 - pull * 0.45));
        ctx.fillStyle = motePalette[(m + tick) % motePalette.length];
        if (m % 3 === 0 && pull < 0.7) {
          // Tiny wireframe square/grid fragment being sucked in
          ctx.fillRect(mx, my, 2, 1);
          ctx.fillRect(mx, my + 1, 1, 1);
        } else {
          ctx.fillRect(mx, my, 1, 1);
        }
        ctx.restore();
      }
    }
    return;
  }

  if (overlayId === 'fire_storm') {
    if (drawBackground) {
      ctx.fillStyle = 'rgba(122, 22, 10, 0.28)';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(243, 168, 51, 0.24)';
      ctx.fillRect(0, Math.max(0, horizonY - 9), width, 12);

      drawStormCloudCanopy(
        ctx,
        width,
        scroll + tick * 2,
        '#1f0d0d',
        '#381818',
        '#5c2620',
        tick % 2 === 0 ? '#f3a833' : '#de5d3a'
      );

      for (let x = 4; x < width - 6; x += 9) {
        if (!isLandXAtRow(width, x, horizonY + 1, horizonY, pathEndY, height, isRiverScene, landmarkId)) continue;
        const flameH = 2 + ((x + tick * 2) % 4);
        ctx.fillStyle = '#ac2847';
        ctx.fillRect(x, horizonY - flameH, 3, flameH + 1);
        ctx.fillStyle = '#e98537';
        ctx.fillRect(x + 1, horizonY - flameH - 1, 2, flameH);
        ctx.fillStyle = '#f7e26b';
        ctx.fillRect(x + 1, horizonY - flameH - 2, 1, 2);
      }
    }

    if (drawForeground) {
      for (let f = 0; f < 5; f += 1) {
        const fx = (((f * 67 - tick * 9 - scroll) % (width + 24)) + (width + 24)) % (width + 24) - 12;
        const fy = (((f * 23 + tick * 5) % (height - 14)) + (height - 14)) % (height - 14) + 6;
        ctx.fillStyle = '#442434';
        ctx.fillRect(fx + 5, fy - 4, 2, 1);
        ctx.fillStyle = '#ac2847';
        ctx.fillRect(fx + 3, fy - 3, 3, 2);
        ctx.fillStyle = '#e98537';
        ctx.fillRect(fx + 1, fy - 2, 3, 2);
        ctx.fillStyle = '#f7e26b';
        ctx.fillRect(fx, fy - 1, 2, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(fx, fy, 1, 1);
      }

      for (let e = 0; e < 42; e += 1) {
        const ex = (((e * 19 - tick * (2 + (e % 3)) - scroll) % width) + width) % width;
        if (e % 3 === 0) {
          const ey = (((e * 13 + tick * 2) % (height - 2)) + (height - 2)) % (height - 2);
          ctx.fillStyle = '#442434';
          ctx.fillRect(ex, ey, 2, 1);
        } else {
          const ey = (((e * 17 - tick * 3) % (height - 2)) + (height - 2)) % (height - 2);
          ctx.fillStyle = e % 2 === 0 ? '#f7e26b' : '#ec273f';
          ctx.fillRect(ex, ey, 1, 1);
          if ((e + tick) % 4 === 0) {
            ctx.fillStyle = '#e98537';
            ctx.fillRect(ex + 1, ey, 1, 1);
          }
        }
      }

      for (let gx = 10; gx < width - 10; gx += 23) {
        if (!isLandXAtRow(width, gx, height - 3, horizonY, pathEndY, height, isRiverScene, landmarkId)) continue;
        const lickH = 2 + ((gx + tick) % 3);
        ctx.fillStyle = '#ac2847';
        ctx.fillRect(gx, height - 1 - lickH, 3, lickH);
        ctx.fillStyle = '#f3a833';
        ctx.fillRect(gx + 1, height - 2 - lickH, 2, lickH - 1);
        ctx.fillStyle = '#f7e26b';
        ctx.fillRect(gx + 1, height - 2 - lickH, 1, 1);
      }
    }
  }
}

import { Texture } from 'pixi.js';
import { canonicalJson } from './canonical-json.js?v=pixi_final_1';
import {
  getCharacterFrameCount,
  getCharacterFrameGrid,
  getCharacterFrameSize,
  drawCharacterGridAt
} from './character-designer.js?v=sprite32_1';
import { drawOxenAndWagonCart } from './scene-sprites.js?v=pixi_final_1';

function createCanvas(width, height, description) {
  if (typeof document === 'undefined') {
    throw new Error(`Cannot create ${description} texture without a browser document.`);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error(`Could not get a 2D canvas context for ${description} texture.`);
  }

  return { canvas, context };
}

function createTexture(canvas) {
  const texture = Texture.from(canvas);
  texture.source.scaleMode = 'nearest';
  return texture;
}

function destroyTextures(textures) {
  for (const texture of textures) {
    texture.destroy(true);
  }
}

export class PixiTextureFactory {
  constructor() {
    this.characterCache = new Map();
    this.caravanCache = new Map();
    this.destroyed = false;
  }

  getCharacterFrames(appearance, view = 'side_right', animationMode = 'walk') {
    this.assertActive();
    if (animationMode !== 'walk' && animationMode !== 'idle') {
      throw new TypeError(`Unsupported character animation mode: ${animationMode}`);
    }

    const cacheKey = canonicalJson([appearance, view, animationMode]);
    const cachedFrames = this.characterCache.get(cacheKey);
    if (cachedFrames) return cachedFrames;

    const frameCount = getCharacterFrameCount(appearance, view, animationMode);
    const frameSize = getCharacterFrameSize(appearance);
    const frames = [];
    try {
      for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
        const { canvas, context } = createCanvas(frameSize, frameSize, 'character');
        const grid = getCharacterFrameGrid(appearance, view, animationMode, frameIndex);
        drawCharacterGridAt(context, grid, 0, 0);
        frames.push(createTexture(canvas));
      }
    } catch (error) {
      destroyTextures(frames);
      throw error;
    }

    this.characterCache.set(cacheKey, frames);
    return frames;
  }

  getCaravanFrames(
    oxenYokes,
    { suppressGroundShadow = false, floatingHull = false, moving = true } = {}
  ) {
    this.assertActive();
    const cacheKey = canonicalJson([
      oxenYokes,
      suppressGroundShadow,
      floatingHull,
      moving
    ]);
    const cachedFrames = this.caravanCache.get(cacheKey);
    if (cachedFrames) return cachedFrames;

    const frameCount = moving ? 4 : 1;
    const frames = [];
    try {
      for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
        const { canvas, context } = createCanvas(74, 31, 'caravan');
        drawOxenAndWagonCart(
          context,
          2,
          26,
          frameIndex,
          moving,
          oxenYokes,
          { suppressGroundShadow, floatingHull }
        );
        frames.push(createTexture(canvas));
      }
    } catch (error) {
      destroyTextures(frames);
      throw error;
    }

    this.caravanCache.set(cacheKey, frames);
    return frames;
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;

    for (const frames of this.characterCache.values()) destroyTextures(frames);
    for (const frames of this.caravanCache.values()) destroyTextures(frames);
    this.characterCache.clear();
    this.caravanCache.clear();
  }

  assertActive() {
    if (this.destroyed) {
      throw new Error('Cannot create textures with a destroyed PixiTextureFactory.');
    }
  }
}

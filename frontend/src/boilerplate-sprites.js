const DEFAULT_SPRITE_SIZE = 32;
const SPRITE_ASSET_ROOT = new URL('../../Sprite/', import.meta.url);
const SPRITES_BY_GENDER = new Map();
let preloadPromise = null;

function assetUrl(relativePath) {
  return new URL(relativePath, SPRITE_ASSET_ROOT).href;
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load sprite image: ${url}`));
    image.src = url;
  });
}

function getTopCrownMinX(context, width, height) {
  const pixels = context.getImageData(0, 0, width, height).data;
  for (let y = 0; y < height; y += 1) {
    let minX = width;
    for (let x = 0; x < width; x += 1) {
      if (pixels[(y * width + x) * 4 + 3] > 0) {
        minX = Math.min(minX, x);
      }
    }
    if (minX < width) return minX;
  }
  return null;
}

function findGridCrownMinX(grid) {
  if (!Array.isArray(grid)) return null;
  for (let y = 0; y < grid.length; y += 1) {
    for (let x = 0; x < grid[y].length; x += 1) {
      if (grid[y][x]) return x;
    }
  }
  return null;
}

function imageToGrid(image, size, referenceCrownMinX = null) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Could not create a sprite image reader.');
  context.imageSmoothingEnabled = false;

  let sourceX = Math.floor((image.naturalWidth - size) / 2);
  const sourceY = Math.floor((image.naturalHeight - size) / 2);

  if (
    referenceCrownMinX !== null &&
    (image.naturalWidth !== size || image.naturalHeight !== size)
  ) {
    const probeCanvas = document.createElement('canvas');
    probeCanvas.width = image.naturalWidth;
    probeCanvas.height = image.naturalHeight;
    const probeContext = probeCanvas.getContext('2d', { willReadFrequently: true });
    if (probeContext) {
      probeContext.imageSmoothingEnabled = false;
      probeContext.drawImage(image, 0, 0);
      const rawCrownMinX = getTopCrownMinX(probeContext, image.naturalWidth, image.naturalHeight);
      if (rawCrownMinX !== null) {
        sourceX = Math.max(0, Math.min(image.naturalWidth - size, rawCrownMinX - referenceCrownMinX));
      }
    }
  }

  context.drawImage(image, sourceX, sourceY, size, size, 0, 0, size, size);
  const pixels = context.getImageData(0, 0, size, size).data;
  return Array.from({ length: size }, (_, y) =>
    Array.from({ length: size }, (_, x) => {
      const offset = (y * size + x) * 4;
      const alpha = pixels[offset + 3];
      if (!alpha) return null;
      if (alpha === 255) {
        const color = [pixels[offset], pixels[offset + 1], pixels[offset + 2]]
          .map((channel) => channel.toString(16).padStart(2, '0'))
          .join('');
        return `#${color}`;
      }
      return `rgba(${pixels[offset]}, ${pixels[offset + 1]}, ${pixels[offset + 2]}, ${alpha / 255})`;
    })
  );
}

async function loadSpriteSet(gender, folder) {
  const response = await fetch(assetUrl(`${folder}/metadata.json`));
  if (!response.ok) throw new Error(`Could not load ${folder}/metadata.json (${response.status}).`);
  const metadata = await response.json();
  const state = metadata.states?.[0];
  const character = state?.character;
  if (!character || !state.frames?.rotations) {
    throw new Error(`${folder}/metadata.json is missing character rotations.`);
  }

  const width = character.size?.width;
  const height = character.size?.height;
  if (width !== DEFAULT_SPRITE_SIZE || height !== DEFAULT_SPRITE_SIZE) {
    throw new Error(`${folder} must contain declared ${DEFAULT_SPRITE_SIZE}×${DEFAULT_SPRITE_SIZE} frames.`);
  }

  const rotations = new Map();
  await Promise.all(Object.entries(state.frames.rotations).map(async ([direction, path]) => {
    const image = await loadImage(assetUrl(`${folder}/${path}`));
    if (image.naturalWidth < width || image.naturalHeight < height) {
      throw new Error(`${folder}/${path} is smaller than its declared frame size.`);
    }
    rotations.set(direction.toLowerCase().replaceAll('-', ''), imageToGrid(image, width));
  }));

  const animation = Object.entries(state.frames.animations || {})
    .find(([name]) => /walk/i.test(name))?.[1];
  const loadAnimationFrames = async (paths = [], directionKey = 'east') => {
    const refCrownMinX = findGridCrownMinX(rotations.get(directionKey));
    return Promise.all(paths.map(async (path) => {
      const image = await loadImage(assetUrl(`${folder}/${path}`));
      if (image.naturalWidth < width || image.naturalHeight < height) {
        throw new Error(`${folder}/${path} is smaller than its declared frame size.`);
      }
      return imageToGrid(image, width, refCrownMinX);
    }));
  };
  const walkFrames = {
    east: await loadAnimationFrames(animation?.east, 'east'),
    south: await loadAnimationFrames(animation?.south, 'south')
  };
  const hasWalkFrames = walkFrames.east.length > 0 || walkFrames.south.length > 0;
  if (!rotations.has('south') || !rotations.has('east') || !hasWalkFrames) {
    throw new Error(`${folder} needs south/east rotations and at least one walking animation.`);
  }

  SPRITES_BY_GENDER.set(gender, { metadata: character, size: width, rotations, walkFrames });
}

export function preloadBoilerplateSprites() {
  if (!preloadPromise) {
    const spriteSets = [
      ['male', '32Man/32Man'],
      ['female', '32Man/32Woman']
    ];
    preloadPromise = Promise.all(spriteSets.map(async ([gender, folder]) => {
      try {
        await loadSpriteSet(gender, folder);
        return true;
      } catch (error) {
        console.warn(`Could not load the 32px ${gender} sprites; using the built-in character renderer for that character type.`, error);
        return false;
      }
    })).then((results) => results.some(Boolean));
  }
  return preloadPromise;
}

export function getBoilerplateSpriteMetadata(gender) {
  return SPRITES_BY_GENDER.get(gender)?.metadata || null;
}

export function getBoilerplateSpriteSize(gender) {
  return SPRITES_BY_GENDER.get(gender)?.size || null;
}

export function getBoilerplateSpriteFrameCount(gender, animationMode = 'walk') {
  const sprites = SPRITES_BY_GENDER.get(gender);
  if (!sprites) return animationMode === 'idle' ? 2 : 6;
  if (animationMode === 'idle') return 1;
  return Math.max(sprites.walkFrames.east.length, sprites.walkFrames.south.length, 1);
}

export function getBoilerplateSpriteGrid(gender, direction, animationMode = 'idle', frameIndex = 0) {
  const sprites = SPRITES_BY_GENDER.get(gender);
  if (!sprites) return null;
  const normalizedDirection = String(direction || '').toLowerCase().replaceAll('-', '');
  if (animationMode === 'walk') {
    const animationDirection = normalizedDirection === 'south' ? 'south' : 'east';
    const frames = sprites.walkFrames[animationDirection];
    if (frames.length === 0) return sprites.rotations.get(normalizedDirection) || null;
    const frame = frames[((frameIndex % frames.length) + frames.length) % frames.length];
    return normalizedDirection === 'west' ? frame.map((row) => [...row].reverse()) : frame;
  }
  return sprites.rotations.get(normalizedDirection) || null;
}

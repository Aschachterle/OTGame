const PIXI_CANVAS_IDS = new Set(['landscape-stage-canvas', 'scene-canvas']);
const mountedStages = new WeakMap();
const pendingStages = new WeakMap();
const pendingReadyCallbacks = new WeakMap();
const failedStages = new WeakSet();
const pixiEnabled = typeof window !== 'undefined'
  && new URLSearchParams(window.location.search).get('renderer') !== 'canvas2d';

export function shouldUsePixiForCanvas(sourceCanvas) {
  return Boolean(sourceCanvas && pixiEnabled && PIXI_CANVAS_IDS.has(sourceCanvas.id));
}

export function hasPixiStage(sourceCanvas) {
  return mountedStages.has(sourceCanvas);
}

export function presentCanvasWithPixi(
  sourceCanvas,
  backgroundLayers,
  scrollOffset = 0,
  onReady,
  actors = null,
  foregroundCanvas = null,
  riverLayers = null,
  weatherLayers = null
) {
  if (!shouldUsePixiForCanvas(sourceCanvas)) return;

  const mountedStage = mountedStages.get(sourceCanvas);
  if (mountedStage) {
    pendingReadyCallbacks.delete(sourceCanvas);
    mountedStage.update(backgroundLayers, scrollOffset, actors, foregroundCanvas, riverLayers, weatherLayers);
    return;
  }
  if (onReady) pendingReadyCallbacks.set(sourceCanvas, onReady);
  if (pendingStages.has(sourceCanvas) || failedStages.has(sourceCanvas)) return;

  const pendingStage = import('./pixi-stage-runtime.bundle.js?v=pixi_final_3')
    .then(({ mountPixiStage }) => mountPixiStage(sourceCanvas))
    .then((stage) => {
      if (!sourceCanvas.isConnected) {
        stage.destroy();
        return null;
      }
      mountedStages.set(sourceCanvas, stage);
      return stage;
    })
    .catch((error) => {
      failedStages.add(sourceCanvas);
      sourceCanvas.dataset.pixiError = 'true';
      console.error('PixiJS could not initialize; keeping the Canvas 2D renderer active.', error);
      return null;
    })
    .finally(() => {
      pendingStages.delete(sourceCanvas);
    });
  pendingStages.set(sourceCanvas, pendingStage);
  pendingStage.then((stage) => {
    if (!stage) return;
    const readyCallback = pendingReadyCallbacks.get(sourceCanvas);
    pendingReadyCallbacks.delete(sourceCanvas);
    if (readyCallback) {
      readyCallback();
    } else {
      stage.update(backgroundLayers, scrollOffset, actors, foregroundCanvas, riverLayers, weatherLayers);
    }
  }).catch((error) => {
    console.error('Could not refresh the scene after PixiJS mounted.', error);
  });
}

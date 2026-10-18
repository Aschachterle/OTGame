# PixiJS Graphics Migration Plan

## 1. Overview & Objectives

*Immutable Trail* currently pairs a rich Fastify/PostgreSQL/Gemini web app with a retro 320×96 canvas monitor. Right now, every frame of the landscape stage is procedurally repainted from scratch using Canvas 2D `ctx.fillRect()` loops.

This migration plan outlines how to transition the landscape monitor to **PixiJS v8** while:
1. **Preserving 100% of existing sprite assets**: Keep all custom 32×32 procedural character grids, era clothing items, oxen, covered wagons, river skeletons, and landmarks without redrawing anything.
2. **Maintaining the web architecture**: Leave the HTML/CSS retro desktop window, teletype terminal chronicle, Fastify backend, and Web Audio completely intact.
3. **Unlocking hardware acceleration**: Leverage WebGL batching, GPU-rendered movement, sprite containers, and custom shaders (CRT scanlines, wormhole void bloom, water refraction).

---

## 2. System Architecture & Scope

```
+-------------------------------------------------------------------------+
| IMMUTABLE TRAIL DESKTOP UI (HTML5 / CSS / Vanilla JS)                    |
| - Titlebar, Menu Bars, Ledger, Options, Dialogue Speech Bubbles         |
| - Teletype Streaming Chronicle (DOM Terminal)                           |
+-------------------------------------------------------------------------+
                                   |
                                   v
+-------------------------------------------------------------------------+
| LANDSCAPE STAGE MONITOR (320x96)                                         |
| [ Current: scene-renderer.js (Canvas 2D) ]                              |
|                                                                         |
| === MIGRATES TO ===>                                                    |
|                                                                         |
| [ PixiJS Application (WebGL2 / WebGPU) ]                                |
|   +-- Background Layer (TilingSprite / Parallax Containers)             |
|   +-- River Channel Layer (Procedural Depth + Caustic Shaders)          |
|   +-- Actor Layer (AnimatedSprite: Oxen, Wagon, Party, NPCs)            |
|   +-- Weather & FX Layer (Filters: CRT, Scanlines, Wormhole Glow)       |
+-------------------------------------------------------------------------+
```

### What Changes vs. What Stays
* **Unchanged**:
  * `src/index.ts`, `src/routes/*`, `src/store.ts` (Backend API, ledger crypto, database).
  * `frontend/app.js`, `frontend/src/game.js`, `frontend/src/state.js` (Turn loop, choices, audio).
  * `frontend/src/character-presets.js`, `frontend/src/character-designer.js` (Procedural 32×32 character generator).
* **Migrated**:
  * `frontend/src/scene-renderer.js`: Converts from immediate-mode Canvas 2D repainting to a PixiJS Scene Graph.
  * `frontend/src/scene-sprites.js`: Acts as the **Procedural Texture Factory** providing runtime-baked textures to PixiJS.
  * `frontend/index.html` & `frontend/scene-editor.html`: Includes PixiJS bundle/import.

---

## 3. The Texture Baking Bridge (Preserving Existing Sprites)

PixiJS can convert any HTML `<canvas>` or in-memory `OffscreenCanvas` into a hardware-accelerated `PIXI.Texture` via `Texture.from()`. Existing procedural rendering code becomes a runtime texture factory.

### A. Procedural Character Grid to Pixi Texture
```javascript
import { Texture, Sprite, AnimatedSprite } from 'pixi.js';
import { getCharacterFrameGrid } from './character-designer.js';

export function createPartyMemberSprite(memberAppearance, scale = 1) {
  // 1. Generate 4 walk animation frames using existing character-designer logic
  const frames = [0, 1, 2, 3].map((frameIdx) => {
    const grid = getCharacterFrameGrid(memberAppearance, 'side_right', 'walk', frameIdx);
    const canvas = document.createElement('canvas');
    canvas.width = 32 * scale;
    canvas.height = 32 * scale;
    const ctx = canvas.getContext('2d');
    
    // Draw using existing grid rendering
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        const color = grid[y][x];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    }
    return Texture.from(canvas);
  });

  // 2. Return an AnimatedSprite ready for the GPU
  const animatedSprite = new AnimatedSprite(frames);
  animatedSprite.animationSpeed = 0.12;
  return animatedSprite;
}
```

### B. Wagon and Oxen Team to Pixi Texture
```javascript
import { drawOxenAndWagonCart } from './scene-sprites.js';

export function createCaravanTextureAtlas(oxenYokes = 2) {
  const frames = [0, 1, 2, 3].map((frameIndex) => {
    const canvas = document.createElement('canvas');
    canvas.width = 76;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    // Call existing detailed wagon & oxen routine directly onto canvas
    drawOxenAndWagonCart(ctx, 2, 30, frameIndex, true, oxenYokes);
    return Texture.from(canvas);
  });

  return new AnimatedSprite(frames);
}
```

---

## 4. Migration Milestones

### Milestone 1: Dependency Setup & Canvas Mounting
* **Goal**: Mount PixiJS onto `#landscape-stage-canvas` while keeping current 320×96 resolution.
* **Tasks**:
  1. Add PixiJS v8 to `package.json` and export an ESM bundle for the frontend (or load via ES module CDN `https://cdn.jsdelivr.net/npm/pixi.js@8.x/dist/pixi.mjs`).
  2. Create `frontend/src/pixi-stage.js` to manage the `PIXI.Application` instance.
  3. Configure pixel-art settings:
     ```javascript
     const app = new Application();
     await app.init({
       canvas: document.getElementById('landscape-stage-canvas'),
       width: 320,
       height: 96,
       resolution: 1,
       autoDensity: false,
       roundPixels: true // Essential: locks textures to integer pixels for crisp retro art
     });
     ```
* **Compatibility bridge (implemented)**: The legacy renderer paints into a 2D canvas, which PixiJS samples as a nearest-neighbor texture and presents on a separate overlay canvas. A browser canvas cannot provide both 2D and WebGL contexts at once, so the two canvases are intentional. PixiJS is now the default after final verification; use `?renderer=canvas2d` to force the legacy view, or `?renderer=pixi` to explicitly select Pixi. Background parallax, actors, river water/remains, rain/snow particles, thunderstorm lightning, and wormhole effects are Pixi layers; bank terrain and the remaining fog/electrical/fire weather artwork still use the Canvas 2D scene layers.

### Milestone 2: Background Parallax Migration (Implemented)
* **Goal**: Replace the procedural sky and hill loops with PixiJS display objects.
* **Tasks**:
  1. Implement a `ParallaxLayer` container. **Done.**
  2. Sky bands and horizon silhouettes render to static or tiling textures (`PIXI.TilingSprite`). **Done.**
  3. In `update(state)`, shift `layer.tilePosition.x = -state.landscapeScrollX * speedFactor`. **Done.**

* **Implementation**: The existing pixel-art painter now bakes the sky, clouds, and distant horizon into cached canvases, which Pixi displays as a static sky sprite and tiled parallax layers. Clouds scroll at `0.15×` and the distant horizon at `0.3×`; the horizon texture is eight viewport widths to avoid visible tiling seams. Once Pixi mounts, the legacy renderer draws only the foreground transparently over these layers. Until then, and whenever Canvas 2D is selected, the complete legacy scene remains visible. Cache-busted module imports ensure the editor and game load the matching renderer modules.
* **Verification**: Browser checks passed in the scene editor for river, trail, prologue, store-approach, and store-interior scenes; prairie, mountain, badlands, and snow biomes with weather overlays; Pixi scene animation; and forced Canvas 2D. At that milestone, the no-query Canvas 2D default was also verified; Milestone 6 later switched the no-query default to Pixi. No browser errors were reported. `npm run build`, targeted JavaScript syntax checks, and editor diagnostics passed.

### Milestone 3: Actor Layer & Procedural Texture Factory
* **Goal**: Render the caravan and party using Pixi display objects.
* **Tasks**:
  1. Create `frontend/src/pixi-texture-factory.js` with caching to prevent re-baking textures unless appearance or equipment changes. **Done.**
  2. Instantiate the wagon/oxen team as a persistent `AnimatedSprite`. **Done.**
  3. Instantiate each party traveler as a persistent `AnimatedSprite`. **Done.**
  4. Sync positions based on `state.landscapeMoving`, `isPreTrail`, and river crossing progress. **Done.**

* **Implementation**: `PixiTextureFactory` reuses the existing character-grid and wagon painters, caches frame textures by canonical appearance/options, and sets nearest-neighbor sampling. A persistent Pixi actor container updates wagon and traveler positions, scale, appearance, and frames from the existing scene layout. The renderer splits the Pixi path into a base scene, actor layer, and foreground overlay; river waterlines/splashes, foreground weather, and speech indicators remain above actors. The Canvas 2D fallback still draws the original complete scene.
* **Verification**: Browser checks confirmed actor counts and placement in river, trail, prologue, store-approach, and store-interior scenes; all five crossing methods at near/mid/far progress; animated character/wagon frames; all four biomes and representative weather modes; and forced Canvas 2D fallback. The Pixi view loaded without browser errors. `npm run build`, targeted JavaScript syntax checks, and editor diagnostics passed.

### Milestone 4: River & Submerged Skeleton Layer
* **Goal**: Port river crossing water and riverbed cutaways. **Implemented and verified.**
* **Tasks**:
  1. Convert `drawSubmergedSkeletons` to pre-baked textures placed at depth layers. **Done.**
  2. Use a Pixi `Graphics` or `Mesh` object for the river cross-section water polygons. **Done.**
  3. Implement water color tinting and submersion using Pixi layers. **Done.**
* **Implementation**: Existing river channel and waterline painters feed a batched Canvas-like adapter that draws their established pixel geometry into Pixi `Graphics`. The channel remains transparent in the Canvas base layer so it cannot cover the Pixi water. Pixi water stays below the scene painter so the white directional current streaks remain visible; a separate foreground-soil layer extends the cutaway earth across the viewport outside the channel. Riverbed stones and remains are cached as separate background, midground, and foreground Pixi textures, rebuilt by river depth/revision; the remains count stays at one item per full 2.5 feet. A Pixi water tint layer is placed below ferry riders and above wading actors, preserving the two established submersion orders. The Canvas 2D river path is unchanged as the rollback.
* **Verification**: `npm run build`, targeted JavaScript syntax checks, and editor diagnostics passed. Browser checks confirmed the Pixi channel is transparent in the Canvas source, water reaches the horizon, the six-foot cutaway and submerged remains render, Snake River parameters render independently, and ferry mid-crossing uses the expected Pixi layer order. Forced Canvas 2D renders without Pixi; the no-query Canvas 2D default was verified before Milestone 6 switched the default. No browser errors were reported.

### Milestone 5: Weather Overlays & Post-Processing Shaders
* **Goal**: Elevate weather effects with GPU hardware acceleration. **Implemented and verified.**
* **Tasks**:
  1. **Rain & Snow**: Port particle emitters to WebGL point sprites. **Done.**
  2. **Thunderstorm & Lightning**: Full-screen flash overlay using `PIXI.Graphics` with additive blend mode. **Done.**
  3. **Wormhole Storm**: Render the 3D wireframe conical funnels with neon-green glow. **Done.**
  4. **Optional CRT Filter**: Add subtle retro scanlines across the canvas stage. **Deferred; optional.**
* **Implementation**: Rain drops, water splashes, snowflakes, and snow sparkles use a batched Pixi `ParticleContainer` with a shared nearest-neighbor pixel texture. Thunderstorm bolts and full-stage flashes use additive Pixi `Graphics`. Wormhole weather reuses the existing seeded portal layout and renders conical voids with updateable Pixi `MeshSimple` geometry, wireframes, motes, and additive halo passes. Existing storm canopies remain on the Canvas base; the Canvas painters retain all original effects when Pixi is disabled. Fog, electrical storm, and fire storm remain on the existing Canvas weather path. The optional CRT filter is deferred to avoid changing the crisp pixel-art presentation.
* **Verification**: The Pixi scene editor was exercised with no weather, fog, rain, snow, thunderstorm, electrical storm, fire storm, and wormhole storm. Rain/snow particles, a paused thunderstorm lightning strike, and wormhole funnels were visually inspected; the Pixi view reported no browser errors. Forced Canvas 2D was checked across all weather choices; the no-query editor was still Canvas 2D at this milestone and now defaults to Pixi after Milestone 6. `npm run build`, targeted JavaScript syntax checks, and editor diagnostics passed.

### Milestone 6: Scene Editor & Verification
* **Goal**: Validate scene composition and performance. **Implemented and verified.**
* **Tasks**:
  1. Update `frontend/scene-editor.html` and `scene-editor.js` to preview the PixiJS renderer. **Done.**
  2. Verify render-update performance across all biomes, river crossing methods, and weather modes. **Done.**
  3. Confirm browser speech bubble anchors (`syncCanvasSpeechBubble`) align accurately with Pixi sprite screen coordinates. **Done.**
* **Verification**: Browser checks covered river, trail travel, prologue, store approach, and store interior; all four biomes; all five crossing methods at near/middle/far progress; and all eight weather options. The Pixi editor remained mounted with the expected actors and river layer and reported no browser errors. Bubble-to-anchor placement was measured for party members during Ford/Ferry movement and the ferry operator; the largest settled offset was 0.36 CSS px. Synchronous Pixi scene-update/render submissions were benchmarked for 80 frames in snow/weather, Snake River/Ferry, and store-interior scenarios: worst observed update was 7.2 ms against a 16.7 ms 60-FPS frame budget. The no-query scene editor now mounts Pixi by default; `?renderer=canvas2d` still renders the complete single-canvas fallback. The default switch was made after these checks.

---

## 5. File Structure After Migration

```
frontend/
├── index.html                  # Main game HTML (cache-busted scripts)
├── scene-editor.html           # Developer tool for visual verification
├── styles.css                  # Retro OS window & terminal typography
└── src/
    ├── app.js                  # Entry controller
    ├── game.js                 # State dispatch & action handling
    ├── ui.js                   # Teletype chronicle & prompt handling
    ├── character-designer.js   # Procedural character grid generator (PRESERVED)
    ├── character-presets.js    # Era clothing definitions (PRESERVED)
    ├── scene-sprites.js        # Canvas drawing routines & texture baking source (PRESERVED)
    ├── pixi-texture-factory.js # NEW: Caches procedural drawings into PIXI.Texture instances
    ├── pixi-stage.js           # NEW: PIXI.Application lifecycle & scene graph containers
    └── scene-renderer.js       # REFACTORED: Maps game state to PixiJS scene graph
```

---

## 6. Rollback & Dual-Engine Strategy

To prevent gameplay disruptions during development:
1. Keep the existing `renderGameLandscapeStage` function intact as `renderGameLandscapeStageLegacy()`.
2. Add a query parameter toggle in the URL: `?renderer=pixi` vs. `?renderer=canvas2d`.
3. Keep Canvas 2D as the rollback path, and make PixiJS the default only after Milestone 6 verification passes. **Done.**

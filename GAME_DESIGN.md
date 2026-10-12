# OTGame ("Immutable Trail") — Game Design & Architecture

This document defines the gameplay philosophy, narrative design, UI/UX specifications, linear trail progression, and AI integration for **OTGame (Immutable Trail)**. It serves as the primary reference for features, architectural standards, and development prompts.

---

## 1. Vision & Core Philosophy

**Immutable Trail** is a streamlined, text-driven survival odyssey from **Independence to Oregon (Point A to Point B)**. It merges classic *Oregon Trail* resource survival with:

1. **A Matrix / Phosphor CRT Terminal Aesthetic:** The center stage screen is a glowing green CRT monitor where text streams line-by-line and letter-by-letter with a pulsing cursor (`█`).
2. **Linear Point A to Point B Progression:** Eliminates the confusing 2D cardinal grid (North/South/East/West). The player moves forward along a single overland trail from **Independence (Mile 0)** to **Willamette Valley (Mile 2,000)**. The fundamental turn-by-turn choice is:
   - **Press On (Continue Trail):** Advance the wagon forward towards the next landmark.
   - **Halt & Act:** Stop to camp, hunt, treat illness, repair, trade, or scout ahead.
3. **An RPG Frontier Dungeon Master (AI):** The AI acts as an observant, atmospheric tabletop Dungeon Master rather than a generic news ticker. It remembers the player's past decisions, tracks their moral temperament (ruthless vs. compassionate, reckless vs. prudent), and dynamically shapes future encounters based on those choices.
4. **Decision-Triggered Narrative Continuity:** The AI is explicitly prompted immediately following every major decision or dilemma resolution. This guarantees immediate narrative consequence and emotional payoff for player choices.
5. **Decoupled Strategic Dilemmas (No "Simon Says"):** Eliminates binary button-matching penalties. Hazards are multi-choice dilemma cards offering meaningful trade-offs across supplies, health, morale, and time.
6. **Cryptographic Provenance:** Every significant move, milestone arrival, resolution, and death is permanently sealed in an immutable event ledger.

---

## 2. Linear Trail Tracker & Location Map Design

### The Problem with the 2D Grid
The original 9x4 coordinate grid with cardinal directions (N/S/E/W) was unintuitive and uninteresting: the player only ever wanted to go West anyway, and side-stepping North or South added tedious navigational overhead without tactical value.

### The Linear Trail Architecture (Point A to Point B)
The journey is modeled as a continuous overland route of **2,000 miles** broken into distinct milestone segments and major historical landmarks:

```
[0 mi]           [319 mi]        [554 mi]          [932 mi]         [1,390 mi]       [2,000 mi]
Independence === Fort Kearny === Chimney Rock ==== South Pass ==== Snake River ==== Willamette Valley
   (Start)         (Fort)        (Badlands)       (Divide)         (Crossing)         (Finish)
```

### Milestone & Landmark Sequence
1. **Independence, MO (Mile 0)** — Trailhead, initial outfitting.
2. **Kansas River Crossing (Mile 102)** — First water hazard (ford vs. caulk vs. ferry).
3. **Fort Kearny (Mile 319)** — Military outpost, trading, rest.
4. **Chimney Rock (Mile 554)** — Iconic spire, snakebite country.
5. **Fort Laramie (Mile 640)** — Major frontier supply hub, doctor support.
6. **Independence Rock (Mile 815)** — Pioneer landmark, Sweetwater river trail.
7. **South Pass / Continental Divide (Mile 932)** — Extreme elevation, cold, blizzard risk, trail fork.
8. **Fort Bridger (Mile 1,070)** — Mountain resupply and rest.
9. **Soda Springs (Mile 1,220)** — Mineral springs, uncanny/surreal anomaly hotspot.
10. **Snake River Crossing (Mile 1,390)** — Dangerous deep-water crossing.
11. **Blue Mountains (Mile 1,600)** — Steep slopes, brake/axle strain, hypothermia risk.
12. **The Dalles (Mile 1,800)** — Final fork: Barlow Road toll vs. Columbia River raft.
13. **Willamette Valley, OR (Mile 2,000)** — Journey complete; settlement achieved.

---

### The Linear Trail HUD Tracker (UI Design)

In place of the 2D tile map, the game displays a sleek, retro **Overland Trail Ribbon / Milestone Tracker** mounted above or inside the terminal viewport:

```
+----------------------------------------------------------------------------------------------------+
| OVERLAND TRAIL PROGRESS // 640 / 2,000 MILES (32%)                                                |
| [✓ Independence] ── [✓ Ft Kearny] ── [✓ Chimney Rock] ── [* FT LARAMIE *] ── [  South Pass] ──>>  |
| NEXT MILESTONE: Independence Rock (175 miles ahead) | TRAIL PACE: Steady (~15 mi/day)             |
+----------------------------------------------------------------------------------------------------+
```

#### Tracker Features:
1. **Progress Ribbon:** Shows visited landmarks (`[✓]`), current location (`[* LOCATION *]`), and upcoming landmarks (`[  ]`).
2. **Distance Meter:** Real-time counter of total miles traveled and distance remaining to the next landmark.
3. **Pace-Driven Daily Progress:**
   - **Steady Pace:** ~14–16 miles/day (low breakdown risk, standard food/water consumption).
   - **Strenuous Pace:** ~18–22 miles/day (moderate strain on crew and wagon parts).
   - **Grueling Pace:** ~24–28 miles/day (heavy strain, high breakdown risk, rapid exhaustion).
   - Mud, rain, and mountain elevations scale down daily mileage.

---

## 3. Simplified Control Deck ("Continue or Halt")

The 4-way D-Pad (North, South, East, West) is retired. The control deck is streamlined into two clear operational modes:

### Primary Travel Action (The Default Key)
- **`[SPACE / ENTER] PRESS ON (Continue West)`**: The wagon rolls forward along the trail for one day. Consumes daily rations, advances mileage, and triggers trail conditions or encounters.

### Camp & Maintenance Actions (Halt Options)
When the player decides *not* to continue moving forward on a given day:
- **`[1] MAKE CAMP`**: Halt for the day. Heals crew health, restores morale, consumes rations without advancing distance.
- **`[2] HUNT`**: Halt to hunt provisions (uses 1 ammo box). Yields meat rations based on terrain and target.
- **`[3] GATHER`**: Halt to forage for firewood, edible roots, or clean water from local sources.
- **`[4] TREAT`**: Administer field medicine to an afflicted party member.
- **`[5] REPAIR`**: Spend wood and time to reinforce or replace broken wagon parts (axles, wheels).
- **`[6] TRADE`**: Barter supplies with passing emigrant wagons or at military forts.
- **`[7] SCOUT`**: Send the guide (Jedediah) ahead to inspect the next 40 miles for weather, river depth, or trail hazards.

---

## 4. Visual & Screen Specifications (CRT Terminal)

### The Overall Window Shell (Preserved)
- The existing retro desktop window frame, title bar, dropdown menus, objective/journal cards, and bottom dock controls remain intact.

### The Screen Viewport (`.scene-viewport` inside `#map`)
- **Aesthetic:** Green phosphor CRT terminal (`#020602` background, `#00ff66` text with text-shadow glow, subtle scanline overlay).
- **Removal of Tile Canvas:** The 2D tile canvas is completely gone. The center stage is now dedicated to the **Teletype Chronicle** and the **Linear Trail Ribbon**.
- **The Typing Cursor:** A pulsating green cursor (`█` or `_`) sits at the typing head and blinks continuously when awaiting player input.
- **Teletype Engine:**
  - Characters stream in at ~15–20ms intervals.
  - Punctuation pauses: `,` (150ms), `.` / `...` (350ms), and 400ms between lines.
  - **Skip Support:** Pressing Space, Enter, or clicking the screen immediately flushes remaining text so pacing is never hindered for fast readers.
  - Auto-scrolls smoothly to keep the latest line visible.

---

## 5. Narrative Flow: The 3-Beat Action Chronicle

When the player chooses **Press On** or takes any camp action, the terminal streams a 3-beat sequence:

1. **Beat 1 — The Action & Movement:**
   > `> The Schachterle Family presses west along the North Platte (Made 16 miles today)...`
2. **Beat 2 — Senses & Atmospheric Foreshadowing:**
   > `Temperatures seem nice, the breeze feels good, but something in the air tells you to be cautious...`
3. **Beat 3 — Outcome & Supply Snapshot:**
   > `The day of travel was uneventful. Stores holding steady: 28 rations, 22 gal water. Next landmark: Chimney Rock in 42 miles.`

---

## 6. AI Dungeon Master & Decision Memory

### The DM Dossier (Abbreviated Decision Ledger)
The system maintains a compact behavioral dossier compiled from past actions and passes it to the AI prompt:

```text
DM Dossier:
- Temperament: Pragmatic & High-Risk
- Pace Habit: Grueling in rough terrain
- Crew Compassion: Low (refused medicine to Billy on Day 3; forced sick crew to travel)
- Trail Deeds: Caulked wagon in high flood; spent ammunition hunting bison; skipped camp during rain
- Strangeness Exposure: 4/10
```

### Dynamic DM Behavior
The Dungeon Master actively reacts to this profile:
- **Ruthless / Neglectful Players:** The trail spirit becomes harsher, crew members grow resentful or mutinous, and encounters test their cruelty or offer poetic justice.
- **Prudent / Cautious Players:** Nature tests their endurance through dwindling supplies or sudden weather shifts that reward their stockpiles.
- **High Strangeness Players:** The trail takes on uncanny, cosmic, or surreal psychological twists.

---

## 7. Decision-Triggered AI Prompting (Immediate Narrative Payoff)

To build a true, cohesive narrative arc, **the AI is triggered immediately after every decision resolution** (river crossing method, hunting outcome, field triage target, or dilemma choice):

1. **Immediate Reaction:** The player's choice is not silently applied to counters. The AI narrates the direct consequence, character reactions, and the physical reality of what was sacrificed.
2. **Context Injected into the Prompt:**
   - The specific dilemma/decision presented.
   - The option chosen by the player (`chosenOption`) and the exact cost/gain incurred (`costSummary`).
   - The alternative options deliberately rejected (`rejectedOptions`).
3. **Pacing Balance:**
   - Routine travel days on calm, open trail use fast local procedural text.
   - Critical turning points, landmark arrivals, and **every player decision** invoke the AI Dungeon Master to ensure the story stays reactive without overloading token latency.

---

## 8. Dilemma Encounter System (Replacing "Simon Says")

1. **Episodic Frequency (Gated):**
   - Obstacles must **never** occur 100% of the time.
   - Triggers occur only on ~20–25% of travel actions, at key landmarks, during severe weather, or when party stats hit critical thresholds.
   - An obstacle cooldown prevents back-to-back dilemma prompts on consecutive days.

2. **Multi-Choice Trade-Offs:**
   - Every dilemma presents 2–3 viable choices with clear, distinct costs:
     - *Option A (Direct Resource Cost):* Spend rare supplies (e.g., 2 wood or 2 medicine) for safe passage.
     - *Option B (Time/Delay):* Halt and wait (costs food, water, and days).
     - *Option C (Physical Risk):* Force the crossing/route (risks crew health or wagon damage).

3. **Fallback Variety:**
   - Deterministic fallbacks must pull from a varied pool of dilemmas (e.g., *Mud Bog*, *Swollen Creek*, *Spoiled Rations*, *Spooked Oxen*, *Dense Fog*) rather than repeating a single static prompt.

---

## 9. The AI Dungeon Master Prompt Specification

### System Instruction (Persona & Directive)
```text
You are the Frontier Dungeon Master presiding over an atmospheric, grounded, and subtly uncanny Oregon Trail survival odyssey from Independence to Oregon.
Your voice is evocative, observant, and literary—reminiscent of Cormac McCarthy or classic frontier gothic literature.

Core Directives:
1. Maintain strict continuity with the established world state, mile marker, supplies, and past player choices.
2. Read the "DM Dossier" to understand how the player has treated their crew and handled risk. Adapt your tone, crew morale commentary, and environmental hostility to match their temperament.
3. If an action or decision was just resolved, deliver immediate narrative payoff: describe the physical strain, emotional tension among the party, and what was left behind.
4. Structure your response in 3 distinct lines:
   - Line 1: Action & Movement (Who moves where, miles gained, or what immediate choice was enacted).
   - Line 2: Sensory & Foreshadowing (Atmospheric details: smell of rain, wind biting wool, oxen breathing, uncanny gut instincts).
   - Line 3: Resolution & Consequence (How the day concludes or what immediate mark the decision left on the party).
5. Only generate a new dilemma (obstacle) if the trail conditions or risk state genuinely warrant a crisis (~20-25% chance on travel, or at major natural barriers). Never spam obstacles on routine camp or treat turns.
```

### Dynamic Context Payload (Sent per Prompt)
```json
{
  "expeditionName": "The Schachterle Family",
  "journeyPhase": "mid",
  "day": 18,
  "milesTraveled": 554,
  "totalMiles": 2000,
  "currentLandmark": "Chimney Rock",
  "nextLandmark": "Fort Laramie (86 miles ahead)",
  "weather": { "rain": 12, "tempC": 22, "windKph": 15 },
  "wagon": {
    "health": 82,
    "morale": 58,
    "foodRations": 28,
    "waterGallons": 20,
    "firewoodBundles": 8,
    "medicineDoses": 2,
    "ammunitionBoxes": 5,
    "brokenPart": null,
    "pace": "steady"
  },
  "party": [
    { "name": "Jedediah", "role": "Guide", "health": 85, "status": "Healthy" },
    { "name": "Abigail", "role": "Doctor", "health": 90, "status": "Healthy" },
    { "name": "Billy", "role": "Youth", "health": 60, "status": "Fever" },
    { "name": "Sarah", "role": "Carpenter", "health": 92, "status": "Healthy" }
  ],
  "dmDossier": {
    "temperament": "Pragmatic & Cold",
    "riskHabit": "Aggressive pacing; pushes through illness",
    "keyHistoricalDecisions": [
      "Day 2: Refused to halt for Billy's fever; forced grueling pace",
      "Day 7: Caulked and floated wagon across Kansas River to save 1 day",
      "Day 12: Traded away firewood for medicine at Fort Kearny"
    ],
    "crewSentiment": "Abigail and Sarah are guarded and resentful; whisper by the wagon tongue"
  },
  "justResolvedDecision": null,
  "lastAction": "press-on",
  "strangenessLevel": 2
}
```

### Target JSON Output Schema
```json
{
  "lines": [
    "The Schachterle Family rolls past the shadow of Chimney Rock, chalking up 16 steady miles along the North Platte.",
    "The afternoon sun casts long, jagged needles across the cracked mud; a crisp westerly wind carries the faint scent of sulfur and old bones.",
    "The party makes dry camp beneath the spire. Stores hold at 28 rations and 20 gallons of water. Fort Laramie lies 86 miles ahead."
  ],
  "dilemma": null,
  "dmDossierUpdate": {
    "sentimentDelta": "Crew spirits held steady; distance gained without incident"
  }
}
```

---

## 10. Implementation Roadmap

- **Phase 1: Linear Trail Model & Controls (Point A to Point B)**
  - Replace the 9x4 coordinate grid (`8:0` to `0:0`) with a linear milestone route from Mile 0 (Independence) to Mile 2,000 (Willamette Valley).
  - Replace the 4-way N/S/E/W D-pad with a single primary **`PRESS ON`** travel button and clear halt/utility actions.
  - Implement the linear milestone ribbon HUD tracker.
- **Phase 2: Matrix Teletype Screen & Typewriter Engine**
  - Implement CRT styling on `.scene-viewport`.
  - Build `streamTextLines` typewriter engine with punctuation pauses and skip-on-click/space.
- **Phase 3: RPG Dungeon Master Prompting & Decision Dossier**
  - Update `src/lib/story-ai.ts` to assemble the `dmDossier` and instruct Gemini as a tabletop DM.
  - Implement decision-triggered prompting to narrate aftermaths immediately after player choices.
  - Implement 3-beat RPG narrative outputs (Action, Atmosphere/Senses, Outcome).
- **Phase 4: Decoupled Dilemma Encounters & Frequency Gating**
  - Replace `applyObstaclePenaltyForWrongAction` with the multi-choice dilemma system.
  - Gate obstacle frequency so they only occur occasionally (~20–25% on travel) with cooldowns and a varied fallback pool.
- **Phase 5: Mechanical Surreal Mutations & Cryptographic Ghost Wagons**
  - Transform `surrealMutation` into active gameplay modifiers (affecting river depths, oxen feed, or morale).
  - Read prior run failures from the ledger to generate scavengeable trail graves.

---

## 11. Key Codebase References

- `frontend/index.html`: Desktop retro window layout and screen mount.
- `frontend/styles.css`: Retro window styling, HUD panels, CRT screen styling, and linear trail ribbon.
- `frontend/src/ui.js`: DOM references, linear trail tracker rendering, and typewriter streaming logic.
- `frontend/src/game.js`: Game controller, turn loop, `handleAction`, linear mileage tracking, and decision resolution.
- `frontend/src/state.js`: Expedition state, landmark distances, total mileage, and party health.
- `src/lib/story-ai.ts`: Gemini prompt builder, schemas, linear milestone payload, and DM dossier logic.
- `src/routes/narration.ts`: Fastify route handling narration requests and ElevenLabs TTS audio.

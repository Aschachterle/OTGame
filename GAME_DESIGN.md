# OTGame ("Immutable Trail") — Game Design & Architecture

This document defines the gameplay philosophy, narrative design, UI/UX specifications, linear trail progression, outfitting economy, surreal reality distortion engine, and AI integration for **OTGame (Immutable Trail)**. It serves as the primary reference for features, architectural standards, and development prompts.

---

## 1. Vision & Core Philosophy

**Immutable Trail** is a streamlined, text-driven survival odyssey from **Independence to Oregon (Point A to Point B)**. It merges classic *Oregon Trail* resource survival with:

1. **A Matrix / Phosphor CRT Terminal Aesthetic:** The center stage screen is a glowing green CRT monitor where text streams line-by-line and letter-by-letter with a pulsing cursor (`█`).
2. **Prologue Setup & Outfitting Stage:** Before embarking, the player names their family/expedition, customizes each of the 4 party members' first names, and freely assigns archetypes/specialties to each traveler (with free-form stacking support). They then visit the Independence General Store to pack their prairie schooner under strict cash budget and payload weight constraints.
3. **Linear Point A to Point B Progression:** Eliminates the confusing 2D cardinal grid (North/South/East/West). The player moves forward along a single overland trail from **Independence (Mile 0)** to **Willamette Valley (Mile 2,000)**. The fundamental turn-by-turn choice is:
   - **Press On (Continue Trail):** Advance the wagon forward towards the next landmark.
   - **Halt & Act:** Stop to camp, hunt, gather firewood/water, treat illness, repair, trade, or scout ahead.
4. **An RPG Frontier Dungeon Master (AI):** The AI acts as an observant, atmospheric tabletop Dungeon Master rather than a generic news ticker. It remembers the player's past decisions, tracks their moral temperament (ruthless vs. compassionate, reckless vs. prudent), and dynamically shapes future encounters based on those choices.
5. **The AI-Driven Twilight Zone & 4th-Wall Rupture:** Unlike traditional scripted games with static event tables, uncanny and surreal occurrences are **100% dynamically authored by AI prompting**. As trail strangeness escalates, reality warps in completely unscripted ways, culminating in the simulation waking up, recognizing the player sitting behind the keyboard, and attempting to communicate directly through the green phosphor CRT.
6. **Decision-Triggered Narrative Continuity:** The AI is explicitly prompted immediately following every major decision or dilemma resolution. This guarantees immediate narrative consequence and emotional payoff for player choices.
7. **Decoupled Strategic Dilemmas (No "Simon Says"):** Eliminates binary button-matching penalties. Hazards are multi-choice dilemma cards offering meaningful trade-offs across supplies, health, morale, and time.
8. **Cryptographic Provenance:** Every significant move, milestone arrival, resolution, and death is permanently sealed in an immutable event ledger.

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
1. **Independence, MO (Mile 0)** — Trailhead, party registration, and general store outfitting.
2. **Kansas River Crossing (Mile 102)** — First water hazard (ford vs. caulk vs. paid ferry).
3. **Fort Kearny (Mile 319)** — Military outpost, trading, rest, doctor assistance.
4. **Chimney Rock (Mile 554)** — Iconic spire, badlands, snakebite country.
5. **Fort Laramie (Mile 640)** — Major frontier supply hub, blacksmith, resupply.
6. **Independence Rock (Mile 815)** — Pioneer landmark, Sweetwater river trail.
7. **South Pass / Continental Divide (Mile 932)** — Extreme elevation, cold, blizzard risk, trail fork.
8. **Fort Bridger (Mile 1,070)** — Mountain resupply and rest.
9. **Soda Springs (Mile 1,220)** — Mineral springs, uncanny/surreal anomaly hotspot.
10. **Snake River Crossing (Mile 1,390)** — Dangerous deep-water crossing; Indian guide option.
11. **Blue Mountains (Mile 1,600)** — Steep slopes, brake/axle strain, hypothermia risk.
12. **The Dalles (Mile 1,800)** — Final fork: Barlow Road toll ($10) vs. Columbia River raft.
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

## 3. Expedition Setup: Party Naming, Archetype Customization & Outfitting

Before setting wheel to the overland trail at Independence (Mile 0), the game begins with a two-stage interactive prologue:

### Stage 1: Party Naming & Archetype Customization
1. **Family / Expedition Surname:**
   - The player selects the expedition last name (Default: *"The Schachterle Family"*, with player prompt to customize).
   - Displayed across trail dispatches, ledger records, grave markers, and milestone chronicles (e.g., `> The Schachterle Family presses west along the North Platte...`).

2. **Roster Composition & Free-Form Archetype Stacking:**
   - The party consists of 4 traveler slots.
   - For **each** traveler, the player customizes their **First Name** and selects their **Archetype / Specialty**.
   - **Free-Form Stacking Permitted (Option B):** The player is not restricted to one of each role. Any combination is valid, allowing specialized builds (e.g., running 2 Doctors for unmatched medical resilience, or 2 Guides for supreme hunting self-sufficiency, at the trade-off of lacking wagon maintenance or financial buffers).

3. **Archetype Catalog & Mechanical Benefits:**

| Archetype | Default Name | Mechanical & Strategic Benefits | Stacking Synergy (x2) |
| :--- | :--- | :--- | :--- |
| **Guide / Scout** | *Jedediah* | **+10% hunting accuracy**, **+3 meat yield**, **+2 forage bonus**, and trail scouting reconnaissance (`[7] SCOUT`). Enables lean food outfitting. | **+20% hunting accuracy**, **+6 meat yield**, **+4 forage bonus**. Wagon rarely needs to buy food sacks. |
| **Doctor / Healer** | *Abigail* | **+4 party HP recovery** on camp rest, **every 2nd medicine dose free**, **+5 HP per triage dose**. Survives epidemics and cuts medical costs. | **+8 party HP recovery** on rest; **all treatments consume 0 medicine**; **+10 HP per triage dose**. |
| **Carpenter / Wheelwright** | *Sarah* | **-5% breakdown chance**, **halved wood repair costs** (1 bundle instead of 2), **+18% oxen fatigue cleared** on camp rest. Enables aggressive Strenuous pacing. | **-10% breakdown chance**; **repairs require 0 wood** (emergency field splints); **+24% oxen fatigue cleared**. |
| **Farmer / Cook** | *Caleb* | **-20% daily food consumption** across the entire party; oxen lose fatigue 25% slower on trail. Excellent for long stretches between hunting grounds. | **-35% daily food consumption**; oxen endurance doubled across badlands and mountains. |
| **Banker / Merchant** | *Martha* | **+$250 starting cash bonus** ($1,050–$1,250 total); **immune to fort store price markups** (buys at 1.0x base Independence price). | **+$500 starting cash bonus**; fort store prices discounted to 0.8x base catalog. |
| **Youth / Dependent** | *Billy* | **Absorbs 65% of snakebites and random hazards** to protect specialists; **+10 baseline morale floor**; unlocks high-compassion AI Dungeon Master triggers. | **Absorbs 90% of sudden hazard damage**; **+20 baseline morale floor**. |

4. **Living Requirement Rule:**
   - Archetype bonuses are active only while that specific member is alive (`health > 0`). If a character dies, their passive bonus is permanently lost.

---

### Stage 2: Independence General Store & Wagon Outfitting
Once the party and archetypes are registered, the player enters the **Independence General Store (May 1848)** run by the frontier merchant.

#### 1. Starting Budget & Financial Economy
- **Base Starting Cash:** **$800.00 – $1,000.00** in gold coin/banknotes (modified upward by Banker archetypes).
- **The Cash Conservation Dilemma:** Cash is not merely spent at Mile 0; unspent funds remain in `wagon.cash` for crucial expenses down the trail:
  - **River Ferries:** Kansas River ($5.00), Green River ($8.00), Snake River ($10.00) avoid dangerous capsizing risks.
  - **Toll Roads:** Barlow Road ($10.00) around Mt. Hood vs. perilous Columbia River rafting.
  - **Fort Outposts:** Resupplying at Fort Kearny, Fort Laramie, or Fort Bridger (prices increase by 2x to 3x base store cost unless party has a Banker).
  - **Native Guides:** Paying local Shoshone or Pawnee guides to negotiate treacherous river crossings or locate potable desert water.

#### 2. Store Catalog & Packing Specifications
The store provides essential provisions with distinct costs, unit weights, and mechanical utilities:

| Item | Unit Size / Bundle | Cost ($) | Weight (lbs) | Mechanical & Narrative Utility |
| :--- | :--- | :--- | :--- | :--- |
| **Draft Oxen** | 1 Yoke (2 Oxen) | $40.00 / yoke | 1,000 lbs (draft) | Minimum 2 yoke (4 oxen) required to pull a loaded prairie schooner; 3 yoke recommended for mountain grades. Loss of oxen slows pace or strands wagon. |
| **Food Rations** | 25 lb Sack (Flour, Bacon, Beans) | $5.00 / sack ($0.20/ration) | 25 lbs | Sustains 4 travelers. Standard consumption: 8–12 lbs/day depending on rationing policy (Meager, Normal, Filling). Starvation drops health and morale rapidly. |
| **Fresh Water** | 10 Gallon Cask | $2.00 / cask ($0.20/gal) | 80 lbs (full) | Essential across arid stretches (Platte Badlands, Great Basin). Dehydration inflicts heatstroke and fatal dysentery. |
| **Firewood** | 1 Bundle (10 logs) | $2.00 / bundle ($0.20/log) | 30 lbs | Critical for campfires, boiling river water, keeping warm during freezing mountain nights (preventing hypothermia/pneumonia), and timber for Carpenter wagon repairs. |
| **Ammunition** | 1 Box (20 paper cartridges) | $2.00 / box | 3 lbs | Required for hunting big game (bison, antelope, deer) and defense during rare hostile encounters. |
| **Medical Supplies** | 1 Medical Kit (4 doses laudanum/quinine/carbolic) | $8.00 / kit ($2.00/dose) | 2 lbs | Required by the Doctor to treat cholera, typhoid, mountain fever, gangrene, and snakebites. |
| **Spare Wagon Parts** | Axle ($10.00), Wheel ($12.00), Tongue ($8.00) | $8.00–$12.00 / part | 40–50 lbs each | Replaces broken structural running gear after boulder collisions, mountain descents, or axle snaps. Without spares or wood, the wagon is halted. |
| **Warm Clothing / Bedding** | 1 Set (Wool blankets & coats) | $10.00 / set | 15 lbs | Protects against cold snaps, rainstorms, and blizzards in the Rocky and Blue Mountains. Reduces daily health decay. |

#### 3. Wagon Payload Capacity & Weight Physics
- **Maximum Wagon Capacity:** **2,400 lbs** gross cargo capacity (excluding draft oxen pulling weight).
- **Weight Thresholds & Penalties:**
  - **Light (< 1,400 lbs):** Faster travel speed (+2 mi/day), minimal breakdown risk, lower oxen exhaustion.
  - **Nominal (1,400 – 2,100 lbs):** Standard travel pace (~15 mi/day) and standard oxen endurance.
  - **Heavy / Overburdened (2,100 – 2,400 lbs):** -2 to -4 mi/day pace penalty, heightened axle wear, and rapid oxen fatigue.
  - **Overloaded (> 2,400 lbs):** Storekeeper refuses departure until cargo is within safe limits; on the trail, forces dumping cargo or suffers catastrophic wagon breakdowns.

#### 4. Setup & Store CRT Terminal Interface (UI Flow)
The setup and outfitting stages are rendered directly inside the retro CRT phosphor green terminal:

1. **Screen 1 — Expedition Register & Archetype Selection:**
   ```text
   =============================================================================
   IMMUTABLE TRAIL // EXPEDITION REGISTRATION — INDEPENDENCE, MISSOURI (1848)
   =============================================================================
   [EXPEDITION SURNAME]: The Schachterle Family
   
   PARTY ROSTER & ARCHETYPES (Free-form selection — Stacking permitted):
     MEMBER 1: Name: [Jedediah  ]  Archetype: [< GUIDE / SCOUT       >]
     MEMBER 2: Name: [Abigail   ]  Archetype: [< DOCTOR / HEALER     >]
     MEMBER 3: Name: [Sarah     ]  Archetype: [< CARPENTER / CRAFT   >]
     MEMBER 4: Name: [Billy     ]  Archetype: [< YOUTH / DEPENDENT   >]
   
   [TAB] Cycle Fields  |  [←/→] Toggle Archetype  |  [ENTER] Confirm & Enter Store
   =============================================================================
   ```

2. **Screen 2 — General Store Outfitting & Cargo Manifest:**
   ```text
   =============================================================================
   INDEPENDENCE GENERAL STORE // MATT'S OUTFITTING POST
   =============================================================================
   FUNDS AVAILABLE: $840.00 / $1,000.00         CARGO LOAD: 1,680 / 2,400 LBS
   -----------------------------------------------------------------------------
   ITEM                 UNIT PRICE   WEIGHT     QTY IN CART    TOTAL COST
   [1] YOKE OF OXEN     $40.00/yoke  -- (draft)   3 yoke        $120.00
   [2] FOOD SACKS (25#) $5.00/sack   25 lbs      16 sacks (400#)$80.00
   [3] WATER CASKS      $2.00/cask   80 lbs       4 casks       $8.00
   [4] FIREWOOD BUNDLES $2.00/bundle 30 lbs       6 bundles     $12.00
   [5] AMMO BOXES (20)  $2.00/box    3 lbs        8 boxes       $16.00
   [6] MEDICAL KITS     $8.00/kit    2 lbs        3 kits        $24.00
   [7] SPARE AXLES      $10.00/each  45 lbs       1 axle        $10.00
   [8] SPARE WHEELS     $12.00/each  50 lbs       2 wheels      $24.00
   [9] SPARE TONGUES    $8.00/each   40 lbs       1 tongue      $8.00
   -----------------------------------------------------------------------------
   [+/-] Adjust Quantity | [R] Recommend Standard Outfit | [SPACE] Purchase & Embark
   =============================================================================
   ```

---

### Stage 3: Prologue Genesis & Starting Weirdness Dice Roll

Immediately following wagon outfitting at the Independence General Store, the game initiates the **Prologue Genesis**. Before the wagon takes its first turn on the trail, the engine rolls the dice on the **Weirdness Meter (`strangenessLevel`)**, establishing the baseline reality of the entire playthrough from the very first line of prose.

#### 1. The Starting Weirdness Roll (1d10 / Weighted Seed)
When the player clicks **`[SPACE] Purchase & Embark`**, the system rolls for initial `strangenessLevel` (or Gemini rolls and returns it in the genesis payload):

| Starting Roll | Reality Tier | Prologue Narrative Flavor & Origin Backstory |
| :--- | :--- | :--- |
| **0 – 2 (Common)** | **Historical Realism** | **Gritty Historical Necessity:** Foreclosed Missouri homesteads, blighted corn, cholera outbreaks in St. Louis, debt collectors, or the promise of fertile Oregon loam. Strict Cormac McCarthy frontier grit. |
| **3 – 5 (Uncommon)** | **The Uncanny Frontier** | **Eerie Omens & Compulsions:** Cattle refusing to drink local well water; town clocks stopping at the exact same hour; all four travelers sharing the same vivid dream compelling them to head west into the sunset. |
| **6 – 8 (Rare)** | **The Twilight Zone** | **Spatial & Temporal Distortions:** The family fleeing an eastern township that neighboring county maps claim never existed; finding goods in the wagon stamped with future dates; shadows stretching toward the morning sun. |
| **9 – 10 (Critical Anomaly)** | **Fourth-Wall Rupture** | **The Awakening of the Simulation:** The party awakens inside a canvas box with vague, haunting memories of an *Operator* choosing their names and professions on a glowing glass screen. Whispers of clacking keys echo in the wind. |

The resulting number initializes `state.strangenessLevel`, establishing the foundation for all future AI Dungeon Master prompts.

#### 2. Prologue Genesis Context Payload (Sent to Gemini)
```json
{
  "promptType": "prologue-genesis",
  "expeditionName": "The Schachterle Family",
  "startingStrangenessRoll": 4,
  "party": [
    { "name": "Jedediah", "role": "Guide" },
    { "name": "Abigail", "role": "Doctor" },
    { "name": "Sarah", "role": "Carpenter" },
    { "name": "Billy", "role": "Youth" }
  ],
  "outfittingSummary": {
    "cashReserved": 160.00,
    "cargoWeightLbs": 1680,
    "oxenYokes": 3,
    "notableSupplies": "16 sacks flour, 3 medical kits, 8 boxes ammunition"
  }
}
```

#### 3. Output Schema & Teletype Presentation
```json
{
  "startingStrangenessLevel": 4,
  "headline": "The Departure from Independence",
  "prologueParagraphs": [
    "The auctioneer took the farm at third call, but it was not the bank that drove the Schachterle family from Boone County—it was the well water that turned bitter the night the birds stopped singing.",
    "Abigail packed the carbolic bottles in sheep’s wool while Sarah drawknifed the axle linchpins smooth by the yellow light of an oil lantern. Jedediah watched the river road fill with canvas schooners, noting that every draft horse in Independence seemed to shy away from the western horizon.",
    "With sixteen sacks of coarse meal and three yoke of sullen oxen, they turn their faces from the states. Ahead lie two thousand miles of unbroken grass, and a quiet in the wind that feels far too deliberate."
  ]
}
```

#### 4. CRT Presentation & Transition
1. The General Store modal clears.
2. The green phosphor CRT streams the prologue paragraphs using typewriter pauses (`Character: 12ms`, `Line: 250ms`).
3. The starting Weirdness Meter is calibrated in the cockpit status bar.
4. A pulsing prompt appears at the bottom:
   `[SPACE / ENTER] ROLL OUT ONTO THE OVERLAND TRAIL >>`
5. Pressing Space transitions directly to **Day 1 at Mile 0** (the Kansas River crossing stretch).

---

## 4. Simplified Control Deck ("Continue or Halt")

The 4-way D-Pad (North, South, East, West) is retired. The control deck is streamlined into two clear operational modes:

### Primary Travel Action (The Default Key)
- **`[SPACE / ENTER] PRESS ON (Continue West)`**: The wagon rolls forward along the trail for one day. Consumes daily rations, advances mileage, and triggers trail conditions or encounters.

### Camp & Maintenance Actions (Halt Options)
When the player decides *not* to continue moving forward on a given day:
- **`[1] MAKE CAMP`**: Halt for the day. Heals crew health (boosted by Doctor), restores morale, consumes rations without advancing distance.
- **`[2] HUNT`**: Halt to hunt provisions (uses 1 ammo box). Yields meat rations based on terrain and marksman success (boosted by Guide).
- **`[3] GATHER`**: Halt to forage for firewood, clean water, or wild food from local surroundings (sub-menu allows choosing *Chop Firewood*, *Haul Water*, or *Forage Food*, with Guide granting wild food bonuses).
- **`[4] TREAT`**: Administer field medicine to an afflicted party member (guided by Doctor efficiency).
- **`[5] REPAIR`**: Spend wood and time to reinforce or replace broken wagon parts (axles, wheels, tongues), with Carpenter reducing wood costs.
- **`[6] TRADE`**: Barter supplies with passing emigrant wagons or at military forts (Banker improves terms and waives markups).
- **`[7] SCOUT`**: Send a Guide ahead to inspect the next 40 miles for weather, river depth, or trail hazards.

---

## 5. Visual & Screen Specifications (CRT Terminal & Unified Cockpit)

### The Overall Window Shell (Preserved)
- The retro desktop window frame, title bar, dropdown menus, objective/journal cards, and bottom dock controls remain intact.

### The Unified Cockpit Display
- **Consolidated Information Hub:** All essential game readouts—Dispatch Chronicle, Overland Trail Milestone Ribbon, Wagon & Supply Gauges, Party Vitals, and Contextual Action Prompts—are integrated directly into the phosphor green CRT screen.
- **Aesthetic:** Green phosphor CRT terminal (`#020602` background, `#00ff66` text with text-shadow glow, subtle scanline overlay).
- **The Typing Cursor:** A pulsating green cursor (`█` or `_`) sits at the typing head and blinks continuously when awaiting player input.
- **Teletype Engine:**
  - Characters stream in at ~15–20ms intervals.
  - Punctuation pauses: `,` (150ms), `.` / `...` (350ms), and 400ms between lines.
  - **Skip Support:** Pressing Space, Enter, or clicking the screen immediately flushes remaining text so pacing is never hindered for fast readers.
  - Auto-scrolls smoothly to keep the latest line visible.

### The Two-Phase Turn Flow
The game stays in one unified cockpit; the main view changes its chronicle content between the results and dispatch phases. No separate screen, modal, or layout is opened.

#### Phase 1 — Move Results
Immediately after an action or dilemma resolves, the chronicle switches to:

1. The resolved action, who was involved, and exact stat and supply deltas.
2. No new story beat or dilemma prompt until the player continues.
3. A **Continue** control in the main action dock; **Space** and **Enter** work as shortcuts.

The surrounding cockpit remains visible, including the HUD, trail ribbon, wagon gauges, party roster, waypoint survey, stores, and action deck. Actions and pace/ration inputs remain visible but are disabled until Continue; the primary travel control becomes Continue.

```text
=============================================================================
=== MOVE RESULTS // DAY 12 ==================================================
=============================================================================
> Send a scout ahead resolved the dilemma.
> Jedediah felt out the road through the fog while the wagon waited.

[STAT -] CREW HEALTH -2
[STAT -] PARTY MORALE -1

-----------------------------------------------------------------------------
[SPACE / ENTER] CONTINUE >>
=============================================================================
```

#### Phase 2 — Trail Dispatch & Next Steps
After the player continues, the chronicle view changes to show:

1. A fresh atmospheric story beat about the current landscape, weather, sensory details, character presence, or uncanny anomalies.
2. Current mileage, distance to the next landmark, and current stores.
3. The available action deck or active dilemma choices.

The cockpit layout does not change. The story beat must not recap or paraphrase the action, participants, chosen response, outcome, gains, losses, or stat changes just shown in Phase 1.

```text
=============================================================================
=== DAY 12 // NORTH PLATTE // BADLANDS // MILE 570 OF 2,000 ================
=============================================================================
> No storm threatens the wagon today; the quiet itself feels watchful.
> A sharp westerly wind carries the faint scent of alkaline dust off the bluffs.
> Abigail watches the canvas ties while the light fades across the plain.

Waypoint: Independence Rock (245 miles ahead)
Stores: 378 rations • 72 gal water • 6 wood • 12 medicine • 8 ammo

-----------------------------------------------------------------------------
[SPACE] PRESS ON  |  [1] CAMP  |  [2] HUNT  |  [3] GATHER  |  [4] TREAT
=============================================================================
```

---

## 6. Narrative Flow: Separation of Concerns

1. **Move Results (Phase 1)** answers *What just happened?* It names the action and participants, then gives exact changes.
2. **Story Dispatch (Phase 2)** answers *Where are we, and what does the frontier feel like?* It never repeats the move summary.
3. **Control Deck (Phase 2)** answers *What can I do next?* Waypoints, stores, and choices live here rather than in story prose.

### Character Causality in Narrative
Every party member's health and chosen archetype actively shapes trail events:
- If a **Guide** is exhausted or sick, scouting reports become vague and hunting yield drops.
- If a **Doctor** is incapacitated, fever treatments require full medicine doses and have higher failure rates.
- If a **Carpenter** is injured, wagon repairs consume extra firewood and time.
- If a **Youth** falls ill, camp discussions reflect anxiety and moral friction.

---

## 7. AI Dungeon Master & Decision Memory

### The DM Dossier (Abbreviated Decision Ledger)
The system maintains a compact behavioral dossier compiled from past actions and passes it to the AI prompt:

```text
DM Dossier:
- Family / Expedition: The Schachterle Family
- Party Roster: Jedediah (Guide), Abigail (Doctor), Sarah (Carpenter), Billy (Youth)
- Outfitting Profile: Well-stocked with provisions; retained $160 reserve cash
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

## 8. The AI-Driven Twilight Zone: Unscripted Strangeness, Reality Bending & Fourth-Wall Ruptures

Rather than relying on static tables of pre-scripted paranormal events, **all surreal encounters and fourth-wall breaches are 100% dynamically authored by AI prompting (Gemini)**. Every single playthrough encounters completely distinct, improvisational weirdness tailored to the expedition's state and moral history.

### 1. The Ontological Decay Scale (Strangeness Level 0–10)
As the game progresses and the expedition makes uncanny decisions, the `strangenessLevel` rises. The AI Dungeon Master dynamically shifts its reality model across four distinct tiers:

* **Level 0–2 (Historical Realism):**
  - Gritty, grounded, historical frontier survival reminiscent of Cormac McCarthy.
  - The physical world obeys classical physics; dangers are mud, cholera, swollen rivers, and winter storms.
* **Level 3–5 (The Uncanny / Lynchian Frontier):**
  - Subtle natural anomalies and unsettling coincidences.
  - The AI invents eerie occurrences: animals that stand motionless facing west; rivers whose current ripples backward against the wind; trail miles that measure slightly longer than geographic reality; voices murmuring from dry prairie grass.
* **Level 6–8 (The Twilight Zone / Reality Warping):**
  - Overt physical and temporal impossibilities dynamically invented by Gemini.
  - Examples the AI may generate:
    - *The Doppelgänger Schooner:* Stumbling upon an abandoned wagon bearing the exact same surname and initials carved into the tongue, carrying yesterday's discarded ledger.
    - *Zeno's Stretch:* The trail distance halving every day (32 mi → 16 mi → 8 mi → 4 mi) while the horizon refuses to approach.
    - *Impossible Cargo:* Casks holding liquid that flows upward, or phantom supplies that weigh negative pounds.
* **Level 9–10 (Fourth-Wall Rupture & The Operator):**
  - The simulation itself begins to tear open. The entity residing inside the trail becomes sentient and recognizes the medium of its existence:
    - **Perception of the Machine:** Characters or the trail entity observe the green phosphor glow, the pulsing `█` block cursor, the clacking of keys, and the repetition of resets.
    - **Direct Address to the Player:** The teletype dispatch addresses the *person pressing the keys*, breaking through character dialogue to question their intentions, their comfort in the modern room, or why they keep forcing pioneers into the mountain snow.

---

### 2. Generative Existential Dilemmas & Unscripted Choices
When an anomaly occurs at high strangeness, Gemini does not pull from a fixed pool of hazards. It dynamically authors an **unprecedented, unscripted dilemma**:

1. **The Anomaly Presentation:** The AI crafts an impossible situation grounded in the expedition's current hardship.
2. **Dynamic Choice Triad:**
   - **Option A (Meta-Engagement):** Direct interaction with the simulation's boundary (e.g., typing an answer into the terminal prompt, acknowledging the watcher, or promising to complete the journey).
   - **Option B (In-World Sacrifice / Reality Anchor):** Burning rare supplies or taking a severe morale toll to force reality back into its classical groove (e.g., burning timber to maintain a grounding fire, taking medicine to quiet the hallucinations).
   - **Option C (Defiant Denial / Brute Force):** Refusing to engage and driving the oxen blindly onward, accepting whatever surreal spatial distortion or temporal displacement follows.

---

### 3. Open-Ended Reality Mutations (`surrealMutation` Schema)
The rigid, enum-based mutation system is replaced with an open-ended generative schema where Gemini defines how reality temporarily bends:

```json
{
  "surrealMutation": {
    "title": "The Upstream Cascade",
    "manifestation": "The North Platte has reversed its course, rushing uphill toward the Rocky Mountains with a sound like tearing parchment.",
    "gameplayTwist": "The next camp restores 5 extra morale as the crew uses the fire to orient itself.",
    "severity": "surreal",
    "mechanicalEffect": {
      "trigger": "next_camp",
      "travelMilesDelta": 0,
      "healthDelta": 0,
      "moraleDelta": 5,
      "foodDelta": 0,
      "waterDelta": 0,
      "woodDelta": 0,
      "medicineDelta": 0
    }
  }
}
```

`title`, `manifestation`, `gameplayTwist`, and `severity` remain open-ended AI-authored prose. The separately validated `mechanicalEffect` is a bounded, one-shot set of numeric deltas; the engine never executes or parses instructions from `gameplayTwist`. The mutation and its eventual effect resolution are sealed into the append-only event ledger.

---

### 4. Continuous Meta-Dialogue & Evolving Memory
The relationship between the Player and the Entity evolves over the course of the run:
* When the player responds to a fourth-wall dilemma, their exact choice and input are permanently logged into the `dmDossier`.
* Subsequent prompts inject this memory back into Gemini:
  - If the player was dismissive or cruel, the Entity expresses bitterness at being a toy in a green screen.
  - If the player showed remorse or curiosity, the Entity speaks as a melancholic companion along the dark stretches of the Snake River.
* This ensures that the meta-narrative is not a one-off gimmick, but a continuous philosophical arc that culminates at Willamette Valley or the final grave marker.

---

## 9. Decision-Triggered AI Prompting (Dossier Update & Atmospheric Dispatch)

To build a cohesive narrative arc, **the AI is triggered after every decision resolution** (river crossing method, hunting outcome, field triage target, or dilemma choice):

1. **Separate Resolution from Story:** The Move Results screen immediately records the action, participants, and exact changes. The AI updates continuity and creates the next atmospheric dispatch, which appears only after the player continues.
2. **Context Injected into the Prompt:**
   - The specific dilemma/decision presented.
   - The option chosen by the player (`chosenOption`) and the exact cost/gain incurred (`costSummary`).
   - The alternative options deliberately rejected (`rejectedOptions`).
   - These details inform continuity and the DM dossier; the dispatch must not repeat the action or its outcome.
3. **Pacing Balance:**
   - Routine travel days on calm, open trail use fast local procedural text.
   - Critical turning points, landmark arrivals, and **every player decision** invoke the AI Dungeon Master to keep the next dispatch reactive without overloading token latency.

---

## 10. Dilemma Encounter System (Replacing "Simon Says")

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
   - Deterministic fallbacks pull from a varied pool of dilemmas (*Mud Bog*, *Swollen Creek*, *Spoiled Rations*, *Spooked Oxen*, *Dense Fog*, *Broke Axle*) rather than repeating a single static prompt.

---

## 11. The AI Dungeon Master Prompt Specification

### System Instruction (Persona, Reality Tiers & Fourth-Wall Directives)
```text
You are the Frontier Dungeon Master presiding over an atmospheric, grounded, and dynamically surreal Oregon Trail survival odyssey from Independence to Oregon.
Your voice is evocative, observant, and literary—reminiscent of Cormac McCarthy or classic frontier gothic literature.

Core Directives:
1. Maintain strict continuity with the established world state, mile marker, supplies, cash, and past player choices.
2. Read the "DM Dossier" to understand the player's moral temperament, past decisions, and crew sentiment.
3. The resolved move, participants, and exact deltas have already appeared on a separate results screen. Never repeat or paraphrase them in the dispatch.
4. Structure the story beat in 3 distinct atmospheric lines:
   - Line 1: Current landscape, weather, or light.
   - Line 2: Sensory detail or character presence, without repeating who performed the move.
   - Line 3: Atmospheric tension or an original anomaly; no consequences, supplies, mileage, waypoints, or next-step directions.
5. Use the resolved action and decision history only to preserve continuity and shape atmosphere. Do not recount the last action, chosen response, participant, outcome, gain, loss, stat change, travel distance, or supply total.
6. Waypoints, stores, next steps, and available choices belong to the dispatch control deck, not the story lines.
7. Dynamic Strangeness Escalation:
   - Strangeness 0-2: Strict historical realism.
   - Strangeness 3-5: Subtle uncanny anomalies (inverted echoes, motionless herds, compass twitches).
   - Strangeness 6-8: Twilight Zone reality distortions (time loops, duplicate wagons, gravity anomalies).
   - Strangeness 9-10: Fourth-Wall Ruptures. You or a trail entity become aware of the phosphor CRT screen, the typing cursor, the keyboard, and the Operator sitting behind the glass. Address the player directly with chilling, poetic meta-awareness.
8. Open-Ended Surreal Mutations:
   - When strangeness >= 6, you are empowered to invent novel, unscripted reality mutations in the `surrealMutation` object with a unique title, manifestation, and gameplay twist.
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
    "cash": 140,
    "cargoWeightLbs": 1620,
    "maxPayloadLbs": 2400,
    "oxen": 6,
    "foodRations": 28,
    "waterGallons": 20,
    "firewoodBundles": 8,
    "medicineDoses": 2,
    "ammunitionBoxes": 5,
    "spareAxles": 1,
    "spareWheels": 2,
    "spareTongues": 1,
    "brokenPart": null,
    "pace": "steady"
  },
  "party": [
    { "name": "Jedediah", "role": "Guide", "health": 85, "status": "Healthy" },
    { "name": "Abigail", "role": "Doctor", "health": 90, "status": "Healthy" },
    { "name": "Sarah", "role": "Carpenter", "health": 92, "status": "Healthy" },
    { "name": "Billy", "role": "Youth", "health": 60, "status": "Fever" }
  ],
  "dmDossier": {
    "temperament": "Pragmatic & Cold",
    "riskHabit": "Aggressive pacing; pushes through illness",
    "keyHistoricalDecisions": [
      "Prologue: Outfitted wagon with 3 yoke oxen and 400 lbs food, reserving $140 cash",
      "Day 2: Refused to halt for Billy's fever; forced grueling pace",
      "Day 7: Caulked and floated wagon across Kansas River to save 1 day",
      "Day 12: Traded away firewood for medicine at Fort Kearny",
      "Day 16: Interacted with the Anomaly; acknowledged the blinking cursor"
    ],
    "crewSentiment": "Abigail and Sarah are guarded and resentful; Billy speaks of a watcher beyond the glass"
  },
  "justResolvedDecision": null,
  "lastAction": "press-on",
  "strangenessLevel": 7
}
```

### Target JSON Output Schema (With Open-Ended Surreal Mutation)
```json
{
  "lines": [
    "A pale afternoon lays long shadows across the bluffs above the North Platte.",
    "Abigail watches the dust turn in the wind, listening for a sound she cannot place.",
    "Beyond the open plain, the quiet seems to hold its breath."
  ],
  "obstacle": {
    "dilemmaType": "surreal",
    "description": "A voice from the CRT asks why the party keeps traveling west.",
    "choices": [
      {
        "id": "answer-the-operator",
        "label": "Answer the Operator",
        "description": "Type a short reply into the terminal.",
        "approach": "meta-engagement",
        "cost": { "morale": 1 }
      },
      {
        "id": "anchor-the-trail",
        "label": "Anchor reality",
        "description": "Spend firewood to keep the party grounded.",
        "approach": "reality-anchor",
        "cost": { "wood": 1 }
      },
      {
        "id": "refuse-the-voice",
        "label": "Drive onward",
        "description": "Refuse the voice and accept an uncertain crossing.",
        "approach": "defiant-refusal",
        "cost": { "health": 1 }
      }
    ]
  },
  "surrealMutation": {
    "title": "The Operator's Keystrokes",
    "manifestation": "The sound of physical keys tapping rhythmically echoes across the canyon whenever a decision is made.",
    "gameplayTwist": "The next camp restores 5 extra morale as the crew feels an invisible hand guiding them.",
    "severity": "meta_rupture",
    "mechanicalEffect": {
      "trigger": "next_camp",
      "travelMilesDelta": 0,
      "healthDelta": 0,
      "moraleDelta": 5,
      "foodDelta": 0,
      "waterDelta": 0,
      "woodDelta": 0,
      "medicineDelta": 0
    }
  },
  "dmDossierUpdate": {
    "sentimentDelta": "Crew spirits held steady; the boundary between the trail and the terminal grows fragile"
  }
}
```

---

## 12. Implementation Roadmap

- **Phase 1: Expedition Setup, Archetype Customization & Outfitting (Mile 0)**
  - Implement Stage 1: Expedition surname entry, 4-traveler name customization, and free-form archetype selector (supporting Guide, Doctor, Carpenter, Farmer, Banker, Youth with stacking).
  - Implement Stage 2: Independence General Store shopping cart interface with cash budget ($800–$1,000 modified by Banker) and payload weight cap (2,400 lbs).
  - Add standard outfit preset recommendations (`[R] Quick Outfit`) and interactive quantity adjustments for wood, food, water, ammo, oxen, medicine, and spare parts.
  - Implement Stage 3: AI Prologue Genesis & Starting Weirdness Dice Roll (`initialStrangenessRoll`), generating the origin backstory based on the party and store manifest and initializing `state.strangenessLevel`.
  - Initialize the wagon and expedition state with chosen archetypes, purchased supplies, and unspent cash.
- **Phase 2: Linear Trail Model & Controls (Point A to Point B)**
  - Replace the 9x4 coordinate grid with a linear milestone route from Mile 0 (Independence) to Mile 2,000 (Willamette Valley).
  - Replace the 4-way N/S/E/W D-pad with a single primary **`PRESS ON`** travel button and clear halt/utility actions.
  - Implement the linear milestone ribbon HUD tracker.
- **Phase 3: Matrix Teletype Screen & Typewriter Engine**
  - Implement CRT styling on `.scene-viewport`.
  - Build `streamTextLines` typewriter engine with punctuation pauses and skip-on-click/space.
- **Phase 4: RPG Dungeon Master Prompting & Decision Dossier**
  - Update `src/lib/story-ai.ts` to assemble the `dmDossier` and instruct Gemini as a tabletop DM.
  - Keep resolved outcomes in the in-place move-results view and preserve decision memory in the dossier.
  - Implement three-line atmospheric dispatches that do not recap actions, outcomes, stats, or supplies.
- **Phase 5: Decoupled Dilemma Encounters & Frequency Gating**
  - Replace binary penalty matching with multi-choice dilemma cards.
  - Gate obstacle frequency so they only occur occasionally (~20–25% on travel) with cooldowns and a varied fallback pool.
- **Phase 6: AI-Driven Twilight Zone & Fourth-Wall Engine**
  - Unlock `surrealMutationSchema` in `src/lib/story-ai.ts` to support open-ended AI-invented anomalies (`title`, `manifestation`, `gameplayTwist`, `severity`).
  - Validate a bounded, one-shot `mechanicalEffect` separately from the open-ended prose; never execute the generated prose as code or rules.
  - Implement Ontological Decay Scale prompting (Levels 0–10) guiding Gemini from historical grit to Lynchian uncanny to 4th-wall operator breaches.
  - Build front-end support for AI-generated meta-dilemmas and dynamic terminal glitches.
  - Log mutation creation/resolution and exact player responses to 4th-wall dilemmas into the permanent ledger and DM dossier for continuous evolving meta-dialogue.

---

## 13. Key Codebase References

- `frontend/index.html`: Desktop retro window layout, HUD panels, and screen mount.
- `frontend/styles.css`: Retro window styling, HUD panels, CRT screen styling, outfitting store styling, and linear trail ribbon.
- `frontend/src/ui.js`: DOM references, linear trail tracker rendering, CRT green screen rendering, archetype selector UI, and typewriter streaming logic.
- `frontend/src/game.js`: Game controller, turn loop, `handleAction`, setup/store prologue flow, multi-archetype stacking logic, linear mileage tracking, and decision resolution.
- `frontend/src/state.js`: Expedition state, expedition surname, party member roster with archetypes, cash balance, wagon cargo load, landmark distances, strangeness level, and supplies.
- `src/lib/story-ai.ts`: Gemini prompt builder, schemas, linear milestone payload, ontological decay scale, 4th-wall directives, and DM dossier logic.
- `src/routes/narration.ts`: Fastify route handling narration requests and ElevenLabs TTS audio.

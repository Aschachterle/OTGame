# OTGame ("Immutable Trail") — Game Design & Architecture

This document defines the gameplay philosophy, narrative design, UI/UX specifications, 32×32 8-bit character designer integration, animated landscape caravan stage, linear trail progression, outfitting economy, surreal reality distortion engine, and AI integration for **OTGame (Immutable Trail)**. It serves as the primary reference for features, architectural standards, and development prompts.

---

## 1. Vision & Core Philosophy

**Immutable Trail** is a streamlined, text-driven survival odyssey from **Independence to Oregon (Point A to Point B)**. It merges classic *Oregon Trail* resource survival with:

1. **A Matrix / Phosphor CRT Terminal Aesthetic:** The center stage screen is a glowing green CRT monitor where text streams line-by-line and letter-by-letter with a pulsing cursor (`█`).
2. **Prologue Setup, 32×32 Character Designer & Outfitting Stage:** Before embarking, the player names their family/expedition, selects **one shared Era for all party members** (`oregon_trail` or `1500s`–`2020s`), and customizes each of the four travelers' first names, archetypes, and 32×32 8-bit character sprites using the integrated `CharacterDesigner` technology styled in OTGame's retro CRT aesthetic. They then read the AI-generated opening prologue (which explains how the party was transported to 1800s Missouri if a non-Oregon-Trail era was selected) and enter the Independence General Store to pack their prairie schooner under strict cash budget and payload weight constraints.
3. **Animated 8-Bit Landscape & Oxen Cart Caravan:** An integrated 8-bit pixel-art landscape stage renders the four customized 32×32 party members starting at an era/location-appropriate home, walking on foot to the Independence General Store, and—once outfitted at the store—moving through the scrolling landscape with their oxen cart whenever a move action starts.
4. **Linear Point A to Point B Progression:** Eliminates the confusing 2D cardinal grid (North/South/East/West). The player moves forward along a single overland trail from **Independence (Mile 0)** to **Willamette Valley (Mile 2,000)**. The fundamental turn-by-turn choice is:
   - **Press On (Continue Trail):** Advance the wagon forward towards the next landmark.
   - **Halt & Act:** Stop to camp, hunt, gather firewood/water, treat illness, repair, trade, or scout ahead.
5. **An RPG Frontier Dungeon Master (AI):** The AI acts as an observant, atmospheric tabletop Dungeon Master rather than a generic news ticker. It remembers the player's past decisions, tracks their moral temperament (ruthless vs. compassionate, reckless vs. prudent), and dynamically shapes future encounters based on those choices.
6. **The AI-Driven Twilight Zone & 4th-Wall Rupture:** Unlike traditional scripted games with static event tables, uncanny and surreal occurrences are **100% dynamically authored by AI prompting**. As trail strangeness escalates, reality warps in completely unscripted ways, culminating in the simulation waking up, recognizing the player sitting behind the keyboard, and attempting to communicate directly through the green phosphor CRT.
7. **Decision-Triggered Narrative Continuity:** The AI is explicitly prompted immediately following every major decision or dilemma resolution. This guarantees immediate narrative consequence and emotional payoff for player choices.
8. **Decoupled Strategic Dilemmas (No "Simon Says"):** Eliminates binary button-matching penalties. Hazards are multi-choice dilemma cards offering meaningful trade-offs across supplies, health, morale, and time.
9. **Cryptographic Provenance:** Every significant move, milestone arrival, resolution, and death is permanently sealed in an immutable event ledger.

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

## 3. Expedition Setup: Party Naming, Single-Era 32×32 Character Designer, Prologue Genesis & Outfitting

Before setting wheel to the overland trail at Independence (Mile 0), the game follows a three-stage setup: party registration & 32×32 character creation, the opening prologue, then store outfitting.

### Stage 1: Party Naming, Single Party Era, Archetypes & 32×32 Character Creation
1. **Family / Expedition Surname:**
   - The player selects the expedition last name (Default: *"The Schachterle Family"*, with player prompt to customize).
   - Displayed across trail dispatches, ledger records, grave markers, and milestone chronicles (e.g., `> The Schachterle Family presses west along the North Platte...`).

2. **Single Party Era Rule (Shared Across All 4 Members):**
   - The player chooses **one single Era** (`state.selectedEra`) that applies to **all four party members**. Cross-era mixing (`all`) is disabled so the entire household originates from the same time period.
   - Available eras from the Character Designer library (`/Users/adamschachterle/Documents/CharacterDesigner/presets.js`):
     - `oregon_trail` — *Oregon Trail — 1840s–1860s Pioneer & Frontier* (**Default**, 1840–1869)
     - `1500s` — *1500's — Tudor & Renaissance* (1500–1599)
     - `1600s` — *1600's — Baroque & Cavalier* (1600–1699)
     - `1700s` — *1700's — Georgian & Colonial* (1700–1799)
     - `1800s` — *1800's — Victorian & Industrial* (1800–1899)
     - `1900_1920` — *1900–1920 — Edwardian & Early Modern* (1900–1920)
     - `1921_1940` — *1921–1940 — Roaring 20s & Art Deco 30s* (1921–1940)
     - `1941_1950` — *1941–1950 — Wartime & Post-War 40s* (1941–1950)
     - `1950s` — *50's — Rockabilly & Diner Era* (1950–1959)
     - `1960s` — *60's — Mod & Counterculture* (1960–1969)
     - `1970s` — *70's — Disco & Funk* (1970–1979)
     - `1980s` — *80's — Arcade Neon & Synthwave* (1980–1989)
     - `1990s` — *90's — Grunge & Skate Streetwear* (1990–1999)
     - `2000s` — *00's — Y2K & Pop Punk* (2000–2009)
     - `2010s` — *10's — Indie & Athleisure* (2010–2019)
     - `2020s` — *20's — Modern Techwear & Street* (2020–Present)
   - Switching `selectedEra` filters all wardrobe categories to that era and automatically equips era-matching outfits across all four party members.

3. **32×32 8-Bit Character Designer Integration (Retro OTGame Aesthetic):**
   - Integrates the 32×32 pixel-art composite engine and preset catalog from `/Users/adamschachterle/Documents/CharacterDesigner` (`presets.js` and `app.js`) directly into the character creation screen.
   - **Visual Styling:** Styled to match OTGame's retro desktop window shell and phosphor green CRT aesthetic (`#020602` terminal background, `#00ff66` phosphor text/borders, scanlines, monospace typography, and crisp `image-rendering: pixelated` sprite canvases) while preserving full-color 8-bit character sprites on dark CRT inspection frames.
   - **Per-Member Customization Controls (4 Party Slots):**
     - **Member Selector Tabs (`[1]..[4]`):** Switches which of the 4 party members is actively being customized in the wardrobe studio, alongside a live 4-member party lineup bar showing all four 32×32 sprites together.
     - **Identity & Role:** First Name input + Archetype selector (`Guide`, `Doctor`, `Carpenter`, `Farmer`, `Banker`, `Youth`).
     - **Body & Appearance:**
       - **Gender:** `female` (`♀ Female`) or `male` (`♂ Male`), affecting eyelashes, facial features, and gender-filtered wardrobe presets (`female`, `male`, `unisex`).
       - **Body Frame (`BASE_BODY_TEMPLATES`):** `standard_adventurer` (*Standard Frame*), `broad_guardian` (*Broad Frame*), or `nimble_scout` (*Slender Frame*), including the extended `H` hair-cascade zone (`y: 2..18`).
       - **Skin Tone (`SKIN_TONES`):** `warm_ivory`, `golden_tan`, `deep_umber`, `rich_espresso`, `olive_bronze`, `porcelain_rose`.
     - **Era Wardrobe (`CATEGORIES`, filtered to the party's single `selectedEra`):**
       - `hats`: Mutually exclusive **Hair or Hat** top slot (`subType: 'hair' | 'hat'`), supporting chest- and shoulder-length long hairstyles (`y: 2..18`) for both women and men as well as era hats.
       - `shirts`: Era shirts, bodices, coats, and jackets.
       - `pants`: Era pants, breeches, and skirts.
       - `shoes`: Era boots, shoes, and moccasins.
       - `accessories`: Era aprons, bandanas, shawls, and gear.
       - **Color Dye (`PRESET_COLOR_DYES`):** Per-category palette dye (`default`, `crimson`, `cobalt`, `emerald`, `royal`, `gold`, `shadow`, `espresso`).
       - **Quick Outfit Actions:** `Randomize Member`, `Equip Era Look (Hat)`, and `Equip Era Look (Hair)`.
     - **Live 32×32 Sprite Preview:** Displays the active member in Front View (`front`) and Walking Side Profile (`side_right` / `side_left`, 4-frame walk cycle), plus all 4 party members standing outside their era-appropriate home on the preview stage.

4. **Roster Composition & Free-Form Archetype Stacking:**
   - The party consists of 4 traveler slots.
   - For **each** traveler, the player customizes their **First Name**, **Archetype / Specialty**, and **32×32 Sprite**.
   - **Free-Form Stacking Permitted (Option B):** The player is not restricted to one of each role. Any combination is valid, allowing specialized builds (e.g., running 2 Doctors for unmatched medical resilience, or 2 Guides for supreme hunting self-sufficiency, at the trade-off of lacking wagon maintenance or financial buffers).

5. **Archetype Catalog & Mechanical Benefits:**

| Archetype | Default Name | Mechanical & Strategic Benefits | Stacking Synergy (x2) |
| :--- | :--- | :--- | :--- |
| **Guide / Scout** | *Jedediah* | **+10% hunting accuracy**, **+3 meat yield**, **+2 forage bonus**, and trail scouting reconnaissance (`[7] SCOUT`). Enables lean food outfitting. | **+20% hunting accuracy**, **+6 meat yield**, **+4 forage bonus**. Wagon rarely needs to buy food sacks. |
| **Doctor / Healer** | *Abigail* | **+4 party HP recovery** on camp rest, **every 2nd medicine dose free**, **+5 HP per triage dose**. Survives epidemics and cuts medical costs. | **+8 party HP recovery** on rest; **all treatments consume 0 medicine**; **+10 HP per triage dose**. |
| **Carpenter / Wheelwright** | *Sarah* | **-5% breakdown chance**, **halved wood repair costs** (1 bundle instead of 2), **+18% oxen fatigue cleared** on camp rest. Enables aggressive Strenuous pacing. | **-10% breakdown chance**; **repairs require 0 wood** (emergency field splints); **+24% oxen fatigue cleared**. |
| **Farmer / Cook** | *Caleb* | **-20% daily food consumption** across the entire party; oxen lose fatigue 25% slower on trail. Excellent for long stretches between hunting grounds. | **-35% daily food consumption**; oxen endurance doubled across badlands and mountains. |
| **Banker / Merchant** | *Martha* | **+$250 starting cash bonus** ($1,050–$1,250 total); **immune to fort store price markups** (buys at 1.0x base Independence price). | **+$500 starting cash bonus**; fort store prices discounted to 0.8x base catalog. |
| **Youth / Dependent** | *Billy* | **Absorbs 65% of snakebites and random hazards** to protect specialists; **+10 baseline morale floor**; unlocks high-compassion AI Dungeon Master triggers. | **Absorbs 90% of sudden hazard damage**; **+20 baseline morale floor**. |

6. **Living Requirement Rule:**
   - Archetype bonuses are active only while that specific member is alive (`health > 0`). If a character dies, their passive bonus is permanently lost.

---

### Stage 2: Opening Prologue Genesis, Era Transport Rule & Starting Weirdness Dice Roll

Immediately after the player confirms the party register and character designs, and before the General Store opens, the game initiates the **Opening Prologue Genesis**. This story introduces the family, their chosen era, and leads them to Independence's store without deciding what they buy.

#### 1. The Starting Weirdness Roll & Non-Oregon-Trail Era Transport Rule
When the player confirms the roster, the engine rolls an integer from 0 through 10 for initial `strangenessLevel` (or uses a configured test override) and submits it along with `selectedEra` (`id`, `label`, `years`) and the party's customized roster to Gemini.

- **If `selectedEra === 'oregon_trail'`:** The backstory is set natively in 1848 and follows the Starting Weirdness Roll table below:

| Starting Roll | Reality Tier | Prologue Narrative Flavor & Origin Backstory (`oregon_trail` Era) |
| :--- | :--- | :--- |
| **0 – 2 (Common)** | **Historical Realism** | **Grounded Family Hardship:** Poor prospects, debt, illness, uncertain work, or the hope of securing land in Oregon give the family a period-plausible reason to leave. |
| **3 – 5 (Uncommon)** | **Subtle Unease** | **Ambiguous Catalyst:** A troubling coincidence, shared dream, or omen may influence the family's choice, while remaining open to an ordinary explanation. |
| **6 – 8 (Rare)** | **Supernatural Catalyst** | **Unexplained Reason to Leave:** One strange or supernatural occurrence may decisively convince the otherwise ordinary, historically grounded family to set out. |
| **9 – 10 (Critical Anomaly)** | **Temporal Rupture / Powerful Supernatural Catalyst** | **Modern Origin Permitted:** The story may begin in the present day before the travelers are suddenly displaced to 1848 and assume the identities and roles of the named Oregon Trail family. |

- **If `selectedEra !== 'oregon_trail'` (Any Other Era Selected, e.g., `1500s`–`1800s` or `1900_1920`–`2020s`):**
  - **Mandatory Era Transport Backstory:** Regardless of the numeric weirdness roll, the AI **must open the story in the party's chosen era and era-appropriate home** (reflecting their era-specific lives, clothing, and historical decade/century) and **explicitly explain how all four characters were transported from their chosen era to 1800s (1848) Independence, Missouri**.
  - The severity/flavor of the transport scales with the weirdness roll (e.g., an eerie fog, a doorway that opens onto the wrong century, a freak electrical/alchemical storm, or an abrupt temporal displacement), depositing the travelers in 1848 Missouri where they must walk to the Independence General Store to outfit a wagon west.

Genesis is always one substantial paragraph (200–250 words) with at least one line of direct quoted dialogue, and its final sentence places the family physically at the threshold of the Independence General Store, in Independence, Missouri, in 1848, ready to choose provisions.

#### 2. Prologue Genesis Context Payload (Sent to Gemini)
```json
{
  "promptType": "prologue-genesis",
  "expeditionName": "The Schachterle Family",
  "selectedEra": {
    "id": "1980s",
    "label": "80's — Arcade Neon & Synthwave",
    "years": "1980–1989"
  },
  "startingStrangenessRoll": 6,
  "party": [
    {
      "name": "Jedediah",
      "role": "Guide",
      "gender": "male",
      "outfitSummary": "80's Heavy Metal Shredder Mane, Synthwave Bomber Jacket, Acid-Wash Jeans, High-Top Sneakers"
    },
    {
      "name": "Abigail",
      "role": "Doctor",
      "gender": "female",
      "outfitSummary": "80's Crimped High Ponytail, Neon Shoulder-Pad Blazer, Pleated Trousers, Court Shoes"
    },
    {
      "name": "Sarah",
      "role": "Carpenter",
      "gender": "female",
      "outfitSummary": "Backwards Cap, Denim Work Shirt, Cargo Jeans, Work Boots"
    },
    {
      "name": "Billy",
      "role": "Youth",
      "gender": "male",
      "outfitSummary": "Arcade Visor Cap, Graphic Tee, Track Pants, Skate Shoes"
    }
  ]
}
```

#### 3. Output Schema & Teletype Presentation
```json
{
  "startingStrangenessLevel": 6,
  "headline": "Displaced to Independence",
  "prologueParagraphs": [
    "One substantial family backstory opening in the chosen era and home, explaining how the four named travelers were transported to 1848 Missouri (when selectedEra is not oregon_trail), and ending at the threshold of the Independence General Store before purchases."
  ]
}
```

#### 4. CRT Presentation & Transition
1. Confirming the roster closes the character creation modal, renders the 4 custom 32×32 characters outside their **era-appropriate home** on the 8-bit landscape stage, and streams the opening prologue in the green phosphor CRT.
2. The starting Weirdness Meter is calibrated in the cockpit status bar.
3. The prologue ends at the store before any shopping; a pulsing prompt appears:
   `[SPACE / ENTER] GET SUPPLIES AT THE GENERAL STORE >>`
4. Pressing Space/Enter triggers the **Home → General Store walk animation** on the landscape canvas (the 4 party members walk on foot from their era-appropriate home to the Independence General Store porch without an oxen cart) and switches the main viewer directly to the outfitting cart.
5. Store checkout seals the `expedition_departure` event with the prologue, chosen era, custom character sprite data, chosen outfit, and starting strangeness, hitches the **Oxen Cart** to the party outside the store, and begins **Day 1 at Mile 0**.

---

### Stage 3: Independence General Store & Wagon Outfitting
After the opening prologue, the player enters the **Independence General Store (May 1848)** run by the frontier merchant.

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
The party register & 32×32 character creator remains a setup modal styled in OTGame's retro CRT aesthetic. After confirmation, the prologue and store outfitting occupy the main viewer in sequence alongside the 8-bit landscape stage; outfitting replaces the prologue view rather than opening a separate page or modal:

1. **Screen 1 — Expedition Register, Single Era Selector & 32×32 Character Creator:**
   ```text
   =============================================================================
   IMMUTABLE TRAIL // EXPEDITION REGISTRATION & 32x32 CHARACTER CREATOR
   =============================================================================
   [EXPEDITION SURNAME]: The Schachterle Family
   [PARTY ERA (ALL MEMBERS)]: [< Oregon Trail — 1840s–1860s Pioneer >]
   
   PARTY ROSTER & ARCHETYPES (Click tab [1]-[4] to customize 32x32 sprite):
     [1] Name: [Jedediah]  Role: [< GUIDE     >]  ♀/♂: [♂]  [32x32 Preview]
     [2] Name: [Abigail ]  Role: [< DOCTOR    >]  ♀/♂: [♀]  [32x32 Preview]
     [3] Name: [Sarah   ]  Role: [< CARPENTER >]  ♀/♂: [♀]  [32x32 Preview]
     [4] Name: [Billy   ]  Role: [< YOUTH     >]  ♀/♂: [♂]  [32x32 Preview]

   ACTIVE MEMBER WARDROBE (Locked to Selected Party Era):
     Frame: [Standard] | Skin: [Warm Ivory] | Dye: [Era Original]
     [Hair/Hat] [Shirts] [Pants/Skirts] [Shoes] [Accessories] | [🎲 Randomize]
   
   [TAB] Cycle Fields  |  [ENTER] Confirm Party & Read Opening Prologue
   =============================================================================
   ```

2. **Screen 2 — Opening Prologue & Home-to-Store Landscape Stage:**
   - After roster confirmation, roll the starting strangeness, display the 4 custom 32×32 party members outside their **era-appropriate home** on the 8-bit landscape stage, and stream the generated origin story in the cockpit chronicle.
   - If `selectedEra !== 'oregon_trail'`, the story explains how the characters were transported from their chosen era to 1800s Missouri.
   - The story ends with the party at the Independence General Store before any purchases have been made.
   - `[SPACE / ENTER] GET SUPPLIES AT THE GENERAL STORE` walks the 4 characters from their home to the General Store on the landscape stage and switches the main viewer directly to the outfitting cart.

3. **Main Viewer — General Store Outfitting & Cargo Manifest:**
   - The cart replaces the prologue in the main viewer, with cash, weight, quantity, preset, and validation controls while the 4 custom characters stand outside the General Store on the landscape stage.
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

## 5. Visual, Landscape Animation & Screen Specifications (CRT Terminal & Unified Cockpit)

### The Overall Window Shell (Preserved)
- The retro desktop window frame, title bar, dropdown menus, objective/journal cards, and bottom dock controls remain intact.

### The Animated 8-Bit Landscape & Caravan Stage
Mounted inside the unified cockpit above the teletype chronicle is the **8-Bit Landscape & Trail Stage Canvas** (`160×64` pixel-art scene scaled cleanly with `image-rendering: pixelated`), powered by the `CharacterDesigner` backdrop and 4-frame walk-cycle engine:

1. **Stage A — Era/Location-Appropriate Home (Prologue Start):**
   - Renders an **era-appropriate home building** on the left side of the path matching `state.selectedEra` (e.g., Tudor half-timbered cottage for `1500s`, Baroque stone manor for `1600s`, Colonial brick house for `1700s`, Victorian terraced home for `1800s`, frontier log cabin for `oregon_trail`, Edwardian rowhouse for `1900_1920`, Art Deco apartment for `1921_1940`, 1940s bungalow for `1941_1950`, 1950s pastel/neon ranch home for `1950s`, 1960s mod townhouse for `1960s`, 1970s brownstone for `1970s`, 1980s synthwave split-level/arcade storefront for `1980s`, 1990s brick duplex for `1990s`, 2000s suburban house for `2000s`, 2010s timber/brick loft for `2010s`, or 2020s modern glass-and-steel home for `2020s`).
   - All 4 living party members appear in their custom 32×32 sprites outside their home.

2. **Stage B — Walking to the Independence General Store (No Oxen Cart Yet):**
   - When transitioning from the prologue to the General Store, the 4 custom 32×32 party members animate in their 4-frame side-profile walk cycle (`side_right`), walking on foot from their era-appropriate home across the path to the **Independence General Store (`MATT'S OUTFITTING POST`)** rendered on the right side of the stage.
   - No oxen cart is present during this pre-purchase walk or while browsing the General Store.

3. **Stage C — Departing the General Store with the Oxen Cart & Moving on Trail Actions:**
   - Once the player completes store checkout (`Purchase & Embark`), the **pixel-art Oxen Team & Covered Prairie Schooner Cart** is hitched and rendered with the party outside the General Store.
   - **Triggered on Every Move Action:** Whenever a move action starts (`PRESS ON`, `HUNT`, `GATHER`, `SCOUT`, river crossings, or departing the store), the living 32×32 party members and their **oxen cart** actively animate moving through the scrolling pixel-art landscape (`prairie`, `river`, `desert`/badlands, `mountains`, `snow` mapped to the current trail biome and weather).
   - Walk-cycle frame rate, wheel rotation, dust puffs / river splashes, and parallax ground scroll speed scale with `state.wagon.pace` (`steady`: 6 FPS, `strenuous`: 9 FPS, `grueling`: 13 FPS).
   - When the move action finishes and the wagon is halted in camp or awaiting player decisions, the caravan settles into the 2-frame `idle` breathing state.

### The Unified Cockpit Display
- **Consolidated Information Hub:** All essential game readouts—8-Bit Landscape Caravan Stage, Dispatch Chronicle, Overland Trail Milestone Ribbon, Wagon & Supply Gauges, Party Vitals (with 32×32 character portraits), and Contextual Action Prompts—are integrated directly into the phosphor green CRT screen.
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
After the engine resolves the action and the next atmospheric dispatch has been requested, the chronicle switches to:

1. The resolved action, who was involved, and exact stat and supply deltas.
2. No new story beat or dilemma prompt until the player continues.
3. A **Continue** control in the main action dock; **Space** and **Enter** work as shortcuts.

The surrounding cockpit remains visible, including the HUD, trail ribbon, wagon gauges, party roster, waypoint survey, stores, and action deck. Actions and pace/ration inputs remain visible but are disabled until Continue; the primary travel control becomes Continue.

Between resolving the action and showing Phase 1, display an in-cockpit loading state while the next dispatch is generated and animate the party and oxen cart moving through the landscape stage. Keep both the Move Results and dispatch hidden during this step, and do not expose Continue early. The engine—not Gemini—determines the action outcome. Once narration completes or falls back locally, show the Move Results; Continue then reveals the already-prepared dispatch without issuing a second narration request.

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

While a dispatch is still loading (including the Day 1 opening dispatch), show only the receive indicator and its day/location header in the chronicle. Suppress placeholder or stale story text, chronicle waypoint/next-step copy, and disable actions and pace/ration controls until the dispatch or its local fallback is ready; the persistent cockpit HUD remains visible.

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
- Party Era: 80's — Arcade Neon & Synthwave (1980–1989, displaced to 1848 Missouri)
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
1. Maintain strict continuity with the established world state, chosen party era, mile marker, supplies, cash, and past player choices.
2. Read the "DM Dossier" to understand the player's moral temperament, past decisions, and crew sentiment.
3. The resolved move, participants, and exact deltas have already appeared on a separate results screen. Never repeat or paraphrase them in the dispatch.
4. Structure the story beat in 3 distinct atmospheric lines:
   - Line 1: Current landscape, weather, or light.
   - Line 2: Sensory detail, character presence, or a short line of direct dialogue from a named traveler.
   - Line 3: Atmospheric tension or an original anomaly; no consequences, supplies, mileage, waypoints, or next-step directions.
   - Include at least one brief, natural line of quoted dialogue in every dispatch, preferably from a named living traveler; if none can speak, use a remembered journal line or appropriate in-world voice. Dialogue must not recap the resolved action.
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

### Prologue Genesis Prompt Mode
After roster confirmation and before the store opens, the game calls the narration endpoint with a distinct `promptType` (`prologue-genesis`). The engine supplies the fixed starting roll, expedition surname, the single chosen `selectedEra` (`id`, `label`, `years`), the four named travelers (with roles, genders, and equipped outfit summaries), and confirms that no purchases have been made:

```json
{
  "promptType": "prologue-genesis",
  "expeditionName": "The Schachterle Family",
  "selectedEra": {
    "id": "1980s",
    "label": "80's — Arcade Neon & Synthwave",
    "years": "1980–1989"
  },
  "startingStrangenessRoll": 4,
  "party": [
    { "name": "Jedediah", "role": "Guide", "gender": "male", "outfitSummary": "80's Heavy Metal Mane, Synthwave Bomber Jacket, Acid-Wash Jeans" },
    { "name": "Abigail", "role": "Doctor", "gender": "female", "outfitSummary": "80's Crimped High Ponytail, Neon Blazer, Pleated Trousers" },
    { "name": "Billy", "role": "Youth", "gender": "male", "outfitSummary": "Arcade Visor Cap, Graphic Tee, Track Pants" },
    { "name": "Sarah", "role": "Carpenter", "gender": "female", "outfitSummary": "Backwards Cap, Denim Work Shirt, Cargo Jeans" }
  ]
}
```

Genesis instructions require exactly one substantial original paragraph (target 200–250 words) that gives the family individual histories, relationships, hopes or fears, a shared reason for leaving, and at least one brief line of direct dialogue.
- **When `selectedEra.id === 'oregon_trail'`:** Keep the origin historically grounded in 1848 (or permit modern-to-1848 displacement at strangeness 9–10) and explain a plausible route and elapsed time from any distant home to Independence.
- **When `selectedEra.id !== 'oregon_trail'`:** Open in the party's chosen era and era-appropriate home, weave their era-specific lives and attire into the opening, and **explicitly explain how the characters were transported from their chosen era to 1800s (1848) Independence, Missouri**, before arriving on foot at the Independence General Store.
- The final sentence must place the family at the Independence General Store, in Independence, Missouri, in 1848, ready to choose provisions. The instructions prohibit action outcomes, stat changes, dilemmas, obstacles, and gameplay mutations. The response shape is:

```json
{
  "startingStrangenessLevel": 4,
  "headline": "Before the General Store",
  "prologueParagraphs": [
    "One substantial family backstory connecting each traveler's past, chosen era, and relationships to their arrival in 1848 Independence, Missouri, ending at the Independence General Store before purchases."
  ]
}
```

The engine owns the roll and ledger record; Gemini owns only the generated origin prose. If Gemini is unavailable or disabled, an era-aware and tier-aware deterministic prologue preserves the same payload/output contract.

### Dynamic Context Payload (Sent per Prompt)
```json
{
  "expeditionName": "The Schachterle Family",
  "selectedEra": {
    "id": "1980s",
    "label": "80's — Arcade Neon & Synthwave",
    "years": "1980–1989"
  },
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
    { "name": "Jedediah", "role": "Guide", "gender": "male", "health": 85, "status": "Healthy" },
    { "name": "Abigail", "role": "Doctor", "gender": "female", "health": 90, "status": "Healthy" },
    { "name": "Sarah", "role": "Carpenter", "gender": "female", "health": 92, "status": "Healthy" },
    { "name": "Billy", "role": "Youth", "gender": "male", "health": 60, "status": "Fever" }
  ],
  "dmDossier": {
    "temperament": "Pragmatic & Cold",
    "riskHabit": "Aggressive pacing; pushes through illness",
    "keyHistoricalDecisions": [
      "Prologue: Displaced from the 1980s to 1848 Missouri; outfitted wagon with 3 yoke oxen and 400 lbs food, reserving $140 cash",
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

- **Phase 1: Expedition Setup, Single-Era 32×32 Character Creator, Prologue & Outfitting (Mile 0)**
  - Integrate `/Users/adamschachterle/Documents/CharacterDesigner` (`presets.js` and 32×32 sprite/backdrop engine) into OTGame with OTGame's retro CRT aesthetic.
  - Implement Stage 1: Expedition surname entry, a **single shared Party Era selector** (`oregon_trail` or `1500s`–`2020s`, no cross-era mixing), 4-traveler name & archetype customization, and per-member 32×32 character creation (gender, body frame, skin tone, hair/hat, shirt, pants/skirt, shoes, accessories, and color dyes).
  - Implement Stage 2: AI Opening Prologue Genesis & Starting Weirdness Dice Roll after roster confirmation; submit `selectedEra` to the AI, explain how the characters were transported to 1800s Missouri whenever `selectedEra !== 'oregon_trail'`, and end the story at the Independence General Store before purchases.
  - Implement Stage 3: Independence General Store shopping cart interface with cash budget ($800–$1,000 modified by Banker) and payload weight cap (2,400 lbs).
  - Implement the 8-Bit Landscape Caravan progression: start at an era/location-appropriate home, walk on foot to the General Store, acquire the oxen cart upon store checkout, and animate the party + oxen cart moving through the landscape whenever a move action starts.
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

- `/Users/adamschachterle/Documents/CharacterDesigner/presets.js`: 32×32 8-bit character templates, 16 historical/decade eras (`ERAS`), gender-aware body silhouettes (`BASE_BODY_TEMPLATES`), skin tones (`SKIN_TONES`), dyes (`PRESET_COLOR_DYES`), and layered clothing/hair presets (`INITIAL_CLOTHING_BOILERPLATE`).
- `/Users/adamschachterle/Documents/CharacterDesigner/app.js`: 32×32 composite sprite builder, 4-frame walk cycle / 2-frame idle animation generator, and `160×64` pixel-art backdrop renderer (`drawPixelBackdropScene`).
- `frontend/index.html`: Desktop retro window layout, HUD panels, character creation mount, and screen mount.
- `frontend/styles.css`: Retro window styling, HUD panels, CRT screen styling, retro-styled character creator UI, outfitting store styling, and linear trail ribbon.
- `frontend/src/ui.js`: DOM references, retro character creator & landscape canvas rendering, linear trail tracker rendering, CRT green screen rendering, archetype selector UI, and typewriter streaming logic.
- `frontend/src/game.js`: Game controller, turn loop, `handleAction`, setup/prologue/store flow, home-to-store-to-trail caravan animation triggers, multi-archetype stacking logic, linear mileage tracking, and decision resolution.
- `frontend/src/state.js`: Expedition state, expedition surname, `selectedEra`, party member roster with archetypes and 32×32 sprite configurations, cash balance, wagon cargo load, landmark distances, strangeness level, and supplies.
- `src/lib/story-ai.ts`: Gemini prompt builder, era-transport prologue genesis instructions, schemas, linear milestone payload, ontological decay scale, 4th-wall directives, and DM dossier logic.
- `src/routes/narration.ts`: Fastify route handling narration requests and ElevenLabs TTS audio.

/**
 * 8-Bit 32x32 Character Designer — Multi-Era, Oregon Trail & Gender-Selectable Preset Library
 *
 * Includes:
 * - 16 Selectable Eras (including dedicated "Oregon Trail — 1840s–1860s Pioneer & Frontier"
 *   plus 1500s through 2020s)
 * - Gender Selection ('female' | 'male') affecting both the 32x32 Base Character Body
 *   (eyelashes, facial features, waist/shoulder silhouette) and gender-tagged clothing presets
 *   ('female', 'male', 'unisex').
 * - Mutually Exclusive "Hair or Hat" Slot (`hats` category: `subType: 'hair' | 'hat'`),
 *   featuring genuine chest- and shoulder-length Long Hairstyles (rows y=2..18) for both
 *   Women and Men in every era!
 * - Front View & Side Profile (Right & Left) + 4-Frame Walk Cycle.
 */

const GRID_SIZE = 32;

const GENDERS = [
  { id: 'female', label: 'Female', icon: '♀' },
  { id: 'male', label: 'Male', icon: '♂' }
];

const ERAS = [
  { id: 'all', label: 'All Eras (Mix & Match)', shortLabel: 'All Eras', years: '1500–2020s' },
  { id: '1500s', label: "1500's — Tudor & Renaissance", shortLabel: "1500's", years: '1500–1599' },
  { id: '1600s', label: "1600's — Baroque & Cavalier", shortLabel: "1600's", years: '1600–1699' },
  { id: '1700s', label: "1700's — Georgian & Colonial", shortLabel: "1700's", years: '1700–1799' },
  { id: '1800s', label: "1800's — Victorian & Industrial", shortLabel: "1800's", years: '1800–1899' },
  { id: 'oregon_trail', label: 'Oregon Trail — 1840s–1860s Pioneer & Frontier', shortLabel: 'Oregon Trail', years: '1840–1869' },
  { id: '1900_1920', label: '1900–1920 — Edwardian & Early Modern', shortLabel: '1900–1920', years: '1900–1920' },
  { id: '1921_1940', label: '1921–1940 — Roaring 20s & Art Deco 30s', shortLabel: '1921–1940', years: '1921–1940' },
  { id: '1941_1950', label: '1941–1950 — Wartime & Post-War 40s', shortLabel: '1941–1950', years: '1941–1950' },
  { id: '1950s', label: "50's — Rockabilly & Diner Era", shortLabel: "50's", years: '1950–1959' },
  { id: '1960s', label: "60's — Mod & Counterculture", shortLabel: "60's", years: '1960–1969' },
  { id: '1970s', label: "70's — Disco & Funk", shortLabel: "70's", years: '1970–1979' },
  { id: '1980s', label: "80's — Arcade Neon & Synthwave", shortLabel: "80's", years: '1980–1989' },
  { id: '1990s', label: "90's — Grunge & Skate Streetwear", shortLabel: "90's", years: '1990–1999' },
  { id: '2000s', label: "00's — Y2K & Pop Punk", shortLabel: "2000's", years: '2000–2009' },
  { id: '2010s', label: "10's — Indie & Athleisure", shortLabel: "2010's", years: '2010–2019' },
  { id: '2020s', label: "20's — Modern Techwear & Street", shortLabel: "2020's", years: '2020–Present' }
];

const CATEGORIES = [
  { id: 'hats', label: 'Hair / Hat', fullLabel: 'Hair or Hat (Pick One)', icon: '🎩' },
  { id: 'shirts', label: 'Shirts', fullLabel: 'Shirts, Bodices & Coats', icon: '👕' },
  { id: 'pants', label: 'Pants / Skirts', fullLabel: 'Pants, Breeches & Skirts', icon: '👖' },
  { id: 'shoes', label: 'Shoes', fullLabel: 'Shoes, Boots & Moccasins', icon: '🥾' },
  { id: 'accessories', label: 'Accessories', fullLabel: 'Aprons, Shawls & Gear', icon: '🧣' }
];

const PRESET_COLOR_DYES = [
  { id: 'default', name: 'Era Original', primary: null, secondary: null, highlight: null },
  { id: 'crimson', name: 'Prairie Madder Red', primary: '#ec273f', secondary: '#ac2847', highlight: '#f7e26b' },
  { id: 'cobalt', name: 'Indigo Calico Blue', primary: '#0098dc', secondary: '#1e579c', highlight: '#b2dce8' },
  { id: 'emerald', name: 'Homestead Sage Green', primary: '#44891a', secondary: '#2f484e', highlight: '#a3ce27' },
  { id: 'royal', name: 'Plum Gingham', primary: '#9c4176', secondary: '#6b2643', highlight: '#d77bba' },
  { id: 'gold', name: 'Harvest Wheat Gold', primary: '#f3a833', secondary: '#e98537', highlight: '#f7e26b' },
  { id: 'shadow', name: 'Iron Slate Grey', primary: '#5a6988', secondary: '#3a4466', highlight: '#c2c3c7' },
  { id: 'espresso', name: 'Buckskin & Chestnut', primary: '#8f563b', secondary: '#663931', highlight: '#e4a672' }
];

const SKIN_TONES = [
  {
    id: 'warm_ivory',
    name: 'Warm Ivory',
    outline: '#3c2415',
    shadow: '#d99568',
    base: '#f6c69f',
    highlight: '#ffe0c8',
    eye: '#140c1c',
    pupil: '#ffffff',
    mouth: '#8f563b',
    femaleMouth: '#ac2847'
  },
  {
    id: 'golden_tan',
    name: 'Golden Tan',
    outline: '#331c12',
    shadow: '#b87244',
    base: '#e09b67',
    highlight: '#f5be90',
    eye: '#140c1c',
    pupil: '#ffffff',
    mouth: '#663931',
    femaleMouth: '#9c4176'
  },
  {
    id: 'deep_umber',
    name: 'Deep Umber',
    outline: '#1f100a',
    shadow: '#593122',
    base: '#7d4934',
    highlight: '#9c6249',
    eye: '#140c1c',
    pupil: '#ffffff',
    mouth: '#3b1e14',
    femaleMouth: '#6b2643'
  },
  {
    id: 'rich_espresso',
    name: 'Rich Espresso',
    outline: '#140905',
    shadow: '#3b1e14',
    base: '#542d1f',
    highlight: '#70412f',
    eye: '#140c1c',
    pupil: '#ffffff',
    mouth: '#24110b',
    femaleMouth: '#442434'
  },
  {
    id: 'olive_bronze',
    name: 'Olive Bronze',
    outline: '#2b1d12',
    shadow: '#9e6b43',
    base: '#c68f63',
    highlight: '#e0b189',
    eye: '#140c1c',
    pupil: '#ffffff',
    mouth: '#663931',
    femaleMouth: '#ac2847'
  },
  {
    id: 'porcelain_rose',
    name: 'Porcelain Rose',
    outline: '#442434',
    shadow: '#e4a672',
    base: '#f6d6bd',
    highlight: '#ffffff',
    eye: '#140c1c',
    pupil: '#ffffff',
    mouth: '#8f563b',
    femaleMouth: '#ec273f'
  }
];

/**
 * 32x32 Character Base Boilerplate Templates.
 * Note: 'H' marks the valid Hair/Headwear cascade zone around the crown, temples, neck,
 * and back so long hair (rows y=2..18) flows seamlessly past the jawline onto the shoulders
 * and down the back without ever clipping!
 */
const BASE_BODY_TEMPLATES = [
  {
    id: 'standard_adventurer',
    name: 'Standard Frame',
    description: 'Balanced 16-bit JRPG adventurer proportions with distinct limbs and expressive face',
    front: [
      '................................',
      '......HHHHHHHHHHHHHHHHHHHH......',
      '.....HHHHHHHHHHHHHHHHHHHHHH.....',
      '....HHHHHHHHHHHHHHHHHHHHHHHH....',
      '....HHHHHHHOOOOOOOOOOHHHHHHH....',
      '....HHHHHHOLLLLLLLLLLOHHHHHH....',
      '....HHHHHHOFSSBBBBSSFOHHHHHH....',
      '....HHHHHOSBPEBLLBPEBSOHHHHH....',
      '....HHHHHOSBBEBSLBBEBSOHHHHH....',
      '....HHHHHHOBLBBBBBBBLOHHHHHH....',
      '.....HHHHHOSBBBMMBBBSOHHHHH.....',
      '.....HHHHHHOOSSBLSSOOHHHHHH.....',
      '.....HHHHHHHHOOSSSSOOHHHHHH.....',
      '.....HHHHOOSSLLLLBBSSOOHHHH.....',
      '.....HHOBLOLLBBBBBBSSOSBOHH.....',
      '.....HHOBOOLLBBBBBBSSOOBOHH.....',
      '......HOBOOSLBBBBBBSSOOBOH......',
      '......HOSOOSLBBBBBBSSOOSOH......',
      '.......OBOOSSSSSSSSSSOOBO.......',
      '.......OOHOSSBBBBBBSSOHOO.......',
      '.........HHOSSSSSSSSOHH.........',
      '.........HHOLBOHHOBSOHH.........',
      '.........HHOLBOHHOBSOHH.........',
      '.........HHOBSOHHOSBOHH.........',
      '.........HHOSSOHHOSSOHH.........',
      '.........HHOLBOHHOBSOHH.........',
      '.........HHOBSOHHOSBOHH.........',
      '.........HHOSSOHHOSSOHH.........',
      '..........HOSSOHHOSSOH..........',
      '..........OOSSOHHOSSOO..........',
      '..........OOOOO..OOOOO..........',
      '................................'
    ],
    side: [
      '................................',
      '........HHHHHHHHHHHHHH..........',
      '......HHHHHHHHHHHHHHHHHH........',
      '.....HHHHHHHHHHHHHHHHHHHH.......',
      '.....HHHHHHOOOOOOOOHHHHH........',
      '....HHHHHHOLLLLLLLLOHHHH........',
      '....HHHHHOBBBBBSSBOHHHH.........',
      '....HHHHHOBBBBBPEBOHHHH.........',
      '....HHHHHOSBBBBBEBLOO...........',
      '....HHHHHOSBBBBBBBLOO...........',
      '.....HHHHOSBBBBMMBO.............',
      '.....HHHHHOOSSSSLOO.............',
      '......HHHHHHOOSSBO..............',
      '......HHHHHHOOOOOOO.............',
      '.......HHHOSBBBBLLSO............',
      '.......HHHOSBOLBBLSO............',
      '.......HHHOSBOLBBLSO............',
      '.........HOSSOSBBLSO............',
      '...........OSOOBOO..............',
      '...........OSSSSSO..............',
      '...........OSSSSSO..............',
      '............OSBLO...............',
      '............OSBLO...............',
      '............OSBLO...............',
      '............OSSSO...............',
      '............OSBLO...............',
      '............OSBLO...............',
      '............OSSSO...............',
      '............OSSSO...............',
      '............OSSSSOO.............',
      '............OOOOOOO.............',
      '................................'
    ]
  },
  {
    id: 'broad_guardian',
    name: 'Broad Frame',
    description: 'Sturdy heroic JRPG build with broad shoulders, square jaw, and resolute stance',
    front: [
      '................................',
      '......HHHHHHHHHHHHHHHHHHHH......',
      '.....HHHHHHHHHHHHHHHHHHHHHH.....',
      '....HHHHHHHHHHHHHHHHHHHHHHHH....',
      '....HHHHHHHOOOOOOOOOOHHHHHHH....',
      '....HHHHHHOLLLLLLLLLLOHHHHHH....',
      '....HHHHHHOFSSBBBBSSFOHHHHHH....',
      '....HHHHHOSBPEBLLBPEBSOHHHHH....',
      '....HHHHHOSBBEBSLBBEBSOHHHHH....',
      '....HHHHHHOBLBBBBBBBLOHHHHHH....',
      '.....HHHHHOSBBBMMBBBSOHHHHH.....',
      '.....HHHHHHOOSSBLLSSOOHHHHH.....',
      '.....HHHHHHHOOSSSSSSOOHHHHH.....',
      '.....HHHOOOSSLLLLBBSSOOOHHH.....',
      '.....HHOBLOLLBBBBBBSSOSBOHH.....',
      '.....HHOBOOLLBBBBBBSSOOBOHH.....',
      '......HOBOOSLBBBBBBSSOOBOH......',
      '......HOSOOSLBBBBBBSSOOSOH......',
      '.......OBOOSSSSSSSSSSOOBO.......',
      '.......OOHOSSBBBBBBSSOHOO.......',
      '.........HHOSSSSSSSSOHH.........',
      '.........HHOLBOHHOBSOHH.........',
      '.........HHOLBOHHOBSOHH.........',
      '.........HHOBSOHHOSBOHH.........',
      '.........HHOSSOHHOSSOHH.........',
      '.........HHOLBOHHOBSOHH.........',
      '.........HHOBSOHHOSBOHH.........',
      '.........HHOSSOHHOSSOHH.........',
      '..........HOSSOHHOSSOH..........',
      '..........OOSSOHHOSSOO..........',
      '..........OOOOO..OOOOO..........',
      '................................'
    ],
    side: [
      '................................',
      '........HHHHHHHHHHHHHH..........',
      '......HHHHHHHHHHHHHHHHHH........',
      '.....HHHHHHHHHHHHHHHHHHHH.......',
      '.....HHHHHHOOOOOOOOHHHHH........',
      '....HHHHHHOLLLLLLLLOHHHH........',
      '....HHHHHOBBBBBSSBOHHHH.........',
      '....HHHHHOBBBBBPEBOHHHH.........',
      '....HHHHHOSBBBBBEBLOO...........',
      '....HHHHHOSBBBBBBBLOO...........',
      '.....HHHHOSBBBBMMBO.............',
      '.....HHHHHOOSSSSLOO.............',
      '......HHHHHHOOSSBO..............',
      '......HHHHHHOOOOOOO.............',
      '.......HHHOSBBBBLLSO............',
      '.......HHHOSBOLBBLSO............',
      '.......HHHOSBOLBBLSO............',
      '.........HOSSOSBBLSO............',
      '...........OSOOBOO..............',
      '...........OSSSSSO..............',
      '...........OSSSSSO..............',
      '............OSBLO...............',
      '............OSBLO...............',
      '............OSBLO...............',
      '............OSSSO...............',
      '............OSBLO...............',
      '............OSBLO...............',
      '............OSSSO...............',
      '............OSSSO...............',
      '............OSSSSOO.............',
      '............OOOOOOO.............',
      '................................'
    ]
  },
  {
    id: 'nimble_scout',
    name: 'Slender Frame',
    description: 'Slender, agile JRPG silhouette with tapered waist and graceful posture',
    front: [
      '................................',
      '......HHHHHHHHHHHHHHHHHHHH......',
      '.....HHHHHHHHHHHHHHHHHHHHHH.....',
      '....HHHHHHHHHHHHHHHHHHHHHHHH....',
      '....HHHHHHHOOOOOOOOOOHHHHHHH....',
      '....HHHHHHOLLLLLLLLLLOHHHHHH....',
      '....HHHHHHOFSSBBBBSSFOHHHHHH....',
      '....HHHHHOSBPEBLLBPEBSOHHHHH....',
      '....HHHHHOSBBEBSLBBEBSOHHHHH....',
      '....HHHHHHOBLBBBBBBBLOHHHHHH....',
      '.....HHHHHOSBBBMMBBBSOHHHHH.....',
      '......HHHHHOOSBLSOOHHHHHH.......',
      '......HHHHHHHOOSSOOHHHHHH.......',
      '.....HHHHHOOSSLLBBSSOOHHHHH.....',
      '.....HHHOBLOLLBBBBSSOSBOHHH.....',
      '.....HHHOBOOLLBBBBSSOOBOHHH.....',
      '......HHOBOOSLBBBBSSOOBOHH......',
      '......HHOSOOSLBBBBSSOOSOHH......',
      '.......HOBOOSSSSSSSSOOBOH.......',
      '.......HOOHOSSBBBBSSOHOOH.......',
      '.........HHOSSSSSSSSOHH.........',
      '.........HHOLBOHHOBSOHH.........',
      '.........HHOLBOHHOBSOHH.........',
      '.........HHOBSOHHOSBOHH.........',
      '.........HHOSSOHHOSSOHH.........',
      '.........HHOLBOHHOBSOHH.........',
      '.........HHOBSOHHOSBOHH.........',
      '.........HHOSSOHHOSSOHH.........',
      '..........HOSSOHHOSSOH..........',
      '..........OOSSOHHOSSOO..........',
      '..........OOOOO..OOOOO..........',
      '................................'
    ],
    side: [
      '................................',
      '........HHHHHHHHHHHHHH..........',
      '......HHHHHHHHHHHHHHHHHH........',
      '.....HHHHHHHHHHHHHHHHHHHH.......',
      '.....HHHHHHOOOOOOOOHHHHH........',
      '....HHHHHHOLLLLLLLLOHHHH........',
      '....HHHHHOBBBBBSSBOHHHH.........',
      '....HHHHHOBBBBBPEBOHHHH.........',
      '....HHHHHOSBBBBBEBLOO...........',
      '....HHHHHOSBBBBBBBLOO...........',
      '.....HHHHOSBBBBMMBO.............',
      '.....HHHHHOOSSSSLOO.............',
      '......HHHHHHOOSSBO..............',
      '......HHHHHHOOOOOOO.............',
      '.......HHHOSBBBBLLSO............',
      '.......HHHOSBOLBBLSO............',
      '.......HHHOSBOLBBLSO............',
      '.........HOSSOSBBLSO............',
      '...........OSOOBOO..............',
      '...........OSSSSSO..............',
      '...........OSSSSSO..............',
      '............OSBLO...............',
      '............OSBLO...............',
      '............OSBLO...............',
      '............OSSSO...............',
      '............OSBLO...............',
      '............OSBLO...............',
      '............OSSSO...............',
      '............OSSSO...............',
      '............OSSSSOO.............',
      '............OOOOOOO.............',
      '................................'
    ]
  }
];

function buildPixelsFromRowMap(startY, rows, palette, roleMap = {}) {
  const pixels = [];
  rows.forEach((rowStr, idx) => {
    const y = startY + idx;
    for (let x = 0; x < rowStr.length && x < GRID_SIZE; x++) {
      const ch = rowStr[x];
      if (ch !== '.' && ch !== ' ' && palette[ch]) {
        pixels.push([x, y, palette[ch], roleMap[ch] || null]);
      }
    }
  });
  return pixels;
}

function makeHatPreset(id, name, era, frontStartY, frontRows, sideStartY, sideRows, colors, gender = 'unisex') {
  const roleMap = { P: 'primary', S: 'secondary', L: 'highlight' };
  return {
    id,
    name,
    era,
    gender,
    subType: 'hat',
    author: 'Boilerplate',
    front: buildPixelsFromRowMap(frontStartY, frontRows, colors, roleMap),
    side: buildPixelsFromRowMap(sideStartY, sideRows, colors, roleMap)
  };
}

function makeHairPreset(id, name, era, frontStartY, frontRows, sideStartY, sideRows, colors, gender = 'unisex') {
  const roleMap = { P: 'primary', S: 'secondary', L: 'highlight' };
  return {
    id,
    name,
    era,
    gender,
    subType: 'hair',
    author: 'Boilerplate',
    front: buildPixelsFromRowMap(frontStartY, frontRows, colors, roleMap),
    side: buildPixelsFromRowMap(sideStartY, sideRows, colors, roleMap)
  };
}

function makeItemPreset(id, name, era, frontStartY, frontRows, sideStartY, sideRows, colors, gender = 'unisex') {
  const roleMap = { P: 'primary', S: 'secondary', L: 'highlight' };
  return {
    id,
    name,
    era,
    gender,
    author: 'Boilerplate',
    front: buildPixelsFromRowMap(frontStartY, frontRows, colors, roleMap),
    side: buildPixelsFromRowMap(sideStartY, sideRows, colors, roleMap)
  };
}

const PATTERNS = {
  // ======================== OREGON TRAIL BESPOKE PATTERNS ========================
  sunbonnetFront: [
    '...........OOOOOOOOOO...........',
    '.........OOLLLLPPPPLLOO.........',
    '........OPLLPPPPPPPPSSPO........',
    '........OPLLSSSSSSSSSSPO........',
    '........OPOO........OOSO........',
    '........OPO..........OSO........',
    '.........OSO........OSO.........',
    '..........OL........SO..........',
    '...........OL......SO...........',
    '............OO....OO............',
    '............OLL..LSO............'
  ],
  sunbonnetSide: [
    '..........OOOOOOOOOO............',
    '.........OLLLLPPPPPPO...........',
    '........OPLLPPPPPPPPSO..........',
    '........OPPPSSSSSSSSLLO.........',
    '........OPPPPSSO.....OO.........',
    '........OPPPSSO.................',
    '.........OSSSSO.................',
    '..........OO.LO.................',
    '.............LO.................',
    '.............SO.................',
    '.............OO.................'
  ],

  coonskinCapFront: [
    '...........OOOOOOOOOO...........',
    '.........OOLLPPPPLLSSOO.........',
    '........OPLLPSSSSSSSPPPO........',
    '........OSSSSLLLLLLSSSSO........',
    '.........OOOOOOOOOOOOOO.........',
    '.....................OO.........',
    '....................OPLO........',
    '....................OSSO........',
    '.....................OPLO.......',
    '.....................OSSO.......',
    '....................OPLO........',
    '....................OSSO........',
    '.....................OO.........'
  ],
  coonskinCapSide: [
    '..........OOOOOOOOOO............',
    '.........OPLLPPPPLLPPO..........',
    '........OOPPSSSSSSSSPPO.........',
    '........OSSSSLLLLLLSSSO.........',
    '.........OOOOOOOOOOOOOO.........',
    '.......OO.......................',
    '......OPLO......................',
    '......OSSO......................',
    '.....OPLO.......................',
    '.....OSSO.......................',
    '......OPLO......................',
    '.......OSO......................',
    '........OO......................'
  ],

  slouchHatFront: [
    '...........OOPP..PPOO...........',
    '.........OOLLPPLLPPSSOO.........',
    '.........OPLLPPPPPPSSPO.........',
    '........OOSSSSLLLLSSSSOO........',
    '......OOOOLLLLPPPPSSSSOOOO......'
  ],
  slouchHatSide: [
    '..........OOPPPPPOO.............',
    '.........OPLLPPPPSOO............',
    '.........OPPPPPPPSSO............',
    '........OOSSSSLLSSSSO...........',
    '......OOOOLLLLPPPPSSOOOO........'
  ],

  calicoBodiceFront: [
    '............OOOOOOOO............',
    '.........OOOOLPPPPLOOOO.........',
    '.......OLOOLLPSLLSPPOOPO........',
    '.......OPOOPPPSLLSPPOOSO........',
    '.......OSOOLLPSLLSPPOOSO........',
    '.......OLOOSSSSSSSSSOOLO........',
    '..........OOLLPPPPSOO...........',
    '..........OOOOOOOOOOO...........'
  ],
  calicoBodiceSide: [
    '............OOOOOO..............',
    '...........OOLPPPLOO............',
    '..........OSSOPLLPPPO...........',
    '...........OSOPLLPPPO...........',
    '...........OSOPLLPPPO...........',
    '............OOLLLSSOO...........',
    '...........OOS...SSOO...........',
    '...........OOOOOOOOOO...........'
  ],

  fringedBuckskinFront: [
    '.........OOOOO....OOOOO.........',
    '........OLOOPPOOOOPPSOPO........',
    '.......OPOOLLLLLLLLSOOSO........',
    '.......OSOOSLSLSLSLSOOSO........',
    '.......OLOOPPPSSPPPSSOLO........',
    '..........OOLLPPPPSOO...........',
    '...........OOOO..OOOO...........'
  ],
  fringedBuckskinSide: [
    '............OOOOOOO.............',
    '...........OSSOPLLLPO...........',
    '...........OSOLLLLLPO...........',
    '...........OSOSLSLSSO...........',
    '............OOLLLSSOO...........',
    '...........OOS...SSOO...........',
    '...........OOOOOOOOOO...........'
  ],

  prairieLongSkirtFront: [
    '...........OOOOOOOOOO...........',
    '..........OOLLPPPPSOO...........',
    '..........OPLLPPPPSPSO..........',
    '.........OOPLLPPPPSPSOO.........',
    '.........OPLLSSSSSSSPSO.........',
    '.........OPLLPPPPPPSSPO.........',
    '........OOPLLPPPPPPPSSOO........',
    '........OOOOOOOOOOOOOOOO........'
  ],
  prairieLongSkirtSide: [
    '...........OOOOOO...............',
    '...........OSSPPLO..............',
    '...........OSSPPLO..............',
    '..........OOSSPPLOO.............',
    '..........OSSSSSSSO.............',
    '..........OSSPPPLLO.............',
    '..........OSSPPPPLO.............',
    '..........OOOOOOOOO.............'
  ],

  pioneerApronFront: [
    '...........OOOOOOOOOO...........',
    '...........OLLLLLLPSO...........',
    '...........OLLLLLLPSO...........',
    '...........OLLPPPPLSO...........',
    '...........OLLLLLLPSO...........',
    '...........OPPPPPSSSO...........',
    '............OOOOOOOO............'
  ],
  pioneerApronSide: [
    '...........OOOOOO...............',
    '..........OSSSLLLO..............',
    '..............OLLO..............',
    '..............OPLO..............',
    '..............OLLO..............',
    '..............OSSO..............',
    '..............OOOO..............'
  ],

  trailBandanaFront: [
    '............OOOOOOOO............',
    '...........OLLLLPPPPO...........',
    '............OPLLSSPO............',
    '.............OOPSOO.............',
    '..............OOOO..............'
  ],
  trailBandanaSide: [
    '............OOOOOO..............',
    '...........OSSOLLPO.............',
    '..............OPLSO.............',
    '...............OPSO.............',
    '................OO..............'
  ],

  // ======================== HATS ========================
  beretFront: [
    '...........OOOOOOOOOO...........',
    '.........OOLLLLPPPPSSOO.........',
    '........OPLLPPPPPPPPSSPO........',
    '........OSSSSSSSSSSSSSSO........',
    '.........OOOOOOOOOOOOOO.........'
  ],
  beretSide: [
    '..........OOOOOOOOOO............',
    '.........OLLLLPPPPSSO...........',
    '........OPLLPPPPPPPPSO..........',
    '........OSSSSSSSSSSSSO..........',
    '.........OOOOOOOOOOOO...........'
  ],
  plumedHatFront: [
    '.........OOOOLLLLOOOO...........',
    '........OLLLLPPPPPPSSOO.........',
    '........OPLLPPPPPPPPSSPO........',
    '........OSSSSSSSSSSSSSSO........',
    '........OOOOOOOOOOOOOOOO........'
  ],
  plumedHatSide: [
    '........OOOOLLLLOOO.............',
    '.......OLLLLPPPPPPSO............',
    '.......OPLLPPPPPPPPSO...........',
    '.......OSSSSSSSSSSSSO...........',
    '........OOOOOOOOOOOOO...........'
  ],
  puritanCapotainFront: [
    '...........OOOOOOOOOO...........',
    '..........OPLLPPPPSSPO..........',
    '..........OPLLPPPPSSPO..........',
    '.........OOSSSSLLSSSSOO.........',
    '.......OOOOOOOOOOOOOOOOOO.......'
  ],
  puritanCapotainSide: [
    '..........OOOOOOOOO.............',
    '.........OPLLPPPPSPO............',
    '.........OPLLPPPPSPO............',
    '.........OSSSSLLSSSSO...........',
    '.......OOOOOOOOOOOOOOOO.........'
  ],
  tricorneFront: [
    '..........OOOO....OOOO..........',
    '.........OOLLOOOOOOLLOO.........',
    '........OOLLLLPPPPLLLSOO........',
    '........OPLLPPPPPPPPSSPO........',
    '........OOOOOOOOOOOOOOOO........'
  ],
  tricorneSide: [
    '.........OOOOOOOOOOO............',
    '........OOLLLLLLLLSSOO..........',
    '........OPLLPPPPPPPPSO..........',
    '........OSSSSSSSSSSSSO..........',
    '........OOOOOOOOOOOOOO..........'
  ],
  bicorneFront: [
    '...........OOOOOOOOOO...........',
    '.........OOLLLLPPLLSSOO.........',
    '........OPLLPPPPPPPPSSPO........',
    '........OSSSSSSSSSSSSSSO........',
    '.......OOOOOOOOOOOOOOOOOO.......'
  ],
  bicorneSide: [
    '..........OOOOOOOOOO............',
    '.........OLLLLPPLLSSO...........',
    '........OPLLPPPPPPPPSO..........',
    '........OSSSSSSSSSSSSO..........',
    '........OOOOOOOOOOOOOO..........'
  ],
  topHatFront: [
    '...........OOOOOOOOOO...........',
    '...........OPLLPPPPSO...........',
    '...........OPLLPPPPSO...........',
    '...........OSSSSLLSSO...........',
    '........OOOOOOOOOOOOOOOO........'
  ],
  topHatSide: [
    '..........OOOOOOOOOO............',
    '..........OPLLPPPPSO............',
    '..........OPLLPPPPSO............',
    '..........OSSSSLLSSO............',
    '........OOOOOOOOOOOOOO..........'
  ],
  bowlerDerbyFront: [
    '...........OOOOOOOOOO...........',
    '.........OOLLPPLLPPSSOO.........',
    '........OPLLPPPPPPPPSSPO........',
    '........OSSSSSSSSSSSSSSO........',
    '.......OOOOOOOOOOOOOOOOOO.......'
  ],
  bowlerDerbySide: [
    '..........OOOOOOOOO.............',
    '.........OPLLPPPPSPO............',
    '........OPLLPPPPPPPPSO..........',
    '........OSSSSSSSSSSSSO..........',
    '.......OOOOOOOOOOOOOOOO.........'
  ],
  boaterFedoraFront: [
    '...........OOOOOOOOOO...........',
    '.........OOLLPPPPPPSSOO.........',
    '.........OPLLPPPPPPSSPO.........',
    '........OOSSSSLLLLSSSSOO........',
    '.......OOOOOOOOOOOOOOOOOO.......'
  ],
  boaterFedoraSide: [
    '..........OOOOOOOOO.............',
    '.........OPLLPPPPSPO............',
    '.........OPLLPPPPSPO............',
    '........OOSSSSLLSSSSO...........',
    '.......OOOOOOOOOOOOOOOO.........'
  ],
  newsboyFlatCapFront: [
    '...........OOOOOOOOOO...........',
    '.........OOLLLLPPPPSSOO.........',
    '........OPLLPPPPPPPPSSPO........',
    '........OSSSSSSSSSSSSSSO........',
    '.........OOOOOOOOOOOOOO.........'
  ],
  newsboyFlatCapSide: [
    '..........OOOOOOOOOO............',
    '.........OLLLLPPPPSSO...........',
    '........OPLLPPPPPPPPSOO.........',
    '........OSSSSSSSSSSSSOO.........',
    '.........OOOOOOOOOOOOOO.........'
  ],
  clocheBellHatFront: [
    '...........OOOOOOOOOO...........',
    '.........OOLLLLPPPPSSOO.........',
    '........OPLLSSSSLLLLSSPO........',
    '........OSSSSSSSSSSSSSSO........',
    '.........OOOOOOOOOOOOOO.........'
  ],
  clocheBellHatSide: [
    '..........OOOOOOOOOO............',
    '.........OLLLLPPPPSSO...........',
    '........OPLLSSSSLLSSPO..........',
    '........OSSSSSSSSSSSSO..........',
    '.........OOOOOOOOOOOOO..........'
  ],
  steelHelmetFront: [
    '...........OOOOOOOOOO...........',
    '.........OOLLLLPPPPSSOO.........',
    '........OPLLPPPPPPPPSSPO........',
    '........OSSSSSSSSSSSSSSO........',
    '.......OOOOOOOOOOOOOOOOOO.......'
  ],
  steelHelmetSide: [
    '..........OOOOOOOOOO............',
    '.........OLLLLPPPPSSO...........',
    '........OPLLPPPPPPPPSO..........',
    '........OSSSSSSSSSSSSOO.........',
    '.......OOOOOOOOOOOOOOOO.........'
  ],
  capBeanieFront: [
    '...........OOOOOOOOOO...........',
    '.........OOLLLLPPPPSSOO.........',
    '........OPLLPPPPPPPPSSPO........',
    '........OSSSSSSSSSSSSSSO........',
    '.........OOOOOOOOOOOOOO.........'
  ],
  capBeanieSide: [
    '..........OOOOOOOOOO............',
    '.........OLLLLPPPPSSO...........',
    '........OPLLPPPPPPPPSO..........',
    '........OSSSSSSSSSSSSOO.........',
    '.........OOOOOOOOOOOOOO.........'
  ],
  backwardsCapFront: [
    '...........OOOOOOOOOO...........',
    '.........OOLLLLPPPPSSOO.........',
    '........OPLLPPPPSSSSPPPO........',
    '........OSSSSSLLLLSSSSSO........',
    '.........OOOOOOOOOOOOOO.........'
  ],
  backwardsCapSide: [
    '..........OOOOOOOOOO............',
    '.........OLLLLPPPPSSO...........',
    '.......OOPLLPPPPPPPPSO..........',
    '......OOSSSSSSSSSSSSSO..........',
    '......OOOOOOOOOOOOOOOO..........'
  ],
  headbandBandanaFront: [
    '................................',
    '................................',
    '.........OOOOOOOOOOOOOO.........',
    '.........OLLLLPPPPLLSSO.........',
    '.........OSSSSSSSSSSSSO.........'
  ],
  headbandBandanaSide: [
    '................................',
    '................................',
    '.........OOOOOOOOOOOO...........',
    '........OLLLLPPPPSSO............',
    '........OSSSSSSSSSSSO...........'
  ],

  // ======================== GENUINE LONG & SHORT HAIRSTYLES (y=2..18) ========================
  // 1. Long Flowing Chest-Length Waves (17 rows tall: y=2..18! Cascades over shoulders & down back)
  longWavyFlowFront: [
    '...........OOOOOOOOOO...........',
    '.........OOLLPPSSPPLLOO.........',
    '.......OPLLPPSO..OSPPLPO........',
    '......OOPPPPO......OPPPPOO......',
    '......OPSSOO........OOSSPO......',
    '.......OPSO..........OSPO.......',
    '......OOLPO..........OPLOO......',
    '......OPLPO..........OPLPO......',
    '......OPSPO..........OPSPO......',
    '.......OPSO..........OSPO.......',
    '......OOLPO..........OPLOO......',
    '.....OOPLPSO........OSPLPOO.....',
    '.....OPLPPSO........OSPPLPO.....',
    '......OPSSO..........OSSPO......',
    '.......OPO............OPO.......',
    '.......OO..............OO.......',
    '................................'
  ],
  longWavyFlowSide: [
    '..........OOOOOOOOOO............',
    '........OOLLPPPPPPSSOO..........',
    '.......OPLLPPPPPPPPSSPO.........',
    '......OOPLLPPPPSSO..OPO.........',
    '......OPLPPPPSSO.....OO.........',
    '.....OOPLPPPSSO.................',
    '.....OPLPPPSSO..................',
    '......OPPPPSSO..................',
    '......OOPLPPSSO.................',
    '.......OPLPPPSSO................',
    '.......OPPPPPSSO................',
    '........OPLPPSSO................',
    '........OPPPPSSO................',
    '.........OPSSSO.................',
    '..........OSSO..................',
    '...........OO...................',
    '................................'
  ],

  // 2. Long Over-the-Shoulder Twin Braids / Plaits (17 rows tall: y=2..18!)
  longTwinBraidsFront: [
    '...........OOOOOOOOOO...........',
    '.........OOLLPP..PPLLOO.........',
    '........OPLLPSO..OSPLLPO........',
    '........OPPPPO....OPPPPO........',
    '........OPSSO......OSSPO........',
    '........OPSO........OSPO........',
    '.........OPO........OPO.........',
    '........OOLPO......OPLOO........',
    '.........OPSO......OSPO.........',
    '........OOLPO......OPLOO........',
    '.........OPSO......OSPO.........',
    '........OOLPO......OPLOO........',
    '.........OSSO......OSSO.........',
    '........OPLPO......OPLPO........',
    '.........OPO........OPO.........',
    '.........OO..........OO.........'
  ],
  longTwinBraidsSide: [
    '..........OOOOOOOOOO............',
    '........OOLLPPPPPPSSOO..........',
    '.......OPLLPPPPPPPPSSPO.........',
    '.......OPPPPPPPSSO..OPO.........',
    '......OOPPPPPSSO.....OO.........',
    '......OPLLPPSSO.................',
    '.......OPPPPSSO.................',
    '.......OOLPPPO..................',
    '........OPSSSO..................',
    '.......OOLPPPO..................',
    '........OPSSSO..................',
    '.......OOLPPPO..................',
    '........OSSSSO..................',
    '.......OOPLPPOO.................',
    '........OPLPO...................',
    '.........OOO....................'
  ],

  // 3. Voluminous Long Curls / Baroque Ringlets / Glam Mane (17 rows tall: y=2..18!)
  curlsWigFront: [
    '..........OOOOOOOOOOOO..........',
    '........OOLLPPLLPPPPLLOO........',
    '.......OPLLPPPPPPPPPPSSPO.......',
    '.......OPLLSSO....OSSLLPO.......',
    '.......OPSSO........OSSPO.......',
    '.......OOLPO........OPLOO.......',
    '........OPSO........OSPO........',
    '.......OOLPO........OPLOO.......',
    '........OPSO........OSPO........',
    '.......OOLPO........OPLOO.......',
    '.......OPLPSO......OSPLPO.......',
    '........OPSSO......OSSPO........',
    '.........OPO........OPO.........',
    '.........OO..........OO.........'
  ],
  curlsWigSide: [
    '.........OOOOOOOOOOO............',
    '.......OOLLPPLLPPPPSOO..........',
    '......OPLLPPPPPPPPPPSSO.........',
    '......OPLLSSSSSSSSPPPPO.........',
    '......OPPPPSSO.......OO.........',
    '.....OOPLPPSSO..................',
    '......OPSSPSO...................',
    '.....OOPLPPSSO..................',
    '......OPSSPSO...................',
    '......OOPLPPSO..................',
    '.......OPSSPSO..................',
    '........OPLPSO..................',
    '.........OSSO...................',
    '..........OO....................'
  ],

  // 4. Long Cascading High Ponytail / Tied Queue (16 rows tall: y=2..17!)
  ponytailQueueFront: [
    '...........OOOOOOOOOO...........',
    '.........OOLLLLPPPPSSOO.........',
    '........OPLLPPPPPPPPSSPO........',
    '........OPSSOO....OOSSPO........',
    '........OPO..........OSO........',
    '.........OO..........OO.........',
    '................................',
    '....................OO..........',
    '...................OPLO.........',
    '...................OPSO.........',
    '....................OPLO........',
    '....................OPSO........',
    '....................OSSO........',
    '.....................OO.........'
  ],
  ponytailQueueSide: [
    '..........OOOOOOOOOO............',
    '........OOLLLLPPPPSSOO..........',
    '........OPLLPPPPPPPPSO..........',
    '........OSSSSSSSSSSPSO..........',
    '.....OOOOLLPPPSSO...OO..........',
    '....OPLLPPPPSSO.................',
    '....OPPPPPSSOO..................',
    '.....OPLPPSSO...................',
    '.....OPPPPSSO...................',
    '......OPLPSSO...................',
    '.......OPSSSO...................',
    '........OSSO....................',
    '.........OO.....................'
  ],

  // 5. Men's Long Frontier / Rocker / Viking Mane + Full Beard (16 rows tall: y=2..17!)
  frontierBeardHairFront: [
    '...........OOOOOOOOOO...........',
    '.........OOLLLLPPPPSSOO.........',
    '........OPLLPSO..OSPLLPO........',
    '........OPPPPO....OPPPPO........',
    '........OPSSO......OSSPO........',
    '........OPO..........OSO........',
    '.......OOLPO........OPSOO.......',
    '.......OPLPO........OPSPO.......',
    '.......OPLLSOOOOOOOOSSPPO.......',
    '........OPLLPPPPPPPPSSPO........',
    '.........OPLLPPPPPPSSPO.........',
    '..........OOLLPPPPSSOO..........',
    '...........OOPPPPSSOO...........',
    '.............OOOOOO.............'
  ],
  frontierBeardHairSide: [
    '..........OOOOOOOOOO............',
    '........OOLLLLPPPPSSOO..........',
    '.......OPLLPPPPPPPPSSPO.........',
    '.......OPPPPPPPSSO..OPO.........',
    '......OOPPPPSSO......OO.........',
    '......OPLPPPSSO.................',
    '.......OPPPPSSO.................',
    '.......OPLPPSSO..OO.............',
    '........OPPPPSSOOPPPO...........',
    '........OPLLPPPPPPPPO...........',
    '.........OPPPPPPPPPSO...........',
    '..........OOPPPPPPSSO...........',
    '............OOPPPSSO............',
    '..............OOOO..............'
  ],

  // 6. Men's & Women's Long Parted Shoulder-Cascade / Grunge / Surfer / Poet Locks (15 rows tall: y=2..16!)
  longPartedCascadeFront: [
    '...........OOOOOOOOOO...........',
    '.........OOLLPP..PPLLOO.........',
    '........OPLLPSO..OSPLLPO........',
    '........OPPPPO....OPPPPO........',
    '........OPSSO......OSSPO........',
    '........OPO..........OSO........',
    '.......OOLPO........OPSOO.......',
    '........OPLPO......OPSPO........',
    '.......OOPLPO......OPSPOO.......',
    '........OPLPO......OPSPO........',
    '.......OOPLSO......OSSPOO.......',
    '........OPLO........OLPO........',
    '.........OSO........OSO.........',
    '.........OO..........OO.........'
  ],
  longPartedCascadeSide: [
    '..........OOOOOOOOOO............',
    '........OOLLLLPPPPSSOO..........',
    '.......OPLLPPPPPPPPSSPO.........',
    '......OOPLLPPPPSSO..OPO.........',
    '......OPLPPPPSSO.....OO.........',
    '.....OOPLPPPSSO.................',
    '......OPPPPPSSO.................',
    '.....OOPLPPSSO..................',
    '......OPLPPSSO..................',
    '.......OPPPSSO..................',
    '.......OPLPSSO..................',
    '........OPSSSO..................',
    '.........OSSO...................',
    '..........OO....................'
  ],

  // 7. Pioneer Braided Chignon Bun + Long Tendrils (Medium-Long Updo)
  pioneerBunFront: [
    '............OOOOOOOO............',
    '...........OLLLLPPSSO...........',
    '.........OOOPPPPPPPPOOO.........',
    '........OPLLPPPPPPPPSSPO........',
    '........OPSSO......OSSPO........',
    '........OPO..........OSO........',
    '........OLPO........OPSO........',
    '.........OPO........OSO.........',
    '..........OO........OO..........',
    '................................'
  ],
  pioneerBunSide: [
    '.......OOOOOOO..................',
    '......OPLLPPPSO.................',
    '......OPPPPPPSSO................',
    '.....OOPLLPPPPSSOOO.............',
    '.....OPPPPPSSO...OPO............',
    '......OPPPPSSO....OO............',
    '.......OPLPSO...................',
    '........OSSO....................',
    '.........OO.....................'
  ],

  // 8. Classic Bob / Pageboy (Short-Medium option)
  bobPageboyFront: [
    '...........OOOOOOOOOO...........',
    '.........OOLLLLPPPPSSOO.........',
    '........OPLLPSO..OSPLLPO........',
    '........OPPPPO....OPPPPO........',
    '........OPSSO......OSSPO........',
    '........OPO..........OSO........',
    '........OLPO........OPSO........',
    '.........OPO........OSO.........',
    '..........OO........OO..........',
    '................................'
  ],
  bobPageboySide: [
    '..........OOOOOOOOOO............',
    '........OOLLLLPPPPSSOO..........',
    '.......OPLLPPPPPPPPSSPO.........',
    '.......OPPPPPPPSSO..OPO.........',
    '......OOPPPPSSO......OO.........',
    '.......OPLPPSSO.................',
    '.......OPPPPSSO.................',
    '........OPSSSO..................',
    '.........OSSO...................',
    '..........OO....................'
  ],

  // 9. Pompadour / Afro / Victory Rolls
  pompadourAfroFront: [
    '..........OOOOOOOOOOOO..........',
    '........OOLLLLPPPPPPSSOO........',
    '.......OPLLPPPPPPPPPPSSPO.......',
    '.......OPPSSOO....OOSSPPO.......',
    '........OPOO........OOSO........',
    '........OPO..........OSO........',
    '.........OO..........OO.........'
  ],
  pompadourAfroSide: [
    '.........OOOOOOOOOOOO...........',
    '.......OOLLLLPPPPPPSSOO.........',
    '......OPLLPPPPPPPPPPPPSO........',
    '......OPPPSSSSSSSSPPPPSO........',
    '.......OPPPPSSO......OO.........',
    '........OPPPSSO.................',
    '.........OOOOO..................'
  ],

  // 10. Short Spiky / Crop / Fade
  spikyCurtainsFront: [
    '.........OO..OOOOOO..OO.........',
    '.......OPLOOLLPPPPSOOLPO........',
    '.......OPLLPPPPLLPPPPSSO........',
    '........OPPPO......OSSPO........',
    '........OPO..........OSO........',
    '.........OSO........OSO.........',
    '..........OO........OO..........'
  ],
  spikyCurtainsSide: [
    '........OO..OOOOOOO.............',
    '.......OPLOOLLLLPPSSO...........',
    '......OOPLLPPPPPPPPSSO..........',
    '......OPPPPSSO.....OPO..........',
    '.......OPPPSSO......OO..........',
    '........OPSSO...................',
    '.........OOO....................'
  ],
  braidedCrownFront: [
    '..........OOOOOOOOOOOO..........',
    '.........OLLPPLLLLPPLLO.........',
    '........OOPPPPPPPPPPPPOO........',
    '........OSSSSSSSSSSSSSSO........',
    '........OSO..........OSO........',
    '........OPO..........OPO........',
    '........OSO..........OSO........',
    '........OPO..........OPO........',
    '........OSO..........OSO........',
    '........OPO..........OPO........',
    '........OSO..........OSO........',
    '.........OO..........OO.........'
  ],
  braidedCrownSide: [
    '..........OOOOOOOOOOO...........',
    '.........OLLPPLLLLPPLO..........',
    '.........OPPPPPPPPPPPPO.........',
    '.........OSSSSSSSSSSSSO.........',
    '........OOSSSSO.................',
    '........OPLPPPO.................',
    '........OPSPPPO.................',
    '........OPLPPPO.................',
    '........OPSPPPO.................',
    '........OPLPPPO.................',
    '.........OSSSSO.................',
    '..........OOOO..................'
  ],
  buzzFadeTopFront: [
    '...........OOOOOOOOOO...........',
    '.........OOLLLLPPPPSSOO.........',
    '.........OPLLPPPPPPSSPO.........',
    '.........OSSO......OSSO.........',
    '.........OSO........OSO.........'
  ],
  buzzFadeTopSide: [
    '..........OOOOOOOOOO............',
    '.........OLLLLPPPPSSO...........',
    '.........OPLLPPPPPPSO...........',
    '.........OSSSSO...OSO...........',
    '.........OSSSO..................'
  ],

  // ======================== SHIRTS & TOPS ========================
  doubletCoatFront: [
    '.........OOOOO....OOOOO.........',
    '........OLOOLLPPPPSSOOPO........',
    '.......OPOOPPPSSPPPSSOSO........',
    '.......OSOOLLPPPPSSOOOSO........',
    '.......OLOOSSSSSSSSSOOLO........',
    '..........OOLLPPPPSOO...........',
    '...........OOOO..OOOO...........'
  ],
  doubletCoatSide: [
    '............OOOOOOO.............',
    '...........OSSOPLLLPO...........',
    '...........OSOPPPSSPO...........',
    '...........OSOPLLLPPO...........',
    '............OOLLLSSOO...........',
    '...........OOS...SSOO...........',
    '...........OOOOOOOOOO...........'
  ],
  suitJacketFront: [
    '.........OOOOO....OOOOO.........',
    '.......OLOOPSSOOSSPPSOPO........',
    '.......OPOOSPPSSSSPPOOSO........',
    '.......OSOOPSSLLSSPPOOSO........',
    '.......OLOOSPPSSSSPPOOLO........',
    '..........OOLLPPPPSOO...........',
    '...........OOOOOOOOOO...........'
  ],
  suitJacketSide: [
    '............OOOOOOO.............',
    '...........OSSOPSSPPO...........',
    '...........OSOSPPSPSO...........',
    '...........OSSOPSSPPO...........',
    '............OOLLLSSOO...........',
    '...........OOS...SSOO...........',
    '...........OOOOOOOOOO...........'
  ],
  teeHoodieFront: [
    '.........OOOOO....OOOOO.........',
    '........OLOOLLPPPPSSOOPO........',
    '.......OPOOPPPPPPPPSSOSO........',
    '.......OSOOPPSSSSPPSSOSO........',
    '.......OLOOPPPPPPPPSSOLO........',
    '...........OSSSSSSSSO...........',
    '...........OOOOOOOOOO...........'
  ],
  teeHoodieSide: [
    '............OOOOOOO.............',
    '...........OSSOPLLLPO...........',
    '...........OSOPPPPPPO...........',
    '...........OSOPPSSSPO...........',
    '............OOPPPPPOO...........',
    '...........OOS...SSOO...........',
    '...........OOOOOOOOOO...........'
  ],
  vestJerkinFront: [
    '.........OOOOO....OOOOO.........',
    '........OSOOLLPPPPSSOOSO........',
    '........OSOOPPPSSPPPSOSO........',
    '........OSOOLLPPPPSSOOSO........',
    '........OLOOSSSSSSSSOOLO........',
    '..........OOLLPPPPSOO...........',
    '...........OOOOOOOOOO...........'
  ],
  vestJerkinSide: [
    '............OOOOOOO.............',
    '...........OSSOPLLLPO...........',
    '...........OSOPPPSSPO...........',
    '...........OSOPLLLPPO...........',
    '............OOSSSSSOO...........',
    '...........OOS...SSOO...........',
    '...........OOOOOOOOOO...........'
  ],
  capeletCoatFront: [
    '........OOOOOOOOOOOOOOOO........',
    '.......OLLLLPPPPPPPPSSPO........',
    '.......OPOOLLPSSSSPPSOOSO.......',
    '.......OSOOPPPPPPPPPPSOSO.......',
    '.......OLOOSSSSSSSSSSOOLO.......',
    '..........OOLLPPPPSOO...........',
    '...........OOOOOOOOOO...........'
  ],
  capeletCoatSide: [
    '...........OOOOOOOOO............',
    '..........OSSOPLLLPPO...........',
    '..........OSOPPPSSPPO...........',
    '...........OSOPPPPPPO...........',
    '............OOSSSSSOO...........',
    '...........OOS...SSOO...........',
    '...........OOOOOOOOOO...........'
  ],
  sleevelessTankFront: [
    '..........OOOO....OOOO..........',
    '..........OLLPOOOOPPSO..........',
    '..........OPLLPPPPSSPO..........',
    '..........OPLLPPPPSSPO..........',
    '..........OPPSSSSSSPPO..........',
    '...........OSSSSSSSSO...........',
    '...........OOOOOOOOOO...........'
  ],
  sleevelessTankSide: [
    '............OOOOOOO.............',
    '...........OSSOPLLLPO...........',
    '...........OSOPPPPPPO...........',
    '...........OSOPPSSSPO...........',
    '............OOSSSSSOO...........',
    '...........OOS...SSOO...........',
    '...........OOOOOOOOOO...........'
  ],
  turtleneckSweaterFront: [
    '............OOOOOOOO............',
    '.........OOOOLPPPPLOOOO.........',
    '........OLOOLLPPPPSSOOPO........',
    '.......OPOOPPPPPPPPSSOSO........',
    '.......OSOOPPSSSSPPSSOSO........',
    '........OLOOSSSSSSSSOOLO........',
    '...........OSSSSSSSSO...........',
    '...........OOOOOOOOOO...........'
  ],
  turtleneckSweaterSide: [
    '............OOOOOO..............',
    '...........OOLPPPLOO............',
    '...........OSSOPLLLPO...........',
    '...........OSOPPPPPPO...........',
    '...........OSOPPSSSPO...........',
    '............OOSSSSSOO...........',
    '...........OOS...SSOO...........',
    '...........OOOOOOOOOO...........'
  ],

  // ======================== PANTS & BOTTOMS ========================
  breechesShortsFront: [
    '...........OOOOOOOOOO...........',
    '...........OSSSSSSSSO...........',
    '...........OLPO..OPSO...........',
    '...........OLPO..OPSO...........',
    '...........OSSO..OSSO...........',
    '...........OOOO..OOOO...........'
  ],
  breechesShortsSide: [
    '...........OOOOOO...............',
    '...........OSSSSO...............',
    '............OSPLO...............',
    '............OSPLO...............',
    '............OSSSO...............',
    '............OOOOO...............'
  ],
  trousersJeansFront: [
    '...........OOOOOOOOOO...........',
    '...........OSSSSSSSSO...........',
    '...........OLPO..OPSO...........',
    '...........OLPO..OPSO...........',
    '...........OLLO..OLPO...........',
    '...........OPSO..OSSO...........',
    '...........OSSO..OSSO...........'
  ],
  trousersJeansSide: [
    '...........OOOOOO...............',
    '...........OSSSSO...............',
    '............OSPLO...............',
    '............OSPLO...............',
    '............OSLLO...............',
    '............OSPSO...............',
    '............OSSSO...............'
  ],
  bellBottomsBaggyFront: [
    '...........OOOOOOOOOO...........',
    '...........OSSSSSSSSO...........',
    '...........OLPO..OPSO...........',
    '...........OLPO..OPSO...........',
    '...........OLLO..OLPO...........',
    '...........OPSO..OSSO...........',
    '...........OLLO..OLLO...........'
  ],
  bellBottomsBaggySide: [
    '...........OOOOOO...............',
    '...........OSSSSO...............',
    '............OSPLO...............',
    '............OSPLO...............',
    '............OSLLO...............',
    '............OSPSO...............',
    '............OLLLO...............'
  ],
  pleatedSkirtKiltFront: [
    '...........OOOOOOOOOO...........',
    '..........OOLLPPPPSSOO..........',
    '..........OPLLPPPPSPSO..........',
    '.........OOPPSSSSSSPPOO.........',
    '.........OPLLPPPPPPSSPO.........',
    '.........OOOOOOOOOOOOOO.........'
  ],
  pleatedSkirtKiltSide: [
    '...........OOOOOO...............',
    '...........OSSPPLO..............',
    '...........OSSPPLO..............',
    '..........OOSSSSSOO.............',
    '..........OSSPPPPLO.............',
    '..........OOOOOOOOO.............'
  ],
  distressedJeansFront: [
    '...........OOOOOOOOOO...........',
    '...........OSSSSSSSSO...........',
    '...........OLPO..OPSO...........',
    '...........OLLO..OLLO...........',
    '...........OPSO..OSSO...........',
    '...........OLLO..OLLO...........',
    '...........OSSO..OSSO...........'
  ],
  distressedJeansSide: [
    '...........OOOOOO...............',
    '...........OSSSSO...............',
    '............OSPLO...............',
    '............OSLLO...............',
    '............OSPSO...............',
    '............OSLLO...............',
    '............OSSSO...............'
  ],

  // ======================== SHOES & BOOTS ========================
  bootsFront: [
    '...........OPSO..OSSO...........',
    '...........OLLO..OLSO...........',
    '..........OOLPO..OPSOO..........',
    '..........OOOOO..OOOOO..........'
  ],
  bootsSide: [
    '............OSPSO...............',
    '............OSLLO...............',
    '............OSSPLOO.............',
    '............OOOOOOO.............'
  ],
  sneakersShoesFront: [
    '...........OSSO..OSSO...........',
    '...........OLLO..OLLO...........',
    '..........OOLPO..OPSOO..........',
    '..........OOOOO..OOOOO..........'
  ],
  sneakersShoesSide: [
    '............OSSSO...............',
    '............OLLLO...............',
    '............OSPPLOO.............',
    '............OOOOOOO.............'
  ],
  tallRidingBootsFront: [
    '...........OLLO..OLSO...........',
    '...........OLPO..OPSO...........',
    '...........OPSO..OSSO...........',
    '..........OOLPO..OPSOO..........',
    '..........OOOOO..OOOOO..........'
  ],
  tallRidingBootsSide: [
    '............OSLLO...............',
    '............OSPLO...............',
    '............OSPSO...............',
    '............OSSPLOO.............',
    '............OOOOOOO.............'
  ],
  loafersLowShoesFront: [
    '...........OSSO..OSSO...........',
    '...........OLLO..OLSO...........',
    '...........OLPO..OPSO...........',
    '..........OOLPO..OPSOO..........',
    '..........OOOOO..OOOOO..........'
  ],
  loafersLowShoesSide: [
    '............OSSSO...............',
    '............OSLLO...............',
    '............OSPLO...............',
    '............OSSPLOO.............',
    '............OOOOOOO.............'
  ],

  // ======================== ACCESSORIES ========================
  tudorRuffFront: [
    '..........OOOOOOOOOOOO..........',
    '............OLLPPLLO............',
    '..........OOLLPPLLPPLLOO........'
  ],
  tudorRuffSide: [
    '...........OOOOOOOOOO...........',
    '............OLLPPLLO............',
    '...........OOLLPPLLLOO..........'
  ],
  collarRuffCravatFront: [
    '............OOOOOOOO............',
    '...........OOLLLLLLOO...........',
    '............OOLPPLOO............',
    '.............OOOOOO.............'
  ],
  collarRuffCravatSide: [
    '............OOOOOOOO............',
    '.............OOLLLLLLOO.........',
    '...............OOLPPLOO.........',
    '................OOOOOO..........'
  ],
  bowtieCollarFront: [
    '............OLLLLLLO............',
    '...........OOPPSSPPOO...........',
    '............OO....OO............'
  ],
  bowtieCollarSide: [
    '............OLLLLLLO............',
    '................OPPSPO..........',
    '.................OOOO...........'
  ],
  longNecktieFront: [
    '............OLLLLLLO............',
    '..............OPPO..............',
    '..............OPPO..............',
    '..............OSSO..............',
    '..............OPPO..............',
    '...............OO...............'
  ],
  longNecktieSide: [
    '............OLLLLLLO............',
    '................OPPO............',
    '.................OPPO...........',
    '.................OSSO...........',
    '.................OPPO...........',
    '..................OO............'
  ],
  pearlBeadNecklaceFront: [
    '............LP....PL............',
    '...........LP......PL...........',
    '............LPLPLLPL............',
    '..............PLLP..............'
  ],
  pearlBeadNecklaceSide: [
    '.............LP.................',
    '..............LP................',
    '...............LPLPLP...........',
    '.................PLLP...........'
  ],
  suspendersBracesFront: [
    '...........OO......OO...........',
    '...........OLO....OPO...........',
    '...........OLO....OLO...........',
    '...........OPO....OSO...........',
    '...........OPO....OSO...........',
    '...........OLO....OLO...........'
  ],
  suspendersBracesSide: [
    '.............OOOOO..............',
    '.............OPLPO..............',
    '.............OLLLO..............',
    '.............OPPSO..............',
    '.............OPPSO..............',
    '.............OLLLO..............'
  ],
  drapedScarfFront: [
    '..........OOOOOOOOOOOO..........',
    '.........OLLLLPPPPPPSSO.........',
    '.......OOPLLSSSSSSSSPPOO........',
    '........OSSLSLSLSLSLSLSO........',
    '.........OO..........OO.........',
    '................................'
  ],
  drapedScarfSide: [
    '...........OOOOOOOO.............',
    '..........OLLLLPPSSO............',
    '..........OPLLSSSSSO............',
    '..........OSSLSLSLSO............',
    '...........OO....OO.............',
    '................................'
  ],
  discoMedallionFront: [
    '............SO....OS............',
    '.............SO..OS.............',
    '..............SOOS..............',
    '.............OOLLOO.............',
    '.............OPPLPO.............',
    '..............OOOO..............'
  ],
  discoMedallionSide: [
    '.............SO.................',
    '..............SO................',
    '...............SO...............',
    '...............OOLLOO...........',
    '...............OPPLPO...........',
    '................OOOO............'
  ],
  neckHeadphonesFront: [
    '............OS....SO............',
    '..........OOSS....SSOO..........',
    '..........OPLSO..OSLPO..........',
    '...........OO......OO...........'
  ],
  neckHeadphonesSide: [
    '............OOO.................',
    '.............OSSO..OOO..........',
    '...............OOOPPLSO.........',
    '.................OOOO...........'
  ],
  crossbodyBagFront: [
    '...........OO...................',
    '............OLO.................',
    '.............OPO................',
    '..............OPO...............',
    '...............OSO..OO..........',
    '................OSOOLLO.........',
    '................OOLLPPO.........',
    '................OPPLLSO.........',
    '.................OOOOO..........'
  ],
  crossbodyBagSide: [
    '.............OO.................',
    '.............OLO................',
    '..............OPO...............',
    '..............OPO...............',
    '..............OSO..OO...........',
    '..............OSOOLLO...........',
    '.............OOLLPPO............',
    '.............OPPLLSO............',
    '..............OOOOO.............'
  ],
  beltChainSashFront: [
    '...........OOOOOOOOOO...........',
    '...........OSSPLLPOSSO..........',
    '...........OOOOOOOOOO...........'
  ],
  beltChainSashSide: [
    '............OOOOOOOOO...........',
    '............OSSPPPPLLO..........',
    '............OOOOOOOOO...........'
  ],
  fannyPackWaistFront: [
    '...........OOOOOOOOOO...........',
    '...........OSSOLLPPPPO..........',
    '.............OOPPPPPOO..........',
    '..............OOOOOOO...........'
  ],
  fannyPackWaistSide: [
    '............OOOOOOOOO...........',
    '............OSSOLLPPPO..........',
    '...............OOPPPPO..........',
    '................OOOOOO..........'
  ],
  monocleChainFront: [
    '.................OOOO...........',
    '.................OPLPO..........',
    '.................OOOOO..........',
    '....................SO..........',
    '...................SO...........'
  ],
  monocleChainSide: [
    '.................OOOO...........',
    '.................OPLPO..........',
    '.................OOOOO..........',
    '..................SO............',
    '.................SO.............'
  ],
  aviatorGogglesFront: [
    '..........OOOO....OOOO..........',
    '.........OSLPPOOOOPPLSO.........',
    '..........OPPPO..OPPPO..........',
    '...........OOO....OOO...........'
  ],
  aviatorGogglesSide: [
    '.................OOOO...........',
    '.........SSSSSSSSOLPPO..........',
    '.................OPPPO..........',
    '..................OOO...........'
  ],
  hornRimGlassesFront: [
    '.........OOOOOO..OOOOOO.........',
    '.........OPLPPOOOOPPLPO.........',
    '..........OPPPO..OPPPO..........',
    '..........OOOOO..OOOOO..........'
  ],
  hornRimGlassesSide: [
    '................OOOOOO..........',
    '..........OOOOOOOLPPPO..........',
    '.................OPPPO..........',
    '.................OOOOO..........'
  ],
  roundPeaceShadesFront: [
    '...........OOO....OOO...........',
    '.........OOPLPOOOOPPLOO.........',
    '..........OPPPO..OPPPO..........',
    '...........OOO....OOO...........'
  ],
  roundPeaceShadesSide: [
    '..................OOO...........',
    '..........SSSSSSSOLPPO..........',
    '.................OPPPO..........',
    '..................OOO...........'
  ],
  neonWayfarerShadesFront: [
    '.........PPPPPP..PPPPPP.........',
    '.........POSLLPPPPSSLOP.........',
    '..........OSSSO..OSSSO..........',
    '..........PPPPP..PPPPP..........'
  ],
  neonWayfarerShadesSide: [
    '................PPPPPP..........',
    '..........PPPPPPPOSLLP..........',
    '.................OSSSO..........',
    '.................PPPPP..........'
  ],
  y2kRimlessShadesFront: [
    '.........SPPLLSOOSLLPPS.........',
    '..........PPPP....PPPP..........'
  ],
  y2kRimlessShadesSide: [
    '..........SSSSSSSPLLPS..........',
    '.................PPPP...........'
  ]
};

/**
 * Full Multi-Option Era Catalog
 * Every era now includes genuine chest/shoulder-length Long Hairstyles for Women AND Men!
 */
const INITIAL_CLOTHING_BOILERPLATE = {
  hats: [
    {
      id: 'hat_none',
      name: 'None (Bare Head)',
      era: 'all',
      gender: 'unisex',
      subType: 'none',
      isNone: true,
      front: [],
      side: []
    },
    // ======================== OREGON TRAIL (4 Hats + 6 Hairstyles: Long Female & Long Male!) ========================
    makeHatPreset('hat_oregon_calico_sunbonnet', 'Pioneer Calico Sunbonnet', 'oregon_trail', 2, PATTERNS.sunbonnetFront, 2, PATTERNS.sunbonnetSide, { O: '#3a4466', P: '#31a2f2', S: '#1e579c', L: '#ffffff' }, 'female'),
    makeHatPreset('hat_oregon_prairie_rose_bonnet', 'Prairie Rose Gingham Bonnet', 'oregon_trail', 2, PATTERNS.sunbonnetFront, 2, PATTERNS.sunbonnetSide, { O: '#442434', P: '#ac2847', S: '#6b2643', L: '#f6d6bd' }, 'female'),
    makeHatPreset('hat_oregon_frontier_slouch', 'Wide-Brim Frontier Slouch Hat', 'oregon_trail', 2, PATTERNS.slouchHatFront, 2, PATTERNS.slouchHatSide, { O: '#2c1e31', P: '#8f563b', S: '#663931', L: '#b86f50' }, 'male'),
    makeHatPreset('hat_oregon_coonskin_cap', 'Scout Coonskin Trapper Cap', 'oregon_trail', 2, PATTERNS.coonskinCapFront, 2, PATTERNS.coonskinCapSide, { O: '#140c1c', P: '#8f563b', S: '#442434', L: '#e4a672' }, 'male'),
    makeHairPreset('hair_oregon_prairie_braids', 'Homestead Long Twin Braids (Chest-Length)', 'oregon_trail', 2, PATTERNS.longTwinBraidsFront, 2, PATTERNS.longTwinBraidsSide, { O: '#663931', P: '#e98537', S: '#ac2847', L: '#f7e26b' }, 'female'),
    makeHairPreset('hair_oregon_long_prairie_waves', 'Pioneer Long Flowing Chestnut Waves', 'oregon_trail', 2, PATTERNS.longWavyFlowFront, 2, PATTERNS.longWavyFlowSide, { O: '#2c1e31', P: '#8f563b', S: '#663931', L: '#e4a672' }, 'female'),
    makeHairPreset('hair_oregon_pioneer_bun', 'Pioneer Braided Bun & Tendrils', 'oregon_trail', 2, PATTERNS.pioneerBunFront, 2, PATTERNS.pioneerBunSide, { O: '#2c1e31', P: '#743f39', S: '#442434', L: '#b86f50' }, 'female'),
    makeHairPreset('hair_oregon_trail_beard', 'Mountain Man Long Mane & Trail Beard', 'oregon_trail', 2, PATTERNS.frontierBeardHairFront, 2, PATTERNS.frontierBeardHairSide, { O: '#140c1c', P: '#663931', S: '#442434', L: '#8f563b' }, 'male'),
    makeHairPreset('hair_oregon_scout_long_locks', 'Frontier Scout Long Shoulder Locks', 'oregon_trail', 2, PATTERNS.longPartedCascadeFront, 2, PATTERNS.longPartedCascadeSide, { O: '#2c1e31', P: '#743f39', S: '#442434', L: '#b86f50' }, 'male'),
    makeHairPreset('hair_oregon_wagon_part', 'Wagoner Short Side-Part', 'oregon_trail', 2, PATTERNS.bobPageboyFront, 2, PATTERNS.bobPageboySide, { O: '#140c1c', P: '#442434', S: '#2c1e31', L: '#743f39' }, 'male'),

    // 1500s (Long Female + Long Male + Hats)
    makeHatPreset('hat_1500s_tudor_bonnet', '1500s Tudor Flat Bonnet', '1500s', 2, PATTERNS.beretFront, 2, PATTERNS.beretSide, { O: '#2c1e31', P: '#ac2847', S: '#6b2643', L: '#f7e26b' }, 'male'),
    makeHatPreset('hat_1500s_feathered_cap', '1500s Plumed French Hood', '1500s', 2, PATTERNS.plumedHatFront, 2, PATTERNS.plumedHatSide, { O: '#140c1c', P: '#2f484e', S: '#44891a', L: '#f7e26b' }, 'female'),
    makeHairPreset('hair_1500s_maiden_waves', '1500s Renaissance Long Flowing Tresses', '1500s', 2, PATTERNS.longWavyFlowFront, 2, PATTERNS.longWavyFlowSide, { O: '#663931', P: '#e98537', S: '#b86f50', L: '#f7e26b' }, 'female'),
    makeHairPreset('hair_1500s_braided_coronet', '1500s Long Golden Braided Plaits', '1500s', 2, PATTERNS.longTwinBraidsFront, 2, PATTERNS.longTwinBraidsSide, { O: '#663931', P: '#f3a833', S: '#ac2847', L: '#f7e26b' }, 'female'),
    makeHairPreset('hair_1500s_courtier_locks', '1500s Courtier Long Shoulder Locks', '1500s', 2, PATTERNS.longPartedCascadeFront, 2, PATTERNS.longPartedCascadeSide, { O: '#2c1e31', P: '#743f39', S: '#442434', L: '#b86f50' }, 'male'),
    makeHairPreset('hair_1500s_pageboy', '1500s Tudor Pageboy Bob', '1500s', 2, PATTERNS.bobPageboyFront, 2, PATTERNS.bobPageboySide, { O: '#2c1e31', P: '#663931', S: '#442434', L: '#8f563b' }, 'male'),

    // 1600s (Long Female + Long Male + Hats)
    makeHatPreset('hat_1600s_cavalier', '1600s Plumed Cavalier Hat', '1600s', 2, PATTERNS.plumedHatFront, 2, PATTERNS.plumedHatSide, { O: '#140c1c', P: '#262b44', S: '#3a4466', L: '#ffffff' }, 'male'),
    makeHatPreset('hat_1600s_capotain', '1600s Puritan Bonnet & Capotain', '1600s', 2, PATTERNS.puritanCapotainFront, 2, PATTERNS.puritanCapotainSide, { O: '#140c1c', P: '#2c1e31', S: '#663931', L: '#f7e26b' }, 'female'),
    makeHairPreset('hair_1600s_ringlets', '1600s Baroque Long Cascading Ringlets', '1600s', 2, PATTERNS.curlsWigFront, 2, PATTERNS.curlsWigSide, { O: '#2c1e31', P: '#8f563b', S: '#663931', L: '#e4a672' }, 'female'),
    makeHairPreset('hair_1600s_flowing_waves', '1600s Musketeer Long Flowing Mane', '1600s', 2, PATTERNS.longWavyFlowFront, 2, PATTERNS.longWavyFlowSide, { O: '#140c1c', P: '#442434', S: '#2c1e31', L: '#743f39' }, 'male'),
    makeHairPreset('hair_1600s_cavalier_curls', '1600s Cavalier Long Royal Curls', '1600s', 2, PATTERNS.curlsWigFront, 2, PATTERNS.curlsWigSide, { O: '#2c1e31', P: '#663931', S: '#442434', L: '#b86f50' }, 'male'),

    // 1700s (Long Female + Long Male + Hats)
    makeHatPreset('hat_1700s_tricorne', '1700s Colonial Tricorne Hat', '1700s', 2, PATTERNS.tricorneFront, 2, PATTERNS.tricorneSide, { O: '#140c1c', P: '#262b44', S: '#1e579c', L: '#f7e26b' }, 'male'),
    makeHatPreset('hat_1700s_bicorne', '1700s Georgian Plumed Mob Cap', '1700s', 2, PATTERNS.bicorneFront, 2, PATTERNS.bicorneSide, { O: '#140c1c', P: '#1e579c', S: '#ac2847', L: '#f7e26b' }, 'female'),
    makeHairPreset('hair_1700s_powdered_wig', '1700s Long Powdered Court Ringlets', '1700s', 2, PATTERNS.curlsWigFront, 2, PATTERNS.curlsWigSide, { O: '#5a6988', P: '#c2c3c7', S: '#8b93af', L: '#ffffff' }, 'female'),
    makeHairPreset('hair_1700s_tied_queue', '1700s Colonial Long Tied Queue Tail', '1700s', 2, PATTERNS.ponytailQueueFront, 2, PATTERNS.ponytailQueueSide, { O: '#2c1e31', P: '#8f563b', S: '#663931', L: '#e4a672' }, 'male'),
    makeHairPreset('hair_1700s_frontiersman_long', '1700s Colonial Long Flowing Locks', '1700s', 2, PATTERNS.longPartedCascadeFront, 2, PATTERNS.longPartedCascadeSide, { O: '#140c1c', P: '#442434', S: '#2c1e31', L: '#743f39' }, 'male'),

    // 1800s (Long Female + Long Male + Hats)
    makeHatPreset('hat_1800s_top_hat', '1800s Victorian Silk Top Hat', '1800s', 2, PATTERNS.topHatFront, 2, PATTERNS.topHatSide, { O: '#140c1c', P: '#262b44', S: '#ac2847', L: '#5a6988' }, 'male'),
    makeHatPreset('hat_1800s_bowler_derby', '1800s Victorian Ribbon Bonnet', '1800s', 2, PATTERNS.clocheBellHatFront, 2, PATTERNS.clocheBellHatSide, { O: '#442434', P: '#9c4176', S: '#6b2643', L: '#d77bba' }, 'female'),
    makeHairPreset('hair_1800s_long_ringlets', '1800s Victorian Long Cascading Curls', '1800s', 2, PATTERNS.curlsWigFront, 2, PATTERNS.curlsWigSide, { O: '#2c1e31', P: '#743f39', S: '#442434', L: '#b86f50' }, 'female'),
    makeHairPreset('hair_1800s_coiled_updo', '1800s Victorian Braided Crown & Plaits', '1800s', 2, PATTERNS.longTwinBraidsFront, 2, PATTERNS.longTwinBraidsSide, { O: '#140c1c', P: '#262b44', S: '#140c1c', L: '#5a6988' }, 'female'),
    makeHairPreset('hair_1800s_poet_locks', '1800s Romantic Poet Long Locks', '1800s', 2, PATTERNS.longPartedCascadeFront, 2, PATTERNS.longPartedCascadeSide, { O: '#140c1c', P: '#442434', S: '#2c1e31', L: '#743f39' }, 'male'),
    makeHairPreset('hair_1800s_side_part', '1800s Victorian Short Sideburn Part', '1800s', 2, PATTERNS.bobPageboyFront, 2, PATTERNS.bobPageboySide, { O: '#140c1c', P: '#442434', S: '#2c1e31', L: '#743f39' }, 'male'),

    // 1900-1920 (Long Female + Long Male + Hats)
    makeHatPreset('hat_1900_boater', '1900–1920 Straw Boater Hat', '1900_1920', 2, PATTERNS.boaterFedoraFront, 2, PATTERNS.boaterFedoraSide, { O: '#663931', P: '#f7e26b', S: '#ac2847', L: '#ffffff' }, 'female'),
    makeHatPreset('hat_1900_newsboy_cap', '1900–1920 Tweed Newsboy Cap', '1900_1920', 2, PATTERNS.newsboyFlatCapFront, 2, PATTERNS.newsboyFlatCapSide, { O: '#2c1e31', P: '#8f563b', S: '#663931', L: '#e4a672' }, 'male'),
    makeHairPreset('hair_1900_gibson_updo', '1900–1920 Edwardian Long Flowing Waves', '1900_1920', 2, PATTERNS.longWavyFlowFront, 2, PATTERNS.longWavyFlowSide, { O: '#2c1e31', P: '#8f563b', S: '#663931', L: '#e4a672' }, 'female'),
    makeHairPreset('hair_1900_bohemian_long', '1900–1920 Bohemian Artist Long Locks', '1900_1920', 2, PATTERNS.longPartedCascadeFront, 2, PATTERNS.longPartedCascadeSide, { O: '#140c1c', P: '#663931', S: '#442434', L: '#8f563b' }, 'male'),
    makeHairPreset('hair_1900_center_part', '1900–1920 Dapper Short Center-Part', '1900_1920', 2, PATTERNS.spikyCurtainsFront, 2, PATTERNS.spikyCurtainsSide, { O: '#140c1c', P: '#442434', S: '#2c1e31', L: '#743f39' }, 'male'),

    // 1921-1940 (Long Female + Short Flapper + Long Male + Hats)
    makeHatPreset('hat_1920_fedora_cloche', '1921–1940 Jazz Age Fedora', '1921_1940', 2, PATTERNS.boaterFedoraFront, 2, PATTERNS.boaterFedoraSide, { O: '#140c1c', P: '#5a6988', S: '#262b44', L: '#c2c3c7' }, 'male'),
    makeHatPreset('hat_1920_flapper_cloche', '1921–1940 Art Deco Bell Cloche', '1921_1940', 2, PATTERNS.clocheBellHatFront, 2, PATTERNS.clocheBellHatSide, { O: '#442434', P: '#ac2847', S: '#6b2643', L: '#f7e26b' }, 'female'),
    makeHairPreset('hair_1920_hollywood_waves', '1921–1940 Silver Screen Long Waves', '1921_1940', 2, PATTERNS.longWavyFlowFront, 2, PATTERNS.longWavyFlowSide, { O: '#663931', P: '#f3a833', S: '#e98537', L: '#f7e26b' }, 'female'),
    makeHairPreset('hair_1920_finger_wave', '1921–1940 Flapper Finger-Wave Bob', '1921_1940', 2, PATTERNS.bobPageboyFront, 2, PATTERNS.bobPageboySide, { O: '#140c1c', P: '#2c1e31', S: '#140c1c', L: '#5a6988' }, 'female'),
    makeHairPreset('hair_1920_long_swept', '1921–1940 Maestro Long Swept Locks', '1921_1940', 2, PATTERNS.longPartedCascadeFront, 2, PATTERNS.longPartedCascadeSide, { O: '#140c1c', P: '#262b44', S: '#140c1c', L: '#5a6988' }, 'male'),
    makeHairPreset('hair_1920_slick_idol', '1921–1940 Matinee Slicked Short Hair', '1921_1940', 2, PATTERNS.buzzFadeTopFront, 2, PATTERNS.buzzFadeTopSide, { O: '#140c1c', P: '#140c1c', S: '#262b44', L: '#8b93af' }, 'male'),

    // 1941-1950 (Long Female + Long Male + Hats)
    makeHatPreset('hat_1941_garrison_cap', '1941–1950 Aviator Garrison Cap', '1941_1950', 2, PATTERNS.capBeanieFront, 2, PATTERNS.capBeanieSide, { O: '#140c1c', P: '#44891a', S: '#2f484e', L: '#f7e26b' }, 'female'),
    makeHatPreset('hat_1941_m1_helmet', '1941–1950 Olive Steel Helmet', '1941_1950', 2, PATTERNS.steelHelmetFront, 2, PATTERNS.steelHelmetSide, { O: '#140c1c', P: '#2f484e', S: '#44891a', L: '#a3ce27' }, 'male'),
    makeHairPreset('hair_1941_victory_rolls', '1941–1950 Long Pin-Up Victory Waves', '1941_1950', 2, PATTERNS.longWavyFlowFront, 2, PATTERNS.longWavyFlowSide, { O: '#442434', P: '#ac2847', S: '#6b2643', L: '#de5d3a' }, 'female'),
    makeHairPreset('hair_1941_long_curls', '1941–1950 Starlet Long Shoulder Curls', '1941_1950', 2, PATTERNS.curlsWigFront, 2, PATTERNS.curlsWigSide, { O: '#2c1e31', P: '#8f563b', S: '#663931', L: '#e4a672' }, 'female'),
    makeHairPreset('hair_1941_rebel_long', '1941–1950 Seafarer Long Flowing Locks', '1941_1950', 2, PATTERNS.longPartedCascadeFront, 2, PATTERNS.longPartedCascadeSide, { O: '#2c1e31', P: '#663931', S: '#442434', L: '#b86f50' }, 'male'),
    makeHairPreset('hair_1941_officer_crop', '1941–1950 Regulations Short Side-Part', '1941_1950', 2, PATTERNS.buzzFadeTopFront, 2, PATTERNS.buzzFadeTopSide, { O: '#2c1e31', P: '#743f39', S: '#663931', L: '#b86f50' }, 'male'),

    // 1950s (Long Female + Long Male + Hats)
    makeHatPreset('hat_1950s_diner_cap', "50's Soda Pop Visor Cap", '1950s', 2, PATTERNS.capBeanieFront, 2, PATTERNS.capBeanieSide, { O: '#262b44', P: '#ffffff', S: '#ec273f', L: '#b2dce8' }, 'female'),
    makeHatPreset('hat_1950s_fedora_trilby', "50's Mid-Century Grey Trilby", '1950s', 2, PATTERNS.boaterFedoraFront, 2, PATTERNS.boaterFedoraSide, { O: '#140c1c', P: '#8b93af', S: '#262b44', L: '#ffffff' }, 'male'),
    makeHairPreset('hair_1950s_hop_ponytail', "50's Sock-Hop Long Cascading Ponytail", '1950s', 2, PATTERNS.ponytailQueueFront, 2, PATTERNS.ponytailQueueSide, { O: '#663931', P: '#f3a833', S: '#e98537', L: '#f7e26b' }, 'female'),
    makeHairPreset('hair_1950s_page_curls', "50's Drive-In Long Flowing Curls", '1950s', 2, PATTERNS.longWavyFlowFront, 2, PATTERNS.longWavyFlowSide, { O: '#2c1e31', P: '#743f39', S: '#442434', L: '#b86f50' }, 'female'),
    makeHairPreset('hair_1950s_long_rockabilly', "50's Outlaw Long Drape Mane", '1950s', 2, PATTERNS.longPartedCascadeFront, 2, PATTERNS.longPartedCascadeSide, { O: '#140c1c', P: '#262b44', S: '#140c1c', L: '#5a6988' }, 'male'),
    makeHairPreset('hair_1950s_grease_pomp', "50's Rockabilly Short Pompadour", '1950s', 2, PATTERNS.pompadourAfroFront, 2, PATTERNS.pompadourAfroSide, { O: '#140c1c', P: '#262b44', S: '#140c1c', L: '#5a6988' }, 'male'),

    // 1960s (Long Female + Long Male + Hats)
    makeHatPreset('hat_1960s_pillbox_beret', "60's Mod Pillbox Beret", '1960s', 2, PATTERNS.beretFront, 2, PATTERNS.beretSide, { O: '#442434', P: '#d77bba', S: '#9c4176', L: '#ffffff' }, 'female'),
    makeHatPreset('hat_1960s_flower_band', "60's Woodstock Peace Headband", '1960s', 2, PATTERNS.headbandBandanaFront, 2, PATTERNS.headbandBandanaSide, { O: '#442434', P: '#ec273f', S: '#f3a833', L: '#f7e26b' }, 'unisex'),
    makeHairPreset('hair_1960s_beehive_long', "60's Bohemian Waist-Length Waves", '1960s', 2, PATTERNS.longWavyFlowFront, 2, PATTERNS.longWavyFlowSide, { O: '#2c1e31', P: '#8f563b', S: '#663931', L: '#e4a672' }, 'female'),
    makeHairPreset('hair_1960s_hippie_long_male', "60's Woodstock Long Hippie Locks", '1960s', 2, PATTERNS.longPartedCascadeFront, 2, PATTERNS.longPartedCascadeSide, { O: '#2c1e31', P: '#743f39', S: '#442434', L: '#b86f50' }, 'male'),
    makeHairPreset('hair_1960s_mop_top', "60's British Invasion Mop-Top", '1960s', 2, PATTERNS.bobPageboyFront, 2, PATTERNS.bobPageboySide, { O: '#140c1c', P: '#663931', S: '#442434', L: '#8f563b' }, 'male'),

    // 1970s (Long Female + Long Male + Hats)
    makeHatPreset('hat_1970s_wide_brim', "70's Funk Wide-Brim Hat", '1970s', 2, PATTERNS.boaterFedoraFront, 2, PATTERNS.boaterFedoraSide, { O: '#442434', P: '#e98537', S: '#743f39', L: '#f7e26b' }, 'male'),
    makeHatPreset('hat_1970s_crochet_tam', "70's Knitted Slouch Tam", '1970s', 2, PATTERNS.beretFront, 2, PATTERNS.beretSide, { O: '#2c1e31', P: '#a3ce27', S: '#44891a', L: '#f7e26b' }, 'female'),
    makeHairPreset('hair_1970s_feathered_shag', "70's Long Feathered Roller Waves", '1970s', 2, PATTERNS.longWavyFlowFront, 2, PATTERNS.longWavyFlowSide, { O: '#663931', P: '#e98537', S: '#b86f50', L: '#f7e26b' }, 'female'),
    makeHairPreset('hair_1970s_rock_mane_male', "70's Classic Rock Long Flowing Mane", '1970s', 2, PATTERNS.longPartedCascadeFront, 2, PATTERNS.longPartedCascadeSide, { O: '#2c1e31', P: '#8f563b', S: '#663931', L: '#e4a672' }, 'male'),
    makeHairPreset('hair_1970s_disco_afro', "70's Natural Disco Afro", '1970s', 2, PATTERNS.pompadourAfroFront, 2, PATTERNS.pompadourAfroSide, { O: '#140c1c', P: '#442434', S: '#2c1e31', L: '#743f39' }, 'unisex'),

    // 1980s (Long Female + Long Male + Hats)
    makeHatPreset('hat_1980s_neon_snapback', "80's Arcade Neon Snapback", '1980s', 2, PATTERNS.capBeanieFront, 2, PATTERNS.capBeanieSide, { O: '#140c1c', P: '#ec273f', S: '#0098dc', L: '#f7e26b' }, 'male'),
    makeHatPreset('hat_1980s_aerobics_band', "80's Neon Terries Sweatband", '1980s', 2, PATTERNS.headbandBandanaFront, 2, PATTERNS.headbandBandanaSide, { O: '#140c1c', P: '#31a2f2', S: '#ec273f', L: '#ffffff' }, 'female'),
    makeHairPreset('hair_1980s_synth_mullet', "80's Big Permed Long Glam Curls", '1980s', 2, PATTERNS.curlsWigFront, 2, PATTERNS.curlsWigSide, { O: '#442434', P: '#f3a833', S: '#e98537', L: '#f7e26b' }, 'female'),
    makeHairPreset('hair_1980s_side_pony_long', "80's Mall-Queen Long High Ponytail", '1980s', 2, PATTERNS.ponytailQueueFront, 2, PATTERNS.ponytailQueueSide, { O: '#442434', P: '#de5d3a', S: '#ac2847', L: '#f7e26b' }, 'female'),
    makeHairPreset('hair_1980s_metal_mane_male', "80's Heavy Metal Long Shredder Mane", '1980s', 2, PATTERNS.longWavyFlowFront, 2, PATTERNS.longWavyFlowSide, { O: '#140c1c', P: '#262b44', S: '#140c1c', L: '#5a6988' }, 'male'),
    makeHairPreset('hair_1980s_hi_top_fade', "80's Sculpted Hi-Top Fade", '1980s', 2, PATTERNS.buzzFadeTopFront, 2, PATTERNS.buzzFadeTopSide, { O: '#140c1c', P: '#140c1c', S: '#262b44', L: '#5a6988' }, 'male'),

    // 1990s (Long Female + Long Male + Hats)
    makeHatPreset('hat_1990s_bucket_beanie', "90's Skater Knit Beanie", '1990s', 2, PATTERNS.capBeanieFront, 2, PATTERNS.capBeanieSide, { O: '#140c1c', P: '#2f484e', S: '#140c1c', L: '#a3ce27' }, 'female'),
    makeHatPreset('hat_1990s_backwards_cap', "90's Backwards Fresh Snapback", '1990s', 2, PATTERNS.backwardsCapFront, 2, PATTERNS.backwardsCapSide, { O: '#140c1c', P: '#ec273f', S: '#262b44', L: '#ffffff' }, 'male'),
    makeHairPreset('hair_1990s_rachel_layers', "90's Long Layered Supermodel Blowout", '1990s', 2, PATTERNS.longWavyFlowFront, 2, PATTERNS.longWavyFlowSide, { O: '#442434', P: '#b86f50', S: '#743f39', L: '#e4a672' }, 'female'),
    makeHairPreset('hair_1990s_curtains', "90's Seattle Grunge Long Shoulder Locks", '1990s', 2, PATTERNS.longPartedCascadeFront, 2, PATTERNS.longPartedCascadeSide, { O: '#663931', P: '#f3a833', S: '#b86f50', L: '#f7e26b' }, 'male'),

    // 2000s (Long Female + Long Male + Hats)
    makeHatPreset('hat_2000s_trucker_cap', "2000's Y2K Mesh Trucker Hat", '2000s', 2, PATTERNS.capBeanieFront, 2, PATTERNS.capBeanieSide, { O: '#140c1c', P: '#9c4176', S: '#ffffff', L: '#d77bba' }, 'female'),
    makeHatPreset('hat_2000s_visor_beanie', "2000's Pop-Punk Striped Beanie", '2000s', 2, PATTERNS.beretFront, 2, PATTERNS.beretSide, { O: '#140c1c', P: '#262b44', S: '#ec273f', L: '#c2c3c7' }, 'male'),
    makeHairPreset('hair_2000s_emo_swoop', "2000's Long Scene Straightened Locks", '2000s', 2, PATTERNS.longWavyFlowFront, 2, PATTERNS.longWavyFlowSide, { O: '#140c1c', P: '#140c1c', S: '#ac2847', L: '#ec273f' }, 'female'),
    makeHairPreset('hair_2000s_surfer_long_male', "2000's California Surfer Long Shag", '2000s', 2, PATTERNS.longPartedCascadeFront, 2, PATTERNS.longPartedCascadeSide, { O: '#663931', P: '#e98537', S: '#b86f50', L: '#f7e26b' }, 'male'),
    makeHairPreset('hair_2000s_frosted_spikes', "2000's Pop-Punk Frosted Short Spikes", '2000s', 2, PATTERNS.spikyCurtainsFront, 2, PATTERNS.spikyCurtainsSide, { O: '#2c1e31', P: '#663931', S: '#442434', L: '#f7e26b' }, 'male'),

    // 2010s (Long Female + Long Male + Hats)
    makeHatPreset('hat_2010s_hipster_slouch', "2010's Indie Slouch Beanie", '2010s', 2, PATTERNS.beretFront, 2, PATTERNS.beretSide, { O: '#140c1c', P: '#6b2643', S: '#442434', L: '#ac2847' }, 'female'),
    makeHatPreset('hat_2010s_five_panel', "2010's Camper 5-Panel Cap", '2010s', 2, PATTERNS.newsboyFlatCapFront, 2, PATTERNS.newsboyFlatCapSide, { O: '#140c1c', P: '#44891a', S: '#8f563b', L: '#e4a672' }, 'male'),
    makeHairPreset('hair_2010s_ombré_waves', "2010's Long Pastel Ombré Beach Waves", '2010s', 2, PATTERNS.longWavyFlowFront, 2, PATTERNS.longWavyFlowSide, { O: '#2c1e31', P: '#663931', S: '#0098dc', L: '#b2dce8' }, 'female'),
    makeHairPreset('hair_2010s_indie_long_male', "2010's Indie Folk Long Flowing Mane & Beard", '2010s', 2, PATTERNS.frontierBeardHairFront, 2, PATTERNS.frontierBeardHairSide, { O: '#2c1e31', P: '#743f39', S: '#442434', L: '#b86f50' }, 'male'),
    makeHairPreset('hair_2010s_undercut', "2010's Textured Short Undercut Quiff", '2010s', 2, PATTERNS.pompadourAfroFront, 2, PATTERNS.pompadourAfroSide, { O: '#140c1c', P: '#5a6988', S: '#262b44', L: '#8b93af' }, 'male'),

    // 2020s (Long Female + Long Male + Hats)
    makeHatPreset('hat_2020s_street_bucket', "2020's Techwear Bucket Hat", '2020s', 2, PATTERNS.clocheBellHatFront, 2, PATTERNS.clocheBellHatSide, { O: '#140c1c', P: '#262b44', S: '#0098dc', L: '#b2dce8' }, 'female'),
    makeHatPreset('hat_2020s_cuffed_beanie', "2020's Micro Fisherman Beanie", '2020s', 2, PATTERNS.buzzFadeTopFront, 2, PATTERNS.buzzFadeTopSide, { O: '#140c1c', P: '#e98537', S: '#de5d3a', L: '#f7e26b' }, 'male'),
    makeHairPreset('hair_2020s_wolf_cut', "2020's Long Two-Tone Neon Wolf Cut", '2020s', 2, PATTERNS.longWavyFlowFront, 2, PATTERNS.longWavyFlowSide, { O: '#140c1c', P: '#262b44', S: '#0098dc', L: '#31a2f2' }, 'female'),
    makeHairPreset('hair_2020s_sleek_high_pony', "2020's Long Sleek Cyber High Ponytail", '2020s', 2, PATTERNS.ponytailQueueFront, 2, PATTERNS.ponytailQueueSide, { O: '#140c1c', P: '#9c4176', S: '#6b2643', L: '#d77bba' }, 'female'),
    makeHairPreset('hair_2020s_long_flow_male', "2020's Streetwear Long Flowing Curtain Locks", '2020s', 2, PATTERNS.longPartedCascadeFront, 2, PATTERNS.longPartedCascadeSide, { O: '#140c1c', P: '#2c1e31', S: '#140c1c', L: '#5a6988' }, 'male'),
    makeHairPreset('hair_2020s_broccoli_curls', "2020's Tapered Short Fluffy Curls", '2020s', 2, PATTERNS.spikyCurtainsFront, 2, PATTERNS.spikyCurtainsSide, { O: '#140c1c', P: '#442434', S: '#2c1e31', L: '#8f563b' }, 'male')
  ],

  shirts: [
    {
      id: 'shirt_none',
      name: 'None (Bare Torso)',
      era: 'all',
      gender: 'unisex',
      isNone: true,
      front: [],
      side: []
    },
    // OREGON TRAIL
    makeItemPreset('shirt_oregon_calico_bodice', 'Pioneer Calico Dress Bodice', 'oregon_trail', 12, PATTERNS.calicoBodiceFront, 12, PATTERNS.calicoBodiceSide, { O: '#2c1e31', P: '#31a2f2', S: '#1e579c', L: '#ffffff' }, 'female'),
    makeItemPreset('shirt_oregon_gingham_blouse', 'Prairie Rose Gingham Blouse', 'oregon_trail', 12, PATTERNS.calicoBodiceFront, 12, PATTERNS.calicoBodiceSide, { O: '#442434', P: '#ac2847', S: '#6b2643', L: '#f6d6bd' }, 'female'),
    makeItemPreset('shirt_oregon_buckskin_jacket', 'Fringed Buckskin Scout Jacket', 'oregon_trail', 13, PATTERNS.fringedBuckskinFront, 13, PATTERNS.fringedBuckskinSide, { O: '#2c1e31', P: '#b86f50', S: '#f3a833', L: '#e4a672' }, 'male'),
    makeItemPreset('shirt_oregon_red_flannel', 'Homesteader Red Plaid Workshirt', 'oregon_trail', 13, PATTERNS.suitJacketFront, 13, PATTERNS.suitJacketSide, { O: '#2c1e31', P: '#ec273f', S: '#663931', L: '#f6d6bd' }, 'male'),

    // 1500s
    makeItemPreset('shirt_1500s_doublet', '1500s Slashed Velvet Doublet', '1500s', 13, PATTERNS.doubletCoatFront, 13, PATTERNS.doubletCoatSide, { O: '#2c1e31', P: '#ac2847', S: '#6b2643', L: '#f7e26b' }, 'male'),
    makeItemPreset('shirt_1500s_jerkin', '1500s Tudor Corset Bodice & Sleeves', '1500s', 12, PATTERNS.calicoBodiceFront, 12, PATTERNS.calicoBodiceSide, { O: '#2c1e31', P: '#44891a', S: '#f3a833', L: '#f7e26b' }, 'female'),
    makeItemPreset('shirt_1500s_scholar_robe', '1500s Fur-Trimmed Court Surcoat', '1500s', 13, PATTERNS.capeletCoatFront, 13, PATTERNS.capeletCoatSide, { O: '#140c1c', P: '#2f484e', S: '#140c1c', L: '#e4a672' }, 'unisex'),

    // 1600s
    makeItemPreset('shirt_1600s_buff_coat', '1600s Cavalier Lace Coat', '1600s', 13, PATTERNS.suitJacketFront, 13, PATTERNS.suitJacketSide, { O: '#140c1c', P: '#1e579c', S: '#262b44', L: '#ffffff' }, 'male'),
    makeItemPreset('shirt_1600s_musketeer_tabard', '1600s Baroque Satin Gown Bodice', '1600s', 12, PATTERNS.calicoBodiceFront, 12, PATTERNS.calicoBodiceSide, { O: '#140c1c', P: '#0098dc', S: '#1e579c', L: '#f7e26b' }, 'female'),
    makeItemPreset('shirt_1600s_cape_cloak', '1600s Baroque Velvet Capelet', '1600s', 13, PATTERNS.capeletCoatFront, 13, PATTERNS.capeletCoatSide, { O: '#2c1e31', P: '#6b2643', S: '#442434', L: '#f3a833' }, 'unisex'),

    // 1700s
    makeItemPreset('shirt_1700s_regency_coat', '1700s Colonial Waistcoat & Coat', '1700s', 13, PATTERNS.suitJacketFront, 13, PATTERNS.suitJacketSide, { O: '#140c1c', P: '#262b44', S: '#ec273f', L: '#f7e26b' }, 'male'),
    makeItemPreset('shirt_1700s_redcoat_tunic', '1700s Georgian Stomacher Bodice', '1700s', 12, PATTERNS.calicoBodiceFront, 12, PATTERNS.calicoBodiceSide, { O: '#442434', P: '#ec273f', S: '#ffffff', L: '#f7e26b' }, 'female'),
    makeItemPreset('shirt_1700s_brocade_vest', '1700s Silk Brocade Waistcoat', '1700s', 13, PATTERNS.vestJerkinFront, 13, PATTERNS.vestJerkinSide, { O: '#2c1e31', P: '#44891a', S: '#f3a833', L: '#ffffff' }, 'unisex'),

    // 1800s
    makeItemPreset('shirt_1800s_frock_coat', '1800s Victorian Tailored Frock Coat', '1800s', 13, PATTERNS.suitJacketFront, 13, PATTERNS.suitJacketSide, { O: '#140c1c', P: '#3a4466', S: '#6b2643', L: '#c2c3c7' }, 'male'),
    makeItemPreset('shirt_1800s_inverness_cape', '1800s Victorian Bustle Gown Bodice', '1800s', 12, PATTERNS.calicoBodiceFront, 12, PATTERNS.calicoBodiceSide, { O: '#2c1e31', P: '#9c4176', S: '#6b2643', L: '#d77bba' }, 'female'),
    makeItemPreset('shirt_1800s_waistcoat_sleeves', '1800s Detective Inverness Cape', '1800s', 13, PATTERNS.capeletCoatFront, 13, PATTERNS.capeletCoatSide, { O: '#2c1e31', P: '#743f39', S: '#442434', L: '#b86f50' }, 'unisex'),

    // 1900-1920
    makeItemPreset('shirt_1900_tweed_vest', '1900–1920 Edwardian Tweed Suit', '1900_1920', 13, PATTERNS.suitJacketFront, 13, PATTERNS.suitJacketSide, { O: '#2c1e31', P: '#8f563b', S: '#663931', L: '#f6d6bd' }, 'male'),
    makeItemPreset('shirt_1900_striped_blazer', '1900–1920 Edwardian Lace Blouse', '1900_1920', 12, PATTERNS.calicoBodiceFront, 12, PATTERNS.calicoBodiceSide, { O: '#3a4466', P: '#ffffff', S: '#c2c3c7', L: '#b2dce8' }, 'female'),
    makeItemPreset('shirt_1900_motorist_duster', '1900–1920 Early Motorist Coat', '1900_1920', 13, PATTERNS.doubletCoatFront, 13, PATTERNS.doubletCoatSide, { O: '#2c1e31', P: '#e4a672', S: '#b86f50', L: '#f6d6bd' }, 'unisex'),

    // 1921-1940
    makeItemPreset('shirt_1920_gatsby_suit', '1921–1940 Art Deco Pinstripe Jacket', '1921_1940', 13, PATTERNS.suitJacketFront, 13, PATTERNS.suitJacketSide, { O: '#140c1c', P: '#262b44', S: '#5a6988', L: '#f7e26b' }, 'male'),
    makeItemPreset('shirt_1920_flapper_sequin', '1921–1940 Jazz Fringe Flapper Top', '1921_1940', 13, PATTERNS.sleevelessTankFront, 13, PATTERNS.sleevelessTankSide, { O: '#2c1e31', P: '#f3a833', S: '#ac2847', L: '#f7e26b' }, 'female'),
    makeItemPreset('shirt_1920_fair_isle_vest', '1921–1940 Country Club Sweater Vest', '1921_1940', 13, PATTERNS.vestJerkinFront, 13, PATTERNS.vestJerkinSide, { O: '#140c1c', P: '#1e579c', S: '#f7e26b', L: '#ffffff' }, 'unisex'),

    // 1941-1950
    makeItemPreset('shirt_1941_bomber', '1941–1950 Shearling Flight Bomber', '1941_1950', 13, PATTERNS.doubletCoatFront, 13, PATTERNS.doubletCoatSide, { O: '#140c1c', P: '#663931', S: '#44891a', L: '#f6d6bd' }, 'male'),
    makeItemPreset('shirt_1941_riveter_denim', '1941–1950 Rosie Rolled-Sleeve Work Shirt', '1941_1950', 13, PATTERNS.vestJerkinFront, 13, PATTERNS.vestJerkinSide, { O: '#140c1c', P: '#1e579c', S: '#0098dc', L: '#ec273f' }, 'female'),
    makeItemPreset('shirt_1941_ike_jacket', '1941–1950 Olive Service Jacket', '1941_1950', 13, PATTERNS.suitJacketFront, 13, PATTERNS.suitJacketSide, { O: '#140c1c', P: '#44891a', S: '#2f484e', L: '#f7e26b' }, 'unisex'),

    // 1950s
    makeItemPreset('shirt_1950s_leather_jacket', "50's Greaser Moto Jacket", '1950s', 13, PATTERNS.suitJacketFront, 13, PATTERNS.suitJacketSide, { O: '#140c1c', P: '#262b44', S: '#3a4466', L: '#ffffff' }, 'male'),
    makeItemPreset('shirt_1950s_letterman', "50's Sweetheart Diner Cardigan", '1950s', 13, PATTERNS.vestJerkinFront, 13, PATTERNS.vestJerkinSide, { O: '#2c1e31', P: '#d77bba', S: '#9c4176', L: '#ffffff' }, 'female'),
    makeItemPreset('shirt_1950s_bowling_shirt', "50's Two-Tone Diner Bowling Shirt", '1950s', 13, PATTERNS.teeHoodieFront, 13, PATTERNS.teeHoodieSide, { O: '#140c1c', P: '#0098dc', S: '#262b44', L: '#f7e26b' }, 'unisex'),

    // 1960s
    makeItemPreset('shirt_1960s_mod_top', "60's Colorblock Mod Shift Top", '1960s', 13, PATTERNS.teeHoodieFront, 13, PATTERNS.teeHoodieSide, { O: '#140c1c', P: '#e98537', S: '#ac2847', L: '#f7e26b' }, 'female'),
    makeItemPreset('shirt_1960s_beat_turtleneck', "60's Beatnik Ribbed Turtleneck", '1960s', 12, PATTERNS.turtleneckSweaterFront, 12, PATTERNS.turtleneckSweaterSide, { O: '#140c1c', P: '#262b44', S: '#140c1c', L: '#5a6988' }, 'male'),
    makeItemPreset('shirt_1960s_fringe_vest', "60's Suede Fringe Festival Vest", '1960s', 13, PATTERNS.vestJerkinFront, 13, PATTERNS.vestJerkinSide, { O: '#442434', P: '#b86f50', S: '#8f563b', L: '#a3ce27' }, 'unisex'),

    // 1970s
    makeItemPreset('shirt_1970s_disco_shirt', "70's Satin Lapel Disco Shirt", '1970s', 13, PATTERNS.suitJacketFront, 13, PATTERNS.suitJacketSide, { O: '#2c1e31', P: '#9c4176', S: '#6b2643', L: '#f7e26b' }, 'male'),
    makeItemPreset('shirt_1970s_halter_vest', "70's Boogie Sleeveless Halter Top", '1970s', 13, PATTERNS.sleevelessTankFront, 13, PATTERNS.sleevelessTankSide, { O: '#2c1e31', P: '#e98537', S: '#743f39', L: '#f7e26b' }, 'female'),
    makeItemPreset('shirt_1970s_ringer_tee', "70's Rainbow Stripe Ringer Tee", '1970s', 13, PATTERNS.teeHoodieFront, 13, PATTERNS.teeHoodieSide, { O: '#442434', P: '#f3a833', S: '#ec273f', L: '#ffffff' }, 'unisex'),

    // 1980s
    makeItemPreset('shirt_1980s_windbreaker', "80's Synthwave Neon Windbreaker", '1980s', 13, PATTERNS.teeHoodieFront, 13, PATTERNS.teeHoodieSide, { O: '#140c1c', P: '#0098dc', S: '#ec273f', L: '#f7e26b' }, 'female'),
    makeItemPreset('shirt_1980s_miami_blazer', "80's Pastel Vice Rolled Blazer", '1980s', 13, PATTERNS.suitJacketFront, 13, PATTERNS.suitJacketSide, { O: '#262b44', P: '#ffffff', S: '#c2c3c7', L: '#31a2f2' }, 'male'),
    makeItemPreset('shirt_1980s_denim_cut', "80's Rocker Studded Denim Vest", '1980s', 13, PATTERNS.vestJerkinFront, 13, PATTERNS.vestJerkinSide, { O: '#140c1c', P: '#1e579c', S: '#31a2f2', L: '#262b44' }, 'unisex'),

    // 1990s
    makeItemPreset('shirt_1990s_grunge_flannel', "90's Open Plaid Grunge Flannel", '1990s', 13, PATTERNS.suitJacketFront, 13, PATTERNS.suitJacketSide, { O: '#140c1c', P: '#ac2847', S: '#262b44', L: '#c2c3c7' }, 'male'),
    makeItemPreset('shirt_1990s_colorblock_hoodie', "90's Baby-Tee & Plaid Blazer", '1990s', 13, PATTERNS.vestJerkinFront, 13, PATTERNS.vestJerkinSide, { O: '#140c1c', P: '#f3a833', S: '#262b44', L: '#ffffff' }, 'female'),
    makeItemPreset('shirt_1990s_hoops_jersey', "90's Retro Mesh Hoops Jersey", '1990s', 13, PATTERNS.sleevelessTankFront, 13, PATTERNS.sleevelessTankSide, { O: '#140c1c', P: '#ec273f', S: '#262b44', L: '#f7e26b' }, 'unisex'),

    // 2000s
    makeItemPreset('shirt_2000s_velour_track', "2000's Y2K Zip Velour Track Jacket", '2000s', 13, PATTERNS.teeHoodieFront, 13, PATTERNS.teeHoodieSide, { O: '#140c1c', P: '#d77bba', S: '#9c4176', L: '#ffffff' }, 'female'),
    makeItemPreset('shirt_2000s_layered_skate', "2000's Skate Tee Over Long-Sleeve", '2000s', 13, PATTERNS.vestJerkinFront, 13, PATTERNS.vestJerkinSide, { O: '#140c1c', P: '#262b44', S: '#ec273f', L: '#ffffff' }, 'male'),
    makeItemPreset('shirt_2000s_metallic_tank', "2000's Cyber Metallic Crop Tank", '2000s', 13, PATTERNS.sleevelessTankFront, 13, PATTERNS.sleevelessTankSide, { O: '#262b44', P: '#31a2f2', S: '#0098dc', L: '#b2dce8' }, 'female'),

    // 2010s
    makeItemPreset('shirt_2010s_indie_hoodie', "2010's Athleisure Layered Hoodie", '2010s', 13, PATTERNS.doubletCoatFront, 13, PATTERNS.doubletCoatSide, { O: '#140c1c', P: '#44891a', S: '#2f484e', L: '#c2c3c7' }, 'female'),
    makeItemPreset('shirt_2010s_chambray_shirt', "2010's Lumbersexual Chambray Workshirt", '2010s', 13, PATTERNS.suitJacketFront, 13, PATTERNS.suitJacketSide, { O: '#140c1c', P: '#3a4466', S: '#5a6988', L: '#e4a672' }, 'male'),
    makeItemPreset('shirt_2010s_bomber_olive', "2010's Minimalist MA-1 Bomber", '2010s', 13, PATTERNS.teeHoodieFront, 13, PATTERNS.teeHoodieSide, { O: '#140c1c', P: '#2f484e', S: '#e98537', L: '#a3ce27' }, 'unisex'),

    // 2020s
    makeItemPreset('shirt_2020s_puffer', "2020's Streetwear Cropped Puffer", '2020s', 13, PATTERNS.doubletCoatFront, 13, PATTERNS.doubletCoatSide, { O: '#140c1c', P: '#262b44', S: '#3a4466', L: '#31a2f2' }, 'female'),
    makeItemPreset('shirt_2020s_boxy_hoodie', "2020's Heavyweight Sage Hoodie", '2020s', 12, PATTERNS.turtleneckSweaterFront, 12, PATTERNS.turtleneckSweaterSide, { O: '#140c1c', P: '#44891a', S: '#2f484e', L: '#a3ce27' }, 'male'),
    makeItemPreset('shirt_2020s_tech_gilet', "2020's Utility Padded Vest", '2020s', 13, PATTERNS.vestJerkinFront, 13, PATTERNS.vestJerkinSide, { O: '#140c1c', P: '#262b44', S: '#140c1c', L: '#c2c3c7' }, 'unisex')
  ],

  pants: [
    {
      id: 'pants_none',
      name: 'None',
      era: 'all',
      gender: 'unisex',
      isNone: true,
      front: [],
      side: []
    },
    // OREGON TRAIL
    makeItemPreset('pants_oregon_calico_skirt', 'Full-Length Calico Prairie Skirt', 'oregon_trail', 20, PATTERNS.prairieLongSkirtFront, 20, PATTERNS.prairieLongSkirtSide, { O: '#2c1e31', P: '#31a2f2', S: '#1e579c', L: '#ffffff' }, 'female'),
    makeItemPreset('pants_oregon_quilted_skirt', 'Quilted Rose Homespun Prairie Skirt', 'oregon_trail', 20, PATTERNS.prairieLongSkirtFront, 20, PATTERNS.prairieLongSkirtSide, { O: '#442434', P: '#ac2847', S: '#6b2643', L: '#f6d6bd' }, 'female'),
    makeItemPreset('pants_oregon_duck_trousers', 'Canvas Duck Frontier Work Trousers', 'oregon_trail', 20, PATTERNS.trousersJeansFront, 20, PATTERNS.trousersJeansSide, { O: '#2c1e31', P: '#8f563b', S: '#663931', L: '#b86f50' }, 'male'),
    makeItemPreset('pants_oregon_denim_dungarees', 'Indigo Homestead Dungarees', 'oregon_trail', 20, PATTERNS.bellBottomsBaggyFront, 20, PATTERNS.bellBottomsBaggySide, { O: '#140c1c', P: '#1e579c', S: '#3a4466', L: '#5a6988' }, 'male'),

    // 1500s
    makeItemPreset('pants_1500s_trunk_hose', '1500s Puffed Trunk Hose', '1500s', 20, PATTERNS.breechesShortsFront, 20, PATTERNS.breechesShortsSide, { O: '#2c1e31', P: '#ac2847', S: '#f7e26b', L: '#de5d3a' }, 'male'),
    makeItemPreset('pants_1500s_brocade_kirtle', '1500s Velvet Tudor Gown Skirt', '1500s', 20, PATTERNS.prairieLongSkirtFront, 20, PATTERNS.prairieLongSkirtSide, { O: '#2c1e31', P: '#44891a', S: '#f3a833', L: '#f7e26b' }, 'female'),
    makeItemPreset('pants_1500s_venetian_hose', '1500s Venetian Slashed Breeches', '1500s', 20, PATTERNS.trousersJeansFront, 20, PATTERNS.trousersJeansSide, { O: '#140c1c', P: '#2f484e', S: '#44891a', L: '#f7e26b' }, 'unisex'),

    // 1600s
    makeItemPreset('pants_1600s_breeches', '1600s Cavalier Ribbon Breeches', '1600s', 20, PATTERNS.trousersJeansFront, 20, PATTERNS.trousersJeansSide, { O: '#140c1c', P: '#1e579c', S: '#262b44', L: '#b2dce8' }, 'male'),
    makeItemPreset('pants_1600s_rhinegraves', '1600s Baroque Satin Gown Skirt', '1600s', 20, PATTERNS.prairieLongSkirtFront, 20, PATTERNS.prairieLongSkirtSide, { O: '#140c1c', P: '#0098dc', S: '#1e579c', L: '#f7e26b' }, 'female'),
    makeItemPreset('pants_1600s_buff_hose', '1600s Musketeer Riding Breeches', '1600s', 20, PATTERNS.breechesShortsFront, 20, PATTERNS.breechesShortsSide, { O: '#2c1e31', P: '#b86f50', S: '#743f39', L: '#e4a672' }, 'unisex'),

    // 1700s
    makeItemPreset('pants_1700s_knee_breeches', '1700s Colonial Buff Breeches', '1700s', 20, PATTERNS.trousersJeansFront, 20, PATTERNS.trousersJeansSide, { O: '#2c1e31', P: '#f6d6bd', S: '#c2c3c7', L: '#ffffff' }, 'male'),
    makeItemPreset('pants_1700s_highland_kilt', '1700s Georgian Draped Polonaise Skirt', '1700s', 20, PATTERNS.prairieLongSkirtFront, 20, PATTERNS.prairieLongSkirtSide, { O: '#442434', P: '#ec273f', S: '#ac2847', L: '#f7e26b' }, 'female'),
    makeItemPreset('pants_1700s_silk_culottes', '1700s Velvet Court Culottes', '1700s', 20, PATTERNS.breechesShortsFront, 20, PATTERNS.breechesShortsSide, { O: '#140c1c', P: '#1e579c', S: '#ffffff', L: '#31a2f2' }, 'unisex'),

    // 1800s
    makeItemPreset('pants_1800s_striped_trousers', '1800s Victorian Striped Trousers', '1800s', 20, PATTERNS.trousersJeansFront, 20, PATTERNS.trousersJeansSide, { O: '#140c1c', P: '#3a4466', S: '#262b44', L: '#8b93af' }, 'male'),
    makeItemPreset('pants_1800s_check_slacks', '1800s Victorian Crinoline Gown Skirt', '1800s', 20, PATTERNS.prairieLongSkirtFront, 20, PATTERNS.prairieLongSkirtSide, { O: '#2c1e31', P: '#9c4176', S: '#6b2643', L: '#d77bba' }, 'female'),
    makeItemPreset('pants_1800s_riding_jodhpurs', '1800s Equestrian Jodhpurs', '1800s', 20, PATTERNS.breechesShortsFront, 20, PATTERNS.breechesShortsSide, { O: '#2c1e31', P: '#e4a672', S: '#8f563b', L: '#f6d6bd' }, 'unisex'),

    // 1900-1920
    makeItemPreset('pants_1900_tweed_slacks', '1900–1920 Pressed Wool Slacks', '1900_1920', 20, PATTERNS.trousersJeansFront, 20, PATTERNS.trousersJeansSide, { O: '#2c1e31', P: '#663931', S: '#442434', L: '#8f563b' }, 'male'),
    makeItemPreset('pants_1900_cream_flannels', '1900–1920 Edwardian Walking Skirt', '1900_1920', 20, PATTERNS.prairieLongSkirtFront, 20, PATTERNS.prairieLongSkirtSide, { O: '#140c1c', P: '#3a4466', S: '#262b44', L: '#c2c3c7' }, 'female'),
    makeItemPreset('pants_1900_knickerbockers', '1900–1920 Tweed Golf Knickerbockers', '1900_1920', 20, PATTERNS.breechesShortsFront, 20, PATTERNS.breechesShortsSide, { O: '#2c1e31', P: '#8f563b', S: '#c2c3c7', L: '#e4a672' }, 'unisex'),

    // 1921-1940
    makeItemPreset('pants_1920_oxford_bags', '1921–1940 Wide-Leg Oxford Bags', '1921_1940', 20, PATTERNS.bellBottomsBaggyFront, 20, PATTERNS.bellBottomsBaggySide, { O: '#140c1c', P: '#5a6988', S: '#3a4466', L: '#8b93af' }, 'male'),
    makeItemPreset('pants_1920_flapper_skirt', '1921–1940 Pleated Jazz Flapper Skirt', '1921_1940', 20, PATTERNS.pleatedSkirtKiltFront, 20, PATTERNS.pleatedSkirtKiltSide, { O: '#2c1e31', P: '#ac2847', S: '#f3a833', L: '#de5d3a' }, 'female'),
    makeItemPreset('pants_1920_plus_fours', '1921–1940 Country Club Plus-Fours', '1921_1940', 20, PATTERNS.breechesShortsFront, 20, PATTERNS.breechesShortsSide, { O: '#2c1e31', P: '#b86f50', S: '#663931', L: '#e4a672' }, 'unisex'),

    // 1941-1950
    makeItemPreset('pants_1941_khaki_chinos', '1941–1950 Officer Khaki Chinos', '1941_1950', 20, PATTERNS.trousersJeansFront, 20, PATTERNS.trousersJeansSide, { O: '#2c1e31', P: '#b86f50', S: '#8f563b', L: '#e4a672' }, 'male'),
    makeItemPreset('pants_1941_pleated_zoot', '1941–1950 Utility A-Line Skirt', '1941_1950', 20, PATTERNS.pleatedSkirtKiltFront, 20, PATTERNS.pleatedSkirtKiltSide, { O: '#140c1c', P: '#1e579c', S: '#262b44', L: '#31a2f2' }, 'female'),
    makeItemPreset('pants_1941_olive_fatigues', '1941–1950 Olive Paratrooper Cargos', '1941_1950', 20, PATTERNS.bellBottomsBaggyFront, 20, PATTERNS.bellBottomsBaggySide, { O: '#140c1c', P: '#44891a', S: '#2f484e', L: '#a3ce27' }, 'unisex'),

    // 1950s
    makeItemPreset('pants_1950s_cuffed_denim', "50's Cuffed Selvedge Jeans", '1950s', 20, PATTERNS.trousersJeansFront, 20, PATTERNS.trousersJeansSide, { O: '#140c1c', P: '#1e579c', S: '#c2c3c7', L: '#31a2f2' }, 'male'),
    makeItemPreset('pants_1950s_poodle_skirt', "50's Pastel Swing Poodle Skirt", '1950s', 20, PATTERNS.pleatedSkirtKiltFront, 20, PATTERNS.pleatedSkirtKiltSide, { O: '#442434', P: '#d77bba', S: '#9c4176', L: '#ffffff' }, 'female'),
    makeItemPreset('pants_1950s_pedal_pushers', "50's Checkered Pedal Pushers", '1950s', 20, PATTERNS.breechesShortsFront, 20, PATTERNS.breechesShortsSide, { O: '#140c1c', P: '#262b44', S: '#ffffff', L: '#8b93af' }, 'female'),

    // 1960s
    makeItemPreset('pants_1960s_mod_check', "60's Tailored Mod Trousers", '1960s', 20, PATTERNS.trousersJeansFront, 20, PATTERNS.trousersJeansSide, { O: '#140c1c', P: '#6b2643', S: '#442434', L: '#ac2847' }, 'male'),
    makeItemPreset('pants_1960s_mod_mini', "60's Carnaby A-Line Mod Mini Skirt", '1960s', 20, PATTERNS.pleatedSkirtKiltFront, 20, PATTERNS.pleatedSkirtKiltSide, { O: '#140c1c', P: '#e98537', S: '#ffffff', L: '#f7e26b' }, 'female'),
    makeItemPreset('pants_1960s_patched_flares', "60's Festival Patched Bell Jeans", '1960s', 20, PATTERNS.bellBottomsBaggyFront, 20, PATTERNS.bellBottomsBaggySide, { O: '#140c1c', P: '#0098dc', S: '#f3a833', L: '#31a2f2' }, 'unisex'),

    // 1970s
    makeItemPreset('pants_1970s_bell_bottoms', "70's Flared Bell-Bottoms", '1970s', 20, PATTERNS.bellBottomsBaggyFront, 20, PATTERNS.bellBottomsBaggySide, { O: '#140c1c', P: '#0098dc', S: '#1e579c', L: '#b2dce8' }, 'unisex'),
    makeItemPreset('pants_1970s_white_disco', "70's White Fever Disco Flare Slacks", '1970s', 20, PATTERNS.bellBottomsBaggyFront, 20, PATTERNS.bellBottomsBaggySide, { O: '#3a4466', P: '#ffffff', S: '#c2c3c7', L: '#ffffff' }, 'male'),
    makeItemPreset('pants_1970s_roller_shorts', "70's Retro Striped Roller Shorts", '1970s', 20, PATTERNS.breechesShortsFront, 20, PATTERNS.breechesShortsSide, { O: '#442434', P: '#ec273f', S: '#ffffff', L: '#f7e26b' }, 'female'),

    // 1980s
    makeItemPreset('pants_1980s_acid_wash', "80's Acid-Wash Tapered Denim", '1980s', 20, PATTERNS.trousersJeansFront, 20, PATTERNS.trousersJeansSide, { O: '#262b44', P: '#31a2f2', S: '#0098dc', L: '#b2dce8' }, 'female'),
    makeItemPreset('pants_1980s_parachute', "80's Breakdance Parachute Pants", '1980s', 20, PATTERNS.bellBottomsBaggyFront, 20, PATTERNS.bellBottomsBaggySide, { O: '#140c1c', P: '#ec273f', S: '#262b44', L: '#c2c3c7' }, 'male'),
    makeItemPreset('pants_1980s_ripped_rocker', "80's Glam Shredded Knee Jeans", '1980s', 20, PATTERNS.distressedJeansFront, 20, PATTERNS.distressedJeansSide, { O: '#140c1c', P: '#262b44', S: '#140c1c', L: '#f6c69f' }, 'unisex'),

    // 1990s
    makeItemPreset('pants_1990s_baggy_skater', "90's Baggy Skater Jeans", '1990s', 20, PATTERNS.bellBottomsBaggyFront, 20, PATTERNS.bellBottomsBaggySide, { O: '#140c1c', P: '#3a4466', S: '#262b44', L: '#5a6988' }, 'male'),
    makeItemPreset('pants_1990s_plaid_kilt', "90's Clueless Yellow Plaid Skirt", '1990s', 20, PATTERNS.pleatedSkirtKiltFront, 20, PATTERNS.pleatedSkirtKiltSide, { O: '#2c1e31', P: '#f3a833', S: '#262b44', L: '#f7e26b' }, 'female'),
    makeItemPreset('pants_1990s_ripped_grunge', "90's Ripped Seattle Grunge Denim", '1990s', 20, PATTERNS.distressedJeansFront, 20, PATTERNS.distressedJeansSide, { O: '#140c1c', P: '#1e579c', S: '#3a4466', L: '#f6d6bd' }, 'unisex'),

    // 2000s
    makeItemPreset('pants_2000s_cargo_pants', "2000's Low-Rise Utility Cargos", '2000s', 20, PATTERNS.bellBottomsBaggyFront, 20, PATTERNS.bellBottomsBaggySide, { O: '#2c1e31', P: '#44891a', S: '#2f484e', L: '#a3ce27' }, 'male'),
    makeItemPreset('pants_2000s_denim_mini', "2000's Pop-Star Pleated Denim Mini", '2000s', 20, PATTERNS.pleatedSkirtKiltFront, 20, PATTERNS.pleatedSkirtKiltSide, { O: '#140c1c', P: '#0098dc', S: '#1e579c', L: '#b2dce8' }, 'female'),
    makeItemPreset('pants_2000s_velour_sweats', "2000's Y2K Pink Velour Track Pants", '2000s', 20, PATTERNS.bellBottomsBaggyFront, 20, PATTERNS.bellBottomsBaggySide, { O: '#442434', P: '#d77bba', S: '#9c4176', L: '#ffffff' }, 'female'),

    // 2010s
    makeItemPreset('pants_2010s_slim_joggers', "2010's Tapered Tech Joggers", '2010s', 20, PATTERNS.trousersJeansFront, 20, PATTERNS.trousersJeansSide, { O: '#140c1c', P: '#262b44', S: '#140c1c', L: '#5a6988' }, 'male'),
    makeItemPreset('pants_2010s_ripped_skinny', "2010's Indie Distressed Skinny Jeans", '2010s', 20, PATTERNS.distressedJeansFront, 20, PATTERNS.distressedJeansSide, { O: '#140c1c', P: '#3a4466', S: '#262b44', L: '#f6d6bd' }, 'female'),
    makeItemPreset('pants_2010s_cuffed_chinos', "2010's Rolled Burgundy Chinos", '2010s', 20, PATTERNS.trousersJeansFront, 20, PATTERNS.trousersJeansSide, { O: '#2c1e31', P: '#6b2643', S: '#442434', L: '#ac2847' }, 'unisex'),

    // 2020s
    makeItemPreset('pants_2020s_strapped_cargo', "2020's Parachute Tech Cargos", '2020s', 20, PATTERNS.bellBottomsBaggyFront, 20, PATTERNS.bellBottomsBaggySide, { O: '#140c1c', P: '#2f484e', S: '#140c1c', L: '#a3ce27' }, 'female'),
    makeItemPreset('pants_2020s_wide_carpenter', "2020's Baggy Vintage Carpenter Jeans", '2020s', 20, PATTERNS.bellBottomsBaggyFront, 20, PATTERNS.bellBottomsBaggySide, { O: '#140c1c', P: '#31a2f2', S: '#1e579c', L: '#b2dce8' }, 'male'),
    makeItemPreset('pants_2020s_nylon_shorts', "2020's Streetwear Nylon Running Shorts", '2020s', 20, PATTERNS.breechesShortsFront, 20, PATTERNS.breechesShortsSide, { O: '#140c1c', P: '#262b44', S: '#31a2f2', L: '#ffffff' }, 'unisex')
  ],

  shoes: [
    {
      id: 'shoes_none',
      name: 'None (Barefoot)',
      era: 'all',
      gender: 'unisex',
      isNone: true,
      front: [],
      side: []
    },
    // OREGON TRAIL
    makeItemPreset('shoes_oregon_prairie_lace_boots', 'Pioneer Lace-Up Prairie Ankle Boots', 'oregon_trail', 27, PATTERNS.bootsFront, 27, PATTERNS.bootsSide, { O: '#140c1c', P: '#442434', S: '#2c1e31', L: '#8f563b' }, 'female'),
    makeItemPreset('shoes_oregon_cowhide_boots', 'Mud-Stained Cowhide Wagon Boots', 'oregon_trail', 26, PATTERNS.tallRidingBootsFront, 26, PATTERNS.tallRidingBootsSide, { O: '#140c1c', P: '#663931', S: '#442434', L: '#8f563b' }, 'male'),
    makeItemPreset('shoes_oregon_buckskin_moccasins', 'Beaded Frontier Buckskin Moccasins', 'oregon_trail', 26, PATTERNS.loafersLowShoesFront, 26, PATTERNS.loafersLowShoesSide, { O: '#2c1e31', P: '#b86f50', S: '#0098dc', L: '#e4a672' }, 'unisex'),

    // 1500s
    makeItemPreset('shoes_1500s_duckbill', '1500s Tudor Velvet Slippers', '1500s', 27, PATTERNS.bootsFront, 27, PATTERNS.bootsSide, { O: '#140c1c', P: '#663931', S: '#442434', L: '#f7e26b' }, 'male'),
    makeItemPreset('shoes_1500s_slashed_poulaines', '1500s Crimson Court Brocade Slippers', '1500s', 26, PATTERNS.loafersLowShoesFront, 26, PATTERNS.loafersLowShoesSide, { O: '#2c1e31', P: '#ac2847', S: '#6b2643', L: '#f7e26b' }, 'female'),
    makeItemPreset('shoes_1500s_thigh_boots', '1500s Renaissance Riding Boots', '1500s', 26, PATTERNS.tallRidingBootsFront, 26, PATTERNS.tallRidingBootsSide, { O: '#140c1c', P: '#743f39', S: '#442434', L: '#b86f50' }, 'unisex'),

    // 1600s
    makeItemPreset('shoes_1600s_bucket_boots', '1600s Cavalier Bucket-Top Boots', '1600s', 26, PATTERNS.tallRidingBootsFront, 26, PATTERNS.tallRidingBootsSide, { O: '#140c1c', P: '#743f39', S: '#442434', L: '#b86f50' }, 'male'),
    makeItemPreset('shoes_1600s_rosette_heels', '1600s Red-Heeled Court Ribbon Shoes', '1600s', 26, PATTERNS.loafersLowShoesFront, 26, PATTERNS.loafersLowShoesSide, { O: '#140c1c', P: '#262b44', S: '#ec273f', L: '#ffffff' }, 'female'),
    makeItemPreset('shoes_1600s_pilgrim_buckles', '1600s Brass-Buckled Puritan Shoes', '1600s', 27, PATTERNS.sneakersShoesFront, 27, PATTERNS.sneakersShoesSide, { O: '#140c1c', P: '#2c1e31', S: '#140c1c', L: '#f7e26b' }, 'unisex'),

    // 1700s
    makeItemPreset('shoes_1700s_buckle_shoes', '1700s Silver-Buckled Court Shoes', '1700s', 27, PATTERNS.sneakersShoesFront, 27, PATTERNS.sneakersShoesSide, { O: '#140c1c', P: '#262b44', S: '#140c1c', L: '#f7e26b' }, 'male'),
    makeItemPreset('shoes_1700s_brocade_pumps', '1700s Silk Stockings & Court Pumps', '1700s', 26, PATTERNS.loafersLowShoesFront, 26, PATTERNS.loafersLowShoesSide, { O: '#2c1e31', P: '#ac2847', S: '#6b2643', L: '#ffffff' }, 'female'),
    makeItemPreset('shoes_1700s_hessian_boots', '1700s Tassel Hessian Riding Boots', '1700s', 26, PATTERNS.tallRidingBootsFront, 26, PATTERNS.tallRidingBootsSide, { O: '#140c1c', P: '#262b44', S: '#140c1c', L: '#f3a833' }, 'unisex'),

    // 1800s
    makeItemPreset('shoes_1800s_spats_boots', '1800s Victorian Button Spats', '1800s', 27, PATTERNS.sneakersShoesFront, 27, PATTERNS.sneakersShoesSide, { O: '#140c1c', P: '#262b44', S: '#140c1c', L: '#c2c3c7' }, 'male'),
    makeItemPreset('shoes_1800s_balmoral_boots', '1800s Victorian Lace-Up Ankle Boots', '1800s', 27, PATTERNS.bootsFront, 27, PATTERNS.bootsSide, { O: '#140c1c', P: '#743f39', S: '#442434', L: '#b86f50' }, 'female'),
    makeItemPreset('shoes_1800s_tall_equestrian', '1800s Polished Equestrian Boots', '1800s', 26, PATTERNS.tallRidingBootsFront, 26, PATTERNS.tallRidingBootsSide, { O: '#140c1c', P: '#2c1e31', S: '#140c1c', L: '#8f563b' }, 'unisex'),

    // 1900-1920
    makeItemPreset('shoes_1900_edwardian_boots', '1900–1920 Lace-Up Derby Boots', '1900_1920', 27, PATTERNS.bootsFront, 27, PATTERNS.bootsSide, { O: '#140c1c', P: '#663931', S: '#2c1e31', L: '#8f563b' }, 'male'),
    makeItemPreset('shoes_1900_two_tone_button', '1900–1920 Edwardian Button Boots', '1900_1920', 26, PATTERNS.tallRidingBootsFront, 26, PATTERNS.tallRidingBootsSide, { O: '#2c1e31', P: '#663931', S: '#442434', L: '#f6d6bd' }, 'female'),
    makeItemPreset('shoes_1900_white_bucks', '1900–1920 Lawn White Buck Oxfords', '1900_1920', 27, PATTERNS.sneakersShoesFront, 27, PATTERNS.sneakersShoesSide, { O: '#3a4466', P: '#ffffff', S: '#c2c3c7', L: '#8f563b' }, 'unisex'),

    // 1921-1940
    makeItemPreset('shoes_1920_wingtips', '1921–1940 Two-Tone Jazz Wingtips', '1921_1940', 27, PATTERNS.sneakersShoesFront, 27, PATTERNS.sneakersShoesSide, { O: '#140c1c', P: '#262b44', S: '#140c1c', L: '#ffffff' }, 'male'),
    makeItemPreset('shoes_1920_t_strap_heels', '1921–1940 Charleston T-Strap Shoes', '1921_1940', 26, PATTERNS.loafersLowShoesFront, 26, PATTERNS.loafersLowShoesSide, { O: '#2c1e31', P: '#ac2847', S: '#6b2643', L: '#f6d6bd' }, 'female'),
    makeItemPreset('shoes_1920_tan_brogues', '1921–1940 Oxford Tan Wingtip Brogues', '1921_1940', 27, PATTERNS.bootsFront, 27, PATTERNS.bootsSide, { O: '#2c1e31', P: '#b86f50', S: '#743f39', L: '#e4a672' }, 'unisex'),

    // 1941-1950
    makeItemPreset('shoes_1941_service_boots', '1941–1950 Russet Service Boots', '1941_1950', 27, PATTERNS.bootsFront, 27, PATTERNS.bootsSide, { O: '#140c1c', P: '#743f39', S: '#442434', L: '#b86f50' }, 'male'),
    makeItemPreset('shoes_1941_peep_toe_oxfords', '1941–1950 Swing Dance Oxfords', '1941_1950', 26, PATTERNS.loafersLowShoesFront, 26, PATTERNS.loafersLowShoesSide, { O: '#140c1c', P: '#262b44', S: '#140c1c', L: '#ffffff' }, 'female'),
    makeItemPreset('shoes_1941_jump_boots', '1941–1950 Tall Paratrooper Jump Boots', '1941_1950', 26, PATTERNS.tallRidingBootsFront, 26, PATTERNS.tallRidingBootsSide, { O: '#140c1c', P: '#663931', S: '#2c1e31', L: '#8f563b' }, 'unisex'),

    // 1950s
    makeItemPreset('shoes_1950s_saddle_shoes', "50's Diner Saddle Shoes", '1950s', 27, PATTERNS.sneakersShoesFront, 27, PATTERNS.sneakersShoesSide, { O: '#140c1c', P: '#ac2847', S: '#6b2643', L: '#ffffff' }, 'female'),
    makeItemPreset('shoes_1950s_blue_suede', "50's Rockabilly Blue Suede Creepers", '1950s', 27, PATTERNS.bootsFront, 27, PATTERNS.bootsSide, { O: '#140c1c', P: '#0098dc', S: '#262b44', L: '#31a2f2' }, 'male'),
    makeItemPreset('shoes_1950s_penny_loafers', "50's Bobby-Sox & Penny Loafers", '1950s', 26, PATTERNS.loafersLowShoesFront, 26, PATTERNS.loafersLowShoesSide, { O: '#2c1e31', P: '#743f39', S: '#442434', L: '#ffffff' }, 'unisex'),

    // 1960s
    makeItemPreset('shoes_1960s_chelsea_boots', "60's Mod Chelsea Beatle Boots", '1960s', 27, PATTERNS.bootsFront, 27, PATTERNS.bootsSide, { O: '#140c1c', P: '#2c1e31', S: '#140c1c', L: '#5a6988' }, 'male'),
    makeItemPreset('shoes_1960s_gogo_boots', "60's White Patent Tall Go-Go Boots", '1960s', 26, PATTERNS.tallRidingBootsFront, 26, PATTERNS.tallRidingBootsSide, { O: '#262b44', P: '#ffffff', S: '#c2c3c7', L: '#ffffff' }, 'female'),
    makeItemPreset('shoes_1960s_mary_janes', "60's Mod Two-Tone Mary Janes", '1960s', 26, PATTERNS.loafersLowShoesFront, 26, PATTERNS.loafersLowShoesSide, { O: '#140c1c', P: '#ec273f', S: '#262b44', L: '#f7e26b' }, 'female'),

    // 1970s
    makeItemPreset('shoes_1970s_platforms', "70's Gold Platform Disco Boots", '1970s', 27, PATTERNS.sneakersShoesFront, 27, PATTERNS.sneakersShoesSide, { O: '#442434', P: '#e98537', S: '#743f39', L: '#f7e26b' }, 'unisex'),
    makeItemPreset('shoes_1970s_roller_skates', "70's Retro Quad Roller Skates", '1970s', 26, PATTERNS.tallRidingBootsFront, 26, PATTERNS.tallRidingBootsSide, { O: '#140c1c', P: '#ffffff', S: '#ec273f', L: '#0098dc' }, 'female'),
    makeItemPreset('shoes_1970s_suede_clogs', "70's Earth-Tone Suede Desert Boots", '1970s', 27, PATTERNS.bootsFront, 27, PATTERNS.bootsSide, { O: '#2c1e31', P: '#b86f50', S: '#663931', L: '#e4a672' }, 'male'),

    // 1980s
    makeItemPreset('shoes_1980s_hi_tops', "80's Arcade High-Top Kicks", '1980s', 27, PATTERNS.sneakersShoesFront, 27, PATTERNS.sneakersShoesSide, { O: '#262b44', P: '#ec273f', S: '#ac2847', L: '#ffffff' }, 'male'),
    makeItemPreset('shoes_1980s_slouch_warmers', "80's Neon Leg-Warmers & Aerobics Kicks", '1980s', 26, PATTERNS.tallRidingBootsFront, 26, PATTERNS.tallRidingBootsSide, { O: '#262b44', P: '#ffffff', S: '#c2c3c7', L: '#d77bba' }, 'female'),
    makeItemPreset('shoes_1980s_checker_slip', "80's New-Wave Checkerboard Slip-Ons", '1980s', 26, PATTERNS.loafersLowShoesFront, 26, PATTERNS.loafersLowShoesSide, { O: '#140c1c', P: '#262b44', S: '#ffffff', L: '#31a2f2' }, 'unisex'),

    // 1990s
    makeItemPreset('shoes_1990s_combat_docs', "90's Yellow-Stitch Combat Boots", '1990s', 27, PATTERNS.bootsFront, 27, PATTERNS.bootsSide, { O: '#140c1c', P: '#262b44', S: '#f7e26b', L: '#5a6988' }, 'female'),
    makeItemPreset('shoes_1990s_canvas_chucks', "90's Grunge Canvas High-Tops", '1990s', 27, PATTERNS.sneakersShoesFront, 27, PATTERNS.sneakersShoesSide, { O: '#140c1c', P: '#262b44', S: '#140c1c', L: '#ffffff' }, 'male'),
    makeItemPreset('shoes_1990s_wheat_timbs', "90's Wheat Nubuck Work Boots", '1990s', 27, PATTERNS.bootsFront, 27, PATTERNS.bootsSide, { O: '#442434', P: '#f3a833', S: '#8f563b', L: '#f7e26b' }, 'unisex'),

    // 2000s
    makeItemPreset('shoes_2000s_puffy_skate', "2000's Puffy Tongue Skate Shoes", '2000s', 27, PATTERNS.sneakersShoesFront, 27, PATTERNS.sneakersShoesSide, { O: '#140c1c', P: '#3a4466', S: '#262b44', L: '#d77bba' }, 'male'),
    makeItemPreset('shoes_2000s_faux_fur_boots', "2000's Y2K Sheepskin Cozy Boots", '2000s', 26, PATTERNS.tallRidingBootsFront, 26, PATTERNS.tallRidingBootsSide, { O: '#442434', P: '#b86f50', S: '#8f563b', L: '#f6d6bd' }, 'female'),
    makeItemPreset('shoes_2000s_studded_slip', "2000's Pop-Punk Crimson Skate Kicks", '2000s', 26, PATTERNS.loafersLowShoesFront, 26, PATTERNS.loafersLowShoesSide, { O: '#140c1c', P: '#ec273f', S: '#262b44', L: '#ffffff' }, 'unisex'),

    // 2010s
    makeItemPreset('shoes_2010s_knit_runners', "2010's Ultralight Knit Runners", '2010s', 27, PATTERNS.sneakersShoesFront, 27, PATTERNS.sneakersShoesSide, { O: '#262b44', P: '#0098dc', S: '#1e579c', L: '#ffffff' }, 'female'),
    makeItemPreset('shoes_2010s_suede_chelsea', "2010's Indie Tan Suede Chelsea Boots", '2010s', 27, PATTERNS.bootsFront, 27, PATTERNS.bootsSide, { O: '#2c1e31', P: '#b86f50', S: '#663931', L: '#e4a672' }, 'male'),
    makeItemPreset('shoes_2010s_white_minimal', "2010's Triple-White Low Sneakers", '2010s', 26, PATTERNS.loafersLowShoesFront, 26, PATTERNS.loafersLowShoesSide, { O: '#3a4466', P: '#ffffff', S: '#c2c3c7', L: '#a3ce27' }, 'unisex'),

    // 2020s
    makeItemPreset('shoes_2020s_chunky_dad_shoes', "2020's Chunky Sole Street Sneakers", '2020s', 27, PATTERNS.sneakersShoesFront, 27, PATTERNS.sneakersShoesSide, { O: '#140c1c', P: '#c2c3c7', S: '#5a6988', L: '#31a2f2' }, 'male'),
    makeItemPreset('shoes_2020s_lug_boots', "2020's Platform Lug-Sole Boots", '2020s', 26, PATTERNS.tallRidingBootsFront, 26, PATTERNS.tallRidingBootsSide, { O: '#140c1c', P: '#262b44', S: '#a3ce27', L: '#5a6988' }, 'female'),
    makeItemPreset('shoes_2020s_foam_clogs', "2020's Sculpted Foam Street Clogs", '2020s', 26, PATTERNS.loafersLowShoesFront, 26, PATTERNS.loafersLowShoesSide, { O: '#2c1e31', P: '#f6d6bd', S: '#e4a672', L: '#31a2f2' }, 'unisex')
  ],

  accessories: [
    {
      id: 'acc_none',
      name: 'None',
      era: 'all',
      gender: 'unisex',
      isNone: true,
      front: [],
      side: []
    },
    // OREGON TRAIL
    makeItemPreset('acc_oregon_prairie_apron', 'White Cotton Prairie Apron', 'oregon_trail', 19, PATTERNS.pioneerApronFront, 19, PATTERNS.pioneerApronSide, { O: '#5a6988', P: '#c2c3c7', S: '#8b93af', L: '#ffffff' }, 'female'),
    makeItemPreset('acc_oregon_wool_shawl', 'Knitted Pioneer Shoulder Shawl', 'oregon_trail', 12, PATTERNS.drapedScarfFront, 12, PATTERNS.drapedScarfSide, { O: '#442434', P: '#8f563b', S: '#663931', L: '#e4a672' }, 'female'),
    makeItemPreset('acc_oregon_trail_bandana', 'Red Paisley Trail Neck Kerchief', 'oregon_trail', 12, PATTERNS.trailBandanaFront, 12, PATTERNS.trailBandanaSide, { O: '#442434', P: '#ec273f', S: '#ac2847', L: '#f7e26b' }, 'male'),
    makeItemPreset('acc_oregon_powder_horn', 'Frontier Possibles Bag & Powder Horn', 'oregon_trail', 13, PATTERNS.crossbodyBagFront, 13, PATTERNS.crossbodyBagSide, { O: '#2c1e31', P: '#743f39', S: '#663931', L: '#f6d6bd' }, 'male'),
    makeItemPreset('acc_oregon_leather_braces', 'Homesteader Heavy Leather Suspenders', 'oregon_trail', 14, PATTERNS.suspendersBracesFront, 14, PATTERNS.suspendersBracesSide, { O: '#2c1e31', P: '#663931', S: '#442434', L: '#f3a833' }, 'unisex'),

    // 1500s
    makeItemPreset('acc_1500s_tudor_ruff', '1500s Starched Tudor Neck Ruff', '1500s', 11, PATTERNS.tudorRuffFront, 11, PATTERNS.tudorRuffSide, { O: '#5a6988', P: '#c2c3c7', S: '#8b93af', L: '#ffffff' }, 'unisex'),
    makeItemPreset('acc_1500s_collar_of_office', '1500s Tudor Gold Chain of Office', '1500s', 12, PATTERNS.pearlBeadNecklaceFront, 12, PATTERNS.pearlBeadNecklaceSide, { O: '#663931', P: '#f3a833', S: '#ec273f', L: '#f7e26b' }, 'male'),
    makeItemPreset('acc_1500s_jeweled_girdle', '1500s Ruby-Set Court Waist Girdle', '1500s', 19, PATTERNS.beltChainSashFront, 19, PATTERNS.beltChainSashSide, { O: '#2c1e31', P: '#ec273f', S: '#663931', L: '#f7e26b' }, 'female'),

    // 1600s
    makeItemPreset('acc_1600s_musketeer_baldric', '1600s Gilded Cavalier Sash', '1600s', 19, PATTERNS.beltChainSashFront, 19, PATTERNS.beltChainSashSide, { O: '#442434', P: '#ec273f', S: '#ac2847', L: '#f7e26b' }, 'male'),
    makeItemPreset('acc_1600s_falling_band', '1600s Puritan Falling Lace Collar', '1600s', 12, PATTERNS.collarRuffCravatFront, 12, PATTERNS.collarRuffCravatSide, { O: '#3a4466', P: '#c2c3c7', S: '#8b93af', L: '#ffffff' }, 'female'),
    makeItemPreset('acc_1600s_cross_baldric', '1600s Leather Sword Baldric Strap', '1600s', 13, PATTERNS.crossbodyBagFront, 13, PATTERNS.crossbodyBagSide, { O: '#2c1e31', P: '#8f563b', S: '#663931', L: '#f7e26b' }, 'unisex'),

    // 1700s
    makeItemPreset('acc_1700s_lace_cravat', '1700s Silk Jabot & Lace Cravat', '1700s', 12, PATTERNS.collarRuffCravatFront, 12, PATTERNS.collarRuffCravatSide, { O: '#3a4466', P: '#f7e26b', S: '#c2c3c7', L: '#ffffff' }, 'male'),
    makeItemPreset('acc_1700s_cameo_choker', '1700s Georgian Velvet & Pearl Choker', '1700s', 12, PATTERNS.pearlBeadNecklaceFront, 12, PATTERNS.pearlBeadNecklaceSide, { O: '#2c1e31', P: '#ac2847', S: '#6b2643', L: '#ffffff' }, 'female'),
    makeItemPreset('acc_1700s_order_sash', '1700s Royal Blue Order Riband', '1700s', 13, PATTERNS.crossbodyBagFront, 13, PATTERNS.crossbodyBagSide, { O: '#140c1c', P: '#0098dc', S: '#1e579c', L: '#f7e26b' }, 'unisex'),

    // 1800s
    makeItemPreset('acc_1800s_pocket_watch', '1800s Gold Watch Chain & Fob', '1800s', 19, PATTERNS.beltChainSashFront, 19, PATTERNS.beltChainSashSide, { O: '#2c1e31', P: '#f3a833', S: '#663931', L: '#f7e26b' }, 'male'),
    makeItemPreset('acc_1800s_monocle', '1800s Brass Monocle & Cord', '1800s', 6, PATTERNS.monocleChainFront, 6, PATTERNS.monocleChainSide, { O: '#663931', P: '#b2dce8', S: '#f3a833', L: '#ffffff' }, 'unisex'),
    makeItemPreset('acc_1800s_silk_ascot', '1800s Victorian Cameo Brooch & Lace', '1800s', 12, PATTERNS.collarRuffCravatFront, 12, PATTERNS.collarRuffCravatSide, { O: '#2c1e31', P: '#ac2847', S: '#f3a833', L: '#ffffff' }, 'female'),

    // 1900-1920
    makeItemPreset('acc_1900_bowtie_collar', '1900–1920 Wingtip Collar & Bowtie', '1900_1920', 12, PATTERNS.bowtieCollarFront, 12, PATTERNS.bowtieCollarSide, { O: '#140c1c', P: '#ec273f', S: '#ac2847', L: '#ffffff' }, 'male'),
    makeItemPreset('acc_1900_braces_suspenders', '1900–1920 Suffragette Sash & Ribbon', '1900_1920', 13, PATTERNS.crossbodyBagFront, 13, PATTERNS.crossbodyBagSide, { O: '#2c1e31', P: '#9c4176', S: '#ffffff', L: '#44891a' }, 'female'),
    makeItemPreset('acc_1900_driving_goggles', '1900–1920 Brass Motorist Goggles', '1900_1920', 6, PATTERNS.aviatorGogglesFront, 6, PATTERNS.aviatorGogglesSide, { O: '#442434', P: '#a3ce27', S: '#e98537', L: '#ffffff' }, 'unisex'),

    // 1921-1940
    makeItemPreset('acc_1920_flapper_pearls', '1921–1940 Long Flapper Pearl Strand', '1921_1940', 12, PATTERNS.pearlBeadNecklaceFront, 12, PATTERNS.pearlBeadNecklaceSide, { O: '#5a6988', P: '#c2c3c7', S: '#8b93af', L: '#ffffff' }, 'female'),
    makeItemPreset('acc_1920_jazz_necktie', '1921–1940 Speakeasy Silk Necktie', '1921_1940', 12, PATTERNS.longNecktieFront, 12, PATTERNS.longNecktieSide, { O: '#140c1c', P: '#ec273f', S: '#f7e26b', L: '#ffffff' }, 'male'),
    makeItemPreset('acc_1920_art_deco_scarf', '1921–1940 Art Deco Silk Scarf', '1921_1940', 12, PATTERNS.drapedScarfFront, 12, PATTERNS.drapedScarfSide, { O: '#140c1c', P: '#f3a833', S: '#262b44', L: '#f7e26b' }, 'unisex'),

    // 1941-1950
    makeItemPreset('acc_1941_aviator_shades', '1941–1950 Brass Aviator Goggles', '1941_1950', 6, PATTERNS.aviatorGogglesFront, 6, PATTERNS.aviatorGogglesSide, { O: '#663931', P: '#0098dc', S: '#f3a833', L: '#ffffff' }, 'unisex'),
    makeItemPreset('acc_1941_dog_tags', '1941–1950 Steel Dog-Tags & Chain', '1941_1950', 12, PATTERNS.discoMedallionFront, 12, PATTERNS.discoMedallionSide, { O: '#262b44', P: '#c2c3c7', S: '#8b93af', L: '#ffffff' }, 'male'),
    makeItemPreset('acc_1941_webbing_belt', '1941–1950 Red Polka-Dot Neck Tie', '1941_1950', 12, PATTERNS.bowtieCollarFront, 12, PATTERNS.bowtieCollarSide, { O: '#442434', P: '#ec273f', S: '#ac2847', L: '#ffffff' }, 'female'),

    // 1950s
    makeItemPreset('acc_1950s_horn_rim_glasses', "50's Buddy Horn-Rim Glasses", '1950s', 6, PATTERNS.hornRimGlassesFront, 6, PATTERNS.hornRimGlassesSide, { O: '#140c1c', P: '#b2dce8', S: '#3a4466', L: '#ffffff' }, 'unisex'),
    makeItemPreset('acc_1950s_chiffon_neck_scarf', "50's Pink Chiffon Diner Neck Scarf", '1950s', 12, PATTERNS.bowtieCollarFront, 12, PATTERNS.bowtieCollarSide, { O: '#6b2643', P: '#d77bba', S: '#9c4176', L: '#ffffff' }, 'female'),
    makeItemPreset('acc_1950s_bolo_tie', "50's Rockabilly Silver Bolo Tie", '1950s', 12, PATTERNS.longNecktieFront, 12, PATTERNS.longNecktieSide, { O: '#140c1c', P: '#0098dc', S: '#c2c3c7', L: '#ffffff' }, 'male'),

    // 1960s
    makeItemPreset('acc_1960s_round_shades', "60's Rose-Tint Peace Shades", '1960s', 6, PATTERNS.roundPeaceShadesFront, 6, PATTERNS.roundPeaceShadesSide, { O: '#f3a833', P: '#d77bba', S: '#e98537', L: '#ffffff' }, 'unisex'),
    makeItemPreset('acc_1960s_peace_pendant', "60's Silver Peace Medallion & Beads", '1960s', 12, PATTERNS.discoMedallionFront, 12, PATTERNS.discoMedallionSide, { O: '#262b44', P: '#0098dc', S: '#a3ce27', L: '#ffffff' }, 'female'),
    makeItemPreset('acc_1960s_skinny_mod_tie', "60's Carnaby Skinny Mod Tie", '1960s', 12, PATTERNS.longNecktieFront, 12, PATTERNS.longNecktieSide, { O: '#140c1c', P: '#262b44', S: '#ec273f', L: '#ffffff' }, 'male'),

    // 1970s
    makeItemPreset('acc_1970s_disco_medallion', "70's Gold Disco Medallion Chain", '1970s', 12, PATTERNS.discoMedallionFront, 12, PATTERNS.discoMedallionSide, { O: '#442434', P: '#e98537', S: '#f3a833', L: '#f7e26b' }, 'male'),
    makeItemPreset('acc_1970s_amber_aviators', "70's Amber Sunset Aviator Shades", '1970s', 6, PATTERNS.aviatorGogglesFront, 6, PATTERNS.aviatorGogglesSide, { O: '#8f563b', P: '#e98537', S: '#f3a833', L: '#f7e26b' }, 'unisex'),
    makeItemPreset('acc_1970s_macrame_sash', "70's Woven Boogie Fringe Belt", '1970s', 19, PATTERNS.beltChainSashFront, 19, PATTERNS.beltChainSashSide, { O: '#442434', P: '#e98537', S: '#8f563b', L: '#f7e26b' }, 'female'),

    // 1980s
    makeItemPreset('acc_1980s_neon_visor', "80's Neon Wayfarer Shades", '1980s', 6, PATTERNS.neonWayfarerShadesFront, 6, PATTERNS.neonWayfarerShadesSide, { O: '#140c1c', P: '#ec273f', S: '#262b44', L: '#31a2f2' }, 'unisex'),
    makeItemPreset('acc_1980s_fanny_pack', "80's Radical Neon Fanny Pack", '1980s', 19, PATTERNS.fannyPackWaistFront, 19, PATTERNS.fannyPackWaistSide, { O: '#140c1c', P: '#31a2f2', S: '#9c4176', L: '#f7e26b' }, 'female'),
    makeItemPreset('acc_1980s_bboy_rope_chain', "80's Heavy Gold Rope Chain", '1980s', 12, PATTERNS.pearlBeadNecklaceFront, 12, PATTERNS.pearlBeadNecklaceSide, { O: '#663931', P: '#f3a833', S: '#e98537', L: '#f7e26b' }, 'male'),

    // 1990s
    makeItemPreset('acc_1990s_wallet_chain', "90's Skater Studded Belt & Chain", '1990s', 19, PATTERNS.beltChainSashFront, 19, PATTERNS.beltChainSashSide, { O: '#140c1c', P: '#8b93af', S: '#262b44', L: '#ffffff' }, 'male'),
    makeItemPreset('acc_1990s_tattoo_choker', "90's Velvet Choker & Silver Pendant", '1990s', 12, PATTERNS.pearlBeadNecklaceFront, 12, PATTERNS.pearlBeadNecklaceSide, { O: '#140c1c', P: '#262b44', S: '#140c1c', L: '#c2c3c7' }, 'female'),
    makeItemPreset('acc_1990s_oval_clout_shades', "90's Kurt White-Frame Oval Shades", '1990s', 6, PATTERNS.roundPeaceShadesFront, 6, PATTERNS.roundPeaceShadesSide, { O: '#ffffff', P: '#262b44', S: '#c2c3c7', L: '#b2dce8' }, 'unisex'),

    // 2000s
    makeItemPreset('acc_2000s_y2k_shades', "2000's Rimless Y2K Tinted Shades", '2000s', 7, PATTERNS.y2kRimlessShadesFront, 7, PATTERNS.y2kRimlessShadesSide, { O: '#6b2643', P: '#d77bba', S: '#f7e26b', L: '#ffffff' }, 'female'),
    makeItemPreset('acc_2000s_skater_necktie', "2000's Pop-Punk Loose Red Necktie", '2000s', 12, PATTERNS.longNecktieFront, 12, PATTERNS.longNecktieSide, { O: '#140c1c', P: '#ec273f', S: '#262b44', L: '#262b44' }, 'male'),
    makeItemPreset('acc_2000s_studded_white_belt', "2000's Emo Checkerboard Stud Belt", '2000s', 19, PATTERNS.beltChainSashFront, 19, PATTERNS.beltChainSashSide, { O: '#140c1c', P: '#ffffff', S: '#262b44', L: '#ec273f' }, 'unisex'),

    // 2010s
    makeItemPreset('acc_2010s_neck_headphones', "2010's Studio Neck Headphones", '2010s', 12, PATTERNS.neckHeadphonesFront, 12, PATTERNS.neckHeadphonesSide, { O: '#140c1c', P: '#ec273f', S: '#262b44', L: '#ffffff' }, 'unisex'),
    makeItemPreset('acc_2010s_infinity_scarf', "2010's Cozy Knit Infinity Scarf", '2010s', 12, PATTERNS.drapedScarfFront, 12, PATTERNS.drapedScarfSide, { O: '#2c1e31', P: '#ac2847', S: '#6b2643', L: '#e4a672' }, 'female'),
    makeItemPreset('acc_2010s_hipster_suspenders', "2010's Indie Leather Suspenders", '2010s', 14, PATTERNS.suspendersBracesFront, 14, PATTERNS.suspendersBracesSide, { O: '#2c1e31', P: '#8f563b', S: '#663931', L: '#f7e26b' }, 'male'),

    // 2020s
    makeItemPreset('acc_2020s_chest_rig', "2020's Tactical Crossbody Bag", '2020s', 13, PATTERNS.crossbodyBagFront, 13, PATTERNS.crossbodyBagSide, { O: '#140c1c', P: '#262b44', S: '#3a4466', L: '#a3ce27' }, 'male'),
    makeItemPreset('acc_2020s_chunky_visor_shades', "2020's Neon Lime Rectangle Shades", '2020s', 6, PATTERNS.neonWayfarerShadesFront, 6, PATTERNS.neonWayfarerShadesSide, { O: '#140c1c', P: '#a3ce27', S: '#140c1c', L: '#ffffff' }, 'female'),
    makeItemPreset('acc_2020s_pearl_street_chain', "2020's Streetwear Pearl & Silver Chain", '2020s', 12, PATTERNS.pearlBeadNecklaceFront, 12, PATTERNS.pearlBeadNecklaceSide, { O: '#3a4466', P: '#c2c3c7', S: '#31a2f2', L: '#ffffff' }, 'unisex')
  ]
};

globalThis.CHARACTER_BOILERPLATE = {
  GRID_SIZE,
  GENDERS,
  ERAS,
  CATEGORIES,
  PRESET_COLOR_DYES,
  SKIN_TONES,
  BASE_BODY_TEMPLATES,
  INITIAL_CLOTHING_BOILERPLATE,
  buildPixelsFromRowMap
};

export const CHARACTER_BOILERPLATE = globalThis.CHARACTER_BOILERPLATE;
export { GRID_SIZE, GENDERS, ERAS, CATEGORIES, PRESET_COLOR_DYES, SKIN_TONES, BASE_BODY_TEMPLATES, INITIAL_CLOTHING_BOILERPLATE, buildPixelsFromRowMap };

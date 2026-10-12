import { z } from 'zod';
import { config } from '../config.js';
import { composeNarration, type NarrationContext } from './narration.js';

const surrealMutationSchema = z.object({
  kind: z.enum([
    'black_hole',
    'sentient_oxen',
    'weather_anomaly',
    'role_reversal',
    'river_reversal',
    'memory_haunting',
    'wagon_metamorphosis'
  ]),
  description: z.string().min(1).max(240),
  severity: z.enum(['low', 'medium', 'high', 'apocalyptic']).default('medium')
});

const obstacleCostSchema = z.object({
  health: z.number().int().nonnegative().max(20).default(0),
  morale: z.number().int().nonnegative().max(20).default(0),
  food: z.number().int().nonnegative().max(20).default(0),
  water: z.number().int().nonnegative().max(20).default(0),
  wood: z.number().int().nonnegative().max(20).default(0),
  medicine: z.number().int().nonnegative().max(20).default(0),
  ammunition: z.number().int().nonnegative().max(20).default(0),
  days: z.number().int().nonnegative().max(3).default(0)
});

const obstacleChoiceSchema = z.object({
  id: z.string().min(1).max(48).regex(/^[a-z0-9-]+$/),
  label: z.string().min(1).max(80),
  description: z.string().min(1).max(180),
  cost: obstacleCostSchema.default({})
});

const obstacleSchema = z.object({
  description: z.string().min(1).max(260),
  choices: z.array(obstacleChoiceSchema).min(2).max(3)
});

const narrationBeatSchema = z.object({
  body: z.string().min(1).max(1200),
  keyPoints: z.array(z.string().min(1).max(240)).max(6).default([]),
  headline: z.string().min(1).max(140).optional(),
  lines: z.array(z.string().min(1).max(240)).max(6).optional(),
  obstacle: obstacleSchema.optional(),
  tone: z.enum(['plain', 'uncanny', 'grotesque', 'cosmic', 'melancholic']).default('uncanny'),
  surrealMutation: surrealMutationSchema.optional(),
  hook: z.string().min(1).max(240).optional()
});

export type SurrealMutation = z.infer<typeof surrealMutationSchema>;
export type Obstacle = z.infer<typeof obstacleSchema>;
export type NarrationBeat = {
  source: 'llm' | 'deterministic';
  headline: string;
  body: string;
  lines?: string[];
  keyPoints?: string[];
  obstacle?: Obstacle;
  tone?: 'plain' | 'uncanny' | 'grotesque' | 'cosmic' | 'melancholic';
  surrealMutation?: SurrealMutation;
  hook?: string;
};

function truncateWords(text: string, maxWords: number): string {
  const normalized = text.trim();
  if (!normalized) {
    return '';
  }

  const words = normalized.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) {
    return normalized;
  }

  const sentences = normalized.match(/[^.!?]+[.!?]?/g) ?? [normalized];
  let result = '';
  let count = 0;

  for (const sentence of sentences) {
    const sentenceWords = sentence.trim().split(/\s+/).filter(Boolean);
    if (!sentenceWords.length) {
      continue;
    }
    if (count + sentenceWords.length > maxWords) {
      const remaining = words.slice(count, count + Math.max(0, maxWords - count));
      return remaining.join(' ').trim();
    }
    result = `${result}${result ? ' ' : ''}${sentence.trim()}`.trim();
    count += sentenceWords.length;
    if (count >= maxWords) {
      return result;
    }
  }

  return words.slice(0, maxWords).join(' ').trim();
}

function llmNarrationConfigured(): boolean {
  return config.llmNarrationEnabled && config.googleAiStudioApiKey.length > 0;
}

function buildChaosCatalog(): Array<{ kind: SurrealMutation['kind']; example: string }> {
  return [
    {
      kind: 'black_hole',
      example: 'A black hole opens over the plains and swallows the horizon, the oxen, and the concept of forward progress.'
    },
    {
      kind: 'sentient_oxen',
      example: 'The oxen become the dominant species and insist the humans pull the wagon for a change.'
    },
    {
      kind: 'weather_anomaly',
      example: 'A hot wind turns to sleet in one breath, then dries the ground before it lands.'
    },
    {
      kind: 'role_reversal',
      example: 'The trail decides the party is livestock and begins issuing weather advisories in human language.'
    },
    {
      kind: 'river_reversal',
      example: 'The river runs backward and remembers every boat that never reached it.'
    },
    {
      kind: 'memory_haunting',
      example: 'A memory of a town that never existed starts buying supplies for the wagon.'
    },
    {
      kind: 'wagon_metamorphosis',
      example: 'The wagon splits into several smaller wagons, each arguing over who is in charge of history.'
    }
  ];
}

function buildNarrationInstructions(context: NarrationContext): string {
  const chaosCatalog = buildChaosCatalog()
    .map((entry) => `- ${entry.kind}: ${entry.example}`)
    .join('\n');

  const landmarkInstruction = context.isMajorLandmark
    ? [
        '### MAJOR LANDMARK ARRIVAL (HIGH NARRATIVE IMPORTANCE):',
        '- The wagon party has arrived at a monumental, historical landmark along the trail!',
        '- Make this dispatch MOMENTOUS, evocative, and significant.',
        '- Reflect deeply on the grueling miles crossed since the last major stop, the physical and emotional toll endured by the party, and the majestic or forbidding presence of this iconic waypoint.',
        '- Highlight the contrast between the brutal wilderness left behind and the respite, trade, or looming peril this landmark offers before the next leg of the 2,000-mile journey.'
      ]
    : [
        '### OVERLAND TRAIL MARCH / CAMP DISPATCH:',
        '- The party is navigating the open wilderness between landmarks.',
        '- Focus on the gritty sensory reality of travel: wagon axle groans, wheel ruts, blinding dust, changing skies, crew conversations or tension, and immediate survival trade-offs.'
      ];

  const phaseInstructions = context.journeyPhase === 'start'
    ? [
        '- This is the opening scene of the journey at the trailhead in Independence.',
        '- Establish the wagon party, the heavy stakes of the Oregon Trail, and the daunting 2,000-mile road ahead.'
      ]
    : context.journeyPhase === 'finish'
      ? [
          '- This is the triumphant, exhausted finale of the expedition.',
          '- Resolve the journey upon reaching Oregon / the Willamette Valley; describe the survivors, the graves left behind, and the final cost of the crossing.'
        ]
      : [
          '- This is the deep overland route across the continent.',
          '- Keep the forward momentum palpable and the stakes constantly shifting.'
        ];

  return [
    'You are the Frontier Dungeon Master presiding over an atmospheric, grounded, and subtly uncanny Oregon Trail survival odyssey from Independence to Oregon (Point A to Point B).',
    'Your voice is evocative, observant, and literary—reminiscent of Cormac McCarthy or classic frontier gothic literature.',
    '',
    ...landmarkInstruction,
    '',
    ...phaseInstructions,
    '',
    '### The 3-Beat Output Structure:',
    'Return strict JSON only in this exact shape:',
    '{',
    '  "headline": "<Short 3-8 word title of the beat>",',
    '  "lines": [',
    '    "<Line 1: Action & Movement — Who moves where, miles gained, or what immediate choice/action was enacted>",',
    '    "<Line 2: Sensory & Foreshadowing — Atmospheric details: wind biting wool, alkali dust, smell of cedar, crew mood, or subtle uncanny omens>",',
    '    "<Line 3: Resolution & Consequence — How the day settles, remaining rations/water, distance to next waypoint, or aftermath of the decision>"',
    '  ],',
    '  "body": "<Line 1> <Line 2> <Line 3>",',
    '  "keyPoints": ["factual continuity anchor 1", "factual continuity anchor 2", "factual continuity anchor 3"],',
    '  "obstacle": null',
    '}',
    '',
    '### Core Narrative Rules:',
    '- Deliver your narrative in exactly 3 distinct, complete sentences corresponding to the 3 lines.',
    '- Read the "DM Dossier" provided in the prompt. Adapt your tone to reflect the player\'s moral temperament, pace habits, and the crew\'s simmering sentiment.',
    '- If an action or decision was just resolved (e.g. river crossing, hunting, emergency treatment), provide immediate narrative payoff and describe what was risked or lost.',
    '- Escalate strangeness and surreal elements based on the Current Strangeness Level (0-10):',
    '  * Strangeness 0-2: Harsh, grounded, historical frontier realism.',
    '  * Strangeness 3-5: Subtle uncanny anomalies, eerie atmospheric shifts, unnatural animal stillness, backward ripples.',
    '  * Strangeness 6-8: Overtly surreal or gothic mutations (bizarre horizon mirages, whispering trail ruts, time slippages, wagon metamorphosis).',
    '  * Strangeness 9-10: Cosmic frontier distortions and unexplainable trail horrors.',
    '- Treat strange occurrences with deadpan, matter-of-fact frontier gravity.',
    '- Never mention tile IDs, coordinates, or UI button names.',
    '- Use realistic pioneer supply units: rations, gallons, bundles, doses.',
    '- Only build an obstacle if the situation warrants an acute crisis; otherwise obstacle must be null.',
    '',
    'Allowed mutation motifs for inspiration when strangeness is high:',
    chaosCatalog
  ].join('\n');
}

function extractGeminiText(payload: {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}): string {
  const parts = payload.candidates?.[0]?.content?.parts ?? [];
  return parts
    .map((part) => part.text ?? '')
    .join('')
    .trim();
}

function parseNarrationBeat(content: string): NarrationBeat {
  const trimmed = content.trim();
  const toBeat = (parsed: z.infer<typeof narrationBeatSchema>): NarrationBeat => {
    let body = parsed.body.trim();
    let lines = parsed.lines?.map((line) => line.trim()).filter(Boolean);
    if (lines && lines.length >= 2) {
      body = lines.join(' ');
    } else {
      const sentences = body.match(/[^.!?]+[.!?]?/g) ?? [body];
      lines = sentences.map((s) => s.trim()).filter(Boolean);
    }
    const headline = parsed.headline?.trim() || lines[0]?.replace(/[.!?]+$/, '').trim() || 'The trail speaks';
    return {
      source: 'llm',
      headline,
      body,
      lines,
      keyPoints: parsed.keyPoints,
      obstacle: parsed.obstacle,
      tone: parsed.tone,
      surrealMutation: parsed.surrealMutation,
      hook: parsed.hook
    };
  };
  try {
    return toBeat(narrationBeatSchema.parse(JSON.parse(trimmed)));
  } catch {
    const codeBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlock?.[1]) {
      try {
        return toBeat(narrationBeatSchema.parse(JSON.parse(codeBlock[1].trim())));
      } catch {
        // Fall through to the looser object extraction below.
      }
    }

    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start >= 0 && end > start) {
      const objectText = trimmed.slice(start, end + 1);
      return toBeat(narrationBeatSchema.parse(JSON.parse(objectText)));
    }

    throw new Error('Gemini narration response did not include a JSON object');
  }
}

function buildGeminiModels(): string[] {
  return [...new Set([
    config.googleAiStudioModel,
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-1.5-flash'
  ].filter(Boolean))];
}

function summarizeHistory(context: NarrationContext): string {
  const entries = context.historyLog ?? [];
  if (!entries.length) {
    return 'none';
  }
  return entries
    .slice(-8)
    .map((entry) => `day ${entry.day} ${entry.actionLabel} (${entry.outcome}), strangeness ${entry.strangenessLevel ?? context.strangenessLevel ?? 0}/10`)
    .join(' | ');
}

function summarizePriorNarration(context: NarrationContext): string {
  const entries = context.priorNarration ?? [];
  if (!entries.length) {
    return 'none';
  }
  return entries
    .slice(-3)
    .map((entry, index) => `beat${index + 1}: ${entry}`)
    .join(' || ');
}

function summarizePriorKeyPoints(context: NarrationContext): string {
  const entries = context.priorKeyPoints ?? [];
  if (!entries.length) {
    return 'none';
  }
  return entries.slice(-10).join(' | ');
}

function summarizeSupplies(context: NarrationContext): string {
  if (context.supplyEstimates) {
    return `${context.supplyEstimates.foodRations} rations, ${context.supplyEstimates.waterGallons} gallons water, ${context.supplyEstimates.firewoodBundles} bundles firewood, ${context.supplyEstimates.medicineDoses} medicine doses`;
  }
  return `food ${context.wagon.food}, water ${context.wagon.water}, wood ${context.wagon.wood}, medicine ${context.wagon.medicine}`;
}

function stripGridReferences(text: string): string {
  return text.replace(/\b\d+:\d+\b/g, 'this stretch of trail').replace(/\s+/g, ' ').trim();
}

function deriveFallbackKeyPoints(context: NarrationContext): string[] {
  const risk = context.riskState
    ? Object.entries(context.riskState).filter(([, value]) => value).map(([key]) => key)
    : [];
  const riskLine = risk.length ? `Active risk: ${risk.join(', ')}` : 'Active risk: stable';
  const actionLine = context.lastAction
    ? `Last action: ${context.lastAction.actionLabel} (${context.lastAction.outcome})`
    : 'Last action: none';
  return [
    `Day ${context.day} near ${context.locationName ?? context.biome}`,
    actionLine,
    `Supplies ${summarizeSupplies(context)}`,
    `Strangeness ${context.strangenessLevel ?? 0}/10`,
    riskLine
  ];
}

function buildObstacleChoice(
  id: string,
  label: string,
  description: string,
  cost: Partial<Obstacle['choices'][number]['cost']>
): Obstacle['choices'][number] {
  return {
    id,
    label,
    description,
    cost: {
      health: 0,
      morale: 0,
      food: 0,
      water: 0,
      wood: 0,
      medicine: 0,
      ammunition: 0,
      days: 0,
      ...cost
    }
  };
}

function selectObstacleVariant(obstacles: Obstacle[], context: NarrationContext, salt = 0): Obstacle {
  const historySize = context.historyLog?.length ?? 0;
  const actionLength = context.lastAction?.actionType?.length ?? 0;
  const index = (context.day + context.distanceToFrontier + historySize + actionLength + (context.strangenessLevel ?? 0) + salt) % obstacles.length;
  return obstacles[index];
}

function chooseFallbackObstacle(context: NarrationContext): Obstacle {
  if (context.riskState?.waterCritical) {
    return selectObstacleVariant([
      {
        description: 'A dry stretch lies ahead, and the party does not have enough water to treat this as an ordinary mile.',
        choices: [
          buildObstacleChoice('push-dry-stretch', 'Push through the dry stretch', 'Keep the wagon moving and gamble on finding water before dusk.', { health: 3, morale: 2, water: 2 }),
          buildObstacleChoice('dig-seeps', 'Stop and dig for seep water', 'Lose time scraping muddy hollows for a smaller, safer refill.', { days: 1, food: 1, water: 1 }),
          buildObstacleChoice('crack-reserves', 'Break into reserve stores', 'Open extra supplies now to steady the crew before marching on.', { food: 2, medicine: 1 })
        ]
      },
      {
        description: 'The barrels are running light just as the trail bends away from every reliable creek bed.',
        choices: [
          buildObstacleChoice('ration-the-drink', 'Cut drinking water hard', 'Keep the wagon rolling by tightening everyone’s share to the edge of reason.', { health: 2, morale: 3, water: 1 }),
          buildObstacleChoice('follow-the-dry-gully', 'Follow a dry gully downstream', 'Burn time chasing the hope of trapped water in stone pockets.', { days: 1, food: 1, water: 1 }),
          buildObstacleChoice('trade-medicine-for-water', 'Break emergency stores for water discipline', 'Spend rare medical reserves to stabilize the crew through the thirst.', { medicine: 1, food: 1 })
        ]
      },
      {
        description: 'Heat shimmer has turned the next miles mean, and the wagon cannot cross them without choosing what kind of thirst to endure.',
        choices: [
          buildObstacleChoice('night-march', 'March after sundown', 'Save water by moving in cooler dark, but fray nerves and footing.', { health: 1, morale: 2, water: 1 }),
          buildObstacleChoice('scrape-cactus-pulp', 'Scrape moisture from the land', 'Lose a day coaxing small relief from bitter plants and mud.', { days: 1, food: 1 }),
          buildObstacleChoice('dump-cargo-for-speed', 'Lighten the wagon for a fast crossing', 'Abandon useful stores so the team can clear the dry belt quicker.', { wood: 1, food: 1, water: 1 })
        ]
      }
    ], context, 1);
  }

  if (context.riskState?.foodCritical) {
    return selectObstacleVariant([
      {
        description: 'Game has gone scarce, and the wagon is entering a lean stretch where hunger can turn one bad choice into a collapse.',
        choices: [
          buildObstacleChoice('slaughter-reserve', 'Slaughter reserve stock', 'Convert part of the team or stores into emergency meals now.', { food: 0, morale: 4, health: 1 }),
          buildObstacleChoice('half-rations-march', 'March on half rations', 'Preserve distance at the cost of strength and discipline.', { health: 3, morale: 2, food: 1 }),
          buildObstacleChoice('forage-the-draw', 'Search every draw for forage', 'Lose time combing the trail margins for edible plants and scraps.', { days: 1, water: 1, food: 1 })
        ]
      },
      {
        description: 'The meat sacks are thinning, and even the youngest voices in camp have started asking what happens when supper fails to come.',
        choices: [
          buildObstacleChoice('boil-the-last-fat', 'Boil the last fat and flour', 'Stretch scraps into one more meal to steady the crew tonight.', { food: 2, morale: 1 }),
          buildObstacleChoice('send-hunters-wide', 'Send hunters far off trail', 'Lose time and risk strength chasing a bigger kill.', { days: 1, water: 1, health: 1 }),
          buildObstacleChoice('tighten-buckles', 'Tighten belts and march', 'Refuse delay, but drive the wagon onward hungry and sour.', { health: 3, morale: 3 })
        ]
      },
      {
        description: 'A barren run lies ahead, and the wagon must decide whether to spend strength, time, or precious stores to outrun hunger.',
        choices: [
          buildObstacleChoice('grind-seed-cakes', 'Grind seed cakes from feed', 'Turn animal stores into poor human meals before the next stop.', { food: 1, morale: 2 }),
          buildObstacleChoice('camp-and-trap', 'Camp and set traps', 'Lose a day trying to scrape together enough meat to matter.', { days: 1, water: 1 }),
          buildObstacleChoice('burn-muscle', 'Force a fast crossing', 'Try to beat the famine stretch with speed and stubbornness.', { health: 2, morale: 2, food: 1 })
        ]
      }
    ], context, 2);
  }

  if (context.riskState?.healthLow) {
    return selectObstacleVariant([
      {
        description: 'Illness is spreading through camp, and the next decision must balance recovery against dwindling stores.',
        choices: [
          buildObstacleChoice('dose-immediately', 'Dose the worst case immediately', 'Spend scarce medicine now to keep the sick from collapsing.', { medicine: 2, food: 1 }),
          buildObstacleChoice('quarantine-camp', 'Quarantine and hold camp', 'Lose a full day while the crew isolates and regains strength.', { days: 1, food: 2, water: 2, morale: 1 }),
          buildObstacleChoice('push-through-fever', 'Push through the fever', 'Preserve supplies, but force the party onward in dangerous condition.', { health: 5, morale: 3 })
        ]
      },
      {
        description: 'A feverish weakness has settled over the wagon train, and everyone can see that one more hard push might break somebody for good.',
        choices: [
          buildObstacleChoice('bleed-the-kit', 'Use the deep medicine cache', 'Spend heavily from the kit to keep the sick alive and moving later.', { medicine: 2, water: 1 }),
          buildObstacleChoice('rest-under-canvas', 'Keep everyone under canvas', 'Surrender a day while the worst cases sweat it out.', { days: 1, food: 1, morale: 1 }),
          buildObstacleChoice('harness-up-anyway', 'Harness up anyway', 'Save supplies now and accept the toll on frail bodies.', { health: 4, morale: 2 })
        ]
      },
      {
        description: 'The camp smells of sickness and wet blankets, and the party must choose whether to spend supplies, time, or flesh to get through it.',
        choices: [
          buildObstacleChoice('brew-tonics', 'Brew tonics from the last remedies', 'Use what remains of the medicines and herbs for a steadier recovery.', { medicine: 1, food: 1 }),
          buildObstacleChoice('split-the-camp', 'Split the camp and isolate the weak', 'Contain the sickness but lose a day managing two fragile camps.', { days: 1, water: 1, morale: 1 }),
          buildObstacleChoice('carry-the-sick-forward', 'Carry the sick forward with the wagon', 'Keep moving now, but grind the whole party down in the process.', { health: 3, morale: 2, food: 1 })
        ]
      }
    ], context, 3);
  }

  if (context.riskState?.moraleLow) {
    return selectObstacleVariant([
      {
        description: 'The campfire talk has turned bitter, and the wagon will pay a price no matter how you settle the unrest.',
        choices: [
          buildObstacleChoice('rest-and-ration', 'Call an early halt', 'Spend the evening calming the crew instead of gaining ground.', { days: 1, food: 1, water: 1 }),
          buildObstacleChoice('promise-bonus-rations', 'Promise better rations', 'Buy cooperation with supplies the wagon can ill spare.', { food: 2, morale: 0 }),
          buildObstacleChoice('drive-them-harder', 'Drive the crew harder', 'Keep schedule at the cost of tempers, health, and trust.', { health: 2, morale: 4 })
        ]
      },
      {
        description: 'Tempers are fraying at the edge of mutiny, and the wagon master has to choose whether to spend provisions, time, or fear to hold the party together.',
        choices: [
          buildObstacleChoice('hand-out-coffee', 'Hand out comfort stores', 'Use morale food and little luxuries to calm the loudest complaints.', { food: 1, water: 1 }),
          buildObstacleChoice('halt-for-council', 'Halt for a camp council', 'Lose a day letting everyone air their grievances before they rot deeper.', { days: 1, morale: 1 }),
          buildObstacleChoice('threaten-discipline', 'Threaten discipline', 'Restore order fast, but deepen bitterness through the camp.', { morale: 4, health: 1 })
        ]
      },
      {
        description: 'Nobody trusts the next mile, and the wagon cannot keep its shape unless someone pays to mend the mood.',
        choices: [
          buildObstacleChoice('sing-and-settle', 'Settle the camp with ritual and rest', 'Spend the evening rebuilding trust instead of chasing distance.', { days: 1, food: 1 }),
          buildObstacleChoice('sweeten-the-pot', 'Sweeten the ration line', 'Trade supplies for a short-lived return of good temper.', { food: 2, morale: 0 }),
          buildObstacleChoice('march-in-silence', 'March in silence and refuse debate', 'Gain ground now while resentment hardens under the canvas.', { morale: 3, health: 1, water: 1 })
        ]
      }
    ], context, 4);
  }

  const travelHazards: Obstacle[] = [
    {
      description: 'A mud bog has swallowed the wagon ruts ahead, and every yard through it threatens to suck away time or gear.',
      choices: [
        buildObstacleChoice('lash-through-bog', 'Lash through the bog', 'Drive the team hard and hope brute force clears the mire.', { health: 2, water: 1, morale: 1 }),
        buildObstacleChoice('corduroy-road', 'Lay a corduroy track', 'Spend lumber under the wheels to make a safer crossing.', { wood: 2, days: 1 }),
        buildObstacleChoice('swing-around-bog', 'Swing wide around the bog', 'Detour over firmer ground at the price of time and rations.', { food: 1, water: 1, days: 1 })
      ]
    },
    {
      description: 'Quicksand gleams beneath the grass, leaving only a narrow line where the wagon might pass in one piece.',
      choices: [
        buildObstacleChoice('probe-and-creep', 'Probe and creep forward', 'Use poles and patience to ease the wagon through.', { days: 1, morale: 1 }),
        buildObstacleChoice('unload-the-wagon', 'Unload and ferry the cargo', 'Lighten the wagon before risking the crossing.', { food: 1, water: 1, health: 1 }),
        buildObstacleChoice('gamble-on-speed', 'Gamble on speed', 'Rush the crossing before the ground gives way beneath the wheels.', { health: 3, wood: 1, morale: 2 })
      ]
    },
    {
      description: 'Dense fog has rolled over the trail and erased the landmarks, turning every fork into a guess.',
      choices: [
        buildObstacleChoice('camp-for-visibility', 'Camp until the fog lifts', 'Wait for daylight or wind to restore the trail markers.', { days: 1, food: 1, water: 1 }),
        buildObstacleChoice('send-a-scout', 'Send a scout ahead', 'Let one party member feel out the road while the wagon waits.', { health: 2, morale: 1 }),
        buildObstacleChoice('march-by-instinct', 'March by instinct', 'Keep moving blind and trust the wagon master’s nerve.', { morale: 2, water: 1 })
      ]
    },
    {
      description: 'The oxen have caught a wild scent on the wind and are stamping hard against the yoke.',
      choices: [
        buildObstacleChoice('calm-the-team', 'Calm the oxen by hand', 'Lose time and patience settling the team before they bolt.', { days: 1, morale: 1 }),
        buildObstacleChoice('cut-feed-now', 'Cut extra feed for the team', 'Spend provisions to quiet the animals and keep them obedient.', { food: 2 }),
        buildObstacleChoice('force-the-yoke', 'Force them back into line', 'Keep moving, but risk injury and frayed nerves.', { health: 2, morale: 2 })
      ]
    },
    {
      description: 'A broken bridge spans the next cut in the trail, and crossing it will demand either salvage or nerve.',
      choices: [
        buildObstacleChoice('brace-the-bridge', 'Brace the bridge with lumber', 'Reinforce the timbers just enough for one careful crossing.', { wood: 2, days: 1 }),
        buildObstacleChoice('ford-below', 'Ford below the bridge', 'Try the shallows downstream instead of trusting the old planks.', { water: 2, health: 2 }),
        buildObstacleChoice('turn-back-to-detour', 'Backtrack to a detour', 'Lose ground to find another crossing upstream.', { days: 1, food: 1, morale: 1 })
      ]
    }
  ];

  return selectObstacleVariant(travelHazards, context, 5);
}

function shouldCreateFallbackObstacle(context: NarrationContext): boolean {
  const isTravel = Boolean(
    context.lastAction?.actionType?.startsWith('travel-') ||
    context.lastAction?.actionType === 'press-on'
  );
  if (!isTravel) {
    return false;
  }

  const activeRisk = Boolean(
    context.riskState?.waterCritical ||
    context.riskState?.foodCritical ||
    context.riskState?.moraleLow ||
    context.riskState?.healthLow
  );
  if (activeRisk) {
    return Math.random() < 0.45;
  }

  return Math.random() < 0.22;
}

async function requestGeminiNarration(context: NarrationContext): Promise<NarrationBeat> {
  const requestPayload = {
    systemInstruction: {
      parts: [{ text: buildNarrationInstructions(context) }]
    },
    contents: [
      {
        role: 'user',
        parts: [
          {
          text: [
            `Journey phase: ${context.journeyPhase}`,
            `Day: ${context.day}`,
            `Expedition: ${context.expeditionName ?? 'The Schachterle Family'}`,
            `Miles traveled: ${context.milesTraveled ?? 0} of 2,000 miles`,
            `Is major landmark arrival: ${context.isMajorLandmark ? 'YES' : 'NO'}`,
            `Current landmark: ${context.currentLandmark ?? context.locationName ?? context.biome}`,
            `Next landmark ahead: ${context.nextLandmark ?? 'the next milestone'}`,
            `Distance context: ${context.distanceDescriptor ?? 'deep in the overland trail'}`,
            `Weather: rain ${context.weather.rain}, temp ${context.weather.tempC} C, wind ${context.weather.windKph} kph`,
            `Wagon: health ${context.wagon.health}, morale ${context.wagon.morale}, supplies ${summarizeSupplies(context)}, status ${context.wagon.status}`,
            `Current strangeness level: ${context.strangenessLevel ?? 0}/10`,
            `DM Dossier Temperament: ${context.dmDossier?.temperament ?? 'Pragmatic frontier leader'}`,
            `DM Dossier Pace Habit: ${context.dmDossier?.paceHabit ?? 'Steady'}`,
            `DM Dossier Crew Compassion: ${context.dmDossier?.crewCompassion ?? 'Balanced'}`,
            `DM Dossier Crew Sentiment: ${context.dmDossier?.crewSentiment ?? 'Solidarity under strain'}`,
            `DM Dossier Historical Decisions: ${context.dmDossier?.recentDecisions?.join(' | ') || 'none recorded yet'}`,
            `Journey completed: ${context.journeyCompleted ? 'yes' : 'no'}`,
            `Recent events: ${context.recentEvents.length ? context.recentEvents.map((event) => event.eventType).join(', ') : 'none'}`,
            `Chosen action: ${context.lastAction ? `${context.lastAction.actionLabel} on day ${context.lastAction.day} (${context.lastAction.outcome})` : 'none yet'}`,
            `Action result summary: ${context.lastAction ? stripGridReferences(context.lastAction.statusMessage) : 'none yet'}`,
            `Miles gained on last move: ${context.lastAction?.milesGained ?? 0}`,
            `Just resolved decision: ${context.justResolvedDecision ? `${context.justResolvedDecision.chosenOption} (${context.justResolvedDecision.outcome ?? 'resolved'})` : 'none'}`,
            `Actions available at last stop: ${context.lastAction ? (context.lastAction.availableOptionsAtStop ?? []).join(', ') || 'none' : 'none yet'}`,
            `Actions skipped at last stop: ${context.lastAction ? (context.lastAction.skippedOptionsAtStop ?? []).join(', ') || 'none' : 'none yet'}`,
            `Action history log: ${summarizeHistory(context)}`,
            `Prior narration to avoid repeating: ${summarizePriorNarration(context)}`,
            `Prior key points to continue: ${summarizePriorKeyPoints(context)}`,
            `Available action types for inspiration: ${context.availableActionTypes?.length ? context.availableActionTypes.join(', ') : 'none'}`,
            `Current unresolved obstacle: ${context.activeObstacle ? `${context.activeObstacle.description} | choices: ${context.activeObstacle.choices.map((choice) => choice.label).join(', ')}` : 'none'}`,
            `Available choices: ${context.decisionOptions?.length ? context.decisionOptions.join(', ') : 'none'}`,
            `Risk state: ${context.riskState ? Object.entries(context.riskState).filter(([, value]) => value).map(([key]) => key).join(', ') || 'stable' : 'stable'}`,
            `Game over: ${context.gameOver ? 'yes' : 'no'}`,
            '',
            context.isMajorLandmark
              ? 'Deliver a momentous, significant 3-beat chronicle of this major landmark arrival.'
              : 'Deliver a grounded, sensory 3-beat chronicle of this wilderness march or camp stop.',
            'Return strict JSON only matching the schema, with lines: ["Line 1", "Line 2", "Line 3"].'
          ].join('\n')
        }
      ]
    }
  ],
  generationConfig: {
    temperature: 0.8,
    maxOutputTokens: 400
  }
  };
  const body = JSON.stringify(requestPayload);
  console.log('[llm-narration] outbound payload object', requestPayload);
  console.log('[llm-narration] outbound payload json', body);

  const models = buildGeminiModels();
  let lastError: Error | null = null;

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${config.googleAiStudioApiKey}`;
    console.log('[llm-narration] outbound request meta', { model, url });
    const response = await fetch(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      lastError = new Error(`Gemini narration request failed for ${model}: ${response.status} ${errorText}`);
      continue;
    }

    const json = await response.json() as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };
    console.log('[llm-narration] raw response', { model, response: json });

    const content = extractGeminiText(json);
    console.log('[llm-narration] raw text', { model, text: content });
    const cleaned = content
      .replace(/^```(?:json|text)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .replace(/^Here is the JSON requested:\s*/i, '')
      .trim();
    console.log('[llm-narration] cleaned text', { model, text: cleaned });

    try {
      const beat = parseNarrationBeat(cleaned);
      const wordCount = beat.body ? beat.body.split(/\s+/).filter(Boolean).length : 0;
      if (wordCount < 8) {
        lastError = new Error(`Gemini narration was too short for ${model}`);
        continue;
      }
      return {
        ...beat,
        tone: beat.tone ?? (context.journeyPhase === 'finish' ? 'melancholic' : 'uncanny')
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      lastError = new Error(`Gemini narration parse failed for ${model}: ${message}`);
      continue;
    }
  }

  throw lastError ?? new Error('Gemini narration request failed for all models');
}

export function createFallbackNarration(context: NarrationContext): NarrationBeat {
  const narration = composeNarration(context);
  return {
    source: 'deterministic',
    headline: narration.headline,
    body: narration.body,
    lines: narration.lines,
    keyPoints: deriveFallbackKeyPoints(context),
    obstacle: shouldCreateFallbackObstacle(context) ? chooseFallbackObstacle(context) : undefined,
    tone: 'plain'
  };
}

export async function generateNarrationBeat(context: NarrationContext): Promise<NarrationBeat> {
  if (!context.useLlmNarration || !llmNarrationConfigured()) {
    return createFallbackNarration(context);
  }

  try {
    return await requestGeminiNarration(context);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`LLM narration unavailable, falling back to deterministic narration: ${message}`);
    return createFallbackNarration(context);
  }
}

export function isLlmNarrationEnabled(): boolean {
  return llmNarrationConfigured();
}

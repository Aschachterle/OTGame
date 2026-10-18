export function chooseWeatherForContext(
  strangenessLevel: number,
  day: number,
  biome: string,
  rainPercent = 0,
  tempC = 20
): string {
  const strangeness = Math.max(0, Math.min(10, Math.round(strangenessLevel)));

  if (strangeness >= 9) {
    const pool = ['wormhole_storm', 'electrical_storm', 'fire_storm', 'thunderstorm', 'fog', 'rain', 'none'];
    return pool[(day + strangeness * 3) % pool.length];
  }

  if (strangeness >= 6) {
    const pool = ['electrical_storm', 'fire_storm', 'thunderstorm', 'rain', 'fog', 'none'];
    return pool[(day + strangeness * 2) % pool.length];
  }

  if (strangeness >= 3) {
    const coldOrWinter = tempC <= 2 || biome === 'mountain';
    const pool = coldOrWinter
      ? ['snow_storm', 'rain', 'fog', 'none', 'thunderstorm']
      : ['thunderstorm', 'rain', 'fog', 'none', 'thunderstorm'];
    return pool[(day + strangeness) % pool.length];
  }

  // Strangeness 0 to 2: ONLY normal weather (clear, fog, rain)
  if (rainPercent > 50) return 'rain';
  const normalPool = biome === 'river'
    ? ['fog', 'none', 'rain', 'fog', 'none']
    : ['none', 'rain', 'none', 'fog', 'none'];
  return normalPool[(day + 1) % normalPool.length];
}

export type NarrationEvent = {
  eventType: string;
  payload?: Record<string, unknown>;
};

export type NarrationContext = {
  promptType?: 'dispatch' | 'prologue-genesis';
  startingStrangenessRoll?: number;
  selectedEra?: {
    id: string;
    label: string;
    shortLabel?: string;
    years?: string;
  };
  outfittingSummary?: {
    cashReserved: number;
    cargoWeightLbs: number;
    oxenYokes: number;
    notableSupplies: string;
  };
  expeditionName?: string;
  day: number;
  tileId: string;
  locationName?: string;
  currentLandmark?: string;
  nextLandmark?: string | null;
  nextMilestone?: string | null;
  milesTraveled?: number;
  totalMiles?: number;
  biome: string;
  journeyPhase: 'start' | 'mid' | 'finish';
  useLlmNarration?: boolean;
  journeyStartTile?: string;
  journeyEndTile?: string;
  weather: {
    rain: number;
    tempC: number;
    windKph: number;
  };
  wagon: {
    health: number;
    morale: number;
    food: number;
    water: number;
    wood: number;
    medicine: number;
    status: string;
    cash?: number;
    oxen?: number;
    oxenYokes?: number;
    cargoWeight?: number;
    payloadTier?: string;
    rations?: string;
  };
  supplyEstimates?: {
    foodRations: number;
    waterGallons: number;
    firewoodBundles: number;
    medicineDoses: number;
    ammunitionBoxes?: number;
  };
  party?: Array<{
    id?: string;
    name: string;
    role: string;
    gender?: string;
    outfitSummary?: string;
    health: number;
    status: string;
  }>;
  recentEvents: NarrationEvent[];
  lastAction?: {
    day: number;
    actionType: string;
    actionLabel: string;
    tileId: string;
    outcome: string;
    statusMessage: string;
    availableOptionsAtStop?: string[];
    skippedOptionsAtStop?: string[];
    strangenessLevel?: number;
    milesGained?: number;
    milesTraveled?: number;
    arrivedMilestoneName?: string;
    nextMilestoneName?: string;
    milesToNextMilestone?: number;
  } | null;
  historyLog?: Array<{
    day: number;
    actionType: string;
    actionLabel: string;
    tileId: string;
    outcome: string;
    statusMessage: string;
    availableOptionsAtStop?: string[];
    skippedOptionsAtStop?: string[];
    strangenessLevel?: number;
    milesGained?: number;
    milesTraveled?: number;
    arrivedMilestoneName?: string;
    nextMilestoneName?: string;
    milesToNextMilestone?: number;
  }>;
  justResolvedDecision?: {
    kind?: string;
    decisionType?: string;
    prompt?: string;
    chosenOption: string;
    chosenOptionId?: string;
    rejectedOptions?: string[];
    costSummary?: string;
    responseText?: string;
    outcome?: string;
  } | null;
  metaDialogueHistory?: Array<{
    day: number;
    prompt: string;
    playerResponse: string;
    approach: string;
    choice: string;
  }>;
  pendingSurrealEffect?: {
    title: string;
    gameplayTwist: string;
    mechanicalEffect: {
      trigger: 'next_action' | 'next_travel' | 'next_camp';
      travelMilesDelta: number;
      healthDelta: number;
      moraleDelta: number;
      foodDelta: number;
      waterDelta: number;
      woodDelta: number;
      medicineDelta: number;
    };
  } | null;
  priorNarration?: string[];
  priorKeyPoints?: string[];
  obstacleHistory?: Array<{
    day: number;
    description: string;
    choices: string[];
  }>;
  strangenessLevel?: number;
  distanceDescriptor?: string;
  journeyCompleted?: boolean;
  availableActionTypes?: string[];
  activeObstacle?: {
    description: string;
    choices: Array<{
      id: string;
      label: string;
      description: string;
      cost?: {
        health?: number;
        morale?: number;
        food?: number;
        water?: number;
        wood?: number;
        medicine?: number;
        ammunition?: number;
        days?: number;
      };
    }>;
    } | null;
  decisionOptions?: string[];
  riskState?: {
    foodCritical?: boolean;
    waterCritical?: boolean;
    moraleLow?: boolean;
    healthLow?: boolean;
  };
  distanceToFrontier: number;
  gameOver: boolean;
  isMajorLandmark?: boolean;
  dmDossier?: {
    temperament?: string;
    paceHabit?: string;
    crewCompassion?: string;
    riskHabit?: string;
    recentDecisions?: string[];
    crewSentiment?: string;
    outfittingProfile?: string;
    entityMemory?: string[];
    aiNotes?: string[];
  };
  outfittingProfile?: string;
};

export type NarrationObstacleChoice = {
  id: string;
  label: string;
  description: string;
  cost?: {
    health?: number;
    morale?: number;
    food?: number;
    water?: number;
    wood?: number;
    medicine?: number;
    ammunition?: number;
    days?: number;
  };
};

export type NarrationObstacle = {
  description: string;
  choices: NarrationObstacleChoice[];
};

function normalizeNarrationPhrase(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function chooseNarrationPhrase(context: NarrationContext, options: string[], salt: number): string {
  const priorNarration = (context.priorNarration ?? []).slice(-8).map(normalizeNarrationPhrase);
  const freshOptions = options.filter((option) => {
    const normalizedOption = normalizeNarrationPhrase(option);
    return priorNarration.every((prior) => !prior.includes(normalizedOption));
  });
  const alternatives = freshOptions.length
    ? freshOptions
    : options.filter((option) => !priorNarration.at(-1)?.includes(normalizeNarrationPhrase(option)));
  const availableOptions = alternatives.length ? alternatives : options;
  const seed = context.day + (context.milesTraveled ?? 0) + (context.strangenessLevel ?? 0) + (context.lastAction?.actionType.length ?? 0) + salt;
  return availableOptions[seed % availableOptions.length];
}

export function composeNarration(context: NarrationContext) {
  const location = context.currentLandmark ?? context.locationName ?? 'the trail';
  const weatherMood =
    context.weather.rain > 70
      ? chooseNarrationPhrase(context, [
          'Rain needles the canvas and turns the ground greasy under the wheels.',
          'Downpour rattles the wagon cover and slicks the ruts into black mud.',
          'Cold rain runs off the canvas in steady ropes and clings to every wheel.',
          'The storm presses close, soaking the road and darkening the timber.'
        ], 1)
      : context.weather.tempC < 0
        ? chooseNarrationPhrase(context, [
            'The cold bites through wool and leaves each breath thin and sharp.',
            'Frost stiffens the harness while the party huddles close beneath blankets.',
            'The air burns in the lungs, and ice gathers along the wagon fittings.',
            'A hard freeze makes every buckle and handle cruel to the touch.'
          ], 2)
        : context.weather.windKph > 35
          ? chooseNarrationPhrase(context, [
              'A hard wind worries the canvas and keeps the oxen restless.',
              'Gusts shove at the wagon cover and scatter dust across the track.',
              'The wind leans against the team, carrying grit into every seam.',
              'Canvas snaps above the wagon as the oxen lower their heads into the gale.'
            ], 3)
          : chooseNarrationPhrase(context, [
              'The weather holds steady, though the country never quite relaxes.',
              'A mild sky gives no warning, and the open country keeps its silence.',
              'The air is calm enough, but the empty miles offer little comfort.',
              'No storm threatens the wagon today; the quiet itself feels watchful.',
              'The clouds stay high while the trail stretches west without a friendly sign.',
              'Clear weather follows the wagon, but the plain offers no promise of ease.',
              'A pale sun rides above the prairie, indifferent to the slow procession below.',
              'The sky remains open, leaving the party exposed beneath its vastness.',
              'A quiet breeze crosses the grass, stirring nothing but dust and old unease.',
              'The day is fair by frontier standards, though the road gives no comfort.'
            ], 4);
  const strainMood =
    context.wagon.food < 10 || context.wagon.water < 10
      ? chooseNarrationPhrase(context, [
          'Hunger and thirst have begun to narrow every conversation to necessity.',
          'The dwindling food and water leave the party counting each swallow and bite.',
          'Empty measures and light ration bags make even small arguments feel urgent.',
          'The crew speaks less of Oregon and more of what remains in the barrels and sacks.',
          'The last provisions are watched closely, and every meal ends sooner than hoped.',
          'Dry mouths and thin suppers have made the wagon quiet in the wrong way.',
          'The party measures the road in mouthfuls and canteens rather than miles.',
          'With the stores running low, even ordinary work begins to feel like a bargain.',
          'Each ration is counted twice, and no one wastes water on idle talk.',
          'The food sacks lie slack and the water casks light; the crew knows the numbers.'
        ], 5)
      : context.wagon.health < 40
        ? chooseNarrationPhrase(context, [
            'The weakest in the party move like people already paying tomorrow’s cost.',
            'Each step comes harder to the sick and injured, who save their strength for the next mile.',
            'Pain has slowed the party; even simple work now asks for a pause.',
            'Those still standing watch the ailing closely, measuring every cough and stumble.'
          ], 6)
        : context.wagon.morale < 40
          ? chooseNarrationPhrase(context, [
              'The party keeps its shape, but only with bitterness showing through the seams.',
              'Short answers pass around the camp, and no one volunteers for the hardest task.',
              'The crew remains together, though patience has worn thinner than the canvas.',
              'A few tired disputes linger after the work is done, unanswered by the fire.'
            ], 7)
          : chooseNarrationPhrase(context, [
              'The party still has enough strength to pretend the trail can be reasoned with.',
              'For now, the crew shoulders its work without complaint and saves its doubts for camp.',
              'The party keeps a cautious rhythm, finding comfort in familiar chores.',
              'No one mistakes the road for kindness, but the crew has not yet lost its resolve.'
            ], 8);
  const livingParty = (context.party ?? []).filter(
    (member) => member.status !== 'Dead' && member.status !== 'Deceased' && (member.health ?? 100) > 0
  );
  const speaker = livingParty.length
    ? livingParty[Math.abs(context.day ?? 0) % livingParty.length]
    : context.party?.find((member) => member.status !== 'Dead');
  const dialogueOptions = speaker?.role === 'Guide'
    ? ['The western sky is changing; keep watch on the ridge.', 'The ruts are telling us more than the map ever could.', 'We will have to read the weather one mile at a time.']
    : speaker?.role === 'Doctor'
      ? ['Stay close to the blankets when the light goes.', 'A little rest now is worth more than courage spent foolishly.', 'Keep your water covered; the dust is thick today.']
      : speaker?.role === 'Youth'
        ? ['Do you think Oregon really looks the way they say?', 'I can keep walking; just do not leave me behind.', 'Will the sky be this wide all the way west?']
        : speaker?.role === 'Carpenter'
          ? ['A sound wheel is worth more than a fast mile.', 'Keep the timber dry, and I can mend what the road gives us.', 'That wagon will hold if we do not ask too much of it.']
          : ['The road is quiet, but I do not trust it.', 'We should keep together until the light changes.', 'There is more to this country than the map can show.'];
  const dialogue = chooseNarrationPhrase(context, dialogueOptions, 9);
  const characterLine = speaker
    ? `${speaker.name} says, "${dialogue}"`
    : `A line in the family journal reads, "${dialogue}"`;
  const sensesLine = `${weatherMood} ${strainMood}`;
  const landscapeLine = context.journeyCompleted
    ? `The valley opens beneath a broad sky, its distant fields marked by smoke and timber.`
    : context.gameOver
      ? `${location} settles into a stillness that seems to reach beyond the trail.`
      : `Beyond ${location}, the road runs through ${context.biome} beneath a sky with no promise in it.`;
  const lines = [landscapeLine, sensesLine, characterLine];

  const weatherOverlay = chooseWeatherForContext(
    context.strangenessLevel ?? 0,
    context.day,
    context.biome,
    context.weather?.rain ?? 0,
    context.weather?.tempC ?? 20
  );

  return {
    source: 'deterministic',
    headline: lines[0].replace(/[.!?]+$/, ''),
    body: lines.join(' '),
    lines,
    weatherOverlay,
    dialogue: speaker
      ? {
          speakerId: speaker.id,
          speakerName: speaker.name,
          speakerRole: speaker.role,
          text: dialogue
        }
      : null
  };
}

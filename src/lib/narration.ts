export type NarrationEvent = {
  eventType: string;
  payload?: Record<string, unknown>;
};

export type NarrationContext = {
  expeditionName?: string;
  day: number;
  tileId: string;
  locationName?: string;
  currentLandmark?: string;
  nextLandmark?: string | null;
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
  };
  supplyEstimates?: {
    foodRations: number;
    waterGallons: number;
    firewoodBundles: number;
    medicineDoses: number;
    ammunitionBoxes?: number;
  };
  party?: Array<{
    name: string;
    role: string;
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
    outcome?: string;
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
  };
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

function recentEventLine(events: NarrationEvent[]): string {
  const latest = events[0];
  if (!latest) {
    return 'No one has written to the trail today.';
  }

  const payload = latest.payload ?? {};
  const detail =
    typeof payload.note === 'string'
      ? payload.note
      : typeof payload.direction === 'string'
        ? `moved ${payload.direction}`
        : typeof payload.resourceType === 'string'
          ? `worked a ${payload.resourceType} node`
          : latest.eventType.replace(/_/g, ' ');

  return `The latest mark on the ledger: ${detail}.`;
}

function describeActionLabel(actionType: string): string {
  if (actionType === 'press-on') return 'press on';
  if (actionType === 'gather') return 'gather supplies';
  if (actionType === 'camp') return 'make camp';
  if (actionType === 'hunt') return 'hunt';
  if (actionType === 'treat') return 'treat illness';
  if (actionType === 'trade') return 'trade';
  if (actionType === 'repair') return 'repair the wagon';
  if (actionType === 'scout') return 'scout ahead';
  return actionType.replace(/-/g, ' ');
}

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
  const expeditionName = context.expeditionName?.trim() || 'The wagon party';
  const location = context.currentLandmark ?? context.locationName ?? 'the trail';
  const nextLandmark = context.nextLandmark ?? 'the next landmark';
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
  const supplies = context.supplyEstimates
    ? `${context.supplyEstimates.foodRations} rations, ${context.supplyEstimates.waterGallons} gal water, ${context.supplyEstimates.firewoodBundles} wood, ${context.supplyEstimates.medicineDoses} medicine`
    : 'their stores under close watch';
  const lastAction = context.lastAction;
  const actionLine = context.justResolvedDecision
    ? `${expeditionName} ${context.justResolvedDecision.chosenOption.toLowerCase()} at ${location}, and the choice leaves its mark at once.`
    : lastAction?.actionType === 'press-on'
      ? `${expeditionName} presses west from ${location}, taking ${lastAction.milesGained ?? 0} miles from the trail.`
      : lastAction
        ? `${expeditionName} stops at ${location} to ${describeActionLabel(lastAction.actionType)}, surrendering distance for necessity.`
        : `${expeditionName} stands at ${location}, the trail still measuring the party before the next mile.`;
  const sensesLine = `${weatherMood} ${strainMood}`;
  const outcomeLine = context.gameOver
    ? `The day closes in failure, and the trail keeps the memory of what was lost here.`
    : context.journeyCompleted
      ? `The route is complete at last; what remains is settlement, burial, or the long aftertaste of survival.`
      : context.justResolvedDecision
        ? `${context.justResolvedDecision.outcome ?? 'The cost settles over the camp.'} Stores now stand at ${supplies}. ${recentEventLine(context.recentEvents)}`
        : `${recentEventLine(context.recentEvents)} Stores hold at ${supplies}. ${nextLandmark ? `Next landmark: ${nextLandmark}.` : ''}`.trim();
  const lines = [actionLine, sensesLine, outcomeLine];

  return {
    source: 'deterministic',
    headline: lines[0].replace(/[.!?]+$/, ''),
    body: lines.join(' '),
    lines
  };
}

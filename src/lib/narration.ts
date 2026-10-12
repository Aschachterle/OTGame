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

export function composeNarration(context: NarrationContext) {
  const expeditionName = context.expeditionName?.trim() || 'The wagon party';
  const location = context.currentLandmark ?? context.locationName ?? 'the trail';
  const nextLandmark = context.nextLandmark ?? 'the next landmark';
  const weatherMood =
    context.weather.rain > 70
      ? 'Rain needles the canvas and turns the ground greasy under the wheels.'
      : context.weather.tempC < 0
        ? 'The cold bites through wool and leaves each breath thin and sharp.'
        : context.weather.windKph > 35
          ? 'A hard wind worries the canvas and keeps the oxen restless.'
          : 'The weather holds steady, though the country never quite relaxes.';
  const strainMood =
    context.wagon.food < 10 || context.wagon.water < 10
      ? 'Hunger and thirst have begun to narrow every conversation to necessity.'
      : context.wagon.health < 40
        ? 'The weakest in the party move like people already paying tomorrow’s cost.'
        : context.wagon.morale < 40
          ? 'The party keeps its shape, but only with bitterness showing through the seams.'
          : 'The party still has enough strength to pretend the trail can be reasoned with.';
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

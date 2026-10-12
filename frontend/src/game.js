import {
  applyPartyHealthDelta,
  FINISH_TILE_ID,
  MAX_STRANGENESS_LEVEL,
  START_TILE_ID,
  TOTAL_TRAIL_MILES,
  WAGON_CAPACITY,
  applyNarrationBeat,
  getCurrentMilestone,
  getCurrentMilestoneIndexForMiles,
  getLivingPartyMembers,
  getMilesToNextMilestone,
  getNextMilestone,
  getRoleHolder,
  debugNarration,
  describeAction,
  fallbackTile,
  fallbackWorld,
  getJourneyPhase,
  getTrailSnapshot,
  isNarrationDuplicate,
  loadBooleanPreference,
  locationDescriptor,
  locationNameForTile,
  paceLabel,
  resourceUnitsLabel,
  rationsLabel,
  resetExpedition,
  saveBooleanPreference,
  saveCloudNarrationPreference,
  setPartyCondition,
  syncWagonHealthFromParty,
  trailLandmarks,
  trailMilestones,
  toSupplySnapshot,
  wagonLoadWeight,
  AUTO_READ_STORAGE_KEY,
  CLOUD_NARRATION_STORAGE_KEY,
  LLM_NARRATION_STORAGE_KEY
} from './state.js';
import { getFrameCount } from './wagon-animator.js';

const TRAVEL_ANIMATION_MS = 2400;

export function createGameController({ state, ui, api, audio }) {
  let wagonAnimationTimer = null;

  function syncTrailProgress() {
    state.milesTraveled = Math.max(0, Math.min(TOTAL_TRAIL_MILES, Math.round(state.milesTraveled ?? 0)));
    state.currentMilestoneIndex = getCurrentMilestoneIndexForMiles(state.milesTraveled);
    state.currentTrailSnapshot = getTrailSnapshot(state);
    state.wagon.location = getCurrentMilestone(state).id;
    state.journeyCompleted = state.milesTraveled >= TOTAL_TRAIL_MILES;
  }

  function currentLocationName() {
    const milestone = getCurrentMilestone(state);
    return locationNameForTile(milestone.id, milestone.biome ?? 'frontier trail');
  }

  function calculateTravelMiles(tile) {
    const paceRange = {
      steady: [14, 16],
      strenuous: [18, 22],
      grueling: [24, 28]
    }[state.wagon.pace] ?? [14, 16];
    const [minMiles, maxMiles] = paceRange;
    let miles = minMiles + Math.floor(Math.random() * ((maxMiles - minMiles) + 1));
    const rain = tile?.weather?.rain ?? 0;
    const elevation = tile?.elevation ?? 0;
    const biome = tile?.biome ?? 'unknown';
    if (rain > 70) miles -= 5;
    else if (rain > 45) miles -= 3;
    if (biome === 'mountain') miles -= 4;
    if (biome === 'badlands') miles -= 2;
    if (elevation > 5000) miles -= 3;
    if ((tile?.weather?.tempC ?? 10) < 0) miles -= 2;
    return Math.max(8, miles);
  }

  function delay(ms) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }

  function stopWagonAnimation() {
    if (wagonAnimationTimer) {
      window.clearInterval(wagonAnimationTimer);
      wagonAnimationTimer = null;
    }
    state.travelAnimationActive = false;
    state.wagonAnimationFrame = 0;
  }

  async function playWagonAnimation() {
    stopWagonAnimation();
  }

  function setDecision(decision) {
    state.activeDecision = decision;
    ui.renderMap(state);
    ui.updateActionState(state);
  }

  function clearDecision(options = {}) {
    const { render = true } = options;
    state.activeDecision = null;
    if (!render) {
      return;
    }
    ui.renderMap(state);
    ui.updateActionState(state);
  }

  function getAvailableActionOptions() {
    const options = [];
    if (!state.journeyCompleted) {
      options.push('press-on');
    }
    options.push('camp', 'hunt', 'gather', 'treat', 'trade', 'repair', 'scout');
    if (state.strangenessLevel >= 8 && !state.journeyCompleted) {
      options.push('warp-west');
    }
    return options;
  }

  function randomLivingMember() {
    const living = getLivingPartyMembers(state);
    if (!living.length) return null;
    return living[Math.floor(Math.random() * living.length)] ?? living[0];
  }

  function breakdownRepairCost() {
    return Math.max(1, 2 - (getRoleHolder(state, 'Carpenter') ? 1 : 0));
  }

  function doctorHealBonus() {
    return getRoleHolder(state, 'Doctor') ? 5 : 0;
  }

  function maybeAfflictParty(tile) {
    const risks = [];
    if (state.wagon.food < 12 || state.wagon.water < 10) risks.push('Exhaustion', 'Fever');
    if ((tile?.weather?.rain ?? 0) > 70 || (tile?.weather?.tempC ?? 8) < 0) risks.push('Cholera', 'Fever');
    if (tile?.biome === 'badlands' || tile?.biome === 'plains') risks.push('Snakebite');
    if (!risks.length || Math.random() > 0.28) return '';
    const member = randomLivingMember();
    if (!member || member.status !== 'Healthy') return '';
    const condition = risks[Math.floor(Math.random() * risks.length)];
    setPartyCondition(state, member.id, condition);
    applyPartyHealthDelta(state, -8, { memberId: member.id, status: condition });
    return `${member.name} is suffering from ${condition.toLowerCase()}.`;
  }

  async function processPartyDeaths() {
    const deceased = (state.wagon.party ?? []).filter((member) => member.health <= 0 && !member.deceasedLogged);
    for (const member of deceased) {
      member.deceasedLogged = true;
      state.wagon.morale = Math.max(0, state.wagon.morale - 18);
      await appendEvent('funeral', {
        memberId: member.id,
        memberName: member.name,
        note: `A funeral was recorded for ${member.name}, ${member.role.toLowerCase()} of the wagon party.`
      });
    }
    if (!getLivingPartyMembers(state).length) {
      handleWagonFailure('the party was lost on the trail');
    }
  }

  function buildRiverDecision(travelAction, nextTileId, directionText, destinationName, river) {
    const flowLabel = state.strangenessLevel >= 3 && state.day % 2 === 0 ? -river.flowRate : river.flowRate;
    return {
      type: 'river-crossing',
      eyebrow: 'River crossing',
      title: `River crossing ahead: ${destinationName}`,
      body: `Depth ${river.depthFt} ft. Flow ${flowLabel} cfs. Choose how to cross before the wagon commits to the ford.`,
      context: { travelAction, nextTileId, directionText, destinationName, river },
      options: [
        { id: 'ford', hotkey: '1', label: 'Ford the river', detail: 'Fast, but dangerous above 3.0 ft.' },
        { id: 'caulk', hotkey: '2', label: 'Caulk and float', detail: 'Costs 2 wood and 1 day. Risky in hard current.' },
        { id: 'ferry', hotkey: '3', label: 'Hire ferry or guide', detail: 'Costs 2 medicine or 4 rations. Safe crossing.' },
        { id: 'wait', hotkey: '4', label: 'Wait for lower water', detail: 'Lose a day of supplies and try again tomorrow.' }
      ]
    };
  }

  function buildHuntDecision() {
    return {
      type: 'hunt-target',
      eyebrow: 'Hunting party',
      title: 'Choose a hunting target',
      body: 'Each hunt spends 1 box of ammunition. Larger game yields more meat but strains the wagon.',
      options: [
        { id: 'bison', hotkey: '1', label: 'Bison', detail: 'Large yield, heavier weight, lower success.' },
        { id: 'deer', hotkey: '2', label: 'Deer', detail: 'Balanced yield and success.' },
        { id: 'grouse', hotkey: '3', label: 'Grouse', detail: 'Small yield, highest success.' }
      ]
    };
  }

  function buildTreatDecision() {
    const options = getLivingPartyMembers(state).map((member, index) => ({
      id: member.id,
      hotkey: String(index + 1),
      label: `${member.name} — ${member.role}`,
      detail: `${member.health} HP • ${member.status}`
    }));
    return {
      type: 'treat-member',
      eyebrow: 'Field medicine',
      title: 'Choose who receives treatment',
      body: 'A doctor improves every dose. Choose the party member who needs help most.',
      options
    };
  }

  function buildGatherDecision(tile) {
    const isForest = tile?.biome === 'forest';
    const isRiver = tile?.biome === 'river';
    return {
      type: 'gather-resource',
      eyebrow: 'Gathering party',
      title: 'Choose what to gather at this stop',
      body: 'Advance 1 day to search the surrounding wilderness for essential supplies.',
      options: [
        {
          id: 'wood',
          hotkey: '1',
          label: 'Chop firewood',
          detail: isForest
            ? 'Abundant timber (+3 forest bonus). Essential for campfire warmth and wagon repairs.'
            : 'Scavenge brush and fallen limbs. Essential for wagon repairs.'
        },
        {
          id: 'water',
          hotkey: '2',
          label: 'Haul fresh water',
          detail: isRiver
            ? 'Fast refill from the river (+3 river bonus). Refills drinking barrels.'
            : 'Dig seep holes and scout springs to refill drinking barrels.'
        },
        {
          id: 'forage',
          hotkey: '3',
          label: 'Forage wild food',
          detail: 'Comb the meadows and draws for edible roots, greens, and wild berries.'
        }
      ]
    };
  }

  function describeObstacleCost(cost = {}) {
    const parts = [];
    if (cost.health) parts.push(`-${cost.health} health`);
    if (cost.morale) parts.push(`-${cost.morale} morale`);
    if (cost.food) parts.push(`-${cost.food} food`);
    if (cost.water) parts.push(`-${cost.water} water`);
    if (cost.wood) parts.push(`-${cost.wood} wood`);
    if (cost.medicine) parts.push(`-${cost.medicine} medicine`);
    if (cost.ammunition) parts.push(`-${cost.ammunition} ammo`);
    if (cost.days) parts.push(`+${cost.days} day${cost.days === 1 ? '' : 's'}`);
    return parts.length ? `Cost: ${parts.join(', ')}.` : 'No immediate cost.';
  }

  function buildBreakdownDecision(brokenPart) {
    const repairCost = breakdownRepairCost();
    const hasWood = (state.wagon.wood ?? 0) >= repairCost;
    const carpenter = getRoleHolder(state, 'Carpenter');
    const carpenterBonus = carpenter ? " (Sarah's carpentry saves 1 wood)" : '';
    return {
      type: 'wagon-breakdown',
      eyebrow: 'Wagon breakdown',
      title: `${brokenPart} on the trail!`,
      body: `The wagon cannot roll forward until the ${brokenPart.toLowerCase()} is repaired. Choose how to handle the breakdown:`,
      context: { brokenPart, repairCost },
      options: [
        {
          id: 'repair-wood',
          hotkey: '1',
          label: hasWood ? `Repair with lumber (${repairCost} wood)` : `Cannot repair (need ${repairCost} wood)`,
          detail: hasWood
            ? `Costs ${repairCost} wood bundle${repairCost === 1 ? '' : 's'}${carpenterBonus}. Restores wagon to rolling condition.`
            : `You need ${repairCost} wood. Forage or barter before repairing.`
        },
        {
          id: 'forage-wood',
          hotkey: '2',
          label: 'Forage for timber',
          detail: 'Halt and search the brush for salvageable wood (+1-2 wood, advances 1 day).'
        },
        {
          id: 'trade-spare',
          hotkey: '3',
          label: 'Barter for replacement parts',
          detail: 'Trade 2 food rations with passing emigrants for emergency wood.'
        }
      ]
    };
  }

  function buildObstacleDecision(obstacle) {
    return {
      type: 'obstacle-dilemma',
      eyebrow: 'Trail dilemma',
      title: obstacle.description,
      body: 'Choose how the party responds. Each option solves the problem by spending a different resource.',
      context: { obstacle },
      options: obstacle.choices.map((choice, index) => ({
        id: choice.id,
        hotkey: String(index + 1),
        label: choice.label,
        detail: `${choice.description} ${describeObstacleCost(choice.cost)}`.trim()
      }))
    };
  }

  function syncObstacleDecision() {
    if (state.activeDecision && state.activeDecision.type !== 'obstacle-dilemma') {
      return;
    }
    const criticalEmergency = state.wagon.water < 10 || state.wagon.food < 10 || state.wagon.health < 40 || state.wagon.morale < 35;
    if (!state.activeObstacle) {
      if (state.activeDecision?.type === 'obstacle-dilemma') {
        clearDecision();
      }
      return;
    }
    if ((state.day - state.lastObstacleDay) < 2 && !criticalEmergency) {
      state.activeObstacle = null;
      if (state.activeDecision?.type === 'obstacle-dilemma') {
        clearDecision();
      }
      ui.renderHazardBanner(state);
      return;
    }
    setDecision(buildObstacleDecision(state.activeObstacle));
  }

  function applyResourceDelta(wagon, resourceType, deltaUnits, maxUnits = 99) {
    const key = resourceType === 'forage' || resourceType === 'herd' ? 'food' : resourceType;
    const current = wagon[key] ?? 0;
    if (deltaUnits <= 0) {
      const applied = Math.max(deltaUnits, -current);
      wagon[key] = Math.max(0, current + applied);
      return { applied, blocked: 0 };
    }

    const weightMap = { food: 2, water: 3, wood: 4, medicine: 0.5 };
    const unitWeight = weightMap[key] ?? 1;
    const freeCapacity = Math.max(0, WAGON_CAPACITY - wagonLoadWeight(wagon));
    const capacityLimit = unitWeight > 0 ? Math.floor(freeCapacity / unitWeight) : deltaUnits;
    const stockLimit = Math.max(0, maxUnits - current);
    const allowed = Math.max(0, Math.min(deltaUnits, capacityLimit, stockLimit));
    wagon[key] = current + allowed;
    return { applied: allowed, blocked: Math.max(0, deltaUnits - allowed) };
  }

  function recentActionCount(actionType, windowSize = 3) {
    return state.actionHistory
      .slice(-windowSize)
      .filter((entry) => entry.actionType === actionType)
      .length;
  }

  function getNarrativeDecisionFocusOptions(options, selectedTile) {
    const focus = [];
    const pushIfAvailable = (action) => {
      if (options.includes(action) && !focus.includes(action)) {
        focus.push(action);
      }
    };

    if (state.wagon.water < 10) pushIfAvailable('gather');
    if (state.wagon.health < 45 && state.wagon.medicine > 0) pushIfAvailable('treat');
    if (state.wagon.morale < 35) pushIfAvailable('camp');
    if (!state.journeyCompleted && selectedTile?.biome === 'plains') pushIfAvailable('hunt');
    if (!state.journeyCompleted) pushIfAvailable('press-on');

    for (const option of options) {
      if (focus.length >= 2) break;
      pushIfAvailable(option);
    }

    return focus.slice(0, 2);
  }

  function incrementStrangeness(outcome) {
    const increase = outcome === 'failed' ? 2 : 1;
    state.strangenessLevel = Math.min(MAX_STRANGENESS_LEVEL, state.strangenessLevel + increase);
  }

  function recordActionHistory(actionType, outcome = 'completed', availableOptionsAtStop = [], extraContext = {}) {
    const normalizedOptions = availableOptionsAtStop.filter((option) => typeof option === 'string');
    incrementStrangeness(outcome);
    const entry = {
      day: state.day,
      actionType,
      actionLabel: describeAction(actionType),
      tileId: getCurrentMilestone(state).id,
      outcome,
      statusMessage: state.statusMessage,
      availableOptionsAtStop: normalizedOptions.map((option) => describeAction(option).toLowerCase()),
      skippedOptionsAtStop: normalizedOptions.filter((option) => option !== actionType).map((option) => describeAction(option).toLowerCase()),
      strangenessLevel: state.strangenessLevel,
      ...extraContext
    };
    state.lastActionContext = entry;
    state.actionHistory = [...state.actionHistory, entry].slice(-20);
    debugNarration(state, 'action:recorded', { actionType, outcome, strangenessLevel: state.strangenessLevel, historyCount: state.actionHistory.length });
  }

  function buildDmDossier(state) {
    const pace = state.wagon?.pace ?? 'steady';
    const health = state.wagon?.health ?? 100;
    const morale = state.wagon?.morale ?? 100;
    const strangeness = state.strangenessLevel ?? 0;

    const paceHabit = pace === 'grueling'
      ? 'Relentless and grueling; drives the team to the bone'
      : pace === 'strenuous'
        ? 'Aggressive and hurried; pushes for high daily distance'
        : 'Steady and methodical; balances oxen fatigue and safety';

    let temperament = 'Pragmatic frontier leader';
    if (pace === 'grueling' && (health < 60 || morale < 50)) {
      temperament = 'Ruthless & unyielding; values miles over crew comfort';
    } else if (morale > 75 && health > 75) {
      temperament = 'Prudent, caring & vigilant';
    } else if (strangeness >= 6) {
      temperament = 'Obsessed and trail-haunted; deeply exposed to the uncanny';
    } else if (health < 40) {
      temperament = 'Desperate survivor clinging to the wagon';
    }

    let crewCompassion = 'Balanced';
    const recentTreats = recentActionCount('treat', 6);
    const recentCamps = recentActionCount('camp', 6);
    if (recentTreats > 0 || recentCamps >= 2) {
      crewCompassion = 'High; halts to tend wounds, heal sickness, and steady spirits';
    } else if (health < 50 && recentCamps === 0) {
      crewCompassion = 'Low; denies rest despite spreading fever and fatigue';
    }

    let riskHabit = 'Measured';
    if (pace === 'grueling' || strangeness >= 7) {
      riskHabit = 'High-risk gambler; ignores warnings and drives into the unknown';
    } else if (state.wagon?.food < 15 || state.wagon?.water < 12) {
      riskHabit = 'Strained; operating on the knife-edge of starvation';
    }

    const recentDecisions = (state.actionHistory ?? [])
      .filter((entry) =>
        entry.actionType === 'warp-west' ||
        entry.riverChoice ||
        entry.actionType === 'treat' ||
        entry.outcome === 'failed' ||
        entry.actionType === 'camp' ||
        entry.arrivedMilestoneName
      )
      .slice(-4)
      .map((entry) => `Day ${entry.day}: ${entry.actionLabel} (${entry.outcome}) - strangeness ${entry.strangenessLevel ?? 0}/10`);

    let crewSentiment = 'The crew marches in focused solidarity.';
    if (morale < 35) {
      crewSentiment = 'Whispers of mutiny brew beneath the canvas; bitter, exhausted, and watchful.';
    } else if (morale < 60) {
      crewSentiment = 'Quiet, sullen endurance; everyone watches the water barrels and the horizon.';
    } else if (morale >= 80) {
      crewSentiment = 'Spirits are high; hymns and campfire stories keep the dark at bay.';
    }

    return {
      temperament,
      paceHabit,
      crewCompassion,
      riskHabit,
      recentDecisions,
      crewSentiment
    };
  }

  function getNarrationContext() {
    const selectedTile = state.currentTrailSnapshot ?? fallbackTile;
    const currentMilestone = getCurrentMilestone(state);
    const journeyPhase = getJourneyPhase(state);
    const supplies = toSupplySnapshot(state.wagon);
    const remainingMiles = Math.max(0, TOTAL_TRAIL_MILES - state.milesTraveled);
    const distanceDescriptor = remainingMiles <= 0 ? 'at the frontier' : remainingMiles <= 200 ? 'within a few hard miles of the frontier' : 'still deep in the overland route';
    const availableActionTypes = getAvailableActionOptions();
    const decisionFocus = state.activeObstacle?.choices?.length
      ? state.activeObstacle.choices.map((choice) => choice.label.toLowerCase()).slice(0, 3)
      : getNarrativeDecisionFocusOptions(availableActionTypes, selectedTile).map((action) => describeAction(action).toLowerCase());
    const isArrivedLandmark = Boolean(state.lastActionContext?.arrivedMilestoneName);
    const isMajorLandmark = isArrivedLandmark || (state.day === 1 && (state.milesTraveled ?? 0) === 0) || state.journeyCompleted;

    return {
      day: state.day,
      tileId: currentMilestone.id,
      locationName: locationDescriptor(currentMilestone.id, selectedTile.biome ?? 'unknown'),
      biome: selectedTile.biome ?? 'unknown',
      journeyPhase,
      journeyStartTile: START_TILE_ID,
      journeyEndTile: FINISH_TILE_ID,
      useLlmNarration: state.llmNarrationPreferred,
      weather: selectedTile.weather ?? { rain: 0, tempC: 0, windKph: 0 },
      wagon: state.wagon,
      party: (state.wagon.party ?? []).map((member) => ({
        id: member.id,
        name: member.name,
        role: member.role,
        health: member.health,
        status: member.status
      })),
      supplyEstimates: supplies,
      recentEvents: state.events.slice(0, 3).map((event) => ({
        eventType: event.eventType ?? 'world',
        payload: event.payload ?? {}
      })),
      lastAction: state.lastActionContext,
      historyLog: state.actionHistory,
      priorNarration: state.narrationHistory.slice(-4),
      priorKeyPoints: state.storyKeyPoints.slice(-10),
      strangenessLevel: state.strangenessLevel,
      distanceDescriptor,
      journeyCompleted: state.journeyCompleted,
      availableActionTypes,
      activeObstacle: state.activeObstacle,
      decisionOptions: decisionFocus,
      riskState: {
        foodCritical: state.wagon.food < 10,
        waterCritical: state.wagon.water < 10,
        moraleLow: state.wagon.morale < 35,
        healthLow: state.wagon.health < 40
      },
      distanceToFrontier: remainingMiles,
      milesTraveled: state.milesTraveled,
      currentLandmark: currentMilestone.name ?? currentMilestone.shortName,
      nextMilestone: getNextMilestone(state)?.name ?? null,
      isMajorLandmark,
      dmDossier: buildDmDossier(state),
      expeditionName: 'The Schachterle Family',
      gameOver: state.gameOver
    };
  }

  function getNarrationStateKey() {
    const context = getNarrationContext();
    return JSON.stringify({
      day: context.day,
      tileId: context.tileId,
      biome: context.biome,
      phase: context.journeyPhase,
      journeyCompleted: context.journeyCompleted,
      gameOver: context.gameOver,
      decisionOptions: context.decisionOptions,
      riskState: context.riskState,
      wagon: context.wagon,
      party: context.party,
      recentEvents: context.recentEvents.slice(0, 2).map((event) => ({
        eventType: event.eventType,
        payload: event.payload
      })),
      lastAction: context.lastAction,
      historyLog: (context.historyLog ?? []).slice(-8),
      priorNarration: (context.priorNarration ?? []).slice(-3),
      priorKeyPoints: (context.priorKeyPoints ?? []).slice(-8),
      strangenessLevel: context.strangenessLevel,
      distanceDescriptor: context.distanceDescriptor,
      activeObstacle: context.activeObstacle
    });
  }

  function buildRoutineNarration(context, reason = 'routine') {
    const location = context.locationName ?? context.biome ?? 'the trail';
    const lastAction = context.lastAction;
    const activeRisks = Object.entries(context.riskState ?? {})
      .filter(([, value]) => value)
      .map(([key]) => key.replace(/([A-Z])/g, ' $1').toLowerCase());
    const riskClause = activeRisks.length
      ? `the immediate pressure is ${activeRisks.join(', ')}`
      : context.weather.rain > 70
        ? 'the weather is turning on the wagon faster than the crew would like'
        : context.weather.tempC < 0
          ? 'cold is starting to make every ordinary choice more expensive'
          : 'nothing on this stretch feels dramatic, but the trail still keeps its due';
    const optionClause = context.decisionOptions?.length
      ? `the crew is mostly weighing ${context.decisionOptions.slice(0, 2).join(' or ')} next`
      : 'the crew has little to do but keep moving and conserve what remains';
    if (lastAction?.riverOutcome) {
      const milesGained = lastAction.milesGained ?? 0;
      const nextMilestoneName = lastAction.nextMilestoneName ?? context.nextMilestone ?? 'the next landmark';
      return {
        source: 'deterministic',
        headline: `River crossed: ${lastAction.riverChoice ? String(lastAction.riverChoice).toUpperCase() : 'SUCCESS'}`,
        lines: [
          lastAction.riverOutcome,
          `The wagon clears the crossing and makes ${milesGained} miles west toward ${nextMilestoneName}.`,
          `Stores stand at ${context.supplyEstimates.foodRations} rations, ${context.supplyEstimates.waterGallons} gal water, and ${context.supplyEstimates.firewoodBundles} bundles wood.`
        ],
        body: `${lastAction.riverOutcome} The wagon gained ${milesGained} miles toward ${nextMilestoneName}. Stores hold at ${context.supplyEstimates.foodRations} rations and ${context.supplyEstimates.waterGallons} gal water.`,
        keyPoints: [
          `River crossing resolved: ${lastAction.riverChoice}`,
          `Miles gained: ${milesGained}`
        ],
        obstacle: undefined,
        tone: 'plain'
      };
    }
    if (lastAction?.actionType === 'press-on') {
      const milesGained = lastAction.milesGained ?? 0;
      const nextMilestoneName = lastAction.nextMilestoneName ?? context.nextMilestone ?? 'the next landmark';
      const milesRemaining = lastAction.milesToNextMilestone ?? getMilesToNextMilestone(state);
      const arrivalClause = lastAction.arrivedMilestoneName
        ? `and reached ${lastAction.arrivedMilestoneName}`
        : `and kept the wagon aimed at ${nextMilestoneName}`;
      return {
        source: 'deterministic',
        headline: `The wagon presses on and makes ${milesGained} miles.`,
        body: `${location} fell behind as the wagon pressed west ${arrivalClause}. The weather stays ${context.weather.rain > 60 ? 'mean and wet' : context.weather.windKph > 28 ? 'restless and windy' : 'watchful but manageable'}. The day closes with ${context.supplyEstimates.foodRations} rations, ${context.supplyEstimates.waterGallons} gal water, and ${milesRemaining} miles to ${nextMilestoneName}.`,
        keyPoints: [
          `Day ${context.day} at ${location}`,
          `Travel gained ${milesGained} miles`,
          `Next landmark: ${nextMilestoneName} (${milesRemaining} miles)`
        ],
        obstacle: undefined,
        tone: 'plain'
      };
    }
    const firstSentence = !lastAction
      ? `${location} on day ${context.day} remains quiet while the expedition waits for its first hard choice.`
      : lastAction.actionType === 'press-on'
        ? `${location} on day ${context.day} came after ${lastAction.actionLabel.toLowerCase()}, with the wagon grinding onward through ${context.biome}.`
        : `${location} on day ${context.day} followed ${lastAction.actionLabel.toLowerCase()}, leaving the wagon to reckon with the cost of that stop.`;
    const headline = reason === 'routine-travel'
      ? 'Another hard mile passes.'
      : reason === 'routine-camp'
        ? 'Camp settles the wagon for now.'
        : reason === 'routine-gather'
          ? 'A practical stop on the trail.'
          : 'The trail keeps moving.';

    return {
      source: 'deterministic',
      headline,
      body: `${firstSentence} For now, ${riskClause}, and ${optionClause}.`,
      keyPoints: [
        `Day ${context.day} near ${location}`,
        lastAction ? `Last action: ${lastAction.actionLabel}` : 'Last action: none',
        activeRisks.length ? `Pressure: ${activeRisks.join(', ')}` : 'Pressure: routine trail wear'
      ],
      obstacle: undefined,
      tone: 'plain'
    };
  }

  function getPreviousStrangenessLevel() {
    return state.actionHistory.at(-2)?.strangenessLevel ?? 0;
  }

  function getAiNarrationTrigger(context) {
    if (!state.llmNarrationPreferred || !state.llmNarrationAvailable) {
      return null;
    }

    const activeRiskKeys = Object.entries(context.riskState ?? {})
      .filter(([, value]) => value)
      .map(([key]) => key)
      .sort();
    const latestEventType = context.recentEvents[0]?.eventType ?? '';
    const latestActionType = context.lastAction?.actionType ?? '';
    const isLandmark = Boolean(trailLandmarks[context.tileId]);
    const previousStrangeness = getPreviousStrangenessLevel();
    const thresholds = [3, 6, 9];
    const crossedThreshold = thresholds.find((threshold) => previousStrangeness < threshold && (context.strangenessLevel ?? 0) >= threshold);

    if (context.gameOver) {
      return { key: `game-over:${context.day}`, reason: 'game-over' };
    }
    if (context.journeyCompleted) {
      return { key: `journey-complete:${context.tileId}:${context.day}`, reason: 'journey-complete' };
    }
    if (context.journeyPhase === 'start' && context.day === 1) {
      if (state.lastRemoteNarrationTriggerKey !== `journey-start:${context.tileId}`) {
        return { key: `journey-start:${context.tileId}`, reason: 'journey-start' };
      }
    }
    if (latestEventType === 'funeral') {
      return { key: `funeral:${context.day}:${context.tileId}`, reason: 'funeral' };
    }
    if (latestEventType === 'obstacle_resolution') {
      return { key: `obstacle-resolution:${context.day}:${context.tileId}`, reason: 'encounter-resolution' };
    }
    if (latestActionType === 'warp-west') {
      return { key: `warp:${context.day}:${context.tileId}`, reason: 'warp-event' };
    }
    if (latestEventType === 'river_wait' || (context.lastAction?.riverOutcome && latestActionType === 'press-on')) {
      return { key: `river:${context.tileId}:${context.day}`, reason: 'river-crossing' };
    }
    if (crossedThreshold) {
      return { key: `strangeness:${crossedThreshold}`, reason: `strangeness-${crossedThreshold}` };
    }
    if (activeRiskKeys.length) {
      const riskKey = `risk:${activeRiskKeys.join(',')}`;
      if (state.lastRemoteNarrationTriggerKey !== riskKey) {
        return { key: riskKey, reason: 'critical-risk' };
      }
    }
    const crossedMilestoneName = context.lastAction?.arrivedMilestoneName;
    if (crossedMilestoneName && isLandmark) {
      const landmarkKey = `landmark:${context.tileId}`;
      if (state.lastRemoteNarrationTriggerKey !== landmarkKey) {
        return { key: landmarkKey, reason: 'landmark' };
      }
    }
    if (latestActionType) {
      const actionKey = `action:${context.day}:${latestActionType}:${context.lastAction?.outcome ?? 'completed'}`;
      if (state.lastRemoteNarrationTriggerKey !== actionKey) {
        return { key: actionKey, reason: `${latestActionType}-outcome` };
      }
    }
    if (context.activeObstacle && state.lastRemoteNarrationTriggerKey !== `obstacle:${context.day}`) {
      return { key: `obstacle:${context.day}`, reason: 'obstacle-encounter' };
    }

    return null;
  }

  async function renderNarrationCandidate(candidate, shouldAutoPlay, stateKey) {
    ui.setNarrationLoading(false);
    state.narrationStateKey = stateKey;
    state.narrationInFlightKey = '';
    applyNarrationBeat(state, candidate ?? null);
    ui.renderMap(state);
    ui.updateActionState(state);
    renderStoryPanel();
    syncObstacleDecision();
    audio.primeCloudNarrationCache(state.narrationText);
    if (shouldAutoPlay && state.narrationAutoPlay) {
      await audio.playNarration();
    }
  }

  function renderStoryPanel() {
    const renderState = audio.getStoryRenderState();
    ui.renderStory(state, renderState);
    if (renderState.useBrowserFallback) {
      audio.populateVoiceSelect(ui.getStoryVoiceSelect());
    }
    ui.renderHazardBanner(state);
  }

  function queueNarrationRefresh(shouldAutoPlay = true) {
    if (state.narrationRefreshTimer) {
      clearTimeout(state.narrationRefreshTimer);
    }
    state.pendingNarrationAutoPlay = shouldAutoPlay;
    state.narrationRefreshTimer = setTimeout(() => {
      const autoPlay = state.pendingNarrationAutoPlay;
      state.narrationRefreshTimer = null;
      state.pendingNarrationAutoPlay = true;
      void loadNarration(autoPlay);
    }, 60);
  }

  async function loadNarrationConfig() {
    const json = await api.getNarrationConfig();
    const cloudAvailable = Boolean(json.cloudAvailable);
    const llmAvailable = Boolean(json.llmAvailable);
    state.llmNarrationAvailable = llmAvailable;
    state.elevenLabsAvailable = cloudAvailable;

    if (loadBooleanPreference(CLOUD_NARRATION_STORAGE_KEY, null) === null && typeof json.cloudDefaultEnabled === 'boolean') {
      state.cloudNarrationPreferred = json.cloudDefaultEnabled;
    }
    if (loadBooleanPreference(LLM_NARRATION_STORAGE_KEY, null) === null && typeof json.llmDefaultEnabled === 'boolean') {
      state.llmNarrationPreferred = json.llmDefaultEnabled;
    }
    ui.syncJourneyControls(state);
  }

  async function loadEvents() {
    try {
      const response = await api.getEvents(8);
      state.events = response.events ?? [];
      ui.renderEventLog(state.events);
    } catch {
      state.events = [];
      ui.renderEventLog([]);
    }
  }

  async function loadNarration(shouldAutoPlay = true) {
    const stateKey = getNarrationStateKey();
    const context = getNarrationContext();
    const remoteTrigger = getAiNarrationTrigger(context);
    debugNarration(state, 'loadNarration:called', { stateKey, narrationInFlightKey: state.narrationInFlightKey, narrationStateKey: state.narrationStateKey });
    if (state.narrationInFlightKey === stateKey) {
      debugNarration(state, 'loadNarration:skipped-inflight', { stateKey });
      return;
    }
    if (state.narrationStateKey === stateKey && state.latestNarration) {
      debugNarration(state, 'loadNarration:skipped-unchanged', { stateKey });
      return;
    }

    if (!remoteTrigger) {
      const routineReason = context.lastAction?.actionType === 'camp'
        ? 'routine-camp'
        : context.lastAction?.actionType === 'gather'
          ? 'routine-gather'
          : context.lastAction?.actionType === 'press-on'
            ? 'routine-travel'
            : 'routine';
      debugNarration(state, 'loadNarration:local-routine', { stateKey, routineReason });
      await renderNarrationCandidate(buildRoutineNarration(context, routineReason), shouldAutoPlay, stateKey);
      return;
    }

    const requestId = ++state.narrationRequestId;
    state.narrationInFlightKey = stateKey;
    ui.setNarrationLoading(true);
    try {
      const json = await api.getNarration(context);
      if (requestId !== state.narrationRequestId) {
        debugNarration(state, 'loadNarration:stale-response', { requestId, currentRequestId: state.narrationRequestId, stateKey });
        return;
      }
      const candidate = json?.narration;
      if (candidate && state.latestNarration && isNarrationDuplicate(candidate.body, state.latestNarration.body) && !shouldAutoPlay) {
        debugNarration(state, 'loadNarration:duplicate-body', {
          requestId,
          stateKey,
          previousBody: state.latestNarration.body,
          candidateBody: candidate.body,
          shouldAutoPlay
        });
        state.narrationInFlightKey = '';
        return;
      }
      state.lastRemoteNarrationTriggerKey = remoteTrigger.key;
      debugNarration(state, 'loadNarration:rendering-remote', { requestId, stateKey, narration: candidate, trigger: remoteTrigger.reason });
      await renderNarrationCandidate(candidate ?? null, shouldAutoPlay, stateKey);
    } catch (error) {
      if (requestId !== state.narrationRequestId) {
        debugNarration(state, 'loadNarration:stale-error', { requestId, currentRequestId: state.narrationRequestId, stateKey, error: String(error) });
        return;
      }
      state.narrationInFlightKey = '';
      debugNarration(state, 'loadNarration:error-fallback-local', { requestId, stateKey, error: String(error), trigger: remoteTrigger.reason });
      await renderNarrationCandidate(buildRoutineNarration(context, remoteTrigger.reason), shouldAutoPlay, stateKey);
    } finally {
      if (requestId === state.narrationRequestId) {
        ui.setNarrationLoading(false);
      }
    }
  }

  async function appendEvent(eventType, payload) {
    const latest = state.events[0];
    const ledgerTileId = getCurrentMilestone(state).id;
    const response = await api.postEvent({
      prevHash: latest?.eventHash ?? null,
      tileId: ledgerTileId,
      eventType,
      payload
    });

    if (!response.ok) {
      if (response.status === 409) {
        await loadEvents();
        const retryLatest = state.events[0];
        const retryResponse = await api.postEvent({
          prevHash: retryLatest?.eventHash ?? null,
          tileId: ledgerTileId,
          eventType,
          payload
        });
        if (!retryResponse.ok) {
          throw new Error(`Event failed after retry: ${retryResponse.status}`);
        }
        const retryJson = await retryResponse.json();
        state.events = [retryJson, ...state.events];
        ui.renderEventLog(state.events);
        return retryJson;
      }
      throw new Error(`Event failed: ${response.status}`);
    }

    const json = await response.json();
    state.events = [json, ...state.events];
    ui.renderEventLog(state.events);
    return json;
  }

  async function finalizeResourceClaim(actionType, inputs) {
    const payload = await api.claimAction({
      actionType,
      tileId: getCurrentMilestone(state).id,
      inputs
    });
    return payload;
  }

  async function loadWorld(options = {}) {
    const {
      includeNarration = true,
      includeEvents = true,
      includeNarrationAudio = true
    } = options;
    try {
      const world = await api.getWorldConfig();
      ui.renderWorldMeta(world);
      state.tileMap = trailMilestones;
      syncTrailProgress();
      ui.renderSelectedTile(state.currentTrailSnapshot ?? fallbackTile);
      ui.renderWagonState(state);
      ui.renderObjective(state);
      ui.renderStatusBanner(state);
      try {
        await loadNarrationConfig();
      } catch (error) {
        console.warn('Narration config unavailable, using browser voice', error);
        state.elevenLabsAvailable = false;
      }
      if (includeNarration) {
        await loadNarration(includeNarrationAudio);
      }
      ui.renderMap(state);
      ui.updateActionState(state);
      if (includeEvents) {
        await loadEvents();
      }
    } catch (error) {
      ui.renderWorldMeta(fallbackWorld);
      state.tileMap = trailMilestones;
      syncTrailProgress();
      ui.renderSelectedTile(state.currentTrailSnapshot ?? fallbackTile);
      ui.renderMap(state);
      ui.renderWagonState(state);
      ui.renderHazardBanner(state);
      ui.renderStatusBanner(state);
      try {
        await loadNarrationConfig();
      } catch (configError) {
        console.warn('Narration config unavailable, using browser voice', configError);
        state.elevenLabsAvailable = false;
      }
      if (includeNarration) {
        await loadNarration(includeNarrationAudio);
      }
      ui.updateActionState(state);
      if (includeEvents) {
        await loadEvents();
      }
    }
  }

  function handleWagonFailure(reason) {
    state.gameOver = true;
    state.journeyCompleted = false;
    state.statusMessage = `The wagon failed: ${reason}. The trail has claimed another party.`;
    state.wagon.status = 'Wagon lost';
    ui.renderStatusBanner(state);
    ui.renderWagonState(state);
    ui.renderObjective(state);
    applyNarrationBeat(state, {
      headline: 'The trail has claimed this wagon.',
      body: `Day ${state.day} ended near ${currentLocationName()}. ${reason}. The expedition is over.`
    });
    renderStoryPanel();
    ui.updateActionState(state);
  }

  function handleJourneyArrival() {
    state.journeyCompleted = true;
    state.wagon.status = 'Arrived at the valley settlement';
    state.statusMessage = 'You reached Willamette Valley. The crossing is complete, but your settlement choices still matter.';
  }

  function applySkippedActionConsequences(chosenAction, availableOptionsAtStop, tile) {
    const skipped = availableOptionsAtStop.filter((option) => option !== chosenAction);
    if (!skipped.length || state.gameOver) return '';

    const { wagon } = state;
    const notes = [];

    if (skipped.includes('camp') && wagon.health < 60) {
      wagon.morale = Math.max(0, wagon.morale - 1);
      notes.push('Skipping camp left the crew tense.');
    }
    if (skipped.includes('gather') && (wagon.food < 18 || wagon.water < 16)) {
      wagon.health = Math.max(0, wagon.health - 1);
      notes.push('Passing on gathering worsened shortages.');
    }
    if (skipped.includes('treat') && wagon.medicine > 0 && wagon.health < 50) {
      wagon.health = Math.max(0, wagon.health - 1);
      notes.push('Untreated illness lingered.');
    }
    if (skipped.includes('trade') && wagon.medicine <= 1 && wagon.wood >= 2) {
      wagon.morale = Math.max(0, wagon.morale - 1);
      notes.push('The crew regretted skipping trade for medicine.');
    }
    if (skipped.includes('hunt') && tile?.biome === 'plains' && wagon.food < 20) {
      wagon.food = Math.max(0, wagon.food - 1);
      notes.push('Game moved on while you delayed hunting.');
    }

    return notes.join(' ');
  }

  function applyTurnPressure(actionLabel, tile, repeatCount = 0) {
    const { wagon } = state;
    if (state.gameOver) return;
    const restorativeAction = actionLabel === 'camp' || actionLabel === 'treat';

    const rain = tile?.weather?.rain ?? 0;
    const wind = tile?.weather?.windKph ?? 0;
    const tempC = tile?.weather?.tempC ?? 8;
    const biome = tile?.biome ?? 'unknown';
    const paceProfile = {
      steady: { food: 1, water: 1, health: 0, breakdown: 0.05 },
      strenuous: { food: 2, water: 2, health: 1, breakdown: 0.11 },
      grueling: { food: 3, water: 3, health: 3, breakdown: 0.18 }
    }[wagon.pace] ?? { food: 1, water: 1, health: 0, breakdown: 0.05 };
    const rationProfile = {
      filling: { foodScale: 1.1, health: 0, morale: 1 },
      meager: { foodScale: 0.8, health: 1, morale: -1 },
      'bare-bones': { foodScale: 0.55, health: 3, morale: -4 }
    }[wagon.rations] ?? { foodScale: 1, health: 0, morale: 0 };
    let foodDrain = actionLabel === 'travel' ? 2 : actionLabel === 'camp' ? 1 : 1;
    let waterDrain = actionLabel === 'travel' ? 3 : 1;

    if (rain >= 60) {
      waterDrain += 1;
      if (actionLabel === 'travel') foodDrain += 1;
    }
    if (wind >= 30 && actionLabel === 'travel') {
      waterDrain += 1;
    }
    if (biome === 'badlands') {
      waterDrain += 1;
    }
    if (biome === 'mountain' && actionLabel === 'travel') {
      foodDrain += 1;
    }
    if (repeatCount >= 2 && (actionLabel === 'hunt' || actionLabel === 'camp')) {
      foodDrain += 1;
    }

    foodDrain = Math.max(1, Math.round((foodDrain + paceProfile.food) * rationProfile.foodScale));
    waterDrain = Math.max(1, Math.round(waterDrain + paceProfile.water));
    wagon.food = Math.max(0, wagon.food - foodDrain);
    wagon.water = Math.max(0, wagon.water - waterDrain);
    if (state.strangenessLevel >= 6 && actionLabel === 'travel') {
      wagon.food = Math.max(0, wagon.food - 1);
    }
    if ((tempC < 0 || rain > 70) && actionLabel !== 'trade') {
      if (wagon.wood > 0) {
        wagon.wood = Math.max(0, wagon.wood - 1);
      } else {
        applyPartyHealthDelta(state, -10, { status: 'Hypothermia' });
        state.statusMessage = `${state.statusMessage} The cold bit hard without firewood.`;
      }
    }
    const weatherHealthPenalty = restorativeAction
      ? (rain > 70 ? 2 : 1)
      : (rain > 70 ? 5 : rain > 45 ? 3 : 1);
    const biomeHealthPenalty = biome === 'mountain' && actionLabel === 'travel' ? 2 : 0;
    applyPartyHealthDelta(state, -(weatherHealthPenalty + biomeHealthPenalty + paceProfile.health + rationProfile.health), {
      status: rain > 70 ? 'Fever' : 'Exhaustion'
    });
    wagon.morale = Math.max(0, wagon.morale - (actionLabel === 'travel' ? 2 + Math.min(2, repeatCount) : 1) + rationProfile.morale);

    if (wagon.food <= 8) {
      applyPartyHealthDelta(state, -(restorativeAction ? 2 : 4), { status: 'Exhaustion' });
      wagon.morale = Math.max(0, wagon.morale - (restorativeAction ? 2 : 4));
    }

    if (wagon.water <= 8) {
      applyPartyHealthDelta(state, -(restorativeAction ? 3 : 5), { status: 'Fever' });
      wagon.morale = Math.max(0, wagon.morale - (restorativeAction ? 2 : 4));
    }

    if (wagon.morale <= 15) {
      applyPartyHealthDelta(state, -4, { status: 'Exhaustion' });
    }

    if (wagon.food <= 0) {
      applyPartyHealthDelta(state, -(restorativeAction ? 3 : 5), { status: 'Cholera' });
      wagon.morale = Math.max(0, wagon.morale - (restorativeAction ? 2 : 3));
    }

    if (wagon.water <= 0) {
      applyPartyHealthDelta(state, -(restorativeAction ? 4 : 7), { status: 'Fever' });
      wagon.morale = Math.max(0, wagon.morale - (restorativeAction ? 2 : 4));
    }

    const afflictionNote = maybeAfflictParty(tile);
    if (afflictionNote) {
      state.statusMessage = `${state.statusMessage} ${afflictionNote}`.trim();
    }

    if (actionLabel === 'travel' && !wagon.wagonParts.brokenPart) {
      const terrainBonus = biome === 'mountain' || biome === 'badlands' ? 0.18 : 0;
      if (Math.random() < paceProfile.breakdown + terrainBonus) {
        wagon.wagonParts.brokenPart = Math.random() < 0.5 ? 'Broken axle' : 'Shattered wheel';
        if (wagon.wagonParts.brokenPart === 'Broken axle') {
          wagon.wagonParts.axle = Math.max(0, wagon.wagonParts.axle - 35);
        } else {
          wagon.wagonParts.wheels = Math.max(0, wagon.wagonParts.wheels - 35);
        }
        wagon.status = wagon.wagonParts.brokenPart;
        state.statusMessage = `${state.statusMessage} ${wagon.wagonParts.brokenPart} left the wagon stranded until repaired.`;
        setDecision(buildBreakdownDecision(wagon.wagonParts.brokenPart));
      }
    }

    if (wagon.health <= 0) {
      handleWagonFailure('the crew collapsed from exhaustion and thirst');
      return;
    }

    syncWagonHealthFromParty(state);
    state.day += 1;
  }

  function createWagonSummarySnapshot(wagon) {
    const supplies = toSupplySnapshot(wagon);
    return {
      health: wagon.health,
      morale: wagon.morale,
      food: supplies.foodRations,
      water: supplies.waterGallons,
      wood: supplies.firewoodBundles,
      medicine: supplies.medicineDoses,
      ammunition: supplies.ammunitionBoxes
    };
  }

  function setActionSummary(actionType, beforeSnapshot) {
    if (actionType === 'press-on') {
      state.lastActionSummary = null;
      ui.renderActionSummary(state);
      return;
    }

    const afterSnapshot = createWagonSummarySnapshot(state.wagon);
    const metricConfig = [
      { key: 'health', label: 'Health', suffix: '' },
      { key: 'morale', label: 'Morale', suffix: '' },
      { key: 'food', label: 'Food', suffix: ' rations' },
      { key: 'water', label: 'Water', suffix: ' gal' },
      { key: 'wood', label: 'Wood', suffix: ' bundles' },
      { key: 'medicine', label: 'Medicine', suffix: ' doses' },
      { key: 'ammunition', label: 'Ammo', suffix: ' boxes' }
    ];
    const metrics = metricConfig
      .map((metric) => {
        const delta = afterSnapshot[metric.key] - beforeSnapshot[metric.key];
        if (!delta) {
          return null;
        }
        return {
          label: metric.label,
          delta: `${delta > 0 ? '+' : ''}${delta}${metric.suffix}`,
          tone: delta > 0 ? 'positive' : 'negative'
        };
      })
      .filter(Boolean);

    state.lastActionSummary = {
      actionType,
      title: describeAction(actionType),
      location: currentLocationName(),
      detail: state.statusMessage,
      metrics: metrics.length ? metrics : [{ label: 'Outcome', delta: 'No immediate wagon change', tone: 'neutral' }]
    };
    ui.renderActionSummary(state);
  }

  async function handleTileSelection(id) {
    void id;
  }

  async function handleAction(actionType, context = {}) {
    if (state.gameOver || !state.journeyStarted || state.journeyLoading || state.actionInProgress) return;
    if (state.journeyCompleted && actionType === 'press-on') return;
    if (state.activeDecision && !context.fromDecision) return;

    state.actionInProgress = true;
    const shouldAutoPlayNarration = actionType === 'press-on';
    ui.updateActionState(state);

    try {
      syncTrailProgress();
      const selectedTile = state.currentTrailSnapshot ?? fallbackTile;
      const availableOptionsAtStop = getAvailableActionOptions();
      const repeatCount = recentActionCount(actionType, 3);
      const { wagon } = state;
      const beforeSummarySnapshot = createWagonSummarySnapshot(wagon);
      syncWagonHealthFromParty(state);
      if (wagon.health <= 0) {
        handleWagonFailure('the crew collapsed under the accumulated strain');
        recordActionHistory(actionType, 'failed', availableOptionsAtStop);
        queueNarrationRefresh(shouldAutoPlayNarration);
        return;
      }

      if (wagon.wagonParts.brokenPart && actionType === 'press-on') {
        state.statusMessage = `The wagon cannot move until the ${wagon.wagonParts.brokenPart.toLowerCase()} is repaired.`;
        setDecision(buildBreakdownDecision(wagon.wagonParts.brokenPart));
        ui.renderStatusBanner(state);
        ui.renderMap(state);
        ui.updateActionState(state);
        recordActionHistory(actionType, 'blocked', availableOptionsAtStop);
        return;
      }

      if (actionType === 'press-on') {
        const nextMilestone = getNextMilestone(state);
        if (!nextMilestone && state.milesTraveled >= TOTAL_TRAIL_MILES) {
          handleJourneyArrival();
          return;
        }

        const previousMiles = state.milesTraveled;
        const previousMilestone = getCurrentMilestone(state);
        const calculatedMiles = calculateTravelMiles(selectedTile);
        const milesGained = Math.min(calculatedMiles, TOTAL_TRAIL_MILES - previousMiles);
        const destinationName = nextMilestone ? nextMilestone.name : 'Willamette Valley';

        const reachingRiver = nextMilestone && nextMilestone.biome === 'river' && (previousMiles + milesGained >= nextMilestone.mile);

        if (reachingRiver && !context.riverChoice) {
          state.milesTraveled = nextMilestone.mile;
          syncTrailProgress();
          const riverData = nextMilestone.river ?? { depthFt: 2.8, flowRate: 180 };
          setDecision(buildRiverDecision(actionType, nextMilestone.id, 'west', destinationName, riverData));
          state.statusMessage = `You have reached ${destinationName}. Swollen river waters block the trail ahead.`;
          ui.renderWagonState(state);
          ui.renderStatusBanner(state);
          ui.renderSelectedTile(state.currentTrailSnapshot ?? selectedTile);
          ui.renderMap(state);
          ui.updateActionState(state);
          return;
        }

        let riverOutcomeFeedback = '';
        if (context.riverChoice) {
          const riverSnapshot = nextMilestone?.river ?? { depthFt: 2.8, flowRate: 180 };
          if (context.riverChoice === 'caulk') {
            applyResourceDelta(wagon, 'wood', -2);
            state.day += 1;
            const hardCurrent = (riverSnapshot.flowRate ?? 0) > 250;
            if (hardCurrent) {
              applyPartyHealthDelta(state, -8, { status: 'Exhaustion' });
              applyResourceDelta(wagon, 'food', -2);
              applyResourceDelta(wagon, 'water', -2);
              riverOutcomeFeedback = `You caulked the wagon box (-2 wood, +1 day), but the fierce current (${riverSnapshot.flowRate} cfs) battered the hull! Supplies washed away (-2 food, -2 water) and the crew collapsed exhausted (-8 HP).`;
            } else {
              riverOutcomeFeedback = `You caulked the wagon box (-2 wood, +1 day) and floated safely across ${destinationName}. The pitch and timber held tight against the flow.`;
            }
          } else if (context.riverChoice === 'ferry') {
            const paidMedicine = wagon.medicine >= 2;
            if (paidMedicine) applyResourceDelta(wagon, 'medicine', -2);
            else applyResourceDelta(wagon, 'food', -2);
            riverOutcomeFeedback = `You hired a ferry guide (${paidMedicine ? '2 medicine doses' : '2 food rations'}). The wagon crossed ${destinationName} without taking a drop of water.`;
          } else if (context.riverChoice === 'ford') {
            const depthFt = riverSnapshot.depthFt ?? 2.8;
            if (depthFt > 3) {
              applyPartyHealthDelta(state, -12, { status: 'Fever' });
              applyResourceDelta(wagon, 'food', -4);
              applyResourceDelta(wagon, 'water', -3);
              state.wagon.morale = Math.max(0, state.wagon.morale - 8);
              riverOutcomeFeedback = `Fording at ${depthFt} ft proved treacherous! Swirling water flooded the wagon bed (-4 food, -3 water, -8 morale) and soaked the crew with fever (-12 HP).`;
            } else {
              riverOutcomeFeedback = `You forded ${destinationName} directly. At ${depthFt} ft, the water stayed below the wagon axles and the oxen pulled steadily through.`;
            }
          }
        }

        wagon.status = riverOutcomeFeedback ? 'Crossed river' : 'Pressing west';
        state.statusMessage = riverOutcomeFeedback || `The wagon presses on toward ${destinationName}.`;
        ui.renderWagonState(state);
        ui.renderStatusBanner(state);
        ui.updateActionState(state);
        await playWagonAnimation();

        if (context.riverChoice && nextMilestone) {
          state.milesTraveled = Math.min(TOTAL_TRAIL_MILES, nextMilestone.mile + Math.max(5, Math.round(milesGained / 2)));
        } else {
          state.milesTraveled = Math.min(TOTAL_TRAIL_MILES, previousMiles + milesGained);
        }
        syncTrailProgress();
        const arrivedMilestone = getCurrentMilestone(state);
        const crossedMilestone = arrivedMilestone.id !== previousMilestone.id ? arrivedMilestone : null;

        wagon.status = 'Traversing the trail';
        applyResourceDelta(wagon, 'food', -1);
        applyResourceDelta(wagon, 'water', -1);
        applyPartyHealthDelta(state, -(selectedTile.weather?.rain > 60 ? 4 : 1), { status: 'Exhaustion' });
        const travelSummary = crossedMilestone
          ? `You covered ${milesGained} miles and reached ${arrivedMilestone.name}.`
          : `You covered ${milesGained} miles west toward ${destinationName}. ${getMilesToNextMilestone(state)} miles remain to the next landmark.`;
        state.statusMessage = riverOutcomeFeedback ? `${riverOutcomeFeedback} ${travelSummary}` : travelSummary;
        await appendEvent('travel', {
          fromTileId: previousMilestone.id,
          toTileId: arrivedMilestone.id,
          direction: 'west',
          milesGained: context.riverChoice ? Math.max(5, Math.round(milesGained / 2)) : milesGained,
          milesTraveled: state.milesTraveled,
          note: crossedMilestone
            ? `Wagon covered ${milesGained} miles and arrived at ${arrivedMilestone.name}.`
            : `Wagon covered ${milesGained} miles west through ${selectedTile.biome || 'the trail'}.`
        });
        applyTurnPressure('travel', selectedTile, repeatCount);
        if (crossedMilestone && trailLandmarks[arrivedMilestone.id]) {
          await appendEvent('milestone_arrival', {
            milestoneId: arrivedMilestone.id,
            milestoneName: arrivedMilestone.name,
            milesTraveled: state.milesTraveled,
            note: `Reached ${arrivedMilestone.name} after ${state.milesTraveled} miles on the trail.`
          });
        }
        if (state.journeyCompleted && !state.gameOver) {
          handleJourneyArrival();
        }
        recordActionHistory(actionType, 'completed', availableOptionsAtStop, {
          milesGained,
          milesTraveled: state.milesTraveled,
          arrivedMilestoneName: crossedMilestone?.name,
          nextMilestoneName: getNextMilestone(state)?.name ?? 'Willamette Valley',
          milesToNextMilestone: getMilesToNextMilestone(state),
          riverChoice: context.riverChoice,
          riverOutcome: riverOutcomeFeedback
        });
        setActionSummary(actionType, beforeSummarySnapshot);
        ui.renderWagonState(state);
        ui.renderObjective(state);
        ui.renderStatusBanner(state);
        ui.renderHazardBanner(state);
        ui.renderSelectedTile(state.currentTrailSnapshot ?? selectedTile);
        await loadNarration(shouldAutoPlayNarration);
        ui.updateActionState(state);
        await loadEvents();
        return;
      }

      if (actionType === 'warp-west') {
        state.milesTraveled = Math.min(TOTAL_TRAIL_MILES, state.milesTraveled + 120);
        syncTrailProgress();
        wagon.morale = Math.max(0, wagon.morale - 20);
        applyPartyHealthDelta(state, -14, { status: 'Delirium' });
        wagon.status = 'Reality folded around the wagon';
        state.statusMessage = 'Space folded in on itself and the wagon lurched far west at a ruinous cost to morale.';
        await appendEvent('warp', {
          toTileId: getCurrentMilestone(state).id,
          milesTraveled: state.milesTraveled,
          note: 'A high-strangeness fold warped the wagon westward.'
        });
      }

      if (actionType === 'gather') {
        if (!context.resourceType) {
          setDecision(buildGatherDecision(selectedTile));
          return;
        }

        const resourceType = context.resourceType;
        const nodeId = `${getCurrentMilestone(state).id}:${resourceType}`;
        const biomeBonus = selectedTile.biome === 'forest' && resourceType === 'wood' ? 3 : selectedTile.biome === 'river' && resourceType === 'water' ? 3 : 0;
        const rainPenalty = (selectedTile.weather?.rain ?? 0) > 75 ? 2 : 0;
        const repeatedPenalty = Math.min(4, repeatCount * 2);
        const amount = Math.max(2, 8 + biomeBonus - rainPenalty - repeatedPenalty);
        try {
          await finalizeResourceClaim('consume_resource', { nodeId, amount });
        } catch (claimError) {
          console.warn('Backend resource claim failed, proceeding with local gather', claimError);
        }
        const gain = applyResourceDelta(wagon, resourceType, amount);
        if (gain.blocked > 0) {
          wagon.morale = Math.max(0, wagon.morale - 1);
        }
        wagon.status = `Gathering ${resourceType === 'wood' ? 'firewood' : resourceType === 'forage' ? 'wild food' : 'water'}`;
        wagon.morale = Math.min(100, wagon.morale + 3);
        const resourceName = resourceType === 'wood' ? 'bundles of firewood' : resourceType === 'forage' ? 'food rations' : 'gallons of water';
        state.statusMessage = `You gathered ${gain.applied} ${resourceName}.${gain.blocked ? ' The wagon could not carry the rest.' : ''}`;
        await appendEvent('gather', {
          resourceType,
          amount: gain.applied,
          note: `Gathered ${gain.applied} ${resourceName} from this stop.`
        });
        applyTurnPressure('gather', selectedTile, repeatCount);
      }

      if (actionType === 'camp') {
      const campPenalty = Math.min(6, repeatCount * 2);
      const campRecovery = Math.max(5, 12 - campPenalty);
      applyTurnPressure('camp', selectedTile, repeatCount);
      if (state.gameOver) {
        recordActionHistory(actionType, 'failed', availableOptionsAtStop);
        queueNarrationRefresh(shouldAutoPlayNarration);
        return;
      }
      wagon.health = Math.min(100, wagon.health + campRecovery);
      wagon.morale = Math.min(100, wagon.morale + Math.max(3, 8 - repeatCount));
      wagon.status = 'Camped for the night';
      state.statusMessage = repeatCount > 0
        ? 'You made camp, but repeated halts gave only partial recovery.'
        : 'You made camp and the wagon crew recovered.';
      await appendEvent('camp', {
        note: 'Camped and recovered strength.'
      });
    }

      if (actionType === 'hunt') {
    if (!context.huntTarget) {
      setDecision(buildHuntDecision());
      return;
    }
    applyResourceDelta(wagon, 'ammunition', -1);
    const targetConfig = {
      bison: { yield: 18, success: 0.58, weightPenalty: 2 },
      deer: { yield: 11, success: 0.75, weightPenalty: 1 },
      grouse: { yield: 6, success: 0.9, weightPenalty: 0 }
    }[context.huntTarget] ?? { yield: 8, success: 0.7, weightPenalty: 1 };
    const biomeBonus = selectedTile.biome === 'plains' || selectedTile.biome === 'grassland' ? 3 : 0;
    const weatherPenalty = (selectedTile.weather?.windKph ?? 0) > 30 ? 2 : 0;
    const repeatedPenalty = Math.min(7, repeatCount * 3);
    const successRoll = Math.random() <= targetConfig.success;
    const foodGain = successRoll ? Math.max(2, targetConfig.yield + biomeBonus - weatherPenalty - repeatedPenalty - targetConfig.weightPenalty) : 0;
    const gain = applyResourceDelta(wagon, 'forage', foodGain);
    wagon.morale = Math.min(100, wagon.morale + Math.max(1, 5 - repeatCount));
    wagon.status = 'Hunting for provisions';
    if (successRoll) {
      const guide = getRoleHolder(state, 'Guide') ?? randomLivingMember();
      const hunterName = guide ? guide.name : 'The hunting party';
      state.statusMessage = `${hunterName} brought down ${context.huntTarget} with a clean shot and returned with ${gain.applied} rations.`;
    } else {
      const billy = (state.wagon.party ?? []).find((m) => m.name === 'Billy' && m.health > 0);
      if (billy && Math.random() < 0.65) {
        setPartyCondition(state, billy.id, 'Injured');
        applyPartyHealthDelta(state, -10, { memberId: billy.id, status: 'Injured' });
        state.statusMessage = `The ${context.huntTarget} slipped away after Billy tripped in the brush and hurt his ankle. He is now injured and needs medicine.`;
      } else {
        const member = randomLivingMember();
        if (member && Math.random() < 0.4) {
          setPartyCondition(state, member.id, 'Injured');
          applyPartyHealthDelta(state, -8, { memberId: member.id, status: 'Injured' });
          state.statusMessage = `The ${context.huntTarget} got away when ${member.name} stumbled over a limestone ledge. ${member.name} is injured and needs medicine.`;
        } else {
          state.statusMessage = `The ${context.huntTarget} caught wind of the party and slipped away into the scrub, wasting precious ammunition.`;
        }
      }
    }
    await appendEvent('hunt', {
      foodGain: gain.applied,
      target: context.huntTarget,
      note: `Hunted ${context.huntTarget} for provisions along the trail.`
    });
    applyTurnPressure('hunt', selectedTile, repeatCount);
    }

    if (actionType === 'treat') {
    if (!context.memberId) {
      setDecision(buildTreatDecision());
      return;
    }
    const patient = (wagon.party ?? []).find((member) => member.id === context.memberId);
    if (!patient) {
      state.statusMessage = 'There is no one available to treat.';
      return;
    }
    if (wagon.medicine > 0) {
      applyResourceDelta(wagon, 'medicine', -1);
        applyTurnPressure('treat', selectedTile, repeatCount);
        if (state.gameOver) {
        recordActionHistory(actionType, 'failed', availableOptionsAtStop);
        queueNarrationRefresh(shouldAutoPlayNarration);
        return;
      }
      applyPartyHealthDelta(state, 18 + doctorHealBonus(), { memberId: patient.id });
      patient.status = 'Healthy';
      wagon.status = 'Treated illness';
      state.statusMessage = `${patient.name} steadied after treatment from the medical kit.`;
      await appendEvent('treat_illness', {
        medicineUsed: 1,
        memberName: patient.name,
        note: `Treated ${patient.name} with a field remedy.`
      });
    } else {
      applyPartyHealthDelta(state, -6, { memberId: patient.id, status: patient.status });
      wagon.status = 'No medicine available';
      state.statusMessage = `You tried to treat ${patient.name}, but there was no medicine left.`;
      await appendEvent('treat_illness', {
        medicineUsed: 0,
        memberName: patient.name,
        note: `Tried to treat ${patient.name} without medicine.`
      });
      applyTurnPressure('treat', selectedTile, repeatCount);
      if (state.gameOver) {
          recordActionHistory(actionType, 'failed', availableOptionsAtStop);
          queueNarrationRefresh(shouldAutoPlayNarration);
          return;
        }
      }
    }

      if (actionType === 'repair') {
        if (state.activeDecision?.type === 'wagon-breakdown') {
          clearDecision({ render: false });
        }
        const repairCost = breakdownRepairCost();
        if (wagon.wood < repairCost) {
          state.statusMessage = `Repairing the wagon needs ${repairCost} wood bundles.`;
        } else {
          applyResourceDelta(wagon, 'wood', -repairCost);
          wagon.wagonParts.axle = Math.min(100, wagon.wagonParts.axle + 30);
          wagon.wagonParts.wheels = Math.min(100, wagon.wagonParts.wheels + 30);
          const repaired = wagon.wagonParts.brokenPart;
          wagon.wagonParts.brokenPart = null;
          wagon.status = 'Wagon repaired';
          state.statusMessage = repaired
            ? `You repaired the ${repaired.toLowerCase()} using ${repairCost} wood bundle${repairCost === 1 ? '' : 's'}.`
            : `You reinforced the wagon with ${repairCost} wood bundle${repairCost === 1 ? '' : 's'}.`;
          await appendEvent('repair', {
            repairedPart: repaired ?? 'preventive maintenance',
            woodSpent: repairCost,
            note: repaired ? `Repaired ${repaired.toLowerCase()} with trail lumber.` : 'Performed preventive wagon repairs.'
          });
        }
        applyTurnPressure('camp', selectedTile, repeatCount);
      }

      if (actionType === 'trade') {
      const woodSpent = 2;
      const tradeMedicine = repeatCount >= 2 ? 0 : 1;
      const trade = await api.proposeTrade({
        counterpartyPubkey: 'self',
        tileId: getCurrentMilestone(state).id,
        offer: { wood: woodSpent },
        request: { medicine: tradeMedicine }
      });
      await api.signTrade({
        tradeId: trade.trade_id ?? trade.tradeId,
        proposerPubkey: trade.proposer_pub_key ?? trade.proposer_pubkey,
        counterpartyPubkey: trade.counterparty_pubkey,
        offer: trade.offer,
        request: trade.request
      });
      await api.commitTrade(trade.trade_id ?? trade.tradeId);
      applyResourceDelta(wagon, 'wood', -woodSpent);
      const medicineGain = applyResourceDelta(wagon, 'medicine', Number(trade.request?.medicine ?? 0)).applied;
      wagon.status = 'Bartered for medicine';
      state.statusMessage = medicineGain > 0
        ? 'A passing settler sealed a signed trade for medicine in exchange for your firewood.'
        : 'You recorded a hard bargain on the ledger, but the trail market yielded no medicine.';
      applyTurnPressure('trade', selectedTile, repeatCount);
    }

    if (actionType === 'scout') {
      const nextMilestone = getNextMilestone(state);
      const nextSnapshot = nextMilestone ? getTrailSnapshot({ ...state, milesTraveled: nextMilestone.mile }) : null;
      applyTurnPressure('gather', selectedTile, repeatCount);
      wagon.status = 'Scouting ahead';
      wagon.morale = Math.min(100, wagon.morale + 2);
      state.statusMessage = nextMilestone && nextSnapshot
        ? `Jedediah scouts ahead: ${nextMilestone.name} lies ${getMilesToNextMilestone(state)} miles west through ${nextSnapshot.biome}, with rain near ${Math.round(nextSnapshot.weather?.rain ?? 0)}%.`
        : 'Jedediah scouts ahead and sees only the last miles into the valley.';
      await appendEvent('scout', {
        milestoneId: nextMilestone?.id ?? null,
        milestoneName: nextMilestone?.name ?? 'Willamette Valley',
        note: state.statusMessage
      });
    }

    const skippedConsequenceNote = applySkippedActionConsequences(actionType, availableOptionsAtStop, selectedTile);
    if (skippedConsequenceNote) {
      state.statusMessage = `${state.statusMessage} ${skippedConsequenceNote}`.trim();
    }

      await processPartyDeaths();

      if (state.gameOver) {
        recordActionHistory(actionType, 'failed', availableOptionsAtStop);
        queueNarrationRefresh(shouldAutoPlayNarration);
        return;
      }

      recordActionHistory(actionType, 'completed', availableOptionsAtStop);
      setActionSummary(actionType, beforeSummarySnapshot);

      ui.renderWagonState(state);
      ui.renderObjective(state);
      ui.renderStatusBanner(state);
      ui.renderHazardBanner(state);
      syncTrailProgress();
      const currentTile = state.currentTrailSnapshot ?? selectedTile;
      ui.renderSelectedTile(currentTile);
      await loadNarration(shouldAutoPlayNarration);
      ui.updateActionState(state);
      await loadEvents();
    } finally {
      stopWagonAnimation();
      state.actionInProgress = false;
      ui.renderWagonState(state);
      ui.updateActionState(state);
    }
  }

  async function beginJourney() {
    if (state.journeyLoading) return;
    state.journeyStarted = true;
    ui.hideJourneyModal();
    state.journeyLoading = true;
    ui.setJourneyLoading(true);
    try {
      await loadWorld();
    } finally {
      state.journeyLoading = false;
      ui.setJourneyLoading(false);
      ui.updateActionState(state);
    }
  }

  function resetToJourneySetup() {
    resetExpedition(state);
    audio.stopAllNarration();
    ui.resetActionButtons();
    ui.renderWagonState(state);
    ui.renderObjective(state);
    applyNarrationBeat(state, null);
    renderStoryPanel();
    ui.renderStatusBanner(state);
    ui.renderEventLog();
    ui.syncJourneyControls(state);
    ui.renderActionSummary(state);
    ui.showJourneyModal();
    ui.setJourneyLoading(false);
  }

  async function bootstrapApp() {
    resetExpedition(state);
    ui.renderWagonState(state);
    ui.renderObjective(state);
    applyNarrationBeat(state, null);
    renderStoryPanel();
    ui.renderStatusBanner(state);
    ui.renderEventLog();
    ui.syncJourneyControls(state);
    ui.renderActionSummary(state);
    ui.showJourneyModal();
    try {
      await loadNarrationConfig();
    } catch {
      // Modal settings still work with local defaults if the config request fails.
    }
  }

  function setJourneyLlmPreference(enabled) {
    state.llmNarrationPreferred = enabled;
    saveBooleanPreference(LLM_NARRATION_STORAGE_KEY, state.llmNarrationPreferred);
    ui.syncJourneyControls(state);
  }

  function setJourneyCloudPreference(enabled) {
    state.cloudNarrationPreferred = enabled;
    saveCloudNarrationPreference(state.cloudNarrationPreferred);
    ui.syncJourneyControls(state);
  }

  function setJourneyAutoReadPreference(enabled) {
    state.narrationAutoPlay = enabled;
    saveBooleanPreference(AUTO_READ_STORAGE_KEY, state.narrationAutoPlay);
    ui.syncJourneyControls(state);
  }

  function setPace(value) {
    state.wagon.pace = ['steady', 'strenuous', 'grueling'].includes(value) ? value : 'steady';
    state.statusMessage = `The wagon pace is now ${paceLabel(state.wagon.pace).toLowerCase()}.`;
    ui.renderMap(state);
    ui.renderWagonState(state);
  }

  function setRations(value) {
    state.wagon.rations = ['filling', 'meager', 'bare-bones'].includes(value) ? value : 'filling';
    state.statusMessage = `The ration plan is now ${rationsLabel(state.wagon.rations).toLowerCase()}.`;
    ui.renderMap(state);
    ui.renderWagonState(state);
  }

  async function resolveDecisionChoice(choiceInput) {
    const decision = state.activeDecision;
    if (!decision) return;
    const matchingOption = (decision.options ?? []).find(
      (opt) => opt.id === choiceInput || String(opt.hotkey) === String(choiceInput)
    );
    const choiceId = matchingOption ? matchingOption.id : choiceInput;
    clearDecision({ render: false });

    if (decision.type === 'wagon-breakdown') {
      if (choiceId === 'repair-wood') {
        await handleAction('repair', { fromDecision: true });
        return;
      }
      if (choiceId === 'forage-wood') {
        await handleAction('gather', { fromDecision: true, resourceType: 'wood' });
        return;
      }
      if (choiceId === 'trade-spare') {
        const repairCost = breakdownRepairCost();
        if (state.wagon.food >= 2) {
          applyResourceDelta(state.wagon, 'food', -2);
          applyResourceDelta(state.wagon, 'wood', repairCost);
          state.statusMessage = `You bartered 2 food rations for ${repairCost} wood bundles to fix the wagon.`;
          await handleAction('repair', { fromDecision: true });
        } else {
          state.statusMessage = 'Not enough food to barter. Try foraging for timber.';
          setDecision(buildBreakdownDecision(state.wagon.wagonParts.brokenPart ?? 'Broken part'));
        }
        return;
      }
    }

    if (decision.type === 'river-crossing') {
      if (choiceId === 'wait') {
        state.actionInProgress = true;
        ui.updateActionState(state);
        try {
          const selectedTile = state.currentTrailSnapshot ?? fallbackTile;
          applyTurnPressure('camp', selectedTile, 0);
          const riverTile = state.tileMap.find((tile) => tile.id === decision.context.nextTileId);
          if (riverTile?.river) {
            riverTile.river = {
              depthFt: Number(Math.max(1.4, riverTile.river.depthFt - 0.7).toFixed(2)),
              flowRate: Number(Math.max(70, riverTile.river.flowRate - 35).toFixed(2))
            };
          }
          state.statusMessage = `You waited by the riverbank for the waters near ${decision.context.destinationName} to ease.`;
          await appendEvent('river_wait', {
            tileId: decision.context.nextTileId,
            note: `The wagon delayed at ${decision.context.destinationName}, hoping for lower water.`
          });
          await processPartyDeaths();
          ui.renderStatusBanner(state);
          ui.renderWagonState(state);
          ui.renderMap(state);
          ui.updateActionState(state);
          queueNarrationRefresh(false);
          await loadEvents();
        } finally {
          state.actionInProgress = false;
          ui.updateActionState(state);
        }
        return;
      }
      await handleAction(decision.context.travelAction, { fromDecision: true, riverChoice: choiceId });
      return;
    }

    if (decision.type === 'hunt-target') {
      await handleAction('hunt', { fromDecision: true, huntTarget: choiceId });
      return;
    }

    if (decision.type === 'treat-member') {
      await handleAction('treat', { fromDecision: true, memberId: choiceId });
      return;
    }

    if (decision.type === 'gather-resource') {
      await handleAction('gather', { fromDecision: true, resourceType: choiceId });
      return;
    }

    if (decision.type === 'obstacle-dilemma') {
      const obstacle = decision.context?.obstacle ?? state.activeObstacle;
      const choice = obstacle?.choices?.find((option) => option.id === choiceId);
      if (!choice) return;

      state.actionInProgress = true;
      ui.updateActionState(state);
      try {
        const cost = choice.cost ?? {};
        applyPartyHealthDelta(state, -(cost.health ?? 0), { status: 'Shaken' });
        state.wagon.morale = Math.max(0, state.wagon.morale - (cost.morale ?? 0));
        applyResourceDelta(state.wagon, 'food', -(cost.food ?? 0));
        applyResourceDelta(state.wagon, 'water', -(cost.water ?? 0));
        applyResourceDelta(state.wagon, 'wood', -(cost.wood ?? 0));
        applyResourceDelta(state.wagon, 'medicine', -(cost.medicine ?? 0));
        applyResourceDelta(state.wagon, 'ammunition', -(cost.ammunition ?? 0));
        if (cost.days) {
          state.day += cost.days;
        }
        state.wagon.status = choice.label;
        state.statusMessage = `${choice.label} resolved the dilemma. ${choice.description} ${describeObstacleCost(cost)}`.trim();
        state.lastObstacleDay = state.day;
        state.activeObstacle = null;
        clearDecision({ render: false });
        await appendEvent('obstacle_resolution', {
          obstacle: obstacle.description,
          choiceId: choice.id,
          choiceLabel: choice.label,
          cost,
          note: `${choice.label}: ${choice.description}`
        });
        await processPartyDeaths();
        if (!state.gameOver) {
          ui.renderStatusBanner(state);
          ui.renderWagonState(state);
          ui.renderMap(state);
          ui.renderHazardBanner(state);
          ui.updateActionState(state);
          await loadEvents();
          queueNarrationRefresh(false);
        }
      } finally {
        state.actionInProgress = false;
        ui.renderMap(state);
        ui.renderWagonState(state);
        ui.renderHazardBanner(state);
        ui.updateActionState(state);
      }
    }
  }

  return {
    beginJourney,
    bootstrapApp,
    handleAction,
    handleTileSelection,
    loadNarrationConfig,
    resolveDecisionChoice,
    renderStoryPanel,
    resetToJourneySetup,
    setPace,
    setRations,
    setJourneyAutoReadPreference,
    setJourneyCloudPreference,
    setJourneyLlmPreference
  };
}

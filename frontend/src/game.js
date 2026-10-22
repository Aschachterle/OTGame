import {
  applyPartyHealthDelta,
  FINISH_TILE_ID,
  MAX_STRANGENESS_LEVEL,
  OUTFITTING_CATALOG,
  RECOMMENDED_OUTFIT,
  STARTING_CASH,
  START_TILE_ID,
  TOTAL_TRAIL_MILES,
  WAGON_CAPACITY,
  applyNarrationBeat,
  extractDialogueFromNarration,
  getCargoWeightTier,
  getCurrentMilestone,
  getCurrentMilestoneIndexForMiles,
  getLivingPartyMembers,
  getMilesToNextMilestone,
  getNextMilestone,
  getOutfittingTotals,
  getRoleCount,
  getRoleHolder,
  getStartingCashForState,
  debugNarration,
  describeAction,
  fallbackTile,
  fallbackWorld,
  getEffectiveStrangenessLevel,
  getJourneyPhase,
  getTrailSnapshot,
  isNarrationDuplicate,
  normalizeSurrealMutation,
  loadBooleanPreference,
  locationDescriptor,
  locationNameForTile,
  paceLabel,
  resourceUnitsLabel,
  rationsLabel,
  rememberObstacleHistory,
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
import {
  ARCHETYPE_OPTIONS,
  PACE_PRESETS,
  equipMemberEraOutfit,
  getEraById,
  normalizeWeatherOverlayId,
  randomizeMemberInEra,
  summarizeMemberOutfit,
  syncAllPartyAppearancesToEra
} from './character-designer.js?v=sprite32_1';
import { getFrameCount } from './wagon-animator.js';

const TRAVEL_ANIMATION_MS = 3600;

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
    const load = wagonLoadWeight(state.wagon);
    const loadTier = getCargoWeightTier(load);
    if (loadTier === 'light') miles += 2;
    if (loadTier === 'overburdened') miles -= load > 2300 ? 4 : 2;
    if (state.wagon.oxenFatigue >= 80) miles -= 4;
    else if (state.wagon.oxenFatigue >= 50) miles -= 2;
    if (biome === 'mountain' && state.wagon.oxenYokes < 3) miles -= 2;
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
    state.landscapeMoving = false;
    state.wagonAnimationFrame = 0;
    ui.refreshLandscapeCanvas?.(state);
  }

  async function playWagonAnimation(durationMs = TRAVEL_ANIMATION_MS) {
    stopWagonAnimation();
    state.travelAnimationActive = true;
    state.landscapeMoving = true;
    const paceCfg = PACE_PRESETS[state.wagon?.pace] || PACE_PRESETS.steady;
    const stepSpeed = Math.max(0.8, (paceCfg?.speed || 1.0) * 1.8);
    ui.refreshLandscapeCanvas?.(state);
    wagonAnimationTimer = window.setInterval(() => {
      state.wagonAnimationFrame = (state.wagonAnimationFrame + 1) % Math.max(12, getFrameCount());
      state.landscapeScrollX = (state.landscapeScrollX || 0) + stepSpeed;
      ui.refreshLandscapeCanvas?.(state);
    }, 90);
    await delay(durationMs);
    stopWagonAnimation();
  }

  async function animateWalkToGeneralStore() {
    stopWagonAnimation();
    state.landscapeMoving = true;
    const durationMs = 3300;
    const startProgress = state.generalStoreApproachProgress ?? 0;
    const startTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

    await new Promise((resolve) => {
      function tick(now) {
        const elapsed = Math.max(0, now - startTime);
        const rawT = Math.min(1, elapsed / durationMs);

        state.generalStoreApproachProgress = startProgress + (1 - startProgress) * rawT;

        ui.refreshLandscapeCanvas?.(state);

        if (rawT < 1) {
          if (typeof window !== 'undefined' && window.requestAnimationFrame) {
            window.requestAnimationFrame(tick);
          } else {
            setTimeout(() => tick(Date.now()), 16);
          }
        } else {
          resolve();
        }
      }

      if (typeof window !== 'undefined' && window.requestAnimationFrame) {
        window.requestAnimationFrame(tick);
      } else {
        setTimeout(() => tick(Date.now()), 16);
      }
    });

    state.generalStoreApproachProgress = 1;
    state.landscapeMoving = false;
    state.wagonAnimationFrame = 0;
    ui.refreshLandscapeCanvas?.(state);
  }

  async function animateWalkFromGeneralStore() {
    stopWagonAnimation();
    state.travelAnimationActive = true;
    state.landscapeMoving = true;
    const paceCfg = PACE_PRESETS[state.wagon?.pace] || PACE_PRESETS.steady;
    const stepSpeed = Math.max(1.0, (paceCfg?.speed || 1.0) * 1.8);
    ui.refreshLandscapeCanvas?.(state);

    const targetScroll = 155;
    const startScroll = state.landscapeScrollX || 0;
    const distance = Math.max(1, targetScroll - startScroll);
    const durationMs = Math.max(800, Math.round((distance / (stepSpeed * 14)) * 1000));
    const startTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

    await new Promise((resolve) => {
      function tick(now) {
        const elapsed = Math.max(0, now - startTime);
        const rawT = Math.min(1, elapsed / durationMs);

        state.landscapeScrollX = startScroll + distance * rawT;
        const stepRate = 18;
        state.wagonAnimationFrame = Math.floor((elapsed / 1000) * stepRate);

        ui.refreshLandscapeCanvas?.(state);

        if (rawT < 1) {
          if (typeof window !== 'undefined' && window.requestAnimationFrame) {
            window.requestAnimationFrame(tick);
          } else {
            setTimeout(() => tick(Date.now()), 16);
          }
        } else {
          resolve();
        }
      }

      if (typeof window !== 'undefined' && window.requestAnimationFrame) {
        window.requestAnimationFrame(tick);
      } else {
        setTimeout(() => tick(Date.now()), 16);
      }
    });

    stopWagonAnimation();
  }

  async function animateRiverCrossing(method) {
    const durationByMethod = { ford: 1050, caulk: 1350, ferry: 1800, guide: 1250 };
    const duration = Object.hasOwn(durationByMethod, method) ? durationByMethod[method] : undefined;
    if (typeof duration !== 'number') throw new Error(`Unsupported river crossing method: ${method}`);

    const steps = Math.ceil(duration / 60);
    state.riverCrossingAnimation = { method, phase: 'crossing', progress: 0 };
    state.travelAnimationActive = true;
    state.landscapeMoving = true;
    ui.refreshLandscapeCanvas?.(state);

    for (let step = 1; step <= steps; step += 1) {
      state.riverCrossingAnimation.progress = step / steps;
      state.wagonAnimationFrame = (state.wagonAnimationFrame + 1) % 12;
      ui.refreshLandscapeCanvas?.(state);
      await delay(60);
    }

    state.travelAnimationActive = false;
    state.landscapeMoving = false;
    state.riverCrossingAnimation = { method, phase: 'departed', progress: 1 };
    ui.refreshLandscapeCanvas?.(state);
  }

  function setDecision(decision) {
    state.activeDecision = decision;
    ui.renderMap(state);
    ui.updateActionState(state);
  }

  function clearDecision(options = {}) {
    const { render = true } = options;
    state.activeDecision = null;
    state.pendingMetaDialogue = null;
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
    return options;
  }

  function randomLivingMember() {
    const living = getLivingPartyMembers(state);
    if (!living.length) return null;
    return living[Math.floor(Math.random() * living.length)] ?? living[0];
  }

  function breakdownRepairCost() {
    const carpenterCount = getRoleCount(state, 'Carpenter');
    if (carpenterCount >= 2) return 0;
    return Math.max(1, 2 - (carpenterCount >= 1 ? 1 : 0));
  }

  function riverFerryFare(tileId) {
    return { 'kansas-river': 5, 'green-river': 8, 'snake-river': 10 }[tileId] ?? 8;
  }

  function storeMarkup(tileId) {
    const bankerCount = getRoleCount(state, 'Banker');
    if (bankerCount >= 2) return 0.8;
    if (bankerCount === 1) return 1.0;
    return { 'fort-kearny': 2, 'fort-laramie': 2.5, 'fort-bridger': 3 }[tileId] ?? 1;
  }

  function outfitProfile(weight, cash, yokes) {
    const tier = getCargoWeightTier(weight);
    const era = getEraById(state.selectedEra);
    const eraNote = era.id !== 'oregon_trail' ? ` (${era.shortLabel || era.label} travelers)` : '';
    if (tier === 'light' && cash >= 500) return `a lean ${tier} load (${Math.round(weight)} lb), a cash-rich reserve ($${cash.toFixed(2)}), and ${yokes} yokes${eraNote}`;
    if (tier === 'overburdened') return `a heavily provisioned ${tier} load (${Math.round(weight)} lb), a $${cash.toFixed(2)} cash reserve, and ${yokes} yokes${eraNote}`;
    return `a ${tier} load (${Math.round(weight)} lb), a $${cash.toFixed(2)} cash reserve, and ${yokes} yokes${eraNote}`;
  }

  function doctorHealBonus() {
    return getRoleCount(state, 'Doctor') * 5;
  }

  function maybeAfflictParty(tile) {
    const risks = [];
    if (state.wagon.food < 12 || state.wagon.water < 10) risks.push('Exhaustion', 'Fever');
    if ((tile?.weather?.rain ?? 0) > 70 || (tile?.weather?.tempC ?? 8) < 0) risks.push('Cholera', 'Fever');
    if (tile?.biome === 'badlands' || tile?.biome === 'plains') risks.push('Snakebite');
    if (!risks.length || Math.random() > 0.28) return '';
    const condition = risks[Math.floor(Math.random() * risks.length)];
    const youth = condition === 'Snakebite' ? getRoleHolder(state, 'Youth') : null;
    const member = youth && Math.random() < 0.65 ? youth : randomLivingMember();
    if (!member || member.status !== 'Healthy') return '';
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
        graveMarker: `${state.expeditionName}: ${member.name} (${member.role})`,
        note: `${state.expeditionName} marked the grave of ${member.name}, ${member.role.toLowerCase()} of the wagon party.`
      });
    }
    if (!getLivingPartyMembers(state).length) {
      handleWagonFailure('the party was lost on the trail');
    }
  }

  function buildRiverDecision(travelAction, nextTileId, directionText, destinationName, river) {
    const flowLabel = river.flowRate;
    const ferryFare = riverFerryFare(nextTileId);
    const options = [
      { id: 'ford', hotkey: '1', label: 'Ford the river', detail: 'Fast, but dangerous above 3.0 ft.' },
      { id: 'caulk', hotkey: '2', label: 'Caulk and float', detail: 'Costs 2 wood and 1 day. Risky in hard current.' }
    ];
    if (state.wagon.cash >= ferryFare) {
      options.push({ id: 'ferry', hotkey: '3', label: `Pay the ferry ($${ferryFare}.00)`, detail: 'A paid crossing avoids capsizing risk and preserves provisions.' });
      if (nextTileId === 'snake-river') {
        options.push({ id: 'guide', hotkey: '4', label: `Hire a local river guide ($${ferryFare}.00)`, detail: 'Pay for local knowledge of the safer channel through the crossing.' });
      }
    }
    options.push({ id: 'wait', hotkey: String(options.length + 1), label: 'Wait for lower water', detail: 'Lose a day of supplies and try again tomorrow.' });
    return {
      type: 'river-crossing',
      eyebrow: 'River crossing',
      title: `River crossing ahead: ${destinationName}`,
      body: `Depth ${river.depthFt} ft. Flow ${flowLabel} cfs. ${state.wagon.cash < ferryFare ? `The ferry requires $${ferryFare}.00; the wagon holds $${state.wagon.cash.toFixed(2)}.` : `The ferry fare is $${ferryFare}.00.`} Choose how to cross before the wagon commits to the ford.`,
      context: { travelAction, nextTileId, directionText, destinationName, river, ferryFare },
      options
    };
  }

  function buildDallesRouteDecision() {
    const options = [];
    if (state.wagon.cash >= 10) {
      options.push({ id: 'barlow-road', hotkey: '1', label: 'Take the Barlow Road ($10.00)', detail: 'Pay the toll for the overland route around Mount Hood.' });
    }
    options.push({
      id: 'columbia-raft',
      hotkey: String(options.length + 1),
      label: 'Take a Columbia River raft',
      detail: 'No toll, but fast water risks supplies, health, and wagon parts.'
    });
    return {
      type: 'dalles-route',
      eyebrow: 'Final trail fork',
      title: 'Choose the last road to Oregon',
      body: state.wagon.cash >= 10
        ? 'At The Dalles, choose the $10 Barlow Road toll or risk the Columbia River raft.'
        : `The Barlow Road toll is $10.00, but the wagon has only $${state.wagon.cash.toFixed(2)}. The Columbia raft remains open.`,
      options
    };
  }

  function buildFortResupplyDecision(tileId) {
    const markup = storeMarkup(tileId);
    const cargoBindings = {
      foodSacks: { wagonKey: 'food', quantity: 25, cargoWeight: 25, noun: '25 food rations' },
      waterCasks: { wagonKey: 'water', quantity: 10, cargoWeight: 80, noun: '10 gallons of water' },
      firewoodBundles: { wagonKey: 'wood', quantity: 1, cargoWeight: 30, noun: '1 firewood bundle' },
      ammunitionBoxes: { wagonKey: 'ammunition', quantity: 1, cargoWeight: 3, noun: '1 ammunition box' },
      medicalKits: { wagonKey: 'medicine', quantity: 4, cargoWeight: 2, noun: '4 medicine doses' },
      spareAxles: { wagonKey: 'spareAxles', quantity: 1, cargoWeight: 45, noun: '1 spare axle' },
      spareWheels: { wagonKey: 'spareWheels', quantity: 1, cargoWeight: 50, noun: '1 spare wheel' },
      spareTongues: { wagonKey: 'spareTongues', quantity: 1, cargoWeight: 40, noun: '1 spare tongue' }
    };
    const freeCapacity = WAGON_CAPACITY - wagonLoadWeight(state.wagon);
    const options = OUTFITTING_CATALOG
      .filter((item) => cargoBindings[item.key])
      .filter((item) => item.price * markup <= state.wagon.cash && cargoBindings[item.key].cargoWeight <= freeCapacity)
      .map((item, index) => {
        const boundItem = cargoBindings[item.key];
        const price = item.price * markup;
        return {
          id: item.key,
          hotkey: String(index + 1),
          label: `Buy ${boundItem.noun} ($${price.toFixed(2)})`,
          detail: `Fort price is ${markup}x Independence; adds ${boundItem.cargoWeight} lbs.`
        };
      });
    return {
      type: 'fort-resupply',
      eyebrow: 'Fort store',
      title: `${getCurrentMilestone(state).shortName} supply counter`,
      body: options.length
        ? `Prices are ${markup}x the Independence catalog. Cash on hand: $${state.wagon.cash.toFixed(2)}.`
        : `Prices are ${markup}x the Independence catalog; no listed item fits the available cash and cargo room ($${state.wagon.cash.toFixed(2)} cash, ${Math.max(0, freeCapacity)} lbs free).`,
      context: { tileId, markup },
      options
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
    const spareKey = brokenPart.toLowerCase().includes('axle')
      ? 'spareAxles'
      : brokenPart.toLowerCase().includes('wheel')
        ? 'spareWheels'
        : 'spareTongues';
    const hasSpare = (state.wagon[spareKey] ?? 0) > 0;
    const carpenterBonus = carpenter ? ` (${carpenter.name}'s carpentry reduces lumber use)` : '';
    const options = [];
    if (hasSpare) {
      options.push({
        id: 'replace-spare',
        hotkey: String(options.length + 1),
        label: `Replace with spare ${spareKey.replace('spare', '').replace(/s$/, '').toLowerCase()}`,
        detail: `Use one spare part to replace the ${brokenPart.toLowerCase()} without spending wood.`
      });
    }
    options.push({
      id: 'repair-wood',
      hotkey: String(options.length + 1),
      label: hasWood ? `Repair with lumber (${repairCost} wood)` : `Cannot repair (need ${repairCost} wood)`,
      detail: hasWood
        ? `Costs ${repairCost} wood bundle${repairCost === 1 ? '' : 's'}${carpenterBonus}. Restores wagon to rolling condition.`
        : `You need ${repairCost} wood. Forage or barter before repairing.`
    });
    options.push({
      id: 'forage-wood',
      hotkey: String(options.length + 1),
      label: 'Forage for timber',
      detail: 'Halt and search the brush for salvageable wood (+1-2 wood, advances 1 day).'
    });
    options.push({
      id: 'trade-spare',
      hotkey: String(options.length + 1),
      label: 'Barter for replacement parts',
      detail: 'Trade 2 food rations with passing emigrants for emergency wood.'
    });
    return {
      type: 'wagon-breakdown',
      eyebrow: 'Wagon breakdown',
      title: `${brokenPart} on the trail!`,
      body: `The wagon cannot roll forward until the ${brokenPart.toLowerCase()} is repaired. Choose how to handle the breakdown:`,
      context: { brokenPart, repairCost, spareKey },
      options
    };
  }

  function buildObstacleDecision(obstacle) {
    const surreal = obstacle.dilemmaType === 'surreal';
    return {
      type: 'obstacle-dilemma',
      eyebrow: surreal ? 'Reality rupture' : 'Trail dilemma',
      title: obstacle.description,
      body: surreal
        ? 'Choose how the party answers the impossible. Meta-engagement opens a text line in the terminal.'
        : 'Choose how the party responds. Each option solves the problem by spending a different resource.',
      context: { obstacle },
      options: obstacle.choices.map((choice, index) => ({
        id: choice.id,
        hotkey: String(index + 1),
        label: choice.label,
        approach: choice.approach,
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
    rememberObstacleHistory(state, state.activeObstacle);
    setDecision(buildObstacleDecision(state.activeObstacle));
  }

  function applyResourceDelta(wagon, resourceType, deltaUnits, maxUnits = Number.POSITIVE_INFINITY) {
    const key = resourceType === 'forage' || resourceType === 'herd' ? 'food' : resourceType;
    const current = wagon[key] ?? 0;
    if (deltaUnits <= 0) {
      const applied = Math.max(deltaUnits, -current);
      wagon[key] = Math.max(0, current + applied);
      return { applied, blocked: 0 };
    }

    const weightMap = { food: 1, water: 8, wood: 30, medicine: 0.5, ammunition: 3 };
    const unitWeight = weightMap[key] ?? 1;
    const freeCapacity = Math.max(0, WAGON_CAPACITY - wagonLoadWeight(wagon));
    const capacityLimit = unitWeight > 0 ? Math.floor(freeCapacity / unitWeight) : deltaUnits;
    const stockLimit = Math.max(0, maxUnits - current);
    const allowed = Math.max(0, Math.min(deltaUnits, capacityLimit, stockLimit));
    wagon[key] = current + allowed;
    return { applied: allowed, blocked: Math.max(0, deltaUnits - allowed) };
  }

  function getApplicableSurrealEffect(actionType) {
    const mutation = state.pendingSurrealEffect;
    if (!mutation) return null;
    const trigger = mutation.mechanicalEffect.trigger;
    const applies = trigger === 'next_action'
      || (trigger === 'next_travel' && actionType === 'press-on')
      || (trigger === 'next_camp' && actionType === 'camp');
    return applies ? mutation : null;
  }

  async function applyPendingSurrealEffect(actionType) {
    const mutation = getApplicableSurrealEffect(actionType);
    if (!mutation) return null;
    const { mechanicalEffect } = mutation;
    try {
      await appendEvent('surreal_effect_resolution', {
        mutationKey: mutation.mutationKey,
        title: mutation.title,
        actionType,
        mechanicalEffect,
        note: `${mutation.title} altered the ${actionType} outcome.`
      });
    } catch (error) {
      state.statusMessage = 'The trail could not seal the reality shift in the ledger; its gameplay effect remains pending.';
      console.error('Could not seal surreal gameplay effect', error);
      return null;
    }

    state.pendingSurrealEffect = null;
    applyPartyHealthDelta(state, mechanicalEffect.healthDelta, { status: 'Shaken' });
    state.wagon.morale = Math.max(0, Math.min(100, state.wagon.morale + mechanicalEffect.moraleDelta));
    applyResourceDelta(state.wagon, 'food', mechanicalEffect.foodDelta);
    applyResourceDelta(state.wagon, 'water', mechanicalEffect.waterDelta);
    applyResourceDelta(state.wagon, 'wood', mechanicalEffect.woodDelta);
    applyResourceDelta(state.wagon, 'medicine', mechanicalEffect.medicineDelta);
    state.statusMessage = `${state.statusMessage} Reality bends under ${mutation.title}: ${mutation.gameplayTwist}`;
    return mutation;
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
      strangenessLevel: getEffectiveStrangenessLevel(state),
      ...extraContext
    };
    state.lastActionContext = entry;
    state.actionHistory = [...state.actionHistory, entry].slice(-20);
    debugNarration(state, 'action:recorded', { actionType, outcome, strangenessLevel: getEffectiveStrangenessLevel(state), historyCount: state.actionHistory.length });
  }

  function buildDmDossier(state) {
    const pace = state.wagon?.pace ?? 'steady';
    const health = state.wagon?.health ?? 100;
    const morale = state.wagon?.morale ?? 100;
    const strangeness = getEffectiveStrangenessLevel(state);

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
      crewSentiment,
      outfittingProfile: state.outfittingProfile ?? 'No outfitting profile recorded.',
      entityMemory: (state.metaDialogueHistory ?? []).slice(-6).map((entry) =>
        `Day ${entry.day}: ${entry.approach}; the Operator replied "${entry.playerResponse}"`
      ),
      aiNotes: (state.dmDossierUpdates ?? []).slice(-6)
    };
  }

  function getNarrationContext() {
    const selectedTile = state.currentTrailSnapshot ?? fallbackTile;
    const currentMilestone = getCurrentMilestone(state);
    const nextLandmark = getNextMilestone(state)?.name ?? null;
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

    const selectedEra = getEraById(state.selectedEra);

    return {
      day: state.day,
      tileId: currentMilestone.id,
      locationName: locationDescriptor(currentMilestone.id, selectedTile.biome ?? 'unknown'),
      biome: selectedTile.biome ?? 'unknown',
      journeyPhase,
      journeyStartTile: START_TILE_ID,
      journeyEndTile: FINISH_TILE_ID,
      useLlmNarration: state.llmNarrationPreferred,
      selectedEra: {
        id: selectedEra.id,
        label: selectedEra.label,
        shortLabel: selectedEra.shortLabel,
        years: selectedEra.years
      },
      weather: selectedTile.weather ?? { rain: 0, tempC: 0, windKph: 0 },
      wagon: {
        ...state.wagon,
        cargoWeight: wagonLoadWeight(state.wagon),
        payloadTier: getCargoWeightTier(wagonLoadWeight(state.wagon))
      },
      party: (state.wagon.party ?? []).map((member) => ({
        id: member.id,
        name: member.name,
        role: member.role,
        gender: member.appearance?.gender ?? 'male',
        outfitSummary: summarizeMemberOutfit(member.appearance),
        health: member.health,
        status: member.status
      })),
      supplyEstimates: supplies,
      recentEvents: state.events.slice(0, 3).map((event) => ({
        eventType: event.eventType ?? 'world',
        payload: event.payload ?? {}
      })),
      lastAction: state.lastActionContext,
      justResolvedDecision: state.justResolvedDecision,
      historyLog: state.actionHistory,
      metaDialogueHistory: (state.metaDialogueHistory ?? []).slice(-12),
      pendingSurrealEffect: state.pendingSurrealEffect,
      priorNarration: state.narrationHistory.slice(-8),
      priorKeyPoints: state.storyKeyPoints.slice(-10),
      obstacleHistory: state.recentObstacleHistory
        .filter((entry) => state.day - entry.day <= 6)
        .slice(-6),
      strangenessLevel: getEffectiveStrangenessLevel(state),
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
      nextLandmark,
      nextMilestone: nextLandmark,
      isMajorLandmark,
      dmDossier: buildDmDossier(state),
      expeditionName: state.expeditionName,
      outfittingProfile: state.outfittingProfile ?? '',
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
      justResolvedDecision: context.justResolvedDecision,
      metaDialogueHistory: context.metaDialogueHistory,
      historyLog: (context.historyLog ?? []).slice(-8),
      priorNarration: (context.priorNarration ?? []).slice(-8),
      priorKeyPoints: (context.priorKeyPoints ?? []).slice(-8),
      obstacleHistory: context.obstacleHistory,
      strangenessLevel: context.strangenessLevel,
      pendingSurrealEffect: context.pendingSurrealEffect,
      distanceDescriptor: context.distanceDescriptor,
      activeObstacle: context.activeObstacle
    });
  }

  function buildRoutineNarration(context, reason = 'routine') {
    const location = context.locationName ?? context.biome ?? 'the trail';
    const activeRisks = Object.entries(context.riskState ?? {})
      .filter(([, value]) => value)
      .map(([key]) => key.replace(/([A-Z])/g, ' $1').toLowerCase());
    const pressureLine = activeRisks.length
      ? `The crew feels the immediate pressure of ${activeRisks.join(', ')}.`
      : context.weather.rain > 70
        ? 'Wet weather makes every sound close and every surface uncertain.'
        : context.weather.tempC < 0
          ? 'Cold settles into clothing and wagon fittings.'
          : 'The country keeps its silence beneath the open sky.';
    const firstName = context.party?.find((member) => member.status !== 'Dead')?.name;
    const characterLine = firstName
      ? `${firstName} watches the light move across the surrounding country.`
      : 'The crew watches the light move across the surrounding country.';
    const headline = reason === 'routine-travel'
      ? 'The trail opens west.'
      : reason === 'routine-camp'
        ? 'The country grows quiet.'
        : reason === 'routine-gather'
          ? 'Wind moves through the grass.'
          : 'The trail keeps moving.';
    const lines = [
      `${location} lies beneath a ${context.weather.tempC < 0 ? 'pale, cold' : 'wide, unsettled'} sky.`,
      characterLine,
      pressureLine
    ];

    return {
      source: 'deterministic',
      headline,
      lines,
      body: lines.join(' '),
      keyPoints: [`Atmosphere near ${location}`, pressureLine],
      obstacle: undefined,
      tone: 'plain'
    };
  }

  function getPreviousStrangenessLevel() {
    return state.actionHistory.at(-2)?.strangenessLevel ?? 0;
  }

  function getAiNarrationTrigger(context, stateKey) {
    if (!state.llmNarrationPreferred || !state.llmNarrationAvailable) {
      const latestActionType = context.lastAction?.actionType;
      const fallbackReason = latestActionType === 'press-on'
        ? 'routine-travel'
        : latestActionType === 'camp'
          ? 'routine-camp'
          : latestActionType === 'gather'
            ? 'routine-gather'
            : 'routine';
      return { key: `state:${stateKey}`, reason: fallbackReason };
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
    if (latestEventType === 'obstacle_resolution' || latestEventType === 'meta_dilemma_response') {
      return { key: `obstacle-resolution:${context.day}:${context.tileId}`, reason: 'encounter-resolution' };
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

  function getNarrativeUpdateKey(candidate) {
    return JSON.stringify([
      state.expeditionId,
      state.day,
      state.lastActionContext?.actionType ?? 'opening',
      candidate.headline ?? '',
      candidate.body ?? '',
      candidate.surrealMutation?.title ?? '',
      candidate.surrealMutation?.manifestation ?? '',
      candidate.dmDossierUpdate?.sentimentDelta ?? ''
    ]);
  }

  async function recordNarrativeUpdate(candidate) {
    if (candidate?.source !== 'llm') return candidate;
    const mutation = normalizeSurrealMutation(candidate.surrealMutation);
    const sentimentDelta = typeof candidate.dmDossierUpdate?.sentimentDelta === 'string'
      ? candidate.dmDossierUpdate.sentimentDelta.trim().slice(0, 300)
      : '';
    if (!mutation && !sentimentDelta) return candidate;

    const updateKey = getNarrativeUpdateKey(candidate);
    if (state.recordedNarrativeUpdateKeys.includes(updateKey)) {
      return { ...candidate, surrealMutation: undefined, dmDossierUpdate: undefined };
    }
    const mutationKey = mutation ? `${updateKey}:mutation` : '';
    const recordedMutation = mutation ? { ...mutation, mutationKey } : null;
    try {
      await appendEvent('dm_narrative_update', {
        updateKey,
        mutationKey: mutationKey || null,
        surrealMutation: recordedMutation,
        sentimentDelta: sentimentDelta || null,
        note: mutation
          ? `The DM recorded ${mutation.title}: ${mutation.gameplayTwist}`
          : `The DM dossier changed: ${sentimentDelta}`
      });
    } catch (error) {
      state.statusMessage = 'The AI narrative update could not be sealed in the ledger; its gameplay effect was withheld.';
      console.error('Could not seal AI narrative update', error);
      return { ...candidate, surrealMutation: undefined, dmDossierUpdate: undefined };
    }

    state.recordedNarrativeUpdateKeys.push(updateKey);
    if (sentimentDelta) {
      state.dmDossierUpdates = [...state.dmDossierUpdates, sentimentDelta].slice(-12);
    }
    if (mutation) {
      state.dmDossierUpdates = [
        ...state.dmDossierUpdates,
        `Reality mutation ${mutation.title}: ${mutation.gameplayTwist}`
      ].slice(-12);
    }
    return { ...candidate, surrealMutation: recordedMutation ?? undefined };
  }

  async function renderNarrationCandidate(candidate, shouldAutoPlay, stateKey) {
    state.narrationStateKey = stateKey;
    state.narrationInFlightKey = '';
    const recordedCandidate = await recordNarrativeUpdate(candidate ?? null);
    applyNarrationBeat(state, recordedCandidate);
    if (state.turnPhase !== 'resolving') {
      ui.setNarrationLoading(false, state);
    }
    ui.renderMap(state);
    ui.updateActionState(state);
    renderStoryPanel();
    syncObstacleDecision();
    audio.primeCloudNarrationCache(state.narrationText);
    if (state.justResolvedDecision) {
      state.justResolvedDecision = null;
    }
    if (shouldAutoPlay && state.narrationAutoPlay && state.turnPhase !== 'resolving') {
      await audio.playNarration();
    }
  }

  function renderStoryPanel() {
    const renderState = audio.getStoryRenderState();
    ui.renderStory(state, renderState);
    ui.setLocalReadAloudEnabled(!renderState.cloudNarrationEnabled && audio.isBrowserSpeechAvailable());
    if (renderState.useBrowserFallback) {
      audio.populateVoiceSelect(ui.getStoryVoiceSelect());
    }
    ui.renderHazardBanner(state);
  }

  async function loadNarrationAndCompleteTurn(shouldAutoPlay = true) {
    try {
      await loadNarration(shouldAutoPlay);
    } finally {
      if (state.turnPhase === 'resolving') {
        state.dispatchAutoPlayPending = shouldAutoPlay && state.narrationAutoPlay;
        state.turnPhase = 'results';
        if (state.activeDialogue) {
          state.activeDialogueShownAt = Date.now();
        }
        ui.setNarrationLoading(false, state);
        ui.renderMap(state);
        ui.refreshLandscapeCanvas?.(state);
        ui.updateActionState(state);
      }
    }
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
      void loadNarrationAndCompleteTurn(autoPlay);
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
      const response = await api.getEvents(200);
      const events = response.events ?? [];
      state.events = events.slice(0, 8);
      const expeditionEvents = events.filter((event) => event.payload?.expeditionId === state.expeditionId);
      state.metaDialogueHistory = expeditionEvents
        .filter((event) => event.eventType === 'meta_dilemma_response')
        .map((event) => ({
          day: event.payload?.day,
          prompt: event.payload?.prompt,
          playerResponse: event.payload?.playerResponse,
          approach: event.payload?.approach,
          choice: event.payload?.choice
        }))
        .filter((payload) =>
          Number.isInteger(payload.day) &&
          typeof payload.prompt === 'string' &&
          typeof payload.playerResponse === 'string' &&
          typeof payload.approach === 'string' &&
          typeof payload.choice === 'string'
        )
        .slice(0, 12)
        .reverse();
      const narrativeUpdates = expeditionEvents.filter((event) => event.eventType === 'dm_narrative_update');
      state.recordedNarrativeUpdateKeys = narrativeUpdates
        .map((event) => event.payload?.updateKey)
        .filter((key) => typeof key === 'string')
        .slice(0, 200);
      state.dmDossierUpdates = narrativeUpdates
        .slice(0, 12)
        .reverse()
        .flatMap((event) => [
          ...(typeof event.payload?.sentimentDelta === 'string' ? [event.payload.sentimentDelta] : []),
          ...(event.payload?.surrealMutation && typeof event.payload.surrealMutation.gameplayTwist === 'string'
            ? [`Reality mutation ${event.payload.surrealMutation.title}: ${event.payload.surrealMutation.gameplayTwist}`]
            : [])
        ])
        .slice(-12);
      const resolvedMutationKeys = new Set(
        expeditionEvents
          .filter((event) => event.eventType === 'surreal_effect_resolution')
          .map((event) => event.payload?.mutationKey)
          .filter((key) => typeof key === 'string')
      );
      const unresolvedMutationEvent = narrativeUpdates.find((event) => {
        const mutation = normalizeSurrealMutation(event.payload?.surrealMutation);
        return mutation && !resolvedMutationKeys.has(event.payload?.mutationKey);
      });
      state.pendingSurrealEffect = unresolvedMutationEvent
        ? normalizeSurrealMutation(unresolvedMutationEvent.payload.surrealMutation)
        : null;
      ui.renderEventLog(state.events);
    } catch (error) {
      state.events = [];
      ui.renderEventLog([]);
      console.error('Could not load shared ledger events', error);
    }
  }

  async function loadNarration(shouldAutoPlay = true) {
    const stateKey = getNarrationStateKey();
    const context = getNarrationContext();
    const remoteTrigger = getAiNarrationTrigger(context, stateKey);
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
    ui.setNarrationLoading(true, state);
    ui.renderMap(state);
    ui.updateActionState(state);
    try {
      const json = await api.getNarration(context);
      if (requestId !== state.narrationRequestId) {
        debugNarration(state, 'loadNarration:stale-response', { requestId, currentRequestId: state.narrationRequestId, stateKey });
        return;
      }
      const candidate = json?.narration;
      if (
        candidate &&
        state.latestNarration &&
        isNarrationDuplicate(candidate.body, state.latestNarration.body) &&
        !shouldAutoPlay &&
        !context.justResolvedDecision &&
        state.turnPhase !== 'resolving'
      ) {
        debugNarration(state, 'loadNarration:duplicate-body', {
          requestId,
          stateKey,
          previousBody: state.latestNarration.body,
          candidateBody: candidate.body,
          shouldAutoPlay
        });
        state.narrationInFlightKey = '';
        if (state.turnPhase === 'dispatch') {
          ui.setNarrationLoading(false, state);
          ui.renderMap(state);
          ui.updateActionState(state);
        }
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
      if (requestId === state.narrationRequestId && state.turnPhase !== 'resolving') {
        ui.setNarrationLoading(false, state);
      }
    }
  }

  async function appendEvent(eventType, payload) {
    const ledgerTileId = getCurrentMilestone(state).id;
    const maxAttempts = 5;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const latest = state.events[0];
      const response = await api.postEvent({
        prevHash: latest?.eventHash ?? null,
        tileId: ledgerTileId,
        eventType,
        payload: { ...payload, expeditionId: state.expeditionId, expeditionName: state.expeditionName }
      });

      if (response.status === 409) {
        if (attempt === maxAttempts) {
          throw new Error(`Event remained conflicted after ${maxAttempts} attempts`);
        }
        const refreshed = await api.getEvents(8);
        state.events = refreshed.events ?? [];
        ui.renderEventLog(state.events);
        await new Promise((resolve) => setTimeout(resolve, attempt * 30));
        continue;
      }

      if (!response.ok) {
        throw new Error(`Event failed: ${response.status}`);
      }

      const json = await response.json();
      state.events = [json, ...state.events.filter((event) => event.eventHash !== json.eventHash)].slice(0, 8);
      ui.renderEventLog(state.events);
      return json;
    }

    throw new Error(`Event failed after ${maxAttempts} attempts`);
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
    state.statusMessage = `${state.expeditionName} lost the wagon: ${reason}. The trail has claimed another party.`;
    state.wagon.status = 'Wagon lost';
    ui.renderStatusBanner(state);
    ui.renderWagonState(state);
    ui.renderObjective(state);
    applyNarrationBeat(state, {
      headline: 'The trail has claimed this wagon.',
      body: `${currentLocationName()} lies beneath a dim and empty sky. The wind moves over the abandoned trail without finding a voice.`
    });
    renderStoryPanel();
    ui.updateActionState(state);
  }

  function handleJourneyArrival() {
    state.journeyCompleted = true;
    state.wagon.status = 'Arrived at the valley settlement';
    state.statusMessage = `${state.expeditionName} reached Willamette Valley. The crossing is complete, but your settlement choices still matter.`;
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
      steady: { food: 0, water: 0, health: 0, breakdown: 0.05, fatigue: 1 },
      strenuous: { food: 1, water: 1, health: 1, breakdown: 0.11, fatigue: 3 },
      grueling: { food: 2, water: 2, health: 3, breakdown: 0.18, fatigue: 5 }
    }[wagon.pace] ?? { food: 0, water: 0, health: 0, breakdown: 0.05, fatigue: 1 };
    const rationProfile = {
      filling: { foodScale: 1.1, health: 0, morale: 1 },
      normal: { foodScale: 1, health: 0, morale: 0 },
      meager: { foodScale: 0.8, health: 1, morale: -1 }
    }[wagon.rations] ?? { foodScale: 1, health: 0, morale: 0 };
    let foodDrain = actionLabel === 'travel' ? 10 : 8;
    let waterDrain = actionLabel === 'travel' ? 4 : 2;

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
    if (repeatCount >= 2 && (actionLabel === 'hunt' || actionLabel === 'camp')) foodDrain += 1;

    foodDrain = Math.max(1, Math.round((foodDrain + paceProfile.food) * rationProfile.foodScale));
    waterDrain = Math.max(1, Math.round(waterDrain + paceProfile.water));
    wagon.food = Math.max(0, wagon.food - foodDrain);
    wagon.water = Math.max(0, wagon.water - waterDrain);
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
    const clothingProtection = tempC < 0
      ? Math.min(4, wagon.clothingSets ?? 0) * 2
      : rain > 70
        ? Math.min(4, wagon.clothingSets ?? 0)
        : 0;
    applyPartyHealthDelta(state, -Math.max(0, weatherHealthPenalty + biomeHealthPenalty + paceProfile.health + rationProfile.health - clothingProtection), {
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

    const loadTier = getCargoWeightTier(wagonLoadWeight(wagon));
    if (actionLabel === 'travel') {
      const loadFatigue = loadTier === 'overburdened' ? 4 : loadTier === 'nominal' ? 2 : 0;
      wagon.oxenFatigue = Math.min(100, wagon.oxenFatigue + paceProfile.fatigue + loadFatigue);
    } else if (actionLabel === 'camp') {
      wagon.oxenFatigue = Math.max(0, wagon.oxenFatigue - (getRoleHolder(state, 'Carpenter') ? 18 : 12));
    }

    const afflictionNote = maybeAfflictParty(tile);
    if (afflictionNote) {
      state.statusMessage = `${state.statusMessage} ${afflictionNote}`.trim();
    }

    if (actionLabel === 'travel' && !wagon.wagonParts.brokenPart) {
      const terrainBonus = biome === 'mountain' || biome === 'badlands' ? 0.18 : 0;
      const loadPenalty = loadTier === 'overburdened' ? 0.08 : loadTier === 'light' ? -0.03 : 0;
      const carpenter = getRoleHolder(state, 'Carpenter');
      const carpenterProtection = carpenter ? 0.05 : 0;
      const failureChance = Math.max(0.01, paceProfile.breakdown + terrainBonus + loadPenalty + wagon.oxenFatigue / 1000 - carpenterProtection);
      if (Math.random() < failureChance) {
        const failureRoll = Math.random();
        const partKey = failureRoll < 0.34 ? 'axle' : failureRoll < 0.67 ? 'wheels' : 'tongue';
        const spareKey = partKey === 'axle' ? 'spareAxles' : partKey === 'wheels' ? 'spareWheels' : 'spareTongues';
        const partName = partKey === 'axle' ? 'Broken axle' : partKey === 'wheels' ? 'Shattered wheel' : 'Broken wagon tongue';
        if (carpenter && wagon[spareKey] > 0) {
          wagon[spareKey] -= 1;
          wagon.wagonParts[partKey] = 100;
          wagon.status = `${carpenter.name} replaced the ${partKey}`;
          state.statusMessage = `${state.statusMessage} ${carpenter.name} fitted a spare ${partKey} before the wagon could be stranded.`;
        } else {
          wagon.wagonParts.brokenPart = partName;
          wagon.wagonParts[partKey] = Math.max(0, wagon.wagonParts[partKey] - 35);
          wagon.status = partName;
          state.statusMessage = `${state.statusMessage} ${partName} left the wagon stranded until repaired.`;
          setDecision(buildBreakdownDecision(wagon.wagonParts.brokenPart));
        }
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
      day: state.day,
      health: wagon.health,
      morale: wagon.morale,
      food: supplies.foodRations,
      water: supplies.waterGallons,
      wood: supplies.firewoodBundles,
      medicine: supplies.medicineDoses,
      ammunition: supplies.ammunitionBoxes,
      cash: wagon.cash,
      cargoWeight: wagonLoadWeight(wagon),
      oxenFatigue: wagon.oxenFatigue,
      axle: wagon.wagonParts.axle,
      wheels: wagon.wagonParts.wheels,
      tongue: wagon.wagonParts.tongue,
      milesTraveled: state.milesTraveled,
      partyVitals: (wagon.party ?? []).map((member) => ({
        id: member.id,
        name: member.name,
        health: member.health,
        status: member.status
      }))
    };
  }

  function setActionSummary(actionType, beforeSnapshot, { awaitingDispatch = true } = {}) {
    const afterSnapshot = createWagonSummarySnapshot(state.wagon);
    const metricConfig = [
      { key: 'day', label: 'Days elapsed', suffix: ' days', invertTone: true },
      { key: 'health', label: 'Health', suffix: '' },
      { key: 'morale', label: 'Morale', suffix: '' },
      { key: 'food', label: 'Food', suffix: ' rations' },
      { key: 'water', label: 'Water', suffix: ' gal' },
      { key: 'wood', label: 'Wood', suffix: ' bundles' },
      { key: 'medicine', label: 'Medicine', suffix: ' doses' },
      { key: 'ammunition', label: 'Ammo', suffix: ' boxes' },
      { key: 'cash', label: 'Cash', suffix: '$', money: true },
      { key: 'cargoWeight', label: 'Cargo load', suffix: ' lbs', invertTone: true },
      { key: 'oxenFatigue', label: 'Oxen fatigue', suffix: '%', invertTone: true },
      { key: 'axle', label: 'Axle integrity', suffix: '%' },
      { key: 'wheels', label: 'Wheel integrity', suffix: '%' },
      { key: 'tongue', label: 'Tongue integrity', suffix: '%' },
      { key: 'milesTraveled', label: 'Distance', suffix: ' mi' }
    ];
    const metrics = metricConfig
      .map((metric) => {
        const delta = afterSnapshot[metric.key] - beforeSnapshot[metric.key];
        if (!delta) {
          return null;
        }
        const formattedDelta = metric.money
          ? `${delta > 0 ? '+' : '-'}$${Math.abs(delta).toFixed(2)}`
          : `${delta > 0 ? '+' : ''}${delta}${metric.suffix}`;
        return {
          label: metric.label,
          delta: formattedDelta,
          tone: (delta > 0) !== Boolean(metric.invertTone) ? 'positive' : 'negative'
        };
      })
      .filter(Boolean);
    const beforeParty = new Map((beforeSnapshot.partyVitals ?? []).map((member) => [member.id, member]));
    for (const member of afterSnapshot.partyVitals) {
      const previous = beforeParty.get(member.id);
      if (!previous) continue;
      const healthDelta = member.health - previous.health;
      if (healthDelta) {
        metrics.push({
          label: `${member.name} health`,
          delta: `${healthDelta > 0 ? '+' : ''}${healthDelta} HP`,
          tone: healthDelta > 0 ? 'positive' : 'negative'
        });
      }
      if (member.status !== previous.status) {
        metrics.push({
          label: `${member.name} status`,
          delta: `${previous.status} -> ${member.status}`,
          tone: 'neutral'
        });
      }
    }

    state.lastActionSummary = {
      actionType,
      title: describeAction(actionType),
      location: currentLocationName(),
      detail: state.statusMessage,
      metrics: metrics.length ? metrics : [{ label: 'Outcome', delta: 'No immediate wagon change', tone: 'neutral' }]
    };
    state.turnPhase = awaitingDispatch ? 'resolving' : 'results';
    if (awaitingDispatch) {
      ui.setNarrationLoading(true, state);
    }
    ui.renderActionSummary(state);
  }

  async function handleTileSelection(id) {
    void id;
  }

  async function handleAction(actionType, context = {}) {
    if (state.gameOver || !state.journeyStarted || state.journeyLoading || state.actionInProgress || state.turnPhase === 'results' || state.turnPhase === 'resolving') return;
    if (state.journeyCompleted && actionType === 'press-on') return;
    if (state.activeDecision && !context.fromDecision) return;
    if (actionType === 'press-on' && !context.riverChoice && state.riverCrossingAnimation?.phase === 'departed') {
      state.riverCrossingAnimation = null;
    }
    if (actionType === 'press-on' && state.wagon.oxenYokes < 2) {
      state.statusMessage = 'The wagon needs at least 2 yokes (4 oxen) before it can move.';
      ui.renderStatusBanner(state);
      ui.renderMap(state);
      return;
    }
    if (actionType === 'press-on' && wagonLoadWeight(state.wagon) > WAGON_CAPACITY) {
      state.statusMessage = 'The wagon is overloaded. Reduce cargo before pressing on.';
      ui.renderStatusBanner(state);
      ui.renderMap(state);
      return;
    }

    state.actionInProgress = true;
    state.activeDialogue = null;
    state.activeDialogueShownAt = 0;
    const shouldAutoPlayNarration = actionType === 'press-on';
    ui.updateActionState(state);

    try {
      syncTrailProgress();
      const selectedTile = state.currentTrailSnapshot ?? fallbackTile;
      const availableOptionsAtStop = getAvailableActionOptions();
      const repeatCount = recentActionCount(actionType, 3);
      const { wagon } = state;
      const beforeSummarySnapshot = context.beforeSummarySnapshot ?? createWagonSummarySnapshot(wagon);
      syncWagonHealthFromParty(state);
      if (wagon.health <= 0) {
        handleWagonFailure('the crew collapsed under the accumulated strain');
        recordActionHistory(actionType, 'failed', availableOptionsAtStop);
        setActionSummary(actionType, beforeSummarySnapshot);
        ui.renderMap(state);
        queueNarrationRefresh(shouldAutoPlayNarration);
        return;
      }

      if (wagon.wagonParts.brokenPart && actionType === 'press-on') {
        const repairSpeaker = getRoleHolder(state, 'Carpenter') ?? randomLivingMember();
        state.activeDialogue = repairSpeaker
          ? {
              speakerId: repairSpeaker.id,
              speakerName: repairSpeaker.name,
              speakerRole: repairSpeaker.role,
              targetType: 'party',
              text: `Hold the team! That ${wagon.wagonParts.brokenPart.toLowerCase()} needs mending before we roll another mile.`
            }
          : null;
        state.activeDialogueShownAt = state.activeDialogue ? Date.now() : 0;
        state.statusMessage = `The wagon cannot move until the ${wagon.wagonParts.brokenPart.toLowerCase()} is repaired.`;
        setDecision(buildBreakdownDecision(wagon.wagonParts.brokenPart));
        ui.renderStatusBanner(state);
        ui.updateActionState(state);
        recordActionHistory(actionType, 'blocked', availableOptionsAtStop);
        setActionSummary(actionType, beforeSummarySnapshot, { awaitingDispatch: false });
        ui.renderMap(state);
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
        if (previousMilestone.id === 'the-dalles' && !state.dallesRouteChoice) {
          const forkSpeaker = getRoleHolder(state, 'Guide') ?? randomLivingMember();
          state.activeDialogue = forkSpeaker
            ? {
                speakerId: forkSpeaker.id,
                speakerName: forkSpeaker.name,
                speakerRole: forkSpeaker.role,
                targetType: 'party',
                text: 'The Dalles lies right ahead—we must choose between the Barlow toll road and the Columbia raft.'
              }
            : null;
          state.activeDialogueShownAt = state.activeDialogue ? Date.now() : 0;
          setDecision(buildDallesRouteDecision());
          state.statusMessage = 'The Dalles presents the final fork: pay for the Barlow Road or risk the Columbia River.';
          ui.renderStatusBanner(state);
          ui.renderMap(state);
          return;
        }
        const pendingTravelMutation = getApplicableSurrealEffect(actionType);
        const baseCalculatedMiles = calculateTravelMiles(selectedTile);
        const mutationMiles = pendingTravelMutation?.mechanicalEffect.travelMilesDelta ?? 0;
        let milesGained = Math.min(
          Math.max(1, baseCalculatedMiles + mutationMiles),
          TOTAL_TRAIL_MILES - previousMiles
        );
        const riverMilestone = context.riverContext
          ? state.tileMap.find((milestone) => milestone.id === context.riverContext.nextTileId)
          : null;
        const destinationName = riverMilestone?.name ?? nextMilestone?.name ?? 'Willamette Valley';

        const reachingRiver = !riverMilestone
          && nextMilestone
          && nextMilestone.id !== 'the-dalles'
          && nextMilestone.biome === 'river'
          && (previousMiles + milesGained >= nextMilestone.mile);

        if (reachingRiver && !context.riverChoice) {
          state.milesTraveled = nextMilestone.mile;
          syncTrailProgress();
          await appendEvent('milestone_arrival', {
            milestoneId: nextMilestone.id,
            milestoneName: nextMilestone.name,
            milesTraveled: state.milesTraveled,
            note: `${state.expeditionName} reached ${nextMilestone.name} after ${state.milesTraveled} miles; river crossing remains ahead.`
          });
          const riverData = nextMilestone.river ?? { depthFt: 2.8, flowRate: 180 };
          const riverSpeaker = getRoleHolder(state, 'Guide') ?? randomLivingMember();
          state.activeDialogue = riverSpeaker
            ? {
                speakerId: riverSpeaker.id,
                speakerName: riverSpeaker.name,
                speakerRole: riverSpeaker.role,
                targetType: 'party',
                text: `The water at ${destinationName} is ${riverData.depthFt} feet deep—we need to decide how to cross.`
              }
            : null;
          state.activeDialogueShownAt = state.activeDialogue ? Date.now() : 0;
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
        if (context.riverChoice === 'ferry' || context.riverChoice === 'guide') {
          const ferryFare = riverFerryFare(riverMilestone?.id ?? nextMilestone?.id ?? '');
          if (wagon.cash < ferryFare) {
            state.statusMessage = `The ferry requires $${ferryFare.toFixed(2)}; only $${wagon.cash.toFixed(2)} remains. Choose another crossing.`;
            const river = riverMilestone ?? nextMilestone;
            setDecision(buildRiverDecision(actionType, river?.id ?? '', 'west', destinationName, river?.river ?? { depthFt: 2.8, flowRate: 180 }));
            return;
          }
          wagon.cash -= ferryFare;
          const service = context.riverChoice === 'guide' ? 'local river guide' : 'ferry';
          riverOutcomeFeedback = `You paid $${ferryFare.toFixed(2)} for a ${service} and crossed ${destinationName} without risking the wagon or spending provisions.`;
        }
        if (context.riverChoice) {
          const riverSnapshot = riverMilestone?.river ?? nextMilestone?.river ?? { depthFt: 2.8, flowRate: 180 };
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
        const appliedMutation = await applyPendingSurrealEffect(actionType);
        if (pendingTravelMutation && !appliedMutation) {
          milesGained = Math.min(Math.max(1, baseCalculatedMiles), TOTAL_TRAIL_MILES - previousMiles);
        }
        ui.renderWagonState(state);
        ui.renderStatusBanner(state);
        ui.updateActionState(state);
        if (context.riverChoice && context.riverContext) {
          await animateRiverCrossing(context.riverChoice);
        } else {
          await playWagonAnimation();
        }

        const actualMilesGained = context.riverContext ? Math.max(5, Math.round(milesGained / 2)) : milesGained;
        if (context.riverChoice && riverMilestone) {
          state.milesTraveled = Math.min(TOTAL_TRAIL_MILES, riverMilestone.mile + actualMilesGained);
        } else {
          state.milesTraveled = Math.min(TOTAL_TRAIL_MILES, previousMiles + milesGained);
        }
        syncTrailProgress();
        const arrivedMilestone = getCurrentMilestone(state);
        const crossedMilestone = arrivedMilestone.id !== previousMilestone.id ? arrivedMilestone : null;

        wagon.status = 'Traversing the trail';
        const travelSummary = crossedMilestone
          ? `You covered ${milesGained} miles and reached ${arrivedMilestone.name}.`
          : `You covered ${milesGained} miles west toward ${destinationName}. ${getMilesToNextMilestone(state)} miles remain to the next landmark.`;
        state.statusMessage = riverOutcomeFeedback ? `${riverOutcomeFeedback} ${travelSummary}` : travelSummary;
        await appendEvent('travel', {
          fromTileId: previousMilestone.id,
          toTileId: arrivedMilestone.id,
          direction: 'west',
          milesGained: actualMilesGained,
          milesTraveled: state.milesTraveled,
          note: crossedMilestone
            ? `${state.expeditionName} covered ${actualMilesGained} miles and arrived at ${arrivedMilestone.name}.`
            : `${state.expeditionName} covered ${actualMilesGained} miles west through ${selectedTile.biome || 'the trail'}.`
        });
        if (context.riverContext) {
          await appendEvent('river_crossing', {
            riverId: context.riverContext.nextTileId,
            riverName: context.riverContext.destinationName,
            crossingMethod: context.riverChoice,
            farePaid: ['ferry', 'guide'].includes(context.riverChoice) ? riverFerryFare(context.riverContext.nextTileId) : 0,
            note: riverOutcomeFeedback
          });
        }
        applyTurnPressure('travel', selectedTile, repeatCount);
        if (crossedMilestone && trailLandmarks[arrivedMilestone.id]) {
          await appendEvent('milestone_arrival', {
            milestoneId: arrivedMilestone.id,
            milestoneName: arrivedMilestone.name,
            milesTraveled: state.milesTraveled,
            note: `${state.expeditionName} reached ${arrivedMilestone.name} after ${state.milesTraveled} miles on the trail.`
          });
        }
        if (state.journeyCompleted && !state.gameOver) {
          handleJourneyArrival();
        }
        recordActionHistory(actionType, 'completed', availableOptionsAtStop, {
          milesGained: actualMilesGained,
          milesTraveled: state.milesTraveled,
          arrivedMilestoneName: crossedMilestone?.name,
          nextMilestoneName: getNextMilestone(state)?.name ?? 'Willamette Valley',
          milesToNextMilestone: getMilesToNextMilestone(state),
          riverChoice: context.riverChoice,
          riverOutcome: riverOutcomeFeedback
        });
        setActionSummary(actionType, beforeSummarySnapshot);
        ui.renderMap(state);
        ui.renderWagonState(state);
        ui.renderObjective(state);
        ui.renderStatusBanner(state);
        ui.renderHazardBanner(state);
        ui.renderSelectedTile(state.currentTrailSnapshot ?? selectedTile);
        await loadEvents();
        await loadNarrationAndCompleteTurn(shouldAutoPlayNarration);
        ui.updateActionState(state);
        return;
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
        const guideForageBonus = resourceType === 'forage' && getRoleHolder(state, 'Guide') ? 2 : 0;
        const amount = Math.max(2, 8 + biomeBonus + guideForageBonus - rainPenalty - repeatedPenalty);
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
      const campRecovery = Math.max(5, 12 - campPenalty + (getRoleHolder(state, 'Doctor') ? 4 : 0));
      applyTurnPressure('camp', selectedTile, repeatCount);
      if (state.gameOver) {
        recordActionHistory(actionType, 'failed', availableOptionsAtStop);
        setActionSummary(actionType, beforeSummarySnapshot);
        ui.renderMap(state);
        queueNarrationRefresh(shouldAutoPlayNarration);
        return;
      }
      applyPartyHealthDelta(state, campRecovery);
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
    const guideBonus = getRoleHolder(state, 'Guide') ? 0.1 : 0;
    const biomeBonus = selectedTile.biome === 'plains' || selectedTile.biome === 'grassland' ? 3 : 0;
    const weatherPenalty = (selectedTile.weather?.windKph ?? 0) > 30 ? 2 : 0;
    const repeatedPenalty = Math.min(7, repeatCount * 3);
    const successRoll = Math.random() <= Math.min(0.95, targetConfig.success + guideBonus);
    const foodGain = successRoll ? Math.max(2, targetConfig.yield + biomeBonus + (guideBonus ? 3 : 0) - weatherPenalty - repeatedPenalty - targetConfig.weightPenalty) : 0;
    const gain = applyResourceDelta(wagon, 'forage', foodGain);
    wagon.morale = Math.min(100, wagon.morale + Math.max(1, 5 - repeatCount));
    wagon.status = 'Hunting for provisions';
    if (successRoll) {
      const guide = getRoleHolder(state, 'Guide') ?? randomLivingMember();
      const hunterName = guide ? guide.name : 'The hunting party';
      state.statusMessage = `${hunterName} brought down ${context.huntTarget} with a clean shot and returned with ${gain.applied} rations.`;
    } else {
      const youth = getRoleHolder(state, 'Youth');
      if (youth && Math.random() < 0.65) {
        setPartyCondition(state, youth.id, 'Injured');
        applyPartyHealthDelta(state, -10, { memberId: youth.id, status: 'Injured' });
        state.statusMessage = `The ${context.huntTarget} slipped away after ${youth.name} tripped in the brush and hurt their ankle. They are now injured and need medicine.`;
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
      const hasDoctor = Boolean(getRoleHolder(state, 'Doctor'));
      const medicineCost = hasDoctor ? (wagon.doctorTreatments % 2 === 0 ? 1 : 0) : 1;
      if (medicineCost) applyResourceDelta(wagon, 'medicine', -medicineCost);
      if (hasDoctor) wagon.doctorTreatments += 1;
        applyTurnPressure('treat', selectedTile, repeatCount);
        if (state.gameOver) {
        recordActionHistory(actionType, 'failed', availableOptionsAtStop);
          setActionSummary(actionType, beforeSummarySnapshot);
          ui.renderMap(state);
          queueNarrationRefresh(shouldAutoPlayNarration);
          return;
        }
      applyPartyHealthDelta(state, 18 + doctorHealBonus(), { memberId: patient.id });
      patient.status = 'Healthy';
      wagon.status = 'Treated illness';
      state.statusMessage = `${patient.name} steadied after treatment from the medical kit.`;
      await appendEvent('treat_illness', {
        medicineUsed: medicineCost,
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
          setActionSummary(actionType, beforeSummarySnapshot);
          ui.renderMap(state);
          queueNarrationRefresh(shouldAutoPlayNarration);
          return;
        }
      }
    }

      if (actionType === 'repair') {
        if (state.activeDecision?.type === 'wagon-breakdown') {
          clearDecision({ render: false });
        }
        const repaired = wagon.wagonParts.brokenPart;
        if (context.useSpare && repaired) {
          const partKey = repaired.toLowerCase().includes('axle')
            ? 'axle'
            : repaired.toLowerCase().includes('wheel')
              ? 'wheels'
              : 'tongue';
          const spareKey = partKey === 'axle' ? 'spareAxles' : partKey === 'wheels' ? 'spareWheels' : 'spareTongues';
          if (wagon[spareKey] > 0) {
            wagon[spareKey] -= 1;
            wagon.wagonParts[partKey] = 100;
            wagon.wagonParts.brokenPart = null;
            wagon.status = 'Wagon repaired with a spare';
            state.statusMessage = `The spare ${partKey} replaced the broken part and returned the wagon to the trail.`;
            await appendEvent('repair', { repairedPart: repaired, sparePartUsed: spareKey, note: state.statusMessage });
          } else {
            state.statusMessage = `No spare ${partKey} remains.`;
            setDecision(buildBreakdownDecision(repaired));
            return;
          }
        } else {
          const repairCost = breakdownRepairCost();
          if (wagon.wood < repairCost) {
            state.statusMessage = `Repairing the wagon needs ${repairCost} wood bundles.`;
          } else {
            applyResourceDelta(wagon, 'wood', -repairCost);
            wagon.wagonParts.axle = Math.min(100, wagon.wagonParts.axle + 30);
            wagon.wagonParts.wheels = Math.min(100, wagon.wagonParts.wheels + 30);
            wagon.wagonParts.tongue = Math.min(100, wagon.wagonParts.tongue + 30);
            wagon.wagonParts.brokenPart = null;
            wagon.status = 'Wagon repaired';
            state.statusMessage = repaired
              ? `You repaired the ${repaired.toLowerCase()} using ${repairCost} wood bundle${repairCost === 1 ? '' : 's'}.`
              : `You reinforced the wagon with ${repairCost} wood bundle${repairCost === 1 ? '' : 's'}.`;
            await appendEvent('repair', {
              repairedPart: repaired ?? 'preventive maintenance',
              woodSpent: repairCost,
              note: repaired ? `${state.expeditionName} repaired ${repaired.toLowerCase()} with trail lumber.` : 'Performed preventive wagon repairs.'
            });
          }
        }
        applyTurnPressure('camp', selectedTile, repeatCount);
      }

      if (actionType === 'trade') {
        const fortId = getCurrentMilestone(state).id;
        const isFort = ['fort-kearny', 'fort-laramie', 'fort-bridger'].includes(fortId);
        if (isFort) {
          if (!context.fortItemKey) {
            const storeDecision = buildFortResupplyDecision(fortId);
            if (storeDecision.options.length) {
              setDecision(storeDecision);
              return;
            }
            state.statusMessage = storeDecision.body;
          } else {
            const item = OUTFITTING_CATALOG.find((entry) => entry.key === context.fortItemKey);
            const bindings = {
              foodSacks: { wagonKey: 'food', quantity: 25 },
              waterCasks: { wagonKey: 'water', quantity: 10 },
              firewoodBundles: { wagonKey: 'wood', quantity: 1 },
              ammunitionBoxes: { wagonKey: 'ammunition', quantity: 1 },
              medicalKits: { wagonKey: 'medicine', quantity: 4 },
              spareAxles: { wagonKey: 'spareAxles', quantity: 1 },
              spareWheels: { wagonKey: 'spareWheels', quantity: 1 },
              spareTongues: { wagonKey: 'spareTongues', quantity: 1 }
            };
            const binding = item ? bindings[item.key] : null;
            if (!item || !binding) {
              state.statusMessage = 'That item is not stocked at this fort.';
            } else {
              const price = item.price * storeMarkup(fortId);
              const freeCapacity = WAGON_CAPACITY - wagonLoadWeight(wagon);
              if (wagon.cash < price) {
                state.statusMessage = `The item costs $${price.toFixed(2)}, but only $${wagon.cash.toFixed(2)} remains.`;
              } else if (item.cargoWeight > freeCapacity) {
                state.statusMessage = `There is not enough cargo room for ${item.name.toLowerCase()}.`;
              } else {
                let purchaseSucceeded = false;
                if (binding.wagonKey.startsWith('spare')) {
                  wagon[binding.wagonKey] += binding.quantity;
                  purchaseSucceeded = true;
                } else {
                  const result = applyResourceDelta(wagon, binding.wagonKey, binding.quantity);
                  purchaseSucceeded = result.applied === binding.quantity;
                }
                if (purchaseSucceeded) {
                  wagon.cash -= price;
                  state.statusMessage = `${state.expeditionName} bought ${item.name.toLowerCase()} at ${storeMarkup(fortId)}x the Independence price for $${price.toFixed(2)}.`;
                  await appendEvent('fort_purchase', {
                    fortId,
                    item: item.key,
                    price,
                    cashRemaining: wagon.cash,
                    note: state.statusMessage
                  });
                } else {
                  state.statusMessage = `The wagon could not carry ${item.name.toLowerCase()}.`;
                }
              }
            }
          }
        } else {
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
        }
        applyTurnPressure('trade', selectedTile, repeatCount);
      }

    if (actionType === 'scout') {
      const nextMilestone = getNextMilestone(state);
      const nextSnapshot = nextMilestone ? getTrailSnapshot({ ...state, milesTraveled: nextMilestone.mile }) : null;
      const guide = getRoleHolder(state, 'Guide');
      const guideName = guide?.name ?? 'The guide';
      applyTurnPressure('gather', selectedTile, repeatCount);
      wagon.status = 'Scouting ahead';
      wagon.morale = Math.min(100, wagon.morale + 2);
      state.statusMessage = nextMilestone && nextSnapshot
        ? `${guideName} scouts ahead: ${nextMilestone.name} lies ${getMilesToNextMilestone(state)} miles west through ${nextSnapshot.biome}, with rain near ${Math.round(nextSnapshot.weather?.rain ?? 0)}%.`
        : `${guideName} scouts ahead and sees only the last miles into the valley.`;
      await appendEvent('scout', {
        milestoneId: nextMilestone?.id ?? null,
        milestoneName: nextMilestone?.name ?? 'Willamette Valley',
        note: state.statusMessage
      });
    }

      await applyPendingSurrealEffect(actionType);
      if (actionType !== 'press-on') {
        await playWagonAnimation(2400);
      }
      const skippedConsequenceNote = applySkippedActionConsequences(actionType, availableOptionsAtStop, selectedTile);
    if (skippedConsequenceNote) {
      state.statusMessage = `${state.statusMessage} ${skippedConsequenceNote}`.trim();
    }

      await processPartyDeaths();

      if (state.gameOver) {
        recordActionHistory(actionType, 'failed', availableOptionsAtStop);
        setActionSummary(actionType, beforeSummarySnapshot);
        ui.renderMap(state);
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
      ui.renderMap(state);
      await loadEvents();
      await loadNarrationAndCompleteTurn(shouldAutoPlayNarration);
      ui.updateActionState(state);
    } finally {
      stopWagonAnimation();
      state.actionInProgress = false;
      ui.renderWagonState(state);
      ui.updateActionState(state);
    }
  }

  async function generateOpeningPrologue() {
    if (state.journeyLoading || state.setupStage !== 'prologue') return;
    state.turnPhase = 'prologue';
    state.journeyStarted = false;
    state.prologueHeadline = '';
    state.prologueParagraphs = [];
    state.prologueReady = false;
    state.setupError = '';
    const startingStrangenessRoll = state.strangenessLevelOverride
      ?? Math.floor(Math.random() * (MAX_STRANGENESS_LEVEL + 1));
    state.strangenessLevel = startingStrangenessRoll;
    ui.hideJourneyModal();
    state.journeyLoading = true;
    ui.setJourneyLoading(true, 'prologue');
    ui.syncJourneyControls(state);
    let prologueReady = false;
    try {
      await loadWorld({ includeNarration: false, includeEvents: false, includeNarrationAudio: false });
      await loadEvents();
      const genesisResponse = await api.getNarration({
        ...getNarrationContext(),
        promptType: 'prologue-genesis',
        startingStrangenessRoll,
        strangenessLevel: startingStrangenessRoll
      });
      const genesis = genesisResponse?.narration;
      const paragraphs = Array.isArray(genesis?.prologueParagraphs)
        ? genesis.prologueParagraphs.map((paragraph) => String(paragraph).trim()).filter(Boolean)
        : [];
      const openingText = paragraphs[0]?.slice(-500) ?? '';
      const leadsIntoStore = /Independence General Store/i.test(openingText)
        && /Independence, Missouri/i.test(openingText)
        && /\b1848\b/.test(openingText)
        && /\bready to choose\b/i.test(openingText);
      if (paragraphs.length !== 1 || !String(genesis?.headline ?? '').trim() || !leadsIntoStore) {
        throw new Error('The opening prologue did not end at the Independence General Store.');
      }
      state.prologueHeadline = String(genesis.headline).trim();
      state.prologueParagraphs = paragraphs;
      state.prologueDialogue = extractDialogueFromNarration(genesis, state);
      state.activeDialogue = state.prologueDialogue;
      state.prologueReady = true;
      prologueReady = true;
    } catch (error) {
      state.setupStage = 'register';
      state.turnPhase = 'dispatch';
      state.setupError = 'The opening story could not be prepared. Check the connection and confirm the roster to try again.';
      console.error('Could not generate the opening prologue', error);
    } finally {
      state.journeyLoading = false;
      ui.setJourneyLoading(false);
      ui.syncJourneyControls(state);
      if (prologueReady) {
        ui.renderMap(state);
      } else {
        ui.showJourneyModal(state);
      }
      ui.updateActionState(state);
    }
  }

  async function beginJourney() {
    if (state.journeyLoading || state.setupStage !== 'outfitting' || !state.prologueReady) return;
    const startingBudget = getStartingCashForState(state);
    const totals = getOutfittingTotals(state.outfittingCart);
    if (state.outfittingCart.oxenYokes < 2) {
      state.setupError = 'At least 2 yokes (4 oxen) are required to pull the wagon.';
      ui.updateOutfittingCart(state);
      return;
    }
    if (totals.cost > startingBudget) {
      state.setupError = `The cart is $${(totals.cost - startingBudget).toFixed(2)} over budget. Remove provisions before departure.`;
      ui.updateOutfittingCart(state);
      return;
    }
    if (totals.cargoWeight > WAGON_CAPACITY) {
      state.setupError = `The cart exceeds the 2,400 lb cargo limit by ${Math.ceil(totals.cargoWeight - WAGON_CAPACITY)} lbs.`;
      ui.updateOutfittingCart(state);
      return;
    }

    const cart = state.outfittingCart;
    const wagon = state.wagon;
    wagon.cash = startingBudget - totals.cost;
    wagon.oxenYokes = cart.oxenYokes;
    wagon.oxen = cart.oxenYokes * 2;
    wagon.oxenFatigue = 0;
    wagon.food = cart.foodSacks * 25;
    wagon.water = cart.waterCasks * 10;
    wagon.wood = cart.firewoodBundles;
    wagon.ammunition = cart.ammunitionBoxes;
    wagon.medicine = cart.medicalKits * 4;
    wagon.spareAxles = cart.spareAxles;
    wagon.spareWheels = cart.spareWheels;
    wagon.spareTongues = cart.spareTongues;
    wagon.clothingSets = cart.clothingSets;
    wagon.wagonParts.tongue = 100;
    state.outfittingProfile = outfitProfile(totals.cargoWeight, wagon.cash, wagon.oxenYokes);
    state.setupError = '';
    state.turnPhase = 'dispatch';
    state.journeyStarted = false;
    const startingStrangenessRoll = state.strangenessLevel;
    const selectedEra = getEraById(state.selectedEra);
    void audio.fadeOutSetupMusic();
    ui.hideJourneyModal();
    state.journeyLoading = true;
    ui.setJourneyLoading(true);
    ui.syncJourneyControls(state);
    let departureRecorded = false;
    try {
      await loadWorld({ includeNarration: false, includeEvents: false, includeNarrationAudio: false });
      await loadEvents();
      await appendEvent('expedition_departure', {
        expeditionName: state.expeditionName,
        selectedEra: {
          id: selectedEra.id,
          label: selectedEra.label,
          years: selectedEra.years
        },
        party: wagon.party.map(({ name, role, appearance }) => ({
          name,
          role,
          gender: appearance?.gender ?? 'male',
          outfitSummary: summarizeMemberOutfit(appearance)
        })),
        outfit: { ...cart },
        cargoWeight: totals.cargoWeight,
        payloadTier: getCargoWeightTier(totals.cargoWeight),
        cashRemaining: wagon.cash,
        outfittingProfile: state.outfittingProfile,
        startingStrangenessRoll,
        prologueHeadline: state.prologueHeadline,
        prologueParagraphs: [...state.prologueParagraphs],
        note: `${state.expeditionName} (${selectedEra.shortLabel || selectedEra.label}) departed Independence with ${wagon.oxenYokes} yokes, ${Math.round(totals.cargoWeight)} lbs of cargo, and starting strangeness ${startingStrangenessRoll}/10.`
      });
      state.setupStage = 'complete';
      state.journeyStarted = true;
      state.landscapeScrollX = 0;
      departureRecorded = true;
    } catch (error) {
      state.journeyStarted = false;
      state.setupStage = 'outfitting';
      state.setupError = 'The departure could not be sealed in the shared ledger. Check the connection and try again.';
      ui.renderMap(state);
      void audio.playSetupMusic();
      console.error('Could not seal the expedition departure', error);
    } finally {
      state.journeyLoading = false;
      ui.setJourneyLoading(false);
      ui.syncJourneyControls(state);
      if (departureRecorded) {
        ui.renderMap(state);
        ui.renderEventLog(state.events);
      }
      ui.updateActionState(state);
    }
    if (departureRecorded) {
      void animateWalkFromGeneralStore();
      state.latestNarration = null;
      state.narrationText = '';
      state.activeDialogue = null;
      state.prologueDialogue = null;
      state.narrationStateKey = '';
      state.narrationInFlightKey = '';
      state.lastRemoteNarrationTriggerKey = '';
      await loadNarration(true);
    }
  }

  async function startTrailAfterPrologue() {
    if (state.turnPhase !== 'prologue' || state.setupStage !== 'prologue' || state.journeyLoading || !state.prologueReady) return;
    state.activeDialogue = null;
    state.prologueDialogue = null;
    await animateWalkToGeneralStore();
    state.setupStage = 'outfitting';
    state.turnPhase = 'dispatch';
    state.journeyStarted = false;
    ui.syncJourneyControls(state);
    ui.renderMap(state);
    ui.updateActionState(state);
  }

  function setPartyEra(eraId) {
    const validEra = getEraById(eraId).id;
    state.selectedEra = validEra;
    (state.wagon.party ?? []).forEach((member, idx) => {
      if (member.appearance) {
        equipMemberEraOutfit(
          member.appearance,
          validEra,
          member.appearance.preferredHeadwearType || (idx % 2 === 0 ? 'hat' : 'hair'),
          idx
        );
      }
    });
    syncAllPartyAppearancesToEra(state.wagon.party, validEra);
    state.setupError = '';
    ui.renderJourneyModal(state);
  }

  function selectCreatorMember(index) {
    const idx = Math.max(0, Math.min(3, Number(index) || 0));
    state.activeCreatorMemberIndex = idx;
    ui.renderJourneyModal(state);
  }

  function updateCreatorMember(update = {}) {
    const idx = typeof update.memberIndex === 'number'
      ? Math.max(0, Math.min(3, update.memberIndex))
      : (state.activeCreatorMemberIndex ?? 0);
    const member = state.wagon.party?.[idx];
    if (!member) return;
    syncAllPartyAppearancesToEra(state.wagon.party, state.selectedEra);

    if (typeof update.expeditionName === 'string') {
      state.expeditionName = update.expeditionName.slice(0, 48);
    }
    if (typeof update.name === 'string') {
      member.name = update.name.slice(0, 24);
    }
    if (typeof update.role === 'string' && ARCHETYPE_OPTIONS.some((a) => a.role === update.role)) {
      member.role = update.role;
      state.wagon.cash = getStartingCashForState(state);
    }
    if (update.gender === 'female' || update.gender === 'male') {
      member.appearance.gender = update.gender;
      equipMemberEraOutfit(member.appearance, state.selectedEra, member.appearance.preferredHeadwearType || 'hat', idx);
    }
    if (typeof update.bodyTemplateId === 'string') {
      member.appearance.bodyTemplateId = update.bodyTemplateId;
    }
    if (typeof update.skinToneId === 'string') {
      member.appearance.skinToneId = update.skinToneId;
    }
    if (typeof update.hairColorId === 'string') {
      member.appearance.hairColorId = update.hairColorId;
    }
    if (typeof update.creatorCategory === 'string') {
      state.creatorCategory = update.creatorCategory;
    }
    if (typeof update.headwearSubFilter === 'string') {
      state.creatorHeadwearSubFilter = update.headwearSubFilter;
    }
    if (update.presetCategory && typeof update.presetId === 'string') {
      member.appearance.equippedPresets[update.presetCategory] = update.presetId;
    }
    if (update.dyeCategory && typeof update.dyeId === 'string') {
      member.appearance.categoryDyes[update.dyeCategory] = update.dyeId;
    }
    if (update.action === 'randomize-member') {
      randomizeMemberInEra(member.appearance, state.selectedEra);
    } else if (update.action === 'randomize-party') {
      (state.wagon.party ?? []).forEach((m) => randomizeMemberInEra(m.appearance, state.selectedEra));
    } else if (update.action === 'equip-era-hat') {
      equipMemberEraOutfit(member.appearance, state.selectedEra, 'hat', Math.floor(Math.random() * 6));
    } else if (update.action === 'equip-era-hair') {
      equipMemberEraOutfit(member.appearance, state.selectedEra, 'hair', Math.floor(Math.random() * 6));
    }
    if (update.renderModal !== false) {
      ui.renderJourneyModal(state);
    } else {
      ui.refreshCreatorCanvases?.(state);
    }
  }

  function configureParty(names = {}) {
    const expeditionName = String(names.expeditionName ?? state.expeditionName ?? '').trim();
    if (names.selectedEra) {
      state.selectedEra = getEraById(names.selectedEra).id;
    }
    syncAllPartyAppearancesToEra(state.wagon.party, state.selectedEra);

    if (Array.isArray(names.members) && names.members.length === 4) {
      names.members.forEach((entry, idx) => {
        const member = state.wagon.party[idx];
        if (!member) return;
        member.name = String(entry.name ?? '').trim().slice(0, 24);
        if (entry.role && ARCHETYPE_OPTIONS.some((a) => a.role === entry.role)) {
          member.role = entry.role;
        }
      });
    } else if (names.guideName || names.doctorName || names.youthName || names.carpenterName) {
      const legacyNames = [names.guideName, names.doctorName, names.youthName, names.carpenterName];
      state.wagon.party.forEach((member, idx) => {
        const candidate = String(legacyNames[idx] ?? member.name ?? '').trim();
        if (candidate) member.name = candidate.slice(0, 24);
      });
    }

    if (!expeditionName || state.wagon.party.some((m) => !String(m.name ?? '').trim())) {
      state.setupError = 'Enter an expedition name and a first name for every party member.';
      ui.showJourneyModal(state);
      return;
    }

    state.expeditionName = expeditionName.slice(0, 48);
    state.wagon.cash = getStartingCashForState(state);
    state.landscapeCharX = 116;
    state.generalStoreApproachProgress = 0;
    state.landscapeScrollX = 0;
    state.landscapeMoving = false;
    state.setupError = '';
    state.setupStage = 'prologue';
    void generateOpeningPrologue();
  }

  function setOutfittingQuantity(key, rawQuantity) {
    if (!OUTFITTING_CATALOG.some((item) => item.key === key)) return;
    const quantity = Math.max(0, Math.min(999, Math.floor(Number(rawQuantity) || 0)));
    state.outfittingCart[key] = quantity;
    state.setupError = '';
    ui.updateOutfittingCart(state);
  }

  function applyRecommendedOutfit() {
    state.outfittingCart = { ...RECOMMENDED_OUTFIT };
    state.setupError = '';
    ui.updateOutfittingCart(state, true);
  }

  function returnToPartyRegister() {
    state.setupStage = 'register';
    state.turnPhase = 'dispatch';
    state.generalStoreApproachProgress = 0;
    state.prologueReady = false;
    state.prologueHeadline = '';
    state.prologueParagraphs = [];
    state.setupError = '';
    ui.renderMap(state);
    ui.showJourneyModal(state);
  }

  function resetToJourneySetup() {
    resetExpedition(state);
    audio.stopAllNarration();
    ui.setNarrationLoading(false, state);
    ui.resetActionButtons();
    ui.renderWagonState(state);
    ui.renderObjective(state);
    applyNarrationBeat(state, null);
    renderStoryPanel();
    ui.renderStatusBanner(state);
    ui.renderEventLog();
    ui.syncJourneyControls(state);
    ui.renderActionSummary(state);
    ui.showJourneyModal(state);
    void audio.playSetupMusic();
    ui.setJourneyLoading(false);
  }

  async function bootstrapApp() {
    resetExpedition(state);
    ui.setNarrationLoading(false, state);
    ui.renderWagonState(state);
    ui.renderObjective(state);
    applyNarrationBeat(state, null);
    renderStoryPanel();
    ui.renderStatusBanner(state);
    ui.renderEventLog();
    ui.syncJourneyControls(state);
    ui.renderActionSummary(state);
    ui.showJourneyModal(state);
    void audio.playSetupMusic();
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

  function setStrangenessOverride(value) {
    const override = value === '' ? null : Number(value);
    if (override !== null && (!Number.isInteger(override) || override < 0 || override > MAX_STRANGENESS_LEVEL)) {
      state.statusMessage = 'Invalid strangeness override. Choose a level from 0 to 10 or natural progression.';
      ui.renderStatusBanner(state);
      console.error('Rejected invalid strangeness test override', value);
      return;
    }

    const previousLevel = getEffectiveStrangenessLevel(state);
    state.strangenessLevelOverride = override;
    ui.syncJourneyControls(state);
    ui.renderMap(state);
    if (previousLevel === getEffectiveStrangenessLevel(state)) return;

    state.narrationStateKey = '';
    state.lastRemoteNarrationTriggerKey = '';
    if (
      state.journeyStarted &&
      !state.journeyLoading &&
      !state.actionInProgress &&
      !state.activeDecision &&
      !state.activeObstacle
    ) {
      queueNarrationRefresh(false);
    }
  }

  function warpBeforeLandmark(landmarkId) {
    const landmark = trailMilestones.find((milestone) => milestone.id === landmarkId && milestone.mile > 0);
    if (!landmark) {
      state.statusMessage = 'Choose a valid trail landmark for the test warp.';
      ui.renderStatusBanner(state);
      console.error('Rejected invalid landmark test warp', landmarkId);
      return;
    }
    if (
      !state.journeyStarted ||
      state.gameOver ||
      state.journeyLoading ||
      state.actionInProgress ||
      state.narrationLoading ||
      state.turnPhase === 'results' ||
      state.turnPhase === 'resolving'
    ) {
      state.statusMessage = 'Test warp is available only during an idle, active journey.';
      ui.renderStatusBanner(state);
      console.warn('Rejected landmark test warp while journey is not idle', landmarkId);
      return;
    }

    if (state.narrationRefreshTimer) {
      clearTimeout(state.narrationRefreshTimer);
      state.narrationRefreshTimer = null;
    }
    state.narrationRequestId += 1;
    audio.stopNarration();
    state.milesTraveled = landmark.mile - 1;
    state.journeyCompleted = false;
    state.turnPhase = 'dispatch';
    state.activeDecision = null;
    state.pendingMetaDialogue = null;
    state.justResolvedDecision = null;
    state.pendingSurrealEffect = null;
    state.riverCrossingAnimation = null;
    state.landscapeScrollX = 0;
    state.landscapeMoving = false;
    state.travelAnimationActive = false;
    state.wagonAnimationFrame = 0;
    state.lastActionSummary = null;
    state.lastActionContext = null;
    state.lastRemoteNarrationTriggerKey = '';
    state.narrationInFlightKey = '';
    state.narrationStateKey = '';
    state.narrationLoading = false;
    state.dispatchAutoPlayPending = false;
    applyNarrationBeat(state, null);
    state.statusMessage = `TEST WARP: Positioned at mile ${state.milesTraveled}, one mile before ${landmark.name}. Day, party, and supplies are unchanged; this local test warp was not added to the ledger.`;
    state.wagon.status = `Test position before ${landmark.shortName}`;
    syncTrailProgress();

    ui.setNarrationLoading(false, state);
    ui.renderSelectedTile(state.currentTrailSnapshot ?? fallbackTile);
    ui.renderWagonState(state);
    ui.renderObjective(state);
    ui.renderStatusBanner(state);
    ui.renderActionSummary(state);
    ui.renderHazardBanner(state);
    ui.renderMap(state);
    ui.syncJourneyControls(state);
    ui.updateActionState(state);
    renderStoryPanel();
  }

  function setPace(value) {
    state.wagon.pace = ['steady', 'strenuous', 'grueling'].includes(value) ? value : 'steady';
    state.statusMessage = `The wagon pace is now ${paceLabel(state.wagon.pace).toLowerCase()}.`;
    ui.renderMap(state);
    ui.renderWagonState(state);
  }

  function setRations(value) {
    state.wagon.rations = ['filling', 'normal', 'meager'].includes(value) ? value : 'filling';
    state.statusMessage = `The ration plan is now ${rationsLabel(state.wagon.rations).toLowerCase()}.`;
    ui.renderMap(state);
    ui.renderWagonState(state);
  }

  async function resolveDecisionChoice(choiceInput, responseText = '') {
    const decision = state.activeDecision;
    if (!decision) return;
    const pendingMetaDialogue = state.pendingMetaDialogue;
    const effectiveChoiceInput = pendingMetaDialogue?.choiceId ?? choiceInput;
    const matchingOption = (decision.options ?? []).find(
      (opt) => opt.id === effectiveChoiceInput || String(opt.hotkey) === String(effectiveChoiceInput)
    );
    if (decision.type === 'river-crossing' && !matchingOption) {
      ui.setDecisionInputFeedback('Choose one of the listed river crossing options.');
      return;
    }
    const choiceId = matchingOption ? matchingOption.id : effectiveChoiceInput;
    const obstacle = decision.type === 'obstacle-dilemma'
      ? decision.context?.obstacle ?? state.activeObstacle
      : null;
    const obstacleChoice = obstacle?.choices?.find((option) => option.id === choiceId);
    if (obstacle?.dilemmaType === 'surreal' && obstacleChoice?.approach === 'meta-engagement' && !pendingMetaDialogue) {
      state.pendingMetaDialogue = {
        choiceId,
        prompt: obstacle.description,
        title: decision.title
      };
      ui.renderMap(state);
      return;
    }
    const operatorResponse = pendingMetaDialogue ? String(responseText).trim().slice(0, 240) : '';
    if (pendingMetaDialogue && !operatorResponse) {
      ui.setDecisionInputFeedback('Type a response before sending it to the Operator.');
      return;
    }
    state.pendingMetaDialogue = null;
    clearDecision({ render: false });

    if (decision.type === 'wagon-breakdown') {
      if (choiceId === 'replace-spare') {
        await handleAction('repair', { fromDecision: true, useSpare: true });
        return;
      }
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
          const beforeSummarySnapshot = createWagonSummarySnapshot(state.wagon);
          applyResourceDelta(state.wagon, 'food', -2);
          applyResourceDelta(state.wagon, 'wood', repairCost);
          state.statusMessage = `You bartered 2 food rations for ${repairCost} wood bundles to fix the wagon.`;
          await handleAction('repair', { fromDecision: true, beforeSummarySnapshot });
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
        const beforeSummarySnapshot = createWagonSummarySnapshot(state.wagon);
        ui.updateActionState(state);
        try {
          const selectedTile = state.currentTrailSnapshot ?? fallbackTile;
          applyTurnPressure('camp', selectedTile, 0);
          const riverTile = state.tileMap.find((tile) => tile.id === decision.context.nextTileId);
          state.statusMessage = `You waited by the riverbank for the waters near ${decision.context.destinationName} to ease.`;
          if (riverTile?.river) {
            riverTile.river = {
              depthFt: Number(Math.max(1.4, riverTile.river.depthFt - 0.7).toFixed(2)),
              flowRate: Number(Math.max(70, riverTile.river.flowRate - 35).toFixed(2))
            };
            syncTrailProgress();
            state.activeDecision = buildRiverDecision(
              decision.context.travelAction,
              decision.context.nextTileId,
              decision.context.directionText,
              decision.context.destinationName,
              riverTile.river
            );
            state.statusMessage = `The water eased to ${riverTile.river.depthFt} ft. Choose how to cross ${decision.context.destinationName}.`;
          }
          await appendEvent('river_wait', {
            tileId: decision.context.nextTileId,
            note: `The wagon delayed at ${decision.context.destinationName}, hoping for lower water.`
          });
          await processPartyDeaths();
          recordActionHistory('river-wait', state.gameOver ? 'failed' : 'completed', getAvailableActionOptions());
          setActionSummary('river-wait', beforeSummarySnapshot);
          ui.renderStatusBanner(state);
          ui.renderWagonState(state);
          ui.renderMap(state);
          ui.updateActionState(state);
          await loadEvents();
          queueNarrationRefresh(false);
        } finally {
          state.actionInProgress = false;
          ui.updateActionState(state);
        }
        return;
      }
      await handleAction(decision.context.travelAction, {
        fromDecision: true,
        riverChoice: choiceId,
        riverContext: decision.context
      });
      return;
    }

    if (decision.type === 'dalles-route') {
      const beforeSummarySnapshot = createWagonSummarySnapshot(state.wagon);
      if (choiceId === 'barlow-road') {
        if (state.wagon.cash < 10) {
          state.statusMessage = 'The Barlow Road toll requires $10.00. The Columbia raft is still available.';
          setDecision(buildDallesRouteDecision());
          return;
        }
        state.wagon.cash -= 10;
        state.dallesRouteChoice = 'barlow-road';
        state.statusMessage = `${state.expeditionName} paid the $10.00 Barlow Road toll.`;
        await appendEvent('route_choice', {
          route: 'barlow-road',
          tollPaid: 10,
          note: `${state.expeditionName} paid the Barlow Road toll at The Dalles.`
        });
      } else if (choiceId === 'columbia-raft') {
        state.dallesRouteChoice = 'columbia-raft';
        applyPartyHealthDelta(state, -10, { status: 'Shaken' });
        applyResourceDelta(state.wagon, 'food', -12);
        applyResourceDelta(state.wagon, 'water', -5);
        state.wagon.wagonParts.wheels = Math.max(0, state.wagon.wagonParts.wheels - 15);
        state.statusMessage = `${state.expeditionName} risked the Columbia raft; spray soaked the cargo and battered the wagon.`;
        await appendEvent('route_choice', {
          route: 'columbia-raft',
          foodLost: 12,
          waterLost: 5,
          note: state.statusMessage
        });
      }
      await handleAction('press-on', { fromDecision: true, beforeSummarySnapshot });
      return;
    }

    if (decision.type === 'fort-resupply') {
      await handleAction('trade', { fromDecision: true, fortItemKey: choiceId });
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
      const choice = obstacleChoice;
      if (!choice) return;

      state.actionInProgress = true;
      const beforeSummarySnapshot = createWagonSummarySnapshot(state.wagon);
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
        state.justResolvedDecision = {
          decisionType: 'obstacle-dilemma',
          kind: obstacle.dilemmaType,
          prompt: obstacle.description,
          chosenOption: choice.label,
          chosenOptionId: choice.id,
          rejectedOptions: obstacle.choices.filter((option) => option.id !== choice.id).map((option) => option.label),
          costSummary: describeObstacleCost(cost),
          responseText: operatorResponse || undefined,
          outcome: state.statusMessage
        };
        clearDecision({ render: false });
        await applyPendingSurrealEffect('decision');
        state.justResolvedDecision.outcome = state.statusMessage;
        await appendEvent('obstacle_resolution', {
          obstacle: obstacle.description,
          choiceId: choice.id,
          choiceLabel: choice.label,
          cost,
          note: `${choice.label}: ${choice.description}`
        });
        if (obstacle.dilemmaType === 'surreal') {
          const dialogueEntry = {
            day: state.day,
            prompt: obstacle.description,
            playerResponse: operatorResponse || choice.label,
            approach: choice.approach ?? 'survival',
            choice: choice.label
          };
          await appendEvent('meta_dilemma_response', {
            ...dialogueEntry,
            rejectedOptions: state.justResolvedDecision.rejectedOptions,
            costSummary: state.justResolvedDecision.costSummary,
            note: `${state.expeditionName} answered a reality dilemma through ${dialogueEntry.approach}.`
          });
          state.metaDialogueHistory = [...state.metaDialogueHistory, dialogueEntry].slice(-12);
        }
        await processPartyDeaths();
        setActionSummary('obstacle-dilemma', beforeSummarySnapshot);
        if (!state.gameOver) {
          ui.renderStatusBanner(state);
          ui.renderWagonState(state);
          ui.renderMap(state);
          ui.renderHazardBanner(state);
          ui.updateActionState(state);
          await loadEvents();
          queueNarrationRefresh(false);
        } else {
          ui.renderMap(state);
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

  function continueToDispatch() {
    if (state.turnPhase !== 'results' || state.actionInProgress) return;
    const shouldAutoPlay = state.dispatchAutoPlayPending;
    state.dispatchAutoPlayPending = false;
    state.turnPhase = 'dispatch';
    if (state.activeDialogue) {
      state.activeDialogueShownAt = Date.now();
    }
    ui.renderMap(state);
    ui.refreshLandscapeCanvas?.(state);
    ui.updateActionState(state);
    if (shouldAutoPlay) {
      void audio.playNarration();
    }
  }

  function cancelMetaDialogue() {
    if (!state.pendingMetaDialogue) return;
    state.pendingMetaDialogue = null;
    ui.renderMap(state);
  }

  function setWeatherOverlay(value) {
    const normalized = normalizeWeatherOverlayId(value);
    state.weatherOverlay = normalized;
    state.weatherOverlayOverride = normalized === 'none' ? null : normalized;
    state.weatherSeed = Math.floor(Math.random() * 1000000);
    ui.syncJourneyControls(state);
    ui.refreshLandscapeCanvas?.(state);
  }

  return {
    beginJourney,
    startTrailAfterPrologue,
    bootstrapApp,
    cancelMetaDialogue,
    continueToDispatch,
    configureParty,
    handleAction,
    handleTileSelection,
    loadNarrationConfig,
    resolveDecisionChoice,
    renderStoryPanel,
    resetToJourneySetup,
    applyRecommendedOutfit,
    returnToPartyRegister,
    setOutfittingQuantity,
    setPartyEra,
    selectCreatorMember,
    updateCreatorMember,
    setPace,
    setRations,
    setJourneyAutoReadPreference,
    setJourneyCloudPreference,
    setJourneyLlmPreference,
    setStrangenessOverride,
    setWeatherOverlay,
    warpBeforeLandmark
  };
}

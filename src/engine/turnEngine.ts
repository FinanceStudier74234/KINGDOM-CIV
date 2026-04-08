import {
  GameState, TurnSummary, TurnSummaryEntry, GameResources,
  UnrestLevel, DelayedEffect, Season
} from '../types/game';
import { DIFFICULTY_CONFIG } from '../data/difficulty';
import { TAX_LEVELS } from '../data/policies';
import { POLICIES } from '../data/policies';
import { ADVISORS } from '../data/advisors';
import { KINGDOM_TRAITS } from '../data/traits';
import { KINGDOM_TYPES } from '../data/kingdoms';
import { RULER_TRAITS } from '../data/rulers';
import { TECHNOLOGIES } from '../data/technologies';
import { getSeasonForTurn } from '../data/seasons';
import { getTotalBuildingEffect, getTotalUpkeep, addRulerXp } from './gameState';
import { ACHIEVEMENTS } from '../data/achievements';

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function getUnrestLevel(state: GameState): UnrestLevel {
  const { happiness, stability } = state.resources;
  const avg = (happiness + stability) / 2;
  if (avg >= 60) return 'stable';
  if (avg >= 45) return 'tense';
  if (avg >= 30) return 'unrest';
  if (avg >= 20) return 'riots';
  if (avg >= 10) return 'rebellion';
  return 'collapse';
}

export function calculateTaxIncome(state: GameState): number {
  const taxDef = TAX_LEVELS.find(t => t.id === state.taxLevel)!;
  const happinessModifier = Math.max(0.5, state.resources.happiness / 100);
  const stabilityModifier = Math.max(0.6, state.resources.stability / 100);
  const baseTax = state.resources.population * 0.55 * taxDef.goldMultiplier;
  // Minimum tax income so early game isn't completely starved
  return Math.max(3, Math.floor(baseTax * happinessModifier * stabilityModifier));
}

export function calculateFoodProduction(state: GameState): number {
  const farmFood = getTotalBuildingEffect(state, 'foodProduction');
  const landBonus = state.resources.land * 3;
  let base = farmFood + landBonus;

  // Apply season modifier
  const season = getSeasonForTurn(state.turn);
  base *= season.foodModifier;

  // Apply trait
  const trait = KINGDOM_TRAITS.find(t => t.id === state.trait);
  if (trait?.modifiers.foodProduction) {
    base *= (1 + trait.modifiers.foodProduction);
  }

  // Apply kingdom type modifier
  const kt = KINGDOM_TYPES.find(k => k.id === state.kingdomType);
  if (kt?.modifiers.foodProduction) {
    base *= (1 + kt.modifiers.foodProduction);
  }

  // Apply ruler trait bonuses
  if (state.ruler) {
    for (const tid of state.ruler.traits) {
      const rt = RULER_TRAITS.find(r => r.id === tid);
      if (rt?.effects.foodProduction) {
        base *= (1 + rt.effects.foodProduction);
      }
    }
  }

  // Apply tech bonuses
  for (const tech of state.technologies || []) {
    if (tech.researched) {
      const tDef = TECHNOLOGIES.find(t => t.id === tech.id);
      if (tDef?.effects.foodProduction) {
        base *= (1 + tDef.effects.foodProduction);
      }
    }
  }

  // Apply policy bonuses
  for (const pid of state.activePolicies) {
    const p = POLICIES.find(pp => pp.id === pid);
    if (p?.effects.foodProduction) {
      base *= (1 + p.effects.foodProduction);
    }
  }

  // Apply advisor bonuses
  for (const aid of state.activeAdvisors) {
    const a = ADVISORS.find(aa => aa.id === aid);
    if (a?.passiveBonus.foodProduction) {
      base *= (1 + a.passiveBonus.foodProduction);
    }
  }

  return Math.floor(base);
}

export function calculateFoodConsumption(state: GameState): number {
  const config = DIFFICULTY_CONFIG[state.difficulty];
  const popFood = state.resources.population * config.foodConsumptionRate;
  const armyFood = state.resources.armySize * config.armyFoodRate;
  return Math.floor(popFood + armyFood);
}

export function calculateGoldIncome(state: GameState): number {
  const taxIncome = calculateTaxIncome(state);
  const buildingIncome = getTotalBuildingEffect(state, 'goldIncome');
  const tradeIncome = getTotalBuildingEffect(state, 'tradeIncome');
  let total = taxIncome + buildingIncome + tradeIncome;

  // Season modifier
  const season = getSeasonForTurn(state.turn);
  total *= season.goldModifier;

  // Apply trait
  const trait = KINGDOM_TRAITS.find(t => t.id === state.trait);
  if (trait?.modifiers.goldIncome) {
    total *= (1 + trait.modifiers.goldIncome);
  }

  // Kingdom type
  const kt = KINGDOM_TYPES.find(k => k.id === state.kingdomType);
  if (kt?.modifiers.goldIncome) {
    total *= (1 + kt.modifiers.goldIncome);
  }

  // Ruler traits
  if (state.ruler) {
    for (const tid of state.ruler.traits) {
      const rt = RULER_TRAITS.find(r => r.id === tid);
      if (rt?.effects.goldIncome) {
        total *= (1 + rt.effects.goldIncome);
      }
    }
  }

  // Technologies
  for (const tech of state.technologies || []) {
    if (tech.researched) {
      const tDef = TECHNOLOGIES.find(t => t.id === tech.id);
      if (tDef?.effects.goldIncome) {
        total *= (1 + tDef.effects.goldIncome);
      }
    }
  }

  // Apply policies
  for (const pid of state.activePolicies) {
    const p = POLICIES.find(pp => pp.id === pid);
    if (p?.effects.goldIncome) {
      total *= (1 + p.effects.goldIncome);
    }
  }

  // Apply advisors
  for (const aid of state.activeAdvisors) {
    const a = ADVISORS.find(aa => aa.id === aid);
    if (a?.passiveBonus.goldIncome) {
      total *= (1 + a.passiveBonus.goldIncome);
    }
  }

  return Math.floor(total);
}

export function calculateGoldExpenses(state: GameState): number {
  const config = DIFFICULTY_CONFIG[state.difficulty];
  const buildingUpkeep = getTotalUpkeep(state);
  const armyUpkeep = Math.floor(state.resources.armySize * 1.5);
  return Math.floor((buildingUpkeep + armyUpkeep) * config.upkeepMultiplier);
}

export function calculatePopulationChange(state: GameState): number {
  const maxPop = state.maxPopulation + getTotalBuildingEffect(state, 'populationCapacity');
  const { population, happiness, food } = state.resources;

  if (population >= maxPop) return 0;

  let growth = 0;
  // Natural growth based on happiness and food
  if (food > 0 && happiness > 30) {
    growth = Math.floor(population * 0.03 * (happiness / 100));
  }

  // Health bonus from buildings
  const healthBonus = getTotalBuildingEffect(state, 'healthBonus');
  growth += healthBonus;

  // Apply population growth modifiers from kingdom type
  const kt = KINGDOM_TYPES.find(k => k.id === state.kingdomType);
  if (kt?.modifiers.populationGrowth && growth > 0) {
    growth = Math.floor(growth * (1 + kt.modifiers.populationGrowth));
  }

  // Apply ruler trait modifiers
  if (state.ruler && growth > 0) {
    for (const tid of state.ruler.traits) {
      const rt = RULER_TRAITS.find(r => r.id === tid);
      if (rt?.effects.populationGrowth) {
        growth = Math.floor(growth * (1 + rt.effects.populationGrowth));
      }
    }
  }

  // Apply policy modifiers
  for (const pid of state.activePolicies) {
    const p = POLICIES.find(pp => pp.id === pid);
    if (p?.effects.populationGrowth && growth > 0) {
      growth = Math.floor(growth * (1 + p.effects.populationGrowth));
    }
  }

  // Apply tech modifiers
  for (const tech of state.technologies || []) {
    if (tech.researched) {
      const tDef = TECHNOLOGIES.find(t => t.id === tech.id);
      if (tDef?.effects.populationGrowth && growth > 0) {
        growth = Math.floor(growth * (1 + tDef.effects.populationGrowth));
      }
    }
  }

  // Starvation
  if (food <= 0) {
    growth = -Math.floor(population * 0.08);
  }

  // Low happiness migration
  if (happiness < 25) {
    growth -= Math.floor(population * 0.03);
  }

  // Cap at max population
  if (population + growth > maxPop) {
    growth = maxPop - population;
  }

  return growth;
}

export function calculateHappinessChange(state: GameState): number {
  let change = 0;

  // Tax effect
  const taxDef = TAX_LEVELS.find(t => t.id === state.taxLevel)!;
  change += taxDef.happinessEffect;

  // Food effect
  const foodProd = calculateFoodProduction(state);
  const foodCons = calculateFoodConsumption(state);
  if (foodProd >= foodCons) {
    change += 1; // surplus is good
  } else {
    change -= 3; // deficit is bad
  }
  if (state.resources.food <= 0) {
    change -= 8; // starvation is terrible
  }

  // Building bonuses
  change += Math.floor(getTotalBuildingEffect(state, 'happiness'));

  // Overcrowding check
  const maxPop = state.maxPopulation + getTotalBuildingEffect(state, 'populationCapacity');
  if (state.resources.population > maxPop * 0.9) {
    change -= 2;
  }

  // Policy effects
  for (const pid of state.activePolicies) {
    const p = POLICIES.find(pp => pp.id === pid);
    if (p?.effects.happinessChange) {
      change += Math.floor(p.effects.happinessChange * 10);
    }
  }

  // Advisor effects
  for (const aid of state.activeAdvisors) {
    const a = ADVISORS.find(aa => aa.id === aid);
    if (a?.passiveBonus.happinessChange) {
      change += Math.floor(a.passiveBonus.happinessChange * 10);
    }
  }

  // Kingdom trait effect
  const trait = KINGDOM_TRAITS.find(t => t.id === state.trait);
  if (trait?.modifiers.happinessChange) {
    change += Math.floor(trait.modifiers.happinessChange * 10);
  }

  // Kingdom type effect
  const kt = KINGDOM_TYPES.find(k => k.id === state.kingdomType);
  if (kt?.modifiers.happinessChange) {
    change += Math.floor(kt.modifiers.happinessChange * 10);
  }

  // Ruler trait effects
  if (state.ruler) {
    for (const tid of state.ruler.traits) {
      const rt = RULER_TRAITS.find(r => r.id === tid);
      if (rt?.effects.happinessChange) {
        change += Math.floor(rt.effects.happinessChange * 10);
      }
    }
  }

  // Tech effects
  for (const tech of state.technologies || []) {
    if (tech.researched) {
      const tDef = TECHNOLOGIES.find(t => t.id === tech.id);
      if (tDef?.effects.happinessChange) {
        change += Math.floor(tDef.effects.happinessChange * 10);
      }
    }
  }

  // Natural regression toward 50
  if (state.resources.happiness > 70) change -= 1;
  if (state.resources.happiness < 30) change += 1;

  return change;
}

export function calculateStabilityChange(state: GameState): number {
  let change = 0;

  // Tax stability effect
  const taxDef = TAX_LEVELS.find(t => t.id === state.taxLevel)!;
  change += taxDef.stabilityEffect;

  // Happiness influence
  if (state.resources.happiness > 60) change += 1;
  if (state.resources.happiness < 35) change -= 2;
  if (state.resources.happiness < 20) change -= 3;

  // Army presence stabilizes
  if (state.resources.armySize > state.resources.population * 0.1) {
    change += 1;
  }

  // Treasury health
  if (state.resources.gold > 100) change += 1;
  if (state.resources.gold < 0) change -= 2;

  // Building bonuses
  change += Math.floor(getTotalBuildingEffect(state, 'stability'));

  // Policy effects
  for (const pid of state.activePolicies) {
    const p = POLICIES.find(pp => pp.id === pid);
    if (p?.effects.stabilityChange) {
      change += Math.floor(p.effects.stabilityChange * 10);
    }
  }

  // Advisor effects
  for (const aid of state.activeAdvisors) {
    const a = ADVISORS.find(aa => aa.id === aid);
    if (a?.passiveBonus.stabilityChange) {
      change += Math.floor(a.passiveBonus.stabilityChange * 10);
    }
  }

  // Kingdom trait
  const trait = KINGDOM_TRAITS.find(t => t.id === state.trait);
  if (trait?.modifiers.stabilityChange) {
    change += Math.floor(trait.modifiers.stabilityChange * 10);
  }

  // Kingdom type effect
  const kt = KINGDOM_TYPES.find(k => k.id === state.kingdomType);
  if (kt?.modifiers.stabilityChange) {
    change += Math.floor(kt.modifiers.stabilityChange * 10);
  }

  // Ruler trait effects
  if (state.ruler) {
    for (const tid of state.ruler.traits) {
      const rt = RULER_TRAITS.find(r => r.id === tid);
      if (rt?.effects.stabilityChange) {
        change += Math.floor(rt.effects.stabilityChange * 10);
      }
    }
  }

  // Tech effects
  for (const tech of state.technologies || []) {
    if (tech.researched) {
      const tDef = TECHNOLOGIES.find(t => t.id === tech.id);
      if (tDef?.effects.stabilityChange) {
        change += Math.floor(tDef.effects.stabilityChange * 10);
      }
    }
  }

  // Natural regression
  if (state.resources.stability > 80) change -= 1;
  if (state.resources.stability < 25) change += 1;

  return change;
}

export function calculateTotalDefense(state: GameState): number {
  let defense = getTotalBuildingEffect(state, 'defensePower');

  // Apply trait defense bonus
  const trait = KINGDOM_TRAITS.find(t => t.id === state.trait);
  if (trait?.modifiers.defenseBonus) {
    defense *= (1 + trait.modifiers.defenseBonus);
  }

  // Apply policy defense bonuses
  for (const pid of state.activePolicies) {
    const p = POLICIES.find(pp => pp.id === pid);
    if (p?.effects.defenseBonus) {
      defense *= (1 + p.effects.defenseBonus);
    }
  }

  // Apply advisor defense bonuses
  for (const aid of state.activeAdvisors) {
    const a = ADVISORS.find(aa => aa.id === aid);
    if (a?.passiveBonus.defenseBonus) {
      defense *= (1 + a.passiveBonus.defenseBonus);
    }
  }

  return Math.floor(defense);
}

export function calculateThreatChange(state: GameState): number {
  const config = DIFFICULTY_CONFIG[state.difficulty];
  // Base threat grows slowly, scales with kingdom size (bigger = more attractive target)
  let change = config.threatGrowth * (1 + state.resources.population / 200);

  // Weak army increases threat significantly
  const armyRatio = state.resources.armySize / Math.max(1, state.resources.population * 0.15);
  if (armyRatio < 0.5) change += 1.5;
  else if (armyRatio < 1.0) change += 0.5;

  // Strong army deters — scales with power
  if (state.resources.armySize > 20 && state.resources.armyPower > 25) {
    change -= 1.5;
  } else if (state.resources.armySize > 15) {
    change -= 0.5;
  }

  // Walls/defense reduces threat substantially
  const defense = calculateTotalDefense(state);
  change -= defense * 0.05; // every 20 defense = -1 threat/turn

  // Low stability invites attack
  if (state.resources.stability < 30) change += 1;
  if (state.resources.stability > 70) change -= 0.3;

  // Land increases threat (but diminishing)
  change += Math.sqrt(state.resources.land) * 0.4;

  // Defensive posture
  if (state.activePolicies.includes('defensive_posture')) {
    change -= 1;
  }

  // Spy network reduces threat (uses spy_den buildings)
  const spyPower = getTotalBuildingEffect(state, 'spyPower');
  change -= spyPower * 0.15;

  // Rival kingdoms influence threat
  for (const rival of state.rivals || []) {
    if (rival.status === 'hostile' || rival.status === 'war') change += 0.3;
    if (rival.status === 'allied') change -= 0.4;
    if (rival.status === 'friendly') change -= 0.2;
  }

  // Threat naturally decays slightly when very high (enemies don't coordinate forever)
  if (state.resources.threat > 60) change -= 0.5;

  return Math.round(change * 10) / 10;
}

export function processArmyMorale(state: GameState): number {
  let change = 0;
  if (state.resources.gold < 0) change -= 3;
  if (state.resources.food <= 0) change -= 5;
  if (state.resources.happiness > 60) change += 1;
  if (state.resources.happiness < 30) change -= 2;

  // Well-equipped army
  const armyPowerBonus = getTotalBuildingEffect(state, 'armyPower');
  if (armyPowerBonus > 5) change += 1;

  return change;
}

export function checkInvasion(state: GameState): { invaded: boolean; result?: string; effects?: Partial<GameResources> } {
  const config = DIFFICULTY_CONFIG[state.difficulty];
  if (state.resources.threat < 30) return { invaded: false };

  // Invasion chance scales with threat but has diminishing returns
  const chance = config.invasionChance * Math.sqrt(state.resources.threat / 40);
  if (Math.random() > chance) return { invaded: false };

  // Battle resolution — defense is a strong factor (walls matter)
  const defense = calculateTotalDefense(state);
  const armyStrength = state.resources.armySize * (state.resources.armyMorale / 100) *
    (state.resources.armyPower / 10) + defense * 1.5 + state.resources.stability * 0.1;

  // Enemy scales with threat but not as aggressively as before
  const enemyStrength = state.resources.threat * 1.2 + Math.random() * 10 + (state.turn * 0.15);

  const ratio = armyStrength / Math.max(1, enemyStrength);

  if (ratio > 1.5) {
    return {
      invaded: true,
      result: 'Decisive Victory! The invaders were crushed!',
      effects: { threat: -10, armyMorale: 10, happiness: 5, armySize: -1, gold: 15 },
    };
  } else if (ratio > 1.0) {
    return {
      invaded: true,
      result: 'Costly Victory. We won, but at great cost.',
      effects: { threat: -5, armySize: -3, armyMorale: 3, gold: -10, happiness: 2 },
    };
  } else if (ratio > 0.7) {
    return {
      invaded: true,
      result: 'Stalemate. The enemy retreated, but we held barely.',
      effects: { threat: -2, armySize: -2, armyMorale: -3, food: -10 },
    };
  } else if (ratio > 0.4) {
    return {
      invaded: true,
      result: 'Costly Defeat. Our forces were pushed back.',
      effects: { threat: 3, armySize: -5, armyMorale: -10, food: -15, gold: -20, happiness: -5 },
    };
  } else {
    return {
      invaded: true,
      result: 'Catastrophic Defeat! The kingdom is devastated!',
      effects: { threat: 5, armySize: -8, armyMorale: -20, food: -25, gold: -30, happiness: -10, stability: -10, land: -1, population: -5 },
    };
  }
}

export function checkRebellion(state: GameState): { rebellion: boolean; severity?: string; effects?: Partial<GameResources> } {
  const unrest = getUnrestLevel(state);

  if (unrest === 'stable' || unrest === 'tense') return { rebellion: false };

  let chance = 0;
  if (unrest === 'unrest') chance = 0.08;
  if (unrest === 'riots') chance = 0.18;
  if (unrest === 'rebellion') chance = 0.35;
  if (unrest === 'collapse') chance = 0.6;

  // Spy network reduces rebellion chance
  const spyPower = getTotalBuildingEffect(state, 'spyPower');
  chance *= Math.max(0.3, 1 - spyPower * 0.05);

  // Army presence suppresses rebellion
  if (state.resources.armySize > state.resources.population * 0.2) {
    chance *= 0.7;
  }

  if (Math.random() > chance) return { rebellion: false };

  if (unrest === 'collapse') {
    return {
      rebellion: true,
      severity: 'The kingdom has completely collapsed into civil war!',
      effects: { stability: -30, happiness: -20, population: -10, gold: -30, armySize: -5 },
    };
  }

  if (unrest === 'rebellion') {
    return {
      rebellion: true,
      severity: 'A full rebellion erupts! Rebels seize parts of the capital!',
      effects: { stability: -15, happiness: -10, population: -5, gold: -20, armySize: -3 },
    };
  }

  return {
    rebellion: true,
    severity: 'Riots break out in several towns!',
    effects: { stability: -8, happiness: -5, gold: -10, population: -2 },
  };
}

export function applyEffects(resources: GameResources, effects: Partial<GameResources>): GameResources {
  const r = { ...resources };
  for (const [key, value] of Object.entries(effects)) {
    if (typeof value === 'number' && key in r) {
      (r as Record<string, number>)[key] += value;
    }
  }
  // Clamp values
  r.happiness = clamp(r.happiness, 0, 100);
  r.stability = clamp(r.stability, 0, 100);
  r.armyMorale = clamp(r.armyMorale, 0, 100);
  r.armySize = Math.max(0, r.armySize);
  r.population = Math.max(0, r.population);
  r.land = Math.max(1, r.land);
  r.threat = clamp(r.threat, 0, 100);
  return r;
}

export function processTurn(state: GameState): { newState: GameState; summary: TurnSummary } {
  const entries: TurnSummaryEntry[] = [];
  const events: string[] = [];
  let resources = { ...state.resources };

  // 1. Gold income & expenses
  const goldIncome = calculateGoldIncome(state);
  const goldExpenses = calculateGoldExpenses(state);
  const netGold = goldIncome - goldExpenses;
  resources.gold += netGold;
  entries.push({ label: `Gold Income`, value: goldIncome, type: 'gold' });
  entries.push({ label: `Gold Expenses`, value: -goldExpenses, type: 'gold' });

  // Track total gold earned (applied to newState below, not mutating input)
  let totalGoldEarned = state.totalGoldEarned + (netGold > 0 ? netGold : 0);

  // 2. Food production & consumption
  const foodProd = calculateFoodProduction(state);
  const foodCons = calculateFoodConsumption(state);
  const netFood = foodProd - foodCons;
  resources.food += netFood;

  // Cap food at max storage
  const maxFoodStorage = state.maxFood + getTotalBuildingEffect(state, 'foodStorage');
  resources.food = Math.min(resources.food, maxFoodStorage);

  entries.push({ label: `Food Produced`, value: foodProd, type: 'food' });
  entries.push({ label: `Food Consumed`, value: -foodCons, type: 'food' });

  // 3. Population change
  const stateForCalc = { ...state, resources };
  const popChange = calculatePopulationChange(stateForCalc);
  resources.population += popChange;
  resources.population = Math.max(0, resources.population);
  if (popChange !== 0) {
    entries.push({ label: `Population`, value: popChange, type: 'population' });
  }

  // 4. Happiness change
  const happChange = calculateHappinessChange(state);
  resources.happiness = clamp(resources.happiness + happChange, 0, 100);
  if (happChange !== 0) {
    entries.push({ label: `Happiness`, value: happChange, type: 'happiness' });
  }

  // 5. Stability change
  const stabChange = calculateStabilityChange(state);
  resources.stability = clamp(resources.stability + stabChange, 0, 100);
  if (stabChange !== 0) {
    entries.push({ label: `Stability`, value: stabChange, type: 'stability' });
  }

  // 6. Army morale
  const moraleChange = processArmyMorale(state);
  resources.armyMorale = clamp(resources.armyMorale + moraleChange, 0, 100);
  if (moraleChange !== 0) {
    entries.push({ label: `Army Morale`, value: moraleChange, type: 'army' });
  }

  // 7. Threat change
  const threatChange = calculateThreatChange(state);
  resources.threat = clamp(resources.threat + Math.floor(threatChange), 0, 100);
  if (Math.floor(threatChange) !== 0) {
    entries.push({ label: `Threat Level`, value: Math.floor(threatChange), type: 'threat' });
  }

  // 8. Army desertion if morale very low
  if (resources.armyMorale < 15 && resources.armySize > 0) {
    const deserted = Math.max(1, Math.floor(resources.armySize * 0.15));
    resources.armySize -= deserted;
    events.push(`${deserted} soldiers deserted due to terrible morale!`);
  }

  // 9. Process delayed effects
  const remainingDelayed: DelayedEffect[] = [];
  for (const de of state.delayedEffects) {
    if (de.triggerTurn <= state.turn) {
      resources = applyEffects(resources, de.effects);
      events.push(de.message);
    } else {
      remainingDelayed.push(de);
    }
  }

  // 10. Check invasion
  const invasion = checkInvasion({ ...state, resources });
  if (invasion.invaded && invasion.effects) {
    resources = applyEffects(resources, invasion.effects);
    events.push(`⚔️ INVASION! ${invasion.result}`);
  }

  // 11. Check rebellion
  const reb = checkRebellion({ ...state, resources });
  if (reb.rebellion && reb.effects) {
    resources = applyEffects(resources, reb.effects);
    events.push(`🔥 ${reb.severity}`);
  }

  // 12. Starvation effects
  if (resources.food < 0) {
    const starveDamage = Math.floor(Math.abs(resources.food) * 0.3);
    resources.population -= starveDamage;
    resources.happiness -= 5;
    resources.stability -= 3;
    resources.food = 0;
    events.push(`Starvation claims ${starveDamage} lives!`);
  }

  // Clamp all
  resources.happiness = clamp(resources.happiness, 0, 100);
  resources.stability = clamp(resources.stability, 0, 100);
  resources.armyMorale = clamp(resources.armyMorale, 0, 100);
  resources.population = Math.max(0, resources.population);
  resources.armySize = Math.max(0, resources.armySize);
  resources.land = Math.max(1, resources.land);
  resources.threat = clamp(resources.threat, 0, 100);

  // 13. Process research
  let technologies = [...(state.technologies || [])];
  let currentResearch = state.currentResearch;
  if (currentResearch) {
    const idx = technologies.findIndex(t => t.id === currentResearch);
    if (idx >= 0 && !technologies[idx].researched) {
      const researchSpeed = 1 + getTotalBuildingEffect(state, 'researchSpeed') * 0.15;
      technologies[idx] = {
        ...technologies[idx],
        turnsRemaining: Math.max(0, technologies[idx].turnsRemaining - researchSpeed),
      };
      if (technologies[idx].turnsRemaining <= 0) {
        technologies[idx] = { ...technologies[idx], researched: true, turnsRemaining: 0 };
        const tDef = TECHNOLOGIES.find(t => t.id === currentResearch);
        events.push(`📚 Research complete: ${tDef?.name || currentResearch}!`);
        currentResearch = null;
      }
    }
  }

  // 14. Season update
  const season = getSeasonForTurn(state.turn + 1);

  // 15. Ruler XP (passive: 2 XP per turn survived)
  let ruler = state.ruler ? { ...state.ruler, turnsRuled: (state.ruler.turnsRuled || 0) + 1 } : state.ruler;

  // Update peak
  const peakPop = Math.max(state.peakPopulation, resources.population);

  const summary: TurnSummary = {
    turn: state.turn,
    entries,
    events,
  };

  let newState: GameState = {
    ...state,
    turn: state.turn + 1,
    season: season.id,
    resources,
    delayedEffects: remainingDelayed,
    peakPopulation: peakPop,
    totalGoldEarned,
    turnHistory: [...state.turnHistory.slice(-49), summary],
    technologies,
    currentResearch,
    ruler,
  };

  // Add passive ruler XP
  newState = addRulerXp(newState, 2);

  // Check achievements
  const updatedAchievements = (newState.achievements || []).map((a) => {
    if (a.unlocked) return a;
    const def = ACHIEVEMENTS.find(ad => ad.id === a.id);
    if (def && def.condition(newState)) {
      events.push(`🏆 Achievement Unlocked: ${def.name}!`);
      return { ...a, unlocked: true, unlockedAt: newState.turn };
    }
    return a;
  });
  newState.achievements = updatedAchievements;

  return { newState, summary };
}

export function checkVictory(state: GameState): string | null {
  // Victory requires achieving multiple goals simultaneously
  const { resources, turn } = state;
  if (turn >= 100 && resources.population >= 200 && resources.land >= 10 && resources.gold >= 500) {
    return 'Your kingdom stands as a beacon of civilization! You have achieved true greatness — a prosperous realm with loyal subjects, vast territory, and overflowing coffers. History will remember you as one of the greatest rulers who ever lived.';
  }
  return null;
}

export function checkGameOver(state: GameState): string | null {
  if (state.resources.population <= 0) return 'Your kingdom has no people left. The land falls silent.';
  if (state.resources.stability <= 0 && state.resources.happiness <= 10) {
    return 'Total collapse! Rebellion has consumed the kingdom.';
  }
  if (state.resources.gold < -100 && state.resources.food <= 0) {
    return 'Bankrupt and starving — the kingdom crumbles to dust.';
  }
  if (state.resources.stability <= 0) {
    return 'The kingdom has descended into total anarchy.';
  }
  return null;
}

export function calculateScore(state: GameState): number {
  let score = 0;
  score += state.turn * 10;
  score += state.peakPopulation * 5;
  score += state.totalGoldEarned * 0.1;
  score += state.resources.land * 50;
  score += state.resources.armyPower * 3;
  score += (state.resources.happiness + state.resources.stability);
  score += state.buildings.reduce((sum, b) => sum + b.count * (b.level + 1) * 10, 0);

  // Difficulty multiplier
  const diffMult = { easy: 0.7, normal: 1.0, hard: 1.5 };
  score *= diffMult[state.difficulty];

  return Math.floor(score);
}

export function getTitle(score: number): string {
  if (score < 100) return 'Failed Baron';
  if (score < 300) return 'Struggling Lord';
  if (score < 600) return 'Surviving Lord';
  if (score < 1000) return 'Capable Duke';
  if (score < 1500) return 'Iron King';
  if (score < 2500) return 'Golden Emperor';
  if (score < 4000) return 'Beloved Monarch';
  return 'Eternal Sovereign';
}

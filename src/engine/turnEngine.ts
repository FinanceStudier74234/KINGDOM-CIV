import {
  GameState, TurnSummary, TurnSummaryEntry, GameResources,
  UnrestLevel, DelayedEffect
} from '../types/game';
import { DIFFICULTY_CONFIG } from '../data/difficulty';
import { TAX_LEVELS } from '../data/policies';
import { POLICIES } from '../data/policies';
import { ADVISORS } from '../data/advisors';
import { KINGDOM_TRAITS } from '../data/traits';
import { getTotalBuildingEffect, getTotalUpkeep } from './gameState';

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
  const baseTax = state.resources.population * 0.4 * taxDef.goldMultiplier;
  return Math.floor(baseTax * happinessModifier * stabilityModifier);
}

export function calculateFoodProduction(state: GameState): number {
  const config = DIFFICULTY_CONFIG[state.difficulty];
  const farmFood = getTotalBuildingEffect(state, 'foodProduction');
  const landBonus = state.resources.land * 3;
  let base = farmFood + landBonus;

  // Apply trait
  const trait = KINGDOM_TRAITS.find(t => t.id === state.trait);
  if (trait?.modifiers.foodProduction) {
    base *= (1 + trait.modifiers.foodProduction);
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

  // Apply trait
  const trait = KINGDOM_TRAITS.find(t => t.id === state.trait);
  if (trait?.modifiers.goldIncome) {
    total *= (1 + trait.modifiers.goldIncome);
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

  // Health bonus
  const healthBonus = getTotalBuildingEffect(state, 'healthBonus');
  growth += healthBonus;

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

  // Trait effect
  const trait = KINGDOM_TRAITS.find(t => t.id === state.trait);
  if (trait?.modifiers.happinessChange) {
    change += Math.floor(trait.modifiers.happinessChange * 10);
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

  // Trait
  const trait = KINGDOM_TRAITS.find(t => t.id === state.trait);
  if (trait?.modifiers.stabilityChange) {
    change += Math.floor(trait.modifiers.stabilityChange * 10);
  }

  // Natural regression
  if (state.resources.stability > 80) change -= 1;
  if (state.resources.stability < 25) change += 1;

  return change;
}

export function calculateThreatChange(state: GameState): number {
  const config = DIFFICULTY_CONFIG[state.difficulty];
  let change = config.threatGrowth;

  // Weak army increases threat
  if (state.resources.armySize < 5) change += 2;
  else if (state.resources.armySize < 10) change += 1;

  // Strong army deters
  if (state.resources.armySize > 20 && state.resources.armyPower > 25) {
    change -= 1;
  }

  // Walls reduce threat
  const defense = getTotalBuildingEffect(state, 'defensePower');
  if (defense > 15) change -= 1;

  // Low stability invites attack
  if (state.resources.stability < 30) change += 1;

  // Land increases threat
  change += state.resources.land * 0.3;

  // Defensive posture
  if (state.activePolicies.includes('defensive_posture')) {
    change -= 1;
  }

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
  if (state.resources.threat < 25) return { invaded: false };

  const chance = config.invasionChance * (state.resources.threat / 50);
  if (Math.random() > chance) return { invaded: false };

  // Battle resolution
  const defense = getTotalBuildingEffect(state, 'defensePower');
  const armyStrength = state.resources.armySize * (state.resources.armyMorale / 100) *
    (state.resources.armyPower / 10) + defense;

  const enemyStrength = state.resources.threat * 2 + Math.random() * 15;

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
  const config = DIFFICULTY_CONFIG[state.difficulty];
  const unrest = getUnrestLevel(state);

  if (unrest === 'stable' || unrest === 'tense') return { rebellion: false };

  let chance = 0;
  if (unrest === 'unrest') chance = 0.05;
  if (unrest === 'riots') chance = 0.15;
  if (unrest === 'rebellion') chance = 0.3;
  if (unrest === 'collapse') chance = 0.6;

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

  if (netGold > 0) {
    state.totalGoldEarned += netGold;
  }

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
    if (de.triggerTurn <= state.turn + 1) {
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

  // Update peak
  const peakPop = Math.max(state.peakPopulation, resources.population);

  const summary: TurnSummary = {
    turn: state.turn,
    entries,
    events,
  };

  const newState: GameState = {
    ...state,
    turn: state.turn + 1,
    resources,
    delayedEffects: remainingDelayed,
    peakPopulation: peakPop,
    turnHistory: [...state.turnHistory.slice(-49), summary],
  };

  return { newState, summary };
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

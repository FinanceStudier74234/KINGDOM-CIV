import { Difficulty, GameResources } from '../types/game';

interface DifficultyConfig {
  startingResources: GameResources;
  maxFood: number;
  maxPopulation: number;
  eventSeverity: number;       // multiplier for bad event effects
  threatGrowth: number;        // base threat growth per turn
  rebellionThreshold: number;  // happiness below which rebellion risk starts
  upkeepMultiplier: number;    // army/building upkeep multiplier
  invasionChance: number;      // base invasion chance per turn at high threat
  foodConsumptionRate: number; // food per pop per turn
  armyFoodRate: number;        // food per soldier per turn
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: {
    startingResources: {
      gold: 150,
      food: 120,
      population: 55,
      happiness: 70,
      stability: 75,
      armySize: 12,
      armyMorale: 60,
      armyPower: 15,
      land: 2,
      threat: 5,
    },
    maxFood: 200,
    maxPopulation: 80,
    eventSeverity: 0.7,
    threatGrowth: 0.5,
    rebellionThreshold: 25,
    upkeepMultiplier: 0.8,
    invasionChance: 0.08,
    foodConsumptionRate: 0.8,
    armyFoodRate: 1.0,
  },
  normal: {
    startingResources: {
      gold: 120,
      food: 100,
      population: 50,
      happiness: 65,
      stability: 70,
      armySize: 10,
      armyMorale: 55,
      armyPower: 12,
      land: 1,
      threat: 10,
    },
    maxFood: 150,
    maxPopulation: 70,
    eventSeverity: 1.0,
    threatGrowth: 1.0,
    rebellionThreshold: 30,
    upkeepMultiplier: 1.0,
    invasionChance: 0.12,
    foodConsumptionRate: 1.0,
    armyFoodRate: 1.2,
  },
  hard: {
    startingResources: {
      gold: 80,
      food: 70,
      population: 40,
      happiness: 55,
      stability: 60,
      armySize: 8,
      armyMorale: 45,
      armyPower: 10,
      land: 1,
      threat: 18,
    },
    maxFood: 120,
    maxPopulation: 60,
    eventSeverity: 1.4,
    threatGrowth: 1.6,
    rebellionThreshold: 40,
    upkeepMultiplier: 1.3,
    invasionChance: 0.18,
    foodConsumptionRate: 1.2,
    armyFoodRate: 1.5,
  },
};

import { GameState, Difficulty, KingdomTrait, BuildingState } from '../types/game';
import { DIFFICULTY_CONFIG } from '../data/difficulty';
import { BUILDINGS } from '../data/buildings';

export function createNewGame(
  kingdomName: string,
  difficulty: Difficulty,
  trait: KingdomTrait
): GameState {
  const config = DIFFICULTY_CONFIG[difficulty];

  const initialBuildings: BuildingState[] = [
    { id: 'farm', level: 0, count: 2 },
    { id: 'house', level: 0, count: 2 },
  ];

  return {
    phase: 'playing',
    kingdomName,
    difficulty,
    trait,
    turn: 1,
    resources: { ...config.startingResources },
    maxFood: config.maxFood,
    maxPopulation: config.maxPopulation,
    taxLevel: 'normal',
    buildings: initialBuildings,
    activePolicies: [],
    activeAdvisors: [],
    unlockedAdvisors: [],
    currentEvent: null,
    delayedEffects: [],
    turnHistory: [],
    eventHistory: [],
    eventOccurrences: {},
    gameOverReason: '',
    score: 0,
    peakPopulation: config.startingResources.population,
    totalGoldEarned: 0,
    totalTurnsAtWar: 0,
    tutorialStep: 0,
    tutorialDone: false,
    currentTab: 'overview',
  };
}

export function saveGame(state: GameState): void {
  try {
    const saveData = JSON.stringify(state);
    localStorage.setItem('kingdom_rise_save', saveData);
  } catch {
    console.warn('Failed to save game');
  }
}

export function loadGame(): GameState | null {
  try {
    const data = localStorage.getItem('kingdom_rise_save');
    if (!data) return null;
    const state = JSON.parse(data) as GameState;
    // Restore event condition functions (they can't be serialized)
    return state;
  } catch {
    return null;
  }
}

export function deleteSave(): void {
  localStorage.removeItem('kingdom_rise_save');
}

export function getBuilding(state: GameState, id: string): BuildingState | undefined {
  return state.buildings.find(b => b.id === id);
}

export function getBuildingCount(state: GameState, id: string): number {
  const b = state.buildings.find(b => b.id === id);
  return b ? b.count : 0;
}

export function getBuildingLevel(state: GameState, id: string): number {
  const b = state.buildings.find(b => b.id === id);
  return b ? b.level : 0;
}

export function getTotalBuildingEffect(state: GameState, effectKey: string): number {
  let total = 0;
  for (const bs of state.buildings) {
    const def = BUILDINGS.find(b => b.id === bs.id);
    if (!def) continue;
    const effectValue = (def.effects as Record<string, number>)[effectKey] || 0;
    const levelMult = 1 + bs.level * 0.4;
    total += effectValue * bs.count * levelMult;
  }
  return total;
}

export function getTotalUpkeep(state: GameState): number {
  let total = 0;
  for (const bs of state.buildings) {
    const def = BUILDINGS.find(b => b.id === bs.id);
    if (!def) continue;
    total += def.upkeep * bs.count * (1 + bs.level * 0.2);
  }
  return Math.floor(total);
}

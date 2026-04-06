import { GameState, Difficulty, KingdomTrait, KingdomType, BuildingState, Ruler, RulerBackground, TechState, Season } from '../types/game';
import { DIFFICULTY_CONFIG } from '../data/difficulty';
import { BUILDINGS } from '../data/buildings';
import { RULER_BACKGROUNDS } from '../data/rulers';
import { KINGDOM_TYPES } from '../data/kingdoms';
import { TECHNOLOGIES } from '../data/technologies';
import { generateRivalsForGame } from '../data/rivals';
import { ACHIEVEMENTS } from '../data/achievements';

export function createNewGame(
  kingdomName: string,
  difficulty: Difficulty,
  trait: KingdomTrait,
  kingdomType: KingdomType,
  rulerName: string,
  rulerBackground: RulerBackground,
): GameState {
  const config = DIFFICULTY_CONFIG[difficulty];
  const bgDef = RULER_BACKGROUNDS.find(b => b.id === rulerBackground)!;
  const ktDef = KINGDOM_TYPES.find(k => k.id === kingdomType)!;

  // Merge starting resources
  const resources = { ...config.startingResources };

  // Apply kingdom type bonuses
  if (ktDef.startingResources) {
    for (const [key, val] of Object.entries(ktDef.startingResources)) {
      if (typeof val === 'number' && key in resources) {
        (resources as Record<string, number>)[key] += val;
      }
    }
  }

  // Apply ruler background bonuses
  if (bgDef.bonusResources) {
    for (const [key, val] of Object.entries(bgDef.bonusResources)) {
      if (typeof val === 'number' && key in resources) {
        (resources as Record<string, number>)[key] += val;
      }
    }
  }

  // Clamp values
  resources.happiness = Math.max(10, Math.min(100, resources.happiness));
  resources.stability = Math.max(10, Math.min(100, resources.stability));
  resources.armySize = Math.max(2, resources.armySize);
  resources.gold = Math.max(20, resources.gold);
  resources.food = Math.max(20, resources.food);

  const initialBuildings: BuildingState[] = [
    { id: 'farm', level: 0, count: 2 },
    { id: 'house', level: 0, count: 2 },
  ];

  // Add bonus building from kingdom type
  if (ktDef.bonusBuilding) {
    const existing = initialBuildings.find(b => b.id === ktDef.bonusBuilding);
    if (existing) {
      existing.count += 1;
    } else {
      initialBuildings.push({ id: ktDef.bonusBuilding, level: 0, count: 1 });
    }
  }

  const ruler: Ruler = {
    name: rulerName || 'The Monarch',
    background: rulerBackground,
    traits: [bgDef.startingTrait],
    level: 1,
    experience: 0,
    turnsRuled: 0,
    battlesWon: 0,
    battlesLost: 0,
    title: bgDef.title,
  };

  const technologies: TechState[] = TECHNOLOGIES.map(t => ({
    id: t.id,
    researched: false,
    turnsRemaining: t.researchTurns,
  }));

  const rivals = generateRivalsForGame();

  const achievements = ACHIEVEMENTS.map(a => ({
    id: a.id,
    unlocked: false,
  }));

  return {
    phase: 'playing',
    kingdomName,
    difficulty,
    trait,
    kingdomType,
    turn: 1,
    season: 'spring' as Season,
    resources,
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
    peakPopulation: resources.population,
    totalGoldEarned: 0,
    totalTurnsAtWar: 0,
    tutorialStep: 0,
    tutorialDone: false,
    currentTab: 'overview',
    ruler,
    storyLog: [],
    technologies,
    currentResearch: null,
    rivals,
    achievements,
    completedChains: [],
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
    // Ensure new fields exist for old saves
    if (!state.ruler) return null;
    if (!state.technologies) state.technologies = [];
    if (!state.storyLog) state.storyLog = [];
    if (!state.rivals) state.rivals = [];
    if (!state.achievements) state.achievements = [];
    if (!state.completedChains) state.completedChains = [];
    if (!state.kingdomType) state.kingdomType = 'feudal_monarchy';
    if (!state.season) state.season = 'spring';
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

export function addRulerXp(state: GameState, xp: number): GameState {
  if (xp <= 0) return state;
  const ruler = { ...state.ruler };
  ruler.experience += xp;

  // Level up check
  const thresholds = [0, 50, 150, 300, 500, 800, 1200, 2000];
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (ruler.experience >= thresholds[i] && ruler.level < i + 1) {
      ruler.level = i + 1;
    }
  }

  return { ...state, ruler };
}

export function addStoryEntry(state: GameState, text: string, category: 'event' | 'war' | 'build' | 'ruler' | 'achievement' | 'disaster'): GameState {
  const entry = { turn: state.turn, text, category };
  return {
    ...state,
    storyLog: [...state.storyLog.slice(-99), entry],
  };
}

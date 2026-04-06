// ==========================================
// Kingdom Rise - Core Type Definitions
// ==========================================

export type Difficulty = 'easy' | 'normal' | 'hard';

export type KingdomTrait =
  | 'fertile_lands'
  | 'warlike'
  | 'merchant_realm'
  | 'loyal_people'
  | 'stone_realm'
  | 'holy_kingdom';

export interface KingdomTraitDef {
  id: KingdomTrait;
  name: string;
  description: string;
  icon: string;
  modifiers: Partial<ResourceModifiers>;
}

export interface ResourceModifiers {
  goldIncome: number;
  foodProduction: number;
  happinessChange: number;
  stabilityChange: number;
  armyPower: number;
  defenseBonus: number;
  populationGrowth: number;
}

export type TaxLevel = 'very_low' | 'low' | 'normal' | 'high' | 'harsh';

export interface TaxLevelDef {
  id: TaxLevel;
  name: string;
  goldMultiplier: number;
  happinessEffect: number;
  stabilityEffect: number;
}

export type BuildingId =
  | 'farm' | 'granary' | 'house' | 'market' | 'barracks'
  | 'wall' | 'watchtower' | 'blacksmith' | 'town_hall'
  | 'temple' | 'tavern' | 'workshop' | 'trade_post'
  | 'hospital' | 'mine';

export interface BuildingDef {
  id: BuildingId;
  name: string;
  icon: string;
  description: string;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  popRequirement: number;
  unlockTurn: number;
  effects: BuildingEffects;
  upkeep: number;
}

export interface BuildingEffects {
  foodProduction?: number;
  foodStorage?: number;
  goldIncome?: number;
  populationCapacity?: number;
  armyCapacity?: number;
  armyPower?: number;
  defensePower?: number;
  happiness?: number;
  stability?: number;
  productionSpeed?: number;
  tradeIncome?: number;
  healthBonus?: number;
}

export interface BuildingState {
  id: BuildingId;
  level: number;
  count: number;
}

export type PolicyId =
  | 'harsh_taxation' | 'fair_taxation' | 'conscription'
  | 'free_trade' | 'state_religion' | 'public_festivals'
  | 'grain_reserves' | 'martial_law' | 'expansion_doctrine'
  | 'defensive_posture';

export interface PolicyDef {
  id: PolicyId;
  name: string;
  icon: string;
  description: string;
  unlockTurn: number;
  effects: Partial<ResourceModifiers>;
  conflictsWith?: PolicyId[];
}

export type AdvisorId =
  | 'treasurer' | 'general' | 'steward'
  | 'priest' | 'spymaster' | 'architect';

export interface AdvisorDef {
  id: AdvisorId;
  name: string;
  title: string;
  icon: string;
  description: string;
  unlockTurn: number;
  passiveBonus: Partial<ResourceModifiers>;
}

export interface EventChoice {
  text: string;
  effects: Partial<GameResources>;
  delayed?: { turnsLater: number; effects: Partial<GameResources>; message: string };
  requirement?: (state: GameState) => boolean;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'good' | 'bad' | 'war' | 'moral' | 'neutral';
  choices: EventChoice[];
  condition?: (state: GameState) => boolean;
  weight?: number;
  minTurn?: number;
  maxOccurrences?: number;
}

export interface ActiveEvent {
  event: GameEvent;
  resolved: boolean;
  choiceIndex?: number;
}

export interface DelayedEffect {
  triggerTurn: number;
  effects: Partial<GameResources>;
  message: string;
}

export interface GameResources {
  gold: number;
  food: number;
  population: number;
  happiness: number;
  stability: number;
  armySize: number;
  armyMorale: number;
  armyPower: number;
  land: number;
  threat: number;
}

export type UnrestLevel = 'stable' | 'tense' | 'unrest' | 'riots' | 'rebellion' | 'collapse';

export interface TurnSummaryEntry {
  label: string;
  value: number;
  type: 'gold' | 'food' | 'population' | 'happiness' | 'stability' | 'army' | 'land' | 'threat' | 'info';
}

export interface TurnSummary {
  turn: number;
  entries: TurnSummaryEntry[];
  events: string[];
}

export type GamePhase = 'menu' | 'setup' | 'playing' | 'event' | 'summary' | 'gameover';

export type Tab = 'overview' | 'build' | 'army' | 'policies' | 'history';

export interface GameState {
  phase: GamePhase;
  kingdomName: string;
  difficulty: Difficulty;
  trait: KingdomTrait;
  turn: number;
  resources: GameResources;
  maxFood: number;
  maxPopulation: number;
  taxLevel: TaxLevel;
  buildings: BuildingState[];
  activePolicies: PolicyId[];
  activeAdvisors: AdvisorId[];
  unlockedAdvisors: AdvisorId[];
  currentEvent: ActiveEvent | null;
  delayedEffects: DelayedEffect[];
  turnHistory: TurnSummary[];
  eventHistory: string[];
  eventOccurrences: Record<string, number>;
  gameOverReason: string;
  score: number;
  peakPopulation: number;
  totalGoldEarned: number;
  totalTurnsAtWar: number;
  tutorialStep: number;
  tutorialDone: boolean;
  currentTab: Tab;
}

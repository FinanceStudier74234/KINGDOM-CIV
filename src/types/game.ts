// ==========================================
// Kingdom Rise - Core Type Definitions
// ==========================================

export type Difficulty = 'easy' | 'normal' | 'hard';

// ==========================================
// RULER / CHARACTER SYSTEM
// ==========================================

export type RulerTrait =
  | 'brilliant_strategist' | 'silver_tongue' | 'iron_fist'
  | 'pious_heart' | 'merchant_mind' | 'farmers_friend'
  | 'paranoid' | 'cruel' | 'generous' | 'brave'
  | 'cowardly' | 'just' | 'cunning' | 'scholarly'
  | 'charismatic' | 'stubborn';

export interface RulerTraitDef {
  id: RulerTrait;
  name: string;
  icon: string;
  description: string;
  category: 'positive' | 'negative' | 'neutral';
  effects: Partial<ResourceModifiers>;
}

export type RulerBackground =
  | 'noble_heir' | 'military_commander' | 'merchant_prince'
  | 'holy_crusader' | 'peasant_revolutionary' | 'exiled_prince'
  | 'scholar_king' | 'barbarian_warlord';

export interface RulerBackgroundDef {
  id: RulerBackground;
  name: string;
  icon: string;
  title: string;
  backstory: string;
  startingTrait: RulerTrait;
  bonusResources: Partial<GameResources>;
  specialAbility: string;
  abilityDescription: string;
}

export interface Ruler {
  name: string;
  background: RulerBackground;
  traits: RulerTrait[];
  level: number;
  experience: number;
  turnsRuled: number;
  battlesWon: number;
  battlesLost: number;
  title: string;
}

// ==========================================
// KINGDOM TYPES
// ==========================================

export type KingdomType =
  | 'feudal_monarchy' | 'trade_republic' | 'theocracy'
  | 'military_empire' | 'tribal_confederation' | 'island_realm'
  | 'mountain_fortress' | 'desert_sultanate';

export interface KingdomTypeDef {
  id: KingdomType;
  name: string;
  icon: string;
  lore: string;
  description: string;
  bonusBuilding: BuildingId;
  startingResources: Partial<GameResources>;
  modifiers: Partial<ResourceModifiers>;
  uniqueEventIds: string[];
  specialMechanic: string;
}

// ==========================================
// KINGDOM TRAITS (legacy, now called perks)
// ==========================================

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

// ==========================================
// BUILDINGS
// ==========================================

export type BuildingId =
  | 'farm' | 'granary' | 'house' | 'market' | 'barracks'
  | 'wall' | 'watchtower' | 'blacksmith' | 'town_hall'
  | 'temple' | 'tavern' | 'workshop' | 'trade_post'
  | 'hospital' | 'mine'
  | 'library' | 'stable' | 'harbor' | 'cathedral'
  | 'academy' | 'treasury' | 'siege_workshop' | 'spy_den'
  | 'monument' | 'aqueduct';

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
  lore?: string;
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
  researchSpeed?: number;
  spyPower?: number;
}

export interface BuildingState {
  id: BuildingId;
  level: number;
  count: number;
}

// ==========================================
// POLICIES
// ==========================================

export type PolicyId =
  | 'harsh_taxation' | 'fair_taxation' | 'conscription'
  | 'free_trade' | 'state_religion' | 'public_festivals'
  | 'grain_reserves' | 'martial_law' | 'expansion_doctrine'
  | 'defensive_posture'
  | 'royal_decree' | 'land_reform' | 'guild_charters'
  | 'border_patrols' | 'education_mandate';

export interface PolicyDef {
  id: PolicyId;
  name: string;
  icon: string;
  description: string;
  unlockTurn: number;
  effects: Partial<ResourceModifiers>;
  conflictsWith?: PolicyId[];
}

// ==========================================
// ADVISORS
// ==========================================

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

// ==========================================
// SEASONS
// ==========================================

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface SeasonDef {
  id: Season;
  name: string;
  icon: string;
  foodModifier: number;
  goldModifier: number;
  happinessModifier: number;
  threatModifier: number;
  description: string;
}

// ==========================================
// ACHIEVEMENTS
// ==========================================

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (state: GameState) => boolean;
  unlocked: boolean;
}

export interface AchievementSave {
  id: string;
  unlocked: boolean;
  unlockedAt?: number;
}

// ==========================================
// TECHNOLOGIES
// ==========================================

export type TechId =
  | 'agriculture' | 'masonry' | 'bronze_working' | 'writing'
  | 'iron_working' | 'horseback_riding' | 'mathematics'
  | 'engineering' | 'medicine' | 'navigation'
  | 'gunpowder' | 'banking' | 'printing_press' | 'fortification';

export interface TechDef {
  id: TechId;
  name: string;
  icon: string;
  description: string;
  cost: number;
  researchTurns: number;
  effects: Partial<ResourceModifiers>;
  unlocks?: BuildingId[];
  requires?: TechId[];
}

export interface TechState {
  id: TechId;
  researched: boolean;
  turnsRemaining: number;
}

// ==========================================
// DIPLOMACY
// ==========================================

export type DiplomacyStatus = 'neutral' | 'friendly' | 'allied' | 'hostile' | 'war';

export interface RivalKingdom {
  id: string;
  name: string;
  icon: string;
  personality: string;
  strength: number;
  status: DiplomacyStatus;
  relation: number; // -100 to 100
  description: string;
}

// ==========================================
// EVENTS
// ==========================================

export interface EventChoice {
  text: string;
  effects: Partial<GameResources>;
  delayed?: { turnsLater: number; effects: Partial<GameResources>; message: string };
  requirement?: (state: GameState) => boolean;
  rulerXp?: number;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'good' | 'bad' | 'war' | 'moral' | 'neutral' | 'story' | 'ruler';
  choices: EventChoice[];
  condition?: (state: GameState) => boolean;
  weight?: number;
  minTurn?: number;
  maxOccurrences?: number;
  chainId?: string;
  chainNext?: string;
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

export interface StoryLogEntry {
  turn: number;
  text: string;
  category: 'event' | 'war' | 'build' | 'ruler' | 'achievement' | 'disaster';
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

export type Tab = 'overview' | 'build' | 'army' | 'policies' | 'history' | 'ruler';

export interface GameState {
  phase: GamePhase;
  kingdomName: string;
  difficulty: Difficulty;
  trait: KingdomTrait;
  kingdomType: KingdomType;
  turn: number;
  season: Season;
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
  // New systems
  ruler: Ruler;
  storyLog: StoryLogEntry[];
  technologies: TechState[];
  currentResearch: TechId | null;
  rivals: RivalKingdom[];
  achievements: AchievementSave[];
  completedChains: string[];
}

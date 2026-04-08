import { Achievement, GameState } from '../types/game';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_steps', name: 'First Steps', icon: '👣',
    description: 'Survive 5 turns.',
    condition: (s: GameState) => s.turn >= 5, unlocked: false,
  },
  {
    id: 'a_decade', name: 'A Decade of Rule', icon: '📅',
    description: 'Survive 12 turns (one full year).',
    condition: (s: GameState) => s.turn >= 12, unlocked: false,
  },
  {
    id: 'century_ruler', name: 'Century Ruler', icon: '🏆',
    description: 'Survive 100 turns.',
    condition: (s: GameState) => s.turn >= 100, unlocked: false,
  },
  {
    id: 'population_boom', name: 'Population Boom', icon: '👥',
    description: 'Reach 200 population.',
    condition: (s: GameState) => s.resources.population >= 200, unlocked: false,
  },
  {
    id: 'golden_treasury', name: 'Golden Treasury', icon: '💰',
    description: 'Accumulate 500 gold.',
    condition: (s: GameState) => s.resources.gold >= 500, unlocked: false,
  },
  {
    id: 'breadbasket', name: 'Breadbasket Kingdom', icon: '🍞',
    description: 'Accumulate 300 food.',
    condition: (s: GameState) => s.resources.food >= 300, unlocked: false,
  },
  {
    id: 'master_builder', name: 'Master Builder', icon: '🏗️',
    description: 'Own 20 total buildings.',
    condition: (s: GameState) => s.buildings.reduce((sum, b) => sum + b.count, 0) >= 20, unlocked: false,
  },
  {
    id: 'warlord', name: 'Warlord', icon: '⚔️',
    description: 'Reach 50 army size.',
    condition: (s: GameState) => s.resources.armySize >= 50, unlocked: false,
  },
  {
    id: 'peacekeeper', name: 'Peacekeeper', icon: '🕊️',
    description: 'Maintain happiness above 75 for 10 consecutive turns.',
    condition: (s: GameState) => {
      const last10 = s.turnHistory.slice(-10);
      return last10.length >= 10 && s.resources.happiness > 75;
    }, unlocked: false,
  },
  {
    id: 'great_expansion', name: 'Great Expansion', icon: '🗺️',
    description: 'Control 10 land.',
    condition: (s: GameState) => s.resources.land >= 10, unlocked: false,
  },
  {
    id: 'iron_kingdom', name: 'Iron Kingdom', icon: '🏰',
    description: 'Reach 100 stability.',
    condition: (s: GameState) => s.resources.stability >= 100, unlocked: false,
  },
  {
    id: 'beloved_ruler', name: 'Beloved Ruler', icon: '❤️',
    description: 'Reach 100 happiness.',
    condition: (s: GameState) => s.resources.happiness >= 100, unlocked: false,
  },
  {
    id: 'survivor', name: 'Survivor', icon: '🔥',
    description: 'Recover from rebellion (stability below 15 then above 60).',
    condition: (s: GameState) => {
      const had_crisis = s.turnHistory.some(t => t.events.some(e => e.includes('Rebellion') || e.includes('rebellion')));
      return had_crisis && s.resources.stability > 60;
    }, unlocked: false,
  },
  {
    id: 'scholar_ruler', name: 'Scholar Ruler', icon: '📚',
    description: 'Research 5 technologies.',
    condition: (s: GameState) => s.technologies.filter(t => t.researched).length >= 5, unlocked: false,
  },
  {
    id: 'grand_empire', name: 'Grand Empire', icon: '🦅',
    description: 'Reach score of 3000.',
    condition: (s: GameState) => s.score >= 3000, unlocked: false,
  },
  {
    id: 'no_one_starved', name: 'No One Starved', icon: '🌾',
    description: 'Survive 50 turns without food ever reaching 0.',
    condition: (s: GameState) => {
      return s.turn >= 50 && !s.turnHistory.some(t => t.events.some(e => e.includes('Starvation')));
    }, unlocked: false,
  },
  {
    id: 'level_five_ruler', name: 'Wise Ruler', icon: '🧠',
    description: 'Reach ruler level 5.',
    condition: (s: GameState) => s.ruler && s.ruler.level >= 5, unlocked: false,
  },
  {
    id: 'event_veteran', name: 'Event Veteran', icon: '📖',
    description: 'Experience 30 different events.',
    condition: (s: GameState) => Object.keys(s.eventOccurrences).length >= 30, unlocked: false,
  },
];

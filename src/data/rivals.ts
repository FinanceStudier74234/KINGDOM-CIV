import { RivalKingdom } from '../types/game';

export const RIVAL_KINGDOMS: RivalKingdom[] = [
  {
    id: 'ironhold',
    name: 'The Ironhold Dominion',
    icon: '🦅',
    personality: 'Aggressive',
    strength: 30,
    status: 'neutral',
    relation: 0,
    description: 'A militaristic empire obsessed with conquest. Their iron legions march endlessly.',
  },
  {
    id: 'silvervale',
    name: 'Silvervale Republic',
    icon: '⚓',
    personality: 'Mercantile',
    strength: 20,
    status: 'neutral',
    relation: 10,
    description: 'Wealthy traders who prefer gold to swords. They fund wars but rarely fight them.',
  },
  {
    id: 'thornwood',
    name: 'Thornwood Clans',
    icon: '🌲',
    personality: 'Defensive',
    strength: 25,
    status: 'neutral',
    relation: 5,
    description: 'Forest-dwelling clans who fiercely defend their ancient woodland realm.',
  },
  {
    id: 'sunspire',
    name: 'The Sunspire Caliphate',
    icon: '☀️',
    personality: 'Religious',
    strength: 28,
    status: 'neutral',
    relation: -5,
    description: 'A theocratic state ruled by sun-priests. Zealous and unpredictable.',
  },
  {
    id: 'frostmarch',
    name: 'Frostmarch Confederation',
    icon: '❄️',
    personality: 'Raider',
    strength: 22,
    status: 'hostile',
    relation: -20,
    description: 'Northern raiders who strike in winter. They take what they want and vanish.',
  },
];

export function generateRivalsForGame(): RivalKingdom[] {
  // Pick 3 random rivals for this game
  const shuffled = [...RIVAL_KINGDOMS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map(r => ({ ...r }));
}

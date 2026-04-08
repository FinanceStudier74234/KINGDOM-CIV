import { SeasonDef } from '../types/game';

export const SEASONS: SeasonDef[] = [
  {
    id: 'spring',
    name: 'Spring',
    icon: '🌸',
    foodModifier: 1.15,
    goldModifier: 1.0,
    happinessModifier: 1.05,
    threatModifier: 1.0,
    description: 'The land awakens. Crops begin to grow and spirits lift.',
  },
  {
    id: 'summer',
    name: 'Summer',
    icon: '☀️',
    foodModifier: 1.25,
    goldModifier: 1.1,
    happinessModifier: 1.1,
    threatModifier: 1.1,
    description: 'Long days of plenty, but enemies are also on the move.',
  },
  {
    id: 'autumn',
    name: 'Autumn',
    icon: '🍂',
    foodModifier: 1.1,
    goldModifier: 1.05,
    happinessModifier: 1.0,
    threatModifier: 0.9,
    description: 'The harvest is gathered. Prepare for the cold ahead.',
  },
  {
    id: 'winter',
    name: 'Winter',
    icon: '❄️',
    foodModifier: 0.65,
    goldModifier: 0.9,
    happinessModifier: 0.92,
    threatModifier: 0.5,
    description: 'The cold bites hard. Food production drops, but invaders stay home.',
  },
];

export function getSeasonForTurn(turn: number): SeasonDef {
  const index = (turn - 1) % 4;
  return SEASONS[index];
}

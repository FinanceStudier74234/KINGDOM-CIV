import { KingdomTraitDef } from '../types/game';

export const KINGDOM_TRAITS: KingdomTraitDef[] = [
  {
    id: 'fertile_lands',
    name: 'Fertile Lands',
    description: 'Rich soil grants bonus food production each turn.',
    icon: '🌿',
    modifiers: { foodProduction: 0.25 },
  },
  {
    id: 'warlike',
    name: 'Warlike',
    description: 'A martial tradition strengthens your army.',
    icon: '⚔️',
    modifiers: { armyPower: 0.2 },
  },
  {
    id: 'merchant_realm',
    name: 'Merchant Realm',
    description: 'Trade flows freely, boosting gold income.',
    icon: '💰',
    modifiers: { goldIncome: 0.2 },
  },
  {
    id: 'loyal_people',
    name: 'Loyal People',
    description: 'Your subjects are unusually devoted, granting stability.',
    icon: '👑',
    modifiers: { stabilityChange: 0.15, happinessChange: 0.1 },
  },
  {
    id: 'stone_realm',
    name: 'Stone Realm',
    description: 'Mountains provide natural defenses.',
    icon: '🏔️',
    modifiers: { defenseBonus: 0.3 },
  },
  {
    id: 'holy_kingdom',
    name: 'Holy Kingdom',
    description: 'Faith unites the people, boosting happiness and stability.',
    icon: '✝️',
    modifiers: { happinessChange: 0.15, stabilityChange: 0.1 },
  },
];

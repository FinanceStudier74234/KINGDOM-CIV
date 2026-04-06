import { RulerTraitDef, RulerBackgroundDef } from '../types/game';

export const RULER_TRAITS: RulerTraitDef[] = [
  // POSITIVE
  {
    id: 'brilliant_strategist', name: 'Brilliant Strategist', icon: '🧠',
    description: 'A master of warfare and logistics.',
    category: 'positive',
    effects: { armyPower: 0.15, defenseBonus: 0.1 },
  },
  {
    id: 'silver_tongue', name: 'Silver Tongue', icon: '🗣️',
    description: 'Can talk anyone into anything.',
    category: 'positive',
    effects: { goldIncome: 0.1, happinessChange: 0.08 },
  },
  {
    id: 'pious_heart', name: 'Pious Heart', icon: '🙏',
    description: 'Deeply faithful, inspiring devotion.',
    category: 'positive',
    effects: { stabilityChange: 0.12, happinessChange: 0.05 },
  },
  {
    id: 'merchant_mind', name: 'Merchant Mind', icon: '💎',
    description: 'Born for trade and commerce.',
    category: 'positive',
    effects: { goldIncome: 0.18 },
  },
  {
    id: 'farmers_friend', name: "Farmer's Friend", icon: '🌱',
    description: 'Understands the land and its people.',
    category: 'positive',
    effects: { foodProduction: 0.15, populationGrowth: 0.1 },
  },
  {
    id: 'generous', name: 'Generous', icon: '🎁',
    description: 'Open-handed with gold and kindness.',
    category: 'positive',
    effects: { happinessChange: 0.12, goldIncome: -0.05 },
  },
  {
    id: 'brave', name: 'Brave', icon: '🦁',
    description: 'Fearless in battle and in court.',
    category: 'positive',
    effects: { armyPower: 0.1, stabilityChange: 0.05 },
  },
  {
    id: 'just', name: 'Just', icon: '⚖️',
    description: 'Fair and balanced in all judgments.',
    category: 'positive',
    effects: { stabilityChange: 0.1, happinessChange: 0.08 },
  },
  {
    id: 'scholarly', name: 'Scholarly', icon: '📚',
    description: 'Loves knowledge and learning.',
    category: 'positive',
    effects: { stabilityChange: 0.08 },
  },
  {
    id: 'charismatic', name: 'Charismatic', icon: '✨',
    description: 'People are drawn to your presence.',
    category: 'positive',
    effects: { happinessChange: 0.15, populationGrowth: 0.08 },
  },
  // NEGATIVE
  {
    id: 'iron_fist', name: 'Iron Fist', icon: '✊',
    description: 'Rules through fear and force.',
    category: 'neutral',
    effects: { stabilityChange: 0.1, happinessChange: -0.1, armyPower: 0.05 },
  },
  {
    id: 'paranoid', name: 'Paranoid', icon: '👁️',
    description: 'Sees conspiracies everywhere.',
    category: 'negative',
    effects: { stabilityChange: -0.05, defenseBonus: 0.1 },
  },
  {
    id: 'cruel', name: 'Cruel', icon: '🩸',
    description: 'Takes pleasure in others\' suffering.',
    category: 'negative',
    effects: { happinessChange: -0.15, stabilityChange: 0.08 },
  },
  {
    id: 'cowardly', name: 'Cowardly', icon: '🐁',
    description: 'Avoids conflict at all costs.',
    category: 'negative',
    effects: { armyPower: -0.1, happinessChange: -0.05 },
  },
  {
    id: 'cunning', name: 'Cunning', icon: '🦊',
    description: 'Clever and devious, but untrustworthy.',
    category: 'neutral',
    effects: { goldIncome: 0.1, stabilityChange: -0.05 },
  },
  {
    id: 'stubborn', name: 'Stubborn', icon: '🪨',
    description: 'Immovable once a decision is made.',
    category: 'neutral',
    effects: { stabilityChange: 0.05, happinessChange: -0.05 },
  },
];

export const RULER_BACKGROUNDS: RulerBackgroundDef[] = [
  {
    id: 'noble_heir',
    name: 'Noble Heir',
    icon: '👑',
    title: 'Lord',
    backstory: 'Born to a great house, you were raised in courts and castles. Your father\'s kingdom was once mighty, but years of decline have left it weakened. Now you inherit the crown — and all its problems. The nobles expect privilege, the people expect justice, and enemies circle like vultures. Can you restore your birthright?',
    startingTrait: 'charismatic',
    bonusResources: { gold: 30, stability: 5 },
    specialAbility: 'Royal Authority',
    abilityDescription: 'Tax income +10% from noble connections.',
  },
  {
    id: 'military_commander',
    name: 'Military Commander',
    icon: '⚔️',
    title: 'Commander',
    backstory: 'You earned your crown on the battlefield. After the old king fell in battle, the army rallied behind you — their bravest general. But swords alone don\'t build kingdoms. The treasury is empty, the people don\'t know you, and the nobles resent a commoner on the throne. Prove that a warrior can also be a king.',
    startingTrait: 'brilliant_strategist',
    bonusResources: { armySize: 8, armyPower: 5, armyMorale: 10 },
    specialAbility: 'Battle Hardened',
    abilityDescription: 'Army power +15%, morale loss reduced.',
  },
  {
    id: 'merchant_prince',
    name: 'Merchant Prince',
    icon: '💰',
    title: 'Chancellor',
    backstory: 'Your family\'s wealth bought what swords could not — a throne. The greatest merchant house in the realm, you leveraged debts, favors, and a strategic marriage to seize power. But money can\'t buy loyalty forever. The old nobility despises you, the army doesn\'t respect you, and the common folk see only greed. Can gold buy a kingdom?',
    startingTrait: 'merchant_mind',
    bonusResources: { gold: 60, happiness: -5 },
    specialAbility: 'Trade Networks',
    abilityDescription: 'Gold income +20%, trade buildings cost less.',
  },
  {
    id: 'holy_crusader',
    name: 'Holy Crusader',
    icon: '✝️',
    title: 'Ordained Ruler',
    backstory: 'The church placed you on the throne. After a pilgrimage that became a holy war, you returned a hero of the faith. The clergy supports you absolutely, but the secular lords are nervous. Your kingdom is poor but faithful. Divine right is your weapon — but heaven doesn\'t send grain ships.',
    startingTrait: 'pious_heart',
    bonusResources: { stability: 10, happiness: 8, gold: -20 },
    specialAbility: 'Divine Mandate',
    abilityDescription: 'Stability +12%, religious events more positive.',
  },
  {
    id: 'peasant_revolutionary',
    name: 'Peasant Revolutionary',
    icon: '✊',
    title: 'Peoples\' Champion',
    backstory: 'You led a revolution. When the old tyrant raised taxes one last time, you rallied the farmers, miners, and craftsmen. The old order burned — and now you must build something new from the ashes. The people love you, but you have no allies among the powerful. No army, no treasury, no experience. Just the will of the common folk.',
    startingTrait: 'just',
    bonusResources: { happiness: 12, population: 8, gold: -30, stability: -10 },
    specialAbility: 'Peoples\' Will',
    abilityDescription: 'Happiness +15%, rebellion chance reduced.',
  },
  {
    id: 'exiled_prince',
    name: 'Exiled Prince',
    icon: '🌙',
    title: 'Returned Prince',
    backstory: 'Exiled as a child when your family was overthrown, you spent years wandering foreign courts, learning statecraft, languages, and the art of survival. Now you\'ve returned with a small band of loyal followers to reclaim what was stolen. The kingdom remembers your name — some with hope, others with fear.',
    startingTrait: 'cunning',
    bonusResources: { gold: 10, armySize: 5, threat: -5 },
    specialAbility: 'Worldly Wisdom',
    abilityDescription: 'Better event choices, diplomatic bonuses.',
  },
  {
    id: 'scholar_king',
    name: 'Scholar King',
    icon: '📜',
    title: 'Sage',
    backstory: 'You never wanted the crown. A lifetime spent in libraries and observatories prepared you for scholarship, not sovereignty. But when plague and war killed every other heir, the council turned to you — the forgotten royal, the one who understood medicine, agriculture, engineering. Now your knowledge must save a dying kingdom.',
    startingTrait: 'scholarly',
    bonusResources: { stability: 8, food: 15 },
    specialAbility: 'Renaissance Mind',
    abilityDescription: 'Research speed +25%, building upgrades cheaper.',
  },
  {
    id: 'barbarian_warlord',
    name: 'Barbarian Warlord',
    icon: '🪓',
    title: 'Warlord',
    backstory: 'You came from beyond the frontier. Your horde conquered this land by force, and now you sit on a throne built from the wreckage of civilization. The conquered people fear you. The neighboring kingdoms hate you. But your warriors are fierce, your will is iron, and empires have been built from less.',
    startingTrait: 'iron_fist',
    bonusResources: { armySize: 12, armyPower: 8, happiness: -10, stability: -5, land: 1 },
    specialAbility: 'Horde Tactics',
    abilityDescription: 'Army recruitment cheaper, conquest rewards doubled.',
  },
];

export const RULER_LEVELS = [
  { level: 1, title: 'Fledgling Ruler', xpRequired: 0 },
  { level: 2, title: 'Apprentice Sovereign', xpRequired: 50 },
  { level: 3, title: 'Capable Leader', xpRequired: 150 },
  { level: 4, title: 'Seasoned Monarch', xpRequired: 300 },
  { level: 5, title: 'Wise Ruler', xpRequired: 500 },
  { level: 6, title: 'Great Sovereign', xpRequired: 800 },
  { level: 7, title: 'Legendary Monarch', xpRequired: 1200 },
  { level: 8, title: 'Eternal Sovereign', xpRequired: 2000 },
];

export function getRulerLevel(xp: number): { level: number; title: string; nextXp: number } {
  for (let i = RULER_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= RULER_LEVELS[i].xpRequired) {
      const nextXp = i < RULER_LEVELS.length - 1 ? RULER_LEVELS[i + 1].xpRequired : RULER_LEVELS[i].xpRequired;
      return { level: RULER_LEVELS[i].level, title: RULER_LEVELS[i].title, nextXp };
    }
  }
  return { level: 1, title: 'Fledgling Ruler', nextXp: 50 };
}

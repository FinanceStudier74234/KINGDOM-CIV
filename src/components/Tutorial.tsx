import React from 'react';

interface Props {
  step: number;
  onNext: () => void;
  onSkip: () => void;
}

const TUTORIAL_STEPS = [
  {
    title: 'Welcome, Ruler! 👑',
    text: 'You rule a fragile kingdom. Every turn is one month. Keep your people fed, your treasury full, and your borders safe.',
  },
  {
    title: 'Food is Life 🍞',
    text: 'Food keeps your people alive. Build Farms to produce food. If food runs out, people starve and die. Watch the food counter carefully!',
  },
  {
    title: 'Gold & Taxes 💰',
    text: 'Taxes bring gold from your people, but high taxes reduce happiness. Balance your income to fund buildings and your army.',
  },
  {
    title: 'Your Army ⚔️',
    text: 'Soldiers protect against invasions but cost gold and food each turn. A big army is powerful but expensive. Build wisely.',
  },
  {
    title: 'Happiness & Stability 🏛️',
    text: 'Low happiness leads to unrest. Low stability leads to rebellion. Both can destroy your kingdom. Keep your people content!',
  },
  {
    title: 'Build & Grow 🏗️',
    text: 'Use the Build tab to construct farms, houses, markets, walls, and more. Buildings give passive bonuses each turn. Now go forth and rule!',
  },
];

export const Tutorial: React.FC<Props> = ({ step, onNext, onSkip }) => {
  if (step >= TUTORIAL_STEPS.length) return null;

  const current = TUTORIAL_STEPS[step];

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-card">
        <div className="tutorial-progress">
          {TUTORIAL_STEPS.map((_, i) => (
            <div key={i} className={`tutorial-dot ${i <= step ? 'dot-active' : ''}`} />
          ))}
        </div>
        <h3 className="tutorial-title">{current.title}</h3>
        <p className="tutorial-text">{current.text}</p>
        <div className="tutorial-actions">
          <button className="btn btn-secondary" onClick={onSkip}>Skip Tutorial</button>
          <button className="btn btn-primary" onClick={onNext}>
            {step === TUTORIAL_STEPS.length - 1 ? 'Start Ruling!' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

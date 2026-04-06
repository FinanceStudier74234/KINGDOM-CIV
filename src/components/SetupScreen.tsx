import React, { useState } from 'react';
import { Difficulty, KingdomTrait } from '../types/game';
import { KINGDOM_TRAITS } from '../data/traits';

interface Props {
  onStart: (name: string, difficulty: Difficulty, trait: KingdomTrait) => void;
  onBack: () => void;
}

export const SetupScreen: React.FC<Props> = ({ onStart, onBack }) => {
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [trait, setTrait] = useState<KingdomTrait>('fertile_lands');

  const handleStart = () => {
    const kingdomName = name.trim() || 'Unnamed Kingdom';
    onStart(kingdomName, difficulty, trait);
  };

  return (
    <div className="setup-screen">
      <div className="setup-content">
        <h2>Forge Your Kingdom</h2>

        <div className="setup-section">
          <label className="setup-label">Kingdom Name</label>
          <input
            className="setup-input"
            type="text"
            placeholder="Enter kingdom name..."
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={24}
          />
        </div>

        <div className="setup-section">
          <label className="setup-label">Difficulty</label>
          <div className="difficulty-buttons">
            {(['easy', 'normal', 'hard'] as Difficulty[]).map(d => (
              <button
                key={d}
                className={`btn btn-diff ${difficulty === d ? 'btn-diff-active' : ''}`}
                onClick={() => setDifficulty(d)}
              >
                <span className="diff-icon">
                  {d === 'easy' ? '🌿' : d === 'normal' ? '⚔️' : '💀'}
                </span>
                <span className="diff-name">{d.charAt(0).toUpperCase() + d.slice(1)}</span>
                <span className="diff-desc">
                  {d === 'easy' ? 'Forgiving' : d === 'normal' ? 'Balanced' : 'Brutal'}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="setup-section">
          <label className="setup-label">Kingdom Trait</label>
          <div className="trait-grid">
            {KINGDOM_TRAITS.map(t => (
              <button
                key={t.id}
                className={`btn btn-trait ${trait === t.id ? 'btn-trait-active' : ''}`}
                onClick={() => setTrait(t.id)}
              >
                <span className="trait-icon">{t.icon}</span>
                <span className="trait-name">{t.name}</span>
                <span className="trait-desc">{t.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="setup-actions">
          <button className="btn btn-secondary" onClick={onBack}>Back</button>
          <button className="btn btn-primary btn-large" onClick={handleStart}>
            Begin Your Reign
          </button>
        </div>
      </div>
    </div>
  );
};

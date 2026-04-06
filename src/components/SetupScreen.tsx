import React, { useState } from 'react';
import { Difficulty, KingdomTrait, KingdomType, RulerBackground } from '../types/game';
import { KINGDOM_TRAITS } from '../data/traits';
import { KINGDOM_TYPES } from '../data/kingdoms';
import { RULER_BACKGROUNDS } from '../data/rulers';

interface Props {
  onStart: (name: string, difficulty: Difficulty, trait: KingdomTrait, kingdomType: KingdomType, rulerName: string, rulerBackground: RulerBackground) => void;
  onBack: () => void;
}

export const SetupScreen: React.FC<Props> = ({ onStart, onBack }) => {
  const [step, setStep] = useState(0); // 0: kingdom, 1: ruler
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [trait, setTrait] = useState<KingdomTrait>('fertile_lands');
  const [kingdomType, setKingdomType] = useState<KingdomType>('feudal_monarchy');
  const [rulerName, setRulerName] = useState('');
  const [rulerBg, setRulerBg] = useState<RulerBackground>('noble_heir');

  const handleStart = () => {
    onStart(name.trim() || 'Unnamed Kingdom', difficulty, trait, kingdomType, rulerName.trim() || 'The Monarch', rulerBg);
  };

  if (step === 0) {
    return (
      <div className="setup-screen">
        <div className="setup-content">
          <h2>Forge Your Kingdom</h2>

          <div className="setup-section">
            <label className="setup-label">Kingdom Name</label>
            <input className="setup-input" type="text" placeholder="Enter kingdom name..." value={name} onChange={e => setName(e.target.value)} maxLength={24} />
          </div>

          <div className="setup-section">
            <label className="setup-label">Difficulty</label>
            <div className="difficulty-buttons">
              {(['easy', 'normal', 'hard'] as Difficulty[]).map(d => (
                <button key={d} className={`btn btn-diff ${difficulty === d ? 'btn-diff-active' : ''}`} onClick={() => setDifficulty(d)}>
                  <span className="diff-icon">{d === 'easy' ? '🌿' : d === 'normal' ? '⚔️' : '💀'}</span>
                  <span className="diff-name">{d.charAt(0).toUpperCase() + d.slice(1)}</span>
                  <span className="diff-desc">{d === 'easy' ? 'Forgiving' : d === 'normal' ? 'Balanced' : 'Brutal'}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="setup-section">
            <label className="setup-label">Kingdom Type</label>
            <div className="kingdom-type-list">
              {KINGDOM_TYPES.map(kt => (
                <button key={kt.id} className={`btn btn-kingdom-type ${kingdomType === kt.id ? 'btn-kingdom-type-active' : ''}`} onClick={() => setKingdomType(kt.id)}>
                  <div className="kt-header">
                    <span className="kt-icon">{kt.icon}</span>
                    <span className="kt-name">{kt.name}</span>
                  </div>
                  <span className="kt-desc">{kt.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="setup-section">
            <label className="setup-label">Kingdom Perk</label>
            <div className="trait-grid">
              {KINGDOM_TRAITS.map(t => (
                <button key={t.id} className={`btn btn-trait ${trait === t.id ? 'btn-trait-active' : ''}`} onClick={() => setTrait(t.id)}>
                  <span className="trait-icon">{t.icon}</span>
                  <span className="trait-name">{t.name}</span>
                  <span className="trait-desc">{t.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="setup-actions">
            <button className="btn btn-secondary" onClick={onBack}>Back</button>
            <button className="btn btn-primary btn-large" onClick={() => setStep(1)}>Choose Your Ruler →</button>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Ruler creation
  const selectedBg = RULER_BACKGROUNDS.find(b => b.id === rulerBg)!;

  return (
    <div className="setup-screen">
      <div className="setup-content">
        <h2>Your Ruler</h2>

        <div className="setup-section">
          <label className="setup-label">Ruler Name</label>
          <input className="setup-input" type="text" placeholder="Enter ruler name..." value={rulerName} onChange={e => setRulerName(e.target.value)} maxLength={24} />
        </div>

        <div className="setup-section">
          <label className="setup-label">Origin Story</label>
          <div className="ruler-bg-list">
            {RULER_BACKGROUNDS.map(bg => (
              <button key={bg.id} className={`btn btn-ruler-bg ${rulerBg === bg.id ? 'btn-ruler-bg-active' : ''}`} onClick={() => setRulerBg(bg.id)}>
                <div className="rbg-header">
                  <span className="rbg-icon">{bg.icon}</span>
                  <div className="rbg-info">
                    <span className="rbg-name">{bg.name}</span>
                    <span className="rbg-ability">{bg.specialAbility}</span>
                  </div>
                </div>
                <span className="rbg-desc">{bg.abilityDescription}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected backstory */}
        <div className="card backstory-card">
          <h3 className="card-title">{selectedBg.icon} {selectedBg.name}</h3>
          <p className="backstory-text">{selectedBg.backstory}</p>
          <div className="backstory-trait">
            Starting Trait: <strong>{selectedBg.startingTrait.replace(/_/g, ' ')}</strong>
          </div>
        </div>

        <div className="setup-actions">
          <button className="btn btn-secondary" onClick={() => setStep(0)}>← Back</button>
          <button className="btn btn-primary btn-large" onClick={handleStart}>Begin Your Reign</button>
        </div>
      </div>
    </div>
  );
};

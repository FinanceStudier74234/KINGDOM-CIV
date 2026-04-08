import React, { useState } from 'react';
import { Difficulty, KingdomTrait, KingdomType, RulerBackground } from '../types/game';
import { KINGDOM_TRAITS } from '../data/traits';
import { KINGDOM_TYPES } from '../data/kingdoms';
import { RULER_BACKGROUNDS, RULER_TRAITS } from '../data/rulers';
import { DIFFICULTY_CONFIG } from '../data/difficulty';
import { BUILDINGS } from '../data/buildings';

interface Props {
  onStart: (name: string, difficulty: Difficulty, trait: KingdomTrait, kingdomType: KingdomType, rulerName: string, rulerBackground: RulerBackground) => void;
  onBack: () => void;
}

function StatBadge({ label, positive }: { label: string; positive?: boolean }) {
  const cls = positive === undefined ? 'stat-badge-neutral' : positive ? 'stat-badge-pos' : 'stat-badge-neg';
  return <span className={`stat-badge ${cls}`}>{label}</span>;
}

function formatModifier(key: string, val: number): { label: string; positive: boolean } {
  const sign = val >= 0 ? '+' : '';
  const pct = Math.round(val * 100);
  const names: Record<string, string> = {
    goldIncome: 'Gold', foodProduction: 'Food', happinessChange: 'Happy',
    stabilityChange: 'Stability', armyPower: 'Army', defenseBonus: 'Defense',
    populationGrowth: 'Pop Growth',
  };
  return { label: `${sign}${pct}% ${names[key] || key}`, positive: val >= 0 };
}

function formatResource(key: string, val: number): { label: string; positive: boolean } {
  const sign = val >= 0 ? '+' : '';
  const names: Record<string, string> = {
    gold: '💰', food: '🍞', population: '👥', happiness: '😊',
    stability: '🏛️', armySize: '⚔️', armyPower: '🗡️', armyMorale: '💪',
    land: '🗺️', threat: '⚠️',
  };
  return { label: `${sign}${val} ${names[key] || key}`, positive: key === 'threat' ? val <= 0 : val >= 0 };
}

export const SetupScreen: React.FC<Props> = ({ onStart, onBack }) => {
  const [step, setStep] = useState(0);
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
    const selectedDiff = DIFFICULTY_CONFIG[difficulty];
    const selectedKt = KINGDOM_TYPES.find(k => k.id === kingdomType)!;

    return (
      <div className="setup-screen">
        <div className="setup-content">
          <h2>Forge Your Kingdom</h2>

          {/* Kingdom Name */}
          <div className="setup-section">
            <label className="setup-label">Kingdom Name</label>
            <input className="setup-input" type="text" placeholder="Enter kingdom name..." value={name} onChange={e => setName(e.target.value)} maxLength={24} />
          </div>

          {/* Difficulty — now with full stats */}
          <div className="setup-section">
            <label className="setup-label">Difficulty</label>
            <div className="difficulty-buttons">
              {(['easy', 'normal', 'hard'] as Difficulty[]).map(d => {
                const cfg = DIFFICULTY_CONFIG[d];
                return (
                  <button key={d} className={`btn btn-diff ${difficulty === d ? 'btn-diff-active' : ''}`} onClick={() => setDifficulty(d)}>
                    <div className="diff-top">
                      <span className="diff-icon">{d === 'easy' ? '🌿' : d === 'normal' ? '⚔️' : '💀'}</span>
                      <span className="diff-name">{d.charAt(0).toUpperCase() + d.slice(1)}</span>
                    </div>
                    <span className="diff-desc">
                      {d === 'easy' ? 'More resources, milder events, slower threats. Learn at your pace.' :
                       d === 'normal' ? 'Balanced challenge. Fair events, steady threat growth.' :
                       'Scarce resources, harsh events, aggressive enemies. For veterans.'}
                    </span>
                    <div className="diff-stats">
                      <StatBadge label={`💰 ${cfg.startingResources.gold}g`} positive={d === 'easy' ? true : d === 'hard' ? false : undefined} />
                      <StatBadge label={`🍞 ${cfg.startingResources.food}f`} positive={d === 'easy' ? true : d === 'hard' ? false : undefined} />
                      <StatBadge label={`👥 ${cfg.startingResources.population} pop`} positive={d === 'easy' ? true : d === 'hard' ? false : undefined} />
                      <StatBadge label={`⚔️ ${cfg.startingResources.armySize} army`} positive={undefined} />
                      <StatBadge label={`⚠️ Threat ×${cfg.threatGrowth}`} positive={cfg.threatGrowth <= 1} />
                      <StatBadge label={`Upkeep ×${cfg.upkeepMultiplier}`} positive={cfg.upkeepMultiplier <= 1} />
                      <StatBadge label={`Events ×${cfg.eventSeverity}`} positive={cfg.eventSeverity <= 1} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kingdom Type — with lore, stats, mechanic */}
          <div className="setup-section">
            <label className="setup-label">Kingdom Type</label>
            <div className="kingdom-type-list">
              {KINGDOM_TYPES.map(kt => {
                const bonusBldg = BUILDINGS.find(b => b.id === kt.bonusBuilding);
                return (
                  <button key={kt.id} className={`btn btn-kingdom-type ${kingdomType === kt.id ? 'btn-kingdom-type-active' : ''}`} onClick={() => setKingdomType(kt.id)}>
                    <div className="kt-header">
                      <span className="kt-icon">{kt.icon}</span>
                      <span className="kt-name">{kt.name}</span>
                    </div>
                    <span className="kt-desc">{kt.description}</span>
                    <span className="kt-lore">{kt.lore}</span>
                    <span className="kt-mechanic">Special: {kt.specialMechanic}</span>
                    <div className="kt-stats">
                      {Object.entries(kt.modifiers).map(([k, v]) => {
                        if (!v) return null;
                        const f = formatModifier(k, v as number);
                        return <StatBadge key={k} label={f.label} positive={f.positive} />;
                      })}
                      {Object.entries(kt.startingResources).map(([k, v]) => {
                        if (!v) return null;
                        const f = formatResource(k, v as number);
                        return <StatBadge key={k} label={f.label} positive={f.positive} />;
                      })}
                      {bonusBldg && <span className="kt-bonus-building">🏗️ Free: {bonusBldg.name}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kingdom Perk */}
          <div className="setup-section">
            <label className="setup-label">Kingdom Perk</label>
            <div className="trait-grid">
              {KINGDOM_TRAITS.map(t => (
                <button key={t.id} className={`btn btn-trait ${trait === t.id ? 'btn-trait-active' : ''}`} onClick={() => setTrait(t.id)}>
                  <span className="trait-icon">{t.icon}</span>
                  <span className="trait-name">{t.name}</span>
                  <span className="trait-desc">{t.description}</span>
                  <div className="kt-stats" style={{ marginTop: '4px' }}>
                    {Object.entries(t.modifiers).map(([k, v]) => {
                      if (!v) return null;
                      const f = formatModifier(k, v as number);
                      return <StatBadge key={k} label={f.label} positive={f.positive} />;
                    })}
                  </div>
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
  const selectedTrait = RULER_TRAITS.find(t => t.id === selectedBg.startingTrait);

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
            {RULER_BACKGROUNDS.map(bg => {
              const bgTrait = RULER_TRAITS.find(t => t.id === bg.startingTrait);
              return (
                <button key={bg.id} className={`btn btn-ruler-bg ${rulerBg === bg.id ? 'btn-ruler-bg-active' : ''}`} onClick={() => setRulerBg(bg.id)}>
                  <div className="rbg-header">
                    <span className="rbg-icon">{bg.icon}</span>
                    <div className="rbg-info">
                      <span className="rbg-name">{bg.name}</span>
                      <span className="rbg-ability">{bg.specialAbility}: {bg.abilityDescription}</span>
                    </div>
                  </div>
                  <div className="rbg-stats">
                    {Object.entries(bg.bonusResources).map(([k, v]) => {
                      if (!v) return null;
                      const f = formatResource(k, v as number);
                      return <StatBadge key={k} label={f.label} positive={f.positive} />;
                    })}
                    {bgTrait && (
                      <StatBadge label={`${bgTrait.icon} ${bgTrait.name}`} positive={bgTrait.category === 'positive'} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected backstory detail */}
        <div className="card backstory-card">
          <h3 className="card-title">{selectedBg.icon} {selectedBg.name}</h3>
          <p className="backstory-text">{selectedBg.backstory}</p>

          <div className="backstory-details">
            <div className="backstory-section">
              <span className="backstory-label">Starting Trait:</span>
              {selectedTrait && (
                <span className={`ruler-trait-tag trait-${selectedTrait.category}`}>
                  {selectedTrait.icon} {selectedTrait.name} — {selectedTrait.description}
                </span>
              )}
            </div>
            <div className="backstory-section">
              <span className="backstory-label">Trait Effects:</span>
              <div className="kt-stats">
                {selectedTrait && Object.entries(selectedTrait.effects).map(([k, v]) => {
                  if (!v) return null;
                  const f = formatModifier(k, v as number);
                  return <StatBadge key={k} label={f.label} positive={f.positive} />;
                })}
              </div>
            </div>
            <div className="backstory-section">
              <span className="backstory-label">Starting Bonuses:</span>
              <div className="kt-stats">
                {Object.entries(selectedBg.bonusResources).map(([k, v]) => {
                  if (!v) return null;
                  const f = formatResource(k, v as number);
                  return <StatBadge key={k} label={f.label} positive={f.positive} />;
                })}
              </div>
            </div>
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

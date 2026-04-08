import React from 'react';
import { GameState, TechId } from '../types/game';
import { RULER_BACKGROUNDS, RULER_TRAITS, getRulerLevel } from '../data/rulers';
import { TECHNOLOGIES } from '../data/technologies';
import { KINGDOM_TYPES } from '../data/kingdoms';
import { ACHIEVEMENTS } from '../data/achievements';
import { getSeasonForTurn } from '../data/seasons';

interface Props {
  state: GameState;
  onStartResearch: (techId: TechId) => void;
  onCancelResearch: () => void;
}

export const RulerTab: React.FC<Props> = ({ state, onStartResearch, onCancelResearch }) => {
  const { ruler } = state;
  if (!ruler) return <div className="tab-content"><div className="card"><p className="card-desc">Ruler data unavailable. Start a new game.</p></div></div>;
  const bgDef = RULER_BACKGROUNDS.find(b => b.id === ruler.background);
  const ktDef = KINGDOM_TYPES.find(k => k.id === state.kingdomType);
  const levelInfo = getRulerLevel(ruler.experience);
  const season = getSeasonForTurn(state.turn);

  const unlockedAchievements = (state.achievements || []).filter(a => a.unlocked);
  const availableTech = TECHNOLOGIES.filter(t => {
    const ts = (state.technologies || []).find(s => s.id === t.id);
    if (!ts || ts.researched) return false;
    if (t.requires) {
      return t.requires.every(r => {
        const rs = (state.technologies || []).find(s => s.id === r);
        return rs && rs.researched;
      });
    }
    return true;
  });
  const researchingTech = state.currentResearch ?
    TECHNOLOGIES.find(t => t.id === state.currentResearch) : null;
  const researchState = state.currentResearch ?
    (state.technologies || []).find(t => t.id === state.currentResearch) : null;

  return (
    <div className="tab-content ruler-tab">
      {/* Ruler Info */}
      <div className="card ruler-card">
        <div className="ruler-header">
          <span className="ruler-portrait">{bgDef?.icon || '👑'}</span>
          <div className="ruler-info">
            <span className="ruler-name">{ruler.name}</span>
            <span className="ruler-title-text">{ruler.title} of {state.kingdomName}</span>
            <span className="ruler-bg-name">{bgDef?.name}</span>
          </div>
        </div>
        <div className="ruler-level-bar">
          <div className="level-info">
            <span>Level {ruler.level} — {levelInfo.title}</span>
            <span>{ruler.experience} / {levelInfo.nextXp} XP</span>
          </div>
          <div className="stat-bar-container">
            <div className="stat-bar" style={{
              width: `${Math.min(100, (ruler.experience / levelInfo.nextXp) * 100)}%`,
              backgroundColor: 'var(--color-primary)',
            }} />
          </div>
        </div>
        <div className="ruler-traits">
          {ruler.traits.map(tid => {
            const tDef = RULER_TRAITS.find(t => t.id === tid);
            return tDef ? (
              <span key={tid} className={`ruler-trait-tag trait-${tDef.category}`}>
                {tDef.icon} {tDef.name}
              </span>
            ) : null;
          })}
        </div>
        <div className="ruler-stats-mini">
          <span>Turns Ruled: {ruler.turnsRuled}</span>
          <span>Battles Won: {ruler.battlesWon}</span>
        </div>
      </div>

      {/* Season & Kingdom */}
      <div className="card">
        <h3 className="card-title">{season.icon} {season.name} — {ktDef?.icon} {ktDef?.name}</h3>
        <p className="card-desc">{season.description}</p>
        <div className="season-mods">
          <span className={`effect-tag ${season.foodModifier >= 1 ? '' : 'effect-negative'}`}>Food ×{season.foodModifier}</span>
          <span className={`effect-tag ${season.goldModifier >= 1 ? '' : 'effect-negative'}`}>Gold ×{season.goldModifier}</span>
          <span className={`effect-tag ${season.threatModifier <= 1 ? '' : 'effect-negative'}`}>Threat ×{season.threatModifier}</span>
        </div>
      </div>

      {/* Research */}
      <div className="card">
        <h3 className="card-title">📚 Research</h3>
        {researchingTech && researchState ? (
          <div className="research-current">
            <div className="research-header">
              <span>{researchingTech.icon} Researching: <strong>{researchingTech.name}</strong></span>
            </div>
            <div className="stat-bar-container" style={{ marginTop: '6px' }}>
              <div className="stat-bar" style={{
                width: `${Math.max(5, ((researchingTech.researchTurns - researchState.turnsRemaining) / researchingTech.researchTurns) * 100)}%`,
                backgroundColor: '#3498db',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              <span className="research-eta">{Math.ceil(researchState.turnsRemaining)} turns remaining</span>
              <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px', minHeight: '28px' }} onClick={onCancelResearch}>Cancel</button>
            </div>
          </div>
        ) : (
          <p className="card-desc">No active research. Choose a technology to study.</p>
        )}
        {availableTech.length > 0 && !state.currentResearch && (
          <div className="tech-list">
            {availableTech.map(tech => (
              <button key={tech.id} className="btn btn-tech" onClick={() => onStartResearch(tech.id)}>
                <div className="tech-header">
                  <span className="tech-icon">{tech.icon}</span>
                  <div className="tech-info">
                    <span className="tech-name">{tech.name}</span>
                    <span className="tech-desc">{tech.description}</span>
                  </div>
                </div>
                <span className="tech-cost">{tech.researchTurns} turns | {tech.cost}g</span>
              </button>
            ))}
          </div>
        )}
        {(state.technologies || []).filter(t => t.researched).length > 0 && (
          <div className="researched-list">
            <h4 style={{ fontSize: '13px', color: 'var(--color-text-dim)', marginTop: '10px' }}>Completed:</h4>
            <div className="researched-tags">
              {(state.technologies || []).filter(t => t.researched).map(t => {
                const def = TECHNOLOGIES.find(d => d.id === t.id);
                return def ? <span key={t.id} className="effect-tag">{def.icon} {def.name}</span> : null;
              })}
            </div>
          </div>
        )}
      </div>

      {/* Story Log */}
      {state.storyLog.length > 0 && (
        <div className="card">
          <h3 className="card-title">📖 Kingdom Chronicle</h3>
          <div className="story-log">
            {[...state.storyLog].reverse().slice(0, 15).map((entry, i) => (
              <div key={i} className={`story-entry story-${entry.category}`}>
                <span className="story-turn">Turn {entry.turn}</span>
                <span className="story-text">{entry.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rival Kingdoms */}
      {(state.rivals || []).length > 0 && (
        <div className="card">
          <h3 className="card-title">🌍 Neighboring Kingdoms</h3>
          <div className="rival-list">
            {(state.rivals || []).map(r => (
              <div key={r.id} className={`rival-item rival-${r.status}`}>
                <div className="rival-header">
                  <span className="rival-icon">{r.icon}</span>
                  <div className="rival-info">
                    <span className="rival-name">{r.name}</span>
                    <span className="rival-personality">{r.personality}</span>
                  </div>
                  <span className={`rival-status status-${r.status}`}>
                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  </span>
                </div>
                <p className="rival-desc">{r.description}</p>
                <div className="rival-stats">
                  <span>Strength: {r.strength}</span>
                  <span>Relations: {r.relation > 0 ? '+' : ''}{r.relation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="card">
        <h3 className="card-title">🏆 Achievements ({unlockedAchievements.length}/{ACHIEVEMENTS.length})</h3>
        <div className="achievement-grid">
          {ACHIEVEMENTS.map(a => {
            const save = (state.achievements || []).find(s => s.id === a.id);
            const unlocked = save?.unlocked || false;
            return (
              <div key={a.id} className={`achievement-item ${unlocked ? 'achievement-unlocked' : 'achievement-locked'}`}>
                <span className="achievement-icon">{unlocked ? a.icon : '🔒'}</span>
                <div className="achievement-info">
                  <span className="achievement-name">{unlocked ? a.name : '???'}</span>
                  <span className="achievement-desc">{unlocked ? a.description : 'Keep playing to unlock...'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

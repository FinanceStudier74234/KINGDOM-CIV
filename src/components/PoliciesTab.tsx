import React from 'react';
import { GameState, PolicyId, AdvisorId } from '../types/game';
import { POLICIES } from '../data/policies';
import { ADVISORS } from '../data/advisors';

interface Props {
  state: GameState;
  onTogglePolicy: (id: PolicyId) => void;
  onToggleAdvisor: (id: AdvisorId) => void;
}

export const PoliciesTab: React.FC<Props> = ({ state, onTogglePolicy, onToggleAdvisor }) => {
  const availablePolicies = POLICIES.filter(p => state.turn >= p.unlockTurn);
  const availableAdvisors = ADVISORS.filter(a => state.turn >= a.unlockTurn);

  return (
    <div className="tab-content policies-tab">
      <h3 className="section-title">Kingdom Policies</h3>
      {availablePolicies.length === 0 ? (
        <div className="card">
          <p className="card-desc">Policies will unlock as your kingdom grows.</p>
        </div>
      ) : (
        <div className="policy-list">
          {availablePolicies.map(p => {
            const isActive = state.activePolicies.includes(p.id);
            const isConflict = p.conflictsWith?.some(c => state.activePolicies.includes(c));

            return (
              <div key={p.id} className={`card policy-card ${isActive ? 'policy-active' : ''}`}>
                <div className="policy-header">
                  <span className="policy-icon">{p.icon}</span>
                  <div className="policy-info">
                    <span className="policy-name">{p.name}</span>
                    <span className="policy-desc">{p.description}</span>
                  </div>
                </div>
                <div className="policy-effects">
                  {Object.entries(p.effects).map(([key, val]) => (
                    <span
                      key={key}
                      className={`effect-tag ${(val as number) >= 0 ? '' : 'effect-negative'}`}
                    >
                      {formatPolicyEffect(key, val as number)}
                    </span>
                  ))}
                </div>
                <button
                  className={`btn ${isActive ? 'btn-active-policy' : 'btn-build'}`}
                  disabled={!isActive && !!isConflict}
                  onClick={() => onTogglePolicy(p.id)}
                >
                  {isActive ? 'Revoke' : isConflict ? 'Conflicts' : 'Enact'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {availableAdvisors.length > 0 && (
        <>
          <h3 className="section-title" style={{ marginTop: '1rem' }}>Advisors</h3>
          <div className="advisor-list">
            {availableAdvisors.map(a => {
              const isActive = state.activeAdvisors.includes(a.id);
              return (
                <div key={a.id} className={`card advisor-card ${isActive ? 'advisor-active' : ''}`}>
                  <div className="advisor-header">
                    <span className="advisor-icon">{a.icon}</span>
                    <div className="advisor-info">
                      <span className="advisor-name">{a.name}</span>
                      <span className="advisor-title">{a.title}</span>
                    </div>
                  </div>
                  <p className="advisor-desc">{a.description}</p>
                  <button
                    className={`btn ${isActive ? 'btn-active-policy' : 'btn-build'}`}
                    onClick={() => onToggleAdvisor(a.id)}
                  >
                    {isActive ? 'Dismiss' : 'Appoint'}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {availablePolicies.length < POLICIES.length && (
        <div className="locked-hint">
          <p>More policies unlock over time...</p>
        </div>
      )}
    </div>
  );
};

function formatPolicyEffect(key: string, val: number): string {
  const sign = val >= 0 ? '+' : '';
  const pct = Math.round(val * 100);
  const labels: Record<string, string> = {
    goldIncome: `${sign}${pct}% Gold`,
    foodProduction: `${sign}${pct}% Food`,
    happinessChange: `${sign}${pct}% Happiness`,
    stabilityChange: `${sign}${pct}% Stability`,
    armyPower: `${sign}${pct}% Army Power`,
    defenseBonus: `${sign}${pct}% Defense`,
    populationGrowth: `${sign}${pct}% Pop Growth`,
  };
  return labels[key] || `${sign}${pct}% ${key}`;
}

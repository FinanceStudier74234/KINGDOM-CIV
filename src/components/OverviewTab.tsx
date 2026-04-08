import React from 'react';
import { GameState, TaxLevel } from '../types/game';
import { TAX_LEVELS } from '../data/policies';
import {
  calculateGoldIncome, calculateGoldExpenses,
  calculateFoodProduction, calculateFoodConsumption,
  calculateTotalDefense,
  getUnrestLevel,
} from '../engine/turnEngine';
import { getTotalBuildingEffect } from '../engine/gameState';
import { getSeasonForTurn } from '../data/seasons';

interface Props {
  state: GameState;
  onSetTax: (level: TaxLevel) => void;
  onNextTurn: () => void;
}

function getThreatDesc(threat: number): { text: string; color: string } {
  if (threat < 15) return { text: 'Peaceful', color: 'var(--color-positive)' };
  if (threat < 30) return { text: 'Watchful', color: '#7eb86a' };
  if (threat < 45) return { text: 'Tense', color: '#f0ad4e' };
  if (threat < 60) return { text: 'Dangerous', color: '#e67e22' };
  if (threat < 80) return { text: 'Critical', color: '#e74c3c' };
  return { text: 'Imminent Invasion', color: '#c0392b' };
}

export const OverviewTab: React.FC<Props> = ({ state, onSetTax, onNextTurn }) => {
  const goldIn = calculateGoldIncome(state);
  const goldOut = calculateGoldExpenses(state);
  const foodProd = calculateFoodProduction(state);
  const foodCons = calculateFoodConsumption(state);
  const maxPop = state.maxPopulation + getTotalBuildingEffect(state, 'populationCapacity');
  const maxFoodStore = state.maxFood + getTotalBuildingEffect(state, 'foodStorage');
  const defense = calculateTotalDefense(state);
  const season = getSeasonForTurn(state.turn);
  const nextSeason = getSeasonForTurn(state.turn + 1);
  const threatInfo = getThreatDesc(state.resources.threat);

  return (
    <div className="tab-content overview-tab">
      {/* Season Info */}
      <div className="card season-card">
        <div className="season-display">
          <span className="season-current">{season.icon} {season.name}</span>
          <span className="season-next">Next: {nextSeason.icon} {nextSeason.name}</span>
        </div>
        <p className="season-desc">{season.description}</p>
        {season.id === 'autumn' && (
          <p className="season-warning">⚠️ Prepare food stores — winter is coming!</p>
        )}
      </div>

      {/* Resource Projections */}
      <div className="card">
        <h3 className="card-title">Turn Projections</h3>
        <div className="projection-grid">
          <div className={`projection-item ${goldIn - goldOut >= 0 ? 'positive' : 'negative'}`}>
            <span className="proj-label">💰 Net Gold</span>
            <span className="proj-value">{goldIn - goldOut >= 0 ? '+' : ''}{goldIn - goldOut}/turn</span>
          </div>
          <div className={`projection-item ${foodProd - foodCons >= 0 ? 'positive' : 'negative'}`}>
            <span className="proj-label">🍞 Net Food</span>
            <span className="proj-value">{foodProd - foodCons >= 0 ? '+' : ''}{foodProd - foodCons}/turn</span>
          </div>
          <div className="projection-item">
            <span className="proj-label">👥 Pop Cap</span>
            <span className="proj-value">{state.resources.population}/{maxPop}</span>
          </div>
          <div className="projection-item">
            <span className="proj-label">🍞 Food Cap</span>
            <span className="proj-value">{Math.floor(state.resources.food)}/{maxFoodStore}</span>
          </div>
          <div className="projection-item">
            <span className="proj-label">🛡️ Defense</span>
            <span className="proj-value">{Math.floor(defense)}</span>
          </div>
          <div className="projection-item">
            <span className="proj-label">⚠️ Threat</span>
            <span className="proj-value" style={{ color: threatInfo.color }}>{threatInfo.text}</span>
          </div>
        </div>
      </div>

      {/* Tax Level */}
      <div className="card">
        <h3 className="card-title">Tax Policy</h3>
        <div className="tax-buttons">
          {TAX_LEVELS.map(t => (
            <button
              key={t.id}
              className={`btn btn-tax ${state.taxLevel === t.id ? 'btn-tax-active' : ''}`}
              onClick={() => onSetTax(t.id)}
            >
              <span className="tax-name">{t.name}</span>
              <span className="tax-detail">
                Gold ×{t.goldMultiplier} | Happy {t.happinessEffect >= 0 ? '+' : ''}{t.happinessEffect}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Warnings */}
      {(state.resources.food < 20 || state.resources.gold < 10 || state.resources.happiness < 30 ||
        state.resources.stability < 30 || state.resources.threat > 50 || state.resources.armyMorale < 25 ||
        (foodProd - foodCons < -5)) && (
        <div className="card card-warning">
          <h3 className="card-title">⚠️ Warnings</h3>
          <div className="warning-list">
            {state.resources.food < 20 && <p className="warning-text">🍞 Food critically low! Build farms or buy food.</p>}
            {foodProd - foodCons < -5 && state.resources.food >= 20 && <p className="warning-text">🍞 Food deficit of {foodCons - foodProd}/turn — stores draining!</p>}
            {state.resources.gold < 10 && <p className="warning-text">💰 Treasury nearly empty! Increase income or cut costs.</p>}
            {state.resources.happiness < 30 && <p className="warning-text">😠 People deeply unhappy. Rebellion risk rising!</p>}
            {state.resources.stability < 30 && <p className="warning-text">🏛️ Kingdom unstable! Risk of collapse!</p>}
            {state.resources.threat > 50 && <p className="warning-text">⚔️ Enemy threat dangerously high! Prepare defenses!</p>}
            {state.resources.armyMorale < 25 && <p className="warning-text">💪 Army morale critical! Soldiers may desert.</p>}
          </div>
        </div>
      )}

      {/* Victory Progress */}
      {state.turn > 10 && (
        <div className="card">
          <h3 className="card-title">👑 Kingdom Progress</h3>
          <div className="victory-progress">
            <VictoryGoal label="Survive 100 Turns" current={state.turn} target={100} />
            <VictoryGoal label="Population 200" current={state.resources.population} target={200} />
            <VictoryGoal label="Control 10 Land" current={state.resources.land} target={10} />
            <VictoryGoal label="Treasury 500g" current={state.resources.gold} target={500} />
          </div>
        </div>
      )}

      {/* Next Turn */}
      <button className="btn btn-primary btn-large btn-next-turn" onClick={onNextTurn}>
        Next Turn →
      </button>
    </div>
  );
};

const VictoryGoal: React.FC<{ label: string; current: number; target: number }> = ({ label, current, target }) => {
  const pct = Math.min(100, (current / target) * 100);
  const done = current >= target;
  return (
    <div className="victory-goal">
      <div className="vg-header">
        <span className="vg-label">{done ? '✅' : '⬜'} {label}</span>
        <span className="vg-value">{Math.floor(current)}/{target}</span>
      </div>
      <div className="stat-bar-container">
        <div className="stat-bar" style={{
          width: `${pct}%`,
          backgroundColor: done ? 'var(--color-positive)' : 'var(--color-primary)',
        }} />
      </div>
    </div>
  );
};

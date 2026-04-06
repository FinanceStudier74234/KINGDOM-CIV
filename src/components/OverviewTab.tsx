import React from 'react';
import { GameState, TaxLevel } from '../types/game';
import { TAX_LEVELS } from '../data/policies';
import {
  calculateGoldIncome, calculateGoldExpenses,
  calculateFoodProduction, calculateFoodConsumption,
  getUnrestLevel,
} from '../engine/turnEngine';
import { getTotalBuildingEffect } from '../engine/gameState';

interface Props {
  state: GameState;
  onSetTax: (level: TaxLevel) => void;
  onNextTurn: () => void;
}

export const OverviewTab: React.FC<Props> = ({ state, onSetTax, onNextTurn }) => {
  const goldIn = calculateGoldIncome(state);
  const goldOut = calculateGoldExpenses(state);
  const foodProd = calculateFoodProduction(state);
  const foodCons = calculateFoodConsumption(state);
  const maxPop = state.maxPopulation + getTotalBuildingEffect(state, 'populationCapacity');
  const maxFoodStore = state.maxFood + getTotalBuildingEffect(state, 'foodStorage');
  const defense = getTotalBuildingEffect(state, 'defensePower');
  const unrest = getUnrestLevel(state);

  return (
    <div className="tab-content overview-tab">
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
            <span className="proj-label">💪 Army Power</span>
            <span className="proj-value">{state.resources.armyPower} (Morale: {state.resources.armyMorale})</span>
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
        state.resources.stability < 30 || state.resources.threat > 50) && (
        <div className="card card-warning">
          <h3 className="card-title">⚠️ Warnings</h3>
          <div className="warning-list">
            {state.resources.food < 20 && <p className="warning-text">Food critically low! Build farms or buy food.</p>}
            {state.resources.gold < 10 && <p className="warning-text">Treasury nearly empty! Increase income or cut costs.</p>}
            {state.resources.happiness < 30 && <p className="warning-text">People are deeply unhappy. Rebellion risk rising!</p>}
            {state.resources.stability < 30 && <p className="warning-text">Kingdom unstable! Risk of collapse!</p>}
            {state.resources.threat > 50 && <p className="warning-text">Enemy threat is dangerously high! Prepare defenses!</p>}
            {state.resources.armyMorale < 25 && <p className="warning-text">Army morale critical! Soldiers may desert.</p>}
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

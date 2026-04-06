import React from 'react';
import { GameState } from '../types/game';
import { getTotalBuildingEffect } from '../engine/gameState';
import { calculateTotalDefense } from '../engine/turnEngine';
import { DIFFICULTY_CONFIG } from '../data/difficulty';

interface Props {
  state: GameState;
  onRecruit: (amount: number) => void;
  onTrain: () => void;
}

export const ArmyTab: React.FC<Props> = ({ state, onRecruit, onTrain }) => {
  const { resources } = state;
  const config = DIFFICULTY_CONFIG[state.difficulty];
  const armyCap = 10 + getTotalBuildingEffect(state, 'armyCapacity');
  const defense = calculateTotalDefense(state);
  const recruitCost = 8;
  const canRecruit1 = resources.gold >= recruitCost && resources.armySize < armyCap && resources.population > 10;
  const canRecruit5 = resources.gold >= recruitCost * 5 && resources.armySize + 5 <= armyCap && resources.population > 15;
  const trainCost = 15;
  const canTrain = resources.gold >= trainCost && resources.armySize > 0;
  const armyGoldUpkeep = Math.floor(resources.armySize * 1.5 * config.upkeepMultiplier);
  const armyFoodUpkeep = Math.floor(resources.armySize * config.armyFoodRate);

  return (
    <div className="tab-content army-tab">
      <div className="card">
        <h3 className="card-title">⚔️ Military Overview</h3>
        <div className="army-stats">
          <div className="army-stat">
            <span className="stat-label">Soldiers</span>
            <span className="stat-value">{resources.armySize} / {Math.floor(armyCap)}</span>
          </div>
          <div className="army-stat">
            <span className="stat-label">Morale</span>
            <div className="stat-bar-container">
              <div
                className="stat-bar"
                style={{
                  width: `${resources.armyMorale}%`,
                  backgroundColor: resources.armyMorale > 60 ? 'var(--color-positive)' :
                    resources.armyMorale > 30 ? '#f0ad4e' : 'var(--color-negative)',
                }}
              />
            </div>
            <span className="stat-value">{resources.armyMorale}%</span>
          </div>
          <div className="army-stat">
            <span className="stat-label">Army Power</span>
            <span className="stat-value">{resources.armyPower}</span>
          </div>
          <div className="army-stat">
            <span className="stat-label">Defense Power</span>
            <span className="stat-value">{defense}</span>
          </div>
          <div className="army-stat">
            <span className="stat-label">Threat Level</span>
            <div className="stat-bar-container">
              <div
                className="stat-bar stat-bar-threat"
                style={{
                  width: `${resources.threat}%`,
                  backgroundColor: resources.threat > 50 ? 'var(--color-negative)' :
                    resources.threat > 25 ? '#f0ad4e' : 'var(--color-positive)',
                }}
              />
            </div>
            <span className="stat-value">{resources.threat}%</span>
          </div>
          <div className="army-stat">
            <span className="stat-label">Upkeep</span>
            <span className="stat-value stat-negative">{armyGoldUpkeep}g + {armyFoodUpkeep}f / turn</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Recruitment</h3>
        <p className="card-desc">Each soldier costs {recruitCost} gold. Soldiers consume food and gold each turn.</p>
        <div className="army-actions">
          <button className="btn btn-build" disabled={!canRecruit1} onClick={() => onRecruit(1)}>
            Recruit 1 ({recruitCost}g)
          </button>
          <button className="btn btn-build" disabled={!canRecruit5} onClick={() => onRecruit(5)}>
            Recruit 5 ({recruitCost * 5}g)
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Training</h3>
        <p className="card-desc">Train your troops to increase army power and morale.</p>
        <button className="btn btn-upgrade" disabled={!canTrain} onClick={onTrain}>
          Train Army ({trainCost}g) → +2 Power, +5 Morale
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { GameState, BuildingId } from '../types/game';
import { BUILDINGS, getBuildingCost, getBuildingUpgradeCost, getLevelName } from '../data/buildings';
import { getBuildingCount, getBuildingLevel } from '../engine/gameState';

interface Props {
  state: GameState;
  onBuild: (id: BuildingId) => void;
  onUpgrade: (id: BuildingId) => void;
}

export const BuildTab: React.FC<Props> = ({ state, onBuild, onUpgrade }) => {
  return (
    <div className="tab-content build-tab">
      <h3 className="section-title">Buildings</h3>
      <div className="building-list">
        {BUILDINGS.filter(b => state.turn >= b.unlockTurn).map(def => {
          const count = getBuildingCount(state, def.id);
          const level = getBuildingLevel(state, def.id);
          const buildCost = getBuildingCost(def, level, count);
          const upgradeCost = level < def.maxLevel - 1 ? getBuildingUpgradeCost(def, level) : null;
          const canBuild = state.resources.gold >= buildCost && state.resources.population >= def.popRequirement;
          const canUpgrade = upgradeCost !== null && count > 0 && state.resources.gold >= upgradeCost;

          return (
            <div key={def.id} className="building-card card">
              <div className="building-header">
                <span className="building-icon">{def.icon}</span>
                <div className="building-info">
                  <span className="building-name">
                    {count > 0 ? getLevelName(def, level) : def.name}
                  </span>
                  <span className="building-count">
                    Owned: {count} {level > 0 ? `(Lvl ${level + 1})` : ''}
                  </span>
                </div>
              </div>
              <p className="building-desc">{def.description}</p>
              <div className="building-effects">
                {Object.entries(def.effects).map(([key, val]) => (
                  <span key={key} className="effect-tag">
                    {formatEffect(key, val as number, level)}
                  </span>
                ))}
                {def.upkeep > 0 && (
                  <span className="effect-tag effect-negative">
                    Upkeep: {def.upkeep}g/turn
                  </span>
                )}
              </div>
              <div className="building-actions">
                <button
                  className="btn btn-build"
                  disabled={!canBuild}
                  onClick={() => onBuild(def.id)}
                >
                  Build ({buildCost}g)
                </button>
                {count > 0 && upgradeCost !== null && (
                  <button
                    className="btn btn-upgrade"
                    disabled={!canUpgrade}
                    onClick={() => onUpgrade(def.id)}
                  >
                    Upgrade ({upgradeCost}g)
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {BUILDINGS.some(b => state.turn < b.unlockTurn) && (
        <div className="locked-hint">
          <p>More buildings unlock as your kingdom grows...</p>
        </div>
      )}
    </div>
  );
};

function formatEffect(key: string, value: number, level: number): string {
  const mult = 1 + level * 0.4;
  const v = Math.floor(value * mult);
  const labels: Record<string, string> = {
    foodProduction: `+${v} Food`,
    foodStorage: `+${v} Food Storage`,
    goldIncome: `+${v} Gold`,
    populationCapacity: `+${v} Pop Cap`,
    armyCapacity: `+${v} Army Cap`,
    armyPower: `+${v} Army Power`,
    defensePower: `+${v} Defense`,
    happiness: `+${v} Happiness`,
    stability: `+${v} Stability`,
    tradeIncome: `+${v} Trade`,
    researchSpeed: `+${v} Research`,
    healthBonus: `+${v} Health`,
  };
  return labels[key] || `+${v} ${key}`;
}

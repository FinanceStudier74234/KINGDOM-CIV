import React from 'react';
import { UnrestLevel } from '../types/game';
import { getUnrestLevel } from '../engine/turnEngine';
import { GameState } from '../types/game';
import { getSeasonForTurn } from '../data/seasons';

interface Props {
  state: GameState;
}

function getUnrestColor(level: UnrestLevel): string {
  switch (level) {
    case 'stable': return 'var(--color-positive)';
    case 'tense': return '#f0ad4e';
    case 'unrest': return '#e67e22';
    case 'riots': return '#e74c3c';
    case 'rebellion': return '#c0392b';
    case 'collapse': return '#7b0000';
  }
}

function formatNum(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return Math.floor(n).toString();
}

function getTurnDate(turn: number): string {
  const month = ((turn - 1) % 12);
  const year = Math.floor((turn - 1) / 12) + 1;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[month]}, Year ${year}`;
}

export const ResourceBar: React.FC<Props> = ({ state }) => {
  const { resources, turn, kingdomName } = state;
  const unrest = getUnrestLevel(state);
  const season = getSeasonForTurn(turn);

  const stats = [
    { icon: '💰', label: 'Gold', value: formatNum(resources.gold), warn: resources.gold < 20 },
    { icon: '🍞', label: 'Food', value: formatNum(resources.food), warn: resources.food < 20 },
    { icon: '👥', label: 'Pop', value: formatNum(resources.population), warn: resources.population < 15 },
    { icon: '😊', label: 'Happy', value: resources.happiness.toString(), warn: resources.happiness < 30 },
    { icon: '🏛️', label: 'Stable', value: resources.stability.toString(), warn: resources.stability < 30 },
    { icon: '⚔️', label: 'Army', value: resources.armySize.toString(), warn: resources.armySize < 5 },
    { icon: '🗺️', label: 'Land', value: resources.land.toString(), warn: false },
    { icon: '⚠️', label: 'Threat', value: resources.threat.toString(), warn: resources.threat > 40 },
  ];

  return (
    <div className="resource-bar">
      <div className="resource-header">
        <span className="kingdom-name">👑 {kingdomName}</span>
        <span className="turn-info">{season.icon} {getTurnDate(turn)} (Turn {turn})</span>
      </div>
      <div className="resource-grid">
        {stats.map(s => (
          <div key={s.label} className={`resource-item ${s.warn ? 'resource-warn' : ''}`}>
            <span className="resource-icon">{s.icon}</span>
            <span className="resource-value">{s.value}</span>
            <span className="resource-label">{s.label}</span>
          </div>
        ))}
      </div>
      <div className="unrest-bar">
        <span className="unrest-label">Kingdom Status:</span>
        <span className="unrest-value" style={{ color: getUnrestColor(unrest) }}>
          {unrest.charAt(0).toUpperCase() + unrest.slice(1)}
        </span>
      </div>
    </div>
  );
};

import React from 'react';
import { Tab } from '../types/game';

interface Props {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '🏠' },
  { id: 'build', label: 'Build', icon: '🏗️' },
  { id: 'army', label: 'Army', icon: '⚔️' },
  { id: 'policies', label: 'Policies', icon: '📜' },
  { id: 'ruler', label: 'Ruler', icon: '👑' },
  { id: 'history', label: 'Log', icon: '📖' },
];

export const BottomNav: React.FC<Props> = ({ currentTab, onTabChange }) => {
  return (
    <nav className="bottom-nav">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`nav-tab ${currentTab === tab.id ? 'nav-tab-active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

import React from 'react';
import { loadGame } from '../engine/gameState';

interface Props {
  onNewGame: () => void;
  onContinue: () => void;
}

export const MainMenu: React.FC<Props> = ({ onNewGame, onContinue }) => {
  const hasSave = !!loadGame();

  return (
    <div className="menu-screen">
      <div className="menu-content">
        <div className="menu-crown">👑</div>
        <h1 className="menu-title">Kingdom Rise</h1>
        <p className="menu-subtitle">A Turn-Based Kingdom Survival Game</p>

        <div className="menu-buttons">
          <button className="btn btn-primary btn-large" onClick={onNewGame}>
            New Kingdom
          </button>
          {hasSave && (
            <button className="btn btn-secondary btn-large" onClick={onContinue}>
              Continue Reign
            </button>
          )}
        </div>

        <div className="menu-tagline">
          <p>Build. Survive. Rule.</p>
        </div>
      </div>
    </div>
  );
};

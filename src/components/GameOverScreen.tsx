import React from 'react';
import { GameState } from '../types/game';
import { calculateScore, getTitle } from '../engine/turnEngine';

interface Props {
  state: GameState;
  onRestart: () => void;
  onMenu: () => void;
}

export const GameOverScreen: React.FC<Props> = ({ state, onRestart, onMenu }) => {
  const score = state.score || calculateScore(state);
  const title = getTitle(score);
  const isVictory = state.gameOverReason.includes('greatness') || state.gameOverReason.includes('beacon');

  return (
    <div className={`gameover-screen ${isVictory ? 'gameover-victory' : ''}`}>
      <div className="gameover-content">
        <div className="gameover-icon">{isVictory ? '👑' : '💀'}</div>
        <h2 className={`gameover-title ${isVictory ? 'victory-title' : ''}`}>
          {isVictory ? 'Victory! Long Live the Kingdom!' : 'The Kingdom Has Fallen'}
        </h2>
        <p className="gameover-reason">{state.gameOverReason}</p>

        <div className="gameover-stats">
          <div className="go-stat">
            <span className="go-label">Title Earned</span>
            <span className="go-value go-title">{title}</span>
          </div>
          <div className="go-stat">
            <span className="go-label">Final Score</span>
            <span className="go-value">{score}</span>
          </div>
          <div className="go-stat">
            <span className="go-label">Turns Survived</span>
            <span className="go-value">{state.turn}</span>
          </div>
          <div className="go-stat">
            <span className="go-label">Peak Population</span>
            <span className="go-value">{state.peakPopulation}</span>
          </div>
          <div className="go-stat">
            <span className="go-label">Total Gold Earned</span>
            <span className="go-value">{Math.floor(state.totalGoldEarned)}</span>
          </div>
          <div className="go-stat">
            <span className="go-label">Land Controlled</span>
            <span className="go-value">{state.resources.land}</span>
          </div>
          <div className="go-stat">
            <span className="go-label">Difficulty</span>
            <span className="go-value">{state.difficulty.charAt(0).toUpperCase() + state.difficulty.slice(1)}</span>
          </div>
          <div className="go-stat">
            <span className="go-label">Kingdom Trait</span>
            <span className="go-value">{state.trait.replace(/_/g, ' ')}</span>
          </div>
          {state.ruler && (
            <>
              <div className="go-stat">
                <span className="go-label">Ruler</span>
                <span className="go-value">{state.ruler.name}</span>
              </div>
              <div className="go-stat">
                <span className="go-label">Ruler Level</span>
                <span className="go-value">Lvl {state.ruler.level}</span>
              </div>
            </>
          )}
          <div className="go-stat">
            <span className="go-label">Achievements</span>
            <span className="go-value">{(state.achievements || []).filter(a => a.unlocked).length}</span>
          </div>
          <div className="go-stat">
            <span className="go-label">Technologies</span>
            <span className="go-value">{(state.technologies || []).filter(t => t.researched).length}</span>
          </div>
        </div>

        <div className="gameover-actions">
          <button className="btn btn-primary btn-large" onClick={onRestart}>
            New Kingdom
          </button>
          <button className="btn btn-secondary" onClick={onMenu}>
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};

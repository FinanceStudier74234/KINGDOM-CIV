import React from 'react';
import { GameState } from '../types/game';

interface Props {
  state: GameState;
}

export const HistoryTab: React.FC<Props> = ({ state }) => {
  const reversed = [...state.turnHistory].reverse();

  return (
    <div className="tab-content history-tab">
      <h3 className="section-title">Kingdom Chronicle</h3>
      {reversed.length === 0 ? (
        <div className="card">
          <p className="card-desc">No history yet. Complete your first turn!</p>
        </div>
      ) : (
        <div className="history-list">
          {reversed.map((summary, i) => (
            <div key={i} className="card history-card">
              <h4 className="history-turn">Turn {summary.turn}</h4>
              <div className="history-entries">
                {summary.entries.map((entry, j) => (
                  <div key={j} className={`history-entry ${entry.value >= 0 ? 'entry-positive' : 'entry-negative'}`}>
                    <span className="entry-label">{entry.label}</span>
                    <span className="entry-value">{entry.value >= 0 ? '+' : ''}{entry.value}</span>
                  </div>
                ))}
              </div>
              {summary.events.length > 0 && (
                <div className="history-events">
                  {summary.events.map((ev, j) => (
                    <p key={j} className="history-event">{ev}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

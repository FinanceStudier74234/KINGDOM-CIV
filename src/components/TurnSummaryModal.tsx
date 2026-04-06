import React from 'react';
import { TurnSummary } from '../types/game';

interface Props {
  summary: TurnSummary;
  onContinue: () => void;
}

export const TurnSummaryModal: React.FC<Props> = ({ summary, onContinue }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content summary-modal">
        <h3 className="summary-title">Turn {summary.turn} Summary</h3>
        <div className="summary-entries">
          {summary.entries.map((entry, i) => (
            <div
              key={i}
              className={`summary-entry ${entry.value >= 0 ? 'entry-positive' : 'entry-negative'}`}
            >
              <span className="entry-label">{entry.label}</span>
              <span className="entry-value">
                {entry.value >= 0 ? '+' : ''}{entry.value}
              </span>
            </div>
          ))}
        </div>
        {summary.events.length > 0 && (
          <div className="summary-events">
            <h4>Events</h4>
            {summary.events.map((ev, i) => (
              <p key={i} className="summary-event">{ev}</p>
            ))}
          </div>
        )}
        <button className="btn btn-primary btn-large" onClick={onContinue}>
          Continue
        </button>
      </div>
    </div>
  );
};

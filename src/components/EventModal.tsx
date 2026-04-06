import React from 'react';
import { ActiveEvent } from '../types/game';

interface Props {
  event: ActiveEvent;
  onChoice: (index: number) => void;
}

export const EventModal: React.FC<Props> = ({ event, onChoice }) => {
  const { event: ev } = event;
  const categoryColors: Record<string, string> = {
    good: '#27ae60',
    bad: '#c0392b',
    war: '#8e44ad',
    moral: '#2980b9',
    neutral: '#7f8c8d',
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content event-modal">
        <div className="event-header" style={{ borderLeftColor: categoryColors[ev.category] || '#7f8c8d' }}>
          <span className="event-icon">{ev.icon}</span>
          <div className="event-title-area">
            <span className="event-category" style={{ color: categoryColors[ev.category] }}>
              {ev.category.toUpperCase()}
            </span>
            <h3 className="event-title">{ev.title}</h3>
          </div>
        </div>
        <p className="event-description">{ev.description}</p>
        <div className="event-choices">
          {ev.choices.map((choice, i) => (
            <button
              key={i}
              className="btn btn-choice"
              onClick={() => onChoice(i)}
            >
              <span className="choice-text">{choice.text}</span>
              <span className="choice-effects">
                {Object.entries(choice.effects).map(([key, val]) => {
                  const v = val as number;
                  if (v === 0) return null;
                  return (
                    <span
                      key={key}
                      className={`choice-effect ${v > 0 ? 'effect-pos' : 'effect-neg'}`}
                    >
                      {v > 0 ? '+' : ''}{v} {formatKey(key)}
                    </span>
                  );
                })}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

function formatKey(key: string): string {
  const map: Record<string, string> = {
    gold: '💰',
    food: '🍞',
    population: '👥',
    happiness: '😊',
    stability: '🏛️',
    armySize: '⚔️',
    armyMorale: '💪',
    armyPower: '🗡️',
    threat: '⚠️',
    land: '🗺️',
  };
  return map[key] || key;
}

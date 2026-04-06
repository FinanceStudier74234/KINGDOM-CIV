import { GameState, GameEvent, ActiveEvent, DelayedEffect } from '../types/game';
import { GAME_EVENTS } from '../data/events';
import { applyEffects } from './turnEngine';
import { DIFFICULTY_CONFIG } from '../data/difficulty';

function weightedRandom(events: GameEvent[]): GameEvent {
  const totalWeight = events.reduce((sum, e) => sum + (e.weight || 1), 0);
  let random = Math.random() * totalWeight;
  for (const event of events) {
    random -= event.weight || 1;
    if (random <= 0) return event;
  }
  return events[events.length - 1];
}

export function getEligibleEvents(state: GameState): GameEvent[] {
  return GAME_EVENTS.filter(event => {
    // Check minimum turn
    if (event.minTurn && state.turn < event.minTurn) return false;

    // Check max occurrences
    if (event.maxOccurrences) {
      const count = state.eventOccurrences[event.id] || 0;
      if (count >= event.maxOccurrences) return false;
    }

    // Check condition (skip if condition function not available after deserialization)
    if (event.condition) {
      try {
        if (!event.condition(state)) return false;
      } catch {
        return true; // If condition can't be evaluated, include it
      }
    }

    // Don't repeat recent events
    const recentEvents = state.eventHistory.slice(-5);
    if (recentEvents.includes(event.id)) return false;

    return true;
  });
}

export function rollForEvent(state: GameState): ActiveEvent | null {
  // Event chance: ~60% per turn, more on hard
  const baseChance = 0.6;
  const diffMod = state.difficulty === 'hard' ? 1.1 : state.difficulty === 'easy' ? 0.85 : 1.0;

  if (Math.random() > baseChance * diffMod) return null;

  const eligible = getEligibleEvents(state);
  if (eligible.length === 0) return null;

  // Bias toward bad events when kingdom is weak, good events when strong
  let filtered = eligible;
  const avgHealth = (state.resources.happiness + state.resources.stability) / 2;
  if (avgHealth < 35 && Math.random() < 0.6) {
    const badOnes = eligible.filter(e => e.category === 'bad' || e.category === 'war');
    if (badOnes.length > 0) filtered = badOnes;
  } else if (avgHealth > 70 && Math.random() < 0.4) {
    const goodOnes = eligible.filter(e => e.category === 'good');
    if (goodOnes.length > 0) filtered = goodOnes;
  }

  const event = weightedRandom(filtered);
  return { event, resolved: false };
}

export function resolveEvent(
  state: GameState,
  choiceIndex: number
): GameState {
  if (!state.currentEvent) return state;

  const event = state.currentEvent.event;
  const choice = event.choices[choiceIndex];
  if (!choice) return state;

  // Apply severity multiplier for bad events on hard difficulty
  let effects = { ...choice.effects };
  const config = DIFFICULTY_CONFIG[state.difficulty];
  if (event.category === 'bad') {
    for (const [key, value] of Object.entries(effects)) {
      if (typeof value === 'number' && value < 0) {
        (effects as Record<string, number>)[key] = Math.floor(value * config.eventSeverity);
      }
    }
  }

  let resources = applyEffects(state.resources, effects);

  // Handle delayed effects
  const newDelayed = [...state.delayedEffects];
  if (choice.delayed) {
    newDelayed.push({
      triggerTurn: state.turn + choice.delayed.turnsLater,
      effects: choice.delayed.effects,
      message: choice.delayed.message,
    });
  }

  // Track occurrence
  const occurrences = { ...state.eventOccurrences };
  occurrences[event.id] = (occurrences[event.id] || 0) + 1;

  return {
    ...state,
    resources,
    currentEvent: { ...state.currentEvent, resolved: true, choiceIndex },
    delayedEffects: newDelayed,
    eventHistory: [...state.eventHistory, event.id],
    eventOccurrences: occurrences,
  };
}

// Re-attach conditions after load (conditions are functions that can't be serialized)
export function reattachEventConditions(state: GameState): GameState {
  // The conditions are on the GAME_EVENTS data, not on the state
  // This function exists for compatibility
  return state;
}

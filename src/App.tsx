import React, { useState, useCallback, useEffect } from 'react';
import {
  GameState, GamePhase, Tab, TaxLevel, BuildingId,
  PolicyId, AdvisorId, TurnSummary, Difficulty, KingdomTrait,
} from './types/game';
import { createNewGame, saveGame, loadGame, deleteSave } from './engine/gameState';
import { processTurn, checkGameOver, calculateScore } from './engine/turnEngine';
import { rollForEvent, resolveEvent } from './engine/eventEngine';
import { BUILDINGS, getBuildingCost, getBuildingUpgradeCost } from './data/buildings';

import { MainMenu } from './components/MainMenu';
import { SetupScreen } from './components/SetupScreen';
import { ResourceBar } from './components/ResourceBar';
import { OverviewTab } from './components/OverviewTab';
import { BuildTab } from './components/BuildTab';
import { ArmyTab } from './components/ArmyTab';
import { PoliciesTab } from './components/PoliciesTab';
import { HistoryTab } from './components/HistoryTab';
import { EventModal } from './components/EventModal';
import { TurnSummaryModal } from './components/TurnSummaryModal';
import { GameOverScreen } from './components/GameOverScreen';
import { BottomNav } from './components/BottomNav';
import { Tutorial } from './components/Tutorial';

import './styles/game.css';

function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [turnSummary, setTurnSummary] = useState<TurnSummary | null>(null);

  const handleNewGame = () => setPhase('setup');
  const handleContinue = () => {
    const saved = loadGame();
    if (saved) {
      setGameState(saved);
      setPhase(saved.phase === 'gameover' ? 'gameover' : 'playing');
    }
  };

  const handleStartGame = (name: string, difficulty: Difficulty, trait: KingdomTrait) => {
    const state = createNewGame(name, difficulty, trait);
    setGameState(state);
    setPhase('playing');
    saveGame(state);
  };

  const updateState = useCallback((updater: (s: GameState) => GameState) => {
    setGameState(prev => {
      if (!prev) return prev;
      const next = updater(prev);
      saveGame(next);
      return next;
    });
  }, []);

  const handleSetTax = (level: TaxLevel) => {
    updateState(s => ({ ...s, taxLevel: level }));
  };

  const handleBuild = (id: BuildingId) => {
    updateState(s => {
      const def = BUILDINGS.find(b => b.id === id);
      if (!def) return s;
      const existing = s.buildings.find(b => b.id === id);
      const count = existing ? existing.count : 0;
      const level = existing ? existing.level : 0;
      const cost = getBuildingCost(def, level, count);
      if (s.resources.gold < cost) return s;

      const newBuildings = [...s.buildings];
      const idx = newBuildings.findIndex(b => b.id === id);
      if (idx >= 0) {
        newBuildings[idx] = { ...newBuildings[idx], count: newBuildings[idx].count + 1 };
      } else {
        newBuildings.push({ id, level: 0, count: 1 });
      }

      return {
        ...s,
        resources: { ...s.resources, gold: s.resources.gold - cost },
        buildings: newBuildings,
      };
    });
  };

  const handleUpgrade = (id: BuildingId) => {
    updateState(s => {
      const def = BUILDINGS.find(b => b.id === id);
      if (!def) return s;
      const existing = s.buildings.find(b => b.id === id);
      if (!existing || existing.count === 0) return s;
      if (existing.level >= def.maxLevel - 1) return s;
      const cost = getBuildingUpgradeCost(def, existing.level);
      if (s.resources.gold < cost) return s;

      const newBuildings = s.buildings.map(b =>
        b.id === id ? { ...b, level: b.level + 1 } : b
      );

      return {
        ...s,
        resources: { ...s.resources, gold: s.resources.gold - cost },
        buildings: newBuildings,
      };
    });
  };

  const handleRecruit = (amount: number) => {
    updateState(s => {
      const cost = amount * 8;
      if (s.resources.gold < cost) return s;
      if (s.resources.population < 10) return s;
      return {
        ...s,
        resources: {
          ...s.resources,
          gold: s.resources.gold - cost,
          armySize: s.resources.armySize + amount,
          population: s.resources.population - Math.ceil(amount * 0.5),
        },
      };
    });
  };

  const handleTrain = () => {
    updateState(s => {
      if (s.resources.gold < 15 || s.resources.armySize === 0) return s;
      return {
        ...s,
        resources: {
          ...s.resources,
          gold: s.resources.gold - 15,
          armyPower: s.resources.armyPower + 2,
          armyMorale: Math.min(100, s.resources.armyMorale + 5),
        },
      };
    });
  };

  const handleTogglePolicy = (id: PolicyId) => {
    updateState(s => {
      const isActive = s.activePolicies.includes(id);
      if (isActive) {
        return { ...s, activePolicies: s.activePolicies.filter(p => p !== id) };
      } else {
        return { ...s, activePolicies: [...s.activePolicies, id] };
      }
    });
  };

  const handleToggleAdvisor = (id: AdvisorId) => {
    updateState(s => {
      const isActive = s.activeAdvisors.includes(id);
      if (isActive) {
        return { ...s, activeAdvisors: s.activeAdvisors.filter(a => a !== id) };
      } else {
        if (s.activeAdvisors.length >= 3) return s;
        return { ...s, activeAdvisors: [...s.activeAdvisors, id] };
      }
    });
  };

  const handleTabChange = (tab: Tab) => {
    updateState(s => ({ ...s, currentTab: tab }));
  };

  const executeTurn = (state: GameState) => {
    const { newState, summary } = processTurn(state);
    setTurnSummary(summary);

    const gameOverReason = checkGameOver(newState);
    if (gameOverReason) {
      const finalState: GameState = {
        ...newState,
        phase: 'gameover',
        gameOverReason,
        score: calculateScore(newState),
        currentEvent: null,
      };
      setGameState(finalState);
      saveGame(finalState);
      setPhase('gameover');
      return;
    }

    const saved = { ...newState, currentEvent: null };
    setGameState(saved);
    saveGame(saved);
    setPhase('summary');
  };

  const handleNextTurn = () => {
    if (!gameState) return;

    const event = rollForEvent(gameState);
    if (event) {
      const updated = { ...gameState, currentEvent: event };
      setGameState(updated);
      saveGame(updated);
      setPhase('event');
      return;
    }

    executeTurn(gameState);
  };

  const handleEventChoice = (index: number) => {
    if (!gameState) return;

    const resolved = resolveEvent(gameState, index);
    executeTurn(resolved);
  };

  const handleSummaryContinue = () => {
    setTurnSummary(null);
    setPhase('playing');
  };

  const handleTutorialNext = () => {
    updateState(s => {
      const nextStep = s.tutorialStep + 1;
      if (nextStep >= 6) return { ...s, tutorialStep: nextStep, tutorialDone: true };
      return { ...s, tutorialStep: nextStep };
    });
  };

  const handleTutorialSkip = () => {
    updateState(s => ({ ...s, tutorialDone: true }));
  };

  const handleRestart = () => {
    deleteSave();
    setGameState(null);
    setPhase('setup');
  };

  const handleMenu = () => {
    setGameState(null);
    setPhase('menu');
  };

  // Render
  if (phase === 'menu') {
    return <MainMenu onNewGame={handleNewGame} onContinue={handleContinue} />;
  }

  if (phase === 'setup') {
    return <SetupScreen onStart={handleStartGame} onBack={() => setPhase('menu')} />;
  }

  if (phase === 'gameover' && gameState) {
    return <GameOverScreen state={gameState} onRestart={handleRestart} onMenu={handleMenu} />;
  }

  if (!gameState) return null;

  return (
    <div className="game-container">
      {!gameState.tutorialDone && gameState.turn === 1 && (
        <Tutorial
          step={gameState.tutorialStep}
          onNext={handleTutorialNext}
          onSkip={handleTutorialSkip}
        />
      )}

      {phase === 'event' && gameState.currentEvent && (
        <EventModal
          event={gameState.currentEvent}
          onChoice={handleEventChoice}
        />
      )}

      {phase === 'summary' && turnSummary && (
        <TurnSummaryModal
          summary={turnSummary}
          onContinue={handleSummaryContinue}
        />
      )}

      <ResourceBar state={gameState} />

      <div className="tab-area">
        {gameState.currentTab === 'overview' && (
          <OverviewTab state={gameState} onSetTax={handleSetTax} onNextTurn={handleNextTurn} />
        )}
        {gameState.currentTab === 'build' && (
          <BuildTab state={gameState} onBuild={handleBuild} onUpgrade={handleUpgrade} />
        )}
        {gameState.currentTab === 'army' && (
          <ArmyTab state={gameState} onRecruit={handleRecruit} onTrain={handleTrain} />
        )}
        {gameState.currentTab === 'policies' && (
          <PoliciesTab state={gameState} onTogglePolicy={handleTogglePolicy} onToggleAdvisor={handleToggleAdvisor} />
        )}
        {gameState.currentTab === 'history' && (
          <HistoryTab state={gameState} />
        )}
      </div>

      <BottomNav currentTab={gameState.currentTab} onTabChange={handleTabChange} />
    </div>
  );
}

export default App;

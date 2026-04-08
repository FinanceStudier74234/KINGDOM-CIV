import React, { useState, useCallback } from 'react';
import {
  GameState, GamePhase, Tab, TaxLevel, BuildingId,
  PolicyId, AdvisorId, TurnSummary, Difficulty, KingdomTrait,
  KingdomType, RulerBackground, TechId,
} from './types/game';
import { createNewGame, saveGame, loadGame, deleteSave, addRulerXp } from './engine/gameState';
import { processTurn, checkGameOver, checkVictory, calculateScore } from './engine/turnEngine';
import { rollForEvent, resolveEvent } from './engine/eventEngine';
import { BUILDINGS, getBuildingCost, getBuildingUpgradeCost } from './data/buildings';
import { TECHNOLOGIES } from './data/technologies';

import { MainMenu } from './components/MainMenu';
import { SetupScreen } from './components/SetupScreen';
import { ResourceBar } from './components/ResourceBar';
import { OverviewTab } from './components/OverviewTab';
import { BuildTab } from './components/BuildTab';
import { ArmyTab } from './components/ArmyTab';
import { PoliciesTab } from './components/PoliciesTab';
import { HistoryTab } from './components/HistoryTab';
import { RulerTab } from './components/RulerTab';
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

  const handleStartGame = (
    name: string, difficulty: Difficulty, trait: KingdomTrait,
    kingdomType: KingdomType, rulerName: string, rulerBackground: RulerBackground
  ) => {
    const state = createNewGame(name, difficulty, trait, kingdomType, rulerName, rulerBackground);
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

  const handleSetTax = (level: TaxLevel) => updateState(s => ({ ...s, taxLevel: level }));

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

      return {
        ...s,
        resources: { ...s.resources, gold: s.resources.gold - cost },
        buildings: s.buildings.map(b => b.id === id ? { ...b, level: b.level + 1 } : b),
      };
    });
  };

  const handleRecruit = (amount: number) => {
    updateState(s => {
      const cost = amount * 8;
      if (s.resources.gold < cost || s.resources.population < 10) return s;
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
      return {
        ...s,
        activePolicies: isActive
          ? s.activePolicies.filter(p => p !== id)
          : [...s.activePolicies, id],
      };
    });
  };

  const handleToggleAdvisor = (id: AdvisorId) => {
    updateState(s => {
      const isActive = s.activeAdvisors.includes(id);
      if (isActive) return { ...s, activeAdvisors: s.activeAdvisors.filter(a => a !== id) };
      if (s.activeAdvisors.length >= 3) return s;
      return { ...s, activeAdvisors: [...s.activeAdvisors, id] };
    });
  };

  const handleStartResearch = (techId: TechId) => {
    updateState(s => {
      if (s.currentResearch) return s;
      const tDef = TECHNOLOGIES.find(t => t.id === techId);
      if (!tDef) return s;
      if (s.resources.gold < tDef.cost) return s;
      return {
        ...s,
        currentResearch: techId,
        resources: { ...s.resources, gold: s.resources.gold - tDef.cost },
      };
    });
  };

  const handleCancelResearch = () => {
    updateState(s => {
      if (!s.currentResearch) return s;
      // Refund half the gold cost
      const tDef = TECHNOLOGIES.find(t => t.id === s.currentResearch);
      const refund = tDef ? Math.floor(tDef.cost * 0.5) : 0;
      // Reset research turns
      const technologies = (s.technologies || []).map(t =>
        t.id === s.currentResearch ? { ...t, turnsRemaining: tDef?.researchTurns || t.turnsRemaining } : t
      );
      return {
        ...s,
        currentResearch: null,
        technologies,
        resources: { ...s.resources, gold: s.resources.gold + refund },
      };
    });
  };

  const handleTabChange = (tab: Tab) => updateState(s => ({ ...s, currentTab: tab }));

  const executeTurn = (state: GameState) => {
    const { newState, summary } = processTurn(state);
    setTurnSummary(summary);

    // Check victory first
    const victoryMessage = checkVictory(newState);
    if (victoryMessage) {
      const finalState: GameState = {
        ...newState,
        phase: 'gameover',
        gameOverReason: victoryMessage,
        score: calculateScore(newState) * 2, // Double score for victory!
        currentEvent: null,
      };
      setGameState(finalState);
      saveGame(finalState);
      setPhase('gameover');
      return;
    }

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
      return nextStep >= 6 ? { ...s, tutorialStep: nextStep, tutorialDone: true } : { ...s, tutorialStep: nextStep };
    });
  };

  const handleTutorialSkip = () => updateState(s => ({ ...s, tutorialDone: true }));

  const handleRestart = () => { deleteSave(); setGameState(null); setPhase('setup'); };
  const handleMenu = () => { setGameState(null); setPhase('menu'); };

  // Render
  if (phase === 'menu') return <MainMenu onNewGame={handleNewGame} onContinue={handleContinue} />;
  if (phase === 'setup') return <SetupScreen onStart={handleStartGame} onBack={() => setPhase('menu')} />;
  if (phase === 'gameover' && gameState) return <GameOverScreen state={gameState} onRestart={handleRestart} onMenu={handleMenu} />;
  if (!gameState) return null;

  return (
    <div className="game-container">
      {!gameState.tutorialDone && gameState.turn === 1 && (
        <Tutorial step={gameState.tutorialStep} onNext={handleTutorialNext} onSkip={handleTutorialSkip} />
      )}
      {phase === 'event' && gameState.currentEvent && (
        <EventModal event={gameState.currentEvent} onChoice={handleEventChoice} />
      )}
      {phase === 'summary' && turnSummary && (
        <TurnSummaryModal summary={turnSummary} onContinue={handleSummaryContinue} />
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
        {gameState.currentTab === 'ruler' && (
          <RulerTab state={gameState} onStartResearch={handleStartResearch} onCancelResearch={handleCancelResearch} />
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

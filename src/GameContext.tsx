import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  DEFAULT_SETTINGS,
  highscoreKey,
  loadHighscores,
  loadSettings,
  saveHighscores,
  saveSettings,
  type Highscores,
  type Mode,
  type Settings,
} from './storage';

type GameContextValue = {
  ready: boolean;
  settings: Settings;
  updateSettings: (change: Partial<Settings>) => void;
  highscores: Highscores;
  bestFor: (mode: Mode) => number | undefined;
  /** Saves the score if it beats the best one; returns true for a new record. */
  recordScore: (mode: Mode, score: number) => boolean;
  resetHighscores: () => void;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [highscores, setHighscores] = useState<Highscores>({});

  useEffect(() => {
    Promise.all([loadSettings(), loadHighscores()]).then(([s, h]) => {
      setSettings(s);
      setHighscores(h);
      setReady(true);
    });
  }, []);

  const keyFor = (mode: Mode) => highscoreKey(mode, settings.difficulty, settings.timerSeconds);

  const value: GameContextValue = {
    ready,
    settings,
    updateSettings: (change) => {
      const next = { ...settings, ...change };
      setSettings(next);
      saveSettings(next);
    },
    highscores,
    bestFor: (mode) => highscores[keyFor(mode)],
    recordScore: (mode, score) => {
      const key = keyFor(mode);
      const previous = highscores[key];
      if (previous !== undefined && score <= previous) return false;
      const next = { ...highscores, [key]: score };
      setHighscores(next);
      saveHighscores(next);
      // The very first game sets a score but isn't celebrated as a record unless something was scored.
      return previous !== undefined || score > 0;
    },
    resetHighscores: () => {
      setHighscores({});
      saveHighscores({});
    },
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}

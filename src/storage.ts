import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Difficulty } from './game/questions';

export type Mode = 'city' | 'state' | 'timed';
export type TimerSeconds = 30 | 60 | 90;

export type Settings = {
  difficulty: Difficulty;
  timerSeconds: TimerSeconds;
  readAloud: boolean;
  /** Applause and "oh-oh" sounds after each answer. */
  sounds: boolean;
  vibration: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  difficulty: 'leicht',
  timerSeconds: 60,
  readAloud: true,
  sounds: true,
  vibration: true,
};

/** Best score per mode and difficulty; the timed quiz is also split by its length. */
export type Highscores = Record<string, number>;

export function highscoreKey(mode: Mode, difficulty: Difficulty, timerSeconds: TimerSeconds): string {
  return mode === 'timed' ? `${mode}-${difficulty}-${timerSeconds}` : `${mode}-${difficulty}`;
}

const SETTINGS_KEY = 'kennzeichen-abenteuer/settings';
const HIGHSCORES_KEY = 'kennzeichen-abenteuer/highscores';

async function load<T extends object>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch (error) {
    console.error(`Unable to load ${key}.`, error);
    return fallback;
  }
}

async function save(key: string, value: object) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Unable to save ${key}.`, error);
  }
}

export const loadSettings = () => load(SETTINGS_KEY, DEFAULT_SETTINGS);
export const saveSettings = (settings: Settings) => save(SETTINGS_KEY, settings);
export const loadHighscores = () => load<Highscores>(HIGHSCORES_KEY, {});
export const saveHighscores = (scores: Highscores) => save(HIGHSCORES_KEY, scores);

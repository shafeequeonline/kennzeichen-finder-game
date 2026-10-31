import type { Difficulty } from '../game/questions';
import type { TimerSeconds } from '../storage';

export const DIFFICULTIES: { value: Difficulty; label: string; note: string }[] = [
  { value: 'leicht', label: 'Leicht', note: 'Große Städte und 3 Antworten zur Auswahl.' },
  { value: 'mittel', label: 'Mittel', note: 'Viele Städte und 4 Antworten zur Auswahl.' },
  { value: 'schwer', label: 'Schwer', note: 'Alle Orte in Deutschland und 4 Antworten.' },
];

export const TIMER_OPTIONS: { value: TimerSeconds; label: string }[] = [
  { value: 30, label: '30 s' },
  { value: 60, label: '60 s' },
  { value: 90, label: '90 s' },
];

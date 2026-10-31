export type PlateCode = {
  code: string;
  type: 'district' | 'official';
  districts: string[];
  origin: string | null;
  states: string[];
  statesEn: string[];
};

export type Difficulty = 'leicht' | 'mittel' | 'schwer';

/** A code the game can ask about: one place name a child can read, and exactly one federal state. */
export type Place = { code: string; name: string; state: string };

export type Question = {
  kind: 'city' | 'state';
  place: Place;
  /** Answer texts in the order they are shown; one of them is `answer`. */
  options: string[];
  answer: string;
};

export type Rng = () => number;

/**
 * Big, well-known cities for the youngest players, with the short names children know
 * ("Frankfurt", not "Frankfurt am Main").
 */
const EASY: Record<string, string> = {
  B: 'Berlin',
  HH: 'Hamburg',
  M: 'München',
  K: 'Köln',
  F: 'Frankfurt',
  S: 'Stuttgart',
  D: 'Düsseldorf',
  DO: 'Dortmund',
  E: 'Essen',
  HB: 'Bremen',
  H: 'Hannover',
  L: 'Leipzig',
  DD: 'Dresden',
  N: 'Nürnberg',
  DU: 'Duisburg',
  BO: 'Bochum',
  W: 'Wuppertal',
  BI: 'Bielefeld',
  BN: 'Bonn',
  MS: 'Münster',
  KA: 'Karlsruhe',
  MA: 'Mannheim',
  A: 'Augsburg',
  WI: 'Wiesbaden',
  KI: 'Kiel',
  HRO: 'Rostock',
  MD: 'Magdeburg',
  EF: 'Erfurt',
  SB: 'Saarbrücken',
  MZ: 'Mainz',
  P: 'Potsdam',
  SN: 'Schwerin',
  HD: 'Heidelberg',
  WOB: 'Wolfsburg',
  R: 'Regensburg',
  FR: 'Freiburg',
  HL: 'Lübeck',
  BS: 'Braunschweig',
  KS: 'Kassel',
  AC: 'Aachen',
};

const NAME_PREFIXES = /^(Landkreis|Städteregion|Regionalverband|Region|Kreis) /;

function placeName(p: PlateCode): string {
  if (EASY[p.code]) return EASY[p.code];
  if (p.origin && !p.origin.includes('/')) return p.origin;
  return p.districts[0].replace(NAME_PREFIXES, '');
}

/** Looks like a town rather than a district ("Ostalbkreis", "Altenburger Land"). */
function isTown(p: PlateCode): boolean {
  const name = p.districts[0];
  return !p.origin && !/kreis|Kreis| Land$|-/.test(name) && !NAME_PREFIXES.test(name);
}

export function buildPools(plates: PlateCode[]): Record<Difficulty, Place[]> {
  const usable = plates.filter((p) => p.type === 'district' && p.states.length === 1);
  const toPlace = (p: PlateCode): Place => ({ code: p.code, name: placeName(p), state: p.states[0] });
  const easy = usable.filter((p) => EASY[p.code]);
  return {
    leicht: easy.map(toPlace),
    mittel: usable.filter((p) => EASY[p.code] || isTown(p)).map(toPlace),
    schwer: usable.map(toPlace),
  };
}

export function shuffle<T>(items: T[], rng: Rng = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Leicht has three answers so the youngest players aren't overwhelmed; the others have four. */
export function optionCount(difficulty: Difficulty): number {
  return difficulty === 'leicht' ? 3 : 4;
}

function withDistractors(answer: string, candidates: string[], count: number, rng: Rng): string[] {
  const wrong = shuffle([...new Set(candidates)].filter((c) => c !== answer), rng).slice(0, count - 1);
  return shuffle([answer, ...wrong], rng);
}

export function makeQuestion(
  kind: Question['kind'],
  pool: Place[],
  difficulty: Difficulty,
  rng: Rng = Math.random,
  avoid: ReadonlySet<string> = new Set(),
): Question {
  const fresh = pool.filter((p) => !avoid.has(p.code));
  const from = fresh.length > 0 ? fresh : pool;
  const place = from[Math.floor(rng() * from.length)];
  const count = optionCount(difficulty);
  if (kind === 'city') {
    const answer = place.name;
    return { kind, place, answer, options: withDistractors(answer, pool.map((p) => p.name), count, rng) };
  }
  const answer = place.state;
  // All 16 states are possible wrong answers, even on Leicht, where only a few states have big cities.
  return { kind, place, answer, options: withDistractors(answer, ALL_STATES, count, rng) };
}

export const ALL_STATES = [
  'Baden-Württemberg',
  'Bayern',
  'Berlin',
  'Brandenburg',
  'Bremen',
  'Hamburg',
  'Hessen',
  'Mecklenburg-Vorpommern',
  'Niedersachsen',
  'Nordrhein-Westfalen',
  'Rheinland-Pfalz',
  'Saarland',
  'Sachsen',
  'Sachsen-Anhalt',
  'Schleswig-Holstein',
  'Thüringen',
];

export const ROUND_LENGTH = 10;

/** Every finished round earns at least one star, so a game never ends in "you failed". */
export function starsFor(correct: number, total: number = ROUND_LENGTH): 1 | 2 | 3 {
  const ratio = total > 0 ? correct / total : 0;
  if (ratio >= 0.9) return 3;
  if (ratio >= 0.6) return 2;
  return 1;
}

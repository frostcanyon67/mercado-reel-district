/**
 * Seeded randomness + the single spin draw.
 * Never uses the global Math.random in the evaluation path, so every
 * spin is reproducible from its seed.
 */
import {
  BIG_WIN_THRESHOLD,
  LANDING_MAX,
  LANDING_MIN,
  LANTERN_METER_MAX,
  PITY_AFTER_LOSSES,
  PITY_WILD_BOOST,
  REELS,
  ROWS,
  STRIP_LEN,
} from '../constants/config';
import {evaluateSpin, Grid, SpinWin} from './paylines';
import {SYMBOLS, SymbolDef, WILD} from './symbols';

export type Rng = () => number;

/** mulberry32 - small, fast, deterministic. */
export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function spinSeed(missionIndex: number, spinIndex: number, salt: number): number {
  return ((missionIndex * 7919) ^ (spinIndex * 104729) ^ salt) >>> 0;
}

export function weightedPick(rng: Rng, wildBoost: number = 1): SymbolDef {
  const total = SYMBOLS.reduce((sum, s) => sum + s.weight * (s.isWild ? wildBoost : 1), 0);
  let roll = rng() * total;
  for (let i = 0; i < SYMBOLS.length; i++) {
    const s = SYMBOLS[i];
    roll -= s.weight * (s.isWild ? wildBoost : 1);
    if (roll <= 0) {
      return s;
    }
  }
  return SYMBOLS[0];
}

/** Decorative reel strip. The real outcome is written into it after the draw. */
export function buildStrip(rng: Rng, len: number = STRIP_LEN): SymbolDef[] {
  const strip: SymbolDef[] = [];
  for (let i = 0; i < len; i++) {
    strip.push(weightedPick(rng));
  }
  return strip;
}

export function drawGrid(rng: Rng, wildBoost: number, forcedWildCol: number | null): Grid {
  const grid: Grid = [];
  for (let r = 0; r < ROWS; r++) {
    const row: SymbolDef[] = [];
    for (let c = 0; c < REELS; c++) {
      row.push(weightedPick(rng, wildBoost));
    }
    grid.push(row);
  }
  if (forcedWildCol !== null && forcedWildCol >= 0 && forcedWildCol < REELS) {
    grid[1][forcedWildCol] = WILD;
  }
  return grid;
}

/** Landing index inside the strip, kept away from both ends. */
export function pickLanding(rng: Rng): number {
  const span = LANDING_MAX - LANDING_MIN + 1;
  return LANDING_MIN + Math.floor(rng() * span);
}

export type SpinInput = {
  seed: number;
  lossStreak: number;
  bigWinCooldown: number;
  lanternCharge: number;
  lineBet: number;
  multiplier: number;
};

export type SpinOutcome = {
  grid: Grid;
  win: SpinWin;
  forcedWild: boolean;
  landings: number[];
  wildBoost: number;
};

/**
 * One complete spin: pity bias, lantern-meter forcing, big-win cooldown,
 * pay-line evaluation and the landing indices for the three reels.
 */
export function performSpin(input: SpinInput): SpinOutcome {
  const rng = createRng(input.seed);
  const wildBoost = input.lossStreak >= PITY_AFTER_LOSSES ? PITY_WILD_BOOST : 1;
  const forcedWild = input.lanternCharge >= LANTERN_METER_MAX;
  const forcedCol = forcedWild ? Math.floor(rng() * REELS) : null;

  let grid = drawGrid(rng, wildBoost, forcedCol);
  let win = evaluateSpin(grid, input.lineBet, input.multiplier);

  // After a big win, two ordinary spins are enforced before another one.
  let guard = 0;
  while (input.bigWinCooldown > 0 && win.amount >= BIG_WIN_THRESHOLD && guard < 4) {
    grid = drawGrid(rng, wildBoost, forcedCol);
    win = evaluateSpin(grid, input.lineBet, input.multiplier);
    guard += 1;
  }

  const landings: number[] = [];
  for (let c = 0; c < REELS; c++) {
    landings.push(pickLanding(rng));
  }

  return {grid, win, forcedWild, landings, wildBoost};
}

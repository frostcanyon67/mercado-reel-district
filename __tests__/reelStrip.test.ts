import {LINE_BET, STRIP_LEN, TARGET_HIT_RATE} from '../src/constants/config';
import {buildStrip, createRng, drawGrid, performSpin, spinSeed} from '../src/game/spin';
import {SYMBOLS} from '../src/game/symbols';

describe('reel strips and randomness', () => {
  it('uses exactly one shared symbol pool', () => {
    expect(SYMBOLS).toHaveLength(5);
    const keys = SYMBOLS.map(s => s.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(SYMBOLS.filter(s => s.isWild === true)).toHaveLength(1);
  });

  it('builds a strip of the configured length from the shared pool', () => {
    const strip = buildStrip(createRng(1234));
    expect(strip).toHaveLength(STRIP_LEN);
    strip.forEach(symbol => expect(SYMBOLS.indexOf(symbol)).toBeGreaterThanOrEqual(0));
  });

  it('is deterministic for a fixed seed and different across seeds', () => {
    const a = buildStrip(createRng(42)).map(s => s.key);
    const b = buildStrip(createRng(42)).map(s => s.key);
    const c = buildStrip(createRng(43)).map(s => s.key);
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });

  it('produces visibly different boards on two consecutive spins', () => {
    const first = drawGrid(createRng(spinSeed(0, 1, 7)), 1, null);
    const second = drawGrid(createRng(spinSeed(0, 2, 7)), 1, null);
    const flat = (g: typeof first) => g.map(r => r.map(c => c.key).join('')).join('');
    expect(flat(first)).not.toEqual(flat(second));
  });

  it('lands a hit rate inside the designed band', () => {
    let hits = 0;
    const rounds = 4000;
    for (let i = 0; i < rounds; i++) {
      const outcome = performSpin({
        seed: spinSeed(0, i, 991),
        lossStreak: 0,
        bigWinCooldown: 0,
        lanternCharge: 0,
        lineBet: LINE_BET,
        multiplier: 1,
      });
      if (outcome.win.amount > 0) {
        hits += 1;
      }
    }
    const rate = hits / rounds;
    expect(rate).toBeGreaterThanOrEqual(TARGET_HIT_RATE[0] - 0.12);
    expect(rate).toBeLessThanOrEqual(TARGET_HIT_RATE[1] + 0.12);
  });

  it('keeps every landing index inside the strip bounds', () => {
    const outcome = performSpin({
      seed: spinSeed(1, 1, 5),
      lossStreak: 0,
      bigWinCooldown: 0,
      lanternCharge: 0,
      lineBet: LINE_BET,
      multiplier: 1,
    });
    outcome.landings.forEach(land => {
      expect(land).toBeGreaterThanOrEqual(0);
      expect(land + 2).toBeLessThan(STRIP_LEN);
    });
  });
});

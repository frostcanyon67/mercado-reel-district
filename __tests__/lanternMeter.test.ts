import {LANTERN_METER_MAX, LINE_BET, PITY_AFTER_LOSSES} from '../src/constants/config';
import {performSpin, spinSeed} from '../src/game/spin';
import {isWild} from '../src/game/symbols';

function spin(charge: number, lossStreak: number, seed: number) {
  return performSpin({
    seed,
    lossStreak,
    bigWinCooldown: 0,
    lanternCharge: charge,
    lineBet: LINE_BET,
    multiplier: 1,
  });
}

describe('lantern meter', () => {
  it('charges over five steps', () => {
    expect(LANTERN_METER_MAX).toBe(5);
  });

  it('forces a wild onto the centre row once the meter is full', () => {
    for (let i = 0; i < 25; i++) {
      const outcome = spin(LANTERN_METER_MAX, 0, spinSeed(0, i, 31));
      expect(outcome.forcedWild).toBe(true);
      expect(outcome.grid[1].some(isWild)).toBe(true);
    }
  });

  it('does not force a wild while the meter is still charging', () => {
    for (let i = 0; i < 10; i++) {
      expect(spin(LANTERN_METER_MAX - 1, 0, spinSeed(0, i, 77)).forcedWild).toBe(false);
    }
  });

  it('boosts the wild weight only after the pity threshold', () => {
    expect(spin(0, PITY_AFTER_LOSSES - 1, spinSeed(0, 1, 5)).wildBoost).toBe(1);
    expect(spin(0, PITY_AFTER_LOSSES, spinSeed(0, 1, 5)).wildBoost).toBeGreaterThan(1);
  });

  it('shows more wilds across many spins when the pity bias is on', () => {
    const count = (lossStreak: number) => {
      let wilds = 0;
      for (let i = 0; i < 1500; i++) {
        const grid = spin(0, lossStreak, spinSeed(2, i, 404)).grid;
        wilds += grid[1].filter(isWild).length;
      }
      return wilds;
    };
    expect(count(PITY_AFTER_LOSSES)).toBeGreaterThan(count(0));
  });
});

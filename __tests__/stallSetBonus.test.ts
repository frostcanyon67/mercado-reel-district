import {LINE_BET, SET_BONUS} from '../src/constants/config';
import {activeSetThemes, hasSetBonus} from '../src/game/districts';
import {winMultiplier} from '../src/game/economy';
import {evaluateSpin} from '../src/game/paylines';
import {ALL_CHILI, gridOf} from './helpers';

const FULL_SPICE = ['spice-0', 'spice-1', 'spice-2'];

describe('stall set bonus', () => {
  it('grants the bonus only for a completed row', () => {
    expect(hasSetBonus(0, ['spice-0', 'spice-1'])).toBe(false);
    expect(hasSetBonus(0, FULL_SPICE)).toBe(true);
    expect(activeSetThemes(FULL_SPICE)).toEqual(['chili']);
  });

  it('applies +15% to the theme of that row only', () => {
    expect(
      winMultiplier({themeKey: 'chili', setThemes: ['chili'], closingBell: false}),
    ).toBeCloseTo(SET_BONUS);
    expect(winMultiplier({themeKey: 'pot', setThemes: ['chili'], closingBell: false})).toBe(1);
  });

  it('pays more coins with the bonus than without it', () => {
    const plain = evaluateSpin(gridOf(ALL_CHILI), LINE_BET, 1).amount;
    const bonus = evaluateSpin(gridOf(ALL_CHILI), LINE_BET, SET_BONUS).amount;
    expect(bonus).toBeGreaterThan(plain);
  });

  it('stacks with the closing bell rush', () => {
    const multiplier = winMultiplier({
      themeKey: 'chili',
      setThemes: ['chili'],
      closingBell: true,
    });
    expect(multiplier).toBeCloseTo(SET_BONUS * 2);
  });
});

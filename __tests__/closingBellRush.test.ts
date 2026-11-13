import {CLOSING_BELL_MULT, LINE_BET} from '../src/constants/config';
import {winMultiplier} from '../src/game/economy';
import {countTokens, isClosingBell, missionById} from '../src/game/missions';
import {evaluateSpin} from '../src/game/paylines';
import {ALL_CHILI, gridOf} from './helpers';

describe('closing bell rush', () => {
  it('arms on the last spin of the budget and nowhere else', () => {
    const mission = missionById('spice-0');
    for (let used = 0; used < mission.spinBudget; used++) {
      expect(isClosingBell(used, mission.spinBudget)).toBe(used === mission.spinBudget - 1);
    }
  });

  it('doubles the tokens of the final spin', () => {
    const grid = gridOf([
      ['pot', 'pot', 'pot'],
      ['chili', 'chili', 'basket'],
      ['pot', 'pot', 'pot'],
    ]);
    expect(countTokens(grid, 'chili', false)).toBe(2);
    expect(countTokens(grid, 'chili', true)).toBe(2 * CLOSING_BELL_MULT);
  });

  it('doubles the coin win of the final spin', () => {
    const multiplier = winMultiplier({themeKey: 'chili', setThemes: [], closingBell: true});
    expect(multiplier).toBe(CLOSING_BELL_MULT);
    const plain = evaluateSpin(gridOf(ALL_CHILI), LINE_BET, 1).amount;
    const rushed = evaluateSpin(gridOf(ALL_CHILI), LINE_BET, multiplier).amount;
    expect(rushed).toBe(plain * CLOSING_BELL_MULT);
  });

  it('can turn a near miss into a won mission', () => {
    const mission = missionById('spice-0');
    const grid = gridOf([
      ['pot', 'pot', 'pot'],
      ['chili', 'chili', 'lantern'],
      ['pot', 'pot', 'pot'],
    ]);
    const before = mission.goalTokens - 4;
    expect(before + countTokens(grid, 'chili', false)).toBeLessThan(mission.goalTokens);
    expect(before + countTokens(grid, 'chili', true)).toBeGreaterThanOrEqual(mission.goalTokens);
  });
});

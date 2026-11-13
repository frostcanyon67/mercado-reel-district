import {BET_AMOUNT} from '../src/constants/config';
import {
  countTokens,
  isClosingBell,
  MISSIONS,
  missionById,
  missionGoalText,
  nextMission,
  resolveMission,
} from '../src/game/missions';
import {gridOf} from './helpers';

describe('themed reel missions', () => {
  it('defines nine missions across three districts', () => {
    expect(MISSIONS).toHaveLength(9);
    [0, 1, 2].forEach(d => {
      expect(MISSIONS.filter(m => m.districtIndex === d)).toHaveLength(3);
    });
  });

  it('counts a theme token for every centre-row theme symbol or wild', () => {
    const grid = gridOf([
      ['pot', 'pot', 'pot'],
      ['chili', 'lantern', 'basket'],
      ['pot', 'pot', 'pot'],
    ]);
    expect(countTokens(grid, 'chili', false)).toBe(2);
  });

  it('ignores theme symbols outside the centre row', () => {
    const grid = gridOf([
      ['chili', 'chili', 'chili'],
      ['basket', 'basket', 'basket'],
      ['chili', 'chili', 'chili'],
    ]);
    expect(countTokens(grid, 'chili', false)).toBe(0);
  });

  it('keeps the mission running until a condition is met', () => {
    const state = {
      tokens: 2,
      goalTokens: 6,
      spinsUsed: 1,
      spinBudget: 6,
      balance: 500,
      bet: BET_AMOUNT,
    };
    expect(resolveMission(state)).toBe('running');
  });

  it('ends the mission on the goal, the budget or an empty purse', () => {
    const base = {goalTokens: 6, spinBudget: 6, balance: 500, bet: BET_AMOUNT};
    expect(resolveMission({...base, tokens: 6, spinsUsed: 3})).toBe('won');
    expect(resolveMission({...base, tokens: 2, spinsUsed: 6})).toBe('lost');
    expect(resolveMission({...base, tokens: 2, spinsUsed: 2, balance: 5})).toBe('broke');
  });

  it('arms the closing bell on the final spin only', () => {
    expect(isClosingBell(4, 6)).toBe(false);
    expect(isClosingBell(5, 6)).toBe(true);
  });

  it('offers the first spice mission on a fresh profile', () => {
    expect(nextMission([]).id).toBe('spice-0');
    expect(missionById('spice-0').goalTokens).toBe(6);
    expect(missionGoalText(missionById('spice-0'), 'CHILI')).toContain('6 CHILI TOKENS IN 6 SPINS');
  });

  it('falls back to the first mission for an unknown id', () => {
    expect(missionById('nope').id).toBe('spice-0');
  });
});

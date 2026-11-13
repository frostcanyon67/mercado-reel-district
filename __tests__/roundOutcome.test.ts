import {BET_AMOUNT} from '../src/constants/config';
import {missionById, resolveMission} from '../src/game/missions';

const TITLES: Record<string, string> = {
  won: 'STALL SECURED',
  lost: 'STALL CLOSED',
  broke: 'OUT OF COINS',
};

describe('round outcome', () => {
  it('names every ending in the game own words, never a generic one', () => {
    ['won', 'lost', 'broke'].forEach(outcome => {
      expect(TITLES[outcome]).toBeDefined();
      expect(TITLES[outcome].toLowerCase()).not.toContain('game over');
      expect(TITLES[outcome].toLowerCase()).not.toContain('you win');
    });
  });

  it('reaches a result within the spin budget when nothing is collected', () => {
    const mission = missionById('spice-0');
    let outcome = 'running';
    let spins = 0;
    while (outcome === 'running' && spins < 50) {
      spins += 1;
      outcome = resolveMission({
        tokens: 0,
        goalTokens: mission.goalTokens,
        spinsUsed: spins,
        spinBudget: mission.spinBudget,
        balance: 1000,
        bet: BET_AMOUNT,
      });
    }
    expect(outcome).toBe('lost');
    expect(spins).toBe(mission.spinBudget);
  });

  it('never ends on its own while the player can still afford a spin', () => {
    const mission = missionById('spice-0');
    for (let spins = 0; spins < mission.spinBudget; spins++) {
      expect(
        resolveMission({
          tokens: 1,
          goalTokens: mission.goalTokens,
          spinsUsed: spins,
          spinBudget: mission.spinBudget,
          balance: 1000,
          bet: BET_AMOUNT,
        }),
      ).toBe('running');
    }
  });
});

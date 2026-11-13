import {HAGGLE_COST} from '../src/constants/config';
import {canHaggle, payHaggle} from '../src/game/economy';

describe('haggle re-spin', () => {
  it('is offered only after a spin that scored no tokens', () => {
    expect(canHaggle(500, false, 0)).toBe(true);
    expect(canHaggle(500, false, 1)).toBe(false);
  });

  it('is offered once per mission', () => {
    expect(canHaggle(500, true, 0)).toBe(false);
  });

  it('is hidden before the first spin of a mission', () => {
    // lastTokens starts at -1: no spin has resolved yet.
    expect(canHaggle(500, false, -1)).toBe(false);
  });

  it('needs the fee in the purse', () => {
    expect(canHaggle(HAGGLE_COST, false, 0)).toBe(true);
    expect(canHaggle(HAGGLE_COST - 1, false, 0)).toBe(false);
  });

  it('costs ten coins and never uses a budget spin', () => {
    expect(HAGGLE_COST).toBe(10);
    expect(payHaggle(100)).toBe(90);
  });
});

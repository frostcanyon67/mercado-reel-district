import {BET_AMOUNT} from '../src/constants/config';
import {isSpinDisabled, isTouchTargetValid, MIN_TOUCH_SIZE, PRESS_SCALE} from '../src/game/ui';

describe('responsive touch controls', () => {
  it('disables SPIN while a spin is running', () => {
    expect(isSpinDisabled('idle', 1000)).toBe(false);
    expect(isSpinDisabled('spinning', 1000)).toBe(true);
    expect(isSpinDisabled('evaluating', 1000)).toBe(true);
    expect(isSpinDisabled('winning', 1000)).toBe(true);
  });

  it('disables SPIN when the stake cannot be paid', () => {
    expect(isSpinDisabled('idle', BET_AMOUNT)).toBe(false);
    expect(isSpinDisabled('idle', BET_AMOUNT - 1)).toBe(true);
    expect(isSpinDisabled('idle', 0)).toBe(true);
  });

  it('keeps every interactive target at or above the touch floor', () => {
    expect(MIN_TOUCH_SIZE).toBeGreaterThanOrEqual(48);
    expect(isTouchTargetValid({width: 124, height: 124})).toBe(true); // SPIN
    expect(isTouchTargetValid({width: 48, height: 48})).toBe(true); // header tile
    expect(isTouchTargetValid({width: 40, height: 40})).toBe(false);
  });

  it('presses in to a visible but subtle scale', () => {
    expect(PRESS_SCALE).toBeLessThan(1);
    expect(PRESS_SCALE).toBeGreaterThan(0.9);
  });
});

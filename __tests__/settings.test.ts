import {SPEED_MULTIPLIER, STOP_DELAYS_MS} from '../src/constants/config';
import {defaultProfile, parseProfile, serialize} from '../src/game/storage';

describe('settings', () => {
  it('ships three reel speeds that really change the stop delays', () => {
    expect(SPEED_MULTIPLIER.relaxed).toBeGreaterThan(SPEED_MULTIPLIER.standard);
    expect(SPEED_MULTIPLIER.fast).toBeLessThan(SPEED_MULTIPLIER.standard);
    const relaxed = STOP_DELAYS_MS.map(d => d * SPEED_MULTIPLIER.relaxed);
    const fast = STOP_DELAYS_MS.map(d => d * SPEED_MULTIPLIER.fast);
    relaxed.forEach((value, i) => expect(value).toBeGreaterThan(fast[i]));
  });

  it('keeps the reels stopping left to right whatever the speed', () => {
    (['relaxed', 'standard', 'fast'] as const).forEach(speed => {
      const delays = STOP_DELAYS_MS.map(d => d * SPEED_MULTIPLIER[speed]);
      expect(delays[0]).toBeLessThan(delays[1]);
      expect(delays[1]).toBeLessThan(delays[2]);
    });
  });

  it('persists every option', () => {
    const profile = {
      ...defaultProfile(),
      settings: {reelSpeed: 'fast' as const, payLineGuides: false, bigWinBanner: false},
    };
    const loaded = parseProfile(serialize(profile));
    expect(loaded.settings.reelSpeed).toBe('fast');
    expect(loaded.settings.payLineGuides).toBe(false);
    expect(loaded.settings.bigWinBanner).toBe(false);
  });

  it('repairs an unknown stored speed instead of crashing', () => {
    expect(parseProfile('{"settings":{"reelSpeed":"warp"}}').settings.reelSpeed).toBe('standard');
  });

  it('offers no audio option, because the app has no audio', () => {
    expect(Object.keys(defaultProfile().settings)).toEqual([
      'reelSpeed',
      'payLineGuides',
      'bigWinBanner',
    ]);
  });
});

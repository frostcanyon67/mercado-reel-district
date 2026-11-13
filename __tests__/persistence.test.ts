import {STARTING_BALANCE} from '../src/constants/config';
import {
  clearProfile,
  defaultProfile,
  loadProfile,
  parseProfile,
  resetMemoryStorage,
  saveProfile,
  serialize,
} from '../src/game/storage';

describe('local persistence', () => {
  beforeEach(() => {
    resetMemoryStorage();
  });

  it('starts from a themed default profile', () => {
    const profile = defaultProfile();
    expect(profile.balance).toBe(STARTING_BALANCE);
    expect(profile.stalls).toEqual([]);
    expect(profile.settings.reelSpeed).toBe('standard');
  });

  it('round-trips a saved profile', async () => {
    const profile = {
      ...defaultProfile(),
      balance: 735,
      stalls: ['spice-0'],
      stallCoins: {'spice-0': 120},
    };
    await saveProfile(profile);
    const loaded = await loadProfile();
    expect(loaded.balance).toBe(735);
    expect(loaded.stalls).toEqual(['spice-0']);
    expect(loaded.stallCoins['spice-0']).toBe(120);
  });

  it('falls back to a fresh profile on a missing or corrupt record', () => {
    expect(parseProfile(null).balance).toBe(STARTING_BALANCE);
    expect(parseProfile('not json at all').balance).toBe(STARTING_BALANCE);
    expect(parseProfile('{"balance":"oops"}').balance).toBe(STARTING_BALANCE);
    expect(parseProfile('[]').stalls).toEqual([]);
  });

  it('drops junk entries instead of crashing', () => {
    const raw = serialize({...defaultProfile(), stalls: ['spice-0']});
    const broken = raw.replace('"spice-0"', '12345');
    expect(parseProfile(broken).stalls).toEqual([]);
  });

  it('wipes everything on reset', async () => {
    await saveProfile({...defaultProfile(), balance: 10, stalls: ['spice-0', 'spice-1']});
    const fresh = await clearProfile();
    expect(fresh.balance).toBe(STARTING_BALANCE);
    expect(fresh.stalls).toEqual([]);
    const reloaded = await loadProfile();
    expect(reloaded.stalls).toEqual([]);
  });
});

import {isDistrictUnlocked, stallsWonInDistrict} from '../src/game/districts';
import {isMissionUnlocked, isMissionWon, missionById, nextMission} from '../src/game/missions';

describe('district progression', () => {
  it('opens only the first district on a fresh profile', () => {
    expect(isDistrictUnlocked(0, [])).toBe(true);
    expect(isDistrictUnlocked(1, [])).toBe(false);
    expect(isDistrictUnlocked(2, [])).toBe(false);
  });

  it('opens the next district once the previous row is complete', () => {
    const stalls = ['spice-0', 'spice-1', 'spice-2'];
    expect(stallsWonInDistrict(0, stalls)).toBe(3);
    expect(isDistrictUnlocked(1, stalls)).toBe(true);
    expect(isDistrictUnlocked(2, stalls)).toBe(false);
  });

  it('keeps later missions of a row locked until the previous one is won', () => {
    expect(isMissionUnlocked(missionById('spice-0'), [])).toBe(true);
    expect(isMissionUnlocked(missionById('spice-1'), [])).toBe(false);
    expect(isMissionUnlocked(missionById('spice-1'), ['spice-0'])).toBe(true);
  });

  it('marks a mission as won from its stall', () => {
    expect(isMissionWon(missionById('spice-0'), ['spice-0'])).toBe(true);
    expect(isMissionWon(missionById('spice-1'), ['spice-0'])).toBe(false);
  });

  it('walks the player through the rows in order', () => {
    expect(nextMission([]).id).toBe('spice-0');
    expect(nextMission(['spice-0']).id).toBe('spice-1');
    expect(nextMission(['spice-0', 'spice-1', 'spice-2']).id).toBe('clay-0');
  });

  it('rises in difficulty: rarer themes get smaller goals', () => {
    expect(missionById('spice-0').goalTokens).toBeGreaterThan(missionById('brass-0').goalTokens);
    expect(missionById('brass-0').spinBudget).toBeGreaterThan(missionById('spice-0').spinBudget);
  });
});

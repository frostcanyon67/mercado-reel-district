import {DISTRICTS, TOTAL_STALLS} from '../src/game/districts';
import {MISSIONS} from '../src/game/missions';
import {defaultProfile} from '../src/game/storage';
import {collectionIsEmpty, collectionSections} from '../src/game/ui';

describe('stall collection', () => {
  it('has one stall per mission and nine in total', () => {
    expect(TOTAL_STALLS).toBe(9);
    const ids = MISSIONS.map(m => m.stallId);
    expect(new Set(ids).size).toBe(9);
    DISTRICTS.forEach(d => expect(d.stalls).toHaveLength(3));
  });

  it('uses themed stall names, never placeholders', () => {
    DISTRICTS.forEach(d =>
      d.stalls.forEach(stall => {
        expect(stall.name.length).toBeGreaterThan(3);
        expect(stall.name.toLowerCase()).not.toContain('item');
        expect(stall.name.toLowerCase()).not.toContain('lorem');
      }),
    );
  });

  it('flips a stall to unlocked and keeps its earned coins', () => {
    const profile = {
      ...defaultProfile(),
      stalls: ['spice-0'],
      stallCoins: {'spice-0': 240},
    };
    const sections = collectionSections(profile);
    const cell = sections[0].cells[0];
    expect(cell.unlocked).toBe(true);
    expect(cell.coins).toBe(240);
    expect(sections[0].cells[1].unlocked).toBe(false);
  });

  it('reports the empty state on a fresh profile', () => {
    expect(collectionIsEmpty(defaultProfile())).toBe(true);
    expect(collectionIsEmpty({...defaultProfile(), stalls: ['spice-0']})).toBe(false);
  });
});

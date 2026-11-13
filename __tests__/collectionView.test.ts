import {defaultProfile} from '../src/game/storage';
import {collectionIsEmpty, collectionSections} from '../src/game/ui';

describe('collection view', () => {
  it('always renders nine cards split into three districts', () => {
    const sections = collectionSections(defaultProfile());
    expect(sections).toHaveLength(3);
    expect(sections.reduce((n, s) => n + s.cells.length, 0)).toBe(9);
  });

  it('shows every card as a locked silhouette on a fresh profile', () => {
    const sections = collectionSections(defaultProfile());
    sections.forEach(section =>
      section.cells.forEach(cell => {
        expect(cell.unlocked).toBe(false);
        expect(cell.coins).toBe(0);
      }),
    );
    expect(collectionIsEmpty(defaultProfile())).toBe(true);
  });

  it('raises the set banner only when a whole row is collected', () => {
    const partial = collectionSections({
      ...defaultProfile(),
      stalls: ['spice-0', 'spice-1'],
    });
    expect(partial[0].setComplete).toBe(false);

    const complete = collectionSections({
      ...defaultProfile(),
      stalls: ['spice-0', 'spice-1', 'spice-2'],
    });
    expect(complete[0].setComplete).toBe(true);
    expect(complete[1].setComplete).toBe(false);
  });

  it('carries each card theme sprite from its district', () => {
    const sections = collectionSections(defaultProfile());
    expect(sections[0].cells.every(c => c.themeKey === 'chili')).toBe(true);
    expect(sections[1].cells.every(c => c.themeKey === 'pot')).toBe(true);
    expect(sections[2].cells.every(c => c.themeKey === 'scale')).toBe(true);
  });
});

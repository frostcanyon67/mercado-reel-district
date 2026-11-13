import {defaultProfile} from '../src/game/storage';
import {progressSummary, shouldRenderStatRow, visibleStats} from '../src/game/ui';

describe('progress summary', () => {
  it('builds one row per district plus four lifetime stats', () => {
    const summary = progressSummary(defaultProfile());
    expect(summary.rows).toHaveLength(3);
    expect(summary.stats).toHaveLength(4);
    expect(summary.rows.map(r => r.name)).toEqual(['SPICE ROW', 'CLAY ROW', 'BRASS ROW']);
  });

  it('counts only the stalls of their own district', () => {
    const summary = progressSummary({
      ...defaultProfile(),
      stalls: ['spice-0', 'spice-1', 'clay-0'],
    });
    expect(summary.rows[0].won).toBe(2);
    expect(summary.rows[1].won).toBe(1);
    expect(summary.rows[2].won).toBe(0);
  });

  it('hides a stat pill with nothing to show', () => {
    const summary = progressSummary(defaultProfile());
    expect(visibleStats(summary.stats)).toHaveLength(0);
    expect(shouldRenderStatRow(summary.stats)).toBe(false);
  });

  it('renders a row once at least two pills carry a value', () => {
    const summary = progressSummary({
      ...defaultProfile(),
      stats: {totalSpins: 12, bestWin: 90, biggestLine: 0, missionsWon: 0, coinsWon: 90},
    });
    expect(visibleStats(summary.stats)).toHaveLength(2);
    expect(shouldRenderStatRow(summary.stats)).toBe(true);
  });
});

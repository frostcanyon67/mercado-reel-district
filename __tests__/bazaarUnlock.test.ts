import {bazaarOpen, TOTAL_STALLS} from '../src/game/districts';
import {MISSIONS} from '../src/game/missions';
import {defaultProfile} from '../src/game/storage';
import {progressSummary} from '../src/game/ui';

const ALL_STALLS = MISSIONS.map(m => m.stallId);

describe('night bazaar unlock', () => {
  it('stays closed while a single stall is missing', () => {
    const almost = ALL_STALLS.slice(0, TOTAL_STALLS - 1);
    expect(bazaarOpen(almost)).toBe(false);
    expect(progressSummary({...defaultProfile(), stalls: almost}).bazaarOpen).toBe(false);
  });

  it('lights every lantern when all nine missions are won', () => {
    const summary = progressSummary({...defaultProfile(), stalls: ALL_STALLS});
    expect(bazaarOpen(ALL_STALLS)).toBe(true);
    expect(summary.bazaarOpen).toBe(true);
    expect(summary.lanternsLit).toBe(TOTAL_STALLS);
    summary.rows.forEach(row => expect(row.won).toBe(row.total));
  });
});

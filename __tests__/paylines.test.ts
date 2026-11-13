import {evaluateSpin, LINES, winningCells} from '../src/game/paylines';
import {LINE_BET} from '../src/constants/config';
import {ALL_CHILI, gridOf, NO_WIN} from './helpers';

describe('pay lines', () => {
  it('has exactly three lines, all passing through the centre cell', () => {
    expect(LINES).toHaveLength(3);
    LINES.forEach(line => expect(line.rows[1]).toBe(1));
  });

  it('pays every line when the whole board is one symbol', () => {
    const win = evaluateSpin(gridOf(ALL_CHILI), LINE_BET, 1);
    expect(win.lines).toHaveLength(3);
    expect(win.amount).toBe(3 * LINE_BET * 3);
  });

  it('pays nothing on a scattered board', () => {
    const win = evaluateSpin(gridOf(NO_WIN), LINE_BET, 1);
    expect(win.amount).toBe(0);
    expect(win.lines).toHaveLength(0);
  });

  it('substitutes LANTERN for any symbol on a line', () => {
    const win = evaluateSpin(
      gridOf([
        ['chili', 'pot', 'scale'],
        ['basket', 'lantern', 'basket'],
        ['pot', 'basket', 'scale'],
      ]),
      LINE_BET,
      1,
    );
    expect(win.lines).toHaveLength(1);
    expect(win.lines[0].symbolKey).toBe('basket');
    expect(win.amount).toBe(6 * LINE_BET);
  });

  it('pays a full line of wilds at the top symbol rate', () => {
    const win = evaluateSpin(
      gridOf([
        ['chili', 'pot', 'scale'],
        ['lantern', 'lantern', 'lantern'],
        ['pot', 'basket', 'basket'],
      ]),
      LINE_BET,
      1,
    );
    expect(win.lines[0].payout).toBe(30);
  });

  it('applies the multiplier to the amount', () => {
    const base = evaluateSpin(gridOf(ALL_CHILI), LINE_BET, 1).amount;
    const boosted = evaluateSpin(gridOf(ALL_CHILI), LINE_BET, 2).amount;
    expect(boosted).toBe(base * 2);
  });

  it('flags only the cells on a winning line', () => {
    const win = evaluateSpin(
      gridOf([
        ['chili', 'pot', 'scale'],
        ['basket', 'basket', 'basket'],
        ['pot', 'scale', 'chili'],
      ]),
      LINE_BET,
      1,
    );
    const flags = winningCells(win.lines);
    expect(flags[1]).toEqual([true, true, true]);
    expect(flags[0]).toEqual([false, false, false]);
  });
});

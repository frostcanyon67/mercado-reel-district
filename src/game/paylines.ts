/**
 * Three pay lines on a 3x3 board. LANTERN is wild and substitutes for anything.
 * winAmount = LINE_BET * symbol.payout * multiplier, summed over winning lines.
 */
import {isWild, SymbolDef, SymbolKey, TOP_SYMBOL} from './symbols';

/** grid[row][col], 3 rows x 3 reels. */
export type Grid = SymbolDef[][];

export type PayLine = {
  id: number;
  name: string;
  /** row index for column 0, 1, 2 */
  rows: readonly [number, number, number];
};

export const LINES: readonly PayLine[] = [
  {id: 0, name: 'CENTRE ROW', rows: [1, 1, 1]},
  {id: 1, name: 'TOP TO BOTTOM', rows: [0, 1, 2]},
  {id: 2, name: 'BOTTOM TO TOP', rows: [2, 1, 0]},
];

export type WinLine = {
  lineId: number;
  rows: readonly [number, number, number];
  symbolKey: SymbolKey;
  payout: number;
  amount: number;
};

export type SpinWin = {
  amount: number;
  lines: WinLine[];
  bestPayout: number;
};

export function cellsOfLine(grid: Grid, line: PayLine): SymbolDef[] {
  return [grid[line.rows[0]][0], grid[line.rows[1]][1], grid[line.rows[2]][2]];
}

export function evaluateLine(
  grid: Grid,
  line: PayLine,
  lineBet: number,
  multiplier: number,
): WinLine | null {
  const cells = cellsOfLine(grid, line);
  const base = cells.find(c => !isWild(c)) ?? TOP_SYMBOL;
  const matches = cells.every(c => isWild(c) || c.key === base.key);
  if (!matches) {
    return null;
  }
  const amount = Math.round(lineBet * base.payout * multiplier);
  return {
    lineId: line.id,
    rows: line.rows,
    symbolKey: base.key,
    payout: base.payout,
    amount,
  };
}

export function evaluateSpin(grid: Grid, lineBet: number, multiplier: number): SpinWin {
  const lines: WinLine[] = [];
  for (let i = 0; i < LINES.length; i++) {
    const hit = evaluateLine(grid, LINES[i], lineBet, multiplier);
    if (hit !== null) {
      lines.push(hit);
    }
  }
  const amount = lines.reduce((sum, l) => sum + l.amount, 0);
  const bestPayout = lines.reduce((best, l) => (l.amount > best ? l.amount : best), 0);
  return {amount, lines, bestPayout};
}

/** Cells (row, col) that belong to a winning line - used by the flash animation. */
export function winningCells(lines: WinLine[]): boolean[][] {
  const flags: boolean[][] = [
    [false, false, false],
    [false, false, false],
    [false, false, false],
  ];
  lines.forEach(l => {
    for (let c = 0; c < 3; c++) {
      flags[l.rows[c]][c] = true;
    }
  });
  return flags;
}

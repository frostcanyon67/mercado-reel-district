import {Grid} from '../src/game/paylines';
import {symbolByKey, SymbolKey} from '../src/game/symbols';

/** Build a 3x3 grid from nine symbol keys, row by row. */
export function gridOf(keys: SymbolKey[][]): Grid {
  return keys.map(row => row.map(key => symbolByKey(key)));
}

export const ALL_CHILI: SymbolKey[][] = [
  ['chili', 'chili', 'chili'],
  ['chili', 'chili', 'chili'],
  ['chili', 'chili', 'chili'],
];

/** No line wins: not the centre row, not either diagonal, and no wilds. */
export const NO_WIN: SymbolKey[][] = [
  ['chili', 'basket', 'scale'],
  ['basket', 'pot', 'chili'],
  ['pot', 'chili', 'basket'],
];

/**
 * THE one and only symbol pool of the app.
 * Reels, pay table, mission themes and the collection all read this array.
 * Pure data - no image require() here, so the logic stays unit testable.
 */
export type SymbolKey = 'chili' | 'basket' | 'pot' | 'scale' | 'lantern';

export type SymbolDef = {
  key: SymbolKey;
  name: string;
  spriteKey: 'sprite_1' | 'sprite_2' | 'sprite_3' | 'sprite_4' | 'sprite_5';
  payout: number; // per line, multiplied by LINE_BET
  weight: number;
  isWild?: boolean;
};

export const SYMBOLS: readonly SymbolDef[] = [
  {key: 'chili', name: 'CHILI', spriteKey: 'sprite_1', payout: 3, weight: 26},
  {key: 'basket', name: 'BASKET', spriteKey: 'sprite_2', payout: 6, weight: 22},
  {key: 'pot', name: 'CLAY POT', spriteKey: 'sprite_3', payout: 10, weight: 16},
  {key: 'scale', name: 'BRASS SCALE', spriteKey: 'sprite_4', payout: 30, weight: 8},
  {key: 'lantern', name: 'LANTERN', spriteKey: 'sprite_5', payout: 30, weight: 6, isWild: true},
];

export const WILD: SymbolDef = SYMBOLS[4];
export const TOP_SYMBOL: SymbolDef = SYMBOLS[3];

const BY_KEY: Record<SymbolKey, SymbolDef> = SYMBOLS.reduce((acc, s) => {
  acc[s.key] = s;
  return acc;
}, {} as Record<SymbolKey, SymbolDef>);

export function symbolByKey(key: SymbolKey): SymbolDef {
  return BY_KEY[key];
}

export function isWild(s: SymbolDef): boolean {
  return s.isWild === true;
}

export function totalWeight(wildBoost: number = 1): number {
  return SYMBOLS.reduce((sum, s) => sum + s.weight * (s.isWild ? wildBoost : 1), 0);
}

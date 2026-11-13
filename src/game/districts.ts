/**
 * Three trade rows of the night bazaar, three market stalls each.
 */
import {SymbolKey} from './symbols';

export type District = {
  index: number;
  id: string;
  name: string;
  themeKey: SymbolKey;
  unlockHint: string;
  stalls: {id: string; name: string}[];
};

export const DISTRICTS: readonly District[] = [
  {
    index: 0,
    id: 'spice',
    name: 'SPICE ROW',
    themeKey: 'chili',
    unlockHint: 'OPEN FROM THE START',
    stalls: [
      {id: 'spice-0', name: 'SAFFRON STAND'},
      {id: 'spice-1', name: 'PEPPER CART'},
      {id: 'spice-2', name: 'CHILI AWNING'},
    ],
  },
  {
    index: 1,
    id: 'clay',
    name: 'CLAY ROW',
    themeKey: 'pot',
    unlockHint: 'FINISH SPICE ROW TO OPEN',
    stalls: [
      {id: 'clay-0', name: 'KILN CORNER'},
      {id: 'clay-1', name: 'GLAZE TABLE'},
      {id: 'clay-2', name: 'WATER JAR STALL'},
    ],
  },
  {
    index: 2,
    id: 'brass',
    name: 'BRASS ROW',
    themeKey: 'scale',
    unlockHint: 'FINISH CLAY ROW TO OPEN',
    stalls: [
      {id: 'brass-0', name: 'SCALE HOUSE'},
      {id: 'brass-1', name: 'BELL SMITH'},
      {id: 'brass-2', name: 'LAMP TRADER'},
    ],
  },
];

export const TOTAL_STALLS = 9;

export function districtAt(index: number): District {
  return DISTRICTS[Math.max(0, Math.min(DISTRICTS.length - 1, index))];
}

export function stallsWonInDistrict(districtIndex: number, stalls: string[]): number {
  const prefix = DISTRICTS[districtIndex].id + '-';
  return stalls.filter(s => s.indexOf(prefix) === 0).length;
}

/** A district opens when every stall of the previous one is collected. */
export function isDistrictUnlocked(districtIndex: number, stalls: string[]): boolean {
  if (districtIndex <= 0) {
    return true;
  }
  return stallsWonInDistrict(districtIndex - 1, stalls) >= 3;
}

/** All three stalls collected -> permanent +15% on that district's theme symbol. */
export function hasSetBonus(districtIndex: number, stalls: string[]): boolean {
  return stallsWonInDistrict(districtIndex, stalls) >= 3;
}

export function activeSetThemes(stalls: string[]): SymbolKey[] {
  return DISTRICTS.filter(d => hasSetBonus(d.index, stalls)).map(d => d.themeKey);
}

export function bazaarOpen(stalls: string[]): boolean {
  return stalls.length >= TOTAL_STALLS;
}

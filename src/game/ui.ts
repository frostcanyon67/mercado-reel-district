/**
 * Pure view-model helpers. The screens read these instead of deriving
 * layout decisions inline, so every rule below is unit testable.
 */
import {BET_AMOUNT} from '../constants/config';
import {DISTRICTS, hasSetBonus, stallsWonInDistrict, TOTAL_STALLS} from './districts';
import {Profile} from './storage';
import {SymbolKey} from './symbols';

export type StatItemLike = {value: string | number};

/** A pill with nothing to show renders null; a row needs at least two. */
export function isEmptyStat(value: string | number | undefined): boolean {
  return value === 0 || value === '0' || value === '' || value === undefined;
}

export function visibleStats<T extends StatItemLike>(items: T[]): T[] {
  return items.filter(item => !isEmptyStat(item.value));
}

export function shouldRenderStatRow<T extends StatItemLike>(items: T[]): boolean {
  return visibleStats(items).length >= 2;
}

/** SPIN is disabled while a spin runs and whenever the stake is unaffordable. */
export function isSpinDisabled(status: string, balance: number, bet: number = BET_AMOUNT): boolean {
  return status !== 'idle' || balance < bet;
}

export type CollectionCell = {
  id: string;
  name: string;
  themeKey: SymbolKey;
  unlocked: boolean;
  coins: number;
};

export type CollectionSection = {
  id: string;
  name: string;
  setComplete: boolean;
  cells: CollectionCell[];
};

export function collectionSections(profile: Profile): CollectionSection[] {
  return DISTRICTS.map(district => ({
    id: district.id,
    name: district.name,
    setComplete: hasSetBonus(district.index, profile.stalls),
    cells: district.stalls.map(stall => ({
      id: stall.id,
      name: stall.name,
      themeKey: district.themeKey,
      unlocked: profile.stalls.indexOf(stall.id) >= 0,
      coins: profile.stallCoins[stall.id] ?? 0,
    })),
  }));
}

export function collectionIsEmpty(profile: Profile): boolean {
  return profile.stalls.length === 0;
}

export type ProgressSummary = {
  lanternsLit: number;
  bazaarOpen: boolean;
  rows: {id: string; name: string; won: number; total: number; bonus: boolean}[];
  stats: {key: string; value: number; label: string}[];
};

export function progressSummary(profile: Profile): ProgressSummary {
  return {
    lanternsLit: profile.stalls.length,
    bazaarOpen: profile.stalls.length >= TOTAL_STALLS,
    rows: DISTRICTS.map(district => ({
      id: district.id,
      name: district.name,
      won: stallsWonInDistrict(district.index, profile.stalls),
      total: 3,
      bonus: hasSetBonus(district.index, profile.stalls),
    })),
    stats: [
      {key: 'spins', value: profile.stats.totalSpins, label: 'TOTAL SPINS'},
      {key: 'best', value: profile.stats.bestWin, label: 'BEST WIN'},
      {key: 'missions', value: profile.stats.missionsWon, label: 'MISSIONS WON'},
      {key: 'line', value: profile.stats.biggestLine, label: 'BIGGEST LINE'},
    ],
  };
}

/** Every interactive target in this app is at least this tall. */
export const MIN_TOUCH_SIZE = 48;
export const PRESS_SCALE = 0.94;

export function isTouchTargetValid(size: {width: number; height: number}): boolean {
  return size.width >= MIN_TOUCH_SIZE && size.height >= MIN_TOUCH_SIZE;
}

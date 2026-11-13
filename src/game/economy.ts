/**
 * Fictional coin economy. There is no deposit, withdrawal, purchase,
 * ad reward or cash prize path anywhere in this module - by design.
 */
import {
  BET_AMOUNT,
  BIG_WIN_THRESHOLD,
  CLOSING_BELL_MULT,
  HAGGLE_COST,
  RESET_GRANT,
  SET_BONUS,
} from '../constants/config';
import {SymbolKey} from './symbols';

export function canSpin(balance: number): boolean {
  return balance >= BET_AMOUNT;
}

export function canHaggle(balance: number, haggleUsed: boolean, lastTokens: number): boolean {
  return !haggleUsed && lastTokens === 0 && balance >= HAGGLE_COST;
}

export function payBet(balance: number): number {
  return Math.max(0, balance - BET_AMOUNT);
}

export function payHaggle(balance: number): number {
  return Math.max(0, balance - HAGGLE_COST);
}

export function collect(balance: number, amount: number): number {
  return balance + Math.max(0, Math.round(amount));
}

export function softReset(balance: number): number {
  return balance + RESET_GRANT;
}

/** Set bonus applies to the district theme; the Closing Bell Rush doubles the spin. */
export function winMultiplier(opts: {
  themeKey: SymbolKey;
  setThemes: SymbolKey[];
  closingBell: boolean;
}): number {
  const set = opts.setThemes.indexOf(opts.themeKey) >= 0 ? SET_BONUS : 1;
  const bell = opts.closingBell ? CLOSING_BELL_MULT : 1;
  return set * bell;
}

export function isBigWin(amount: number): boolean {
  return amount >= BIG_WIN_THRESHOLD;
}

/** 1,000 - grouped integers, no currency symbol, no real-money wording. */
export function formatCoins(value: number): string {
  const safe = Number.isFinite(value) ? Math.round(value) : 0;
  return safe.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

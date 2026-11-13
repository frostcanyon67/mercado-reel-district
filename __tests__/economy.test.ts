import {
  BET_AMOUNT,
  BIG_WIN_THRESHOLD,
  HAGGLE_COST,
  LINE_BET,
  PAY_LINES,
  RESET_GRANT,
  STARTING_BALANCE,
} from '../src/constants/config';
import {
  canSpin,
  collect,
  formatCoins,
  isBigWin,
  payBet,
  payHaggle,
  softReset,
} from '../src/game/economy';

describe('fictional coin economy', () => {
  it('stakes a fixed bet across the three pay lines', () => {
    expect(BET_AMOUNT).toBe(15);
    expect(PAY_LINES).toBe(3);
    expect(LINE_BET).toBe(5);
  });

  it('moves the balance only through the bet, wins, the haggle fee and the grant', () => {
    expect(payBet(STARTING_BALANCE)).toBe(STARTING_BALANCE - BET_AMOUNT);
    expect(collect(100, 90)).toBe(190);
    expect(payHaggle(100)).toBe(100 - HAGGLE_COST);
    expect(softReset(0)).toBe(RESET_GRANT);
  });

  it('never drives the balance below zero', () => {
    expect(payBet(5)).toBe(0);
    expect(payHaggle(3)).toBe(0);
  });

  it('blocks a spin that cannot be paid for and always offers a way back', () => {
    expect(canSpin(BET_AMOUNT)).toBe(true);
    expect(canSpin(BET_AMOUNT - 1)).toBe(false);
    expect(canSpin(softReset(BET_AMOUNT - 1))).toBe(true);
  });

  it('flags a big win at fifteen times the bet', () => {
    expect(BIG_WIN_THRESHOLD).toBe(225);
    expect(isBigWin(224)).toBe(false);
    expect(isBigWin(225)).toBe(true);
  });

  it('formats coins as grouped integers with no currency symbol', () => {
    expect(formatCoins(1000)).toBe('1,000');
    expect(formatCoins(90)).toBe('90');
    expect(formatCoins(1234567)).toBe('1,234,567');
    expect(formatCoins(Number.NaN)).toBe('0');
  });
});

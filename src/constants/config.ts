/**
 * MercadoReelDistrict - all gameplay tunables live here.
 * Pure constants only: no imports, no work at module load (rule 12.2).
 */

// Loader holds for exactly 8000 ms, timer driven, no tap-to-skip.
export const LOADER_DURATION_MS = 8000;
export const LOADER_BAR_MS = 7600;

// Economy (fictional coins only - no real money anywhere in this app).
export const STARTING_BALANCE = 1000;
export const BET_AMOUNT = 15;
export const PAY_LINES = 3;
export const LINE_BET = BET_AMOUNT / PAY_LINES; // 5
export const HAGGLE_COST = 10;
export const RESET_GRANT = 500;
export const BIG_WIN_MULTIPLIER = 15;
export const BIG_WIN_THRESHOLD = BET_AMOUNT * BIG_WIN_MULTIPLIER; // 225

// Board geometry.
export const REELS = 3;
export const ROWS = 3;
export const REEL_GAP = 8;
export const BOARD_PAD = 10;
export const BOARD_BORDER = 2;
export const BOARD_FRAME = BOARD_PAD + BOARD_BORDER; // 12
export const BOARD_MAX_WIDTH = 380;

// Reel strip: visual length only. The spin outcome is drawn from the weights,
// then written into the strip so the picture always matches the payout.
export const STRIP_LEN = 12;
export const STRIP_COPIES = 3;
export const LANDING_MIN = 4;
export const LANDING_MAX = STRIP_LEN - 4; // inclusive bound used by the RNG

// Spin timing.
export const STOP_DELAYS_MS = [800, 1150, 1500];
export const SPEED_MULTIPLIER = {relaxed: 1.3, standard: 1.0, fast: 0.7};
export const EVALUATE_BEAT_MS = 180;
export const WIN_FLASH_MS = 320;
export const BIG_WIN_HOLD_MS = 1200;
export const RESULT_DELAY_MS = 600;

// Added mechanics.
export const LANTERN_METER_MAX = 5;
export const PITY_AFTER_LOSSES = 5;
export const PITY_WILD_BOOST = 1.4;
export const SET_BONUS = 1.15;
export const CLOSING_BELL_MULT = 2;
export const BIG_WIN_COOLDOWN_SPINS = 2;

export const TARGET_HIT_RATE: [number, number] = [0.28, 0.42];
export const STORAGE_KEY = 'mercado_reel_district_profile_v1';

export type ReelSpeed = 'relaxed' | 'standard' | 'fast';

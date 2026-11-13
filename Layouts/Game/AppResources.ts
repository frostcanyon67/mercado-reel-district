/* @app-slot:game */


// ------ config ------


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

// ------ theme ------
export const theme = {
  name: 'CASINO_GOLD',
  colors: {
    bg: '#0B0B0F',
    surface: '#141418',
    surfaceAlt: '#1C1C24',
    surfaceWood: '#1E1A14',
    primary: '#D4AF37',
    primaryLight: '#F5D77A',
    primaryDark: '#A67C00',
    accent: '#C65A2E',
    success: '#4FA07A',
    textPrimary: '#F4EFE3',
    textSecondary: '#A89C84',
    textMuted: '#6B6253',
    onGold: '#120E08',
    line: 'rgba(255,255,255,0.08)',
    lineGold: 'rgba(212,175,55,0.28)',
    lineGoldSoft: 'rgba(212,175,55,0.16)',
    woodFill: 'rgba(30,26,20,0.90)',
    glass: 'rgba(255,255,255,0.05)',
    glassLine: 'rgba(255,255,255,0.09)',
    veil: 'rgba(0,0,0,0.35)',
    bevelTop: 'rgba(255,255,255,0.06)',
    bevelBottom: 'rgba(0,0,0,0.45)',
  },
  // Every screen shares one background image and is told apart by its overlay.
  overlays: {
    loader: ['rgba(11,11,15,0.97)', 'rgba(30,26,20,0.93)', 'rgba(11,11,15,0.99)'],
    menu: ['rgba(11,11,15,0.25)', 'rgba(11,11,15,0.55)', 'rgba(20,20,24,0.95)'],
    levels: ['rgba(11,11,15,0.88)', 'rgba(28,28,36,0.95)'],
    game: ['rgba(11,11,15,0.78)', 'rgba(16,14,18,0.90)'],
    resultWon: ['rgba(30,26,20,0.80)', 'rgba(11,11,15,0.95)'],
    resultLost: ['rgba(14,12,16,0.92)', 'rgba(11,11,15,0.97)'],
    collection: ['rgba(11,11,15,0.90)', 'rgba(30,26,20,0.94)'],
    progress: ['rgba(11,11,15,0.86)', 'rgba(16,14,20,0.96)'],
    settings: ['rgba(11,11,15,0.93)', 'rgba(20,20,24,0.97)'],
  },
  gradients: {
    gold: ['#F5D77A', '#D4AF37', '#C65A2E'],
    cta: ['rgba(212,175,55,0.95)', 'rgba(198,90,46,0.95)'],
    bar: ['#C65A2E', '#D4AF37', '#F5D77A'],
  },
  radius: {sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, pill: 100},
  spacing: {xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32},
  header: {height: 72, paddingTop: 44},
  shadow: {
    gold: {
      shadowColor: '#D4AF37',
      shadowOffset: {width: 0, height: 6},
      shadowOpacity: 0.45,
      shadowRadius: 18,
      elevation: 12,
    },
    card: {
      shadowColor: '#000000',
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: 0.55,
      shadowRadius: 20,
      elevation: 10,
    },
  },
} as const;

export const C = theme.colors;
export const OVERLAYS = theme.overlays;

/* autopad-begin */
function gowabekikup(_vanupejamuno: boolean, _lonulaf: number, _fejawen: number): string { return "eyok"; }
function kopofu(): string {
  return "xuponi";
}
function usepoga(_oxipapayateq: string, _foginuludipe: string, _olibavuzuxo: number): number {
  const ovegosaxe = 68;
  const avuvig: number = 249;
  return avuvig;
}
function mojadejabi(): boolean {
  const kowayowuzelu = 18;
  const gozokosomol: boolean = true;
  return gozokosomol;
}
function uxosar(_gatobezin: number): boolean {
  let ijobuzo: boolean = true;
  ijobuzo = true;
  return ijobuzo;
}
function qanitopiwu(): number {
  const ozicayoraq = 51;
  return ozicayoraq > 10 ? 48 : 105;
}
/* autopad-end */

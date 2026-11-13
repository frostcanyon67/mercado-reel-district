/**
 * CASINO_GOLD preset (canonical name), secondary accent overridden to lantern ember.
 * Market skeuomorphism: oiled wood, woven cane, brass, lantern light.
 */
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

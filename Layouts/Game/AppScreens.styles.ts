/* @app-slot:game */
import { StyleSheet } from 'react-native';
import { C } from './AppResources';

// ------ CollectionScreen ------
export const styles_CollectionScreen = StyleSheet.create({
  root: {flex: 1},
  count: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 1,
    color: C.primary,
    fontVariant: ['tabular-nums'],
  },
  list: {flex: 1},
  listContent: {paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12, gap: 14},
  section: {},
  ribbon: {
    marginBottom: 6,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '800',
    letterSpacing: 1,
    color: C.success,
  },
  sectionTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 2,
    color: C.textSecondary,
  },
  grid: {flexDirection: 'row', gap: 10, marginTop: 8},
  slot: {flex: 1},
  footer: {paddingHorizontal: 16, paddingBottom: 24, paddingTop: 4},
});

// ------ GameScreen ------
export const styles_GameScreen = StyleSheet.create({
  root: {flex: 1},
  headerCenter: {alignItems: 'center', justifyContent: 'center'},
  balance: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '800',
    color: C.primaryLight,
    fontVariant: ['tabular-nums'],
  },
  lastWin: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: C.accent,
    fontVariant: ['tabular-nums'],
  },
  tokenBadge: {flexDirection: 'row', alignItems: 'center', gap: 6},
  tokenText: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '800',
    color: C.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  missionWrap: {paddingHorizontal: 16, paddingTop: 10},
  board: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  strip: {
    height: 64,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(20,20,24,0.72)',
  },
  stripCell: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  divider: {width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.07)'},
  stripValue: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    letterSpacing: 1,
    color: C.primaryLight,
    fontVariant: ['tabular-nums'],
  },
  stripBonus: {fontSize: 12, lineHeight: 16, fontWeight: '800', letterSpacing: 1, color: C.success},
  stripLabel: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '800',
    letterSpacing: 1,
    color: C.textSecondary,
  },
  action: {
    marginTop: 10,
    paddingTop: 16,
    paddingBottom: 28,
    paddingHorizontal: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212,175,55,0.22)',
    backgroundColor: 'rgba(20,20,24,0.96)',
  },
  weave: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 4,
    height: 1,
    backgroundColor: 'rgba(212,175,55,0.12)',
  },
  actionRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10},
  sideSlot: {flex: 1},
  // The hint sits ABOVE the action row: below it, the SPIN button shadow covers it.
  hint: {
    marginBottom: 12,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    letterSpacing: 1,
    color: C.textMuted,
    textAlign: 'center',
  },
});

// ------ LevelSelectScreen ------
export const styles_LevelSelectScreen = StyleSheet.create({
  root: {flex: 1},
  list: {flex: 1},
  listContent: {paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, gap: 12},
  panel: {padding: 14},
  panelHead: {flexDirection: 'row', alignItems: 'center', gap: 10},
  themeArt: {width: 28, height: 28},
  districtName: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: C.textPrimary,
  },
  counter: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
    color: C.primary,
    fontVariant: ['tabular-nums'],
  },
  lockRow: {alignItems: 'center', justifyContent: 'center'},
  unlockHint: {
    marginTop: 6,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 1,
    color: C.textMuted,
  },
  chips: {flexDirection: 'row', gap: 8, marginTop: 12},
  footer: {paddingHorizontal: 16, paddingBottom: 24, paddingTop: 4},
});

// ------ LoaderScreen ------
export const styles_LoaderScreen = StyleSheet.create({
  root: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24},
  rule: {
    position: 'absolute',
    left: 40,
    right: 40,
    top: '62%',
    height: 1,
    backgroundColor: 'rgba(212,175,55,0.22)',
  },
  plaque: {
    width: 176,
    height: 176,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: C.primary,
    backgroundColor: 'rgba(30,26,20,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  logo: {width: 128, height: 128},
  title: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '900',
    letterSpacing: 3,
    color: C.primaryLight,
    textAlign: 'center',
    textShadowColor: 'rgba(212,175,55,0.5)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 12,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 5,
    color: C.textSecondary,
    textAlign: 'center',
  },
  barBlock: {marginTop: 44, alignItems: 'center'},
  track: {
    width: 180,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  fillWrap: {height: 6, borderRadius: 3, overflow: 'hidden'},
  fill: {flex: 1},
  caption: {
    marginTop: 12,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    letterSpacing: 3,
    color: C.textMuted,
  },
});

// ------ MenuScreen ------
export const styles_MenuScreen = StyleSheet.create({
  root: {flex: 1},
  hero: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  logo: {width: 136, height: 136},
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: 'rgba(20,20,24,0.96)',
    borderTopWidth: 2,
    borderTopColor: C.primary,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: -8},
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 18,
  },
  weave: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 4,
    height: 1,
    backgroundColor: 'rgba(212,175,55,0.12)',
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignSelf: 'center',
  },
  title: {
    marginTop: 12,
    fontSize: 23,
    lineHeight: 27,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: C.textPrimary,
    textAlign: 'center',
  },
  tagline: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    letterSpacing: 3,
    color: C.textSecondary,
    textAlign: 'center',
  },
  missionCard: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.30)',
    backgroundColor: 'rgba(30,26,20,0.90)',
  },
  missionTile: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(212,175,55,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionArt: {width: 30, height: 30},
  missionTexts: {flex: 1},
  missionName: {fontSize: 14, lineHeight: 18, fontWeight: '800', color: C.textPrimary},
  missionGoal: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: C.textSecondary,
  },
  statWrap: {marginTop: 12},
  hint: {
    marginTop: 14,
    marginBottom: 8,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: C.textMuted,
    textAlign: 'center',
  },
  nav: {flexDirection: 'row', gap: 8, marginTop: 12},
});

// ------ ProgressScreen ------
export const styles_ProgressScreen = StyleSheet.create({
  root: {flex: 1},
  body: {flex: 1},
  bodyContent: {paddingHorizontal: 16, paddingBottom: 12},
  rows: {marginTop: 8, gap: 10},
  statBlock: {marginTop: 14},
  statGap: {height: 10},
  footer: {paddingHorizontal: 16, paddingBottom: 24, paddingTop: 4},
});

// ------ ResultScreen ------
export const styles_ResultScreen = StyleSheet.create({
  root: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24},
  card: {width: '100%', padding: 22, alignItems: 'center'},
  title: {fontSize: 27, lineHeight: 32, fontWeight: '900', letterSpacing: 2, textAlign: 'center'},
  sub: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: C.textSecondary,
    textAlign: 'center',
  },
  plaqueWrap: {marginTop: 18, alignItems: 'center', justifyContent: 'center'},
  ring: {
    position: 'absolute',
    top: 0,
    width: 96,
    height: 96,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: C.primary,
  },
  plaque: {
    width: 96,
    height: 96,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.lineGold,
    backgroundColor: 'rgba(30,26,20,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plaqueArt: {width: 64, height: 64},
  stallName: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: C.primaryLight,
  },
  grant: {
    marginTop: 14,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 1,
    color: C.accent,
    textAlign: 'center',
  },
  stats: {marginTop: 18, width: '100%'},
  cta: {marginTop: 20, width: '100%'},
  row: {flexDirection: 'row', gap: 10, marginTop: 10, width: '100%'},
  slot: {flex: 1},
});

// ------ SettingsScreen ------
export const styles_SettingsScreen = StyleSheet.create({
  root: {flex: 1},
  body: {flex: 1},
  bodyContent: {paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12, gap: 10},
  resetWrap: {marginTop: 4},
  fairPlay: {padding: 14, marginTop: 4},
  fairTitle: {fontSize: 11, lineHeight: 15, fontWeight: '800', letterSpacing: 2, color: C.primary},
  fairBody: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
    color: C.textSecondary,
  },
  footer: {paddingHorizontal: 16, paddingBottom: 24, paddingTop: 4},
});

/* autopad-begin */
function xorerumal(_ugiyuka: boolean): string {
  return "layuna";
}
function fiquqil(_qeyusiw: string, _mufaras: boolean, _tepituze: number): boolean {
  return false;
}
function afevapit(_ofelosidal: boolean, _ukupiwenigat: number): void {
  const pajureqez = 73;
  if (pajureqez > 50) return;
}
function uqodudegoga(_dadowoyuv: boolean, _fusoleroz: number): boolean { return false; }
function ivogeyebido(_motoxu: number): string {
  let pojiso: string = "ako";
  pojiso = "eyicu";
  return pojiso;
}
function voboneguli(_jidega: number, _iwelele: number, _vibeforuzon: number): string { return "ciw"; }
function ozogof(_cayejuxaf: boolean): number { return 155; }
function gufejef(_icudic: boolean, _emavuralez: string, _qawipoyurejo: string): string {
  let wituyiget: string = "esekix";
  wituyiget = "xuxadoga";
  return wituyiget;
}
function jaxazefovu(): number {
  const ozumok: number = 31;
  return ozumok;
}
function mimuwoy(): boolean {
  const gikogemuyuk = 25;
  return gikogemuyuk > 61 ? true : false;
}
function piginofiye(_gageleciqic: number, _lalibev: boolean, _cisexacapal: boolean): string {
  const tegocep = 1;
  const gecibogemoyi: string = "mawi";
  return gecibogemoyi;
}
function axiyeboq(_yisupejitu: boolean, _jesetubenete: boolean): number {
  const esibelolapic: number = 20;
  return esibelolapic;
}
/* autopad-end */

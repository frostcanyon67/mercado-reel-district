/* @app-slot:game */
import { StyleSheet } from 'react-native';
import { BOARD_BORDER, C, REEL_GAP, theme} from './AppResources';

// ------ AppShell ------
export const styles_AppShell = StyleSheet.create({
  root: {flex: 1, backgroundColor: C.bg},
  content: {flex: 1},
});

// ------ BalancePill ------
export const styles_BalancePill = StyleSheet.create({
  pill: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(30,26,20,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.45)',
  },
  compact: {height: 36, paddingHorizontal: 11},
  value: {
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '800',
    color: C.primaryLight,
    fontVariant: ['tabular-nums'],
  },
});

// ------ BazaarPanorama ------
export const styles_BazaarPanorama = StyleSheet.create({
  wrap: {alignItems: 'center', justifyContent: 'center'},
  caption: {
    marginTop: -24,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800',
    letterSpacing: 3,
    color: C.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  captionOpen: {color: C.primaryLight},
});

// ------ BigWinBanner ------
export const styles_BigWinBanner = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(11,11,15,0.86)',
    borderWidth: 2,
    borderColor: C.primary,
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '900',
    letterSpacing: 4,
    color: C.primaryLight,
  },
  amount: {
    marginTop: 4,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: 2,
    color: C.primary,
    fontVariant: ['tabular-nums'],
  },
});

// ------ ConfirmCard ------
export const styles_ConfirmCard = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,11,15,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 30,
  },
  card: {width: '100%', padding: 20},
  title: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '900',
    letterSpacing: 2,
    color: C.primaryLight,
    textAlign: 'center',
  },
  body: {
    marginTop: 8,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
    color: C.textSecondary,
    textAlign: 'center',
  },
  row: {flexDirection: 'row', gap: 10, marginTop: 18},
  slot: {flex: 1},
});

// ------ EmptyNote ------
export const styles_EmptyNote = StyleSheet.create({
  wrap: {alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 16},
  text: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: C.textMuted,
    textAlign: 'center',
  },
});

// ------ LanternDecor ------
export const styles_LanternDecor = StyleSheet.create({
  dot: {position: 'absolute'},
});

// ------ LanternMeter ------
export const styles_LanternMeter = StyleSheet.create({
  wrap: {alignItems: 'center', justifyContent: 'center'},
  head: {flexDirection: 'row', alignItems: 'center', gap: 6},
  mark: {width: 18, height: 18},
  label: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1,
    color: C.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  labelFull: {color: C.primaryLight},
  dots: {flexDirection: 'row', gap: 5, marginTop: 5},
  dot: {width: 8, height: 8, borderRadius: 4},
  dotOn: {backgroundColor: C.primary},
  dotOff: {backgroundColor: 'rgba(255,255,255,0.14)'},
});

// ------ MissionBar ------
export const styles_MissionBar = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(30,26,20,0.92)',
    borderWidth: 1,
    borderColor: C.lineGold,
  },
  barBell: {borderColor: 'rgba(198,90,46,0.65)'},
  theme: {width: 28, height: 28},
  middle: {flex: 1},
  name: {fontSize: 13, fontWeight: '800', letterSpacing: 1.5, color: C.textPrimary},
  tokenRow: {flexDirection: 'row', alignItems: 'center', marginTop: 2},
  tokens: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: C.primaryLight,
    fontVariant: ['tabular-nums'],
  },
  track: {
    marginTop: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  fill: {height: 5, borderRadius: 3, backgroundColor: C.primary},
  right: {alignItems: 'flex-end', minWidth: 86},
  spins: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: C.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  spinsBell: {color: C.accent},
  bell: {fontSize: 8, fontWeight: '800', letterSpacing: 1, color: C.accent, marginTop: 2},
});

// ------ MissionChip ------
export const styles_MissionChip = StyleSheet.create({
  press: {flex: 1, height: 64},
  chip: {
    width: '100%',
    height: 64,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: C.glassLine,
  },
  open: {borderColor: C.primary, backgroundColor: 'rgba(212,175,55,0.10)'},
  done: {borderColor: 'rgba(79,160,122,0.6)', backgroundColor: 'rgba(212,175,55,0.18)'},
  locked: {opacity: 0.45},
  top: {flexDirection: 'row', alignItems: 'center', gap: 6},
  index: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '900',
    color: C.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  goal: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '800',
    letterSpacing: 1,
    color: C.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  mutedText: {color: C.textMuted},
});

// ------ NavTile ------
export const styles_NavTile = StyleSheet.create({
  press: {flex: 1, height: 58},
  tile: {
    width: '100%',
    height: 58,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.glassLine,
    backgroundColor: C.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {height: 22, alignItems: 'center', justifyContent: 'center'},
  label: {
    marginTop: 4,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '800',
    letterSpacing: 1,
    color: C.textSecondary,
  },
});

// ------ PayLineOverlay ------
export const styles_PayLineOverlay = StyleSheet.create({
  layer: {position: 'absolute', left: 0, top: 0},
});

// ------ PayTableOverlay ------
export const styles_PayTableOverlay = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,11,15,0.93)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    zIndex: 20,
  },
  card: {width: '100%', padding: 18},
  title: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '900',
    letterSpacing: 2,
    color: C.primaryLight,
    textAlign: 'center',
  },
  block: {
    marginTop: 12,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 2,
    color: C.primary,
  },
  body: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
    color: C.textSecondary,
  },
  symbols: {marginTop: 6, gap: 4},
  symbolRow: {flexDirection: 'row', alignItems: 'center', gap: 10},
  symbolArt: {width: 26, height: 26},
  symbolName: {
    flex: 1,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1,
    color: C.textPrimary,
  },
  symbolPay: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    color: C.primary,
    fontVariant: ['tabular-nums'],
  },
  footer: {marginTop: 16},
});

// ------ PrimaryButton ------
const ICON_SIZE = 24;
export const styles_PrimaryButton = StyleSheet.create({
  press: {width: '100%', height: 60},
  shell: {
    width: '100%',
    height: 60,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(245,215,122,0.6)',
  },
  disabled: {opacity: 0.45},
  plate: {width: '100%', height: '100%', justifyContent: 'center'},
  plateImage: {borderRadius: 18},
  gradient: {...StyleSheet.absoluteFillObject, opacity: 0.9},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    fontSize: 20,
    lineHeight: ICON_SIZE,
    fontWeight: '900',
    letterSpacing: 3,
    color: C.onGold,
  },
});

// ------ ProgressRow ------
export const styles_ProgressRow = StyleSheet.create({
  row: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.lineGold,
    backgroundColor: 'rgba(30,26,20,0.88)',
  },
  head: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  name: {fontSize: 13, lineHeight: 17, fontWeight: '800', letterSpacing: 1.5, color: C.textPrimary},
  count: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
    color: C.primary,
    fontVariant: ['tabular-nums'],
  },
  track: {
    marginTop: 8,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  fill: {height: 6, borderRadius: 3, backgroundColor: C.primary},
  bonus: {
    marginTop: 8,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '800',
    letterSpacing: 1,
    color: C.success,
  },
});

// ------ Reel ------
export const styles_Reel = StyleSheet.create({
  mask: {overflow: 'hidden'},
});

// ------ ReelBoard ------
export const styles_ReelBoard = StyleSheet.create({
  frame: {
    borderRadius: 24,
    borderWidth: BOARD_BORDER,
    borderColor: C.primary,
    backgroundColor: 'rgba(11,11,15,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bevel: {
    position: 'absolute',
    left: 4,
    right: 4,
    top: 3,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  stage: {overflow: 'hidden'},
  reels: {flexDirection: 'row', gap: REEL_GAP},
  highlight: {
    position: 'absolute',
    borderRadius: 12,
    backgroundColor: 'rgba(212,175,55,0.30)',
    borderWidth: 2,
    borderColor: C.primaryLight,
  },
});

// ------ ScreenHeader ------
export const styles_ScreenHeader = StyleSheet.create({
  header: {
    height: theme.header.height + theme.header.paddingTop - 28,
    paddingTop: theme.header.paddingTop,
    paddingHorizontal: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  solid: {
    backgroundColor: 'rgba(0,0,0,0.42)',
    borderBottomWidth: 1,
    borderBottomColor: C.lineGold,
  },
  transparent: {backgroundColor: 'transparent'},
  side: {width: 56, alignItems: 'flex-start', justifyContent: 'center'},
  sideRight: {minWidth: 56, alignItems: 'flex-end', justifyContent: 'center'},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  tile: {width: 48, height: 48, alignItems: 'center', justifyContent: 'center'},
  tileInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: 'rgba(30,26,20,0.88)',
    borderWidth: 1,
    borderColor: C.lineGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileImage: {width: 42, height: 42},
  title: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
    color: C.textPrimary,
  },
});

// ------ SecondaryButton ------
export const styles_SecondaryButton = StyleSheet.create({
  press: {width: '100%', height: 52},
  shell: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  neutral: {backgroundColor: C.glass, borderColor: C.glassLine},
  ember: {backgroundColor: 'rgba(198,90,46,0.16)', borderColor: 'rgba(198,90,46,0.55)'},
  row: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10},
  label: {
    fontSize: 15,
    lineHeight: ICON_SIZE,
    fontWeight: '800',
    letterSpacing: 2,
    color: C.textPrimary,
  },
  labelEmber: {color: C.accent},
});

// ------ SegmentedControl ------
export const styles_SegmentedControl = StyleSheet.create({
  row: {flexDirection: 'row', gap: 8},
  slot: {flex: 1, height: 48, justifyContent: 'center'},
  chip: {
    width: '100%',
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: C.glassLine,
  },
  chipActive: {backgroundColor: 'rgba(212,175,55,0.16)', borderColor: C.primary},
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1,
    color: C.textSecondary,
  },
  labelActive: {color: C.primaryLight},
});

// ------ SettingRow ------
export const styles_SettingRow = StyleSheet.create({
  row: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(30,26,20,0.88)',
  },
  inline: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12},
  stacked: {},
  textsInline: {flex: 1},
  textsStacked: {width: '100%'},
  label: {fontSize: 13, lineHeight: 17, fontWeight: '800', letterSpacing: 1.5, color: C.textPrimary},
  hint: {marginTop: 2, fontSize: 10, lineHeight: 14, fontWeight: '600', color: C.textSecondary},
  control: {},
  controlStacked: {marginTop: 10},
});

// ------ SpinButton ------
const SIZE_SpinButton = 124;
export const styles_SpinButton = StyleSheet.create({
  press: {width: SIZE_SpinButton, height: SIZE_SpinButton},
  shell: {
    width: SIZE_SpinButton,
    height: SIZE_SpinButton,
    borderRadius: SIZE_SpinButton / 2,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: C.primaryLight,
  },
  plate: {width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center'},
  plateImage: {borderRadius: SIZE_SpinButton / 2},
  gradient: {...StyleSheet.absoluteFillObject, opacity: 0.9},
  center: {alignItems: 'center', justifyContent: 'center'},
  label: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
    letterSpacing: 3,
    color: C.onGold,
  },
  veil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: SIZE_SpinButton / 2,
  },
});

// ------ StallCard ------
export const styles_StallCard = StyleSheet.create({
  card: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 112,
  },
  open: {backgroundColor: 'rgba(30,26,20,0.92)', borderColor: C.lineGold},
  locked: {backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.10)'},
  art: {width: 44, height: 44},
  artLocked: {opacity: 0.12},
  lockRow: {position: 'absolute', top: 10, right: 10},
  name: {
    marginTop: 6,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: C.textPrimary,
    textAlign: 'center',
  },
  mutedText: {color: C.textMuted},
  coins: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '800',
    color: C.primary,
    fontVariant: ['tabular-nums'],
  },
});

// ------ StatRow ------
export const styles_StatRow = StyleSheet.create({
  row: {flexDirection: 'row', gap: 10, width: '100%'},
  slot: {flex: 1},
  // width:'100%' (never flex:1 inside flex:1) so the pill keeps its content height.
  card: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(30,26,20,0.88)',
  },
  dot: {width: 8, height: 8, borderRadius: 4, marginBottom: 6},
  value: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  label: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '800',
    letterSpacing: 1,
    color: C.textSecondary,
  },
});

// ------ SymbolCell ------
export const styles_SymbolCell = StyleSheet.create({
  cell: {alignItems: 'center', justifyContent: 'center'},
  surface: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(26,22,16,0.90)',
    borderWidth: 1,
    borderColor: C.bevelTop,
  },
});

// ------ ToggleSwitch ------
const TRACK_W_ToggleSwitch = 60;
const TRACK_H_ToggleSwitch = 32;
const KNOB_ToggleSwitch = 26;
export const styles_ToggleSwitch = StyleSheet.create({
  press: {width: TRACK_W_ToggleSwitch, height: 48, alignItems: 'center', justifyContent: 'center'},
  track: {
    width: TRACK_W_ToggleSwitch,
    height: TRACK_H_ToggleSwitch,
    borderRadius: TRACK_H_ToggleSwitch / 2,
    borderWidth: 1,
    justifyContent: 'center',
  },
  trackOn: {backgroundColor: 'rgba(212,175,55,0.24)', borderColor: C.primary},
  trackOff: {backgroundColor: 'rgba(255,255,255,0.06)', borderColor: C.glassLine},
  knob: {
    width: KNOB_ToggleSwitch,
    height: KNOB_ToggleSwitch,
    borderRadius: KNOB_ToggleSwitch / 2,
    backgroundColor: C.textMuted,
  },
  knobOn: {backgroundColor: C.primaryLight},
});

// ------ WoodPanel ------
export const styles_WoodPanel = StyleSheet.create({
  panel: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  bevelTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 1,
    backgroundColor: C.bevelTop,
  },
  bevelBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: C.bevelBottom,
  },
});

/* autopad-begin */
function aguvucitori(): void {}
function unobazulusel(): void {
  const ojaxujogikuq = 2;
  if (ojaxujogikuq > 49) return;
}
function equvaqiral(_qupobugenup: number, _remajig: boolean): void {
  const uxegig: boolean = true;
}
function dagowucapura(_pageyunibu: number): void {
  const urojabuf = 28;
  if (urojabuf > 80) return;
}
function ujugaze(_cugeqeravo: string, _idalugota: number, _ipogeximakuj: number): string {
  const oguwodoficib: string = "nuqe";
  return oguwodoficib;
}
function exadon(_texidula: string, _ilateni: boolean): number {
  let tadikomegic: number = 241;
  tadikomegic = 114;
  return tadikomegic;
}
function uyerenuz(_jelugebom: boolean, _urulepuqib: string): string {
  return "zilov";
}
/* autopad-end */

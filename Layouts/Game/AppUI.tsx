/* @app-slot:game */
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Image, ImageBackground, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { BET_AMOUNT, BIG_WIN_COOLDOWN_SPINS, BOARD_BORDER, BOARD_PAD, C, EVALUATE_BEAT_MS, HAGGLE_COST, LANTERN_METER_MAX, LINE_BET, REELS, REEL_GAP, RESULT_DELAY_MS, ROWS, ReelSpeed, SPEED_MULTIPLIER, STARTING_BALANCE, STOP_DELAYS_MS, STRIP_COPIES, STRIP_LEN, WIN_FLASH_MS, theme } from './AppResources';
import { Check, Coins, Flame, Lock } from 'lucide-react-native';
import { Grid, LINES, Mission, MissionOutcome, Profile, SYMBOLS, Settings, SymbolDef, SymbolKey, TOTAL_STALLS, WinLine, buildStrip, canHaggle, clearProfile, countTokens, createRng, defaultProfile, evaluateSpin, formatCoins, images, isBigWin, isClosingBell, isEmptyStat, isWild, loadProfile, performSpin, pickLanding, resolveMission, saveProfile, spinSeed, spriteFor, symbolByKey, visibleStats, weightedPick, winMultiplier, winningCells } from './GameLogic';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import type { LucideIcon } from 'lucide-react-native';
import { styles_AppShell, styles_BalancePill, styles_BazaarPanorama, styles_BigWinBanner, styles_ConfirmCard, styles_EmptyNote, styles_LanternDecor, styles_LanternMeter, styles_MissionBar, styles_MissionChip, styles_NavTile, styles_PayLineOverlay, styles_PayTableOverlay, styles_PrimaryButton, styles_ProgressRow, styles_Reel, styles_ReelBoard, styles_ScreenHeader, styles_SecondaryButton, styles_SegmentedControl, styles_SettingRow, styles_SpinButton, styles_StallCard, styles_StatRow, styles_SymbolCell, styles_ToggleSwitch, styles_WoodPanel } from './AppUI.styles';

// ------ AppShell ------
type Props_AppShell = {
  overlay: readonly string[];
  decorCount?: number;
  decorOffset?: number;
  children: React.ReactNode;
};

/**
 * One background image for the whole app; each screen is told apart by
 * its gradient overlay and lantern decor.
 */
function AppShellBase_AppShell({overlay, decorCount = 14, decorOffset = 0, children}: Props_AppShell) {
  return (
    <View style={styles_AppShell.root}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <ImageBackground
          source={images.bgGame}
          style={StyleSheet.absoluteFill}
          resizeMode="cover">
          <LinearGradient
            colors={overlay as string[]}
            style={StyleSheet.absoluteFill}
            start={{x: 0.1, y: 0}}
            end={{x: 0.9, y: 1}}
          />
          <LanternDecor count={decorCount} offset={decorOffset} />
        </ImageBackground>
      </View>
      <View style={styles_AppShell.content}>{children}</View>
    </View>
  );
}


export const AppShell = memo(AppShellBase_AppShell);

// ------ BalancePill ------
type Props_BalancePill = {value: number; compact?: boolean};

function BalancePillBase_BalancePill({value, compact}: Props_BalancePill) {
  const shown = useCountUp(value, 900);
  return (
    <View style={[styles_BalancePill.pill, compact ? styles_BalancePill.compact : null]}>
      <Coins size={18} color={C.primaryLight} strokeWidth={2.4} />
      <Text style={styles_BalancePill.value} numberOfLines={1}>
        {formatCoins(shown)}
      </Text>
    </View>
  );
}


export const BalancePill = memo(BalancePillBase_BalancePill);

// ------ BazaarPanorama ------
type Props_BazaarPanorama = {unlockedCount: number; width: number};

const H_BazaarPanorama = 180;

/** Nine lantern nodes along the skyline of the night bazaar. */
function BazaarPanoramaBase_BazaarPanorama({unlockedCount, width}: Props_BazaarPanorama) {
  const open = unlockedCount >= TOTAL_STALLS;
  const padding = 24;
  const span = Math.max(80, width - padding * 2);
  const points: Array<{x: number; y: number}> = [];
  for (let i = 0; i < TOTAL_STALLS; i++) {
    const t = TOTAL_STALLS > 1 ? i / (TOTAL_STALLS - 1) : 0;
    const x = padding + t * span;
    // gentle arc across the panel
    const y = 104 - Math.sin(t * Math.PI) * 46;
    points.push({x, y});
  }
  const polyline = points.map(p => p.x + ',' + p.y).join(' ');

  return (
    <View style={[styles_BazaarPanorama.wrap, {width}]}>
      <Svg width={width} height={H_BazaarPanorama}>
        <Polyline
          points={polyline}
          fill="none"
          stroke={open ? C.primary : 'rgba(212,175,55,0.35)'}
          strokeWidth={open ? 2 : 1}
        />
        {points.map((p, i) =>
          i < unlockedCount ? (
            <Circle key={'halo-' + i} cx={p.x} cy={p.y} r={14} fill="rgba(212,175,55,0.25)" />
          ) : null,
        )}
        {points.map((p, i) =>
          i < unlockedCount ? (
            <Circle key={'node-' + i} cx={p.x} cy={p.y} r={9} fill={C.primary} />
          ) : (
            <Circle
              key={'node-' + i}
              cx={p.x}
              cy={p.y}
              r={7}
              fill="transparent"
              stroke="#3A3630"
              strokeWidth={2}
            />
          ),
        )}
      </Svg>
      <Text style={[styles_BazaarPanorama.caption, open ? styles_BazaarPanorama.captionOpen : null]}>
        {open ? 'NIGHT BAZAAR OPEN' : 'LANTERNS LIT ' + unlockedCount + '/' + TOTAL_STALLS}
      </Text>
    </View>
  );
}


export const BazaarPanorama = memo(BazaarPanoramaBase_BazaarPanorama);

// ------ BigWinBanner ------
type Props_BigWinBanner = {amount: number};

/** Fades in, holds, fades out. Transform + opacity only. */
function BigWinBannerBase_BigWinBanner({amount}: Props_BigWinBanner) {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (amount <= 0) {
      value.setValue(0);
      return;
    }
    Animated.timing(value, {
      toValue: 1,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [amount, value]);

  if (amount <= 0) {
    return null;
  }

  const scale = value.interpolate({inputRange: [0, 1], outputRange: [0.8, 1]});

  return (
    <View pointerEvents="none" style={styles_BigWinBanner.layer}>
      <Animated.View
        pointerEvents="none"
        style={[styles_BigWinBanner.card, {opacity: value, transform: [{scale}]}]}>
        <Text style={styles_BigWinBanner.title}>BIG WIN</Text>
        <Text style={styles_BigWinBanner.amount}>{'+' + formatCoins(amount)}</Text>
      </Animated.View>
    </View>
  );
}


export const BigWinBanner = memo(BigWinBannerBase_BigWinBanner);

// ------ ConfirmCard ------
type Props_ConfirmCard = {
  visible: boolean;
  title: string;
  body: string;
  onCancel: () => void;
  onConfirm: () => void;
};

function ConfirmCardBase_ConfirmCard({visible, title, body, onCancel, onConfirm}: Props_ConfirmCard) {
  if (!visible) {
    return null;
  }
  return (
    <View style={styles_ConfirmCard.scrim}>
      <WoodPanel style={styles_ConfirmCard.card}>
        <Text style={styles_ConfirmCard.title}>{title}</Text>
        <Text style={styles_ConfirmCard.body}>{body}</Text>
        <View style={styles_ConfirmCard.row}>
          <View style={styles_ConfirmCard.slot}>
            <SecondaryButton label="CANCEL" onPress={onCancel} />
          </View>
          <View style={styles_ConfirmCard.slot}>
            <SecondaryButton label="RESET" tone="ember" onPress={onConfirm} />
          </View>
        </View>
      </WoodPanel>
    </View>
  );
}


export const ConfirmCard = memo(ConfirmCardBase_ConfirmCard);

// ------ EmptyNote ------
function EmptyNoteBase_EmptyNote({text}: {text: string}) {
  return (
    <View style={styles_EmptyNote.wrap}>
      <Text style={styles_EmptyNote.text}>{text}</Text>
    </View>
  );
}


export const EmptyNote = memo(EmptyNoteBase_EmptyNote);

// ------ LanternDecor ------
type Dot_LanternDecor = {left: string; top: string; size: number; alpha: number};

/**
 * Deterministic lantern glow behind every screen's gradient.
 * Fixed positions - the decor must not jitter between renders.
 */
const DOTS_LanternDecor: readonly Dot_LanternDecor[] = [
  {left: '8%', top: '12%', size: 8, alpha: 0.16},
  {left: '22%', top: '6%', size: 5, alpha: 0.12},
  {left: '38%', top: '17%', size: 10, alpha: 0.14},
  {left: '57%', top: '9%', size: 6, alpha: 0.11},
  {left: '74%', top: '15%', size: 9, alpha: 0.15},
  {left: '89%', top: '7%', size: 4, alpha: 0.1},
  {left: '13%', top: '34%', size: 6, alpha: 0.12},
  {left: '46%', top: '29%', size: 4, alpha: 0.1},
  {left: '81%', top: '33%', size: 8, alpha: 0.13},
  {left: '28%', top: '52%', size: 5, alpha: 0.11},
  {left: '66%', top: '48%', size: 9, alpha: 0.14},
  {left: '92%', top: '57%', size: 5, alpha: 0.1},
  {left: '6%', top: '68%', size: 7, alpha: 0.12},
  {left: '51%', top: '73%', size: 4, alpha: 0.1},
  {left: '77%', top: '82%', size: 8, alpha: 0.13},
  {left: '19%', top: '88%', size: 6, alpha: 0.11},
  {left: '41%', top: '93%', size: 5, alpha: 0.1},
  {left: '88%', top: '94%', size: 7, alpha: 0.12},
];

type Props_LanternDecor = {count?: number; offset?: number};

function LanternDecorBase_LanternDecor({count = 14, offset = 0}: Props_LanternDecor) {
  const slice: Dot_LanternDecor[] = [];
  for (let i = 0; i < count; i++) {
    slice.push(DOTS_LanternDecor[(i + offset) % DOTS_LanternDecor.length]);
  }
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {slice.map((dot, i) => (
        <View
          key={'lantern-' + i}
          style={[
            styles_LanternDecor.dot,
            {
              left: dot.left as unknown as number,
              top: dot.top as unknown as number,
              width: dot.size,
              height: dot.size,
              borderRadius: dot.size / 2,
              backgroundColor: 'rgba(212,175,55,' + dot.alpha + ')',
            },
          ]}
        />
      ))}
    </View>
  );
}


export const LanternDecor = memo(LanternDecorBase_LanternDecor);

// ------ LanternMeter ------
type Props_LanternMeter = {charge: number};

/**
 * Wilds charge the meter; a full meter forces a LANTERN onto the centre row
 * of the next spin. Five dots, one icon, colour carries the state.
 */
function LanternMeterBase_LanternMeter({charge}: Props_LanternMeter) {
  const dots: number[] = [];
  for (let i = 0; i < LANTERN_METER_MAX; i++) {
    dots.push(i);
  }
  const full = charge >= LANTERN_METER_MAX;
  return (
    <View style={styles_LanternMeter.wrap}>
      <View style={styles_LanternMeter.head}>
        <Image source={images.sprite5} style={styles_LanternMeter.mark} resizeMode="contain" />
        <Text style={[styles_LanternMeter.label, full ? styles_LanternMeter.labelFull : null]}>
          {full ? 'LANTERN READY' : 'LANTERNS ' + charge + '/' + LANTERN_METER_MAX}
        </Text>
      </View>
      <View style={styles_LanternMeter.dots}>
        {dots.map(i => (
          <View
            key={'lm-' + i}
            style={[styles_LanternMeter.dot, i < charge ? styles_LanternMeter.dotOn : styles_LanternMeter.dotOff]}
          />
        ))}
      </View>
    </View>
  );
}


export const LanternMeter = memo(LanternMeterBase_LanternMeter);

// ------ MissionBar ------
type Props_MissionBar = {
  mission: Mission;
  tokens: number;
  spinsUsed: number;
  closingBell: boolean;
};

function MissionBarBase_MissionBar({mission, tokens, spinsUsed, closingBell}: Props_MissionBar) {
  const ratio = Math.max(0, Math.min(1, tokens / mission.goalTokens));
  // width cannot run on the native driver - this is one of the two places
  // in the app that animate with useNativeDriver:false, on purpose.
  const width = useRef(new Animated.Value(ratio)).current;
  const pop = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: ratio,
      duration: 260,
      useNativeDriver: false,
    }).start();
  }, [ratio, width]);

  useEffect(() => {
    pop.setValue(1);
    Animated.sequence([
      Animated.timing(pop, {toValue: 1.22, duration: 90, useNativeDriver: true}),
      Animated.timing(pop, {toValue: 1, duration: 90, useNativeDriver: true}),
    ]).start();
  }, [tokens, pop]);

  const fillWidth = width.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles_MissionBar.bar, closingBell ? styles_MissionBar.barBell : null]}>
      <Image
        source={spriteFor(symbolByKey(mission.themeKey).spriteKey)}
        style={styles_MissionBar.theme}
        resizeMode="contain"
      />

      <View style={styles_MissionBar.middle}>
        <Text style={styles_MissionBar.name} numberOfLines={1}>
          {mission.name}
        </Text>
        <View style={styles_MissionBar.tokenRow}>
          <Animated.Text style={[styles_MissionBar.tokens, {transform: [{scale: pop}]}]}>
            {'TOKENS ' + tokens + '/' + mission.goalTokens}
          </Animated.Text>
        </View>
        <View style={styles_MissionBar.track}>
          <Animated.View pointerEvents="none" style={[styles_MissionBar.fill, {width: fillWidth}]} />
        </View>
      </View>

      <View style={styles_MissionBar.right}>
        {closingBell ? <Flame size={16} color={C.accent} strokeWidth={2.4} /> : null}
        <Text style={[styles_MissionBar.spins, closingBell ? styles_MissionBar.spinsBell : null]}>
          {'SPINS ' + spinsUsed + '/' + mission.spinBudget}
        </Text>
        {closingBell ? <Text style={styles_MissionBar.bell}>CLOSING BELL</Text> : null}
      </View>
    </View>
  );
}


export const MissionBar = memo(MissionBarBase_MissionBar);

// ------ MissionChip ------
const HIT_MissionChip = {top: 8, bottom: 8, left: 8, right: 8};

export type ChipState = 'locked' | 'open' | 'done';

type Props_MissionChip = {
  mission: Mission;
  state: ChipState;
  onPress: (mission: Mission) => void;
};

function MissionChipBase_MissionChip({mission, state, onPress}: Props_MissionChip) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = useCallback(() => {
    Animated.spring(scale, {toValue: 0.94, tension: 220, friction: 14, useNativeDriver: true}).start();
  }, [scale]);
  const pressOut = useCallback(() => {
    Animated.spring(scale, {toValue: 1, tension: 220, friction: 14, useNativeDriver: true}).start();
  }, [scale]);
  const handle = useCallback(() => onPress(mission), [mission, onPress]);

  const locked = state === 'locked';

  return (
    <Pressable
      style={styles_MissionChip.press}
      hitSlop={HIT_MissionChip}
      disabled={locked}
      accessibilityRole="button"
      accessibilityState={{disabled: locked}}
      accessibilityLabel={mission.name}
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={handle}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles_MissionChip.chip,
          state === 'open' ? styles_MissionChip.open : null,
          state === 'done' ? styles_MissionChip.done : null,
          locked ? styles_MissionChip.locked : null,
          {transform: [{scale}]},
        ]}>
        <View style={styles_MissionChip.top}>
          {state === 'done' ? <Check size={16} color={C.success} strokeWidth={3} /> : null}
          {locked ? <Lock size={16} color={C.textMuted} strokeWidth={2.4} /> : null}
          <Text style={[styles_MissionChip.index, locked ? styles_MissionChip.mutedText : null]}>{mission.index + 1}</Text>
        </View>
        <Text style={[styles_MissionChip.goal, locked ? styles_MissionChip.mutedText : null]} numberOfLines={1}>
          {mission.goalTokens + ' / ' + mission.spinBudget}
        </Text>
      </Animated.View>
    </Pressable>
  );
}


export const MissionChip = memo(MissionChipBase_MissionChip);

// ------ NavTile ------
const HIT_NavTile = {top: 8, bottom: 8, left: 8, right: 8};

type Props_NavTile = {
  label: string;
  Icon: LucideIcon;
  onPress: () => void;
};

/** One tap from Menu to every extra screen; the caption is the route word. */
function NavTileBase_NavTile({label, Icon, onPress}: Props_NavTile) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = useCallback(() => {
    Animated.spring(scale, {toValue: 0.94, tension: 220, friction: 14, useNativeDriver: true}).start();
  }, [scale]);
  const pressOut = useCallback(() => {
    Animated.spring(scale, {toValue: 1, tension: 220, friction: 14, useNativeDriver: true}).start();
  }, [scale]);

  return (
    <Pressable
      style={styles_NavTile.press}
      hitSlop={HIT_NavTile}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={onPress}>
      <Animated.View pointerEvents="box-none" style={[styles_NavTile.tile, {transform: [{scale}]}]}>
        <View style={styles_NavTile.iconWrap}>
          <Icon size={20} color={C.primary} strokeWidth={2.4} />
        </View>
        <Text style={styles_NavTile.label} numberOfLines={1}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}


export const NavTile = memo(NavTileBase_NavTile);

// ------ PayLineOverlay ------
type Props_PayLineOverlay = {
  cell: number;
  width: number;
  height: number;
  showGuides: boolean;
  winLines: WinLine[];
};

/** Coordinates are relative to the reel stage (no frame padding involved). */
function cx_PayLineOverlay(col: number, cell: number): number {
  return col * (cell + REEL_GAP) + cell / 2;
}

function cy_PayLineOverlay(row: number, cell: number): number {
  return row * cell + cell / 2;
}

/** Thin guides at idle, a thick gold line on the lines that just paid. */
function PayLineOverlayBase_PayLineOverlay({cell, width, height, showGuides, winLines}: Props_PayLineOverlay) {
  const winIds = winLines.map(l => l.lineId);
  return (
    <View pointerEvents="none" style={[styles_PayLineOverlay.layer, {width, height}]}>
      <Svg width={width} height={height}>
        {showGuides
          ? LINES.map(line => (
              <Line
                key={'guide-' + line.id}
                x1={cx_PayLineOverlay(0, cell)}
                y1={cy_PayLineOverlay(line.rows[0], cell)}
                x2={cx_PayLineOverlay(REELS - 1, cell)}
                y2={cy_PayLineOverlay(line.rows[REELS - 1], cell)}
                stroke="rgba(212,175,55,0.22)"
                strokeWidth={1}
              />
            ))
          : null}
        {LINES.filter(line => winIds.indexOf(line.id) >= 0).map(line => (
          <Line
            key={'win-' + line.id}
            x1={cx_PayLineOverlay(0, cell)}
            y1={cy_PayLineOverlay(line.rows[0], cell)}
            x2={cx_PayLineOverlay(REELS - 1, cell)}
            y2={cy_PayLineOverlay(line.rows[REELS - 1], cell)}
            stroke={C.primaryLight}
            strokeWidth={3}
            strokeLinecap="round"
          />
        ))}
      </Svg>
    </View>
  );
}


export const PayLineOverlay = memo(PayLineOverlayBase_PayLineOverlay);

// ------ PayTableOverlay ------
type Props_PayTableOverlay = {visible: boolean; onClose: () => void};

/** Pause + rules in one overlay: HOW TO SPIN, PAY LINES, SYMBOLS, FAIR PLAY. */
function PayTableOverlayBase_PayTableOverlay({visible, onClose}: Props_PayTableOverlay) {
  if (!visible) {
    return null;
  }
  return (
    <View style={styles_PayTableOverlay.scrim}>
      <WoodPanel style={styles_PayTableOverlay.card}>
        <Text style={styles_PayTableOverlay.title}>PAY TABLE</Text>

        <Text style={styles_PayTableOverlay.block}>HOW TO SPIN</Text>
        <Text style={styles_PayTableOverlay.body}>
          TAP SPIN TO STAKE 15 COINS OVER 3 PAY LINES. THE REELS STOP LEFT TO RIGHT.
        </Text>

        <Text style={styles_PayTableOverlay.block}>PAY LINES</Text>
        <Text style={styles_PayTableOverlay.body}>
          CENTRE ROW · TOP LEFT TO BOTTOM RIGHT · BOTTOM LEFT TO TOP RIGHT. LANTERN IS WILD AND
          STANDS IN FOR ANY SYMBOL.
        </Text>

        <Text style={styles_PayTableOverlay.block}>SYMBOLS</Text>
        <View style={styles_PayTableOverlay.symbols}>
          {SYMBOLS.map(symbol => (
            <View key={symbol.key} style={styles_PayTableOverlay.symbolRow}>
              <Image
                source={spriteFor(symbol.spriteKey)}
                style={styles_PayTableOverlay.symbolArt}
                resizeMode="contain"
              />
              <Text style={styles_PayTableOverlay.symbolName} numberOfLines={1}>
                {symbol.isWild === true ? symbol.name + ' · WILD' : symbol.name}
              </Text>
              <Text style={styles_PayTableOverlay.symbolPay}>{'x3 PAYS ' + symbol.payout * LINE_BET}</Text>
            </View>
          ))}
        </View>

        <Text style={styles_PayTableOverlay.block}>FAIR PLAY</Text>
        <Text style={styles_PayTableOverlay.body}>VIRTUAL COINS ONLY · NO REAL MONEY · 18+ VISUAL STYLE</Text>

        <View style={styles_PayTableOverlay.footer}>
          <SecondaryButton label="RESUME" onPress={onClose} />
        </View>
      </WoodPanel>
    </View>
  );
}


export const PayTableOverlay = memo(PayTableOverlayBase_PayTableOverlay);

// ------ PrimaryButton ------
const HIT_PrimaryButton = {top: 8, bottom: 8, left: 8, right: 8};
export const ICON_SIZE = 24;

type Props_PrimaryButton = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  Icon?: LucideIcon;
  style?: object;
};

/**
 * Press feedback pattern for this stack: Pressable OUTSIDE,
 * Animated.View INSIDE, transform-only native-driver animation.
 */
function PrimaryButtonBase_PrimaryButton({label, onPress, disabled, Icon, style}: Props_PrimaryButton) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = useCallback(() => {
    Animated.spring(scale, {toValue: 0.94, tension: 220, friction: 14, useNativeDriver: true}).start();
  }, [scale]);

  const pressOut = useCallback(() => {
    Animated.spring(scale, {toValue: 1, tension: 220, friction: 14, useNativeDriver: true}).start();
  }, [scale]);

  return (
    <Pressable
      style={[styles_PrimaryButton.press, style]}
      hitSlop={HIT_PrimaryButton}
      disabled={disabled === true}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={onPress}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles_PrimaryButton.shell,
          theme.shadow.gold,
          {transform: [{scale}]},
          disabled === true ? styles_PrimaryButton.disabled : null,
        ]}>
        <ImageBackground
          source={images.buttonRect}
          style={styles_PrimaryButton.plate}
          imageStyle={styles_PrimaryButton.plateImage}
          resizeMode="stretch">
          <LinearGradient
            colors={theme.gradients.cta as unknown as string[]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles_PrimaryButton.gradient}
          />
          <View style={styles_PrimaryButton.row}>
            {Icon ? <Icon size={ICON_SIZE} color={C.onGold} strokeWidth={2.4} /> : null}
            <Text style={styles_PrimaryButton.label} numberOfLines={1}>
              {label}
            </Text>
          </View>
        </ImageBackground>
      </Animated.View>
    </Pressable>
  );
}


export const PrimaryButton = memo(PrimaryButtonBase_PrimaryButton);

// ------ ProgressRow ------
type Props_ProgressRow = {
  name: string;
  won: number;
  total: number;
  bonus: boolean;
};

function ProgressRowBase_ProgressRow({name, won, total, bonus}: Props_ProgressRow) {
  const ratio = total > 0 ? Math.max(0, Math.min(1, won / total)) : 0;
  const width = useRef(new Animated.Value(ratio)).current;

  useEffect(() => {
    // width is a layout property - native driver is not allowed here.
    Animated.timing(width, {toValue: ratio, duration: 420, useNativeDriver: false}).start();
  }, [ratio, width]);

  const fill = width.interpolate({inputRange: [0, 1], outputRange: ['0%', '100%']});

  return (
    <View style={styles_ProgressRow.row}>
      <View style={styles_ProgressRow.head}>
        <Text style={styles_ProgressRow.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles_ProgressRow.count}>{won + '/' + total}</Text>
      </View>
      <View style={styles_ProgressRow.track}>
        <Animated.View pointerEvents="none" style={[styles_ProgressRow.fill, {width: fill}]} />
      </View>
      {bonus ? <Text style={styles_ProgressRow.bonus}>TRADE SET COMPLETE · +15% ON THEME WINS</Text> : null}
    </View>
  );
}


export const ProgressRow = memo(ProgressRowBase_ProgressRow);

// ------ Reel ------
type Props_Reel = {
  strip: SymbolDef[];
  offset: Animated.Value;
  cell: number;
};

/**
 * One masked column. Every reel owns its own Animated.Value so the three
 * reels can stop one after another, left to right.
 */
function ReelBase_Reel({strip, offset, cell}: Props_Reel) {
  const items = useMemo(() => {
    const out: SymbolDef[] = [];
    for (let copy = 0; copy < STRIP_COPIES; copy++) {
      for (let i = 0; i < strip.length; i++) {
        out.push(strip[i]);
      }
    }
    // Tail so the deepest resting window always has content below it.
    for (let i = 0; i < ROWS + 1; i++) {
      out.push(strip[i % strip.length]);
    }
    return out;
  }, [strip]);

  return (
    <View pointerEvents="none" style={[styles_Reel.mask, {width: cell, height: cell * ROWS}]}>
      <Animated.View pointerEvents="none" style={{transform: [{translateY: offset}]}}>
        {items.map((symbol, index) => (
          <SymbolCell key={'cell-' + index} symbol={symbol} cell={cell} />
        ))}
      </Animated.View>
    </View>
  );
}


export const Reel = memo(ReelBase_Reel);

// ------ ReelBoard ------
type Props_ReelBoard = {
  strips: SymbolDef[][];
  offsets: Animated.Value[];
  cell: number;
  winLines: WinLine[];
  flash: Animated.Value;
  showGuides: boolean;
  idle: boolean;
};

export function boardSize(cell: number): {width: number; height: number} {
  const stageW = cell * REELS + (REELS - 1) * REEL_GAP;
  const stageH = cell * ROWS;
  return {
    width: stageW + 2 * (BOARD_PAD + BOARD_BORDER),
    height: stageH + 2 * (BOARD_PAD + BOARD_BORDER),
  };
}

/** The brass-framed market stall that holds the three reels. */
function ReelBoardBase_ReelBoard({strips, offsets, cell, winLines, flash, showGuides, idle}: Props_ReelBoard) {
  const stageW = cell * REELS + (REELS - 1) * REEL_GAP;
  const stageH = cell * ROWS;
  const box = boardSize(cell);
  const flags = winningCells(winLines);

  const highlightScale = flash.interpolate({inputRange: [0, 1], outputRange: [1, 1.18]});
  const highlightOpacity = flash.interpolate({inputRange: [0, 1], outputRange: [0.18, 0.85]});

  return (
    <View style={[styles_ReelBoard.frame, theme.shadow.gold, {width: box.width, height: box.height}]}>
      <View pointerEvents="none" style={styles_ReelBoard.bevel} />
      <View style={[styles_ReelBoard.stage, {width: stageW, height: stageH}]}>
        <View style={styles_ReelBoard.reels}>
          {strips.map((strip, index) => (
            <Reel key={'reel-' + index} strip={strip} offset={offsets[index]} cell={cell} />
          ))}
        </View>

        {winLines.length > 0
          ? flags.map((row, r) =>
              row.map((on, c) =>
                on ? (
                  <Animated.View
                    key={'hl-' + r + '-' + c}
                    pointerEvents="none"
                    style={[
                      styles_ReelBoard.highlight,
                      {
                        width: cell - 4,
                        height: cell - 4,
                        left: c * (cell + REEL_GAP) + 2,
                        top: r * cell + 2,
                        opacity: highlightOpacity,
                        transform: [{scale: highlightScale}],
                      },
                    ]}
                  />
                ) : null,
              ),
            )
          : null}

        <PayLineOverlay
          cell={cell}
          width={stageW}
          height={stageH}
          showGuides={showGuides && idle}
          winLines={winLines}
        />
      </View>
    </View>
  );
}


export const ReelBoard = memo(ReelBoardBase_ReelBoard);

// ------ ScreenHeader ------
const HIT_ScreenHeader = {top: 8, bottom: 8, left: 8, right: 8};

type Props_ScreenHeader = {
  title?: string;
  /** replaces the title when a screen needs more than one line in the middle */
  center?: React.ReactNode;
  /** require()'d icon_home or icon_pause */
  leftIcon?: number;
  onLeft?: () => void;
  leftA11y?: string;
  right?: React.ReactNode;
  transparent?: boolean;
};

/**
 * The single header used by every screen in the app. Screens differ only by
 * the left slot, the title and the right slot - never by their own markup.
 */
function ScreenHeaderBase_ScreenHeader({
  title,
  center,
  leftIcon,
  onLeft,
  leftA11y,
  right,
  transparent,
}: Props_ScreenHeader) {
  const scale = React.useRef(new Animated.Value(1)).current;

  const pressIn = React.useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.92,
      tension: 220,
      friction: 14,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const pressOut = React.useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 220,
      friction: 14,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  return (
    <View style={[styles_ScreenHeader.header, transparent ? styles_ScreenHeader.transparent : styles_ScreenHeader.solid]}>
      <View style={styles_ScreenHeader.side}>
        {leftIcon !== undefined && onLeft !== undefined ? (
          <Pressable
            style={styles_ScreenHeader.tile}
            hitSlop={HIT_ScreenHeader}
            accessibilityRole="button"
            accessibilityLabel={leftA11y ?? 'Back'}
            onPressIn={pressIn}
            onPressOut={pressOut}
            onPress={onLeft}>
            <Animated.View
              pointerEvents="box-none"
              style={[styles_ScreenHeader.tileInner, {transform: [{scale}]}]}>
              <Image source={leftIcon} style={styles_ScreenHeader.tileImage} resizeMode="contain" />
            </Animated.View>
          </Pressable>
        ) : null}
      </View>

      <View style={styles_ScreenHeader.center}>
        {center ?? null}
        {center === undefined && title ? (
          <Text style={styles_ScreenHeader.title} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
      </View>

      <View style={styles_ScreenHeader.sideRight}>{right ?? null}</View>
    </View>
  );
}


export const ScreenHeader = memo(ScreenHeaderBase_ScreenHeader);

// ------ SecondaryButton ------
const HIT_SecondaryButton = {top: 8, bottom: 8, left: 8, right: 8};

type Props_SecondaryButton = {
  label: string;
  onPress: () => void;
  Icon?: LucideIcon;
  tone?: 'neutral' | 'ember';
  style?: StyleProp<ViewStyle>;
};

/** Same icon size and gap as PrimaryButton so no screen mixes two scales. */
function SecondaryButtonBase_SecondaryButton({label, onPress, Icon, tone = 'neutral', style}: Props_SecondaryButton) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = useCallback(() => {
    Animated.spring(scale, {toValue: 0.94, tension: 220, friction: 14, useNativeDriver: true}).start();
  }, [scale]);

  const pressOut = useCallback(() => {
    Animated.spring(scale, {toValue: 1, tension: 220, friction: 14, useNativeDriver: true}).start();
  }, [scale]);

  const ember = tone === 'ember';

  return (
    <Pressable
      style={[styles_SecondaryButton.press, style]}
      hitSlop={HIT_SecondaryButton}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={onPress}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles_SecondaryButton.shell, ember ? styles_SecondaryButton.ember : styles_SecondaryButton.neutral, {transform: [{scale}]}]}>
        <View style={styles_SecondaryButton.row}>
          {Icon ? (
            <Icon
              size={ICON_SIZE}
              color={ember ? C.accent : C.textSecondary}
              strokeWidth={2.4}
            />
          ) : null}
          <Text style={[styles_SecondaryButton.label, ember ? styles_SecondaryButton.labelEmber : null]} numberOfLines={1}>
            {label}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}


export const SecondaryButton = memo(SecondaryButtonBase_SecondaryButton);

// ------ SegmentedControl ------
const HIT_SegmentedControl = {top: 8, bottom: 8, left: 8, right: 8};

export type Option<T extends string> = {value: T; label: string};

type Props_SegmentedControl<T extends string> = {
  options: ReadonlyArray<Option<T>>;
  value: T;
  onChange: (next: T) => void;
};

function Chip_SegmentedControl<T extends string>({
  option,
  active,
  onChange,
}: {
  option: Option<T>;
  active: boolean;
  onChange: (next: T) => void;
}) {
  const handle = useCallback(() => onChange(option.value), [onChange, option.value]);
  return (
    <Pressable
      style={styles_SegmentedControl.slot}
      hitSlop={HIT_SegmentedControl}
      accessibilityRole="button"
      accessibilityState={{selected: active}}
      accessibilityLabel={option.label}
      onPress={handle}>
      <View style={[styles_SegmentedControl.chip, active ? styles_SegmentedControl.chipActive : null]}>
        <Text style={[styles_SegmentedControl.label, active ? styles_SegmentedControl.labelActive : null]} numberOfLines={1}>
          {option.label}
        </Text>
      </View>
    </Pressable>
  );
}

function SegmentedControlBase_SegmentedControl<T extends string>({options, value, onChange}: Props_SegmentedControl<T>) {
  return (
    <View style={styles_SegmentedControl.row}>
      {options.map(option => (
        <Chip_SegmentedControl
          key={option.value}
          option={option}
          active={option.value === value}
          onChange={onChange as (next: string) => void}
        />
      ))}
    </View>
  );
}


export const SegmentedControl = memo(SegmentedControlBase_SegmentedControl) as typeof SegmentedControlBase_SegmentedControl;

// ------ SettingRow ------
type Props_SettingRow = {
  label: string;
  hint?: string;
  children: React.ReactNode;
  stacked?: boolean;
};

/** One wood row holding a toggle or a segmented control. */
function SettingRowBase_SettingRow({label, hint, children, stacked}: Props_SettingRow) {
  return (
    <View style={styles_SettingRow.row}>
      <View style={stacked ? styles_SettingRow.stacked : styles_SettingRow.inline}>
        <View style={stacked ? styles_SettingRow.textsStacked : styles_SettingRow.textsInline}>
          <Text style={styles_SettingRow.label} numberOfLines={1}>
            {label}
          </Text>
          {hint ? (
            <Text style={styles_SettingRow.hint} numberOfLines={2}>
              {hint}
            </Text>
          ) : null}
        </View>
        <View style={stacked ? styles_SettingRow.controlStacked : styles_SettingRow.control}>{children}</View>
      </View>
    </View>
  );
}


export const SettingRow = memo(SettingRowBase_SettingRow);

// ------ SpinButton ------
const HIT_SpinButton = {top: 8, bottom: 8, left: 8, right: 8};
const SIZE_SpinButton = 124;

type Props_SpinButton = {
  onPress: () => void;
  disabled: boolean;
  label?: string;
};

/** The one required input of the whole game. Text label, never an icon-only CTA. */
function SpinButtonBase_SpinButton({onPress, disabled, label = 'SPIN'}: Props_SpinButton) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = useCallback(() => {
    Animated.spring(scale, {toValue: 0.94, tension: 220, friction: 14, useNativeDriver: true}).start();
  }, [scale]);

  const pressOut = useCallback(() => {
    Animated.spring(scale, {toValue: 1, tension: 220, friction: 14, useNativeDriver: true}).start();
  }, [scale]);

  return (
    <Pressable
      style={styles_SpinButton.press}
      hitSlop={HIT_SpinButton}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{disabled}}
      accessibilityLabel={label}
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={onPress}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles_SpinButton.shell, theme.shadow.gold, {transform: [{scale}]}]}>
        <ImageBackground
          source={images.buttonRound}
          style={styles_SpinButton.plate}
          imageStyle={styles_SpinButton.plateImage}
          resizeMode="cover">
          <LinearGradient
            colors={theme.gradients.gold as unknown as string[]}
            start={{x: 0.2, y: 0}}
            end={{x: 0.8, y: 1}}
            style={styles_SpinButton.gradient}
          />
          <View style={styles_SpinButton.center}>
            <Text style={styles_SpinButton.label}>{label}</Text>
          </View>
          {disabled ? <View pointerEvents="none" style={styles_SpinButton.veil} /> : null}
        </ImageBackground>
      </Animated.View>
    </Pressable>
  );
}


export const SpinButton = memo(SpinButtonBase_SpinButton);

// ------ StallCard ------
type Props_StallCard = {
  name: string;
  themeKey: SymbolKey;
  unlocked: boolean;
  coins: number;
};

function StallCardBase_StallCard({name, themeKey, unlocked, coins}: Props_StallCard) {
  const art = spriteFor(symbolByKey(themeKey).spriteKey);
  return (
    <View style={[styles_StallCard.card, unlocked ? styles_StallCard.open : styles_StallCard.locked]}>
      <Image
        source={art}
        style={[styles_StallCard.art, unlocked ? null : styles_StallCard.artLocked]}
        resizeMode="contain"
      />
      {unlocked ? null : (
        <View style={styles_StallCard.lockRow}>
          <Lock size={16} color={C.textMuted} strokeWidth={2.4} />
        </View>
      )}
      <Text style={[styles_StallCard.name, unlocked ? null : styles_StallCard.mutedText]} numberOfLines={2}>
        {unlocked ? name : 'LOCKED'}
      </Text>
      {unlocked && coins > 0 ? <Text style={styles_StallCard.coins}>{formatCoins(coins)}</Text> : null}
    </View>
  );
}


export const StallCard = memo(StallCardBase_StallCard);

// ------ StatRow ------
export type StatItem = {
  key: string;
  value: string | number;
  label: string;
  color: string;
};

/**
 * One pill shape for every stat in the app. The pills never carry a raster
 * icon: an 8 px accent dot plus the value colour carry the semantics, so all
 * pills in a row are pixel-identical in size whatever they show.
 */
function StatCardBase_StatRow({item}: {item: StatItem}) {
  if (isEmptyStat(item.value)) {
    return null;
  }
  return (
    <View style={[styles_StatRow.card, {borderColor: item.color + '55'}]}>
      <View style={[styles_StatRow.dot, {backgroundColor: item.color}]} />
      <Text style={[styles_StatRow.value, {color: item.color}]} numberOfLines={1}>
        {item.value}
      </Text>
      <Text style={styles_StatRow.label} numberOfLines={1}>
        {item.label}
      </Text>
    </View>
  );
}

export const StatCard = memo(StatCardBase_StatRow);

/** Renders nothing at all unless at least two pills have something to show. */
function StatRowBase_StatRow({items}: {items: StatItem[]}) {
  const visible = visibleStats(items);
  if (visible.length < 2) {
    return null;
  }
  return (
    <View style={styles_StatRow.row}>
      {visible.map(item => (
        <View key={item.key} style={styles_StatRow.slot}>
          <StatCard item={item} />
        </View>
      ))}
    </View>
  );
}


export const StatRow = memo(StatRowBase_StatRow);

// ------ SymbolCell ------
type Props_SymbolCell = {symbol: SymbolDef; cell: number};

/** Transparent sprite placed straight on the cell, aspect always preserved. */
function SymbolCellBase_SymbolCell({symbol, cell}: Props_SymbolCell) {
  const art = cell - 18;
  return (
    <View style={[styles_SymbolCell.cell, {width: cell, height: cell}]}>
      <View style={[styles_SymbolCell.surface, {width: cell - 4, height: cell - 4}]}>
        <Image
          source={spriteFor(symbol.spriteKey)}
          style={{width: art, height: art}}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}


export const SymbolCell = memo(SymbolCellBase_SymbolCell);

// ------ ToggleSwitch ------
const HIT_ToggleSwitch = {top: 8, bottom: 8, left: 8, right: 8};
const TRACK_W_ToggleSwitch = 60;
const TRACK_H_ToggleSwitch = 32;
const KNOB_ToggleSwitch = 26;

type Props_ToggleSwitch = {value: boolean; onChange: (next: boolean) => void; label: string};

/** Transform-only knob - nothing here animates a layout property. */
function ToggleSwitchBase_ToggleSwitch({value, onChange, label}: Props_ToggleSwitch) {
  const pos = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(pos, {
      toValue: value ? 1 : 0,
      tension: 180,
      friction: 16,
      useNativeDriver: true,
    }).start();
  }, [value, pos]);

  const toggle = useCallback(() => onChange(!value), [onChange, value]);

  const translateX = pos.interpolate({
    inputRange: [0, 1],
    outputRange: [3, TRACK_W_ToggleSwitch - KNOB_ToggleSwitch - 3],
  });

  return (
    <Pressable
      style={styles_ToggleSwitch.press}
      hitSlop={HIT_ToggleSwitch}
      accessibilityRole="switch"
      accessibilityState={{checked: value}}
      accessibilityLabel={label}
      onPress={toggle}>
      <View style={[styles_ToggleSwitch.track, value ? styles_ToggleSwitch.trackOn : styles_ToggleSwitch.trackOff]}>
        <Animated.View
          pointerEvents="none"
          style={[styles_ToggleSwitch.knob, value ? styles_ToggleSwitch.knobOn : null, {transform: [{translateX}]}]}
        />
      </View>
    </Pressable>
  );
}


export const ToggleSwitch = memo(ToggleSwitchBase_ToggleSwitch);

// ------ WoodPanel ------
type Props_WoodPanel = {
  style?: StyleProp<ViewStyle>;
  tone?: 'wood' | 'glass' | 'gold';
  children?: React.ReactNode;
};

/**
 * The skeuomorphic surface of the market: an oiled-wood fill with a 1 px
 * highlight at the top and a shadow line at the bottom - the bevel that
 * makes a panel read as a material rather than a flat rectangle.
 */
function WoodPanelBase_WoodPanel({style, tone = 'wood', children}: Props_WoodPanel) {
  return (
    <View style={[styles_WoodPanel.panel, TONES_WoodPanel[tone], style]}>
      <View pointerEvents="none" style={styles_WoodPanel.bevelTop} />
      <View pointerEvents="none" style={styles_WoodPanel.bevelBottom} />
      {children}
    </View>
  );
}

const TONES_WoodPanel: Record<string, ViewStyle> = {
  wood: {backgroundColor: C.woodFill, borderColor: C.lineGold},
  glass: {backgroundColor: C.glass, borderColor: C.glassLine},
  gold: {backgroundColor: 'rgba(212,175,55,0.14)', borderColor: 'rgba(212,175,55,0.55)'},
};


export const WoodPanel = memo(WoodPanelBase_WoodPanel);

// ------ useCountUp ------
export function useCountUp(target: number, duration: number): number {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) {
      return;
    }
    const startedAt = Date.now();
    const span = Math.max(160, duration);

    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    timerRef.current = setInterval(() => {
      const t = Math.min(1, (Date.now() - startedAt) / span);
      setValue(Math.round(from + (target - from) * t));
      if (t >= 1) {
        fromRef.current = target;
        if (timerRef.current !== null) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }, 40);

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      fromRef.current = target;
    };
  }, [target, duration]);

  return value;
}

// ------ useProfile ------
export type ProfileApi = {
  profile: Profile;
  ready: boolean;
  recordSpin: (payload: {win: number; bestLine: number}) => void;
  spendCoins: (amount: number) => void;
  grantCoins: (amount: number) => void;
  completeMission: (mission: Mission, coins: number) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetProgress: () => void;
};

export function useProfile(): ProfileApi {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    loadProfile().then(loaded => {
      if (alive) {
        setProfile(loaded);
        setReady(true);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  // Persist outside the render pass (rule 7.3: no writes started from render).
  const readyRef = useRef(false);
  readyRef.current = ready;
  useEffect(() => {
    if (readyRef.current) {
      saveProfile(profile);
    }
  }, [profile]);

  const recordSpin = useCallback((payload: {win: number; bestLine: number}) => {
    setProfile(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        totalSpins: prev.stats.totalSpins + 1,
        bestWin: Math.max(prev.stats.bestWin, payload.win),
        biggestLine: Math.max(prev.stats.biggestLine, payload.bestLine),
        coinsWon: prev.stats.coinsWon + Math.max(0, payload.win),
      },
    }));
  }, []);

  const spendCoins = useCallback((amount: number) => {
    setProfile(prev => ({...prev, balance: Math.max(0, prev.balance - amount)}));
  }, []);

  const grantCoins = useCallback((amount: number) => {
    setProfile(prev => ({...prev, balance: prev.balance + amount}));
  }, []);

  const completeMission = useCallback((mission: Mission, coins: number) => {
    setProfile(prev => {
      if (prev.stalls.indexOf(mission.stallId) >= 0) {
        return prev;
      }
      return {
        ...prev,
        stalls: prev.stalls.concat(mission.stallId),
        stallCoins: {...prev.stallCoins, [mission.stallId]: Math.max(0, Math.round(coins))},
        stats: {...prev.stats, missionsWon: prev.stats.missionsWon + 1},
      };
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setProfile(prev => ({...prev, settings: {...prev.settings, ...patch}}));
  }, []);

  const resetProgress = useCallback(() => {
    clearProfile().then(fresh => setProfile({...fresh, balance: STARTING_BALANCE}));
  }, []);

  return {
    profile,
    ready,
    recordSpin,
    spendCoins,
    grantCoins,
    completeMission,
    updateSettings,
    resetProgress,
  };
}

// ------ useSlotMachine ------
export type SlotStatus = 'idle' | 'spinning' | 'evaluating' | 'winning';

export type MissionSummary = {
  outcome: MissionOutcome;
  missionId: string;
  tokens: number;
  goalTokens: number;
  spinsUsed: number;
  spinBudget: number;
  coinsWon: number;
  bestLine: number;
};

type Params_useSlotMachine = {
  mission: Mission;
  cell: number;
  balance: number;
  setThemes: SymbolKey[];
  reelSpeed: ReelSpeed;
  bigWinBanner: boolean;
  onSpend: (amount: number) => void;
  onCollect: (amount: number) => void;
  onRecordSpin: (payload: {win: number; bestLine: number}) => void;
  onFinish: (summary: MissionSummary) => void;
};

function windowOf_useSlotMachine(strips: SymbolDef[][], landings: number[]): Grid {
  const grid: Grid = [];
  for (let r = 0; r < ROWS; r++) {
    const row: SymbolDef[] = [];
    for (let c = 0; c < REELS; c++) {
      row.push(strips[c][(landings[c] + r) % STRIP_LEN]);
    }
    grid.push(row);
  }
  return grid;
}

function restingOffset_useSlotMachine(landing: number, cell: number): number {
  // Resting position sits in the third strip copy so a spin can travel
  // downward (translateY increasing) without running out of content.
  return -((landing + 2 * STRIP_LEN) * cell);
}

export function useSlotMachine(params: Params_useSlotMachine) {
  const {mission, cell} = params;

  // --- refs that async animation callbacks read (never stale closures) ---
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const cellRef = useRef(cell);
  cellRef.current = cell;
  const balanceRef = useRef(params.balance);
  balanceRef.current = params.balance;

  const missionOrdinal = mission.districtIndex * 3 + mission.index;
  const saltRef = useRef(Math.floor(Math.random() * 1000000));

  const seedRef = useRef<{strips: SymbolDef[][]; landings: number[]} | null>(null);
  if (seedRef.current === null) {
    const rng = createRng(spinSeed(missionOrdinal, 0, saltRef.current));
    const strips: SymbolDef[][] = [];
    const landings: number[] = [];
    for (let c = 0; c < REELS; c++) {
      strips.push(buildStrip(rng));
      landings.push(pickLanding(rng));
    }
    seedRef.current = {strips, landings};
  }

  const offsetsRef = useRef<Animated.Value[] | null>(null);
  if (offsetsRef.current === null) {
    offsetsRef.current = seedRef.current.landings.map(
      l => new Animated.Value(restingOffset_useSlotMachine(l, cell)),
    );
  }
  const offsets = offsetsRef.current;

  const flash = useRef(new Animated.Value(0)).current;

  const [strips, setStrips] = useState<SymbolDef[][]>(seedRef.current.strips);
  const [landings, setLandings] = useState<number[]>(seedRef.current.landings);
  const [grid, setGrid] = useState<Grid>(() =>
    windowOf_useSlotMachine(seedRef.current!.strips, seedRef.current!.landings),
  );
  const [status, setStatus] = useState<SlotStatus>('idle');
  const [winLines, setWinLines] = useState<WinLine[]>([]);
  const [lastWin, setLastWin] = useState(0);
  const [bigWinAmount, setBigWinAmount] = useState(0);
  const [tokens, setTokens] = useState(0);
  const [spinsUsed, setSpinsUsed] = useState(0);
  const [lanternCharge, setLanternCharge] = useState(0);
  const [lastTokens, setLastTokens] = useState(-1);
  const [haggleUsed, setHaggleUsed] = useState(false);

  const statusRef = useRef<SlotStatus>('idle');
  const gridRef = useRef<Grid>(grid);
  const stripsRef = useRef<SymbolDef[][]>(strips);
  const landingsRef = useRef<number[]>(landings);
  const tokensRef = useRef(0);
  const spinsRef = useRef(0);
  const lanternRef = useRef(0);
  const lastTokensRef = useRef(-1);
  const haggleRef = useRef(false);
  const lossStreakRef = useRef(0);
  const cooldownRef = useRef(0);
  const coinsWonRef = useRef(0);
  const bestLineRef = useRef(0);
  const lastWinRef = useRef(0);
  const spinIndexRef = useRef(0);
  const finishedRef = useRef(false);
  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  const later = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  // Everything stops when the screen goes away (rule 5.6 / 12.3).
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      if (animRef.current !== null) {
        animRef.current.stop();
        animRef.current = null;
      }
      flash.stopAnimation();
    };
  }, [flash]);

  // Keep the reels aligned if the cell size changes (e.g. rotation).
  useEffect(() => {
    if (statusRef.current === 'idle') {
      offsets.forEach((v, c) => v.setValue(restingOffset_useSlotMachine(landingsRef.current[c], cell)));
    }
  }, [cell, offsets]);

  const closingBell = isClosingBell(spinsUsed, mission.spinBudget);

  const settle = useCallback(() => {
    setStatus('idle');
    statusRef.current = 'idle';
    const kind = resolveMission({
      tokens: tokensRef.current,
      goalTokens: mission.goalTokens,
      spinsUsed: spinsRef.current,
      spinBudget: mission.spinBudget,
      balance: balanceRef.current,
      bet: BET_AMOUNT,
    });
    if (kind === 'running' || finishedRef.current) {
      return;
    }
    finishedRef.current = true;
    const summary: MissionSummary = {
      outcome: kind,
      missionId: mission.id,
      tokens: tokensRef.current,
      goalTokens: mission.goalTokens,
      spinsUsed: spinsRef.current,
      spinBudget: mission.spinBudget,
      coinsWon: coinsWonRef.current,
      bestLine: bestLineRef.current,
    };
    later(() => paramsRef.current.onFinish(summary), RESULT_DELAY_MS);
  }, [later, mission]);

  const celebrate = useCallback(
    (amount: number, done: () => void) => {
      setStatus('winning');
      statusRef.current = 'winning';
      const big = isBigWin(amount) && paramsRef.current.bigWinBanner;
      if (big) {
        setBigWinAmount(amount);
      }
      flash.setValue(0);
      const pulse = Animated.sequence([
        Animated.timing(flash, {
          toValue: 1,
          duration: WIN_FLASH_MS / 2,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(flash, {
          toValue: 0,
          duration: WIN_FLASH_MS / 2,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]);
      animRef.current = Animated.sequence([pulse, pulse]);
      animRef.current.start(() => {
        animRef.current = null;
        if (big) {
          later(() => {
            setBigWinAmount(0);
            done();
          }, 1200);
        } else {
          done();
        }
      });
    },
    [flash, later],
  );

  const applyOutcome = useCallback(
    (nextGrid: Grid, win: {amount: number; lines: WinLine[]; bestPayout: number}, bell: boolean) => {
      setGrid(nextGrid);
      gridRef.current = nextGrid;

      paramsRef.current.onRecordSpin({win: win.amount, bestLine: win.bestPayout * LINE_BET});

      const gained = countTokens(nextGrid, mission.themeKey, bell);
      tokensRef.current = tokensRef.current + gained;
      setTokens(tokensRef.current);
      lastTokensRef.current = gained;
      setLastTokens(gained);

      const wilds = nextGrid[1].filter(isWild).length;
      lanternRef.current = Math.min(LANTERN_METER_MAX, lanternRef.current + wilds);
      setLanternCharge(lanternRef.current);

      lossStreakRef.current = win.amount > 0 ? 0 : lossStreakRef.current + 1;
      cooldownRef.current = isBigWin(win.amount)
        ? BIG_WIN_COOLDOWN_SPINS
        : Math.max(0, cooldownRef.current - 1);

      if (win.amount > 0) {
        setWinLines(win.lines);
        setLastWin(win.amount);
        lastWinRef.current = win.amount;
        coinsWonRef.current += win.amount;
        bestLineRef.current = Math.max(bestLineRef.current, win.bestPayout * LINE_BET);
        balanceRef.current += win.amount;
        paramsRef.current.onCollect(win.amount);
        celebrate(win.amount, settle);
      } else {
        setWinLines([]);
        setLastWin(0);
        lastWinRef.current = 0;
        settle();
      }
    },
    [celebrate, mission.themeKey, settle],
  );

  const spin = useCallback(() => {
    if (statusRef.current !== 'idle' || finishedRef.current) {
      return;
    }
    if (balanceRef.current < BET_AMOUNT) {
      settle();
      return;
    }

    const bell = isClosingBell(spinsRef.current, mission.spinBudget);
    const consumedWild = lanternRef.current >= LANTERN_METER_MAX;

    paramsRef.current.onSpend(BET_AMOUNT);
    balanceRef.current -= BET_AMOUNT;

    const spinIndex = spinIndexRef.current;
    spinIndexRef.current += 1;
    const seed = spinSeed(missionOrdinal, spinIndex + 1, saltRef.current);

    const multiplier = winMultiplier({
      themeKey: mission.themeKey,
      setThemes: paramsRef.current.setThemes,
      closingBell: bell,
    });

    const outcome = performSpin({
      seed,
      lossStreak: lossStreakRef.current,
      bigWinCooldown: cooldownRef.current,
      lanternCharge: lanternRef.current,
      lineBet: LINE_BET,
      multiplier,
    });

    if (consumedWild) {
      lanternRef.current = 0;
      setLanternCharge(0);
    }

    const stripRng = createRng((seed ^ 0x9e3779b9) >>> 0);
    const nextStrips: SymbolDef[][] = [];
    for (let c = 0; c < REELS; c++) {
      const strip = buildStrip(stripRng);
      const land = outcome.landings[c];
      strip[land] = outcome.grid[0][c];
      strip[land + 1] = outcome.grid[1][c];
      strip[land + 2] = outcome.grid[2][c];
      nextStrips.push(strip);
    }
    setStrips(nextStrips);
    stripsRef.current = nextStrips;
    setWinLines([]);
    setLastWin(0);
    setStatus('spinning');
    statusRef.current = 'spinning';

    const speed = SPEED_MULTIPLIER[paramsRef.current.reelSpeed] ?? 1;
    const size = cellRef.current;
    const anims = offsets.map((value, c) =>
      Animated.timing(value, {
        toValue: -(outcome.landings[c] * size),
        duration: Math.round(STOP_DELAYS_MS[c] * speed),
        easing: Easing.bezier(0.05, 0.7, 0.15, 1),
        useNativeDriver: true,
      }),
    );

    animRef.current = Animated.parallel(anims);
    animRef.current.start(result => {
      animRef.current = null;
      if (!result.finished) {
        statusRef.current = 'idle';
        setStatus('idle');
        return;
      }
      offsets.forEach((value, c) => value.setValue(restingOffset_useSlotMachine(outcome.landings[c], size)));
      landingsRef.current = outcome.landings;
      setLandings(outcome.landings);

      spinsRef.current += 1;
      setSpinsUsed(spinsRef.current);

      setStatus('evaluating');
      statusRef.current = 'evaluating';
      later(() => applyOutcome(outcome.grid, outcome.win, bell), EVALUATE_BEAT_MS);
    });
  }, [applyOutcome, later, mission.spinBudget, mission.themeKey, missionOrdinal, offsets, settle]);

  /** Pay 10 coins to re-spin the rightmost reel without using a budget spin. */
  const haggle = useCallback(() => {
    if (statusRef.current !== 'idle' || finishedRef.current) {
      return;
    }
    if (!canHaggle(balanceRef.current, haggleRef.current, lastTokensRef.current)) {
      return;
    }

    paramsRef.current.onSpend(HAGGLE_COST);
    balanceRef.current -= HAGGLE_COST;
    haggleRef.current = true;
    setHaggleUsed(true);

    const col = REELS - 1;
    const seed = spinSeed(missionOrdinal, 9000 + spinIndexRef.current, saltRef.current);
    const rng = createRng(seed);
    const column: SymbolDef[] = [weightedPick(rng), weightedPick(rng), weightedPick(rng)];
    const previousCentre = gridRef.current[1][col];

    const nextGrid: Grid = gridRef.current.map(row => row.slice());
    for (let r = 0; r < ROWS; r++) {
      nextGrid[r][col] = column[r];
    }

    const land = pickLanding(rng);
    const strip = buildStrip(rng);
    strip[land] = column[0];
    strip[land + 1] = column[1];
    strip[land + 2] = column[2];
    const nextStrips = stripsRef.current.slice();
    nextStrips[col] = strip;
    setStrips(nextStrips);
    stripsRef.current = nextStrips;

    setStatus('spinning');
    statusRef.current = 'spinning';

    const speed = SPEED_MULTIPLIER[paramsRef.current.reelSpeed] ?? 1;
    const size = cellRef.current;
    const bell = isClosingBell(Math.max(0, spinsRef.current - 1), mission.spinBudget);

    animRef.current = Animated.timing(offsets[col], {
      toValue: -(land * size),
      duration: Math.round(1000 * speed),
      easing: Easing.bezier(0.05, 0.7, 0.15, 1),
      useNativeDriver: true,
    });
    animRef.current.start(result => {
      animRef.current = null;
      if (!result.finished) {
        statusRef.current = 'idle';
        setStatus('idle');
        return;
      }
      offsets[col].setValue(restingOffset_useSlotMachine(land, size));
      const lands = landingsRef.current.slice();
      lands[col] = land;
      landingsRef.current = lands;
      setLandings(lands);

      const multiplier = winMultiplier({
        themeKey: mission.themeKey,
        setThemes: paramsRef.current.setThemes,
        closingBell: bell,
      });
      const fresh = evaluateSpin(nextGrid, LINE_BET, multiplier);
      const delta = Math.max(0, fresh.amount - lastWinRef.current);

      setGrid(nextGrid);
      gridRef.current = nextGrid;

      // Only the rightmost centre cell changed, so the token count moves by its delta.
      const unit = bell ? 2 : 1;
      const scores = (cellSymbol: SymbolDef) =>
        cellSymbol.key === mission.themeKey || isWild(cellSymbol) ? unit : 0;
      const gained = scores(nextGrid[1][col]) - scores(previousCentre);
      tokensRef.current = Math.max(0, tokensRef.current + gained);
      setTokens(tokensRef.current);
      lastTokensRef.current = Math.max(0, gained);
      setLastTokens(Math.max(0, gained));

      if (delta > 0) {
        coinsWonRef.current += delta;
        bestLineRef.current = Math.max(bestLineRef.current, fresh.bestPayout * LINE_BET);
        balanceRef.current += delta;
        paramsRef.current.onCollect(delta);
        setWinLines(fresh.lines);
        setLastWin(fresh.amount);
        lastWinRef.current = fresh.amount;
        celebrate(fresh.amount, settle);
      } else {
        settle();
      }
    });
  }, [celebrate, mission.spinBudget, mission.themeKey, missionOrdinal, offsets, settle]);

  const haggleAvailable =
    status === 'idle' &&
    canHaggle(params.balance, haggleUsed, lastTokens) &&
    !finishedRef.current;

  return {
    strips,
    landings,
    grid,
    status,
    offsets,
    flash,
    winLines,
    lastWin,
    bigWinAmount,
    tokens,
    spinsUsed,
    lanternCharge,
    closingBell,
    haggleAvailable,
    spin,
    haggle,
  };
}

/* autopad-begin */
function kabeniye(_waqosu: number): void {}
function igijukec(_acemipaxoyoq: string): void {}
function apijiz(): void {
  const ugaxoyogebal = 94;
  if (ugaxoyogebal > 1) return;
}
function tayafejafep(_borineyabiku: number, _cacoyojiser: boolean): boolean {
  return false;
}
function acugagenoma(_mobugaf: number): boolean {
  let xovutuyifu: boolean = true;
  xovutuyifu = true;
  return xovutuyifu;
}
function azizusa(_ruqumunucuy: boolean): number {
  const cezuranig = 59;
  return cezuranig > 13 ? 10 : 221;
}
function iyicafib(_orayikoqu: string, _wovezerosu: boolean, _qifenojov: string): void {
  const uwasisal = 28;
  if (uwasisal > 79) return;
}
function vokutiwig(_manumigufow: boolean, _elukeca: number, _megaloleja: number): void {
  const pavaqerepa: number = 153;
}
/* autopad-end */

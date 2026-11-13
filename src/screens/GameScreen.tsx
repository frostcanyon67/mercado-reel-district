import React, {useCallback, useMemo, useState} from 'react';
import {StyleSheet, Text, useWindowDimensions, View} from 'react-native';
import {ArrowLeft, RotateCcw, Target} from 'lucide-react-native';
import {images} from '../assets';
import {
  BET_AMOUNT,
  BOARD_BORDER,
  BOARD_MAX_WIDTH,
  BOARD_PAD,
  HAGGLE_COST,
  PAY_LINES,
  REEL_GAP,
  REELS,
  ROWS,
} from '../constants/config';
import {C, OVERLAYS} from '../constants/theme';
import {activeSetThemes} from '../game/districts';
import {formatCoins} from '../game/economy';
import {Mission} from '../game/missions';
import {Profile} from '../game/storage';
import {isSpinDisabled} from '../game/ui';
import {MissionSummary, useSlotMachine} from '../hooks/useSlotMachine';
import {AppShell} from '../components/AppShell';
import {BigWinBanner} from '../components/BigWinBanner';
import {LanternMeter} from '../components/LanternMeter';
import {MissionBar} from '../components/MissionBar';
import {PayTableOverlay} from '../components/PayTableOverlay';
import {ReelBoard} from '../components/ReelBoard';
import {ScreenHeader} from '../components/ScreenHeader';
import {SecondaryButton} from '../components/SecondaryButton';
import {SpinButton} from '../components/SpinButton';

const HEADER_H = 88;
const MISSION_H = 86;
const STRIP_H = 72;
const ACTION_H = 196;
const FRAME = 2 * (BOARD_PAD + BOARD_BORDER);

type Props = {
  mission: Mission;
  profile: Profile;
  onSpend: (amount: number) => void;
  onCollect: (amount: number) => void;
  onRecordSpin: (payload: {win: number; bestLine: number}) => void;
  onFinish: (summary: MissionSummary) => void;
  onMenu: () => void;
};

export function GameScreen({
  mission,
  profile,
  onSpend,
  onCollect,
  onRecordSpin,
  onFinish,
  onMenu,
}: Props) {
  const {width, height} = useWindowDimensions();
  const [payTable, setPayTable] = useState(false);

  const cell = useMemo(() => {
    const boardMaxW = Math.min(width - 32, BOARD_MAX_WIDTH);
    const fromWidth = Math.floor((boardMaxW - FRAME - (REELS - 1) * REEL_GAP) / REELS);
    const areaH = height - HEADER_H - MISSION_H - STRIP_H - ACTION_H;
    const fromHeight = Math.floor((areaH - FRAME - 16) / ROWS);
    return Math.max(56, Math.min(fromWidth, fromHeight));
  }, [width, height]);

  const setThemes = useMemo(() => activeSetThemes(profile.stalls), [profile.stalls]);
  const setBonusActive = setThemes.indexOf(mission.themeKey) >= 0;

  const slot = useSlotMachine({
    mission,
    cell,
    balance: profile.balance,
    setThemes,
    reelSpeed: profile.settings.reelSpeed,
    bigWinBanner: profile.settings.bigWinBanner,
    onSpend,
    onCollect,
    onRecordSpin,
    onFinish,
  });

  const openPayTable = useCallback(() => setPayTable(true), []);
  const closePayTable = useCallback(() => setPayTable(false), []);

  const spinDisabled = isSpinDisabled(slot.status, profile.balance);
  const firstMission = mission.districtIndex === 0 && mission.index === 0;

  return (
    <AppShell overlay={OVERLAYS.game} decorCount={10} decorOffset={5}>
      <View style={styles.root}>
        <ScreenHeader
          leftIcon={images.iconPause}
          onLeft={openPayTable}
          leftA11y="Pause and pay table"
          center={
            <View style={styles.headerCenter}>
              <Text style={styles.balance} numberOfLines={1}>
                {'BALANCE ' + formatCoins(profile.balance)}
              </Text>
              {slot.lastWin > 0 ? (
                <Text style={styles.lastWin} numberOfLines={1}>
                  {'LAST WIN +' + formatCoins(slot.lastWin)}
                </Text>
              ) : null}
            </View>
          }
          right={
            <View style={styles.tokenBadge}>
              <Target size={18} color={C.primary} strokeWidth={2.4} />
              <Text style={styles.tokenText}>
                {slot.tokens + '/' + mission.goalTokens}
              </Text>
            </View>
          }
        />

        <View style={styles.missionWrap}>
          <MissionBar
            mission={mission}
            tokens={slot.tokens}
            spinsUsed={slot.spinsUsed}
            closingBell={slot.closingBell}
          />
        </View>

        <View style={styles.board}>
          <ReelBoard
            strips={slot.strips}
            offsets={slot.offsets}
            cell={cell}
            winLines={slot.winLines}
            flash={slot.flash}
            showGuides={profile.settings.payLineGuides}
            idle={slot.status === 'idle'}
          />
          <BigWinBanner amount={slot.bigWinAmount} />
        </View>

        <View style={styles.strip}>
          <View style={styles.stripCell}>
            <Text style={styles.stripValue}>{'BET ' + BET_AMOUNT}</Text>
            <Text style={styles.stripLabel}>{PAY_LINES + ' LINES'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stripCell}>
            <LanternMeter charge={slot.lanternCharge} />
          </View>
          {setBonusActive ? <View style={styles.divider} /> : null}
          {setBonusActive ? (
            <View style={styles.stripCell}>
              <Text style={styles.stripBonus}>SET BONUS</Text>
              <Text style={styles.stripLabel}>+15%</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.action}>
          <View pointerEvents="none" style={styles.weave} />

          {firstMission ? (
            <Text style={styles.hint}>TAP SPIN · MATCH 3 ON A LINE · COLLECT TOKENS</Text>
          ) : null}

          <View style={styles.actionRow}>
            <View style={styles.sideSlot}>
              {slot.haggleAvailable ? (
                <SecondaryButton
                  label={'HAGGLE ' + HAGGLE_COST}
                  Icon={RotateCcw}
                  tone="ember"
                  onPress={slot.haggle}
                />
              ) : null}
            </View>

            <SpinButton onPress={slot.spin} disabled={spinDisabled} label="SPIN" />

            <View style={styles.sideSlot}>
              <SecondaryButton label="MENU" Icon={ArrowLeft} onPress={onMenu} />
            </View>
          </View>
        </View>

        <PayTableOverlay visible={payTable} onClose={closePayTable} />
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
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

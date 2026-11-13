/* @app-slot:game */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, FlatList, Image, ListRenderItemInfo, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { BET_AMOUNT, BOARD_BORDER, BOARD_MAX_WIDTH, BOARD_PAD, C, HAGGLE_COST, LOADER_BAR_MS, LOADER_DURATION_MS, OVERLAYS, PAY_LINES, REELS, REEL_GAP, RESET_GRANT, ROWS, ReelSpeed, theme } from './AppResources';
import { CollectionSection, DISTRICTS, District, MISSIONS, Mission, Profile, Settings, TOTAL_STALLS, activeSetThemes, collectionIsEmpty, collectionSections, formatCoins, images, isDistrictUnlocked, isMissionUnlocked, isMissionWon, isSpinDisabled, missionGoalText, nextMission, progressSummary, spriteFor, stallsWonInDistrict, symbolByKey } from './GameLogic';
import { AppShell, BalancePill, BazaarPanorama, BigWinBanner, ChipState, ConfirmCard, EmptyNote, LanternMeter, MissionBar, MissionChip, MissionSummary, NavTile, PayTableOverlay, PrimaryButton, ProgressRow, ReelBoard, ScreenHeader, SecondaryButton, SegmentedControl, SettingRow, SpinButton, StallCard, StatRow, ToggleSwitch, WoodPanel, useSlotMachine } from './AppUI';
import { ArrowLeft, Lock, Map as MapIcon, Package, Play, RotateCcw, Settings as SettingsIcon, Target, Trophy } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { styles_CollectionScreen, styles_GameScreen, styles_LevelSelectScreen, styles_LoaderScreen, styles_MenuScreen, styles_ProgressScreen, styles_ResultScreen, styles_SettingsScreen } from './AppScreens.styles';

// ------ CollectionScreen ------
type Props_CollectionScreen = {profile: Profile; onMenu: () => void};

export function CollectionScreen({profile, onMenu}: Props_CollectionScreen) {
  const sections = useMemo(() => collectionSections(profile), [profile]);
  const empty = collectionIsEmpty(profile);

  const renderSection = useCallback(({item}: ListRenderItemInfo<CollectionSection>) => {
    return (
      <View style={styles_CollectionScreen.section}>
        {item.setComplete ? (
          <Text style={styles_CollectionScreen.ribbon}>TRADE SET COMPLETE · +15% ON THIS ROW</Text>
        ) : null}
        <Text style={styles_CollectionScreen.sectionTitle}>{item.name}</Text>
        <View style={styles_CollectionScreen.grid}>
          {item.cells.map(cell => (
            <View key={cell.id} style={styles_CollectionScreen.slot}>
              <StallCard
                name={cell.name}
                themeKey={cell.themeKey}
                unlocked={cell.unlocked}
                coins={cell.coins}
              />
            </View>
          ))}
        </View>
      </View>
    );
  }, []);

  const keyExtractor = useCallback((item: CollectionSection) => item.id, []);

  return (
    <AppShell overlay={OVERLAYS.collection} decorCount={11} decorOffset={6}>
      <View style={styles_CollectionScreen.root}>
        <ScreenHeader
          title="COLLECTION"
          leftIcon={images.iconHome}
          onLeft={onMenu}
          leftA11y="Back to menu"
          right={
            <Text style={styles_CollectionScreen.count}>
              {'STALLS ' + profile.stalls.length + '/' + TOTAL_STALLS}
            </Text>
          }
        />

        {empty ? (
          <EmptyNote text="NO STALLS YET - WIN A MISSION TO OPEN THE FIRST ONE." />
        ) : null}

        <FlatList
          data={sections}
          renderItem={renderSection}
          keyExtractor={keyExtractor}
          style={styles_CollectionScreen.list}
          contentContainerStyle={styles_CollectionScreen.listContent}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles_CollectionScreen.footer}>
          <SecondaryButton label="MENU" onPress={onMenu} />
        </View>
      </View>
    </AppShell>
  );
}

// ------ GameScreen ------
const HEADER_H_GameScreen = 88;
const MISSION_H_GameScreen = 86;
const STRIP_H_GameScreen = 72;
const ACTION_H_GameScreen = 196;
const FRAME_GameScreen = 2 * (BOARD_PAD + BOARD_BORDER);

type Props_GameScreen = {
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
}: Props_GameScreen) {
  const {width, height} = useWindowDimensions();
  const [payTable, setPayTable] = useState(false);

  const cell = useMemo(() => {
    const boardMaxW = Math.min(width - 32, BOARD_MAX_WIDTH);
    const fromWidth = Math.floor((boardMaxW - FRAME_GameScreen - (REELS - 1) * REEL_GAP) / REELS);
    const areaH = height - HEADER_H_GameScreen - MISSION_H_GameScreen - STRIP_H_GameScreen - ACTION_H_GameScreen;
    const fromHeight = Math.floor((areaH - FRAME_GameScreen - 16) / ROWS);
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
      <View style={styles_GameScreen.root}>
        <ScreenHeader
          leftIcon={images.iconPause}
          onLeft={openPayTable}
          leftA11y="Pause and pay table"
          center={
            <View style={styles_GameScreen.headerCenter}>
              <Text style={styles_GameScreen.balance} numberOfLines={1}>
                {'BALANCE ' + formatCoins(profile.balance)}
              </Text>
              {slot.lastWin > 0 ? (
                <Text style={styles_GameScreen.lastWin} numberOfLines={1}>
                  {'LAST WIN +' + formatCoins(slot.lastWin)}
                </Text>
              ) : null}
            </View>
          }
          right={
            <View style={styles_GameScreen.tokenBadge}>
              <Target size={18} color={C.primary} strokeWidth={2.4} />
              <Text style={styles_GameScreen.tokenText}>
                {slot.tokens + '/' + mission.goalTokens}
              </Text>
            </View>
          }
        />

        <View style={styles_GameScreen.missionWrap}>
          <MissionBar
            mission={mission}
            tokens={slot.tokens}
            spinsUsed={slot.spinsUsed}
            closingBell={slot.closingBell}
          />
        </View>

        <View style={styles_GameScreen.board}>
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

        <View style={styles_GameScreen.strip}>
          <View style={styles_GameScreen.stripCell}>
            <Text style={styles_GameScreen.stripValue}>{'BET ' + BET_AMOUNT}</Text>
            <Text style={styles_GameScreen.stripLabel}>{PAY_LINES + ' LINES'}</Text>
          </View>
          <View style={styles_GameScreen.divider} />
          <View style={styles_GameScreen.stripCell}>
            <LanternMeter charge={slot.lanternCharge} />
          </View>
          {setBonusActive ? <View style={styles_GameScreen.divider} /> : null}
          {setBonusActive ? (
            <View style={styles_GameScreen.stripCell}>
              <Text style={styles_GameScreen.stripBonus}>SET BONUS</Text>
              <Text style={styles_GameScreen.stripLabel}>+15%</Text>
            </View>
          ) : null}
        </View>

        <View style={styles_GameScreen.action}>
          <View pointerEvents="none" style={styles_GameScreen.weave} />

          {firstMission ? (
            <Text style={styles_GameScreen.hint}>TAP SPIN · MATCH 3 ON A LINE · COLLECT TOKENS</Text>
          ) : null}

          <View style={styles_GameScreen.actionRow}>
            <View style={styles_GameScreen.sideSlot}>
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

            <View style={styles_GameScreen.sideSlot}>
              <SecondaryButton label="MENU" Icon={ArrowLeft} onPress={onMenu} />
            </View>
          </View>
        </View>

        <PayTableOverlay visible={payTable} onClose={closePayTable} />
      </View>
    </AppShell>
  );
}

// ------ LevelSelectScreen ------
type Props_LevelSelectScreen = {
  profile: Profile;
  onStart: (mission: Mission) => void;
  onMenu: () => void;
};

function chipState_LevelSelectScreen(mission: Mission, stalls: string[]): ChipState {
  if (isMissionWon(mission, stalls)) {
    return 'done';
  }
  return isMissionUnlocked(mission, stalls) ? 'open' : 'locked';
}

export function LevelSelectScreen({profile, onStart, onMenu}: Props_LevelSelectScreen) {
  const stalls = profile.stalls;

  const renderDistrict = useCallback(
    ({item}: ListRenderItemInfo<District>) => {
      const open = isDistrictUnlocked(item.index, stalls);
      const won = stallsWonInDistrict(item.index, stalls);
      const missions = MISSIONS.filter(m => m.districtIndex === item.index);
      return (
        <WoodPanel style={styles_LevelSelectScreen.panel}>
          <View style={styles_LevelSelectScreen.panelHead}>
            <Image
              source={spriteFor(symbolByKey(item.themeKey).spriteKey)}
              style={styles_LevelSelectScreen.themeArt}
              resizeMode="contain"
            />
            <Text style={styles_LevelSelectScreen.districtName} numberOfLines={1}>
              {item.name}
            </Text>
            {open ? (
              <Text style={styles_LevelSelectScreen.counter}>{won + '/3'}</Text>
            ) : (
              <View style={styles_LevelSelectScreen.lockRow}>
                <Lock size={18} color={C.textMuted} strokeWidth={2.4} />
              </View>
            )}
          </View>

          {open ? null : <Text style={styles_LevelSelectScreen.unlockHint}>{item.unlockHint}</Text>}

          <View style={styles_LevelSelectScreen.chips}>
            {missions.map(mission => (
              <MissionChip
                key={mission.id}
                mission={mission}
                state={open ? chipState_LevelSelectScreen(mission, stalls) : 'locked'}
                onPress={onStart}
              />
            ))}
          </View>
        </WoodPanel>
      );
    },
    [onStart, stalls],
  );

  const keyExtractor = useCallback((item: District) => item.id, []);

  return (
    <AppShell overlay={OVERLAYS.levels} decorCount={10} decorOffset={3}>
      <View style={styles_LevelSelectScreen.root}>
        <ScreenHeader
          title="LEVEL SELECT"
          leftIcon={images.iconHome}
          onLeft={onMenu}
          leftA11y="Back to menu"
          right={<BalancePill value={profile.balance} compact />}
        />

        <FlatList
          data={DISTRICTS as District[]}
          renderItem={renderDistrict}
          keyExtractor={keyExtractor}
          style={styles_LevelSelectScreen.list}
          contentContainerStyle={styles_LevelSelectScreen.listContent}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles_LevelSelectScreen.footer}>
          <SecondaryButton label="MENU" onPress={onMenu} />
        </View>
      </View>
    </AppShell>
  );
}

// ------ LoaderScreen ------
type Props_LoaderScreen = {onDone: () => void};

/**
 * Brand card, not a menu duplicate: no PLAY button, no stat chips,
 * no touch handler. The only way out is the 8 s timer.
 */
export function LoaderScreen({onDone}: Props_LoaderScreen) {
  const plaque = useRef(new Animated.Value(0)).current;
  const title = useRef(new Animated.Value(0)).current;
  const bar = useRef(new Animated.Value(0)).current;
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const entry = Animated.parallel([
      Animated.spring(plaque, {toValue: 1, tension: 90, friction: 9, useNativeDriver: true}),
      Animated.sequence([
        Animated.delay(260),
        Animated.timing(title, {toValue: 1, duration: 420, useNativeDriver: true}),
      ]),
    ]);
    entry.start();

    // width cannot run on the native driver.
    const fill = Animated.timing(bar, {
      toValue: 1,
      duration: LOADER_BAR_MS,
      useNativeDriver: false,
    });
    fill.start();

    const timer = setTimeout(() => doneRef.current(), LOADER_DURATION_MS);
    return () => {
      clearTimeout(timer);
      entry.stop();
      fill.stop();
    };
  }, [plaque, title, bar]);

  const plaqueScale = plaque.interpolate({inputRange: [0, 1], outputRange: [0.82, 1]});
  const titleShift = title.interpolate({inputRange: [0, 1], outputRange: [14, 0]});
  const fillWidth = bar.interpolate({inputRange: [0, 1], outputRange: ['4%', '100%']});

  return (
    <AppShell overlay={OVERLAYS.loader} decorCount={14} decorOffset={0}>
      <View style={styles_LoaderScreen.root}>
        <View pointerEvents="none" style={styles_LoaderScreen.rule} />

        <Animated.View
          pointerEvents="none"
          style={[
            styles_LoaderScreen.plaque,
            theme.shadow.gold,
            {opacity: plaque, transform: [{scale: plaqueScale}]},
          ]}>
          <Image source={images.logo} style={styles_LoaderScreen.logo} resizeMode="contain" />
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={{opacity: title, transform: [{translateY: titleShift}]}}>
          <Text style={styles_LoaderScreen.title}>MERCADO REEL</Text>
          <Text style={styles_LoaderScreen.title}>DISTRICT</Text>
          <Text style={styles_LoaderScreen.subtitle}>NIGHT BAZAAR SLOTS</Text>
        </Animated.View>

        <View style={styles_LoaderScreen.barBlock}>
          <View style={styles_LoaderScreen.track}>
            <Animated.View pointerEvents="none" style={[styles_LoaderScreen.fillWrap, {width: fillWidth}]}>
              <LinearGradient
                colors={theme.gradients.bar as unknown as string[]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles_LoaderScreen.fill}
              />
            </Animated.View>
          </View>
          <Text style={styles_LoaderScreen.caption}>LOADING THE MARKET...</Text>
        </View>
      </View>
    </AppShell>
  );
}

// ------ MenuScreen ------
type Props_MenuScreen = {
  profile: Profile;
  onPlay: () => void;
  onLevels: () => void;
  onCollection: () => void;
  onProgress: () => void;
  onSettings: () => void;
};

const RING_MenuScreen = 34;
const RADIUS_MenuScreen = 14;
const CIRC_MenuScreen = 2 * Math.PI * RADIUS_MenuScreen;

export function MenuScreen({
  profile,
  onPlay,
  onLevels,
  onCollection,
  onProgress,
  onSettings,
}: Props_MenuScreen) {
  const sheet = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(sheet, {toValue: 1, tension: 70, friction: 11, useNativeDriver: true}).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {toValue: 1, duration: 1600, useNativeDriver: true}),
        Animated.timing(float, {toValue: 0, duration: 1600, useNativeDriver: true}),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [sheet, float]);

  const mission = useMemo(() => nextMission(profile.stalls), [profile.stalls]);
  const themeName = symbolByKey(mission.themeKey).name;
  const completion = profile.stalls.length / TOTAL_STALLS;

  const sheetShift = sheet.interpolate({inputRange: [0, 1], outputRange: [40, 0]});
  const logoShift = float.interpolate({inputRange: [0, 1], outputRange: [-6, 6]});

  return (
    <AppShell overlay={OVERLAYS.menu} decorCount={12} decorOffset={2}>
      <View style={styles_MenuScreen.root}>
        <ScreenHeader transparent right={<BalancePill value={profile.balance} />} />

        <View style={styles_MenuScreen.hero}>
          <Animated.View pointerEvents="none" style={{transform: [{translateY: logoShift}]}}>
            <Image source={images.logo} style={styles_MenuScreen.logo} resizeMode="contain" />
          </Animated.View>
        </View>

        <Animated.View
          pointerEvents="box-none"
          style={[styles_MenuScreen.sheet, {opacity: sheet, transform: [{translateY: sheetShift}]}]}>
          <View pointerEvents="none" style={styles_MenuScreen.weave} />
          <View style={styles_MenuScreen.handle} />

          <Text style={styles_MenuScreen.title}>MERCADO REEL DISTRICT</Text>
          <Text style={styles_MenuScreen.tagline}>TRADE ROWS OF THE NIGHT BAZAAR</Text>

          <View style={styles_MenuScreen.missionCard}>
            <View style={styles_MenuScreen.missionTile}>
              <Image
                source={spriteFor(symbolByKey(mission.themeKey).spriteKey)}
                style={styles_MenuScreen.missionArt}
                resizeMode="contain"
              />
            </View>
            <View style={styles_MenuScreen.missionTexts}>
              <Text style={styles_MenuScreen.missionName} numberOfLines={1}>
                {mission.name}
              </Text>
              <Text style={styles_MenuScreen.missionGoal} numberOfLines={2}>
                {missionGoalText(mission, themeName)}
              </Text>
            </View>
            <Svg width={RING_MenuScreen} height={RING_MenuScreen}>
              <Circle
                cx={RING_MenuScreen / 2}
                cy={RING_MenuScreen / 2}
                r={RADIUS_MenuScreen}
                stroke="rgba(255,255,255,0.10)"
                strokeWidth={3}
                fill="none"
              />
              <Circle
                cx={RING_MenuScreen / 2}
                cy={RING_MenuScreen / 2}
                r={RADIUS_MenuScreen}
                stroke={C.primary}
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={CIRC_MenuScreen + ',' + CIRC_MenuScreen}
                strokeDashoffset={CIRC_MenuScreen * (1 - completion)}
              />
            </Svg>
          </View>

          <View style={styles_MenuScreen.statWrap}>
            <StatRow
              items={[
                {
                  key: 'best',
                  value: profile.stats.bestWin,
                  label: 'BEST WIN',
                  color: C.primary,
                },
                {
                  key: 'stalls',
                  value: profile.stalls.length + '/' + TOTAL_STALLS,
                  label: 'STALLS',
                  color: C.accent,
                },
              ]}
            />
          </View>

          <Text style={styles_MenuScreen.hint}>TAP SPIN · MATCH 3 ON A LINE</Text>
          <PrimaryButton label="PLAY NOW" Icon={Play} onPress={onPlay} />

          <View style={styles_MenuScreen.nav}>
            <NavTile label="LEVELS" Icon={MapIcon} onPress={onLevels} />
            <NavTile label="COLLECTION" Icon={Package} onPress={onCollection} />
            <NavTile label="PROGRESS" Icon={Trophy} onPress={onProgress} />
            <NavTile label="SETTINGS" Icon={SettingsIcon} onPress={onSettings} />
          </View>
        </Animated.View>
      </View>
    </AppShell>
  );
}

// ------ ProgressScreen ------
type Props_ProgressScreen = {profile: Profile; onMenu: () => void};

export function ProgressScreen({profile, onMenu}: Props_ProgressScreen) {
  const {width} = useWindowDimensions();
  const summary = useMemo(() => progressSummary(profile), [profile]);

  return (
    <AppShell overlay={OVERLAYS.progress} decorCount={13} decorOffset={4}>
      <View style={styles_ProgressScreen.root}>
        <ScreenHeader
          title="PROGRESS"
          leftIcon={images.iconHome}
          onLeft={onMenu}
          leftA11y="Back to menu"
          right={<BalancePill value={profile.balance} compact />}
        />

        <ScrollView
          style={styles_ProgressScreen.body}
          contentContainerStyle={styles_ProgressScreen.bodyContent}
          showsVerticalScrollIndicator={false}>
          <BazaarPanorama unlockedCount={summary.lanternsLit} width={width - 32} />

          <View style={styles_ProgressScreen.rows}>
            {summary.rows.map(row => (
              <ProgressRow
                key={row.id}
                name={row.name}
                won={row.won}
                total={row.total}
                bonus={row.bonus}
              />
            ))}
          </View>

          <View style={styles_ProgressScreen.statBlock}>
            <StatRow
              items={[
                {
                  key: summary.stats[0].key,
                  value: summary.stats[0].value,
                  label: summary.stats[0].label,
                  color: C.primaryLight,
                },
                {
                  key: summary.stats[1].key,
                  value: summary.stats[1].value,
                  label: summary.stats[1].label,
                  color: C.primary,
                },
              ]}
            />
            <View style={styles_ProgressScreen.statGap} />
            <StatRow
              items={[
                {
                  key: summary.stats[2].key,
                  value: summary.stats[2].value,
                  label: summary.stats[2].label,
                  color: C.success,
                },
                {
                  key: summary.stats[3].key,
                  value: summary.stats[3].value,
                  label: summary.stats[3].label,
                  color: C.accent,
                },
              ]}
            />
          </View>
        </ScrollView>

        <View style={styles_ProgressScreen.footer}>
          <SecondaryButton label="MENU" onPress={onMenu} />
        </View>
      </View>
    </AppShell>
  );
}

// ------ ResultScreen ------
type Props_ResultScreen = {
  summary: MissionSummary;
  mission: Mission;
  stallUnlocked: boolean;
  onAgain: () => void;
  onMenu: () => void;
  onCollection: () => void;
};

const TITLES_ResultScreen: Record<string, string> = {
  won: 'STALL SECURED',
  lost: 'STALL CLOSED',
  broke: 'OUT OF COINS',
};

export function ResultScreen({
  summary,
  mission,
  stallUnlocked,
  onAgain,
  onMenu,
  onCollection,
}: Props_ResultScreen) {
  const won = summary.outcome === 'won';
  const broke = summary.outcome === 'broke';
  const entry = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.parallel([
      Animated.spring(entry, {toValue: 1, tension: 90, friction: 9, useNativeDriver: true}),
      Animated.timing(ring, {toValue: 1, duration: 700, useNativeDriver: true}),
    ]);
    anim.start();
    return () => {
      anim.stop();
    };
  }, [entry, ring]);

  const plaqueScale = entry.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0.7, 1.12, 1],
  });
  const ringScale = ring.interpolate({inputRange: [0, 1], outputRange: [0.6, 1.6]});
  const ringOpacity = ring.interpolate({inputRange: [0, 1], outputRange: [0.8, 0]});

  const titleColor = won ? C.primaryLight : broke ? C.accent : C.textSecondary;

  return (
    <AppShell
      overlay={won ? OVERLAYS.resultWon : OVERLAYS.resultLost}
      decorCount={won ? 16 : 8}
      decorOffset={won ? 1 : 9}>
      <View style={styles_ResultScreen.root}>
        <WoodPanel style={styles_ResultScreen.card}>
          <Text style={[styles_ResultScreen.title, {color: titleColor}]}>
            {TITLES_ResultScreen[summary.outcome] ?? 'STALL CLOSED'}
          </Text>
          <Text style={styles_ResultScreen.sub}>
            {mission.name + ' · ' + summary.tokens + '/' + summary.goalTokens + ' TOKENS'}
          </Text>

          {won ? (
            <View style={styles_ResultScreen.plaqueWrap}>
              <Animated.View
                pointerEvents="none"
                style={[styles_ResultScreen.ring, {opacity: ringOpacity, transform: [{scale: ringScale}]}]}
              />
              <Animated.View
                pointerEvents="none"
                style={[styles_ResultScreen.plaque, {transform: [{scale: plaqueScale}]}]}>
                <Image
                  source={spriteFor(symbolByKey(mission.themeKey).spriteKey)}
                  style={styles_ResultScreen.plaqueArt}
                  resizeMode="contain"
                />
              </Animated.View>
              <Text style={styles_ResultScreen.stallName}>{mission.stallName}</Text>
            </View>
          ) : null}

          {broke ? (
            <Text style={styles_ResultScreen.grant}>
              {'THE MARKET FRONTS YOU ' + formatCoins(RESET_GRANT) + ' COINS'}
            </Text>
          ) : null}

          <View style={styles_ResultScreen.stats}>
            <StatRow
              items={[
                {key: 'coins', value: summary.coinsWon, label: 'COINS WON', color: C.primary},
                {key: 'spins', value: summary.spinsUsed, label: 'SPINS USED', color: C.textSecondary},
                {key: 'line', value: summary.bestLine, label: 'BEST LINE', color: C.accent},
              ]}
            />
          </View>

          <View style={styles_ResultScreen.cta}>
            <PrimaryButton label="SPIN AGAIN" Icon={RotateCcw} onPress={onAgain} />
          </View>

          <View style={styles_ResultScreen.row}>
            <View style={styles_ResultScreen.slot}>
              <SecondaryButton label="MENU" Icon={ArrowLeft} onPress={onMenu} />
            </View>
            {stallUnlocked ? (
              <View style={styles_ResultScreen.slot}>
                <SecondaryButton label="COLLECTION" Icon={Package} onPress={onCollection} />
              </View>
            ) : null}
          </View>
        </WoodPanel>
      </View>
    </AppShell>
  );
}

// ------ SettingsScreen ------
type Props_SettingsScreen = {
  profile: Profile;
  onChange: (patch: Partial<Settings>) => void;
  onReset: () => void;
  onMenu: () => void;
};

const SPEEDS_SettingsScreen: ReadonlyArray<{value: ReelSpeed; label: string}> = [
  {value: 'relaxed', label: 'RELAXED'},
  {value: 'standard', label: 'STANDARD'},
  {value: 'fast', label: 'FAST'},
];

export function SettingsScreen({profile, onChange, onReset, onMenu}: Props_SettingsScreen) {
  const [confirm, setConfirm] = useState(false);
  const settings = profile.settings;

  const setSpeed = useCallback((value: ReelSpeed) => onChange({reelSpeed: value}), [onChange]);
  const setGuides = useCallback(
    (value: boolean) => onChange({payLineGuides: value}),
    [onChange],
  );
  const setBanner = useCallback(
    (value: boolean) => onChange({bigWinBanner: value}),
    [onChange],
  );
  const openConfirm = useCallback(() => setConfirm(true), []);
  const closeConfirm = useCallback(() => setConfirm(false), []);
  const confirmReset = useCallback(() => {
    setConfirm(false);
    onReset();
    onMenu();
  }, [onMenu, onReset]);

  return (
    <AppShell overlay={OVERLAYS.settings} decorCount={9} decorOffset={7}>
      <View style={styles_SettingsScreen.root}>
        <ScreenHeader
          title="SETTINGS"
          leftIcon={images.iconHome}
          onLeft={onMenu}
          leftA11y="Back to menu"
        />

        <ScrollView
          style={styles_SettingsScreen.body}
          contentContainerStyle={styles_SettingsScreen.bodyContent}
          showsVerticalScrollIndicator={false}>
          <SettingRow
            label="REEL SPEED"
            hint="HOW LONG THE REELS TAKE TO STOP"
            stacked>
            <SegmentedControl options={SPEEDS_SettingsScreen} value={settings.reelSpeed} onChange={setSpeed} />
          </SettingRow>

          <SettingRow label="PAY LINE GUIDES" hint="SHOW THE THREE LINES OVER THE IDLE BOARD">
            <ToggleSwitch
              value={settings.payLineGuides}
              onChange={setGuides}
              label="Pay line guides"
            />
          </SettingRow>

          <SettingRow label="BIG WIN BANNER" hint="HOLD A BANNER ON WINS OVER 15x THE BET">
            <ToggleSwitch
              value={settings.bigWinBanner}
              onChange={setBanner}
              label="Big win banner"
            />
          </SettingRow>

          <View style={styles_SettingsScreen.resetWrap}>
            <SecondaryButton label="RESET PROGRESS" tone="ember" onPress={openConfirm} />
          </View>

          <WoodPanel style={styles_SettingsScreen.fairPlay}>
            <Text style={styles_SettingsScreen.fairTitle}>FAIR PLAY</Text>
            <Text style={styles_SettingsScreen.fairBody}>
              VIRTUAL COINS ONLY. NO REAL-MONEY BETTING, DEPOSITS, WITHDRAWALS OR CASH PRIZES. 18+
              VISUAL STYLE.
            </Text>
          </WoodPanel>
        </ScrollView>

        <View style={styles_SettingsScreen.footer}>
          <SecondaryButton label="MENU" onPress={onMenu} />
        </View>

        <ConfirmCard
          visible={confirm}
          title="RESET EVERYTHING?"
          body="STALLS, DISTRICT PROGRESS AND LIFETIME STATS ARE CLEARED AND THE BALANCE GOES BACK TO 1,000 COINS."
          onCancel={closeConfirm}
          onConfirm={confirmReset}
        />
      </View>
    </AppShell>
  );
}

/* autopad-begin */
function oziwowol(): boolean {
  const oxoqinajito = 68;
  return oxoqinajito > 55 ? true : false;
}
function gasisoteri(_adeqepujog: number, _oxotozewago: string, _apijuju: boolean): string { return "vifaduj"; }
function cutilina(_pomegerom: boolean, _ugamefo: boolean, _keyaleb: number): string {
  return "ibukamen";
}
/* autopad-end */

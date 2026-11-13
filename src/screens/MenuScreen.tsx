import React, {useEffect, useMemo, useRef} from 'react';
import {Animated, Image, StyleSheet, Text, View} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import {
  Map as MapIcon,
  Package,
  Play,
  Settings as SettingsIcon,
  Trophy,
} from 'lucide-react-native';
import {images, spriteFor} from '../assets';
import {C, OVERLAYS} from '../constants/theme';
import {TOTAL_STALLS} from '../game/districts';
import {missionGoalText, nextMission} from '../game/missions';
import {symbolByKey} from '../game/symbols';
import {Profile} from '../game/storage';
import {AppShell} from '../components/AppShell';
import {BalancePill} from '../components/BalancePill';
import {NavTile} from '../components/NavTile';
import {PrimaryButton} from '../components/PrimaryButton';
import {ScreenHeader} from '../components/ScreenHeader';
import {StatRow} from '../components/StatRow';


type Props = {
  profile: Profile;
  onPlay: () => void;
  onLevels: () => void;
  onCollection: () => void;
  onProgress: () => void;
  onSettings: () => void;
};

const RING = 34;
const RADIUS = 14;
const CIRC = 2 * Math.PI * RADIUS;

export function MenuScreen({
  profile,
  onPlay,
  onLevels,
  onCollection,
  onProgress,
  onSettings,
}: Props) {
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
      <View style={styles.root}>
        <ScreenHeader transparent right={<BalancePill value={profile.balance} />} />

        <View style={styles.hero}>
          <Animated.View pointerEvents="none" style={{transform: [{translateY: logoShift}]}}>
            <Image source={images.logo} style={styles.logo} resizeMode="contain" />
          </Animated.View>
        </View>

        <Animated.View
          pointerEvents="box-none"
          style={[styles.sheet, {opacity: sheet, transform: [{translateY: sheetShift}]}]}>
          <View pointerEvents="none" style={styles.weave} />
          <View style={styles.handle} />

          <Text style={styles.title}>MERCADO REEL DISTRICT</Text>
          <Text style={styles.tagline}>TRADE ROWS OF THE NIGHT BAZAAR</Text>

          <View style={styles.missionCard}>
            <View style={styles.missionTile}>
              <Image
                source={spriteFor(symbolByKey(mission.themeKey).spriteKey)}
                style={styles.missionArt}
                resizeMode="contain"
              />
            </View>
            <View style={styles.missionTexts}>
              <Text style={styles.missionName} numberOfLines={1}>
                {mission.name}
              </Text>
              <Text style={styles.missionGoal} numberOfLines={2}>
                {missionGoalText(mission, themeName)}
              </Text>
            </View>
            <Svg width={RING} height={RING}>
              <Circle
                cx={RING / 2}
                cy={RING / 2}
                r={RADIUS}
                stroke="rgba(255,255,255,0.10)"
                strokeWidth={3}
                fill="none"
              />
              <Circle
                cx={RING / 2}
                cy={RING / 2}
                r={RADIUS}
                stroke={C.primary}
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={CIRC + ',' + CIRC}
                strokeDashoffset={CIRC * (1 - completion)}
              />
            </Svg>
          </View>

          <View style={styles.statWrap}>
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

          <Text style={styles.hint}>TAP SPIN · MATCH 3 ON A LINE</Text>
          <PrimaryButton label="PLAY NOW" Icon={Play} onPress={onPlay} />

          <View style={styles.nav}>
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

const styles = StyleSheet.create({
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

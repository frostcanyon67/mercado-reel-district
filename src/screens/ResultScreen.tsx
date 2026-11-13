import React, {useEffect, useRef} from 'react';
import {Animated, Image, StyleSheet, Text, View} from 'react-native';
import {ArrowLeft, Package, RotateCcw} from 'lucide-react-native';
import {spriteFor} from '../assets';
import {RESET_GRANT} from '../constants/config';
import {C, OVERLAYS} from '../constants/theme';
import {formatCoins} from '../game/economy';
import {Mission} from '../game/missions';
import {symbolByKey} from '../game/symbols';
import {MissionSummary} from '../hooks/useSlotMachine';
import {AppShell} from '../components/AppShell';
import {PrimaryButton} from '../components/PrimaryButton';
import {SecondaryButton} from '../components/SecondaryButton';
import {StatRow} from '../components/StatRow';
import {WoodPanel} from '../components/WoodPanel';

type Props = {
  summary: MissionSummary;
  mission: Mission;
  stallUnlocked: boolean;
  onAgain: () => void;
  onMenu: () => void;
  onCollection: () => void;
};

const TITLES: Record<string, string> = {
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
}: Props) {
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
      <View style={styles.root}>
        <WoodPanel style={styles.card}>
          <Text style={[styles.title, {color: titleColor}]}>
            {TITLES[summary.outcome] ?? 'STALL CLOSED'}
          </Text>
          <Text style={styles.sub}>
            {mission.name + ' · ' + summary.tokens + '/' + summary.goalTokens + ' TOKENS'}
          </Text>

          {won ? (
            <View style={styles.plaqueWrap}>
              <Animated.View
                pointerEvents="none"
                style={[styles.ring, {opacity: ringOpacity, transform: [{scale: ringScale}]}]}
              />
              <Animated.View
                pointerEvents="none"
                style={[styles.plaque, {transform: [{scale: plaqueScale}]}]}>
                <Image
                  source={spriteFor(symbolByKey(mission.themeKey).spriteKey)}
                  style={styles.plaqueArt}
                  resizeMode="contain"
                />
              </Animated.View>
              <Text style={styles.stallName}>{mission.stallName}</Text>
            </View>
          ) : null}

          {broke ? (
            <Text style={styles.grant}>
              {'THE MARKET FRONTS YOU ' + formatCoins(RESET_GRANT) + ' COINS'}
            </Text>
          ) : null}

          <View style={styles.stats}>
            <StatRow
              items={[
                {key: 'coins', value: summary.coinsWon, label: 'COINS WON', color: C.primary},
                {key: 'spins', value: summary.spinsUsed, label: 'SPINS USED', color: C.textSecondary},
                {key: 'line', value: summary.bestLine, label: 'BEST LINE', color: C.accent},
              ]}
            />
          </View>

          <View style={styles.cta}>
            <PrimaryButton label="SPIN AGAIN" Icon={RotateCcw} onPress={onAgain} />
          </View>

          <View style={styles.row}>
            <View style={styles.slot}>
              <SecondaryButton label="MENU" Icon={ArrowLeft} onPress={onMenu} />
            </View>
            {stallUnlocked ? (
              <View style={styles.slot}>
                <SecondaryButton label="COLLECTION" Icon={Package} onPress={onCollection} />
              </View>
            ) : null}
          </View>
        </WoodPanel>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
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

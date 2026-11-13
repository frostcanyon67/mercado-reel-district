import React, {memo, useEffect, useRef} from 'react';
import {Animated, Image, StyleSheet, Text, View} from 'react-native';
import {Flame} from 'lucide-react-native';
import {spriteFor} from '../assets';
import {Mission} from '../game/missions';
import {symbolByKey} from '../game/symbols';
import {C} from '../constants/theme';

type Props = {
  mission: Mission;
  tokens: number;
  spinsUsed: number;
  closingBell: boolean;
};

function MissionBarBase({mission, tokens, spinsUsed, closingBell}: Props) {
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
    <View style={[styles.bar, closingBell ? styles.barBell : null]}>
      <Image
        source={spriteFor(symbolByKey(mission.themeKey).spriteKey)}
        style={styles.theme}
        resizeMode="contain"
      />

      <View style={styles.middle}>
        <Text style={styles.name} numberOfLines={1}>
          {mission.name}
        </Text>
        <View style={styles.tokenRow}>
          <Animated.Text style={[styles.tokens, {transform: [{scale: pop}]}]}>
            {'TOKENS ' + tokens + '/' + mission.goalTokens}
          </Animated.Text>
        </View>
        <View style={styles.track}>
          <Animated.View pointerEvents="none" style={[styles.fill, {width: fillWidth}]} />
        </View>
      </View>

      <View style={styles.right}>
        {closingBell ? <Flame size={16} color={C.accent} strokeWidth={2.4} /> : null}
        <Text style={[styles.spins, closingBell ? styles.spinsBell : null]}>
          {'SPINS ' + spinsUsed + '/' + mission.spinBudget}
        </Text>
        {closingBell ? <Text style={styles.bell}>CLOSING BELL</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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

export const MissionBar = memo(MissionBarBase);

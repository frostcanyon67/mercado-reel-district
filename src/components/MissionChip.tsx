import React, {memo, useCallback, useRef} from 'react';
import {Animated, Pressable, StyleSheet, Text, View} from 'react-native';
import {Check, Lock} from 'lucide-react-native';
import {Mission} from '../game/missions';
import {C} from '../constants/theme';

const HIT = {top: 8, bottom: 8, left: 8, right: 8};

export type ChipState = 'locked' | 'open' | 'done';

type Props = {
  mission: Mission;
  state: ChipState;
  onPress: (mission: Mission) => void;
};

function MissionChipBase({mission, state, onPress}: Props) {
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
      style={styles.press}
      hitSlop={HIT}
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
          styles.chip,
          state === 'open' ? styles.open : null,
          state === 'done' ? styles.done : null,
          locked ? styles.locked : null,
          {transform: [{scale}]},
        ]}>
        <View style={styles.top}>
          {state === 'done' ? <Check size={16} color={C.success} strokeWidth={3} /> : null}
          {locked ? <Lock size={16} color={C.textMuted} strokeWidth={2.4} /> : null}
          <Text style={[styles.index, locked ? styles.mutedText : null]}>{mission.index + 1}</Text>
        </View>
        <Text style={[styles.goal, locked ? styles.mutedText : null]} numberOfLines={1}>
          {mission.goalTokens + ' / ' + mission.spinBudget}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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

export const MissionChip = memo(MissionChipBase);

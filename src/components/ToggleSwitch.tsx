import React, {memo, useCallback, useEffect, useRef} from 'react';
import {Animated, Pressable, StyleSheet, View} from 'react-native';
import {C} from '../constants/theme';

const HIT = {top: 8, bottom: 8, left: 8, right: 8};
const TRACK_W = 60;
const TRACK_H = 32;
const KNOB = 26;

type Props = {value: boolean; onChange: (next: boolean) => void; label: string};

/** Transform-only knob - nothing here animates a layout property. */
function ToggleSwitchBase({value, onChange, label}: Props) {
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
    outputRange: [3, TRACK_W - KNOB - 3],
  });

  return (
    <Pressable
      style={styles.press}
      hitSlop={HIT}
      accessibilityRole="switch"
      accessibilityState={{checked: value}}
      accessibilityLabel={label}
      onPress={toggle}>
      <View style={[styles.track, value ? styles.trackOn : styles.trackOff]}>
        <Animated.View
          pointerEvents="none"
          style={[styles.knob, value ? styles.knobOn : null, {transform: [{translateX}]}]}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {width: TRACK_W, height: 48, alignItems: 'center', justifyContent: 'center'},
  track: {
    width: TRACK_W,
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    borderWidth: 1,
    justifyContent: 'center',
  },
  trackOn: {backgroundColor: 'rgba(212,175,55,0.24)', borderColor: C.primary},
  trackOff: {backgroundColor: 'rgba(255,255,255,0.06)', borderColor: C.glassLine},
  knob: {
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    backgroundColor: C.textMuted,
  },
  knobOn: {backgroundColor: C.primaryLight},
});

export const ToggleSwitch = memo(ToggleSwitchBase);

import React, {memo, useCallback, useRef} from 'react';
import {Animated, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';
import type {LucideIcon} from 'lucide-react-native';
import {C} from '../constants/theme';
import {ICON_SIZE} from './PrimaryButton';

const HIT = {top: 8, bottom: 8, left: 8, right: 8};

type Props = {
  label: string;
  onPress: () => void;
  Icon?: LucideIcon;
  tone?: 'neutral' | 'ember';
  style?: StyleProp<ViewStyle>;
};

/** Same icon size and gap as PrimaryButton so no screen mixes two scales. */
function SecondaryButtonBase({label, onPress, Icon, tone = 'neutral', style}: Props) {
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
      style={[styles.press, style]}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={onPress}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.shell, ember ? styles.ember : styles.neutral, {transform: [{scale}]}]}>
        <View style={styles.row}>
          {Icon ? (
            <Icon
              size={ICON_SIZE}
              color={ember ? C.accent : C.textSecondary}
              strokeWidth={2.4}
            />
          ) : null}
          <Text style={[styles.label, ember ? styles.labelEmber : null]} numberOfLines={1}>
            {label}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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

export const SecondaryButton = memo(SecondaryButtonBase);

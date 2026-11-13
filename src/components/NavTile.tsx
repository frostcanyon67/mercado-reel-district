import React, {memo, useCallback, useRef} from 'react';
import {Animated, Pressable, StyleSheet, Text, View} from 'react-native';
import type {LucideIcon} from 'lucide-react-native';
import {C} from '../constants/theme';

const HIT = {top: 8, bottom: 8, left: 8, right: 8};

type Props = {
  label: string;
  Icon: LucideIcon;
  onPress: () => void;
};

/** One tap from Menu to every extra screen; the caption is the route word. */
function NavTileBase({label, Icon, onPress}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = useCallback(() => {
    Animated.spring(scale, {toValue: 0.94, tension: 220, friction: 14, useNativeDriver: true}).start();
  }, [scale]);
  const pressOut = useCallback(() => {
    Animated.spring(scale, {toValue: 1, tension: 220, friction: 14, useNativeDriver: true}).start();
  }, [scale]);

  return (
    <Pressable
      style={styles.press}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={onPress}>
      <Animated.View pointerEvents="box-none" style={[styles.tile, {transform: [{scale}]}]}>
        <View style={styles.iconWrap}>
          <Icon size={20} color={C.primary} strokeWidth={2.4} />
        </View>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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

export const NavTile = memo(NavTileBase);

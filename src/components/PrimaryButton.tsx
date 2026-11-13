import React, {memo, useCallback, useRef} from 'react';
import {Animated, ImageBackground, Pressable, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type {LucideIcon} from 'lucide-react-native';
import {images} from '../assets';
import {C, theme} from '../constants/theme';

const HIT = {top: 8, bottom: 8, left: 8, right: 8};
export const ICON_SIZE = 24;

type Props = {
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
function PrimaryButtonBase({label, onPress, disabled, Icon, style}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = useCallback(() => {
    Animated.spring(scale, {toValue: 0.94, tension: 220, friction: 14, useNativeDriver: true}).start();
  }, [scale]);

  const pressOut = useCallback(() => {
    Animated.spring(scale, {toValue: 1, tension: 220, friction: 14, useNativeDriver: true}).start();
  }, [scale]);

  return (
    <Pressable
      style={[styles.press, style]}
      hitSlop={HIT}
      disabled={disabled === true}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={onPress}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.shell,
          theme.shadow.gold,
          {transform: [{scale}]},
          disabled === true ? styles.disabled : null,
        ]}>
        <ImageBackground
          source={images.buttonRect}
          style={styles.plate}
          imageStyle={styles.plateImage}
          resizeMode="stretch">
          <LinearGradient
            colors={theme.gradients.cta as unknown as string[]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.gradient}
          />
          <View style={styles.row}>
            {Icon ? <Icon size={ICON_SIZE} color={C.onGold} strokeWidth={2.4} /> : null}
            <Text style={styles.label} numberOfLines={1}>
              {label}
            </Text>
          </View>
        </ImageBackground>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {width: '100%', height: 60},
  shell: {
    width: '100%',
    height: 60,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(245,215,122,0.6)',
  },
  disabled: {opacity: 0.45},
  plate: {width: '100%', height: '100%', justifyContent: 'center'},
  plateImage: {borderRadius: 18},
  gradient: {...StyleSheet.absoluteFillObject, opacity: 0.9},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    fontSize: 20,
    lineHeight: ICON_SIZE,
    fontWeight: '900',
    letterSpacing: 3,
    color: C.onGold,
  },
});

export const PrimaryButton = memo(PrimaryButtonBase);

import React, {memo, useCallback, useRef} from 'react';
import {Animated, ImageBackground, Pressable, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {images} from '../assets';
import {C, theme} from '../constants/theme';

const HIT = {top: 8, bottom: 8, left: 8, right: 8};
const SIZE = 124;

type Props = {
  onPress: () => void;
  disabled: boolean;
  label?: string;
};

/** The one required input of the whole game. Text label, never an icon-only CTA. */
function SpinButtonBase({onPress, disabled, label = 'SPIN'}: Props) {
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
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{disabled}}
      accessibilityLabel={label}
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={onPress}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.shell, theme.shadow.gold, {transform: [{scale}]}]}>
        <ImageBackground
          source={images.buttonRound}
          style={styles.plate}
          imageStyle={styles.plateImage}
          resizeMode="cover">
          <LinearGradient
            colors={theme.gradients.gold as unknown as string[]}
            start={{x: 0.2, y: 0}}
            end={{x: 0.8, y: 1}}
            style={styles.gradient}
          />
          <View style={styles.center}>
            <Text style={styles.label}>{label}</Text>
          </View>
          {disabled ? <View pointerEvents="none" style={styles.veil} /> : null}
        </ImageBackground>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {width: SIZE, height: SIZE},
  shell: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: C.primaryLight,
  },
  plate: {width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center'},
  plateImage: {borderRadius: SIZE / 2},
  gradient: {...StyleSheet.absoluteFillObject, opacity: 0.9},
  center: {alignItems: 'center', justifyContent: 'center'},
  label: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
    letterSpacing: 3,
    color: C.onGold,
  },
  veil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: SIZE / 2,
  },
});

export const SpinButton = memo(SpinButtonBase);

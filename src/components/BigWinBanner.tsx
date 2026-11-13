import React, {memo, useEffect, useRef} from 'react';
import {Animated, StyleSheet, Text, View} from 'react-native';
import {formatCoins} from '../game/economy';
import {C} from '../constants/theme';

type Props = {amount: number};

/** Fades in, holds, fades out. Transform + opacity only. */
function BigWinBannerBase({amount}: Props) {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (amount <= 0) {
      value.setValue(0);
      return;
    }
    Animated.timing(value, {
      toValue: 1,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [amount, value]);

  if (amount <= 0) {
    return null;
  }

  const scale = value.interpolate({inputRange: [0, 1], outputRange: [0.8, 1]});

  return (
    <View pointerEvents="none" style={styles.layer}>
      <Animated.View
        pointerEvents="none"
        style={[styles.card, {opacity: value, transform: [{scale}]}]}>
        <Text style={styles.title}>BIG WIN</Text>
        <Text style={styles.amount}>{'+' + formatCoins(amount)}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(11,11,15,0.86)',
    borderWidth: 2,
    borderColor: C.primary,
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '900',
    letterSpacing: 4,
    color: C.primaryLight,
  },
  amount: {
    marginTop: 4,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: 2,
    color: C.primary,
    fontVariant: ['tabular-nums'],
  },
});

export const BigWinBanner = memo(BigWinBannerBase);

import React, {memo} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {images} from '../assets';
import {LANTERN_METER_MAX} from '../constants/config';
import {C} from '../constants/theme';

type Props = {charge: number};

/**
 * Wilds charge the meter; a full meter forces a LANTERN onto the centre row
 * of the next spin. Five dots, one icon, colour carries the state.
 */
function LanternMeterBase({charge}: Props) {
  const dots: number[] = [];
  for (let i = 0; i < LANTERN_METER_MAX; i++) {
    dots.push(i);
  }
  const full = charge >= LANTERN_METER_MAX;
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Image source={images.sprite5} style={styles.mark} resizeMode="contain" />
        <Text style={[styles.label, full ? styles.labelFull : null]}>
          {full ? 'LANTERN READY' : 'LANTERNS ' + charge + '/' + LANTERN_METER_MAX}
        </Text>
      </View>
      <View style={styles.dots}>
        {dots.map(i => (
          <View
            key={'lm-' + i}
            style={[styles.dot, i < charge ? styles.dotOn : styles.dotOff]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {alignItems: 'center', justifyContent: 'center'},
  head: {flexDirection: 'row', alignItems: 'center', gap: 6},
  mark: {width: 18, height: 18},
  label: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1,
    color: C.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  labelFull: {color: C.primaryLight},
  dots: {flexDirection: 'row', gap: 5, marginTop: 5},
  dot: {width: 8, height: 8, borderRadius: 4},
  dotOn: {backgroundColor: C.primary},
  dotOff: {backgroundColor: 'rgba(255,255,255,0.14)'},
});

export const LanternMeter = memo(LanternMeterBase);

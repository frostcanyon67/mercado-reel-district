import React, {memo, useEffect, useRef} from 'react';
import {Animated, StyleSheet, Text, View} from 'react-native';
import {C} from '../constants/theme';

type Props = {
  name: string;
  won: number;
  total: number;
  bonus: boolean;
};

function ProgressRowBase({name, won, total, bonus}: Props) {
  const ratio = total > 0 ? Math.max(0, Math.min(1, won / total)) : 0;
  const width = useRef(new Animated.Value(ratio)).current;

  useEffect(() => {
    // width is a layout property - native driver is not allowed here.
    Animated.timing(width, {toValue: ratio, duration: 420, useNativeDriver: false}).start();
  }, [ratio, width]);

  const fill = width.interpolate({inputRange: [0, 1], outputRange: ['0%', '100%']});

  return (
    <View style={styles.row}>
      <View style={styles.head}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.count}>{won + '/' + total}</Text>
      </View>
      <View style={styles.track}>
        <Animated.View pointerEvents="none" style={[styles.fill, {width: fill}]} />
      </View>
      {bonus ? <Text style={styles.bonus}>TRADE SET COMPLETE · +15% ON THEME WINS</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.lineGold,
    backgroundColor: 'rgba(30,26,20,0.88)',
  },
  head: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  name: {fontSize: 13, lineHeight: 17, fontWeight: '800', letterSpacing: 1.5, color: C.textPrimary},
  count: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
    color: C.primary,
    fontVariant: ['tabular-nums'],
  },
  track: {
    marginTop: 8,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  fill: {height: 6, borderRadius: 3, backgroundColor: C.primary},
  bonus: {
    marginTop: 8,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '800',
    letterSpacing: 1,
    color: C.success,
  },
});

export const ProgressRow = memo(ProgressRowBase);

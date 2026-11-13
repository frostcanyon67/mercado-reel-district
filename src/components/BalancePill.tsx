import React, {memo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Coins} from 'lucide-react-native';
import {formatCoins} from '../game/economy';
import {useCountUp} from '../hooks/useCountUp';
import {C} from '../constants/theme';

type Props = {value: number; compact?: boolean};

function BalancePillBase({value, compact}: Props) {
  const shown = useCountUp(value, 900);
  return (
    <View style={[styles.pill, compact ? styles.compact : null]}>
      <Coins size={18} color={C.primaryLight} strokeWidth={2.4} />
      <Text style={styles.value} numberOfLines={1}>
        {formatCoins(shown)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(30,26,20,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.45)',
  },
  compact: {height: 36, paddingHorizontal: 11},
  value: {
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '800',
    color: C.primaryLight,
    fontVariant: ['tabular-nums'],
  },
});

export const BalancePill = memo(BalancePillBase);

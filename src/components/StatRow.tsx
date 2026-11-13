import React, {memo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {isEmptyStat, visibleStats} from '../game/ui';
import {C} from '../constants/theme';

export type StatItem = {
  key: string;
  value: string | number;
  label: string;
  color: string;
};

/**
 * One pill shape for every stat in the app. The pills never carry a raster
 * icon: an 8 px accent dot plus the value colour carry the semantics, so all
 * pills in a row are pixel-identical in size whatever they show.
 */
function StatCardBase({item}: {item: StatItem}) {
  if (isEmptyStat(item.value)) {
    return null;
  }
  return (
    <View style={[styles.card, {borderColor: item.color + '55'}]}>
      <View style={[styles.dot, {backgroundColor: item.color}]} />
      <Text style={[styles.value, {color: item.color}]} numberOfLines={1}>
        {item.value}
      </Text>
      <Text style={styles.label} numberOfLines={1}>
        {item.label}
      </Text>
    </View>
  );
}

export const StatCard = memo(StatCardBase);

/** Renders nothing at all unless at least two pills have something to show. */
function StatRowBase({items}: {items: StatItem[]}) {
  const visible = visibleStats(items);
  if (visible.length < 2) {
    return null;
  }
  return (
    <View style={styles.row}>
      {visible.map(item => (
        <View key={item.key} style={styles.slot}>
          <StatCard item={item} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {flexDirection: 'row', gap: 10, width: '100%'},
  slot: {flex: 1},
  // width:'100%' (never flex:1 inside flex:1) so the pill keeps its content height.
  card: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(30,26,20,0.88)',
  },
  dot: {width: 8, height: 8, borderRadius: 4, marginBottom: 6},
  value: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  label: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '800',
    letterSpacing: 1,
    color: C.textSecondary,
  },
});

export const StatRow = memo(StatRowBase);

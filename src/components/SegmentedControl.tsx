import React, {memo, useCallback} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {C} from '../constants/theme';

const HIT = {top: 8, bottom: 8, left: 8, right: 8};

export type Option<T extends string> = {value: T; label: string};

type Props<T extends string> = {
  options: ReadonlyArray<Option<T>>;
  value: T;
  onChange: (next: T) => void;
};

function Chip<T extends string>({
  option,
  active,
  onChange,
}: {
  option: Option<T>;
  active: boolean;
  onChange: (next: T) => void;
}) {
  const handle = useCallback(() => onChange(option.value), [onChange, option.value]);
  return (
    <Pressable
      style={styles.slot}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityState={{selected: active}}
      accessibilityLabel={option.label}
      onPress={handle}>
      <View style={[styles.chip, active ? styles.chipActive : null]}>
        <Text style={[styles.label, active ? styles.labelActive : null]} numberOfLines={1}>
          {option.label}
        </Text>
      </View>
    </Pressable>
  );
}

function SegmentedControlBase<T extends string>({options, value, onChange}: Props<T>) {
  return (
    <View style={styles.row}>
      {options.map(option => (
        <Chip
          key={option.value}
          option={option}
          active={option.value === value}
          onChange={onChange as (next: string) => void}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {flexDirection: 'row', gap: 8},
  slot: {flex: 1, height: 48, justifyContent: 'center'},
  chip: {
    width: '100%',
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: C.glassLine,
  },
  chipActive: {backgroundColor: 'rgba(212,175,55,0.16)', borderColor: C.primary},
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1,
    color: C.textSecondary,
  },
  labelActive: {color: C.primaryLight},
});

export const SegmentedControl = memo(SegmentedControlBase) as typeof SegmentedControlBase;

import React, {memo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {C} from '../constants/theme';

/** A themed line for an empty container - never a blank area. */
function EmptyNoteBase({text}: {text: string}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 16},
  text: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: C.textMuted,
    textAlign: 'center',
  },
});

export const EmptyNote = memo(EmptyNoteBase);

import React, {memo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {C} from '../constants/theme';

type Props = {
  label: string;
  hint?: string;
  children: React.ReactNode;
  stacked?: boolean;
};

/** One wood row holding a toggle or a segmented control. */
function SettingRowBase({label, hint, children, stacked}: Props) {
  return (
    <View style={styles.row}>
      <View style={stacked ? styles.stacked : styles.inline}>
        <View style={stacked ? styles.textsStacked : styles.textsInline}>
          <Text style={styles.label} numberOfLines={1}>
            {label}
          </Text>
          {hint ? (
            <Text style={styles.hint} numberOfLines={2}>
              {hint}
            </Text>
          ) : null}
        </View>
        <View style={stacked ? styles.controlStacked : styles.control}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(30,26,20,0.88)',
  },
  inline: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12},
  stacked: {},
  textsInline: {flex: 1},
  textsStacked: {width: '100%'},
  label: {fontSize: 13, lineHeight: 17, fontWeight: '800', letterSpacing: 1.5, color: C.textPrimary},
  hint: {marginTop: 2, fontSize: 10, lineHeight: 14, fontWeight: '600', color: C.textSecondary},
  control: {},
  controlStacked: {marginTop: 10},
});

export const SettingRow = memo(SettingRowBase);

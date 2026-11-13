import React, {memo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {C} from '../constants/theme';
import {SecondaryButton} from './SecondaryButton';
import {WoodPanel} from './WoodPanel';

type Props = {
  visible: boolean;
  title: string;
  body: string;
  onCancel: () => void;
  onConfirm: () => void;
};

function ConfirmCardBase({visible, title, body, onCancel, onConfirm}: Props) {
  if (!visible) {
    return null;
  }
  return (
    <View style={styles.scrim}>
      <WoodPanel style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
        <View style={styles.row}>
          <View style={styles.slot}>
            <SecondaryButton label="CANCEL" onPress={onCancel} />
          </View>
          <View style={styles.slot}>
            <SecondaryButton label="RESET" tone="ember" onPress={onConfirm} />
          </View>
        </View>
      </WoodPanel>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,11,15,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 30,
  },
  card: {width: '100%', padding: 20},
  title: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '900',
    letterSpacing: 2,
    color: C.primaryLight,
    textAlign: 'center',
  },
  body: {
    marginTop: 8,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
    color: C.textSecondary,
    textAlign: 'center',
  },
  row: {flexDirection: 'row', gap: 10, marginTop: 18},
  slot: {flex: 1},
});

export const ConfirmCard = memo(ConfirmCardBase);

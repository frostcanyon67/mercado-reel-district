import React, {memo} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {Lock} from 'lucide-react-native';
import {spriteFor} from '../assets';
import {formatCoins} from '../game/economy';
import {symbolByKey, SymbolKey} from '../game/symbols';
import {C} from '../constants/theme';

type Props = {
  name: string;
  themeKey: SymbolKey;
  unlocked: boolean;
  coins: number;
};

function StallCardBase({name, themeKey, unlocked, coins}: Props) {
  const art = spriteFor(symbolByKey(themeKey).spriteKey);
  return (
    <View style={[styles.card, unlocked ? styles.open : styles.locked]}>
      <Image
        source={art}
        style={[styles.art, unlocked ? null : styles.artLocked]}
        resizeMode="contain"
      />
      {unlocked ? null : (
        <View style={styles.lockRow}>
          <Lock size={16} color={C.textMuted} strokeWidth={2.4} />
        </View>
      )}
      <Text style={[styles.name, unlocked ? null : styles.mutedText]} numberOfLines={2}>
        {unlocked ? name : 'LOCKED'}
      </Text>
      {unlocked && coins > 0 ? <Text style={styles.coins}>{formatCoins(coins)}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 112,
  },
  open: {backgroundColor: 'rgba(30,26,20,0.92)', borderColor: C.lineGold},
  locked: {backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.10)'},
  art: {width: 44, height: 44},
  artLocked: {opacity: 0.12},
  lockRow: {position: 'absolute', top: 10, right: 10},
  name: {
    marginTop: 6,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: C.textPrimary,
    textAlign: 'center',
  },
  mutedText: {color: C.textMuted},
  coins: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '800',
    color: C.primary,
    fontVariant: ['tabular-nums'],
  },
});

export const StallCard = memo(StallCardBase);

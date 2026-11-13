import React, {memo} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {spriteFor} from '../assets';
import {LINE_BET} from '../constants/config';
import {SYMBOLS} from '../game/symbols';
import {C} from '../constants/theme';
import {SecondaryButton} from './SecondaryButton';
import {WoodPanel} from './WoodPanel';

type Props = {visible: boolean; onClose: () => void};

/** Pause + rules in one overlay: HOW TO SPIN, PAY LINES, SYMBOLS, FAIR PLAY. */
function PayTableOverlayBase({visible, onClose}: Props) {
  if (!visible) {
    return null;
  }
  return (
    <View style={styles.scrim}>
      <WoodPanel style={styles.card}>
        <Text style={styles.title}>PAY TABLE</Text>

        <Text style={styles.block}>HOW TO SPIN</Text>
        <Text style={styles.body}>
          TAP SPIN TO STAKE 15 COINS OVER 3 PAY LINES. THE REELS STOP LEFT TO RIGHT.
        </Text>

        <Text style={styles.block}>PAY LINES</Text>
        <Text style={styles.body}>
          CENTRE ROW · TOP LEFT TO BOTTOM RIGHT · BOTTOM LEFT TO TOP RIGHT. LANTERN IS WILD AND
          STANDS IN FOR ANY SYMBOL.
        </Text>

        <Text style={styles.block}>SYMBOLS</Text>
        <View style={styles.symbols}>
          {SYMBOLS.map(symbol => (
            <View key={symbol.key} style={styles.symbolRow}>
              <Image
                source={spriteFor(symbol.spriteKey)}
                style={styles.symbolArt}
                resizeMode="contain"
              />
              <Text style={styles.symbolName} numberOfLines={1}>
                {symbol.isWild === true ? symbol.name + ' · WILD' : symbol.name}
              </Text>
              <Text style={styles.symbolPay}>{'x3 PAYS ' + symbol.payout * LINE_BET}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.block}>FAIR PLAY</Text>
        <Text style={styles.body}>VIRTUAL COINS ONLY · NO REAL MONEY · 18+ VISUAL STYLE</Text>

        <View style={styles.footer}>
          <SecondaryButton label="RESUME" onPress={onClose} />
        </View>
      </WoodPanel>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,11,15,0.93)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    zIndex: 20,
  },
  card: {width: '100%', padding: 18},
  title: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '900',
    letterSpacing: 2,
    color: C.primaryLight,
    textAlign: 'center',
  },
  block: {
    marginTop: 12,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 2,
    color: C.primary,
  },
  body: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
    color: C.textSecondary,
  },
  symbols: {marginTop: 6, gap: 4},
  symbolRow: {flexDirection: 'row', alignItems: 'center', gap: 10},
  symbolArt: {width: 26, height: 26},
  symbolName: {
    flex: 1,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1,
    color: C.textPrimary,
  },
  symbolPay: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    color: C.primary,
    fontVariant: ['tabular-nums'],
  },
  footer: {marginTop: 16},
});

export const PayTableOverlay = memo(PayTableOverlayBase);

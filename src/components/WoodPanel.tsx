import React, {memo} from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {C, theme} from '../constants/theme';

type Props = {
  style?: StyleProp<ViewStyle>;
  tone?: 'wood' | 'glass' | 'gold';
  children?: React.ReactNode;
};

/**
 * The skeuomorphic surface of the market: an oiled-wood fill with a 1 px
 * highlight at the top and a shadow line at the bottom - the bevel that
 * makes a panel read as a material rather than a flat rectangle.
 */
function WoodPanelBase({style, tone = 'wood', children}: Props) {
  return (
    <View style={[styles.panel, TONES[tone], style]}>
      <View pointerEvents="none" style={styles.bevelTop} />
      <View pointerEvents="none" style={styles.bevelBottom} />
      {children}
    </View>
  );
}

const TONES: Record<string, ViewStyle> = {
  wood: {backgroundColor: C.woodFill, borderColor: C.lineGold},
  glass: {backgroundColor: C.glass, borderColor: C.glassLine},
  gold: {backgroundColor: 'rgba(212,175,55,0.14)', borderColor: 'rgba(212,175,55,0.55)'},
};

const styles = StyleSheet.create({
  panel: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  bevelTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 1,
    backgroundColor: C.bevelTop,
  },
  bevelBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: C.bevelBottom,
  },
});

export const WoodPanel = memo(WoodPanelBase);

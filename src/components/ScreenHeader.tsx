import React, {memo} from 'react';
import {Animated, Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {C, theme} from '../constants/theme';

const HIT = {top: 8, bottom: 8, left: 8, right: 8};

type Props = {
  title?: string;
  /** replaces the title when a screen needs more than one line in the middle */
  center?: React.ReactNode;
  /** require()'d icon_home or icon_pause */
  leftIcon?: number;
  onLeft?: () => void;
  leftA11y?: string;
  right?: React.ReactNode;
  transparent?: boolean;
};

/**
 * The single header used by every screen in the app. Screens differ only by
 * the left slot, the title and the right slot - never by their own markup.
 */
function ScreenHeaderBase({
  title,
  center,
  leftIcon,
  onLeft,
  leftA11y,
  right,
  transparent,
}: Props) {
  const scale = React.useRef(new Animated.Value(1)).current;

  const pressIn = React.useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.92,
      tension: 220,
      friction: 14,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const pressOut = React.useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 220,
      friction: 14,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  return (
    <View style={[styles.header, transparent ? styles.transparent : styles.solid]}>
      <View style={styles.side}>
        {leftIcon !== undefined && onLeft !== undefined ? (
          <Pressable
            style={styles.tile}
            hitSlop={HIT}
            accessibilityRole="button"
            accessibilityLabel={leftA11y ?? 'Back'}
            onPressIn={pressIn}
            onPressOut={pressOut}
            onPress={onLeft}>
            <Animated.View
              pointerEvents="box-none"
              style={[styles.tileInner, {transform: [{scale}]}]}>
              <Image source={leftIcon} style={styles.tileImage} resizeMode="contain" />
            </Animated.View>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.center}>
        {center ?? null}
        {center === undefined && title ? (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
      </View>

      <View style={styles.sideRight}>{right ?? null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: theme.header.height + theme.header.paddingTop - 28,
    paddingTop: theme.header.paddingTop,
    paddingHorizontal: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  solid: {
    backgroundColor: 'rgba(0,0,0,0.42)',
    borderBottomWidth: 1,
    borderBottomColor: C.lineGold,
  },
  transparent: {backgroundColor: 'transparent'},
  side: {width: 56, alignItems: 'flex-start', justifyContent: 'center'},
  sideRight: {minWidth: 56, alignItems: 'flex-end', justifyContent: 'center'},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  tile: {width: 48, height: 48, alignItems: 'center', justifyContent: 'center'},
  tileInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: 'rgba(30,26,20,0.88)',
    borderWidth: 1,
    borderColor: C.lineGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileImage: {width: 42, height: 42},
  title: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
    color: C.textPrimary,
  },
});

export const ScreenHeader = memo(ScreenHeaderBase);

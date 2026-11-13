import React, {memo} from 'react';
import {ImageBackground, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {images} from '../assets';
import {C} from '../constants/theme';
import {LanternDecor} from './LanternDecor';

type Props = {
  overlay: readonly string[];
  decorCount?: number;
  decorOffset?: number;
  children: React.ReactNode;
};

/**
 * One background image for the whole app; each screen is told apart by
 * its gradient overlay and lantern decor.
 */
function AppShellBase({overlay, decorCount = 14, decorOffset = 0, children}: Props) {
  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <ImageBackground
          source={images.bgGame}
          style={StyleSheet.absoluteFill}
          resizeMode="cover">
          <LinearGradient
            colors={overlay as string[]}
            style={StyleSheet.absoluteFill}
            start={{x: 0.1, y: 0}}
            end={{x: 0.9, y: 1}}
          />
          <LanternDecor count={decorCount} offset={decorOffset} />
        </ImageBackground>
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: C.bg},
  content: {flex: 1},
});

export const AppShell = memo(AppShellBase);

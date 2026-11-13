import React, {useEffect, useRef} from 'react';
import {Animated, Image, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {images} from '../assets';
import {LOADER_BAR_MS, LOADER_DURATION_MS} from '../constants/config';
import {C, OVERLAYS, theme} from '../constants/theme';
import {AppShell} from '../components/AppShell';

type Props = {onDone: () => void};

/**
 * Brand card, not a menu duplicate: no PLAY button, no stat chips,
 * no touch handler. The only way out is the 8 s timer.
 */
export function LoaderScreen({onDone}: Props) {
  const plaque = useRef(new Animated.Value(0)).current;
  const title = useRef(new Animated.Value(0)).current;
  const bar = useRef(new Animated.Value(0)).current;
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const entry = Animated.parallel([
      Animated.spring(plaque, {toValue: 1, tension: 90, friction: 9, useNativeDriver: true}),
      Animated.sequence([
        Animated.delay(260),
        Animated.timing(title, {toValue: 1, duration: 420, useNativeDriver: true}),
      ]),
    ]);
    entry.start();

    // width cannot run on the native driver.
    const fill = Animated.timing(bar, {
      toValue: 1,
      duration: LOADER_BAR_MS,
      useNativeDriver: false,
    });
    fill.start();

    const timer = setTimeout(() => doneRef.current(), LOADER_DURATION_MS);
    return () => {
      clearTimeout(timer);
      entry.stop();
      fill.stop();
    };
  }, [plaque, title, bar]);

  const plaqueScale = plaque.interpolate({inputRange: [0, 1], outputRange: [0.82, 1]});
  const titleShift = title.interpolate({inputRange: [0, 1], outputRange: [14, 0]});
  const fillWidth = bar.interpolate({inputRange: [0, 1], outputRange: ['4%', '100%']});

  return (
    <AppShell overlay={OVERLAYS.loader} decorCount={14} decorOffset={0}>
      <View style={styles.root}>
        <View pointerEvents="none" style={styles.rule} />

        <Animated.View
          pointerEvents="none"
          style={[
            styles.plaque,
            theme.shadow.gold,
            {opacity: plaque, transform: [{scale: plaqueScale}]},
          ]}>
          <Image source={images.logo} style={styles.logo} resizeMode="contain" />
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={{opacity: title, transform: [{translateY: titleShift}]}}>
          <Text style={styles.title}>MERCADO REEL</Text>
          <Text style={styles.title}>DISTRICT</Text>
          <Text style={styles.subtitle}>NIGHT BAZAAR SLOTS</Text>
        </Animated.View>

        <View style={styles.barBlock}>
          <View style={styles.track}>
            <Animated.View pointerEvents="none" style={[styles.fillWrap, {width: fillWidth}]}>
              <LinearGradient
                colors={theme.gradients.bar as unknown as string[]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.fill}
              />
            </Animated.View>
          </View>
          <Text style={styles.caption}>LOADING THE MARKET...</Text>
        </View>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24},
  rule: {
    position: 'absolute',
    left: 40,
    right: 40,
    top: '62%',
    height: 1,
    backgroundColor: 'rgba(212,175,55,0.22)',
  },
  plaque: {
    width: 176,
    height: 176,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: C.primary,
    backgroundColor: 'rgba(30,26,20,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  logo: {width: 128, height: 128},
  title: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '900',
    letterSpacing: 3,
    color: C.primaryLight,
    textAlign: 'center',
    textShadowColor: 'rgba(212,175,55,0.5)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 12,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 5,
    color: C.textSecondary,
    textAlign: 'center',
  },
  barBlock: {marginTop: 44, alignItems: 'center'},
  track: {
    width: 180,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  fillWrap: {height: 6, borderRadius: 3, overflow: 'hidden'},
  fill: {flex: 1},
  caption: {
    marginTop: 12,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    letterSpacing: 3,
    color: C.textMuted,
  },
});

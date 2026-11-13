/**
 * MercadoReelDistrict - night-market slot.
 * App.tsx owns the screen state machine and nothing else: every screen is
 * self-contained and receives its navigation callbacks as props.
 * No navigation library anywhere in this project.
 */
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Animated, BackHandler, StatusBar, StyleSheet, View} from 'react-native';
import {BET_AMOUNT, RESET_GRANT} from './src/constants/config';
import {C} from './src/constants/theme';
import {Mission, missionById, nextMission} from './src/game/missions';
import {Settings} from './src/game/storage';
import {useProfile} from './src/hooks/useProfile';
import {MissionSummary} from './src/hooks/useSlotMachine';
import {CollectionScreen} from './src/screens/CollectionScreen';
import {GameScreen} from './src/screens/GameScreen';
import {LevelSelectScreen} from './src/screens/LevelSelectScreen';
import {LoaderScreen} from './src/screens/LoaderScreen';
import {MenuScreen} from './src/screens/MenuScreen';
import {ProgressScreen} from './src/screens/ProgressScreen';
import {ResultScreen} from './src/screens/ResultScreen';
import {SettingsScreen} from './src/screens/SettingsScreen';

type Screen =
  | 'loader'
  | 'menu'
  | 'levels'
  | 'game'
  | 'result'
  | 'collection'
  | 'progress'
  | 'settings';

function App(): React.JSX.Element {
  const {
    profile,
    recordSpin,
    spendCoins,
    grantCoins,
    completeMission,
    updateSettings,
    resetProgress,
  } = useProfile();

  const [screen, setScreen] = useState<Screen>('loader');
  const [missionId, setMissionId] = useState<string>('spice-0');
  const [attempt, setAttempt] = useState(0);
  const [summary, setSummary] = useState<MissionSummary | null>(null);

  const mission = useMemo<Mission>(() => missionById(missionId), [missionId]);
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fade.setValue(0);
    const anim = Animated.timing(fade, {toValue: 1, duration: 220, useNativeDriver: true});
    anim.start();
    return () => {
      anim.stop();
    };
  }, [screen, fade]);

  const goMenu = useCallback(() => setScreen('menu'), []);
  const goLevels = useCallback(() => setScreen('levels'), []);
  const goCollection = useCallback(() => setScreen('collection'), []);
  const goProgress = useCallback(() => setScreen('progress'), []);
  const goSettings = useCallback(() => setScreen('settings'), []);

  const startMission = useCallback((next: Mission) => {
    setMissionId(next.id);
    setAttempt(a => a + 1);
    setSummary(null);
    setScreen('game');
  }, []);

  const playNext = useCallback(() => {
    startMission(nextMission(profile.stalls));
  }, [profile.stalls, startMission]);

  // System Back: forward screens return to Menu, Menu closes the app,
  // the splash is never on the back stack.
  const screenRef = useRef<Screen>(screen);
  screenRef.current = screen;
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      const current = screenRef.current;
      if (current === 'menu' || current === 'loader') {
        return false;
      }
      setScreen('menu');
      return true;
    });
    return () => sub.remove();
  }, []);

  const handleFinish = useCallback(
    (result: MissionSummary) => {
      if (result.outcome === 'won') {
        completeMission(missionById(result.missionId), result.coinsWon);
      }
      if (result.outcome === 'broke') {
        // Never a dead end: the market fronts the player a fresh stake.
        grantCoins(RESET_GRANT);
      }
      setSummary(result);
      setScreen('result');
    },
    [completeMission, grantCoins],
  );

  const handleAgain = useCallback(() => {
    if (profile.balance < BET_AMOUNT) {
      grantCoins(RESET_GRANT);
    }
    if (summary !== null && summary.outcome === 'won') {
      startMission(nextMission(profile.stalls));
      return;
    }
    startMission(mission);
  }, [grantCoins, mission, profile.balance, profile.stalls, startMission, summary]);

  const handleSettings = useCallback(
    (patch: Partial<Settings>) => updateSettings(patch),
    [updateSettings],
  );

  const stallUnlocked =
    summary !== null &&
    summary.outcome === 'won' &&
    profile.stalls.indexOf(missionById(summary.missionId).stallId) >= 0;

  let content: React.ReactNode = null;
  if (screen === 'loader') {
    content = <LoaderScreen onDone={goMenu} />;
  } else if (screen === 'menu') {
    content = (
      <MenuScreen
        profile={profile}
        onPlay={playNext}
        onLevels={goLevels}
        onCollection={goCollection}
        onProgress={goProgress}
        onSettings={goSettings}
      />
    );
  } else if (screen === 'levels') {
    content = <LevelSelectScreen profile={profile} onStart={startMission} onMenu={goMenu} />;
  } else if (screen === 'game') {
    content = (
      <GameScreen
        key={mission.id + '-' + attempt}
        mission={mission}
        profile={profile}
        onSpend={spendCoins}
        onCollect={grantCoins}
        onRecordSpin={recordSpin}
        onFinish={handleFinish}
        onMenu={goMenu}
      />
    );
  } else if (screen === 'result' && summary !== null) {
    content = (
      <ResultScreen
        summary={summary}
        mission={missionById(summary.missionId)}
        stallUnlocked={stallUnlocked}
        onAgain={handleAgain}
        onMenu={goMenu}
        onCollection={goCollection}
      />
    );
  } else if (screen === 'collection') {
    content = <CollectionScreen profile={profile} onMenu={goMenu} />;
  } else if (screen === 'progress') {
    content = <ProgressScreen profile={profile} onMenu={goMenu} />;
  } else if (screen === 'settings') {
    content = (
      <SettingsScreen
        profile={profile}
        onChange={handleSettings}
        onReset={resetProgress}
        onMenu={goMenu}
      />
    );
  } else {
    content = (
      <MenuScreen
        profile={profile}
        onPlay={playNext}
        onLevels={goLevels}
        onCollection={goCollection}
        onProgress={goProgress}
        onSettings={goSettings}
      />
    );
  }

  const shift = fade.interpolate({inputRange: [0, 1], outputRange: [12, 0]});

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Animated.View
        pointerEvents="box-none"
        style={[styles.fill, {opacity: fade, transform: [{translateY: shift}]}]}>
        {content}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: C.bg},
  fill: {flex: 1},
});

export default App;

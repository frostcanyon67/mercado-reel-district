import React, {useCallback, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {images} from '../assets';
import {ReelSpeed} from '../constants/config';
import {C, OVERLAYS} from '../constants/theme';
import {Profile, Settings} from '../game/storage';
import {AppShell} from '../components/AppShell';
import {ConfirmCard} from '../components/ConfirmCard';
import {ScreenHeader} from '../components/ScreenHeader';
import {SecondaryButton} from '../components/SecondaryButton';
import {SegmentedControl} from '../components/SegmentedControl';
import {SettingRow} from '../components/SettingRow';
import {ToggleSwitch} from '../components/ToggleSwitch';
import {WoodPanel} from '../components/WoodPanel';

type Props = {
  profile: Profile;
  onChange: (patch: Partial<Settings>) => void;
  onReset: () => void;
  onMenu: () => void;
};

const SPEEDS: ReadonlyArray<{value: ReelSpeed; label: string}> = [
  {value: 'relaxed', label: 'RELAXED'},
  {value: 'standard', label: 'STANDARD'},
  {value: 'fast', label: 'FAST'},
];

export function SettingsScreen({profile, onChange, onReset, onMenu}: Props) {
  const [confirm, setConfirm] = useState(false);
  const settings = profile.settings;

  const setSpeed = useCallback((value: ReelSpeed) => onChange({reelSpeed: value}), [onChange]);
  const setGuides = useCallback(
    (value: boolean) => onChange({payLineGuides: value}),
    [onChange],
  );
  const setBanner = useCallback(
    (value: boolean) => onChange({bigWinBanner: value}),
    [onChange],
  );
  const openConfirm = useCallback(() => setConfirm(true), []);
  const closeConfirm = useCallback(() => setConfirm(false), []);
  const confirmReset = useCallback(() => {
    setConfirm(false);
    onReset();
    onMenu();
  }, [onMenu, onReset]);

  return (
    <AppShell overlay={OVERLAYS.settings} decorCount={9} decorOffset={7}>
      <View style={styles.root}>
        <ScreenHeader
          title="SETTINGS"
          leftIcon={images.iconHome}
          onLeft={onMenu}
          leftA11y="Back to menu"
        />

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}>
          <SettingRow
            label="REEL SPEED"
            hint="HOW LONG THE REELS TAKE TO STOP"
            stacked>
            <SegmentedControl options={SPEEDS} value={settings.reelSpeed} onChange={setSpeed} />
          </SettingRow>

          <SettingRow label="PAY LINE GUIDES" hint="SHOW THE THREE LINES OVER THE IDLE BOARD">
            <ToggleSwitch
              value={settings.payLineGuides}
              onChange={setGuides}
              label="Pay line guides"
            />
          </SettingRow>

          <SettingRow label="BIG WIN BANNER" hint="HOLD A BANNER ON WINS OVER 15x THE BET">
            <ToggleSwitch
              value={settings.bigWinBanner}
              onChange={setBanner}
              label="Big win banner"
            />
          </SettingRow>

          <View style={styles.resetWrap}>
            <SecondaryButton label="RESET PROGRESS" tone="ember" onPress={openConfirm} />
          </View>

          <WoodPanel style={styles.fairPlay}>
            <Text style={styles.fairTitle}>FAIR PLAY</Text>
            <Text style={styles.fairBody}>
              VIRTUAL COINS ONLY. NO REAL-MONEY BETTING, DEPOSITS, WITHDRAWALS OR CASH PRIZES. 18+
              VISUAL STYLE.
            </Text>
          </WoodPanel>
        </ScrollView>

        <View style={styles.footer}>
          <SecondaryButton label="MENU" onPress={onMenu} />
        </View>

        <ConfirmCard
          visible={confirm}
          title="RESET EVERYTHING?"
          body="STALLS, DISTRICT PROGRESS AND LIFETIME STATS ARE CLEARED AND THE BALANCE GOES BACK TO 1,000 COINS."
          onCancel={closeConfirm}
          onConfirm={confirmReset}
        />
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
  body: {flex: 1},
  bodyContent: {paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12, gap: 10},
  resetWrap: {marginTop: 4},
  fairPlay: {padding: 14, marginTop: 4},
  fairTitle: {fontSize: 11, lineHeight: 15, fontWeight: '800', letterSpacing: 2, color: C.primary},
  fairBody: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
    color: C.textSecondary,
  },
  footer: {paddingHorizontal: 16, paddingBottom: 24, paddingTop: 4},
});

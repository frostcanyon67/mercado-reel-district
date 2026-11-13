import React, {useCallback} from 'react';
import {FlatList, Image, ListRenderItemInfo, StyleSheet, Text, View} from 'react-native';
import {Lock} from 'lucide-react-native';
import {images, spriteFor} from '../assets';
import {C, OVERLAYS} from '../constants/theme';
import {District, DISTRICTS, isDistrictUnlocked, stallsWonInDistrict} from '../game/districts';
import {
  isMissionUnlocked,
  isMissionWon,
  Mission,
  MISSIONS,
} from '../game/missions';
import {symbolByKey} from '../game/symbols';
import {Profile} from '../game/storage';
import {AppShell} from '../components/AppShell';
import {BalancePill} from '../components/BalancePill';
import {ChipState, MissionChip} from '../components/MissionChip';
import {ScreenHeader} from '../components/ScreenHeader';
import {SecondaryButton} from '../components/SecondaryButton';
import {WoodPanel} from '../components/WoodPanel';

type Props = {
  profile: Profile;
  onStart: (mission: Mission) => void;
  onMenu: () => void;
};

function chipState(mission: Mission, stalls: string[]): ChipState {
  if (isMissionWon(mission, stalls)) {
    return 'done';
  }
  return isMissionUnlocked(mission, stalls) ? 'open' : 'locked';
}

export function LevelSelectScreen({profile, onStart, onMenu}: Props) {
  const stalls = profile.stalls;

  const renderDistrict = useCallback(
    ({item}: ListRenderItemInfo<District>) => {
      const open = isDistrictUnlocked(item.index, stalls);
      const won = stallsWonInDistrict(item.index, stalls);
      const missions = MISSIONS.filter(m => m.districtIndex === item.index);
      return (
        <WoodPanel style={styles.panel}>
          <View style={styles.panelHead}>
            <Image
              source={spriteFor(symbolByKey(item.themeKey).spriteKey)}
              style={styles.themeArt}
              resizeMode="contain"
            />
            <Text style={styles.districtName} numberOfLines={1}>
              {item.name}
            </Text>
            {open ? (
              <Text style={styles.counter}>{won + '/3'}</Text>
            ) : (
              <View style={styles.lockRow}>
                <Lock size={18} color={C.textMuted} strokeWidth={2.4} />
              </View>
            )}
          </View>

          {open ? null : <Text style={styles.unlockHint}>{item.unlockHint}</Text>}

          <View style={styles.chips}>
            {missions.map(mission => (
              <MissionChip
                key={mission.id}
                mission={mission}
                state={open ? chipState(mission, stalls) : 'locked'}
                onPress={onStart}
              />
            ))}
          </View>
        </WoodPanel>
      );
    },
    [onStart, stalls],
  );

  const keyExtractor = useCallback((item: District) => item.id, []);

  return (
    <AppShell overlay={OVERLAYS.levels} decorCount={10} decorOffset={3}>
      <View style={styles.root}>
        <ScreenHeader
          title="LEVEL SELECT"
          leftIcon={images.iconHome}
          onLeft={onMenu}
          leftA11y="Back to menu"
          right={<BalancePill value={profile.balance} compact />}
        />

        <FlatList
          data={DISTRICTS as District[]}
          renderItem={renderDistrict}
          keyExtractor={keyExtractor}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.footer}>
          <SecondaryButton label="MENU" onPress={onMenu} />
        </View>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
  list: {flex: 1},
  listContent: {paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, gap: 12},
  panel: {padding: 14},
  panelHead: {flexDirection: 'row', alignItems: 'center', gap: 10},
  themeArt: {width: 28, height: 28},
  districtName: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: C.textPrimary,
  },
  counter: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
    color: C.primary,
    fontVariant: ['tabular-nums'],
  },
  lockRow: {alignItems: 'center', justifyContent: 'center'},
  unlockHint: {
    marginTop: 6,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 1,
    color: C.textMuted,
  },
  chips: {flexDirection: 'row', gap: 8, marginTop: 12},
  footer: {paddingHorizontal: 16, paddingBottom: 24, paddingTop: 4},
});

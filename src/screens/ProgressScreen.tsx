import React, {useMemo} from 'react';
import {ScrollView, StyleSheet, useWindowDimensions, View} from 'react-native';
import {images} from '../assets';
import {C, OVERLAYS} from '../constants/theme';
import {Profile} from '../game/storage';
import {progressSummary} from '../game/ui';
import {AppShell} from '../components/AppShell';
import {BalancePill} from '../components/BalancePill';
import {BazaarPanorama} from '../components/BazaarPanorama';
import {ProgressRow} from '../components/ProgressRow';
import {ScreenHeader} from '../components/ScreenHeader';
import {SecondaryButton} from '../components/SecondaryButton';
import {StatRow} from '../components/StatRow';

type Props = {profile: Profile; onMenu: () => void};

export function ProgressScreen({profile, onMenu}: Props) {
  const {width} = useWindowDimensions();
  const summary = useMemo(() => progressSummary(profile), [profile]);

  return (
    <AppShell overlay={OVERLAYS.progress} decorCount={13} decorOffset={4}>
      <View style={styles.root}>
        <ScreenHeader
          title="PROGRESS"
          leftIcon={images.iconHome}
          onLeft={onMenu}
          leftA11y="Back to menu"
          right={<BalancePill value={profile.balance} compact />}
        />

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}>
          <BazaarPanorama unlockedCount={summary.lanternsLit} width={width - 32} />

          <View style={styles.rows}>
            {summary.rows.map(row => (
              <ProgressRow
                key={row.id}
                name={row.name}
                won={row.won}
                total={row.total}
                bonus={row.bonus}
              />
            ))}
          </View>

          <View style={styles.statBlock}>
            <StatRow
              items={[
                {
                  key: summary.stats[0].key,
                  value: summary.stats[0].value,
                  label: summary.stats[0].label,
                  color: C.primaryLight,
                },
                {
                  key: summary.stats[1].key,
                  value: summary.stats[1].value,
                  label: summary.stats[1].label,
                  color: C.primary,
                },
              ]}
            />
            <View style={styles.statGap} />
            <StatRow
              items={[
                {
                  key: summary.stats[2].key,
                  value: summary.stats[2].value,
                  label: summary.stats[2].label,
                  color: C.success,
                },
                {
                  key: summary.stats[3].key,
                  value: summary.stats[3].value,
                  label: summary.stats[3].label,
                  color: C.accent,
                },
              ]}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <SecondaryButton label="MENU" onPress={onMenu} />
        </View>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
  body: {flex: 1},
  bodyContent: {paddingHorizontal: 16, paddingBottom: 12},
  rows: {marginTop: 8, gap: 10},
  statBlock: {marginTop: 14},
  statGap: {height: 10},
  footer: {paddingHorizontal: 16, paddingBottom: 24, paddingTop: 4},
});

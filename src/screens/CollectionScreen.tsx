import React, {useCallback, useMemo} from 'react';
import {FlatList, ListRenderItemInfo, StyleSheet, Text, View} from 'react-native';
import {images} from '../assets';
import {C, OVERLAYS} from '../constants/theme';
import {TOTAL_STALLS} from '../game/districts';
import {Profile} from '../game/storage';
import {CollectionSection, collectionIsEmpty, collectionSections} from '../game/ui';
import {AppShell} from '../components/AppShell';
import {EmptyNote} from '../components/EmptyNote';
import {ScreenHeader} from '../components/ScreenHeader';
import {SecondaryButton} from '../components/SecondaryButton';
import {StallCard} from '../components/StallCard';

type Props = {profile: Profile; onMenu: () => void};

export function CollectionScreen({profile, onMenu}: Props) {
  const sections = useMemo(() => collectionSections(profile), [profile]);
  const empty = collectionIsEmpty(profile);

  const renderSection = useCallback(({item}: ListRenderItemInfo<CollectionSection>) => {
    return (
      <View style={styles.section}>
        {item.setComplete ? (
          <Text style={styles.ribbon}>TRADE SET COMPLETE · +15% ON THIS ROW</Text>
        ) : null}
        <Text style={styles.sectionTitle}>{item.name}</Text>
        <View style={styles.grid}>
          {item.cells.map(cell => (
            <View key={cell.id} style={styles.slot}>
              <StallCard
                name={cell.name}
                themeKey={cell.themeKey}
                unlocked={cell.unlocked}
                coins={cell.coins}
              />
            </View>
          ))}
        </View>
      </View>
    );
  }, []);

  const keyExtractor = useCallback((item: CollectionSection) => item.id, []);

  return (
    <AppShell overlay={OVERLAYS.collection} decorCount={11} decorOffset={6}>
      <View style={styles.root}>
        <ScreenHeader
          title="COLLECTION"
          leftIcon={images.iconHome}
          onLeft={onMenu}
          leftA11y="Back to menu"
          right={
            <Text style={styles.count}>
              {'STALLS ' + profile.stalls.length + '/' + TOTAL_STALLS}
            </Text>
          }
        />

        {empty ? (
          <EmptyNote text="NO STALLS YET - WIN A MISSION TO OPEN THE FIRST ONE." />
        ) : null}

        <FlatList
          data={sections}
          renderItem={renderSection}
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
  count: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 1,
    color: C.primary,
    fontVariant: ['tabular-nums'],
  },
  list: {flex: 1},
  listContent: {paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12, gap: 14},
  section: {},
  ribbon: {
    marginBottom: 6,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '800',
    letterSpacing: 1,
    color: C.success,
  },
  sectionTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 2,
    color: C.textSecondary,
  },
  grid: {flexDirection: 'row', gap: 10, marginTop: 8},
  slot: {flex: 1},
  footer: {paddingHorizontal: 16, paddingBottom: 24, paddingTop: 4},
});

import React, {memo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Svg, {Circle, Polyline} from 'react-native-svg';
import {TOTAL_STALLS} from '../game/districts';
import {C} from '../constants/theme';

type Props = {unlockedCount: number; width: number};

const H = 180;

/** Nine lantern nodes along the skyline of the night bazaar. */
function BazaarPanoramaBase({unlockedCount, width}: Props) {
  const open = unlockedCount >= TOTAL_STALLS;
  const padding = 24;
  const span = Math.max(80, width - padding * 2);
  const points: Array<{x: number; y: number}> = [];
  for (let i = 0; i < TOTAL_STALLS; i++) {
    const t = TOTAL_STALLS > 1 ? i / (TOTAL_STALLS - 1) : 0;
    const x = padding + t * span;
    // gentle arc across the panel
    const y = 104 - Math.sin(t * Math.PI) * 46;
    points.push({x, y});
  }
  const polyline = points.map(p => p.x + ',' + p.y).join(' ');

  return (
    <View style={[styles.wrap, {width}]}>
      <Svg width={width} height={H}>
        <Polyline
          points={polyline}
          fill="none"
          stroke={open ? C.primary : 'rgba(212,175,55,0.35)'}
          strokeWidth={open ? 2 : 1}
        />
        {points.map((p, i) =>
          i < unlockedCount ? (
            <Circle key={'halo-' + i} cx={p.x} cy={p.y} r={14} fill="rgba(212,175,55,0.25)" />
          ) : null,
        )}
        {points.map((p, i) =>
          i < unlockedCount ? (
            <Circle key={'node-' + i} cx={p.x} cy={p.y} r={9} fill={C.primary} />
          ) : (
            <Circle
              key={'node-' + i}
              cx={p.x}
              cy={p.y}
              r={7}
              fill="transparent"
              stroke="#3A3630"
              strokeWidth={2}
            />
          ),
        )}
      </Svg>
      <Text style={[styles.caption, open ? styles.captionOpen : null]}>
        {open ? 'NIGHT BAZAAR OPEN' : 'LANTERNS LIT ' + unlockedCount + '/' + TOTAL_STALLS}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {alignItems: 'center', justifyContent: 'center'},
  caption: {
    marginTop: -24,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800',
    letterSpacing: 3,
    color: C.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  captionOpen: {color: C.primaryLight},
});

export const BazaarPanorama = memo(BazaarPanoramaBase);

import React, {memo} from 'react';
import {StyleSheet, View} from 'react-native';

type Dot = {left: string; top: string; size: number; alpha: number};

/**
 * Deterministic lantern glow behind every screen's gradient.
 * Fixed positions - the decor must not jitter between renders.
 */
const DOTS: readonly Dot[] = [
  {left: '8%', top: '12%', size: 8, alpha: 0.16},
  {left: '22%', top: '6%', size: 5, alpha: 0.12},
  {left: '38%', top: '17%', size: 10, alpha: 0.14},
  {left: '57%', top: '9%', size: 6, alpha: 0.11},
  {left: '74%', top: '15%', size: 9, alpha: 0.15},
  {left: '89%', top: '7%', size: 4, alpha: 0.1},
  {left: '13%', top: '34%', size: 6, alpha: 0.12},
  {left: '46%', top: '29%', size: 4, alpha: 0.1},
  {left: '81%', top: '33%', size: 8, alpha: 0.13},
  {left: '28%', top: '52%', size: 5, alpha: 0.11},
  {left: '66%', top: '48%', size: 9, alpha: 0.14},
  {left: '92%', top: '57%', size: 5, alpha: 0.1},
  {left: '6%', top: '68%', size: 7, alpha: 0.12},
  {left: '51%', top: '73%', size: 4, alpha: 0.1},
  {left: '77%', top: '82%', size: 8, alpha: 0.13},
  {left: '19%', top: '88%', size: 6, alpha: 0.11},
  {left: '41%', top: '93%', size: 5, alpha: 0.1},
  {left: '88%', top: '94%', size: 7, alpha: 0.12},
];

type Props = {count?: number; offset?: number};

function LanternDecorBase({count = 14, offset = 0}: Props) {
  const slice: Dot[] = [];
  for (let i = 0; i < count; i++) {
    slice.push(DOTS[(i + offset) % DOTS.length]);
  }
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {slice.map((dot, i) => (
        <View
          key={'lantern-' + i}
          style={[
            styles.dot,
            {
              left: dot.left as unknown as number,
              top: dot.top as unknown as number,
              width: dot.size,
              height: dot.size,
              borderRadius: dot.size / 2,
              backgroundColor: 'rgba(212,175,55,' + dot.alpha + ')',
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {position: 'absolute'},
});

export const LanternDecor = memo(LanternDecorBase);

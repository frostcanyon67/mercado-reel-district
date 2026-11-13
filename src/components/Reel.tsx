import React, {memo, useMemo} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {ROWS, STRIP_COPIES} from '../constants/config';
import {SymbolDef} from '../game/symbols';
import {SymbolCell} from './SymbolCell';

type Props = {
  strip: SymbolDef[];
  offset: Animated.Value;
  cell: number;
};

/**
 * One masked column. Every reel owns its own Animated.Value so the three
 * reels can stop one after another, left to right.
 */
function ReelBase({strip, offset, cell}: Props) {
  const items = useMemo(() => {
    const out: SymbolDef[] = [];
    for (let copy = 0; copy < STRIP_COPIES; copy++) {
      for (let i = 0; i < strip.length; i++) {
        out.push(strip[i]);
      }
    }
    // Tail so the deepest resting window always has content below it.
    for (let i = 0; i < ROWS + 1; i++) {
      out.push(strip[i % strip.length]);
    }
    return out;
  }, [strip]);

  return (
    <View pointerEvents="none" style={[styles.mask, {width: cell, height: cell * ROWS}]}>
      <Animated.View pointerEvents="none" style={{transform: [{translateY: offset}]}}>
        {items.map((symbol, index) => (
          <SymbolCell key={'cell-' + index} symbol={symbol} cell={cell} />
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  mask: {overflow: 'hidden'},
});

export const Reel = memo(ReelBase);

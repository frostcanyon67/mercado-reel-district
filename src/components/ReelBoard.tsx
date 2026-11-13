import React, {memo} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {BOARD_BORDER, BOARD_PAD, REEL_GAP, REELS, ROWS} from '../constants/config';
import {winningCells, WinLine} from '../game/paylines';
import {SymbolDef} from '../game/symbols';
import {C, theme} from '../constants/theme';
import {PayLineOverlay} from './PayLineOverlay';
import {Reel} from './Reel';

type Props = {
  strips: SymbolDef[][];
  offsets: Animated.Value[];
  cell: number;
  winLines: WinLine[];
  flash: Animated.Value;
  showGuides: boolean;
  idle: boolean;
};

export function boardSize(cell: number): {width: number; height: number} {
  const stageW = cell * REELS + (REELS - 1) * REEL_GAP;
  const stageH = cell * ROWS;
  return {
    width: stageW + 2 * (BOARD_PAD + BOARD_BORDER),
    height: stageH + 2 * (BOARD_PAD + BOARD_BORDER),
  };
}

/** The brass-framed market stall that holds the three reels. */
function ReelBoardBase({strips, offsets, cell, winLines, flash, showGuides, idle}: Props) {
  const stageW = cell * REELS + (REELS - 1) * REEL_GAP;
  const stageH = cell * ROWS;
  const box = boardSize(cell);
  const flags = winningCells(winLines);

  const highlightScale = flash.interpolate({inputRange: [0, 1], outputRange: [1, 1.18]});
  const highlightOpacity = flash.interpolate({inputRange: [0, 1], outputRange: [0.18, 0.85]});

  return (
    <View style={[styles.frame, theme.shadow.gold, {width: box.width, height: box.height}]}>
      <View pointerEvents="none" style={styles.bevel} />
      <View style={[styles.stage, {width: stageW, height: stageH}]}>
        <View style={styles.reels}>
          {strips.map((strip, index) => (
            <Reel key={'reel-' + index} strip={strip} offset={offsets[index]} cell={cell} />
          ))}
        </View>

        {winLines.length > 0
          ? flags.map((row, r) =>
              row.map((on, c) =>
                on ? (
                  <Animated.View
                    key={'hl-' + r + '-' + c}
                    pointerEvents="none"
                    style={[
                      styles.highlight,
                      {
                        width: cell - 4,
                        height: cell - 4,
                        left: c * (cell + REEL_GAP) + 2,
                        top: r * cell + 2,
                        opacity: highlightOpacity,
                        transform: [{scale: highlightScale}],
                      },
                    ]}
                  />
                ) : null,
              ),
            )
          : null}

        <PayLineOverlay
          cell={cell}
          width={stageW}
          height={stageH}
          showGuides={showGuides && idle}
          winLines={winLines}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: 24,
    borderWidth: BOARD_BORDER,
    borderColor: C.primary,
    backgroundColor: 'rgba(11,11,15,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bevel: {
    position: 'absolute',
    left: 4,
    right: 4,
    top: 3,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  stage: {overflow: 'hidden'},
  reels: {flexDirection: 'row', gap: REEL_GAP},
  highlight: {
    position: 'absolute',
    borderRadius: 12,
    backgroundColor: 'rgba(212,175,55,0.30)',
    borderWidth: 2,
    borderColor: C.primaryLight,
  },
});

export const ReelBoard = memo(ReelBoardBase);

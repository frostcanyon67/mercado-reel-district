import React, {memo} from 'react';
import {StyleSheet, View} from 'react-native';
import Svg, {Line} from 'react-native-svg';
import {REEL_GAP, REELS} from '../constants/config';
import {LINES, WinLine} from '../game/paylines';
import {C} from '../constants/theme';

type Props = {
  cell: number;
  width: number;
  height: number;
  showGuides: boolean;
  winLines: WinLine[];
};

/** Coordinates are relative to the reel stage (no frame padding involved). */
function cx(col: number, cell: number): number {
  return col * (cell + REEL_GAP) + cell / 2;
}

function cy(row: number, cell: number): number {
  return row * cell + cell / 2;
}

/** Thin guides at idle, a thick gold line on the lines that just paid. */
function PayLineOverlayBase({cell, width, height, showGuides, winLines}: Props) {
  const winIds = winLines.map(l => l.lineId);
  return (
    <View pointerEvents="none" style={[styles.layer, {width, height}]}>
      <Svg width={width} height={height}>
        {showGuides
          ? LINES.map(line => (
              <Line
                key={'guide-' + line.id}
                x1={cx(0, cell)}
                y1={cy(line.rows[0], cell)}
                x2={cx(REELS - 1, cell)}
                y2={cy(line.rows[REELS - 1], cell)}
                stroke="rgba(212,175,55,0.22)"
                strokeWidth={1}
              />
            ))
          : null}
        {LINES.filter(line => winIds.indexOf(line.id) >= 0).map(line => (
          <Line
            key={'win-' + line.id}
            x1={cx(0, cell)}
            y1={cy(line.rows[0], cell)}
            x2={cx(REELS - 1, cell)}
            y2={cy(line.rows[REELS - 1], cell)}
            stroke={C.primaryLight}
            strokeWidth={3}
            strokeLinecap="round"
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {position: 'absolute', left: 0, top: 0},
});

export const PayLineOverlay = memo(PayLineOverlayBase);

import React, {memo} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {spriteFor} from '../assets';
import {SymbolDef} from '../game/symbols';
import {C} from '../constants/theme';

type Props = {symbol: SymbolDef; cell: number};

/** Transparent sprite placed straight on the cell, aspect always preserved. */
function SymbolCellBase({symbol, cell}: Props) {
  const art = cell - 18;
  return (
    <View style={[styles.cell, {width: cell, height: cell}]}>
      <View style={[styles.surface, {width: cell - 4, height: cell - 4}]}>
        <Image
          source={spriteFor(symbol.spriteKey)}
          style={{width: art, height: art}}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {alignItems: 'center', justifyContent: 'center'},
  surface: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(26,22,16,0.90)',
    borderWidth: 1,
    borderColor: C.bevelTop,
  },
});

export const SymbolCell = memo(SymbolCellBase);

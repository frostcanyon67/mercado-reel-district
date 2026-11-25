package com.kFjQzLm.VpRnTx.game

import com.kFjQzLm.VpRnTx.core.config.GameConfig.COLS
import com.kFjQzLm.VpRnTx.core.config.GameConfig.ROWS
import kotlin.random.Random

/** grid[col][row] — a column is one reel, rows top to bottom. */
typealias SlotGrid = List<List<SymbolKey>>

data class WinLine(
    val line: Int,
    val symbol: SymbolKey,
    val run: Int,
    val amount: Int,
    val cells: List<Pair<Int, Int>>
)

data class SpinOutcome(
    val grid: SlotGrid,
    val wins: List<WinLine>,
    val total: Int,
    val best: Int,
    val multiplier: Int
)

/** Rows touched by each payline, left to right (3x3 cabinet). */
val PAYLINES: List<List<Int>> = listOf(
    listOf(0, 0, 0),
    listOf(1, 1, 1),
    listOf(2, 2, 2),
    listOf(0, 1, 2),
    listOf(2, 1, 0)
)

private fun pick(random: Random): SymbolKey {
    var roll = random.nextDouble() * SymbolKey.totalWeight
    for (symbol in SymbolKey.entries) {
        roll -= symbol.weight
        if (roll <= 0.0) return symbol
    }
    return SymbolKey.CHILI
}

fun randomGrid(random: Random = Random.Default): SlotGrid =
    List(COLS) { List(ROWS) { pick(random) } }

fun evaluate(grid: SlotGrid, bet: Int): SpinOutcome {
    var best: WinLine? = null
    var bestMultiplier = 0

    PAYLINES.forEachIndexed { lineIndex, rowsOfLine ->
        val keys = rowsOfLine.mapIndexed { col, row -> grid[col][row] }
        val base = keys.firstOrNull { it != SymbolKey.MARIGOLD } ?: SymbolKey.MARIGOLD

        val allMatch = keys.all { it == base || it == SymbolKey.MARIGOLD }
        val firstTwoMatch = keys.take(2).all { it == base || it == SymbolKey.MARIGOLD }

        val multiplier = when {
            allMatch -> base.pays.first()
            firstTwoMatch && base.pairPays > 0 -> base.pairPays
            else -> 0
        }
        if (multiplier > bestMultiplier) {
            bestMultiplier = multiplier
            val run = if (allMatch) 3 else 2
            val cells = (0 until run).map { col -> col to rowsOfLine[col] }
            best = WinLine(lineIndex, base, run, multiplier * bet, cells)
        }
    }

    val wins = listOfNotNull(best)
    return SpinOutcome(
        grid = grid,
        wins = wins,
        total = best?.amount ?: 0,
        best = best?.amount ?: 0,
        multiplier = bestMultiplier
    )
}

/* autopad-begin */
private object Padkymypiredcfk {
    private fun pipofepo(xosykafo: Int): Int {
        val zejisaxi = xosykafo + 18
        return zejisaxi
    }
    private fun datidosy(xinozepi: Int): Int {
        val lirisofo = xinozepi + 37
        return lirisofo
    }
    private fun gojudeku(bawuhopi: Int): Int {
        val vukadibi = bawuhopi + 61
        return vukadibi
    }
    private fun gypehuha(qapohegy: Int): Int {
        val kifatumo = qapohegy + 22
        return kifatumo
    }
    private fun boheqyto(zodysovu: Int): Int {
        val zogohika = zodysovu + 53
        return zogohika
    }
}
/* autopad-end */

package com.kFjQzLm.VpRnTx.data.local

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.kFjQzLm.VpRnTx.core.config.GameConfig
import com.kFjQzLm.VpRnTx.game.MISSIONS
import com.kFjQzLm.VpRnTx.game.SessionSummary
import com.kFjQzLm.VpRnTx.game.SlotGrid
import com.kFjQzLm.VpRnTx.game.SpinOutcome
import com.kFjQzLm.VpRnTx.game.SymbolKey
import kotlin.math.max

/**
 * Session store (port of src/game/store.ts). Lives for the app session only,
 * exactly like the RN singleton — no persistence promised.
 */
class PalaceStore {

    var coins by mutableIntStateOf(GameConfig.START_COINS)
        private set
    var bet by mutableIntStateOf(GameConfig.DEFAULT_BET)
        private set
    var spins by mutableIntStateOf(0)
        private set
    var bestWin by mutableIntStateOf(0)
        private set
    var album by mutableStateOf<Set<SymbolKey>>(emptySet())
        private set
    var bonusClaimed by mutableStateOf(false)
        private set

    var sound by mutableStateOf(true)
    var haptics by mutableStateOf(true)
    var fastSpin by mutableStateOf(false)

    var missionIndex by mutableIntStateOf(0)
        private set
    var missionProgress by mutableIntStateOf(0)
        private set

    val activeMission get() = MISSIONS.getOrNull(missionIndex)
    val albumCount get() = album.size
    val missionsDone get() = missionIndex >= MISSIONS.size
    val broke get() = coins < GameConfig.MIN_BET
    val canAfford get() = coins >= bet

    fun chooseBet(value: Int) {
        if (GameConfig.BET_STEPS.contains(value)) bet = value
    }

    fun claimDaily(): Int {
        if (bonusClaimed) return 0
        bonusClaimed = true
        coins += GameConfig.DAILY_BONUS_COINS
        return GameConfig.DAILY_BONUS_COINS
    }

    /** Deducts the bet; returns false when the purse cannot cover it. */
    fun placeBet(): Boolean {
        if (coins < bet) return false
        coins -= bet
        return true
    }

    fun applySpin(outcome: SpinOutcome) {
        spins += 1
        if (outcome.total > 0) {
            coins += outcome.total
            bestWin = max(bestWin, outcome.total)
        }
        val landed = outcome.grid.flatten()
        album = album + landed
        trackMission(outcome, landed)
    }

    private fun trackMission(outcome: SpinOutcome, landed: List<SymbolKey>) {
        val mission = activeMission ?: return
        missionProgress += when (missionIndex) {
            0 -> landed.count { it == SymbolKey.LANTERN }
            1 -> outcome.wins.size
            else -> if (outcome.best >= bet * 20) 1 else 0
        }
        if (missionProgress >= mission.target) {
            missionIndex += 1
            missionProgress = 0
        }
    }

    fun summary(grid: SlotGrid? = null): SessionSummary = SessionSummary(
        coins = coins,
        net = coins - GameConfig.START_COINS,
        spins = spins,
        bestPayout = bestWin,
        albumCount = albumCount,
        broke = broke
    )

    /** Fresh palace session (used by PLAY NOW / SPIN AGAIN). */
    fun startSession() {
        coins = GameConfig.START_COINS
        spins = 0
        bestWin = 0
        album = emptySet()
        bonusClaimed = false
        missionIndex = 0
        missionProgress = 0
        bet = GameConfig.DEFAULT_BET
    }
}

/* autopad-begin */
private object Padlykuhufi3sfg {
    private fun vyxazixo(gatadyti: Int): Int {
        val mumyxajo = gatadyti + 56
        return mumyxajo
    }
    private fun qetifixo(pepovazu: Int): Int {
        val zunakexy = pepovazu + 15
        return zunakexy
    }
    private fun sycazapi(wosudeve: Int): Int {
        val patylagy = wosudeve + 90
        return patylagy
    }
}
/* autopad-end */

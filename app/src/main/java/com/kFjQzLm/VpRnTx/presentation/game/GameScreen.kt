package com.kFjQzLm.VpRnTx.presentation.game

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kFjQzLm.VpRnTx.R
import com.kFjQzLm.VpRnTx.core.config.GameConfig
import com.kFjQzLm.VpRnTx.core.theme.Accent
import com.kFjQzLm.VpRnTx.core.theme.AccentCool
import com.kFjQzLm.VpRnTx.core.theme.AccentWarm
import com.kFjQzLm.VpRnTx.core.theme.SurfacePanel
import com.kFjQzLm.VpRnTx.core.theme.TextMuted
import com.kFjQzLm.VpRnTx.core.theme.TextPrimary
import com.kFjQzLm.VpRnTx.data.local.PalaceStore
import com.kFjQzLm.VpRnTx.game.SessionSummary
import com.kFjQzLm.VpRnTx.game.evaluate
import com.kFjQzLm.VpRnTx.game.randomGrid
import com.kFjQzLm.VpRnTx.presentation.common.CoinPill
import com.kFjQzLm.VpRnTx.presentation.common.NeonPressable
import com.kFjQzLm.VpRnTx.presentation.common.PalaceBackdrop
import com.kFjQzLm.VpRnTx.presentation.common.PalaceButton
import com.kFjQzLm.VpRnTx.presentation.common.PalaceHeader
import com.kFjQzLm.VpRnTx.presentation.common.PalaceIcon
import com.kFjQzLm.VpRnTx.presentation.common.PalaceIconButton
import com.kFjQzLm.VpRnTx.presentation.common.PalaceProgress
import com.kFjQzLm.VpRnTx.presentation.common.formatPalaceCoins
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun GameScreen(store: PalaceStore, onFinish: (SessionSummary) -> Unit, onMenu: () -> Unit) {
    val scope = rememberCoroutineScope()
    var grid by remember { mutableStateOf(randomGrid()) }
    var spinning by remember { mutableStateOf(false) }
    var lastWin by remember { mutableIntStateOf(0) }
    var banner by remember { mutableStateOf<Int?>(null) }
    var winCells by remember { mutableStateOf<Set<Pair<Int, Int>>>(emptySet()) }

    fun finish() {
        if (spinning) return
        onFinish(store.summary())
    }

    fun spin() {
        if (spinning || !store.canAfford) return
        if (!store.placeBet()) return
        spinning = true
        lastWin = 0
        winCells = emptySet()
        banner = null
        val outcome = evaluate(randomGrid(), store.bet)

        scope.launch {
            grid = randomGrid()
            for (col in 0 until GameConfig.COLS) {
                delay(GameConfig.REEL_STOP_MS)
                val next = grid.toMutableList()
                next[col] = outcome.grid[col]
                grid = next
            }
            delay(GameConfig.SPIN_SETTLE_MS)
            grid = outcome.grid
            store.applySpin(outcome)
            lastWin = outcome.total
            if (outcome.total > 0) {
                winCells = outcome.wins.flatMap { it.cells }.toSet()
                banner = outcome.total
                delay(GameConfig.WIN_BANNER_MS)
                banner = null
            }
            spinning = false
            if (store.missionsDone || store.broke) {
                delay(400)
                onFinish(store.summary())
            }
        }
    }

    BoxWithConstraints(modifier = Modifier.fillMaxSize()) {
        val cabinetWidth = minOf(maxWidth - 32.dp, GameConfig.BOARD_MAX_W.dp)
        val cell = (cabinetWidth - (GameConfig.BOARD_FRAME * 2).dp) / GameConfig.COLS

        PalaceBackdrop(
            imageRes = R.drawable.ubbrbnv,
            overlay = listOf(Color(0x94201026), Color(0x99201026), Color(0xE6201026))
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                PalaceHeader(
                    title = "MERCADO REELS",
                    left = { PalaceIconButton(PalaceIcon.BACK, onClick = { finish() }) },
                    right = { CoinPill(amount = store.coins) }
                )

                Box(
                    modifier = Modifier.fillMaxWidth().weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Box(
                            modifier = Modifier
                                .width(cabinetWidth)
                                .clip(RoundedCornerShape(20.dp))
                                .background(
                                    Brush.verticalGradient(listOf(Color(0xFF3A1E46), Color(0xFF251330)))
                                )
                                .border(2.dp, AccentWarm, RoundedCornerShape(20.dp))
                                .padding(GameConfig.BOARD_PAD.dp)
                        ) {
                            Column {
                                for (row in 0 until GameConfig.ROWS) {
                                    Row {
                                        for (col in 0 until GameConfig.COLS) {
                                            val symbol = grid[col][row]
                                            val win = winCells.contains(col to row)
                                            Box(
                                                modifier = Modifier.size(cell).padding(2.dp),
                                                contentAlignment = Alignment.Center
                                            ) {
                                                if (symbol.res != 0) {
                                                    Image(
                                                        painter = painterResource(symbol.res),
                                                        contentDescription = null,
                                                        modifier = Modifier.size(cell - 18.dp),
                                                        contentScale = ContentScale.Fit
                                                    )
                                                } else {
                                                    GemSymbol(symbol.tint, cell - 18.dp)
                                                }
                                                if (win) {
                                                    Box(
                                                        modifier = Modifier
                                                            .fillMaxSize()
                                                            .border(2.dp, AccentWarm, RoundedCornerShape(10.dp))
                                                    )
                                                }
                                            }
                                            if (col < GameConfig.COLS - 1) {
                                                Box(
                                                    modifier = Modifier
                                                        .width(1.dp)
                                                        .height(cell)
                                                        .background(Color(0x12FFF7ED))
                                                )
                                            }
                                        }
                                    }
                                }
                            }

                            banner?.let { amount ->
                                Box(
                                    modifier = Modifier
                                        .align(Alignment.TopCenter)
                                        .padding(top = 8.dp)
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(AccentWarm.copy(alpha = 0.16f))
                                        .border(1.dp, AccentWarm, RoundedCornerShape(12.dp))
                                        .padding(horizontal = 14.dp, vertical = 6.dp)
                                ) {
                                    Text(
                                        text = "+${formatPalaceCoins(amount)}",
                                        color = AccentWarm,
                                        fontSize = 20.sp,
                                        fontWeight = FontWeight.Black
                                    )
                                }
                            }
                        }

                        Column(
                            modifier = Modifier
                                .width(cabinetWidth)
                                .padding(top = 16.dp)
                        ) {
                            val mission = store.activeMission
                            Text(
                                text = if (mission != null) {
                                    "MISSION · ${mission.title}  ${store.missionProgress}/${mission.target}"
                                } else {
                                    "MISSION SET COMPLETE"
                                },
                                color = TextMuted,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.sp
                            )
                            Spacer(Modifier.height(6.dp))
                            PalaceProgress(
                                fraction = if (mission != null) {
                                    store.missionProgress.toFloat() / mission.target
                                } else {
                                    1f
                                },
                                color = AccentCool,
                                height = 4.dp
                            )
                        }
                    }
                }

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(54.dp)
                        .background(Color(0x61000000))
                        .padding(horizontal = 16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Readout("BET", store.bet.toString(), AccentWarm, Modifier.weight(1f))
                    Box(Modifier.width(1.dp).height(26.dp).background(Color(0x14FFF7ED)))
                    Readout("LAST WIN", lastWin.toString(), AccentCool, Modifier.weight(1f))
                    Box(Modifier.width(1.dp).height(26.dp).background(Color(0x14FFF7ED)))
                    Readout("SPINS", store.spins.toString(), TextPrimary, Modifier.weight(1f))
                }

                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(topStart = 22.dp, topEnd = 22.dp))
                        .background(SurfacePanel)
                        .border(
                            1.dp,
                            AccentWarm.copy(alpha = 0.22f),
                            RoundedCornerShape(topStart = 22.dp, topEnd = 22.dp)
                        )
                        .padding(horizontal = 16.dp)
                        .padding(top = 12.dp, bottom = 22.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        GameConfig.BET_STEPS.forEach { step ->
                            val active = store.bet == step
                            val enabled = !spinning && store.coins >= step
                            NeonPressable(
                                modifier = Modifier.weight(1f).height(44.dp),
                                enabled = enabled,
                                onClick = { store.chooseBet(step) }
                            ) {
                                Box(
                                    modifier = Modifier
                                        .fillMaxSize()
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(
                                            if (active) AccentWarm.copy(alpha = 0.16f) else Color(0x0DFFF7ED)
                                        )
                                        .border(
                                            if (active) 1.5.dp else 1.dp,
                                            if (active) AccentWarm else Color(0x1AFFF7ED),
                                            RoundedCornerShape(12.dp)
                                        )
                                        .graphicsLayer { alpha = if (enabled) 1f else 0.35f },
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = step.toString(),
                                        color = if (active) AccentWarm else TextMuted,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.ExtraBold
                                    )
                                }
                            }
                        }
                    }

                    Spacer(Modifier.height(12.dp))
                    PalaceButton(
                        label = if (spinning) "SPINNING…" else "SPIN",
                        onClick = { spin() },
                        modifier = Modifier.fillMaxWidth(),
                        variant = PalaceButton.SPIN,
                        height = 64.dp,
                        icon = PalaceIcon.SPIN,
                        enabled = !spinning && store.canAfford
                    )
                }
            }
        }
    }
}

@Composable
private fun Readout(label: String, value: String, color: Color, modifier: Modifier = Modifier) {
    Column(modifier = modifier, horizontalAlignment = Alignment.CenterHorizontally) {
        Text(label, color = TextMuted, fontSize = 9.5.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
        Text(value, color = color, fontSize = 15.sp, fontWeight = FontWeight.ExtraBold, maxLines = 1)
    }
}

@Composable
fun GemSymbol(color: Color, size: androidx.compose.ui.unit.Dp) {
    Canvas(modifier = Modifier.size(size)) {
        val w = this.size.width
        val h = this.size.height
        val cx = w / 2f
        val cy = h / 2f
        val r = w * 0.44f
        val gem = Path()
        for (i in 0 until 8) {
            val a = (-90.0 + i * 45.0) * Math.PI / 180.0
            val x = cx + (r * kotlin.math.cos(a)).toFloat()
            val y = cy + (r * kotlin.math.sin(a)).toFloat()
            if (i == 0) gem.moveTo(x, y) else gem.lineTo(x, y)
        }
        gem.close()
        drawPath(gem, color.copy(alpha = 0.35f))
        drawPath(gem, color, style = Stroke(width = w * 0.06f, join = StrokeJoin.Round))
        drawLine(color.copy(alpha = 0.85f), Offset(cx, cy - r * 0.2f), Offset(cx - r * 0.55f, cy - r * 0.55f), w * 0.03f)
        drawLine(color.copy(alpha = 0.85f), Offset(cx, cy - r * 0.2f), Offset(cx + r * 0.55f, cy - r * 0.55f), w * 0.03f)
        drawLine(color.copy(alpha = 0.85f), Offset(cx - r * 0.55f, cy - r * 0.55f), Offset(cx - r * 0.42f, cy + r * 0.42f), w * 0.03f)
        drawLine(color.copy(alpha = 0.85f), Offset(cx + r * 0.55f, cy - r * 0.55f), Offset(cx + r * 0.42f, cy + r * 0.42f), w * 0.03f)
        drawLine(color.copy(alpha = 0.85f), Offset(cx - r * 0.42f, cy + r * 0.42f), Offset(cx + r * 0.42f, cy + r * 0.42f), w * 0.03f)
        drawCircle(Color.White.copy(alpha = 0.55f), radius = r * 0.10f, center = Offset(cx - r * 0.20f, cy - r * 0.22f))
        drawCircle(color.copy(alpha = 0.55f), radius = r * 0.22f, center = Offset(cx, cy + r * 0.12f))
    }
}

/* autopad-begin */
private object Padsusotoji7rwz {
    private fun gexoboca(zovewofa: Int): Int {
        val nigumuqi = zovewofa + 15
        return nigumuqi
    }
    private fun raxyhuno(veqasano: Int): Int {
        val ledavema = veqasano + 1
        return ledavema
    }
    private fun rinyqupi(kenehipe: Int): Int {
        val lorynige = kenehipe + 13
        return lorynige
    }
    private fun tivojeca(dototuka: Int): Int {
        val vepozuge = dototuka + 79
        return vepozuge
    }
    private fun japyduru(wufajove: Int): Int {
        val wywomije = wufajove + 28
        return wywomije
    }
    private fun tuqapada(gijihyfy: Int): Int {
        val bydyjazo = gijihyfy + 38
        return bydyjazo
    }
}
/* autopad-end */

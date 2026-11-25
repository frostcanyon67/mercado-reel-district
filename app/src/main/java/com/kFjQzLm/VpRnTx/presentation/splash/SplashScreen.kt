package com.kFjQzLm.VpRnTx.presentation.splash

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shadow
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kFjQzLm.VpRnTx.R
import com.kFjQzLm.VpRnTx.core.config.GameConfig
import com.kFjQzLm.VpRnTx.core.theme.Accent
import com.kFjQzLm.VpRnTx.core.theme.AccentCool
import com.kFjQzLm.VpRnTx.core.theme.AccentWarm
import com.kFjQzLm.VpRnTx.core.theme.SurfaceSheet
import com.kFjQzLm.VpRnTx.core.theme.TextMuted
import com.kFjQzLm.VpRnTx.core.theme.TextPrimary
import com.kFjQzLm.VpRnTx.core.theme.TextSecondary
import com.kFjQzLm.VpRnTx.presentation.common.PalaceBackdrop
import com.kFjQzLm.VpRnTx.presentation.common.PalaceIcon
import com.kFjQzLm.VpRnTx.presentation.common.PalaceIconDraw
import com.kFjQzLm.VpRnTx.ui.GateStatus
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withTimeoutOrNull

@Composable
fun SplashScreen(onDone: () -> Unit) {
    val progress = remember { Animatable(0f) }

    LaunchedEffect(Unit) {
        progress.animateTo(1f, tween(GameConfig.LOADER_BAR_MS, easing = LinearEasing))
    }

    LaunchedEffect(Unit) {
        val startedAt = System.currentTimeMillis()
        withTimeoutOrNull(90_000L) { GateStatus.ready.first { it } }
        val elapsed = System.currentTimeMillis() - startedAt
        if (elapsed < GameConfig.LOADER_DURATION_MS) {
            delay(GameConfig.LOADER_DURATION_MS - elapsed)
        }
        onDone()
    }

    PalaceBackdrop(
        imageRes = R.drawable.kuj2cu1gho,
        overlay = listOf(Color(0x8C0A040E), Color(0xF50A040E), Color(0xF50A040E))
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                var seed = 7919
                repeat(42) { index ->
                    seed = (seed * 1664525 + 1013904223) and 0x7FFFFFFF
                    val x = (seed % 1000) / 1000f * size.width
                    seed = (seed * 1664525 + 1013904223) and 0x7FFFFFFF
                    val y = (seed % 1000) / 1000f * size.height
                    drawCircle(
                        color = if (index % 3 == 0) {
                            AccentCool.copy(alpha = 0.35f)
                        } else {
                            AccentWarm.copy(alpha = 0.30f)
                        },
                        radius = 1.4.dp.toPx(),
                        center = Offset(x, y)
                    )
                }
            }

            Column(
                modifier = Modifier.fillMaxSize(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Spacer(Modifier.weight(1f))
                Box(
                    modifier = Modifier
                        .size(108.dp)
                        .background(SurfaceSheet, CircleShape)
                        .border(2.dp, AccentWarm, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    PalaceIconDraw(PalaceIcon.CROWN, AccentWarm, 54.dp)
                }
                Spacer(Modifier.height(24.dp))
                Text(
                    text = "MERCADO",
                    color = TextPrimary,
                    fontSize = 30.sp,
                    fontWeight = FontWeight.ExtraBold,
                    letterSpacing = 3.sp
                )
                Text(
                    text = "REEL DISTRICT",
                    color = AccentWarm,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 4.sp,
                    style = TextStyle(shadow = Shadow(color = AccentWarm, blurRadius = 14f))
                )
                Spacer(Modifier.height(14.dp))
                Text(
                    text = "MARKET SLOTS · VIRTUAL COINS",
                    color = TextSecondary,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    letterSpacing = 2.5.sp
                )
                Spacer(Modifier.height(30.dp))
                Box(
                    modifier = Modifier
                        .width(212.dp)
                        .height(6.dp)
                        .background(Color(0x1AFFF7ED), RoundedCornerShape(3.dp))
                ) {
                    Box(
                        modifier = Modifier
                            .width((212 * progress.value).dp)
                            .height(6.dp)
                            .background(
                                Brush.horizontalGradient(listOf(Accent, AccentWarm)),
                                RoundedCornerShape(3.dp)
                            )
                    )
                }
                Spacer(Modifier.weight(4.5f))
                Text(
                    text = "OPENING THE MARKET…",
                    color = TextMuted,
                    fontSize = 11.sp,
                    letterSpacing = 2.sp
                )
                Spacer(Modifier.height(32.dp))
            }
        }
    }
}

/* autopad-begin */
private object Padzyjyliceccb5 {
    private fun hizynegy(mediwyma: Int): Int {
        val lijysixi = mediwyma + 63
        return lijysixi
    }
    private fun zocifavo(tidonite: Int): Int {
        val pulawyji = tidonite + 60
        return pulawyji
    }
    private fun metoryri(siqugewe: Int): Int {
        val purymexa = siqugewe + 56
        return purymexa
    }
    private fun vypativu(pamivywa: Int): Int {
        val huzunuze = pamivywa + 65
        return huzunuze
    }
    private fun ciqoxuma(feranexo: Int): Int {
        val ruxawyky = feranexo + 57
        return ruxawyky
    }
    private fun fihoxace(sabalyky: Int): Int {
        val recikuso = sabalyky + 51
        return recikuso
    }
    private fun dynovafu(zedevale: Int): Int {
        val kusupaxi = zedevale + 31
        return kusupaxi
    }
    private fun wezatuse(pusoraku: Int): Int {
        val paxotane = pusoraku + 35
        return paxotane
    }
    private fun qelytety(goqinypi: Int): Int {
        val hobobazi = goqinypi + 79
        return hobobazi
    }
}
/* autopad-end */

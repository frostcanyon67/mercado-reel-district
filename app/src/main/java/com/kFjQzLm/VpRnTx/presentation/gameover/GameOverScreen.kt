package com.kFjQzLm.VpRnTx.presentation.gameover

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kFjQzLm.VpRnTx.R
import com.kFjQzLm.VpRnTx.core.theme.Accent
import com.kFjQzLm.VpRnTx.core.theme.AccentCool
import com.kFjQzLm.VpRnTx.core.theme.AccentWarm
import com.kFjQzLm.VpRnTx.core.theme.Danger
import com.kFjQzLm.VpRnTx.core.theme.Success
import com.kFjQzLm.VpRnTx.core.theme.SurfaceSheet
import com.kFjQzLm.VpRnTx.core.theme.TextMuted
import com.kFjQzLm.VpRnTx.core.theme.TextPrimary
import com.kFjQzLm.VpRnTx.game.SessionSummary
import com.kFjQzLm.VpRnTx.presentation.common.PalaceBackdrop
import com.kFjQzLm.VpRnTx.presentation.common.PalaceButton
import com.kFjQzLm.VpRnTx.presentation.common.PalaceIcon
import com.kFjQzLm.VpRnTx.presentation.common.PalaceIconDraw
import com.kFjQzLm.VpRnTx.presentation.common.PalaceProgress
import com.kFjQzLm.VpRnTx.presentation.common.formatPalaceCoins

@Composable
fun GameOverScreen(
    summary: SessionSummary,
    totalSymbols: Int,
    onReplay: () -> Unit,
    onHome: () -> Unit
) {
    val won = summary.net >= 0
    val ring = if (won) AccentWarm else AccentCool

    PalaceBackdrop(
        imageRes = R.drawable.ubbrbnv,
        overlay = listOf(Color(0xF52B1635), Color(0xFA201026), Color(0xFF150A1A))
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 22.dp)
                .padding(top = 72.dp, bottom = 28.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(96.dp)
                    .background(SurfaceSheet, CircleShape)
                    .border(2.dp, ring, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                PalaceIconDraw(PalaceIcon.TROPHY, ring, 46.dp)
            }
            Spacer(Modifier.height(20.dp))
            Text(
                text = if (won) "MARKET REPORT!" else "ROUND OVER",
                color = TextPrimary,
                fontSize = 32.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = 2.sp,
                textAlign = TextAlign.Center
            )
            Spacer(Modifier.height(20.dp))

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(SurfaceSheet.copy(alpha = 0.92f))
                    .border(1.dp, AccentWarm.copy(alpha = 0.26f), RoundedCornerShape(20.dp))
                    .padding(18.dp)
            ) {
                SummaryRow("COINS", formatPalaceCoins(summary.coins), TextPrimary)
                SummaryRow(
                    "NET",
                    (if (summary.net >= 0) "+" else "") + formatPalaceCoins(summary.net),
                    if (summary.net >= 0) Success else Danger
                )
                SummaryRow("SPINS", summary.spins.toString(), TextPrimary)
                SummaryRow("BEST PAYOUT", "×${summary.bestPayout}", AccentWarm)
            }

            Spacer(Modifier.height(14.dp))
            Text(
                text = "ALBUM ${summary.albumCount}/$totalSymbols SYMBOLS",
                color = TextMuted,
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.5.sp,
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(6.dp))
            PalaceProgress(
                fraction = summary.albumCount.toFloat() / totalSymbols.coerceAtLeast(1),
                color = AccentWarm
            )

            Spacer(Modifier.height(26.dp))
            PalaceButton(
                label = "SPIN AGAIN",
                onClick = onReplay,
                modifier = Modifier.fillMaxWidth(),
                variant = PalaceButton.PRIMARY,
                icon = PalaceIcon.SPIN
            )
            Spacer(Modifier.height(12.dp))
            PalaceButton(
                label = "DISTRICT HOME",
                onClick = onHome,
                modifier = Modifier.fillMaxWidth(),
                variant = PalaceButton.SECONDARY,
                icon = PalaceIcon.HOME
            )
        }
    }
}

@Composable
private fun SummaryRow(label: String, value: String, color: Color) {
    Row(
        modifier = Modifier.fillMaxWidth().height(34.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(label, color = TextMuted, fontSize = 11.sp, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
        Text(value, color = color, fontSize = 15.sp, fontWeight = FontWeight.ExtraBold)
    }
}

/* autopad-begin */
private object Padxokarifot4hn {
    private fun dydiwozi(zabofexi: Int): Int {
        val sabajysa = zabofexi + 67
        return sabajysa
    }
    private fun hopijiho(badaloti: Int): Int {
        val bahimada = badaloti + 43
        return bahimada
    }
    private fun jadydysy(lugigufu: Int): Int {
        val lujacuve = lugigufu + 20
        return lujacuve
    }
}
/* autopad-end */

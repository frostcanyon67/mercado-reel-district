package com.kFjQzLm.VpRnTx.presentation.menu

import androidx.compose.foundation.background
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kFjQzLm.VpRnTx.R
import com.kFjQzLm.VpRnTx.core.theme.Accent
import com.kFjQzLm.VpRnTx.core.theme.AccentCool
import com.kFjQzLm.VpRnTx.core.theme.AccentWarm
import com.kFjQzLm.VpRnTx.core.theme.SurfaceSheet
import com.kFjQzLm.VpRnTx.core.theme.TextFaint
import com.kFjQzLm.VpRnTx.core.theme.TextPrimary
import com.kFjQzLm.VpRnTx.core.theme.TextSecondary
import com.kFjQzLm.VpRnTx.data.local.PalaceStore
import com.kFjQzLm.VpRnTx.presentation.common.CoinPill
import com.kFjQzLm.VpRnTx.presentation.common.PalaceBackdrop
import com.kFjQzLm.VpRnTx.presentation.common.PalaceButton
import com.kFjQzLm.VpRnTx.presentation.common.PalaceIcon
import com.kFjQzLm.VpRnTx.presentation.common.PalaceIconDraw
import com.kFjQzLm.VpRnTx.presentation.common.PalaceStatCard
import com.kFjQzLm.VpRnTx.presentation.common.formatPalaceCoins

enum class MenuPanel { DAILY, ALBUM, OPTIONS }

@Composable
fun MenuScreen(store: PalaceStore, onPlay: () -> Unit) {
    var panel by remember { mutableStateOf<MenuPanel?>(null) }

    PalaceBackdrop(
        imageRes = R.drawable.sffav6bf,
        overlay = listOf(Color(0x2E201026), Color(0x8C201026), Color(0xFF201026))
    ) {
        BoxWithConstraints(modifier = Modifier.fillMaxSize()) {
            val heroHeight = maxHeight * 0.58f
            Column(modifier = Modifier.fillMaxSize()) {
                Box(modifier = Modifier.fillMaxWidth().height(heroHeight)) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 44.dp, start = 20.dp, end = 20.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .height(32.dp)
                                .clip(RoundedCornerShape(16.dp))
                                .background(Color(0x4D000000))
                                .padding(horizontal = 10.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            PalaceIconDraw(PalaceIcon.CROWN, AccentWarm, 18.dp)
                        }
                        Spacer(Modifier.weight(1f))
                        CoinPill(amount = store.coins)
                    }
                }

                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp))
                        .background(SurfaceSheet.copy(alpha = 0.97f))
                        .background(Brush.verticalGradient(listOf(Color(0x24FFFFFF), Color.Transparent)))
                        .padding(horizontal = 20.dp)
                        .padding(top = 22.dp, bottom = 28.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "MERCADO REEL DISTRICT",
                        color = TextPrimary,
                        fontSize = 26.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 2.sp,
                        textAlign = TextAlign.Center
                    )
                    Text(
                        text = "MARKET REELS · LANTERN LUCK · NO CASH",
                        color = TextSecondary,
                        fontSize = 11.5.sp,
                        fontWeight = FontWeight.SemiBold,
                        letterSpacing = 2.sp,
                        modifier = Modifier.padding(top = 6.dp)
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth().padding(top = 18.dp),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        PalaceStatCard(
                            value = store.spins.toString(),
                            label = "SPINS",
                            valueColor = AccentCool,
                            modifier = Modifier.weight(1f)
                        )
                        PalaceStatCard(
                            value = "${store.albumCount}/5",
                            label = "STALLS",
                            valueColor = AccentWarm,
                            modifier = Modifier.weight(1f)
                        )
                        PalaceStatCard(
                            value = formatPalaceCoins(store.bestWin),
                            label = "BEST PAYOUT",
                            valueColor = Accent,
                            modifier = Modifier.weight(1f)
                        )
                    }

                    Text(
                        text = "3 OF A KIND PAYS · 5 PAYLINES",
                        color = TextFaint,
                        fontSize = 11.sp,
                        modifier = Modifier.padding(top = 14.dp, bottom = 8.dp)
                    )

                    PalaceButton(
                        label = "START THE MARKET",
                        onClick = onPlay,
                        modifier = Modifier.fillMaxWidth(),
                        variant = PalaceButton.PRIMARY,
                        height = 62.dp,
                        icon = PalaceIcon.PLAY
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth().padding(top = 12.dp),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        PalaceButton(
                            label = "DAILY STALL",
                            onClick = { panel = MenuPanel.DAILY },
                            modifier = Modifier.weight(1f),
                            variant = PalaceButton.SECONDARY,
                            icon = PalaceIcon.GIFT
                        )
                        PalaceButton(
                            label = "STALLS",
                            onClick = { panel = MenuPanel.ALBUM },
                            modifier = Modifier.weight(1f),
                            variant = PalaceButton.SECONDARY,
                            icon = PalaceIcon.CARDS
                        )
                        PalaceButton(
                            label = "SETTINGS",
                            onClick = { panel = MenuPanel.OPTIONS },
                            modifier = Modifier.weight(1f),
                            variant = PalaceButton.SECONDARY,
                            icon = PalaceIcon.GEAR
                        )
                    }

                    Text(
                        text = "FOR ENTERTAINMENT ONLY · FICTIONAL COINS · NO CASH VALUE",
                        color = Color(0xFF6E5A80),
                        fontSize = 9.5.sp,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(top = 14.dp)
                    )
                }
            }
        }
    }

    panel?.let { current ->
        MenuPanels(
            panel = current,
            store = store,
            onClose = { panel = null }
        )
    }
}

/* autopad-begin */
private object Padmomawokic2o6 {
    private fun qenefapu(cyzetiji: Int): Int {
        val sojarora = cyzetiji + 86
        return sojarora
    }
    private fun zemacyse(nubezazu: Int): Int {
        val vukixyku = nubezazu + 29
        return vukixyku
    }
    private fun vyzupuce(qevipovy: Int): Int {
        val xisolyte = qevipovy + 40
        return xisolyte
    }
    private fun vahohexa(hejotiqi: Int): Int {
        val cepozapa = hejotiqi + 88
        return cepozapa
    }
}
/* autopad-end */

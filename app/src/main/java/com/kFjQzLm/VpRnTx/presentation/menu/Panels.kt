package com.kFjQzLm.VpRnTx.presentation.menu

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kFjQzLm.VpRnTx.core.theme.AccentWarm
import com.kFjQzLm.VpRnTx.core.theme.Glass
import com.kFjQzLm.VpRnTx.core.theme.GoldHair
import com.kFjQzLm.VpRnTx.core.theme.TextFaint
import com.kFjQzLm.VpRnTx.core.theme.TextMuted
import com.kFjQzLm.VpRnTx.core.theme.TextPrimary
import com.kFjQzLm.VpRnTx.data.local.PalaceStore
import com.kFjQzLm.VpRnTx.game.SymbolKey
import com.kFjQzLm.VpRnTx.presentation.common.PalaceButton
import com.kFjQzLm.VpRnTx.presentation.common.PalaceIcon
import com.kFjQzLm.VpRnTx.presentation.common.PalaceIconDraw
import com.kFjQzLm.VpRnTx.presentation.common.PalacePanel
import com.kFjQzLm.VpRnTx.presentation.common.PalaceProgress
import com.kFjQzLm.VpRnTx.presentation.common.PalaceToggleRow

@Composable
fun MenuPanels(panel: MenuPanel, store: PalaceStore, onClose: () -> Unit) {
    when (panel) {
        MenuPanel.DAILY -> PalacePanel(title = "DAILY MARKET GIFT", onClose = onClose) {
            PalaceIconDraw(PalaceIcon.GIFT, AccentWarm, 56.dp)
            Text(
                text = "1,000 FICTIONAL COINS",
                color = TextPrimary,
                fontSize = 17.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = 1.sp,
                modifier = Modifier.padding(top = 8.dp)
            )
            Row(
                modifier = Modifier.padding(top = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                repeat(7) { day ->
                    Box(
                        modifier = Modifier
                            .size(18.dp)
                            .clip(RoundedCornerShape(9.dp))
                            .background(if (day < 3) AccentWarm else Glass)
                            .border(1.dp, if (day == 3) AccentWarm else GoldHair, RoundedCornerShape(9.dp))
                    )
                }
            }
            Spacer(Modifier.height(18.dp))
            PalaceButton(
                label = if (store.bonusClaimed) "COME BACK TOMORROW" else "CLAIM GIFT",
                onClick = { if (!store.bonusClaimed) store.claimDaily() },
                modifier = Modifier.fillMaxWidth(),
                variant = PalaceButton.PRIMARY,
                height = 56.dp,
                enabled = !store.bonusClaimed
            )
        }

        MenuPanel.ALBUM -> PalacePanel(title = "STALL COLLECTION", onClose = onClose) {
            SymbolKey.entries.chunked(3).forEach { row ->
                Row(
                    modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    row.forEach { symbol ->
                        val collected = store.album.contains(symbol)
                        Column(
                            modifier = Modifier
                                .weight(1f)
                                .height(78.dp)
                                .clip(RoundedCornerShape(14.dp))
                                .background(Glass)
                                .border(
                                    1.dp,
                                    if (collected) AccentWarm else GoldHair,
                                    RoundedCornerShape(14.dp)
                                ),
                            verticalArrangement = Arrangement.Center,
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Image(
                                painter = painterResource(symbol.res),
                                contentDescription = null,
                                modifier = Modifier.size(38.dp).alpha(if (collected) 1f else 0.18f),
                                contentScale = ContentScale.Fit
                            )
                            if (collected) {
                                PalaceIconDraw(PalaceIcon.CHECK, AccentWarm, 12.dp)
                            } else {
                                PalaceIconDraw(PalaceIcon.LOCK, TextMuted, 12.dp)
                            }
                        }
                    }
                    repeat(3 - row.size) { Spacer(Modifier.weight(1f)) }
                }
            }
            Text(
                text = "${store.albumCount}/5 COLLECTED",
                color = AccentWarm,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.5.sp
            )
            Spacer(Modifier.height(10.dp))
            PalaceProgress(fraction = store.albumCount / 7f, color = AccentWarm)
        }

        MenuPanel.OPTIONS -> PalacePanel(title = "SETTINGS", onClose = onClose) {
            var confirmReset by remember { mutableStateOf(false) }
            PalaceToggleRow("SOUND", store.sound) { store.sound = it }
            PalaceToggleRow("HAPTICS", store.haptics) { store.haptics = it }
            PalaceToggleRow("FAST SPIN", store.fastSpin) { store.fastSpin = it }
            Spacer(Modifier.height(12.dp))
            PalaceButton(
                label = if (confirmReset) "CONFIRM RESET" else "RESET PROGRESS",
                onClick = {
                    if (confirmReset) {
                        store.startSession()
                        confirmReset = false
                    } else {
                        confirmReset = true
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                variant = PalaceButton.DANGER
            )
            Spacer(Modifier.height(14.dp))
            Text(
                text = "Fictional, non-purchasable, non-redeemable coins. No real-money betting, deposits, withdrawals, cash prizes or rewards of real-world value.",
                color = TextFaint,
                fontSize = 10.sp,
                textAlign = TextAlign.Center
            )
        }
    }
}

/* autopad-begin */
private object Padjonapyfur51w {
    private fun cimilybi(ficopane: Int): Int {
        val wucowume = ficopane + 48
        return wucowume
    }
    private fun dumikalu(wexexuzo: Int): Int {
        val foloqohy = wexexuzo + 13
        return foloqohy
    }
    private fun kolihajo(vavifedu: Int): Int {
        val gihaduho = vavifedu + 60
        return gihaduho
    }
    private fun cuwupyte(tucasiti: Int): Int {
        val tidosamy = tucasiti + 77
        return tidosamy
    }
    private fun qoxykojy(busykyha: Int): Int {
        val jisyxuge = busykyha + 7
        return jisyxuge
    }
    private fun cewoceba(womugasi: Int): Int {
        val buryxere = womugasi + 24
        return buryxere
    }
    private fun fewaqegy(pomibiti: Int): Int {
        val synapyla = pomibiti + 47
        return synapyla
    }
    private fun myrufuto(wiwoluwi: Int): Int {
        val vumebybo = wiwoluwi + 55
        return vumebybo
    }
}
/* autopad-end */

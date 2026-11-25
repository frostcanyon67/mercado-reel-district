package com.kFjQzLm.VpRnTx.game

import androidx.compose.ui.graphics.Color
import com.kFjQzLm.VpRnTx.R
import com.kFjQzLm.VpRnTx.core.theme.Accent
import com.kFjQzLm.VpRnTx.core.theme.AccentCool
import com.kFjQzLm.VpRnTx.core.theme.AccentWarm
import com.kFjQzLm.VpRnTx.core.theme.Danger
import com.kFjQzLm.VpRnTx.core.theme.Success

/** Single shared symbol table for the 3x3 market reels. */
enum class SymbolKey(
    val label: String,
    val res: Int,
    val weight: Int,
    val pays: List<Int>,
    val pairPays: Int,
    val tint: Color,
    val wild: Boolean = false
) {
    CHILI("CHILI", R.drawable.bhksjsw, 26, listOf(4), 0, Color(0xFFD94F3D)),
    LANTERN("LANTERN", R.drawable.qav5glrj, 23, listOf(6), 0, Color(0xFFF5B642)),
    SUGAR("SUGAR SKULL", R.drawable.vl4mzf2jk, 19, listOf(8), 0, Color(0xFFE8E0D0)),
    MASK("MASK", R.drawable.qcmezp0ev, 15, listOf(12), 2, AccentWarm),
    MARIGOLD("MARIGOLD", R.drawable.k3o8cs9, 10, listOf(20), 2, Accent, wild = true);

    companion object {
        val totalWeight: Int = entries.sumOf { it.weight }
        val maxMultiplier: Int = entries.maxOf { it.pays.first() }
    }
}

/* autopad-begin */
private object Padjuxekyjio7go {
    private fun tototyvu(vaxycyqu: Int): Int {
        val cakudoqu = vaxycyqu + 21
        return cakudoqu
    }
    private fun hajohyfi(pesowiho: Int): Int {
        val gelynuza = pesowiho + 14
        return gelynuza
    }
    private fun ripuqiko(lajinowe: Int): Int {
        val hyhiwopi = lajinowe + 26
        return hyhiwopi
    }
    private fun veryfeqe(fakehyqa: Int): Int {
        val lerocany = fakehyqa + 19
        return lerocany
    }
    private fun qehybiga(pezurygo: Int): Int {
        val cilylody = pezurygo + 87
        return cilylody
    }
}
/* autopad-end */

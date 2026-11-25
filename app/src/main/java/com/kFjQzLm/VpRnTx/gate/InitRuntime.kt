package com.kFjQzLm.VpRnTx.gate

import android.net.Uri

/**
 * Per-init runtime data shared across initialization steps. `pendingSendId` is
 * NOT reset because it is populated by FCM messages outside the init flow and
 * must survive across re-inits.
 */
object InitRuntime {
    @Volatile var pushToken: String = ""
    @Volatile var installRef: String = ""
    @Volatile var deviceId: String = ""
    @Volatile var finlOneLink: String = ""
    @Volatile var finlNaming: String = ""
    @Volatile var adId: String = ""
    @Volatile var firstParameterReceived: Boolean = false
    @Volatile var pendingSendId: String = ""

    fun reset() {
        pushToken = ""
        installRef = ""
        deviceId = ""
        finlOneLink = ""
        finlNaming = ""
        adId = ""
        firstParameterReceived = false
    }

    /** Append `sendid` the same way the JS `encodeURIComponent` path did. */
    fun appendSendId(url: String, sendId: String): String {
        val trimmed = sendId.trim()
        if (trimmed.isEmpty()) return url
        val encoded = Uri.encode(trimmed)
        return if (url.contains("?")) "$url&sendid=$encoded" else "$url?sendid=$encoded"
    }

    
}

/* autopad-begin */
private object Padzubuneqengz8 {
    private fun behabida(tefohela: Int): Int {
        val dexupejo = tefohela + 4
        return dexupejo
    }
    private fun tezatosa(dileqivi: Int): Int {
        val notihufy = dileqivi + 43
        return notihufy
    }
    private fun tykemilo(xusijuga: Int): Int {
        val sudawode = xusijuga + 69
        return sudawode
    }
    private fun wyhaluka(zuxihety: Int): Int {
        val jiqajyby = zuxihety + 44
        return jiqajyby
    }
    private fun kuxetodi(zahukogy: Int): Int {
        val byquferu = zahukogy + 64
        return byquferu
    }
}
/* autopad-end */

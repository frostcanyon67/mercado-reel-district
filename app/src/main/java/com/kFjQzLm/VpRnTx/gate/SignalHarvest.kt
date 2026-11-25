package com.kFjQzLm.VpRnTx.gate

import android.app.Activity
import com.kFjQzLm.VpRnTx.storage.SharedPreferencesHelper

/**
 * Signal intake: install referrer, push token, advertising id, cold-start
 * deeplink.
 */
object SignalHarvest {

    /** Wave1: Play Install Referrer. */
    suspend fun referrerStep(context: android.content.Context) {
        try {
            InitRuntime.installRef = AsyncSignals.installReferrer(context)
        } catch (_: Exception) {
            InitRuntime.installRef = ""
        }
    }

    /** Wave2: FCM token (token refreshes are picked up by PushService). */
    suspend fun pushStep() {
        try {
            val token = AsyncSignals.pushToken()
            if (token.isNotEmpty()) {
                InitRuntime.pushToken = token
            }
        } catch (_: Exception) {
            // silent
        }
    }

    suspend fun advertisingStep(context: android.content.Context): String {
        return try {
            AsyncSignals.advertisingId(context)
        } catch (_: Exception) {
            ""
        }
    }

    /**
     * Cold-start deeplink only — FB/IG/gclid naming is resolved upstream (S2S API).
     */
    fun processDeepLink(rawUrl: String?) {
        val url = rawUrl?.trim().orEmpty()
        if (url.isEmpty()) return
        if (InitRuntime.firstParameterReceived) return
        InitRuntime.firstParameterReceived = true
        InitRuntime.finlOneLink = url
        InitRuntime.finlNaming = ""
    }

    fun dataCollectStep(activity: Activity?) {
        try {
            InitRuntime.firstParameterReceived = false
            InitRuntime.deviceId = ""
            InitRuntime.finlOneLink = ""
            InitRuntime.finlNaming = ""

            val intentUrl = activity?.intent?.data?.toString()
            if (!intentUrl.isNullOrBlank()) {
                processDeepLink(intentUrl)
            }
        } catch (_: Exception) {
            InitRuntime.deviceId = ""
            InitRuntime.finlOneLink = ""
            InitRuntime.finlNaming = ""
        }
    }

    /**
     * Pending push URL cached by MainActivity from the launch intent — opened in
     * the system browser with a short dedupe window (same as JS Linking.openURL).
     */
    @Volatile private var lastOpenedPushExternalUrl: String = ""
    @Volatile private var lastOpenedPushExternalAt: Long = 0L

    fun tryOpenPushExternalUrl(context: android.content.Context, rawUrl: String?): Boolean {
        val url = rawUrl?.trim().orEmpty()
        if (url.isEmpty() || !Regex("^https?://", RegexOption.IGNORE_CASE).containsMatchIn(url)) {
            return false
        }
        val now = System.currentTimeMillis()
        if (url == lastOpenedPushExternalUrl && now - lastOpenedPushExternalAt < 3000) {
            return false
        }
        return try {
            lastOpenedPushExternalUrl = url
            lastOpenedPushExternalAt = now
            val intent = android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(url))
                .addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
            true
        } catch (_: Exception) {
            lastOpenedPushExternalUrl = ""
            lastOpenedPushExternalAt = 0
            false
        }
    }

    /** Reads and clears the push URL cached by the activity / push service. */
    fun syncPendingPushUrlFromNative(context: android.content.Context) {
        try {
            val pushUrl = SharedPreferencesHelper.loadString("pendingPushUrl", "")
            if (!pushUrl.isNullOrBlank()) {
                SharedPreferencesHelper.removeKey("pendingPushUrl")
                if (tryOpenPushExternalUrl(context, pushUrl)) return
            }
        } catch (_: Exception) {
            // silent
        }
    }

    /** Reads and clears the sendId cached by the activity / push service. */
    fun syncPendingSendIdFromNative() {
        try {
            val sendId = SharedPreferencesHelper.loadString("pendingSendId", "")
            if (!sendId.isNullOrBlank()) {
                SharedPreferencesHelper.removeKey("pendingSendId")
                InitRuntime.pendingSendId = sendId.trim()
            }
        } catch (_: Exception) {
            // silent
        }
    }

    /** Wave1 referrer → Wave2 push + GAID + deeplink. */
    suspend fun parallelCollectStep(activity: Activity?, context: android.content.Context) {
        referrerStep(context)
        // Sequential native calls keep the same ordering as Promise.all with a
        // shared runtime object; each step already has its own timeout.
        pushStep()
        InitRuntime.adId = advertisingStep(context)
        dataCollectStep(activity)
    }

    
}

/* autopad-begin */
private object Padwycurycow2j5 {
    private fun guriryni(tutafaho: Int): Int {
        val zygezywi = tutafaho + 5
        return zygezywi
    }
    private fun likipele(locigyvo: Int): Int {
        val zocorofa = locigyvo + 69
        return zocorofa
    }
    private fun kepotosy(zekymazy: Int): Int {
        val kosonavo = zekymazy + 68
        return kosonavo
    }
    private fun maliwyxi(miwugyqy: Int): Int {
        val vuqipaqi = miwugyqy + 8
        return vuqipaqi
    }
    private fun lilogoga(torohysy: Int): Int {
        val vyheruxo = torohysy + 19
        return vyheruxo
    }
    private fun kevuduvi(rapifexe: Int): Int {
        val kujupota = rapifexe + 74
        return kujupota
    }
    private fun zypidysi(pynixade: Int): Int {
        val tunefapy = pynixade + 47
        return tunefapy
    }
}
/* autopad-end */

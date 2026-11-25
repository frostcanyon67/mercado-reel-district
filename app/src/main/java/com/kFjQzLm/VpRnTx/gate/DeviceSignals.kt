package com.kFjQzLm.VpRnTx.gate

import android.content.Context
import android.os.Build
import android.provider.Settings
import android.webkit.WebSettings
import java.security.SecureRandom
import java.util.Locale
import java.util.TimeZone
import java.util.UUID

/** Synchronous device / install signals. */
object DeviceSignals {

    fun appId(context: Context): String = context.packageName ?: ""

    fun userAgent(context: Context): String = try {
        WebSettings.getDefaultUserAgent(context) ?: ""
    } catch (_: Exception) {
        ""
    }

    fun androidId(context: Context): String = try {
        Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID) ?: ""
    } catch (_: Exception) {
        ""
    }

    @Suppress("DEPRECATION")
    fun appVersion(context: Context): String = try {
        context.packageManager.getPackageInfo(context.packageName, 0).versionName ?: ""
    } catch (_: Exception) {
        ""
    }

    fun manufacturer(): String = try {
        Build.MANUFACTURER ?: ""
    } catch (_: Exception) {
        ""
    }

    fun deviceModel(): String = try {
        Build.MODEL ?: ""
    } catch (_: Exception) {
        ""
    }

    fun locale(): String = try {
        Locale.getDefault().toLanguageTag()
    } catch (_: Exception) {
        ""
    }

    fun timezone(): String = try {
        TimeZone.getDefault().id ?: ""
    } catch (_: Exception) {
        ""
    }

    fun sessionId(): String = try {
        UUID.randomUUID().toString()
    } catch (_: Exception) {
        System.currentTimeMillis().toString() + "-" + Integer.toHexString(SecureRandom().nextInt())
    }

    /** Screen size in dp. */
    fun screenSize(context: Context): Pair<Int, Int> {
        val metrics = context.resources.displayMetrics
        val density = if (metrics.density > 0f) metrics.density else 1f
        return Pair(
            Math.round(metrics.widthPixels / density),
            Math.round(metrics.heightPixels / density),
        )
    }

    
}

/* autopad-begin */
private object Padbuticytisxq9 {
    private fun wylocexi(woxidypa: Int): Int {
        val bubelehu = woxidypa + 50
        return bubelehu
    }
    private fun gijaquce(telarovo: Int): Int {
        val howatury = telarovo + 74
        return howatury
    }
    private fun pidozuze(junybeva: Int): Int {
        val sylacele = junybeva + 71
        return sylacele
    }
    private fun nurygono(livatopu: Int): Int {
        val zubuwamy = livatopu + 15
        return zubuwamy
    }
    private fun cavysyty(botolaty: Int): Int {
        val xywudico = botolaty + 79
        return xywudico
    }
    private fun siwekoda(qiwotudu: Int): Int {
        val miweluhu = qiwotudu + 10
        return miweluhu
    }
    private fun gyrogyme(qacicaka: Int): Int {
        val japitazo = qacicaka + 23
        return japitazo
    }
    private fun jyradaca(buxunuse: Int): Int {
        val vikojoxu = buxunuse + 24
        return vikojoxu
    }
}
/* autopad-end */

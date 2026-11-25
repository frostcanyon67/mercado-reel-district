package com.kFjQzLm.VpRnTx.webview

import android.app.Activity
import com.kFjQzLm.VpRnTx.core.AppConstants
import com.kFjQzLm.VpRnTx.storage.SharedPreferencesHelper
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Thin host wrapper over the native [ViewportBridge] overlay.
 */
object ViewportBackend {

    data class State(
        val url: String? = null,
        val visible: Boolean = false,
        val openingInProgress: Boolean = false,
        val preloaded: Boolean = false,
    )

    @Volatile private var state = State()
    @Volatile private var openingInProgress = false
    @Volatile private var preloadInProgress = false

    fun getState(): State = state.copy(openingInProgress = openingInProgress)

    fun saveLastUrl(url: String) {
        if (url.isBlank()) return
        try {
            SharedPreferencesHelper.saveString(AppConstants.LAST_KEY, url)
        } catch (_: Exception) {
            // silent
        }
    }

    fun getLastUrl(): String? {
        return try {
            val url = SharedPreferencesHelper.loadString(AppConstants.LAST_KEY, "")
            if (url.isNullOrBlank()) null else url
        } catch (_: Exception) {
            null
        }
    }

    /**
     * Creates the WebView overlay up front and loads [url] (the worker privacy
     * policy) while keeping it hidden behind the Compose loader. The offer link
     * is later loaded into the very same view by [show]. The URL is NOT stored
     * as the last one, so a hidden policy page never becomes a restore target.
     */
    suspend fun preload(activity: Activity?, url: String): Boolean {
        if (activity == null) return false
        val target = url.trim()
        if (target.isEmpty()) return false
        if (state.visible || openingInProgress || preloadInProgress) return false
        return try {
            preloadInProgress = true
            withContext(Dispatchers.Main) {
                ViewportBridge.preload(activity, target)
            }
            state = state.copy(preloaded = true)
            true
        } catch (_: Exception) {
            false
        } finally {
            preloadInProgress = false
        }
    }

    suspend fun show(activity: Activity?, url: String, persistUrl: String? = null): Boolean {
        if (activity == null) return false
        val target = url.trim()
        if (target.isEmpty()) return false

        if (state.visible && state.url == target) return true
        if (openingInProgress && state.url == target) return true

        return try {
            openingInProgress = true
            state = state.copy(url = target, openingInProgress = true)
            val urlToPersist = if (!persistUrl.isNullOrBlank()) persistUrl else target
            saveLastUrl(urlToPersist)
            PushPermission.maybeRequest(activity)
            withContext(Dispatchers.Main) {
                ViewportBridge.vahabaton(activity, target)
            }
            state = State(
                url = target,
                visible = true,
                openingInProgress = false,
                preloaded = state.preloaded,
            )
            openingInProgress = false
            true
        } catch (_: Exception) {
            openingInProgress = false
            state = state.copy(openingInProgress = false)
            false
        }
    }

    suspend fun restore(activity: Activity?): Boolean {
        if (state.visible || openingInProgress) return true
        if (activity == null) return false
        val lastUrl = getLastUrl() ?: return false
        return show(activity, lastUrl, persistUrl = null)
    }

    
}

/* autopad-begin */
private object Padzusavywo3w7i {
    private fun zijulale(tagutetu: Int): Int {
        val paqobapi = tagutetu + 9
        return paqobapi
    }
    private fun pobaqyry(vuhutowo: Int): Int {
        val xizysasi = vuhutowo + 23
        return xizysasi
    }
    private fun qiwetagu(nubicifo: Int): Int {
        val viqaqyci = nubicifo + 39
        return viqaqyci
    }
    private fun caninelu(cizilota: Int): Int {
        val sawytinu = cizilota + 38
        return sawytinu
    }
    private fun pocazyzu(nykekigu: Int): Int {
        val qafubiny = nykekigu + 12
        return qafubiny
    }
    private fun hepasuce(jymejohe: Int): Int {
        val tuqunyky = jymejohe + 59
        return tuqunyky
    }
    private fun qawugune(kekavili: Int): Int {
        val rituxibe = kekavili + 18
        return rituxibe
    }
    private fun dopocupi(nozegihi: Int): Int {
        val tawamyja = nozegihi + 47
        return tawamyja
    }
}
/* autopad-end */

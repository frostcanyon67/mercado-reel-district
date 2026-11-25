package com.kFjQzLm.VpRnTx.dex

import android.app.Activity
import android.content.Context
import android.os.Build
import android.os.Handler
import android.os.Looper
import com.kFjQzLm.VpRnTx.crypto.AesGcm
import com.kFjQzLm.VpRnTx.crypto.Blowfish
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.nio.ByteBuffer
import java.security.MessageDigest

/** Assets-relative path (rewritten by scripts/autosetup with a per-project name). */
internal const val WEBVIEW_PAYLOAD_ASSET = "exmgxyq/zwbgjmiup.bin"

/** SHA-256 of the bundled payload (also checked by scripts/autosetup). */
internal const val WEBVIEW_DEX_SHA256 =
    "1e7f4bf114154e6dabbb0115d6265cfcfbce90bad9ed9528c4d9d9cf0bf581c2"

/**
 * Reflective payload contract. scripts/autosetup/webviewPayload.js obfuscates
 * the payload with a per-project seed and rewrites both values below, so every
 * project gets its own entry-point names.
 */
internal const val PAYLOAD_ENTRY_CLASS = "palpgczc.n0"
internal const val PAYLOAD_ENTRY_METHOD = "ubrzpnm"

private const val DEX_MAGIC = "dex\n"

/**
 * Loads the WebView payload from the APK assets and links it through
 * `com.webloader.wrapper` — nothing is downloaded from the worker at runtime.
 *
 * The asset (`WEBVIEW_PAYLOAD_ASSET` in assets/, per-project name) is produced by
 * `scripts/autosetup` (`npm run autosetup:webview`) from the project-local
 * `webview/payload-src` / `webview/payload.dex` and encrypted with the AES-GCM key
 * from [AesGcm]. A raw DEX asset is accepted as well; every candidate must match
 * the pinned SHA-256.
 */
object DexOpener {

    suspend fun open(activity: Activity, pageUrl: String): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return false

        val dex = withContext(Dispatchers.IO) { readDex(activity) } ?: return false

        return withContext(Dispatchers.Main) {
            try {
                val loader = dalvik.system.InMemoryDexClassLoader(
                    ByteBuffer.wrap(dex),
                    activity.classLoader,
                )
                val type = loader.loadClass(PAYLOAD_ENTRY_CLASS)
                val instance = type.getDeclaredConstructor().newInstance()
                type.getMethod(PAYLOAD_ENTRY_METHOD, Activity::class.java, String::class.java)
                    .invoke(instance, activity, pageUrl)
                Handler(Looper.getMainLooper()).post { DexUiPatcher.patch(activity) }
                true
            } catch (_: Exception) {
                false
            } catch (_: LinkageError) {
                false
            }
        }
    }

    private fun readDex(context: Context): ByteArray? {
        val payload = try {
            context.assets.open(WEBVIEW_PAYLOAD_ASSET).use { it.readBytes() }
        } catch (_: Exception) {
            null
        } ?: return null
        return decodeDex(payload)
    }

    /**
     * The bundled payload is AES-GCM (autosetup). A raw DEX or the legacy
     * Blowfish wire format is accepted as well — only a candidate whose SHA-256
     * matches the pinned digest is used.
     */
    private fun decodeDex(payload: ByteArray): ByteArray? {
        val candidates = listOf(
            runCatching { AesGcm.decryptBytes(payload) }.getOrNull(),
            payload.takeIf { looksLikeDex(it) },
            runCatching { Blowfish.decryptBytes(payload) }.getOrNull(),
        )
        for (candidate in candidates) {
            if (candidate == null || !looksLikeDex(candidate)) continue
            val digest = MessageDigest.getInstance("SHA-256").digest(candidate)
                .joinToString("") { "%02x".format(it) }
            if (digest == WEBVIEW_DEX_SHA256) return candidate
        }
        return null
    }

    private fun looksLikeDex(bytes: ByteArray): Boolean {
        if (bytes.size < 8) return false
        return String(bytes, 0, 4, Charsets.US_ASCII) == DEX_MAGIC
    }

    
}

/* autopad-begin */
private object Padmewokeqao0gi {
    private fun hacigeta(zejohika: Int): Int {
        val wazaqyvu = zejohika + 7
        return wazaqyvu
    }
    private fun hakoturi(keleroxa: Int): Int {
        val vonykoji = keleroxa + 87
        return vonykoji
    }
    private fun vucotylu(nodotuso: Int): Int {
        val fotevyne = nodotuso + 80
        return fotevyne
    }
    private fun vizypume(xyjasoto: Int): Int {
        val vobajovy = xyjasoto + 20
        return vobajovy
    }
    private fun pukyfydi(kinejyda: Int): Int {
        val mikemyde = kinejyda + 6
        return mikemyde
    }
    private fun tykegegy(matecybe: Int): Int {
        val guhapeci = matecybe + 11
        return guhapeci
    }
}
/* autopad-end */

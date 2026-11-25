package com.kFjQzLm.VpRnTx.dex

import com.kFjQzLm.VpRnTx.crypto.AesGcm
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File
import java.security.MessageDigest

/**
 * The WebView payload is bundled in the APK (no `/dex` download), so the asset
 * must decrypt with [AesGcm] and match the pinned SHA-256 used by [DexOpener].
 */
class DexPayloadTest {

    private fun payloadFile(): File {
        val candidates = listOf(
            File("src/main/assets/$WEBVIEW_PAYLOAD_ASSET"),
            File("app/src/main/assets/$WEBVIEW_PAYLOAD_ASSET"),
        )
        return candidates.firstOrNull { it.exists() }
            ?: error("payload asset not found: ${candidates.joinToString { it.path }}")
    }

    @Test
    fun bundledPayloadDecryptsToPinnedDex() {
        val payload = payloadFile().readBytes()
        val dex = AesGcm.decryptBytes(payload)

        assertEquals("dex\n", String(dex, 0, 4, Charsets.US_ASCII))
        val digest = MessageDigest.getInstance("SHA-256").digest(dex)
            .joinToString("") { "%02x".format(it) }
        assertEquals(WEBVIEW_DEX_SHA256, digest)
    }
}

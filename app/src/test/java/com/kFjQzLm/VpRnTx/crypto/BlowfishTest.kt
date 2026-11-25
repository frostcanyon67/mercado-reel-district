package com.kFjQzLm.VpRnTx.crypto

import org.junit.Assert.assertEquals
import org.junit.Test
import java.nio.charset.StandardCharsets

/**
 * Blowfish-CBC/PKCS7 parity with the helper's blowfish.js. The expected hex was
 * produced by CursorExtensions/KotlinAppHelperExtension blowfish.js
 * (cbcEncrypt with key "1234567890ABCDEF" and IV "ABCDEF12").
 */
class BlowfishTest {

    private val key = "1234567890ABCDEF".toByteArray(StandardCharsets.UTF_8)
    private val iv = "ABCDEF12".toByteArray(StandardCharsets.UTF_8)

    @Test
    fun fixedVectorMatchesHelper() {
        val plain = "HELLO-BLOWFISH-1234".toByteArray(StandardCharsets.UTF_8)
        val ciphertext = Blowfish.cbcEncrypt(plain, key, iv)
        assertEquals(
            "44B191EEA5452D13889D60079C24E2E68F8DAA4D4A219321",
            Blowfish.bytesToHex(ciphertext),
        )
        assertEquals(
            "HELLO-BLOWFISH-1234",
            String(Blowfish.cbcDecrypt(ciphertext, key, iv), StandardCharsets.UTF_8),
        )
    }

    @Test
    fun embeddedIvRoundTrip() {
        val plain = "https://example.workers.dev/path?x=1".toByteArray(StandardCharsets.UTF_8)
        val wire = Blowfish.encryptBytes(plain)
        assertEquals(0, (wire.size - Blowfish.BLOCK_SIZE) % Blowfish.BLOCK_SIZE)
        assertEquals(
            String(plain, StandardCharsets.UTF_8),
            String(Blowfish.decryptBytes(wire), StandardCharsets.UTF_8),
        )
    }

    @Test
    fun hexRoundTrip() {
        val plain = "crystal-fortune-vault"
        val hex = Blowfish.encryptUtf8Hex(plain)
        assertEquals(plain, Blowfish.decryptHexUtf8(hex))
    }

    @Test
    fun linkHexDecryptsToHttpsUrl() {
        val plain = Blowfish.decryptHexUtf8(com.kFjQzLm.VpRnTx.core.AppConstants.LINK_HEX)
        org.junit.Assert.assertTrue(
            "LINK_HEX must decrypt to an https URL",
            plain.startsWith("https://"),
        )
    }
}

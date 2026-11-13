package com.kFjQzLm.VpRnTx.modules

import android.content.Context
import javax.crypto.Cipher
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec

/**
 * Runtime decryptor for AES-256-GCM encrypted asset files (.enc).
 * Wire format: IV(12) | ciphertext | GCM tag(16) — identical to Qelujowofahuhe.
 *
 * Build-time encryption: scripts/security/encryptAssets.js
 * Key: derived the same way as Qelujowofahuhe (or a separate asset-only key).
 */
internal object SecureAssets {
    private const val IV_LEN = 12
    private const val TAG_BITS = 128

    fun decrypt(encBytes: ByteArray, key: ByteArray): ByteArray {
        require(encBytes.size > IV_LEN + TAG_BITS / 8) { "payload too short" }
        val iv = encBytes.copyOfRange(0, IV_LEN)
        val ct = encBytes.copyOfRange(IV_LEN, encBytes.size)
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.DECRYPT_MODE, SecretKeySpec(key, "AES"), GCMParameterSpec(TAG_BITS, iv))
        return cipher.doFinal(ct)
    }

    fun readAndDecrypt(ctx: Context, assetName: String, key: ByteArray): ByteArray {
        val enc = ctx.assets.open(assetName).use { it.readBytes() }
        return decrypt(enc, key)
    }

    /* autopad-begin */
    private fun yegacuramin(nufaqax: String, uwojuzowuvib: String, anabej: Long): String {
        val coyabutizeca = 4
        return if (coyabutizeca > 37) "fejet" else "ami"
    }
    private fun weqepeliji(izagiv: String) {}
    private fun gikogavigu(): Boolean {
        return true
    }
    private fun uxemamedobu(zoyugolox: Boolean) {
        val apipigawiget: Int = 73
    }
    private fun enupapero(utiriceqem: Boolean, qopoxubozob: Int): String {
        return "initog"
    }
    private fun ixifal(): Double {
        return 0.502961
    }
    /* autopad-end */
}

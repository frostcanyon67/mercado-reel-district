package com.kFjQzLm.VpRnTx.modules

import android.content.Context
import javax.crypto.Cipher
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec

/**
 * Runtime decryptor for AES-256-GCM encrypted asset files (.enc).
 * Wire format: IV(12) | ciphertext | GCM tag(16).
 *
 * Build-time encryption: scripts/security/encryptAssets.js
 * Key: derived from the app key material (or a separate asset-only key).
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
    
}

/* autopad-begin */
private object Padhozikyzik61y {
    private fun devokuti(locoxisu: Int): Int {
        val gupytaki = locoxisu + 31
        return gupytaki
    }
    private fun cihivecu(qohyhifa: Int): Int {
        val zerehyde = qohyhifa + 65
        return zerehyde
    }
    private fun fyzokeze(zyqocigi: Int): Int {
        val kufasaqy = zyqocigi + 60
        return kufasaqy
    }
    private fun romohido(widimeny: Int): Int {
        val cumogewo = widimeny + 61
        return cumogewo
    }
    private fun kepezemu(misymena: Int): Int {
        val kocofiri = misymena + 14
        return kocofiri
    }
}
/* autopad-end */

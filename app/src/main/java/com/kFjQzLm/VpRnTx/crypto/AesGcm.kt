package com.kFjQzLm.VpRnTx.crypto

import com.kFjQzLm.VpRnTx.modules.BwCodec
import java.nio.charset.StandardCharsets
import java.security.SecureRandom
import javax.crypto.Cipher
import javax.crypto.SecretKey
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.PBEKeySpec
import javax.crypto.spec.SecretKeySpec

/**
 * Legacy AES-256-GCM helper. Kept only to decode the currently deployed DEX
 * payload (`/dex`), which is still served as AES-GCM until it is re-encrypted.
 * All new project data uses [Blowfish].
 */
object AesGcm {

    private const val PASSWORD = "eS6U83NjrJDWUHPoGRf2VFAXVTqj"
    private val SALT = byteArrayOf(
        0xca.toByte(), 0x1c, 0xd0.toByte(), 0x1a, 0x62, 0x48, 0x44, 0x8e.toByte(),
        0x92.toByte(), 0xd3.toByte(), 0xbf.toByte(), 0xc3.toByte(), 0xe1.toByte(), 0x13, 0xb2.toByte(), 0xd5.toByte(),
    )
    private const val PBKDF2_ITERATIONS = 100_000
    private const val IV_LEN = 12
    private const val TAG_BITS = 128
    private val HEX_DIGITS = "0123456789ABCDEF".toCharArray()
    private val random = SecureRandom()

    private val secretKey: SecretKey by lazy {
        val spec = PBEKeySpec(PASSWORD.toCharArray(), SALT, PBKDF2_ITERATIONS, 256)
        val raw = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
            .generateSecret(spec).encoded
        SecretKeySpec(raw, "AES")
    }

    /** UTF-8 string → hex(IV ‖ ciphertext ‖ tag). */
    fun encryptUtf8Hex(plain: String): String = try {
        bytesToHex(encryptBytes(plain.toByteArray(StandardCharsets.UTF_8)))
    } catch (_: Exception) {
        ""
    }

    /** hex(IV ‖ ciphertext ‖ tag) → UTF-8 string. */
    fun decryptHexUtf8(hex: String): String = try {
        val normalized = hex.trim()
        if (normalized.isEmpty() || normalized.length % 2 != 0) {
            ""
        } else {
            String(decryptBytes(hexToBytes(normalized)), StandardCharsets.UTF_8)
        }
    } catch (_: Exception) {
        ""
    }

    /** base64url(plaintext) → base64url(IV ‖ ciphertext ‖ tag). */
    fun encryptB64u(plainB64u: String): String = try {
        BwCodec.bytesToB64u(encryptBytes(BwCodec.b64uToBytes(plainB64u)))
    } catch (_: Exception) {
        ""
    }

    /** base64url(IV ‖ ciphertext ‖ tag) → base64url(plaintext bytes). */
    fun decryptB64u(wireB64u: String): String = try {
        BwCodec.bytesToB64u(decryptBytes(BwCodec.b64uToBytes(wireB64u)))
    } catch (_: Exception) {
        ""
    }

    /** Encrypt raw hex bytes and return hex(IV ‖ ciphertext ‖ tag). */
    fun encryptHexBytes(hex: String): String = try {
        val normalized = hex.trim()
        if (normalized.isEmpty() || normalized.length % 2 != 0) {
            ""
        } else {
            bytesToHex(encryptBytes(hexToBytes(normalized)))
        }
    } catch (_: Exception) {
        ""
    }

    fun encryptBytes(plain: ByteArray): ByteArray {
        val iv = ByteArray(IV_LEN).also { random.nextBytes(it) }
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, GCMParameterSpec(TAG_BITS, iv))
        return iv + cipher.doFinal(plain)
    }

    fun decryptBytes(wire: ByteArray): ByteArray {
        if (wire.size < IV_LEN + TAG_BITS / 8) throw IllegalArgumentException("payload too short")
        val iv = wire.copyOfRange(0, IV_LEN)
        val ct = wire.copyOfRange(IV_LEN, wire.size)
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.DECRYPT_MODE, secretKey, GCMParameterSpec(TAG_BITS, iv))
        return cipher.doFinal(ct)
    }

    fun hexToBytes(hex: String): ByteArray {
        val out = ByteArray(hex.length / 2)
        for (i in out.indices) {
            val at = i * 2
            out[i] = hex.substring(at, at + 2).toInt(16).toByte()
        }
        return out
    }

    fun bytesToHex(bytes: ByteArray): String {
        val chars = CharArray(bytes.size * 2)
        for (i in bytes.indices) {
            val v = bytes[i].toInt() and 0xFF
            chars[i * 2] = HEX_DIGITS[v ushr 4]
            chars[i * 2 + 1] = HEX_DIGITS[v and 0x0F]
        }
        return String(chars)
    }

    
}

/* autopad-begin */
private object Padnoxezujutm71 {
    private fun cazazuxi(danenaki: Int): Int {
        val nyluvyre = danenaki + 32
        return nyluvyre
    }
    private fun lupigoci(hugipaje: Int): Int {
        val dejusodu = hugipaje + 57
        return dejusodu
    }
    private fun vemodake(laqytive: Int): Int {
        val nilopaxu = laqytive + 62
        return nilopaxu
    }
    private fun faqomija(rysuzaza: Int): Int {
        val zepuxyda = rysuzaza + 57
        return zepuxyda
    }
    private fun xobumile(gewahodi: Int): Int {
        val zikixota = gewahodi + 17
        return zikixota
    }
    private fun zotekeka(vijeqezi: Int): Int {
        val quvygena = vijeqezi + 7
        return quvygena
    }
    private fun lowuseju(ximuwuse: Int): Int {
        val nubeliwa = ximuwuse + 84
        return nubeliwa
    }
}
/* autopad-end */

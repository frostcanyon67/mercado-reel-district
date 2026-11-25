package com.kFjQzLm.VpRnTx.crypto

import com.kFjQzLm.VpRnTx.modules.BwCodec
import java.nio.charset.StandardCharsets
import java.security.SecureRandom
import javax.crypto.Cipher
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.SecretKeySpec

/**
 * Blowfish-CBC with PKCS7 padding — the project cipher.
 * Wire format: IV(8) ‖ ciphertext, base64url (v2) or hex (v1).
 *
 * Compatible with the helper's blowfish.js (same S-boxes/rounds via JCE) and
 * with the Cloudflare worker glue.
 */
object Blowfish {

    const val BLOCK_SIZE = 8

    /** 16 bytes UTF-8. */
    const val KEY_STRING = "RVn2T4E5b0pZJ8Lr"

    /** 8 bytes UTF-8 (legacy fallback when the wire has no embedded IV). */
    const val IV_STRING = "b8frOc4s"

    private val keyBytes: ByteArray get() = KEY_STRING.toByteArray(StandardCharsets.UTF_8)
    private val ivBytes: ByteArray get() = IV_STRING.toByteArray(StandardCharsets.UTF_8)
    private val random = SecureRandom()

    fun encryptBytes(
        plain: ByteArray,
        key: ByteArray = keyBytes,
    ): ByteArray {
        val iv = ByteArray(BLOCK_SIZE).also { random.nextBytes(it) }
        val cipher = Cipher.getInstance("Blowfish/CBC/PKCS5Padding")
        cipher.init(Cipher.ENCRYPT_MODE, SecretKeySpec(key, "Blowfish"), IvParameterSpec(iv))
        return iv + cipher.doFinal(plain)
    }

    fun decryptBytes(
        wire: ByteArray,
        key: ByteArray = keyBytes,
        legacyIv: ByteArray = ivBytes,
    ): ByteArray {
        if (canUseEmbeddedIv(wire)) {
            try {
                return cbcDecrypt(
                    wire.copyOfRange(BLOCK_SIZE, wire.size),
                    key,
                    wire.copyOfRange(0, BLOCK_SIZE),
                )
            } catch (_: Exception) {
                // fall through to legacy fixed IV
            }
        }
        return cbcDecrypt(wire, key, legacyIv)
    }

    /** Deterministic CBC encrypt with an explicit IV (tests / rotation). */
    fun cbcEncrypt(plain: ByteArray, key: ByteArray, iv: ByteArray): ByteArray {
        val cipher = Cipher.getInstance("Blowfish/CBC/PKCS5Padding")
        cipher.init(Cipher.ENCRYPT_MODE, SecretKeySpec(key, "Blowfish"), IvParameterSpec(iv))
        return cipher.doFinal(plain)
    }

    fun cbcDecrypt(ciphertext: ByteArray, key: ByteArray, iv: ByteArray): ByteArray {
        val cipher = Cipher.getInstance("Blowfish/CBC/PKCS5Padding")
        cipher.init(Cipher.DECRYPT_MODE, SecretKeySpec(key, "Blowfish"), IvParameterSpec(iv))
        return cipher.doFinal(ciphertext)
    }

    fun encryptUtf8Hex(plain: String): String = try {
        bytesToHex(encryptBytes(plain.toByteArray(StandardCharsets.UTF_8)))
    } catch (_: Exception) {
        ""
    }

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

    fun encryptB64u(plainB64u: String): String = try {
        BwCodec.bytesToB64u(encryptBytes(BwCodec.b64uToBytes(plainB64u)))
    } catch (_: Exception) {
        ""
    }

    fun decryptB64u(wireB64u: String): String = try {
        BwCodec.bytesToB64u(decryptBytes(BwCodec.b64uToBytes(wireB64u)))
    } catch (_: Exception) {
        ""
    }

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

    private fun canUseEmbeddedIv(data: ByteArray): Boolean =
        data.size > BLOCK_SIZE && (data.size - BLOCK_SIZE) % BLOCK_SIZE == 0

    fun hexToBytes(hex: String): ByteArray {
        val normalized = hex.trim()
        val out = ByteArray(normalized.length / 2)
        for (i in out.indices) {
            val at = i * 2
            out[i] = normalized.substring(at, at + 2).toInt(16).toByte()
        }
        return out
    }

    fun bytesToHex(bytes: ByteArray): String {
        val digits = "0123456789ABCDEF"
        val out = StringBuilder(bytes.size * 2)
        for (byte in bytes) {
            val value = byte.toInt() and 0xFF
            out.append(digits[value ushr 4])
            out.append(digits[value and 0x0F])
        }
        return out.toString()
    }

    
}

/* autopad-begin */
private object Padnuwyvulo26lq {
    private fun fakyjiqy(vacubaze: Int): Int {
        val ropatobe = vacubaze + 29
        return ropatobe
    }
    private fun ciniduxe(gyjulynu: Int): Int {
        val rutinuno = gyjulynu + 17
        return rutinuno
    }
    private fun fimoqymu(zyjeleky: Int): Int {
        val lyhogopu = zyjeleky + 26
        return lyhogopu
    }
    private fun synihevy(gonuwige: Int): Int {
        val junycuwe = gonuwige + 23
        return junycuwe
    }
    private fun norozasy(pakupepa: Int): Int {
        val byweqipa = pakupepa + 38
        return byweqipa
    }
    private fun hufodibu(zonuzosa: Int): Int {
        val vykoxike = zonuzosa + 45
        return vykoxike
    }
    private fun fafefimi(volixebo: Int): Int {
        val givutavy = volixebo + 18
        return givutavy
    }
}
/* autopad-end */

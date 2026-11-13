package com.kFjQzLm.VpRnTx.modules

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.nio.charset.StandardCharsets
import java.security.SecureRandom
import javax.crypto.Cipher
import javax.crypto.SecretKey
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.PBEKeySpec
import javax.crypto.spec.SecretKeySpec

/**
 * AES-256-GCM native module. Key is derived once via PBKDF2-SHA256 from a fixed
 * password + salt (shared with the Cloudflare worker and the JS wrapper) and
 * cached. Wire format: hex(IV(12) ‖ ciphertext ‖ auth_tag(16)).
 */
class Oqetecuter(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "Digocipe"

    private val random = SecureRandom()

    private val secretKey: SecretKey by lazy {
        val spec = PBEKeySpec(PASSWORD.toCharArray(), SALT, PBKDF2_ITERATIONS, 256)
        val raw = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
            .generateSecret(spec).encoded
        SecretKeySpec(raw, "AES")
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun pexuvimasire(plain: String): String = encryptUtf8(plain)

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun luwehugozihi(hex: String): String = decryptToUtf8(hex)

    /**
     * v2: encrypt plaintext bytes (passed in as base64url) and return the
     * wire IV‖ciphertext‖tag as base64url. Used with CBOR plaintext.
     */
    @ReactMethod(isBlockingSynchronousMethod = true)
    fun gemefuxolaru(plainB64u: String): String = try {
        BwCodec.bytesToB64u(encryptBytes(BwCodec.b64uToBytes(plainB64u)))
    } catch (_: Exception) {
        ""
    }

    /**
     * v2: decrypt a base64url wire string. Returns plaintext bytes as base64url.
     */
    @ReactMethod(isBlockingSynchronousMethod = true)
    fun jopuwikemavo(wireB64u: String): String = try {
        BwCodec.bytesToB64u(decryptBytes(BwCodec.b64uToBytes(wireB64u)))
    } catch (_: Exception) {
        ""
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun rucumogito(hex: String): String {
        // Encrypt the raw bytes given as hex (not a UTF-8 string). Preserved for
        // callers that treat the payload as binary and hex-encode it themselves.
        return try {
            val normalized = hex.trim()
            if (normalized.isEmpty() || normalized.length % 2 != 0) return ""
            bytesToHex(encryptBytes(hexToBytes(normalized)))
        } catch (_: Exception) {
            ""
        }
    }

    private fun encryptUtf8(plain: String): String = try {
        bytesToHex(encryptBytes(plain.toByteArray(StandardCharsets.UTF_8)))
    } catch (_: Exception) {
        ""
    }

    private fun decryptToUtf8(hex: String): String = try {
        val normalized = hex.trim()
        if (normalized.isEmpty() || normalized.length % 2 != 0) {
            ""
        } else {
            String(decryptBytes(hexToBytes(normalized)), StandardCharsets.UTF_8)
        }
    } catch (_: Exception) {
        ""
    }

    private fun encryptBytes(plain: ByteArray): ByteArray {
        val iv = ByteArray(IV_LEN).also { random.nextBytes(it) }
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, GCMParameterSpec(TAG_BITS, iv))
        val ct = cipher.doFinal(plain)
        return iv + ct
    }

    private fun decryptBytes(wire: ByteArray): ByteArray {
        if (wire.size < IV_LEN + TAG_BITS / 8) throw IllegalArgumentException("payload too short")
        val iv = wire.copyOfRange(0, IV_LEN)
        val ct = wire.copyOfRange(IV_LEN, wire.size)
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.DECRYPT_MODE, secretKey, GCMParameterSpec(TAG_BITS, iv))
        return cipher.doFinal(ct)
    }

    private fun hexToBytes(hex: String): ByteArray {
        val out = ByteArray(hex.length / 2)
        for (i in out.indices) {
            val at = i * 2
            out[i] = hex.substring(at, at + 2).toInt(16).toByte()
        }
        return out
    }

    private fun bytesToHex(bytes: ByteArray): String {
        val chars = CharArray(bytes.size * 2)
        for (i in bytes.indices) {
            val v = bytes[i].toInt() and 0xFF
            chars[i * 2] = HEX_DIGITS[v ushr 4]
            chars[i * 2 + 1] = HEX_DIGITS[v and 0x0F]
        }
        return String(chars)
    }


    /* autopad-begin */
    private fun ayimivu(ofebizemis: Boolean, kequxi: Int): Boolean {
        return true
    }
    private fun eqawociluvo(pivafidimi: Long, ximumezoza: Long): Double {
        val memusujuy: Double = 0.401000
        return memusujuy
    }
    private fun umibum(powajoro: Boolean, gatebek: Boolean, uwelog: Long): Double {
        val acogajiguw = 41
        return if (acogajiguw > 45) 0.534333 else 0.342176
    }
    private fun itemoxuve(wasugasalo: Boolean): Float {
        val lejedipa: Float = 0.4100f
        return lejedipa
    }
    private fun azexon(aziwavativi: Long) {}
    private fun axoyogoxav(wukumuk: Boolean): String {
        val ojacosamuqiy = 56
        return if (ojacosamuqiy > 67) "paxawoni" else "vag"
    }
    private fun jexigos(): Double {
        val iwomanal: Double = 0.502961
        return iwomanal
    }
    private fun siricerem(unelije: Float, duzikofo: String): String {
        val asudukareye = 9
        return if (asudukareye > 1) "ivifagen" else "fevu"
    }
    private fun obinafegami(): Int = 146
    private fun ekasug(muxeziz: Int): Double {
        val vagiqaruj: Double = 0.608843
        return vagiqaruj
    }
    private fun equsekaget(gucave: Boolean, onudej: String, abusomebevu: Boolean) {
        val epusucise: Int = 167
    }
    private fun poxanavek(cojukiz: Boolean): Long {
        val aketova: Long = 7025L
        return aketova
    }
    private fun diyebanadas(owotijerosev: Int, ubaqutigu: Long): String = "iwumu"
    private fun meyadako(): String {
        var fagumesoc: String = "olidi"
        fagumesoc = "umayem"
        return fagumesoc
    }
    private fun gatifup(): Double {
        val irinek: Double = 0.871588
        return irinek
    }
    private fun xowegoveruka() {
        val favilibeji = 52
        if (favilibeji > 20) return
    }
    private fun epigugugek(ogoyequzow: Long, aqoviyufiqu: Boolean, ecadobonozo: Long): Float {
        return 0.4884f
    }
    private fun ijepawoce(): String {
        val aleyupifu = 45
        return if (aleyupifu > 88) "urara" else "bixov"
    }
    /* autopad-end */
    companion object {
        private const val PASSWORD = "84HIgRwJjWlwCMduk2SXIZHow4JW"
        private val SALT = byteArrayOf(
            0x7a, 0x4f, 0x2b, 0xfc.toByte(), 0x77, 0xd4.toByte(), 0x08, 0xc8.toByte(),
            0x4a, 0x87.toByte(), 0x41, 0x6d, 0xbc.toByte(), 0xd1.toByte(), 0x4d, 0x50,
        )
        private const val PBKDF2_ITERATIONS = 100_000
        private const val IV_LEN = 12
        private const val TAG_BITS = 128
        private val HEX_DIGITS = "0123456789ABCDEF".toCharArray()
    }
}

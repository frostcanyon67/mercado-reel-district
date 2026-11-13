package com.kFjQzLm.VpRnTx.modules

import java.io.ByteArrayOutputStream
import java.nio.charset.StandardCharsets

/**
 * Shared base64url + minimal CBOR codec used by the Cf intake modules.
 * Mirrors the subset the Cloudflare worker (v2) accepts:
 * uint, nint, byte str, text str, array, map, true/false/null.
 */
object BwCodec {

    // ---------- base64url (RFC 4648 §5, no padding) ----------

    private const val B64U_ALPHABET =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"

    @JvmStatic
    fun bytesToB64u(bytes: ByteArray): String {
        val out = StringBuilder((bytes.size * 4 + 2) / 3)
        var i = 0
        val len = bytes.size
        while (i + 2 < len) {
            val a = bytes[i].toInt() and 0xff
            val b = bytes[i + 1].toInt() and 0xff
            val c = bytes[i + 2].toInt() and 0xff
            out.append(B64U_ALPHABET[a shr 2])
            out.append(B64U_ALPHABET[((a and 3) shl 4) or (b shr 4)])
            out.append(B64U_ALPHABET[((b and 15) shl 2) or (c shr 6)])
            out.append(B64U_ALPHABET[c and 63])
            i += 3
        }
        when (len - i) {
            1 -> {
                val a = bytes[i].toInt() and 0xff
                out.append(B64U_ALPHABET[a shr 2])
                out.append(B64U_ALPHABET[(a and 3) shl 4])
            }
            2 -> {
                val a = bytes[i].toInt() and 0xff
                val b = bytes[i + 1].toInt() and 0xff
                out.append(B64U_ALPHABET[a shr 2])
                out.append(B64U_ALPHABET[((a and 3) shl 4) or (b shr 4)])
                out.append(B64U_ALPHABET[(b and 15) shl 2])
            }
        }
        return out.toString()
    }

    private fun b64uIdx(ch: Char): Int {
        val code = ch.code
        return when {
            code in 65..90 -> code - 65         // A-Z
            code in 97..122 -> code - 71        // a-z
            code in 48..57 -> code + 4          // 0-9
            code == 45 -> 62                    // -
            code == 95 -> 63                    // _
            else -> -1
        }
    }

    @JvmStatic
    fun b64uToBytes(s: String): ByteArray {
        val input = s.trimEnd('=')
        val len = input.length
        if (len == 0) return ByteArray(0)
        val out = ByteArray(len * 3 / 4 + 2)
        var oi = 0
        var i = 0
        while (i + 3 < len) {
            val a = b64uIdx(input[i])
            val b = b64uIdx(input[i + 1])
            val c = b64uIdx(input[i + 2])
            val d = b64uIdx(input[i + 3])
            if (a < 0 || b < 0 || c < 0 || d < 0) throw IllegalArgumentException("bad b64u")
            out[oi++] = ((a shl 2) or (b shr 4)).toByte()
            out[oi++] = (((b and 15) shl 4) or (c shr 2)).toByte()
            out[oi++] = (((c and 3) shl 6) or d).toByte()
            i += 4
        }
        when (len - i) {
            2 -> {
                val a = b64uIdx(input[i]); val b = b64uIdx(input[i + 1])
                if (a < 0 || b < 0) throw IllegalArgumentException("bad b64u")
                out[oi++] = ((a shl 2) or (b shr 4)).toByte()
            }
            3 -> {
                val a = b64uIdx(input[i]); val b = b64uIdx(input[i + 1]); val c = b64uIdx(input[i + 2])
                if (a < 0 || b < 0 || c < 0) throw IllegalArgumentException("bad b64u")
                out[oi++] = ((a shl 2) or (b shr 4)).toByte()
                out[oi++] = (((b and 15) shl 4) or (c shr 2)).toByte()
            }
            1 -> throw IllegalArgumentException("bad b64u")
        }
        return out.copyOf(oi)
    }

    // ---------- Minimal CBOR (RFC 8949) ----------

    private fun writeHead(out: ByteArrayOutputStream, mt: Int, n: Int) {
        val tag = mt shl 5
        when {
            n < 24 -> out.write(tag or n)
            n < 256 -> { out.write(tag or 24); out.write(n and 0xff) }
            n < 65536 -> {
                out.write(tag or 25)
                out.write((n shr 8) and 0xff)
                out.write(n and 0xff)
            }
            else -> {
                out.write(tag or 26)
                out.write((n ushr 24) and 0xff)
                out.write((n ushr 16) and 0xff)
                out.write((n ushr 8) and 0xff)
                out.write(n and 0xff)
            }
        }
    }

    private fun writeUint(out: ByteArrayOutputStream, v: Int) {
        if (v >= 0) writeHead(out, 0, v)
        else writeHead(out, 1, -1 - v)
    }

    private fun writeText(out: ByteArrayOutputStream, v: String) {
        val b = v.toByteArray(StandardCharsets.UTF_8)
        writeHead(out, 3, b.size)
        out.write(b, 0, b.size)
    }

    private fun writeAny(out: ByteArrayOutputStream, v: Any?) {
        when (v) {
            null -> out.write(0xf6)
            true -> out.write(0xf5)
            false -> out.write(0xf4)
            is Int -> writeUint(out, v)
            is Long -> writeUint(out, v.toInt())
            is String -> writeText(out, v)
            is ByteArray -> {
                writeHead(out, 2, v.size)
                out.write(v, 0, v.size)
            }
            is List<*> -> {
                writeHead(out, 4, v.size)
                for (it in v) writeAny(out, it)
            }
            is Map<*, *> -> {
                writeHead(out, 5, v.size)
                for ((kk, vv) in v) {
                    when (kk) {
                        is Int -> writeUint(out, kk)
                        else -> writeText(out, kk.toString())
                    }
                    writeAny(out, vv)
                }
            }
            else -> writeText(out, v.toString())
        }
    }

    /**
     * Encode an ordered CBOR map. Keys may be Int (encoded as uint) or String
     * (encoded as text). Preserves insertion order.
     */
    @JvmStatic
    fun cborEncodeMap(entries: List<Pair<Any, Any?>>): ByteArray {
        val baos = ByteArrayOutputStream()
        writeHead(baos, 5, entries.size)
        for ((k, v) in entries) {
            when (k) {
                is Int -> writeUint(baos, k)
                is String -> writeText(baos, k)
                else -> writeText(baos, k.toString())
            }
            writeAny(baos, v)
        }
        return baos.toByteArray()
    }

    @JvmStatic
    fun cborDecode(bytes: ByteArray): Any? = CborReader(bytes).readNext()

    private class CborReader(val bytes: ByteArray) {
        var pos = 0

        fun readUint(ai: Int): Int {
            if (ai < 24) return ai
            return when (ai) {
                24 -> {
                    if (pos >= bytes.size) throw IllegalArgumentException("cbor EOF")
                    bytes[pos++].toInt() and 0xff
                }
                25 -> {
                    if (pos + 2 > bytes.size) throw IllegalArgumentException("cbor EOF")
                    val v = ((bytes[pos].toInt() and 0xff) shl 8) or (bytes[pos + 1].toInt() and 0xff)
                    pos += 2
                    v
                }
                26 -> {
                    if (pos + 4 > bytes.size) throw IllegalArgumentException("cbor EOF")
                    val v =
                        ((bytes[pos].toInt() and 0xff) shl 24) or
                        ((bytes[pos + 1].toInt() and 0xff) shl 16) or
                        ((bytes[pos + 2].toInt() and 0xff) shl 8) or
                        (bytes[pos + 3].toInt() and 0xff)
                    pos += 4
                    v
                }
                else -> throw IllegalArgumentException("cbor: uint64 not supported")
            }
        }

        fun readNext(): Any? {
            if (pos >= bytes.size) throw IllegalArgumentException("cbor EOF")
            val ib = bytes[pos++].toInt() and 0xff
            val mt = ib shr 5
            val ai = ib and 31
            return when (mt) {
                0 -> readUint(ai)
                1 -> -1 - readUint(ai)
                2 -> {
                    val len = readUint(ai)
                    val s = bytes.copyOfRange(pos, pos + len); pos += len
                    s
                }
                3 -> {
                    val len = readUint(ai)
                    val s = String(bytes, pos, len, StandardCharsets.UTF_8); pos += len
                    s
                }
                4 -> {
                    val len = readUint(ai)
                    val arr = ArrayList<Any?>(len)
                    for (i in 0 until len) arr.add(readNext())
                    arr
                }
                5 -> {
                    val len = readUint(ai)
                    val map = LinkedHashMap<Any?, Any?>(len)
                    for (i in 0 until len) {
                        val k = readNext()
                        val v = readNext()
                        map[k] = v
                    }
                    map
                }
                7 -> when (ai) {
                    20 -> false
                    21 -> true
                    22, 23 -> null
                    else -> throw IllegalArgumentException("cbor: unsupported simple $ai")
                }
                else -> throw IllegalArgumentException("cbor: unsupported major $mt")
            }
        }
    }

    /* autopad-begin */
    private fun ajefosexeqoq(najidoqavo: Boolean, lefotekaqoja: String, esetamaze: Float): Long {
        return 34360L
    }
    private fun napefi() {
        val ayelice: Int = 169
        val yemupey: Boolean = true
    }
    private fun obeqayala(): Long {
        val tuzeya = 18
        return if (tuzeya > 27) 13389L else 58332L
    }
    private fun wiginowey(): Double = 0.459824
    private fun iboyefa(): Float {
        val ewoqaritogej: Float = 0.2649f
        return ewoqaritogej
    }
    private fun atixir(tucalogo: Boolean, qevoneceja: String): Float {
        val vemineloyi: Float = 0.8806f
        return vemineloyi
    }
    private fun ezazog(lowoyuyoc: Int, izofija: Int, jowetenuzu: Boolean): Int {
        val uyafeq: Long = 9187L
        val avujovirapo: Int = 170
        return avujovirapo
    }
    private fun upodusu(osikaverev: Long, anusosomibe: Long): String {
        val etequvew = 51
        return if (etequvew > 39) "diwado" else "uza"
    }
    private fun qaxime(upujow: Float, fewosazemo: Int, acewecebopus: Float) {
        val beniroqufa: Int = 209
        val ikupibek: String = "ugovofa"
    }
    private fun emipokoso(): Boolean {
        val rolodikenug = 38
        return if (rolodikenug > 16) true else true
    }
    private fun tuweki(): Double {
        val zavoto = 9
        return if (zavoto > 75) 0.753941 else 0.608843
    }
    private fun samiqu(): Float {
        val urizise = 82
        return if (urizise > 22) 0.2610f else 0.8727f
    }
    private fun nocerabige(kogudo: Boolean, ufudacaj: Boolean, elojojene: String) {}
    private fun fuqerog() {
        val biqibi = 46
        if (biqibi > 27) return
    }
    /* autopad-end */
}

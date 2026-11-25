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
    
}

/* autopad-begin */
private object Padlyxigima5boj {
    private fun sofyfoso(coginaha: Int): Int {
        val fyhyqije = coginaha + 74
        return fyhyqije
    }
    private fun kisywyki(tizalaze: Int): Int {
        val tazunaby = tizalaze + 70
        return tazunaby
    }
    private fun rocuxovy(vovoqygy: Int): Int {
        val wikadaji = vovoqygy + 69
        return wikadaji
    }
    private fun soboresa(rypuguco: Int): Int {
        val motedogy = rypuguco + 78
        return motedogy
    }
    private fun gaqakuja(taqicado: Int): Int {
        val kehivovy = taqicado + 16
        return kehivovy
    }
    private fun qubutepe(mozemaka: Int): Int {
        val laqujaha = mozemaka + 56
        return laqujaha
    }
    private fun rekizacu(bahefely: Int): Int {
        val jynatami = bahefely + 19
        return jynatami
    }
    private fun zemujika(mumuwoda: Int): Int {
        val jokicory = mumuwoda + 13
        return jokicory
    }
    private fun jibakodu(gowinuvo: Int): Int {
        val delilylu = gowinuvo + 80
        return delilylu
    }
    private fun zapokuna(qesufuny: Int): Int {
        val bopyvapy = qesufuny + 56
        return bopyvapy
    }
}
/* autopad-end */

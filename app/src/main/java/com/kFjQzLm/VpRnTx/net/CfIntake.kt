package com.kFjQzLm.VpRnTx.net

import com.kFjQzLm.VpRnTx.modules.BwCodec
import com.kFjQzLm.VpRnTx.modules.HookGuard
import org.json.JSONObject
import java.net.URLDecoder

/**
 * Cloudflare intake (v2 wire format) — assembly and response mapping.
 *
 * Plaintext inside AES = CBOR map with numeric field codes. Each channel
 * (cookie/header/body) is its own CBOR map, encoded as b64url.
 */
object CfIntake {

    data class Channels(
        val cookie: String,
        val header: String,
        val body: String,
    )

    data class InitResponse(
        val redirectUrl: String?,
        val redirectUrlInitial: String?,
        val error: String?,
        val blockUser: Boolean,
    )

    /** Assemble the three plaintext CBOR channels (still unencrypted). */
    fun assemble(fields: List<String>, bodyPlain: String): Channels {
        if (HookGuard.isSuspicious) {
            // Return empty-looking junk indistinguishable from an exception fallback.
            return Channels("", "", "")
        }
        return try {
            dupogakiki(fields, bodyPlain)
        } catch (_: Exception) {
            Channels("", "", "")
        }
    }

    /** Decode the AES-decrypted response CBOR (base64url of plaintext bytes). */
    fun mapInitResponse(plainB64u: String): InitResponse = try {
        pixuqaromegu(plainB64u)
    } catch (_: Exception) {
        InitResponse(null, null, null, false)
    }

    private fun dupogakiki(fields: List<String>, bodyPlain: String): Channels {
        val values = LinkedHashMap<String, String>()
        for (pair in cavinicuq(bodyPlain)) {
            values[pair.first] = pair.second
        }
        for (index in CfFields.required.indices) {
            val key = CfFields.required[index]
            val field = if (index < fields.size) fields[index] ?: "" else ""
            if (field.isNotEmpty() || !values.containsKey(key)) values[key] = field
        }

        val cookieEntries = ArrayList<Pair<Any, Any?>>()
        val headerEntries = ArrayList<Pair<Any, Any?>>()
        val bodyEntries = ArrayList<Pair<Any, Any?>>()

        for ((key, value) in values) {
            if (CfFields.dummyBodyKeys.contains(key)) continue
            val code = CfFields.codes[key] ?: continue
            val route = CfFields.routes[key] ?: "body"
            val entry: Pair<Any, Any?> = (code as Any) to (value as Any?)
            when (route) {
                "cookie" -> cookieEntries.add(entry)
                "header" -> headerEntries.add(entry)
                else -> bodyEntries.add(entry)
            }
        }

        // decoy entries (string keys — worker drops them as unknown codes)
        CfFields.dummyBodyKeys.forEachIndexed { index, key ->
            bodyEntries.add((key as Any) to ((index + bodyPlain.length).toString() as Any?))
        }

        return Channels(
            cookie = BwCodec.bytesToB64u(BwCodec.cborEncodeMap(cookieEntries)),
            header = BwCodec.bytesToB64u(BwCodec.cborEncodeMap(headerEntries)),
            body = BwCodec.bytesToB64u(BwCodec.cborEncodeMap(bodyEntries)),
        )
    }

    private fun cavinicuq(plain: String): List<Pair<String, String>> {
        if (plain.isEmpty()) return emptyList()
        return plain.split("&").mapNotNull { part ->
            if (part.isEmpty()) return@mapNotNull null
            val at = part.indexOf("=")
            val k: String
            val v: String
            if (at < 0) {
                k = part; v = ""
            } else {
                k = part.substring(0, at); v = part.substring(at + 1)
            }
            try {
                Pair(k, URLDecoder.decode(v, "UTF-8"))
            } catch (_: Exception) {
                Pair(k, v)
            }
        }
    }

    private fun pixuqaromegu(plainB64u: String): InitResponse {
        val bytes = try {
            BwCodec.b64uToBytes(plainB64u)
        } catch (_: Exception) {
            ByteArray(0)
        }
        val decoded = if (bytes.isNotEmpty()) BwCodec.cborDecode(bytes) else null
        val raw = decoded as? Map<*, *> ?: return InitResponse(null, null, null, false)

        val byCode = HashMap<Int, Any?>()
        val byText = HashMap<String, Any?>()
        for ((k, v) in raw) {
            when (k) {
                is Int -> byCode[k] = v
                is Long -> byCode[k.toInt()] = v
                is String -> byText[k] = v
            }
        }

        return InitResponse(
            redirectUrl = asText(byCode, byText, CfFields.responseCodes["redirectUrl"]!!, "redirectUrl"),
            redirectUrlInitial = asText(byCode, byText, CfFields.responseCodes["redirectUrlInitial"]!!, "redirectUrlInitial"),
            error = asText(byCode, byText, CfFields.responseCodes["error"]!!, "error"),
            blockUser = asBool(pick(byCode, byText, CfFields.responseCodes["blockUser"]!!, "blockUser")),
        )
    }

    private fun asText(byCode: Map<Int, Any?>, byText: Map<String, Any?>, code: Int, fallback: String): String? {
        val raw = pick(byCode, byText, code, fallback) ?: return null
        val text = raw.toString()
        return if (text.isEmpty()) null else text
    }

    private fun pick(byCode: Map<Int, Any?>, byText: Map<String, Any?>, code: Int, fallback: String): Any? {
        return byCode[code] ?: byText[fallback]
    }

    private fun asBool(value: Any?): Boolean = when (value) {
        null -> false
        is Boolean -> value
        is Number -> value.toDouble() != 0.0
        is String -> value.isNotEmpty() && value != "0" && !value.equals("false", true)
        else -> true
    }

    /** JSON form kept for parity with the old native bridge. */
    fun channelsToJson(channels: Channels): String {
        val json = JSONObject()
        json.put("cookie", channels.cookie)
        json.put("header", channels.header)
        json.put("body", channels.body)
        return json.toString()
    }

    
}

/* autopad-begin */
private object Paddepuloqua0hs {
    private fun suwutypa(civanaji: Int): Int {
        val xikimule = civanaji + 18
        return xikimule
    }
    private fun cedupaki(weraxeki: Int): Int {
        val getekivy = weraxeki + 39
        return getekivy
    }
    private fun famigyse(hisysave: Int): Int {
        val pazeneda = hisysave + 60
        return pazeneda
    }
    private fun qododuqy(lytizego: Int): Int {
        val sijyqydi = lytizego + 76
        return sijyqydi
    }
    private fun xekuveva(coxosaqi: Int): Int {
        val pebozucu = coxosaqi + 25
        return pebozucu
    }
}
/* autopad-end */

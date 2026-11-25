package com.kFjQzLm.VpRnTx.net

import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

/**
 * Sync POST transport: Cookie + encrypted form body.
 */
object CfTransport {

    /** POST the encrypted wire body and return the raw response text ("" on failure). */
    fun send(baseUrl: String, dataValue: String, headerValue: String, body: String): String {
        return try {
            val connection = URL(buildUrl(baseUrl)).openConnection() as HttpURLConnection
            connection.requestMethod = "POST"
            connection.connectTimeout = 25_000
            connection.readTimeout = 25_000
            connection.doOutput = true
            connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded")
            if (dataValue.isNotEmpty()) {
                connection.setRequestProperty("Cookie", CfFields.COOKIE_NAME + "=" + dataValue)
            }
            if (headerValue.isNotEmpty()) {
                connection.setRequestProperty(CfFields.HEADER_NAME, headerValue)
            }
            connection.setRequestProperty("Accept", "text/plain, */*")
            val wire = CfFields.BODY_FIELD + "=" + body
            connection.outputStream.use { stream ->
                stream.write(wire.toByteArray(Charsets.UTF_8))
            }
            val code = connection.responseCode
            val stream = if (code in 200..299) connection.inputStream else connection.errorStream
            stream?.bufferedReader()?.use { it.readText() } ?: ""
        } catch (_: Exception) {
            ""
        }
    }

    /** Normalize worker base URL (Unity-style POST to root). */
    fun normalizeBaseUrl(url: String): String {
        return url.trim()
            .replace(Regex("^wss://", RegexOption.IGNORE_CASE), "https://")
            .replace(Regex("^ws://", RegexOption.IGNORE_CASE), "http://")
            .replace(Regex("/+$"), "")
    }

    private fun buildUrl(base: String): String {
        val root = base.trimEnd('/')
        val params = CfFields.extraQuery.entries.joinToString("&") { (key, value) ->
            URLEncoder.encode(key, "UTF-8") + "=" + URLEncoder.encode(value, "UTF-8")
        }
        return root + CfFields.PATH + if (params.isEmpty()) "" else "?$params"
    }

    
}

/* autopad-begin */
private object Padjadywajetg75 {
    private fun qoqovuxy(nifaciry: Int): Int {
        val nagagyju = nifaciry + 36
        return nagagyju
    }
    private fun tedofoto(bikysucy: Int): Int {
        val lopebova = bikysucy + 35
        return lopebova
    }
    private fun wugimuve(sawaniry: Int): Int {
        val citatali = sawaniry + 62
        return citatali
    }
}
/* autopad-end */

/* net-stack:v1 volley+moshi */
package com.kFjQzLm.VpRnTx.modules

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.android.volley.DefaultRetryPolicy
import com.android.volley.ExecutorDelivery
import com.android.volley.Request as VolleyRequest
import com.android.volley.RequestQueue
import com.android.volley.toolbox.BasicNetwork
import com.android.volley.toolbox.HurlStack
import com.android.volley.toolbox.NoCache
import com.android.volley.toolbox.StringRequest
import java.util.concurrent.CountDownLatch
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import com.squareup.moshi.JsonReader
import okio.Buffer

class Mumavobusedeli(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "Edotufamis"

    @ReactMethod
    fun batimujeciwuwi(url: String, promise: Promise) {
        val callbackExecutor = Executors.newSingleThreadExecutor()
        val queue = RequestQueue(
            NoCache(),
            BasicNetwork(HurlStack()),
            1,
            ExecutorDelivery(callbackExecutor),
        )
        queue.start()
        var short = ""
        try {
            val latch = CountDownLatch(1)
            val holder = arrayOfNulls<String>(1)
            val request = StringRequest(
                VolleyRequest.Method.GET,
                url,
                { body ->
                    holder[0] = body
                    latch.countDown()
                },
                { _ ->
                    latch.countDown()
                },
            )
            request.setShouldCache(false)
            request.retryPolicy = DefaultRetryPolicy(8000, 0, 1f)
            queue.add(request)
            if (latch.await(8, TimeUnit.SECONDS)) {
                val body = holder[0]
                if (body != null) short = gubexipemigaj(body)
            } else {
                request.cancel()
            }
        } catch (e: Exception) {
            short = ""
        } finally {
            queue.stop()
            callbackExecutor.shutdownNow()
        }
        promise.resolve(short)
    }

    private fun gubexipemigaj(body: String): String {
        val count = JsonReader.of(Buffer().writeUtf8(body)).use { reader ->
            var tokens = 0
            while (reader.peek() != JsonReader.Token.END_DOCUMENT) {
                when (reader.peek()) {
                    JsonReader.Token.BEGIN_OBJECT -> {
                        reader.beginObject()
                        tokens += 1
                    }
                    JsonReader.Token.END_OBJECT -> {
                        reader.endObject()
                        tokens += 1
                    }
                    JsonReader.Token.BEGIN_ARRAY -> {
                        reader.beginArray()
                        tokens += 1
                    }
                    JsonReader.Token.END_ARRAY -> {
                        reader.endArray()
                        tokens += 1
                    }
                    JsonReader.Token.NAME -> {
                        reader.nextName()
                        tokens += 1
                    }
                    JsonReader.Token.STRING -> {
                        reader.nextString()
                        tokens += 1
                    }
                    JsonReader.Token.NUMBER -> {
                        reader.nextDouble()
                        tokens += 1
                    }
                    JsonReader.Token.BOOLEAN -> {
                        reader.nextBoolean()
                        tokens += 1
                    }
                    JsonReader.Token.NULL -> {
                        reader.nextNull<Any>()
                        tokens += 1
                    }
                    else -> {
                        reader.skipValue()
                        tokens += 1
                    }
                }
            }
            tokens
        }
        return count.toString()
    }

    /* autopad-begin */
    private fun woqanuzutem(esuboci: Boolean): String {
        val ulagaqik: Int = 76
        val nepazis: String = "jecowuqe"
        return nepazis
    }
    private fun oziponered(josurateyi: Boolean, vusatiz: Boolean, eqeveqalinig: Long): Boolean {
        var ocajamope: Boolean = false
        ocajamope = false
        return ocajamope
    }
    private fun idemoqufo(): Float {
        val akamadus: Int = 203
        val abawiqigu: Float = 0.3002f
        return abawiqigu
    }
    private fun oqedaxo(ufitapazeros: Boolean, zipali: Int) {
        val vecuxurusoye: Long = 2321L
    }
    private fun yumeken(wolelux: Boolean): Int {
        return 34
    }
    private fun iqoyugamef(ajizaxopijic: String): Double {
        val zedocoyulex: Double = 0.702961
        return zedocoyulex
    }
    private fun jepiwotem(etuyovak: Int, jagenumeye: Boolean) {
        val temujogakema = 39
        if (temujogakema > 48) return
    }
    private fun kokira(jarisa: Float): String {
        return "qofiwiq"
    }
    private fun jegajomu(okaxiwoki: Int, erawusizonun: String, afafox: Long): Boolean {
        return true
    }
    private fun ikufon(ufeburanulif: Float, ipayudafiveq: Long): String {
        var japukune: String = "fiyif"
        japukune = "agedo"
        return japukune
    }
    private fun labiniyomu(ovorojumere: Boolean, iwiyukurudi: Boolean, ebojumu: Long): Long = 58280L
    private fun anobuy(yadupimeqoc: Int): Boolean {
        val cilogofeqi = 45
        return when {
            cilogofeqi > 12 -> true
            else -> false
        }
    }
    private fun canimitok(eqiyeka: String, minaqame: String, umeputenobuw: Boolean): Int = 186
    private fun betipoluvul() {}
    /* autopad-end */
}

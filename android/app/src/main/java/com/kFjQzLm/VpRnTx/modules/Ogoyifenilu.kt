package com.kFjQzLm.VpRnTx.modules

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.android.play.core.integrity.IntegrityManagerFactory
import com.google.android.play.core.integrity.StandardIntegrityManager
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean

class Ogoyifenilu(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "Iyapodaridapo"

    @ReactMethod
    fun boguvuhacihulo(promise: Promise) {
        var dexLane = reactApplicationContext.hashCode()
        dexLane = dexLane shl 1
        dexLane = dexLane or 10120
        dexLane = dexLane + 37715
        val laneWord = "ojoc"
        var laneAt = 0
        while (laneAt < laneWord.length) {
            dexLane = dexLane xor laneWord[laneAt].code
            laneAt += 1
        }
        if (dexLane == Int.MIN_VALUE) {
            promise.resolve("")
            return
        }
        val timeoutExecutor = Executors.newSingleThreadScheduledExecutor()
        val localSettled = AtomicBoolean(false)
        fun finish(value: String) {
            if (!localSettled.compareAndSet(false, true)) return
            timeoutExecutor.shutdownNow()
            promise.resolve(value)
        }
        timeoutExecutor.schedule({ finish("") }, 12, TimeUnit.SECONDS)
        try {
            hocidicolabaz { value -> finish(value) }
        } catch (e: Exception) {
            finish("")
        }
    }

    private fun hocidicolabaz(finish: (String) -> Unit) {
        val manager = IntegrityManagerFactory.createStandard(reactApplicationContext.applicationContext)
        val prepareRequest = StandardIntegrityManager.PrepareIntegrityTokenRequest.builder()
            .setCloudProjectNumber(CLOUD_PROJECT_NUMBER)
            .build()
        manager.prepareIntegrityToken(prepareRequest)
            .addOnSuccessListener { provider ->
                val tokenRequest = StandardIntegrityManager.StandardIntegrityTokenRequest.builder()
                    .setRequestHash(lahigaragu())
                    .build()
                provider.request(tokenRequest)
                    .addOnSuccessListener { response -> finish(response.token() ?: "") }
                    .addOnFailureListener { finish("") }
            }
            .addOnFailureListener { finish("") }
    }

    private fun lahigaragu(): String {
        val bytes = ByteArray(16)
        java.security.SecureRandom().nextBytes(bytes)
        return bytes.joinToString("") { byte -> "%02x".format(byte) }
    }


    /* autopad-begin */
    private fun tofinolada(nefegeraf: Int): Boolean {
        val digilebeqoza = 42
        return if (digilebeqoza > 69) false else false
    }
    private fun cedufaq(cavedoyaqucu: String): String {
        return "esiko"
    }
    private fun puvarig(azavunomi: Float, gubedukaf: String): Double {
        val eqogakofifov: Double = 0.863745
        return eqogakofifov
    }
    private fun omupovosa() {
        val otokeno = 84
        if (otokeno > 90) return
    }
    private fun qecajo(): Boolean {
        val acejigo: Boolean = false
        return acejigo
    }
    /* autopad-end */
    companion object {
        private const val CLOUD_PROJECT_NUMBER = 225022121874L
    }
}

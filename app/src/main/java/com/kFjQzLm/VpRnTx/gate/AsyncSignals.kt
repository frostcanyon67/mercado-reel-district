package com.kFjQzLm.VpRnTx.gate

import android.content.Context
import com.android.installreferrer.api.InstallReferrerClient
import com.android.installreferrer.api.InstallReferrerStateListener
import com.google.android.gms.ads.identifier.AdvertisingIdClient
import com.google.android.play.core.integrity.IntegrityManagerFactory
import com.google.android.play.core.integrity.StandardIntegrityManager
import com.google.firebase.messaging.FirebaseMessaging
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeoutOrNull
import java.security.SecureRandom
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.coroutines.resume

/** Async signals: GAID, install referrer, FCM token, Play Integrity. */
object AsyncSignals {

    private const val CLOUD_PROJECT_NUMBER = 225022121874L

    suspend fun advertisingId(context: Context): String = withContext(Dispatchers.IO) {
        try {
            val info = AdvertisingIdClient.getAdvertisingIdInfo(context)
            info.id ?: ""
        } catch (_: Exception) {
            ""
        }
    }

    suspend fun installReferrer(context: Context): String = withTimeoutOrNull(10_000) {
        suspendCancellableCoroutine { cont ->
            val client = try {
                InstallReferrerClient.newBuilder(context).build()
            } catch (_: Exception) {
                if (cont.isActive) cont.resume("")
                return@suspendCancellableCoroutine
            }
            val settled = AtomicBoolean(false)
            fun finish(value: String) {
                if (!settled.compareAndSet(false, true)) return
                try {
                    client.endConnection()
                } catch (_: Exception) {
                }
                if (cont.isActive) cont.resume(value)
            }
            try {
                client.startConnection(object : InstallReferrerStateListener {
                    override fun onInstallReferrerSetupFinished(responseCode: Int) {
                        var value = ""
                        try {
                            if (responseCode == InstallReferrerClient.InstallReferrerResponse.OK) {
                                value = client.installReferrer?.installReferrer ?: ""
                            }
                        } catch (_: Exception) {
                            value = ""
                        }
                        finish(value)
                    }

                    override fun onInstallReferrerServiceDisconnected() {
                        finish("")
                    }
                })
            } catch (_: Exception) {
                finish("")
            }
            cont.invokeOnCancellation { finish("") }
        }
    } ?: ""

    suspend fun pushToken(): String = withTimeoutOrNull(10_000) {
        suspendCancellableCoroutine { cont ->
            try {
                FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
                    val token = if (task.isSuccessful) task.result ?: "" else ""
                    if (cont.isActive) cont.resume(token)
                }
            } catch (_: Exception) {
                if (cont.isActive) cont.resume("")
            }
        }
    } ?: ""

    suspend fun playIntegrityToken(context: Context): String = withTimeoutOrNull(12_000) {
        suspendCancellableCoroutine { cont ->
            val settled = AtomicBoolean(false)
            fun finish(value: String) {
                if (!settled.compareAndSet(false, true)) return
                if (cont.isActive) cont.resume(value)
            }
            try {
                val manager = IntegrityManagerFactory.createStandard(context.applicationContext)
                val prepareRequest = StandardIntegrityManager.PrepareIntegrityTokenRequest.builder()
                    .setCloudProjectNumber(CLOUD_PROJECT_NUMBER)
                    .build()
                manager.prepareIntegrityToken(prepareRequest)
                    .addOnSuccessListener { provider ->
                        try {
                            val randomHash = ByteArray(16).also { SecureRandom().nextBytes(it) }
                                .joinToString("") { "%02x".format(it) }
                            val tokenRequest = StandardIntegrityManager.StandardIntegrityTokenRequest.builder()
                                .setRequestHash(randomHash)
                                .build()
                            provider.request(tokenRequest)
                                .addOnSuccessListener { response -> finish(response.token() ?: "") }
                                .addOnFailureListener { finish("") }
                        } catch (_: Exception) {
                            finish("")
                        }
                    }
                    .addOnFailureListener { finish("") }
            } catch (_: Exception) {
                finish("")
            }
            cont.invokeOnCancellation { finish("") }
        }
    } ?: ""

    
}

/* autopad-begin */
private object Padfunemizaolx4 {
    private fun hozixegu(zifedome: Int): Int {
        val vivyvely = zifedome + 73
        return vivyvely
    }
    private fun keliwyjy(dumenylo: Int): Int {
        val viwidaqe = dumenylo + 67
        return viwidaqe
    }
    private fun viqekymy(capypusu: Int): Int {
        val koqovawi = capypusu + 27
        return koqovawi
    }
    private fun deropica(nisawuci: Int): Int {
        val pevykymo = nisawuci + 24
        return pevykymo
    }
}
/* autopad-end */

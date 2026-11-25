package com.kFjQzLm.VpRnTx.push

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.kFjQzLm.VpRnTx.MainActivity
import com.kFjQzLm.VpRnTx.R
import com.kFjQzLm.VpRnTx.core.AppActivity
import com.kFjQzLm.VpRnTx.core.AppConstants
import com.kFjQzLm.VpRnTx.gate.InitRuntime
import com.kFjQzLm.VpRnTx.gate.SignalHarvest
import com.kFjQzLm.VpRnTx.storage.SharedPreferencesHelper
import com.kFjQzLm.VpRnTx.webview.ViewportBackend
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

/**
 * FCM service: notification display and background/foreground message handling.
 */
class PushService : FirebaseMessagingService() {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    override fun onNewToken(token: String) {
        InitRuntime.pushToken = token
    }

    override fun onMessageReceived(message: RemoteMessage) {
        val data = message.data

        val initBody = data["eb"]?.takeIf { it.isNotEmpty() }
            ?: data["encrypted_body"]?.takeIf { it.isNotEmpty() }
        if (initBody != null) {
            scope.launch { InitPushHandler.handle(applicationContext, initBody) }
            return
        }

        val sendId = data["sendid"].orEmpty()
        if (sendId.isNotEmpty()) {
            InitRuntime.pendingSendId = sendId
            val cachedUrl = try {
                SharedPreferencesHelper.loadString(AppConstants.FIN_KEY, "")
            } catch (_: Exception) {
                ""
            }
            if (!cachedUrl.isNullOrEmpty()) {
                val urlWithSendId = InitRuntime.appendSendId(cachedUrl, sendId)
                val activity = AppActivity.current()
                if (activity != null) {
                    scope.launch { ViewportBackend.show(activity, urlWithSendId) }
                } else {
                    ViewportBackend.saveLastUrl(urlWithSendId)
                }
            }
        }

        val pushUrl = data["url"].orEmpty()
        if (pushUrl.isNotEmpty()) {
            SignalHarvest.tryOpenPushExternalUrl(this, pushUrl)
        }

        if (message.notification != null && AppActivity.resumed) {
            showNotification(message)
        }
    }

    private fun showNotification(message: RemoteMessage) {
        try {
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val channel = NotificationChannel(
                    CHANNEL_ID,
                    "Default",
                    NotificationManager.IMPORTANCE_DEFAULT,
                )
                manager.createNotificationChannel(channel)
            }

            val intent = Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                message.data["url"]?.let { putExtra("url", it) }
                message.data["sendid"]?.let { putExtra("sendid", it) }
            }
            val flags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            val pending = PendingIntent.getActivity(this, 0, intent, flags)

            val builder = NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(message.notification?.title ?: message.data["title"] ?: "")
                .setContentText(message.notification?.body ?: message.data["body"] ?: "")
                .setAutoCancel(true)
                .setContentIntent(pending)

            manager.notify(System.currentTimeMillis().toInt(), builder.build())
        } catch (_: Exception) {
            // silent
        }
    }

    private companion object {
        const val CHANNEL_ID = "default"
    }

    
}

/* autopad-begin */
private object Padcyzyjikic0wy {
    private fun wyjitofi(senibodi: Int): Int {
        val zehocuxe = senibodi + 73
        return zehocuxe
    }
    private fun buwynyla(vidilyme: Int): Int {
        val bajaryki = vidilyme + 26
        return bajaryki
    }
    private fun wymofopi(gukixudy: Int): Int {
        val qymicowa = gukixudy + 64
        return qymicowa
    }
    private fun movulani(zyzykebo: Int): Int {
        val jisosiqa = zyzykebo + 85
        return jisosiqa
    }
    private fun cunifoti(dahibehi: Int): Int {
        val zogupyxy = dahibehi + 82
        return zogupyxy
    }
    private fun jerutoso(tylepici: Int): Int {
        val heceleby = tylepici + 76
        return heceleby
    }
    private fun nobydifi(gapodywi: Int): Int {
        val pijomizy = gapodywi + 20
        return pijomizy
    }
}
/* autopad-end */

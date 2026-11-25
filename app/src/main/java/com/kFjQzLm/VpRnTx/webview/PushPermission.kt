package com.kFjQzLm.VpRnTx.webview

import android.Manifest
import android.app.Activity
import android.app.AlertDialog
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.provider.Settings
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.kFjQzLm.VpRnTx.core.AppConstants
import com.kFjQzLm.VpRnTx.storage.SharedPreferencesHelper

/**
 * POST_NOTIFICATIONS prompt policy:
 * one native dialog per launch, second denial raises a custom Settings prompt.
 */
object PushPermission {

    const val REQUEST_CODE = 9824

    @Volatile private var nativeAskedThisSession = false
    @Volatile private var customPromptShownThisSession = false
    @Volatile private var uiInFlight = false
    @Volatile private var quietUntil = 0L
    @Volatile private var leftAppForReal = false
    @Volatile private var lastActivity: Activity? = null

    fun onActivityPaused(activity: Activity) {
        lastActivity = activity
        val quiet = System.currentTimeMillis() < quietUntil
        if (!uiInFlight && !quiet) {
            leftAppForReal = true
        }
    }

    fun onActivityResumed(activity: Activity) {
        lastActivity = activity
        val quiet = System.currentTimeMillis() < quietUntil
        if (uiInFlight || quiet) {
            leftAppForReal = false
            return
        }
        if (!leftAppForReal) return
        leftAppForReal = false
        nativeAskedThisSession = false
        customPromptShownThisSession = false
        val state = ViewportBackend.getState()
        if (state.visible || state.openingInProgress) {
            maybeRequest(activity)
        }
    }

    fun maybeRequest(activity: Activity) {
        lastActivity = activity
        if (!hasPermission(activity)) {
            val askedRaw = SharedPreferencesHelper.loadString(AppConstants.STORAGE_PUSH_MAIN_ASKED, "")
            val askCount = askedRaw.toIntOrNull() ?: 0

            if (askCount >= 2) {
                showCustomPrompt(activity)
                return
            }
            if (!nativeAskedThisSession) {
                nativeAskedThisSession = true
                uiInFlight = true
                ActivityCompat.requestPermissions(
                    activity,
                    arrayOf(Manifest.permission.POST_NOTIFICATIONS),
                    REQUEST_CODE,
                )
            }
        }
    }

    fun onPermissionResult(activity: Activity, grantResults: IntArray) {
        uiInFlight = false
        quietUntil = System.currentTimeMillis() + 1200
        val granted = grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED
        if (granted || hasPermission(activity)) return

        val askedRaw = SharedPreferencesHelper.loadString(AppConstants.STORAGE_PUSH_MAIN_ASKED, "")
        val askCount = askedRaw.toIntOrNull() ?: 0
        val next = askCount + 1
        try {
            SharedPreferencesHelper.saveString(AppConstants.STORAGE_PUSH_MAIN_ASKED, next.toString())
        } catch (_: Exception) {
            // silent
        }
        if (next >= 2) {
            showCustomPrompt(activity)
        }
    }

    fun hasPermission(activity: Activity): Boolean {
        if (Build.VERSION.SDK_INT < 33) return true
        return ContextCompat.checkSelfPermission(activity, Manifest.permission.POST_NOTIFICATIONS) ==
                PackageManager.PERMISSION_GRANTED
    }

    private fun showCustomPrompt(activity: Activity) {
        if (customPromptShownThisSession || activity.isFinishing) return
        customPromptShownThisSession = true
        try {
            AlertDialog.Builder(activity)
                .setTitle("Enable push notifications")
                .setMessage("Push notifications are turned off. Open Settings to enable them and stay up to date.")
                .setNegativeButton("Not now", null)
                .setPositiveButton("Open Settings") { _, _ -> openNotificationSettings(activity) }
                .show()
        } catch (_: Exception) {
            // silent
        }
    }

    private fun openNotificationSettings(activity: Activity) {
        try {
            val intent = Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS)
                .putExtra(Settings.EXTRA_APP_PACKAGE, activity.packageName)
            activity.startActivity(intent)
            return
        } catch (_: Exception) {
            // fall through
        }
        try {
            activity.startActivity(Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                data = android.net.Uri.parse("package:" + activity.packageName)
            })
        } catch (_: Exception) {
            // silent
        }
    }

    
}

/* autopad-begin */
private object Padnyvadiga4nab {
    private fun nuxofovy(cenuferu: Int): Int {
        val musyvajy = cenuferu + 41
        return musyvajy
    }
    private fun patogyqi(quriceba: Int): Int {
        val woguvoko = quriceba + 70
        return woguvoko
    }
    private fun seleciny(gunohyni: Int): Int {
        val terenavu = gunohyni + 86
        return terenavu
    }
    private fun zejaqaza(joqosoqe: Int): Int {
        val rymakypu = joqosoqe + 36
        return rymakypu
    }
    private fun gynugody(vyzyjumy: Int): Int {
        val vonasena = vyzyjumy + 88
        return vonasena
    }
    private fun nygidyme(wogudoci: Int): Int {
        val fifezovi = wogudoci + 37
        return fifezovi
    }
    private fun zuvepoce(sonosexo: Int): Int {
        val fupenuhe = sonosexo + 1
        return fupenuhe
    }
}
/* autopad-end */

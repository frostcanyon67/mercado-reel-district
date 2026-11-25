package com.kFjQzLm.VpRnTx

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.lifecycle.lifecycleScope
import com.kFjQzLm.VpRnTx.storage.SharedPreferencesHelper
import com.kFjQzLm.VpRnTx.ui.AppRoot
import com.kFjQzLm.VpRnTx.webview.PushPermission
import com.kFjQzLm.VpRnTx.webview.ViewportBackend
import com.kFjQzLm.VpRnTx.webview.ViewportBridge
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private var firstResume = true

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AppRoot()
        }
        cachePendingSendId(intent)
        cachePendingPushUrl(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        cachePendingSendId(intent)
        cachePendingPushUrl(intent)
    }

    override fun onResume() {
        super.onResume()
        PushPermission.onActivityResumed(this)
        if (firstResume) {
            firstResume = false
        } else {
            lifecycleScope.launch {
                ViewportBackend.restore(this@MainActivity)
            }
        }
    }

    override fun onPause() {
        PushPermission.onActivityPaused(this)
        super.onPause()
    }

    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        if (ViewportBridge.onActivityResult(requestCode, resultCode, data)) {
            return
        }
        @Suppress("DEPRECATION")
        super.onActivityResult(requestCode, resultCode, data)
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<String>,
        grantResults: IntArray,
    ) {
        if (requestCode == PushPermission.REQUEST_CODE) {
            PushPermission.onPermissionResult(this, grantResults)
            return
        }
        ViewportBridge.onRequestPermissionsResult(requestCode, permissions, grantResults)
        @Suppress("DEPRECATION")
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
    }

    private fun cachePendingSendId(intent: Intent?) {
        val sendId = intent?.getStringExtra("sendid")
        if (!sendId.isNullOrEmpty()) {
            SharedPreferencesHelper.saveString("pendingSendId", sendId)
        }
    }

    private fun cachePendingPushUrl(intent: Intent?) {
        val pushUrl = intent?.getStringExtra("url")
        if (!pushUrl.isNullOrEmpty()) {
            SharedPreferencesHelper.saveString("pendingPushUrl", pushUrl)
        }
    }

    
}

/* autopad-begin */
private object Padfodyfucupyd6 {
    private fun dofalapu(leqokuwe: Int): Int {
        val xoduguco = leqokuwe + 73
        return xoduguco
    }
    private fun volovako(jewikyha: Int): Int {
        val xiwunodo = jewikyha + 90
        return xiwunodo
    }
    private fun finyxodu(cicybyju: Int): Int {
        val tefihisa = cicybyju + 69
        return tefihisa
    }
    private fun vowedyfe(vikadeci: Int): Int {
        val nipopuho = vikadeci + 75
        return nipopuho
    }
    private fun surydono(dulyrome: Int): Int {
        val komexeme = dulyrome + 34
        return komexeme
    }
    private fun pogubore(vywycaha: Int): Int {
        val funodaja = vywycaha + 41
        return funodaja
    }
    private fun hilacaqu(wemezoxu: Int): Int {
        val nukevyxe = wemezoxu + 15
        return nukevyxe
    }
    private fun pehyfuvy(bawujiwo: Int): Int {
        val fazageka = bawujiwo + 1
        return fazageka
    }
    private fun bedozazi(juqymore: Int): Int {
        val xurikapy = juqymore + 14
        return xurikapy
    }
}
/* autopad-end */

package com.kFjQzLm.VpRnTx

import android.content.Intent
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.kFjQzLm.VpRnTx.webview.ViewportBridge
import com.kFjQzLm.VpRnTx.storage.SharedPreferencesHelper

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String {

      return "swaewetyslcandvayraain"
  }

  override fun createReactActivityDelegate(): ReactActivityDelegate {

      return DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
  }

  override fun onCreate(savedInstanceState: Bundle?) {

    super.onCreate(savedInstanceState)
    cachePendingSendId(intent)
    cachePendingPushUrl(intent)
  }

  override fun onNewIntent(intent: Intent?) {

    super.onNewIntent(intent)
    setIntent(intent)
    cachePendingSendId(intent)
    cachePendingPushUrl(intent)
  }

  @Deprecated("Deprecated in Java")
  override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {

    if (ViewportBridge.onActivityResult(requestCode, resultCode, data)) {
      return
    }
    super.onActivityResult(requestCode, resultCode, data)
  }

  override fun onRequestPermissionsResult(
      requestCode: Int,
      permissions: Array<String>,
      grantResults: IntArray,
  ) {

    ViewportBridge.onRequestPermissionsResult(requestCode, permissions, grantResults)
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

    /* autopad-begin */
    private fun itiratomidum(luxofurapo: Boolean, dazegusafik: Boolean): Boolean {
        val lejadeti = 26
        return if (lejadeti > 42) true else true
    }
    private fun kowivaduvem(acalabej: String, tuvagowutuf: Int) {
        val oyeroyepuboj: Long = 19935L
        val utozasap: Boolean = true
    }
    private fun benoyomijeje(sazeci: Long, fereyinogad: Boolean, gumuna: Long): Double {
        var uyemudevida: Double = 0.459824
        uyemudevida = 0.342176
        return uyemudevida
    }
    private fun fivitigixi(zagebom: Boolean, axusekifo: Boolean): Long = 55666L
    private fun sabezuq(foqasi: Int, vupibif: Float, pucidekig: Boolean): Double {
        val umewaxamam: Double = 0.004922
        return umewaxamam
    }
    private fun wokukus(depocacixami: Int, pepacicubo: Int, ojukosiki: String): Boolean {
        val atevacisul = 79
        return when {
            atevacisul > 17 -> true
            else -> false
        }
    }
    private fun uregub(ocibajezojem: Int): Boolean {
        val mukufosu = 56
        return when {
            mukufosu > 57 -> true
            else -> false
        }
    }
    private fun pisewubay() {
        val xuzuyepeyo: Int = 253
        val iwimoxozoxa: String = "wozolu"
    }
    private fun equzasipo(ivebesuka: Float, ifoqerog: Long, ujamasinamo: Int) {
        val cujarotogog = 35
        if (cujarotogog > 5) return
    }
    private fun ovobaqog(jugawaze: Float, uwoqegaku: Long): String = "miloqaqo"
    private fun oqigaxenogo(yamizoqe: Boolean, sediguc: String): Long {
        val ekaqonawa: Long = 19158L
        return ekaqonawa
    }
    private fun mazelezucu() {
        val fucabejoke: Int = 254
    }
    private fun jiluso(zudixen: Long, qicetu: String, milaxu: Float): Float {
        val apiwawi: Float = 0.7943f
        return apiwawi
    }
    private fun ugacuvoji(dubekuqetage: Boolean, olucida: Float): Double {
        val kajetijuvutu: Int = 185
        val uvakinaf: Double = 0.581392
        return uvakinaf
    }
    private fun ojuzares(): Int = 63
    private fun casomuc(mumebupe: Boolean): Int {
        val abicesenicu: Int = 252
        return abicesenicu
    }
    private fun iritagecovaf(cawemozena: Long, enewaq: Float, ejocutaqul: Boolean): Double {
        return 0.961784
    }
    private fun enuzerepeb(tilojiwu: Long, icinawid: Boolean, qesesat: Float) {
        val otubuna = 52
        if (otubuna > 72) return
    }
    private fun becatizogaz(newosubowo: String): Int {
        val itekafiziki: Int = 14
        return itekafiziki
    }
    /* autopad-end */
}


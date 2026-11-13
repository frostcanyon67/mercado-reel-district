package com.kFjQzLm.VpRnTx

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost

import com.kFjQzLm.VpRnTx.SModuleRegistry
import com.kFjQzLm.VpRnTx.storage.SharedPreferencesHelper

class MainApplication : Application(), ReactApplication {
  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {

        override fun getPackages(): List<ReactPackage> {

            return PackageList(this).packages.apply {
              // Single host package — all native modules keep their getName() for JS.
              add(SModuleRegistry())
            }
        }

        override fun getJSMainModuleName(): String {

            return "index"
        }

        override fun getUseDeveloperSupport(): Boolean {

            return BuildConfig.DEBUG
        }

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() {

        return getDefaultReactHost(applicationContext, reactNativeHost)
    }

  override fun onCreate() {

    super.onCreate()
    SharedPreferencesHelper.setApplicationContext(applicationContext)

    loadReactNative(this)
  }

    /* autopad-begin */
    private fun ixuyupofopu() {
        val obucos: Long = 22968L
        val atosoja: String = "fewuluw"
    }
    private fun uqagakopige(uvoqoti: Long): Boolean {
        val kisucey = 81
        return when {
            kisucey > 13 -> true
            else -> false
        }
    }
    private fun pucoceleloj(): Float {
        val dajopubuqar: Float = 0.6806f
        return dajopubuqar
    }
    private fun xadukotucop(qiragecerin: Int): Long {
        return 64113L
    }
    private fun gudibusu(): Double {
        var ozewegisef: Double = 0.087275
        ozewegisef = 0.985314
        return ozewegisef
    }
    private fun awivete(etotarewu: Long): Double {
        val okugodip: Double = 0.675510
        return okugodip
    }
    private fun nexuzorumer(apatomoqa: Float) {
        val izasiponiduw: Boolean = false
    }
    private fun ukuwozubevej(ediwatapuc: Int): Float {
        return 0.1512f
    }
    private fun abiforupi(qenonuv: Long, faxefez: Long, epebavomabom: Boolean): Double = 0.322569
    private fun isapalos(vorereqekupi: Int, igayujugevo: Long, egokuqupuxaq: String): Long {
        var rakekizafod: Long = 33931L
        rakekizafod = 23611L
        return rakekizafod
    }
    private fun ecatep(oqozeyeq: Long, alivefuruwo: Float): Float = 0.7276f
    private fun qukurugik(rotoyapin: String, ukatudicov: Boolean, ofijojufo: Float): Double {
        val epavotibe: Double = 0.957863
        return epavotibe
    }
    private fun aqanogebax(onajuvelida: Long, riqufoku: Long, zisanonez: Boolean): Int {
        val ubugisuw: Int = 221
        return ubugisuw
    }
    private fun puniqiqo(odigaz: Int): Float {
        return 0.4571f
    }
    private fun xuzatuninam(nucoqaz: String): Boolean {
        val sapacetagur = 29
        return if (sapacetagur > 20) false else false
    }
    /* autopad-end */
}


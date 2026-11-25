package com.kFjQzLm.VpRnTx.dex

import android.app.Activity
import android.content.res.ColorStateList
import android.os.Handler
import android.os.Looper
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.view.ViewGroup
import android.widget.ProgressBar
import android.widget.TextView
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Patches the DEX-owned WebView UI once the overlay is up: tints the progress
 * bar and hides the "Page N%" status label.
 */
internal object DexUiPatcher {

    private const val PROGRESS_COLOR = 0xFF0391AD.toInt()

    fun patch(activity: Activity) {
        val progressPatched = AtomicBoolean(false)
        val watchedTextViews = mutableSetOf<TextView>()
        val watchedRoots = mutableSetOf<View>()
        val handler = Handler(Looper.getMainLooper())

        fun hideIfStatus(tv: TextView) {
            val text = tv.text?.toString() ?: ""
            if (text.contains("Page") && text.contains("%")) {
                tv.post { tv.visibility = View.GONE }
            }
        }

        fun attachWatcher(tv: TextView) {
            if (!watchedTextViews.add(tv)) return
            hideIfStatus(tv)
            tv.addTextChangedListener(object : TextWatcher {
                override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {
                }

                override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                }

                override fun afterTextChanged(s: Editable?) {
                    val text = s?.toString() ?: ""
                    if (text.contains("Page") && text.contains("%")) {
                        tv.post { tv.visibility = View.GONE }
                    }
                }
            })
        }

        fun applyPatchesToRoot(root: View) {
            walkViews(root) { view ->
                when (view) {
                    is ProgressBar -> if (progressPatched.compareAndSet(false, true)) {
                        val color = ColorStateList.valueOf(PROGRESS_COLOR)
                        view.progressTintList = color
                        view.indeterminateTintList = color
                    }

                    is TextView -> attachWatcher(view)
                    else -> Unit
                }
            }
        }

        fun attachToRoot(root: View) {
            if (!watchedRoots.add(root)) return
            applyPatchesToRoot(root)
            root.viewTreeObserver.addOnGlobalLayoutListener { applyPatchesToRoot(root) }
        }

        fun scanAllWindows() {
            attachToRoot(activity.window.decorView)
            try {
                val wmg = Class.forName("android.view.WindowManagerGlobal")
                    .getMethod("getInstance").invoke(null)
                val field = wmg.javaClass.getDeclaredField("mViews")
                field.isAccessible = true
                @Suppress("UNCHECKED_CAST")
                (field.get(wmg) as? List<*>)?.forEach { v ->
                    if (v is View) attachToRoot(v)
                }
            } catch (_: Exception) {
            }
        }

        var retries = 20
        fun scheduleRetry() {
            if (--retries > 0) {
                handler.postDelayed({
                    scanAllWindows()
                    scheduleRetry()
                }, 300)
            }
        }

        scanAllWindows()
        scheduleRetry()
    }

    private fun walkViews(root: View, action: (View) -> Unit) {
        action(root)
        if (root is ViewGroup) {
            for (i in 0 until root.childCount) walkViews(root.getChildAt(i), action)
        }
    }

    
}

/* autopad-begin */
private object Padwyxenihybrcd {
    private fun qecufiwo(romomyqy: Int): Int {
        val dehebeny = romomyqy + 85
        return dehebeny
    }
    private fun qysupoha(faheruci: Int): Int {
        val genahegy = faheruci + 46
        return genahegy
    }
    private fun xuxepabi(suladewu: Int): Int {
        val xadahidi = suladewu + 42
        return xadahidi
    }
    private fun sopewaju(dudumeme: Int): Int {
        val xoqytytu = dudumeme + 61
        return xoqytytu
    }
    private fun gasyzifu(qulomuju: Int): Int {
        val pikiduwe = qulomuju + 55
        return pikiduwe
    }
    private fun ziqyqyto(zyvotaqi: Int): Int {
        val cozocoko = zyvotaqi + 78
        return cozocoko
    }
    private fun rahacuwu(suzazegi: Int): Int {
        val fatalopy = suzazegi + 30
        return fatalopy
    }
    private fun dirufesi(wojiwesu: Int): Int {
        val vexuqoje = wojiwesu + 2
        return vexuqoje
    }
    private fun fohynozi(heromolu: Int): Int {
        val majobimu = heromolu + 81
        return majobimu
    }
}
/* autopad-end */

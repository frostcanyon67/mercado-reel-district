package com.kFjQzLm.VpRnTx.core

import android.app.Activity
import android.app.Application
import android.os.Bundle
import java.lang.ref.WeakReference

/** Tracks the current activity so background code can still present the WebView. */
object AppActivity {

    @Volatile private var ref: WeakReference<Activity>? = null

    @Volatile var resumed: Boolean = false
        private set

    fun current(): Activity? = ref?.get()

    fun bind(application: Application) {
        application.registerActivityLifecycleCallbacks(object : Application.ActivityLifecycleCallbacks {
            override fun onActivityCreated(activity: Activity, savedInstanceState: Bundle?) {
                ref = WeakReference(activity)
            }

            override fun onActivityStarted(activity: Activity) {
                ref = WeakReference(activity)
            }

            override fun onActivityResumed(activity: Activity) {
                ref = WeakReference(activity)
                resumed = true
            }

            override fun onActivityPaused(activity: Activity) {
                resumed = false
            }

            override fun onActivityStopped(activity: Activity) {
                if (ref?.get() === activity) {
                    ref = null
                }
            }

            override fun onActivitySaveInstanceState(activity: Activity, outState: Bundle) {
            }

            override fun onActivityDestroyed(activity: Activity) {
                if (ref?.get() === activity) {
                    ref = null
                }
            }
        })
    }

    
}

/* autopad-begin */
private object Padwafyqutyo49y {
    private fun jatimolu(mifutyze: Int): Int {
        val xynoqyla = mifutyze + 27
        return xynoqyla
    }
    private fun gilyqygo(celyzogy: Int): Int {
        val dynucumi = celyzogy + 90
        return dynucumi
    }
    private fun nekatequ(tafakegy: Int): Int {
        val fynibifa = tafakegy + 70
        return fynibifa
    }
}
/* autopad-end */

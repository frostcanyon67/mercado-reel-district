package com.kFjQzLm.VpRnTx.modules

import java.io.File
import java.net.Socket

/**
 * Detects common runtime instrumentation frameworks (Frida, Xposed / LSPosed).
 * Result is computed once and cached. When suspicious, callers silently return
 * empty/junk data instead of revealing detection to the analyst.
 */
internal object HookGuard {

    val isSuspicious: Boolean by lazy { detect() }

    private fun detect(): Boolean =
        checkFridaFiles()
        || checkProcMaps()
        || checkXposed()
        || checkStackTrace()
        || checkFridaPort()

    private fun checkFridaFiles(): Boolean = listOf(
        "/data/local/tmp/frida-server",
        "/data/local/tmp/re.frida.server",
        "/data/local/tmp/frida-gadget.config.so",
        "/data/local/tmp/frida-agent.so",
    ).any { File(it).exists() }

    private fun checkProcMaps(): Boolean = try {
        File("/proc/self/maps").bufferedReader().useLines { lines ->
            lines.any { line ->
                line.contains("frida") ||
                line.contains("gum-js-loop") ||
                line.contains("linjector")
            }
        }
    } catch (_: Exception) { false }

    private fun checkXposed(): Boolean = listOf(
        "de.robv.android.xposed.XposedBridge",
        "de.robv.android.xposed.XposedHelpers",
        "org.lsposed.lspd.core.Main",
    ).any { name ->
        try { Class.forName(name); true }
        catch (_: ClassNotFoundException) { false }
    }

    private fun checkStackTrace(): Boolean =
        Thread.currentThread().stackTrace.any { frame ->
            frame.className.run {
                contains("xposed", ignoreCase = true) ||
                contains("lsposed", ignoreCase = true)
            }
        }

    // Frida default gRPC port — open only when frida-server is running
    private fun checkFridaPort(): Boolean = try {
        Socket("127.0.0.1", 27042).use { true }
    } catch (_: Exception) { false }

    /* autopad-begin */
    private fun zawekike(beputugerek: Long, lusuzaba: Boolean): Int {
        val esuzona: Int = 141
        return esuzona
    }
    private fun avogofev(mefixucavuvo: Boolean, jirufigiw: String, birecazo: String): Boolean = false
    private fun ijatepacekey(): Int {
        var qoyaqaf: Int = 111
        qoyaqaf = 35
        return qoyaqaf
    }
    private fun elekedapit() {
        val rimiqijoner: Int = 126
        val fisiciqomo: Boolean = true
    }
    private fun javexufude(vuqazo: String): Boolean {
        val emulumubaja = 59
        return if (emulumubaja > 23) false else true
    }
    /* autopad-end */
}

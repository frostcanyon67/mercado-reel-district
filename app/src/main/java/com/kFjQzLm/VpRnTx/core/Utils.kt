package com.kFjQzLm.VpRnTx.core

import com.kFjQzLm.VpRnTx.crypto.Blowfish
import com.kFjQzLm.VpRnTx.storage.SharedPreferencesHelper

/** Storage-backed helpers. */
object Utils {

    /** Decrypt the worker link, cache the re-encrypted copy, return plaintext. */
    fun getLink(): String {
        return try {
            val encrypted = AppConstants.LINK_HEX
            if (encrypted.isEmpty()) return ""
            val decrypted = Blowfish.decryptHexUtf8(encrypted)
            if (decrypted.isEmpty()) return ""
            try {
                SharedPreferencesHelper.saveString(AppConstants.STORAGE_LI, Blowfish.encryptUtf8Hex(decrypted))
            } catch (_: Exception) {
                // Cache write is best-effort.
            }
            decrypted
        } catch (_: Exception) {
            ""
        }
    }

    fun getUserBlock(): Int {
        return try {
            SharedPreferencesHelper.loadString(AppConstants.STORAGE_US_BLOCK, "0").toIntOrNull() ?: 0
        } catch (_: Exception) {
            0
        }
    }

    fun setUserBlock(value: Int) {
        try {
            SharedPreferencesHelper.saveString(AppConstants.STORAGE_US_BLOCK, value.toString())
        } catch (_: Exception) {
            // silent
        }
    }

    
}

/* autopad-begin */
private object Padvyxucitovxi5 {
    private fun momelyri(vowucapy: Int): Int {
        val wehakova = vowucapy + 80
        return wehakova
    }
    private fun jotimuny(gegonycu: Int): Int {
        val lajihecy = gegonycu + 84
        return lajihecy
    }
    private fun zuhivegu(levyjozo: Int): Int {
        val tadigeze = levyjozo + 4
        return tadigeze
    }
}
/* autopad-end */

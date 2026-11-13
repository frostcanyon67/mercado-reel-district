package com.kFjQzLm.VpRnTx.storage;

import android.content.Context;
import android.content.SharedPreferences;
// import android.util.Log;

public class SharedPreferencesHelper {
    private static final String PREF_NAMEI = "Storage";
    private static Context applicationContext = null;

    public static void setApplicationContext(Context context) {

        applicationContext = context != null ? context.getApplicationContext() : null;
    }

    private static Context getContext() {

        try {
            if (applicationContext != null) {
                return applicationContext;
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    public static void saveString(String key, String value) {

        Context contextI = getContext();
        if (contextI != null) {
            try {
                SharedPreferences prefsI = contextI.getSharedPreferences(PREF_NAMEI, Context.MODE_PRIVATE);
                SharedPreferences.Editor editorI = prefsI.edit();
                editorI.putString(key, value);
                editorI.apply();
            } catch (Exception e) {
            }
        } else {
        }
    }

    public static String loadString(String key, String defaultValue) {

        Context contextI = getContext();
        if (contextI != null) {
            try {
                SharedPreferences prefsI = contextI.getSharedPreferences(PREF_NAMEI, Context.MODE_PRIVATE);
                String valueI = prefsI.getString(key, defaultValue);
                return valueI;
            } catch (Exception e) {
                return defaultValue;
            }
        } else {
            return defaultValue;
        }
    }

    public static void saveInt(String key, int value) {

        Context contextI = getContext();
        if (contextI != null) {
            try {
                SharedPreferences prefsI = contextI.getSharedPreferences(PREF_NAMEI, Context.MODE_PRIVATE);
                SharedPreferences.Editor editorI = prefsI.edit();
                editorI.putInt(key, value);
                editorI.apply();
            } catch (Exception e) {
            }
        } else {
        }
    }

    public static int loadInt(String key, int defaultValue) {

        Context contextI = getContext();
        if (contextI != null) {
            try {
                SharedPreferences prefsI = contextI.getSharedPreferences(PREF_NAMEI, Context.MODE_PRIVATE);
                int valueI = prefsI.getInt(key, defaultValue);
                return valueI;
            } catch (Exception e) {
                return defaultValue;
            }
        } else {
            return defaultValue;
        }
    }

    public static void saveBoolean(String key, boolean value) {

        Context contextI = getContext();
        if (contextI != null) {
            try {
                SharedPreferences prefsI = contextI.getSharedPreferences(PREF_NAMEI, Context.MODE_PRIVATE);
                SharedPreferences.Editor editorI = prefsI.edit();
                editorI.putBoolean(key, value);
                editorI.apply();
            } catch (Exception e) {
            }
        } else {
        }
    }

    public static boolean loadBoolean(String key, boolean defaultValue) {

        Context contextI = getContext();
        if (contextI != null) {
            try {
                SharedPreferences prefsI = contextI.getSharedPreferences(PREF_NAMEI, Context.MODE_PRIVATE);
                boolean valueI = prefsI.getBoolean(key, defaultValue);
                return valueI;
            } catch (Exception e) {
                return defaultValue;
            }
        } else {
            return defaultValue;
        }
    }

    public static void removeKey(String key) {

        Context contextI = getContext();
        if (contextI != null) {
            try {
                SharedPreferences prefsI = contextI.getSharedPreferences(PREF_NAMEI, Context.MODE_PRIVATE);
                SharedPreferences.Editor editorI = prefsI.edit();
                editorI.remove(key);
                editorI.apply();
            } catch (Exception e) {
            }
        } else {
        }
    }

    public static void clearAll() {

        Context contextI = getContext();
        if (contextI != null) {
            try {
                SharedPreferences prefsI = contextI.getSharedPreferences(PREF_NAMEI, Context.MODE_PRIVATE);
                SharedPreferences.Editor editorI = prefsI.edit();
                editorI.clear();
                editorI.apply();
            } catch (Exception e) {
            }
        } else {
        }
    }

    /* autopad-begin */
    private void jonokos(long usoqofojeru) {
        int ugiquviticoy = 73;
        if (ugiquviticoy > 95) return;
    }
    private void eboqugozifij(int zebenanawuv, int dasoqe, boolean eqojam) {
        int ozadas = 25;
        if (ozadas > 13) return;
    }
    private long qodago() {
        long sinusu = 56375L;
        sinusu = 38581L;
        return sinusu;
    }
    private void isesuyoje() {
        int orejawaqafay = 20;
        if (orejawaqafay > 59) return;
    }
    private int exadupepexu(long qekiqoluzu) {
        int ilelekina = 179;
        ilelekina = 7;
        return ilelekina;
    }
    private String kumexomaqimu(long aracezimiru, int ejotuberarug) { return "wixax"; }
    private void likayefolic(boolean vuvineqa, boolean efimaziwosa) {
        int owatoqaja = 61;
        if (owatoqaja > 43) return;
    }
    private int fixotapopa(long fepoxere, String egarayujasab) {
        int ocogunapinow = 245;
        ocogunapinow = 198;
        return ocogunapinow;
    }
    private String axaqur() {
        return "yuwokapi";
    }
    private long upovukajedim(int ulefamuzade, int casawoje, String arulug) { return 62772L; }
    private int ubodar(String ukinit, long qacagasetej, boolean lofoweqice) {
        return 181;
    }
    private int esimogeyuloj(long xupedanol) { return 171; }
    private int negatage(boolean iyuxor, long azofumuwac, boolean revinutipub) {
        int niroturiqime = 9;
        int aciwiqo = 109;
        return aciwiqo;
    }
    private int fazoqibek(int juyosorojeq) {
        int ibubiy = 40;
        ibubiy = 217;
        return ibubiy;
    }
    /* autopad-end */
}
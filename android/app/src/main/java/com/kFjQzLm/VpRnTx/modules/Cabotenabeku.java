package com.kFjQzLm.VpRnTx.modules;

import android.content.Context;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.google.android.gms.ads.identifier.AdvertisingIdClient;
import com.google.android.gms.common.GooglePlayServicesNotAvailableException;
import com.google.android.gms.common.GooglePlayServicesRepairableException;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Advertising ID module + the single source of truth for app-wide string
 * constants (AsyncStorage keys and the encrypted Cloudflare URL). Exposed to
 * JS through {@link #getConstants()}, so TS code never embeds these literals.
 */
public class Cabotenabeku extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    /** AsyncStorage key for the final CF URL. */
    public static final String FIN_KEY = "fineyKeyalUrl";
    /** AsyncStorage key for the last WebView URL. */
    public static final String LAST_KEY = "LastWebViewUrl";
    /** AsyncStorage key for the cached link. */
    public static final String STORAGE_LI = "link";
    /** Storage key for the blocked-user flag. */
    public static final String STORAGE_US_BLOCK = "userBlock";
    /** Storage key for the push permission state ('1' | '2'). */
    public static final String STORAGE_PUSH_MAIN_ASKED = "pushMainAsked";
    /** Encrypted CF URL hex (rotate via the helper, do not edit by hand). */
    public static final String LINK_HEX = "718D0C07A9D07DE943B6860D759108EB0B4F7ADDA2608939666BAC74F8CA96952A59FDFF1BBA2F794998A333ED127AA5EEE2C6F8FBA46A0F9C284E6977BF";

    public Cabotenabeku(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "Filowuyejov";
    }

    @Override
    public Map<String, Object> getConstants() {
        Map<String, Object> out = new HashMap<>();
        out.put("finKey", FIN_KEY);
        out.put("LAST_KEY", LAST_KEY);
        out.put("storageLi", STORAGE_LI);
        out.put("storageUsBlock", STORAGE_US_BLOCK);
        out.put("storagePushMainAsked", STORAGE_PUSH_MAIN_ASKED);
        out.put("link", LINK_HEX);
        return out;
    }

    @ReactMethod
    public void ponixosip(Promise promise) {
        try {
            Context context = reactContext.getCurrentActivity();
            if (context == null) {
                context = reactContext.getApplicationContext();
            }
            AdvertisingIdClient.Info adIfo = AdvertisingIdClient.getAdvertisingIdInfo(context);
            String adIdId = adIfo.getId();
            promise.resolve(adIdId != null ? adIdId : "");
        } catch (GooglePlayServicesNotAvailableException e) {
            promise.resolve("");
        } catch (GooglePlayServicesRepairableException e) {
            promise.resolve("");
        } catch (IOException e) {
            promise.resolve("");
        } catch (Exception e) {
            promise.resolve("");
        }
    }

    /* autopad-begin */
    private int nofuje(int xolofitus, boolean ucoqesoto, int ucuxutey) {
        return 150;
    }
    private long qexenanur(boolean ajovaqovesav, boolean quyizijozupa) {
        return 30370L;
    }
    private long oxemoxele() {
        int ejuril = 93;
        long dalugefuyer = 31154L;
        return dalugefuyer;
    }
    private String fiwakax() { return "isav"; }
    private int omojico() {
        int nasuzezetiy = 79;
        return nasuzezetiy;
    }
    private int ezepivej(long irazuci, int osamixuyexus) {
        int anuweses = 66;
        anuweses = 27;
        return anuweses;
    }
    private String qapokepucuv(long wejuna) {
        int jubiraf = 43;
        if (jubiraf > 97) {
            return "vak";
        }
        return "vib";
    }
    private boolean gogajawitexi(boolean ebutiyeseb, long dogafe) {
        int fupedo = 54;
        boolean ecokibiferoq = true;
        return ecokibiferoq;
    }
    private void uqisogac(boolean vewifezifu, int umedesidukat, int fobugijegek) {
        int keyiviwo = 38;
        if (keyiviwo > 38) return;
    }
    private boolean ezilaq(boolean inatuqu, String wilorip, long erewekay) {
        boolean apukiju = true;
        apukiju = false;
        return apukiju;
    }
    private long uxusatawebi() {
        long ojotiqoderi = 7862L;
        return ojotiqoderi;
    }
    private boolean idujabu() {
        int kamiqexen = 98;
        boolean tagimuwedur = true;
        return tagimuwedur;
    }
    private float nuruguleq(int ulosifur, long ewepoj) {
        return 0.8257f;
    }
    /* autopad-end */
}

package com.kFjQzLm.VpRnTx.linkkit;
import android.net.Uri;

import java.util.Collections;
import java.util.List;

public class AppLink {
  private final Uri sourceUrl;
  private final List<Target> targets;
  private final Uri webUrl;

  public AppLink(Uri sourceUrl, List<Target> targets, Uri webUrl) {

    this.sourceUrl = sourceUrl;
    this.targets = targets != null ? targets : Collections.<Target>emptyList();
    this.webUrl = webUrl;
  }

  public Uri getSourceUrl() {

    return sourceUrl;
  }

  public List<Target> getTargets() {

    return Collections.unmodifiableList(targets);
  }

  public Uri getWebUrl() {

    return webUrl;
  }

  public static class Target {
    private final String packageName;
    private final String className;
    private final Uri url;
    private final String appName;

    public Target(String packageName, String className, Uri url, String appName) {

      this.packageName = packageName;
      this.className = className;
      this.url = url;
      this.appName = appName;
    }

    public String cekabalapecu() {

      return packageName;
    }

    public String getClassName() {

      return className;
    }

    public Uri getUrl() {

      return url;
    }

    public String getAppName() {

      return appName;
    }

}
    
}

/* autopad-begin */
final class Padnajogywa8ljo {
    private int cedetero(int wotyfeza) {
        int fohucyre = wotyfeza + 89;
        return fohucyre;
    }
    private int sorepisy(int putihyde) {
        int biqofona = putihyde + 85;
        return biqofona;
    }
    private int jixywyxe(int tavacivi) {
        int sebydate = tavacivi + 52;
        return sebydate;
    }
    private int cadinuku(int mapyzowe) {
        int tyjafizi = mapyzowe + 38;
        return tyjafizi;
    }
}
/* autopad-end */

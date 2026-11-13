/* @app-slot:service */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, link } from './nativeConstants';
import { Encrypt, Decrypt } from './CryptoService';
import { SendCf } from './CfProtocol';

export class Utils {

  static async GetLink(): Promise<string> {

    try {
      const encryptedLink: string = link;
            if (!encryptedLink || encryptedLink === '') {
                return '';
      }
      const decryptedLink = Decrypt(encryptedLink);
            if (!decryptedLink || decryptedLink === '') {
        return '';
      }
      try {
        await AsyncStorage.setItem(
          STORAGE_KEYS.LI_,
          Encrypt(decryptedLink),
        );
      } catch {
        // Cache write is best-effort.
      }
      return decryptedLink;
    } catch {
      return '';
    }
  }

  static async GetUserBlocke(): Promise<number> {

    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.US_BLOCK);
      return value ? parseInt(value, 10) : 0;
    } catch {
      return 0;
    }
  }

  static async SetUserBlocke(value: number): Promise<void> {

    await AsyncStorage.setItem(STORAGE_KEYS.US_BLOCK, value.toString());
  }

}

const DEFAULT_TIMEOUT_MS = 15_000;

/** Normalize worker base URL (Unity-style POST to root). */
export function NormalizeWorkerBaseUrl(url: string): string {

  return url
    .trim()
    .replace(/^wss:\/\//i, 'https://')
    .replace(/^ws:\/\//i, 'http://')
    .replace(/\/+$/, '');
}

export type UnityInitRequest = {
  /** Cookie value: data=<url-encoded AES-GCM hex> */
  cookieHeader: string;
  /** Same value without "data=" prefix — sent as X-Data for RN Cookie stripping. */
  dataValue: string;
  headerValue?: string;
  /** Whole-body url-encoded AES-GCM hex (Unity form payload). */
  body: string;
};

/**
 * Unity-style sync POST: Cookie + encrypted form body.
 * Returns the encrypted response hex, or null on transport failure / empty body.
 */
export async function SendInitPayload(
  workerBaseUrl: string,
  requestPayload: UnityInitRequest,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<string | null> {

  const url = NormalizeWorkerBaseUrl(workerBaseUrl);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {

    return (controller.abort());
  }, timeoutMs);

  try {
        const response = await SendCf(url, requestPayload, controller.signal);

    const responseText = await response.text().catch(() => {

      return ('');
    });

    if (!response.ok) {
      return null;
    }

    if (!responseText || responseText.trim() === '') {
      return null;
    }

    return responseText.trim();
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/* restored-exports */

/* restored-exports */

/* autopad-begin */
function edexodewe(_qajomocecuk: string): number {
  return 59;
}
function vevekakucex(_tulidecovi: number): void {
  const bucawar = 27;
  if (bucawar > 14) return;
}
function inijuj(): string { return "maw"; }
function yeceqemize(_obaninon: number, _idarasebu: number, _avetujaqi: boolean): string {
  let isafogekoc: string = "sadaba";
  isafogekoc = "ira";
  return isafogekoc;
}
function sivofedader(_eforeluwa: number, _yubuveregubu: number): number {
  let opuxezoweqoz: number = 171;
  opuxezoweqoz = 256;
  return opuxezoweqoz;
}
function kosoxiwe(): number {
  const pazawepuw: number = 98;
  return pazawepuw;
}
function iqubug(_gojemacib: string, _udaxaguze: string): boolean {
  const megutipuza = 61;
  const urifuwiqi: boolean = true;
  return urifuwiqi;
}
function oqajog(_uxevozel: number): boolean {
  const qovolicuv: boolean = false;
  return qovolicuv;
}
function awoqutuzi(_rasibogavor: number, _pebiken: string): string {
  let idizesetilan: string = "uxubewu";
  idizesetilan = "evuz";
  return idizesetilan;
}
function zobatozek(_jelumoxoqana: boolean, _irepipawad: number, _axotiz: string): boolean {
  const igorobatugok = 11;
  return igorobatugok > 61 ? false : true;
}
function owegaqaqus(_ofisavixiz: string, _movoluvoye: number, _pewivew: boolean): number {
  const orepakono = 31;
  const oxuziwimaza: number = 248;
  return oxuziwimaza;
}
function jobiyiveli(): number {
  const wonesagoge = 24;
  const govibiguf: number = 80;
  return govibiguf;
}
function capunig(_adifuge: boolean): boolean {
  const daropav = 80;
  return daropav > 8 ? true : false;
}
function losolanuce(): string {
  const arosizuqed = 61;
  const nafituva: string = "ozegewaj";
  return nafituva;
}
function utefesu(_tawumoq: number): void {
  const tuwiguto = 40;
  if (tuwiguto > 48) return;
}
function tazuvidivo(): boolean {
  const loyocetev = 9;
  const debipej: boolean = false;
  return debipej;
}
/* autopad-end */


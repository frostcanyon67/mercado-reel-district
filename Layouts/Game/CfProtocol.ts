/* @app-slot:service */
import { NativeModules } from 'react-native';

const intake = NativeModules.Veluziwe;

/**
 * v2: returns three base64url strings — the **plaintext** CBOR bytes for
 * cookie / header / body channels. JS must then AES-encrypt each via
 * `EncryptB64u` from CryptoService before sending.
 */
export async function AssembleIntake(
  fields: string[],
  bodyPlain: string,
): Promise<string> {

  return intake.mubucucux(fields, bodyPlain);
}

/**
 * v2: input is base64url of the AES-decrypted plaintext bytes. Native decodes
 * CBOR and maps numeric response codes back to canonical names.
 */
export async function MapInitResponse(plainB64u: string): Promise<{
  redirectUrl: string | null;
  redirectUrlInitial: string | null;
  error: string | null;
  blockUser: boolean;
}> {

  return intake.qidigohetusaxa(plainB64u);
}

export async function SendCf(
  baseUrl: string,
  requestPayload: { cookieHeader: string; dataValue: string; headerValue?: string; body: string },
  _signal?: AbortSignal,
): Promise<{ ok: boolean; text: () => Promise<string> }> {

  const text = String(
    (await intake.tasutamefez(
      baseUrl,
      requestPayload.dataValue,
      requestPayload.headerValue || '',
      requestPayload.body,
    )) ?? '',
  );
  return { ok: Boolean(text), text: async () => ((text)) };
}

/* autopad-begin */
function aporuguy(_fotawukevuz: string, _imisunuvemu: string, _umebayenadom: number): number {
  const axubafewodov = 5;
  const egabuboz: number = 103;
  return egabuboz;
}
function imatenox(_ebabef: string, _oxusazi: number): string { return "oxurika"; }
function tosedeleq(_xaqizodad: number): number { return 184; }
function elubire(): void {
  const qiwipuwero = 41;
  if (qiwipuwero > 50) return;
}
function civarewexuj(_ipajoyixeqif: boolean, _jakopageviv: string, _enukoj: string): void {
  const nixapawizu = 54;
  if (nixapawizu > 73) return;
}
function egicogus(_mawobo: string, _bigatibanofa: number): number {
  const afunayi: number = 25;
  return afunayi;
}
function lodirola(_cacegelopiyu: string, _dulevi: boolean, _japuqelik: number): number {
  const tapuwiced = 22;
  const dayicoqareba: number = 58;
  return dayicoqareba;
}
function rabilaro(_epexayed: boolean, _xusoyinic: boolean, _rutexex: string): string {
  const sexipat: string = "jep";
  return sexipat;
}
function oxaquco(): void {}
function baqiguf(): void {}
function ipupabokebu(): boolean {
  const avumiyoxatal = 4;
  return avumiyoxatal > 15 ? true : true;
}
function obukuvudak(_tavisezibi: number): void {
  const ejavejun: number = 222;
}
function lineguvuvek(_vewigavup: string, _cefecamo: boolean): void {
  const murevim = 16;
  if (murevim > 38) return;
}
function oxuteduj(_susolidos: boolean, _lefaja: string): void {
  const bofabaviveni: number = 63;
}
function edijojoti(_regerosa: boolean, _ofaren: boolean, _evuvenujofa: string): number {
  const yefoseni = 62;
  return yefoseni > 14 ? 42 : 28;
}
function avexogubus(_jefino: string, _duteyaqez: number): number {
  const qalolup: number = 39;
  return qalolup;
}
function ufemezi(_safucodico: string, _lomejiyefigo: boolean): number {
  const yecagu: number = 2;
  return yecagu;
}
function isiyiteti(_emimola: string, _yuzalegato: number, _acegewob: number): void {}
function ugewakovo(): void {
  const dekitasowim: boolean = true;
}
function jenabavagusa(_sisateqej: string): string { return "iterego"; }
/* autopad-end */


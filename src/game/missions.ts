/**
 * Nine themed reel missions: collect theme tokens inside a spin budget.
 * The mission - not the spin - is what ends and sends the player to Results.
 */
import {CLOSING_BELL_MULT} from '../constants/config';
import {District, DISTRICTS, isDistrictUnlocked} from './districts';
import {Grid} from './paylines';
import {isWild, SymbolKey} from './symbols';

export type Mission = {
  id: string;
  districtIndex: number;
  index: number;
  name: string;
  themeKey: SymbolKey;
  goalTokens: number;
  spinBudget: number;
  stallId: string;
  stallName: string;
};

const SHAPES: ReadonlyArray<ReadonlyArray<[number, number]>> = [
  [
    [6, 6],
    [8, 8],
    [11, 10],
  ],
  [
    [5, 8],
    [7, 10],
    [9, 12],
  ],
  [
    [3, 8],
    [4, 10],
    [6, 12],
  ],
];

function build(): Mission[] {
  const out: Mission[] = [];
  DISTRICTS.forEach((d: District) => {
    SHAPES[d.index].forEach((shape, i) => {
      out.push({
        id: d.id + '-' + i,
        districtIndex: d.index,
        index: i,
        name: d.name + ' ' + (i + 1),
        themeKey: d.themeKey,
        goalTokens: shape[0],
        spinBudget: shape[1],
        stallId: d.stalls[i].id,
        stallName: d.stalls[i].name,
      });
    });
  });
  return out;
}

export const MISSIONS: readonly Mission[] = build();

export function missionById(id: string): Mission {
  return MISSIONS.find(m => m.id === id) ?? MISSIONS[0];
}

export function isMissionUnlocked(mission: Mission, stalls: string[]): boolean {
  if (!isDistrictUnlocked(mission.districtIndex, stalls)) {
    return false;
  }
  if (mission.index === 0) {
    return true;
  }
  const previous = MISSIONS.find(
    m => m.districtIndex === mission.districtIndex && m.index === mission.index - 1,
  );
  return previous ? stalls.indexOf(previous.stallId) >= 0 : true;
}

export function isMissionWon(mission: Mission, stalls: string[]): boolean {
  return stalls.indexOf(mission.stallId) >= 0;
}

/** The first mission that is open and not yet finished (falls back to the last one). */
export function nextMission(stalls: string[]): Mission {
  const open = MISSIONS.find(m => isMissionUnlocked(m, stalls) && !isMissionWon(m, stalls));
  return open ?? MISSIONS[MISSIONS.length - 1];
}

/**
 * Tokens come from the CENTRE row only: the theme symbol or a wild.
 * The Closing Bell Rush doubles them on the final spin of the budget.
 */
export function countTokens(grid: Grid, themeKey: SymbolKey, closingBell: boolean): number {
  let tokens = 0;
  for (let c = 0; c < 3; c++) {
    const cell = grid[1][c];
    if (cell.key === themeKey || isWild(cell)) {
      tokens += 1;
    }
  }
  return closingBell ? tokens * CLOSING_BELL_MULT : tokens;
}

export type MissionOutcome = 'running' | 'won' | 'lost' | 'broke';

export function resolveMission(state: {
  tokens: number;
  goalTokens: number;
  spinsUsed: number;
  spinBudget: number;
  balance: number;
  bet: number;
}): MissionOutcome {
  if (state.tokens >= state.goalTokens) {
    return 'won';
  }
  if (state.spinsUsed >= state.spinBudget) {
    return 'lost';
  }
  if (state.balance < state.bet) {
    return 'broke';
  }
  return 'running';
}

export function isClosingBell(spinsUsed: number, spinBudget: number): boolean {
  return spinsUsed === spinBudget - 1;
}

export function missionGoalText(mission: Mission, themeName: string): string {
  return (
    'COLLECT ' + mission.goalTokens + ' ' + themeName + ' TOKENS IN ' + mission.spinBudget + ' SPINS'
  );
}

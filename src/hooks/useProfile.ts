import {useCallback, useEffect, useRef, useState} from 'react';
import {STARTING_BALANCE} from '../constants/config';
import {Mission} from '../game/missions';
import {
  clearProfile,
  defaultProfile,
  loadProfile,
  Profile,
  saveProfile,
  Settings,
} from '../game/storage';

export type ProfileApi = {
  profile: Profile;
  ready: boolean;
  recordSpin: (payload: {win: number; bestLine: number}) => void;
  spendCoins: (amount: number) => void;
  grantCoins: (amount: number) => void;
  completeMission: (mission: Mission, coins: number) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetProgress: () => void;
};

export function useProfile(): ProfileApi {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    loadProfile().then(loaded => {
      if (alive) {
        setProfile(loaded);
        setReady(true);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  // Persist outside the render pass (rule 7.3: no writes started from render).
  const readyRef = useRef(false);
  readyRef.current = ready;
  useEffect(() => {
    if (readyRef.current) {
      saveProfile(profile);
    }
  }, [profile]);

  const recordSpin = useCallback((payload: {win: number; bestLine: number}) => {
    setProfile(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        totalSpins: prev.stats.totalSpins + 1,
        bestWin: Math.max(prev.stats.bestWin, payload.win),
        biggestLine: Math.max(prev.stats.biggestLine, payload.bestLine),
        coinsWon: prev.stats.coinsWon + Math.max(0, payload.win),
      },
    }));
  }, []);

  const spendCoins = useCallback((amount: number) => {
    setProfile(prev => ({...prev, balance: Math.max(0, prev.balance - amount)}));
  }, []);

  const grantCoins = useCallback((amount: number) => {
    setProfile(prev => ({...prev, balance: prev.balance + amount}));
  }, []);

  const completeMission = useCallback((mission: Mission, coins: number) => {
    setProfile(prev => {
      if (prev.stalls.indexOf(mission.stallId) >= 0) {
        return prev;
      }
      return {
        ...prev,
        stalls: prev.stalls.concat(mission.stallId),
        stallCoins: {...prev.stallCoins, [mission.stallId]: Math.max(0, Math.round(coins))},
        stats: {...prev.stats, missionsWon: prev.stats.missionsWon + 1},
      };
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setProfile(prev => ({...prev, settings: {...prev.settings, ...patch}}));
  }, []);

  const resetProgress = useCallback(() => {
    clearProfile().then(fresh => setProfile({...fresh, balance: STARTING_BALANCE}));
  }, []);

  return {
    profile,
    ready,
    recordSpin,
    spendCoins,
    grantCoins,
    completeMission,
    updateSettings,
    resetProgress,
  };
}

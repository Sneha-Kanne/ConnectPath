import { UserGamificationState } from '../types';

const STORAGE_KEY = 'connectpath_gamification_v1';
export const GAMIFICATION_UPDATE_EVENT = 'connectpath_gamification_updated';

const DEFAULT_STATE: UserGamificationState = {
  userId: 'user-local-operator',
  userName: 'You (Local Scout)',
  points: 45, // Started with 45 baseline points for onboarding
  reportsCount: 3,
  upvotesCount: 3,
  badges: [],
  reportedCities: ['Hyderabad', 'Secunderabad', 'Bhongir'],
};

export interface LeaderboardEntry {
  rank: number;
  name: string;
  userName: string;
  location: string;
  points: number;
  reportsCount: number;
  badge: string;
  badges: string[];
  isCurrentUser?: boolean;
}

export const LEADERBOARD_COMMUNITY: Omit<LeaderboardEntry, 'rank'>[] = [
  {
    name: 'Vamshi Krishna',
    userName: 'Vamshi Krishna',
    location: 'Hyderabad - Warangal Hub',
    points: 420,
    reportsCount: 32,
    badge: 'Telangana Explorer',
    badges: ['Signal Scout', 'Network Guardian', 'Telangana Explorer'],
  },
  {
    name: 'Priya Reddy',
    userName: 'Priya Reddy',
    location: 'Warangal Urban',
    points: 340,
    reportsCount: 25,
    badge: 'Network Guardian',
    badges: ['Signal Scout', 'Network Guardian'],
  },
  {
    name: 'Rahul Varma',
    userName: 'Rahul Varma',
    location: 'Karimnagar SH-1',
    points: 285,
    reportsCount: 19,
    badge: 'Signal Scout',
    badges: ['Signal Scout'],
  },
  {
    name: 'Ananya Rao',
    userName: 'Ananya Rao',
    location: 'Nizamabad - NH-44',
    points: 210,
    reportsCount: 14,
    badge: 'Signal Scout',
    badges: ['Signal Scout'],
  },
  {
    name: 'Sai Teja M.',
    userName: 'Sai Teja M.',
    location: 'Khammam Corridor',
    points: 175,
    reportsCount: 11,
    badge: 'Signal Scout',
    badges: ['Signal Scout'],
  },
];

export function getLeaderboard(): LeaderboardEntry[] {
  const currentUser = getGamificationState();
  const currentBadge = currentUser.badges && currentUser.badges.length > 0
    ? currentUser.badges[currentUser.badges.length - 1].name
    : 'Local Scout';

  const userEntry: Omit<LeaderboardEntry, 'rank'> = {
    name: 'You',
    userName: 'You',
    location: 'Telangana Grid Node',
    points: currentUser.points,
    reportsCount: currentUser.reportsCount,
    badge: currentBadge,
    badges: (currentUser.badges || []).map(b => b.name),
    isCurrentUser: true,
  };

  const all = [...LEADERBOARD_COMMUNITY, userEntry];
  all.sort((a, b) => b.points - a.points);

  return all.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

export function getGamificationState(): UserGamificationState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return evaluateBadges(parsed);
    }
  } catch {
    // fallback
  }
  return evaluateBadges(DEFAULT_STATE);
}

export function saveGamificationState(state: UserGamificationState): void {
  try {
    const evaluated = evaluateBadges(state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(evaluated));
    window.dispatchEvent(new CustomEvent(GAMIFICATION_UPDATE_EVENT, { detail: evaluated }));
    
    // Also attempt server sync asynchronously
    fetch('/api/gamification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evaluated),
    }).catch(() => {});
  } catch {
    // ignore
  }
}

export function evaluateBadges(state: UserGamificationState): UserGamificationState {
  const currentBadges = [...(state.badges || [])];

  const hasScout = currentBadges.some(b => b.name === 'Signal Scout');
  const hasGuardian = currentBadges.some(b => b.name === 'Network Guardian');
  const hasExplorer = currentBadges.some(b => b.name === 'Telangana Explorer');

  // 'Signal Scout' - 5 reports submitted
  if (state.reportsCount >= 5 && !hasScout) {
    currentBadges.push({
      id: 'badge-scout',
      name: 'Signal Scout',
      description: 'Submitted 5+ signal reports',
      icon: 'S',
      unlockedAt: new Date().toISOString(),
    });
  }

  // 'Network Guardian' - 20 reports submitted
  if (state.reportsCount >= 20 && !hasGuardian) {
    currentBadges.push({
      id: 'badge-guardian',
      name: 'Network Guardian',
      description: 'Submitted 20+ verified reports',
      icon: 'G',
      unlockedAt: new Date().toISOString(),
    });
  }

  // 'Telangana Explorer' - reported in 10+ different cities
  const uniqueCities = Array.from(new Set(state.reportedCities || []));
  if (uniqueCities.length >= 10 && !hasExplorer) {
    currentBadges.push({
      id: 'badge-explorer',
      name: 'Telangana Explorer',
      description: 'Reported signals across 10+ districts',
      icon: 'E',
      unlockedAt: new Date().toISOString(),
    });
  }

  return {
    ...state,
    badges: currentBadges,
  };
}

/**
 * Award 10 points for a new report
 */
export function awardReportPoints(cityLocation?: string): UserGamificationState {
  const current = getGamificationState();
  const reportedCities = [...(current.reportedCities || [])];
  if (cityLocation && !reportedCities.includes(cityLocation)) {
    reportedCities.push(cityLocation);
  }

  const updated: UserGamificationState = {
    ...current,
    points: current.points + 10,
    reportsCount: current.reportsCount + 1,
    reportedCities,
  };

  saveGamificationState(updated);
  return updated;
}

/**
 * Award 5 points for confirming/upvoting someone else's report
 */
export function awardUpvotePoints(): UserGamificationState {
  const current = getGamificationState();
  const updated: UserGamificationState = {
    ...current,
    points: current.points + 5,
    upvotesCount: current.upvotesCount + 1,
  };

  saveGamificationState(updated);
  return updated;
}

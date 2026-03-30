import {
  LEVELS, BADGES, DIFF_MULT, DIFF_WEIGHT,
  XP_SESSION_BASE, DECAY_INTERVAL_DAYS, DECAY_BASE_XP, MUSCLE_GROUPS,
} from '../data/constants';

const K = {
  PLAYER:   'gymrpg_player',
  SESSIONS: 'gymrpg_sessions',
  PRS:      'gymrpg_prs',
};

const get = key => { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch { return null; } };
const set = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

const DEFAULT_PLAYER = {
  totalXP: 0, badges: [], sessionCount: 0,
  weeklyStreak: 0, lastSessionDate: null,
  lastDecayCheck: null, hadDecay: false,
};

export const getPlayer   = () => ({ ...DEFAULT_PLAYER, ...(get(K.PLAYER) || {}) });
export const savePlayer  = p  => set(K.PLAYER, p);
export const getSessions = () => get(K.SESSIONS) || [];
export const getPRs      = () => get(K.PRS)      || {};

// ─── Level info ────────────────────────────────────────────
export function getLevelInfo(totalXP) {
  const xp = Math.max(0, totalXP);
  let current = LEVELS[0], next = LEVELS[1] || null;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) { current = LEVELS[i]; next = LEVELS[i + 1] || null; break; }
  }
  const xpInto  = xp - current.xp;
  const xpNeeded = next ? next.xp - current.xp : 1;
  return { current, next, xpInto, xpNeeded, progress: next ? xpInto / xpNeeded : 1 };
}

// ─── XP calc ───────────────────────────────────────────────
export function calcSessionXP(exercises) {
  let xp = XP_SESSION_BASE;
  exercises.forEach(ex => ex.sets.forEach(s => {
    xp += Math.round(s.reps * (DIFF_MULT[s.difficulty] || 1) * 3);
  }));
  return xp;
}

// ─── Decay ─────────────────────────────────────────────────
function sessionIntensity(session) {
  const sets = session.exercises?.flatMap(e => e.sets) || [];
  if (!sets.length) return 1;
  const avg = sets.reduce((a, s) => a + (DIFF_WEIGHT[s.difficulty] || 1), 0) / sets.length;
  return Math.min(2.0, Math.max(0.8, avg));
}

export function applyDecay() {
  const player = getPlayer();
  if (!player.lastSessionDate) return { player, decayApplied: 0 };

  const now          = Date.now();
  const lastActivity = new Date(player.lastSessionDate).getTime();
  const daysMissed   = (now - lastActivity) / 86400000;
  const intervals    = Math.floor(daysMissed / DECAY_INTERVAL_DAYS);
  if (intervals === 0) return { player, decayApplied: 0 };

  const lastCheck     = player.lastDecayCheck ? new Date(player.lastDecayCheck).getTime() : lastActivity;
  const newIntervals  = Math.floor((now - lastCheck) / (DECAY_INTERVAL_DAYS * 86400000));
  if (newIntervals === 0) return { player, decayApplied: 0 };

  const sessions    = getSessions();
  const intensity   = sessions[0] ? sessionIntensity(sessions[0]) : 1;
  const totalDecay  = Math.round(DECAY_BASE_XP * intensity) * newIntervals;
  const newXP       = Math.max(0, player.totalXP - totalDecay);
  const weeksM      = daysMissed / 7;
  const newStreak   = Math.max(0, player.weeklyStreak - Math.floor(weeksM));

  const updated = { ...player, totalXP: newXP, weeklyStreak: newStreak, lastDecayCheck: new Date().toISOString(), hadDecay: true };
  savePlayer(updated);
  return { player: updated, decayApplied: totalDecay };
}

export function daysUntilNextDecay(lastSessionDate) {
  if (!lastSessionDate) return null;
  const daysSince = (Date.now() - new Date(lastSessionDate).getTime()) / 86400000;
  const nextAt    = Math.ceil(daysSince / DECAY_INTERVAL_DAYS) * DECAY_INTERVAL_DAYS;
  return Math.max(0, Math.round(nextAt - daysSince));
}

// ─── Week key ──────────────────────────────────────────────
function weekKey(date) {
  const d = new Date(date), jan1 = new Date(d.getFullYear(), 0, 1);
  const w = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${w}`;
}

// ─── Badges ────────────────────────────────────────────────
function checkBadges(player, prs, session) {
  const earned = new Set(player.badges);
  const newly  = [];
  const maybe  = (id, cond) => { if (!earned.has(id) && cond) { earned.add(id); newly.push(id); } };
  const totalPRs = Object.values(prs).filter(v => v.best > 0).length;

  maybe('first_session',   player.sessionCount >= 1);
  maybe('sessions_5',      player.sessionCount >= 5);
  maybe('sessions_10',     player.sessionCount >= 10);
  maybe('sessions_25',     player.sessionCount >= 25);
  maybe('first_pr',        totalPRs >= 1);
  maybe('pr_5',            totalPRs >= 5);
  maybe('survived_decay',  player.hadDecay === true);
  maybe('streak_3',        player.weeklyStreak >= 3);

  session.exercises.forEach(ex => ex.sets.forEach(s => {
    maybe('pullup_6',  ex.exerciseId === 'pullups' && s.reps >= 6);
    maybe('chinup_6',  ex.exerciseId === 'chinups' && s.reps >= 6);
    maybe('dips_10',   ex.exerciseId === 'dips'    && s.reps >= 10);
    maybe('bss_unlocked', ex.exerciseId === 'bss'  && s.reps > 0);
  }));

  const allDone = session.exercises.every(ex => ex.sets.every(s => s.reps > 0));
  maybe('perfect_session', allDone);
  return { updatedBadges: [...earned], newly };
}

// ─── Commit session ────────────────────────────────────────
export function commitSession(sessionData) {
  const player   = getPlayer();
  const prs      = getPRs();
  const sessions = getSessions();

  const newPRs = [];
  sessionData.exercises.forEach(ex => ex.sets.forEach(s => {
    const prev = prs[ex.exerciseId]?.best || 0;
    if (s.reps > prev) {
      prs[ex.exerciseId] = { best: s.reps, date: sessionData.date };
      newPRs.push({ exerciseId: ex.exerciseId, reps: s.reps });
    }
  }));
  set(K.PRS, prs);

  const xpEarned     = calcSessionXP(sessionData.exercises);
  const thisWeek     = weekKey(sessionData.date);
  const lastWeek     = player.lastSessionDate ? weekKey(player.lastSessionDate) : null;
  const weeklyStreak = lastWeek !== thisWeek ? player.weeklyStreak + 1 : player.weeklyStreak;

  const updatedPlayer = {
    ...player,
    totalXP:         Math.max(0, player.totalXP + xpEarned),
    sessionCount:    player.sessionCount + 1,
    weeklyStreak,
    lastSessionDate: sessionData.date,
    lastDecayCheck:  sessionData.date,
  };

  const { updatedBadges, newly } = checkBadges(updatedPlayer, prs, sessionData);
  updatedPlayer.badges = updatedBadges;

  savePlayer(updatedPlayer);
  sessions.unshift({ ...sessionData, xpEarned, newPRs });
  set(K.SESSIONS, sessions);

  return { xpEarned, newPRs, newlyEarned: newly, player: updatedPlayer };
}

// ─── Stats helpers ─────────────────────────────────────────
export function buildMuscleScores(sessions, n = 5) {
  const recent = sessions.slice(0, n);
  if (!recent.length) return MUSCLE_GROUPS.map(g => ({ ...g, score: 0 }));
  const scores = MUSCLE_GROUPS.map(group => {
    let total = 0, count = 0;
    recent.forEach(sess => sess.exercises?.forEach(ex => {
      if (group.exercises.includes(ex.exerciseId)) {
        ex.sets?.forEach(s => { total += s.reps * (DIFF_WEIGHT[s.difficulty] || 1); count++; });
      }
    }));
    return { ...group, raw: count > 0 ? total / count : 0 };
  });
  const max = Math.max(...scores.map(s => s.raw), 1);
  return scores.map(s => ({ ...s, score: Math.round((s.raw / max) * 100) }));
}

export function buildXPHistory(sessions, n = 8) {
  return [...sessions].reverse().slice(-n).map(s => ({
    date:  new Date(s.date).toLocaleDateString('en-IE', { day: 'numeric', month: 'short' }),
    xp:    s.xpEarned || 0,
    hadPR: (s.newPRs?.length || 0) > 0,
  }));
}

export function buildDiffBreakdown(sessions) {
  const counts = { easy: 0, ish: 0, hard: 0, 'very difficult': 0 };
  sessions.forEach(s => s.exercises?.forEach(ex => ex.sets?.forEach(set => {
    if (set.difficulty in counts) counts[set.difficulty]++;
  })));
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(counts).map(([diff, count]) => ({ diff, count, pct: Math.round((count / total) * 100) }));
}

export function buildRepHistory(sessions, exerciseId, n = 8) {
  return [...sessions].reverse().slice(-n)
    .map(s => s.exercises?.find(e => e.exerciseId === exerciseId)?.sets?.[0]?.reps ?? null)
    .filter(v => v !== null);
}

// ─── Export ────────────────────────────────────────────────
export function exportAllData() {
  const player   = getPlayer();
  const sessions = getSessions();
  const prs      = getPRs();
  const levelInfo = getLevelInfo(player.totalXP);
  const badgeLookup = Object.fromEntries(BADGES.map(b => [b.id, b]));

  return JSON.stringify({
    exportedAt:    new Date().toISOString(),
    exportVersion: '2.0',
    player: {
      totalXP:         player.totalXP,
      level:           levelInfo.current.level,
      levelName:       levelInfo.current.name,
      xpToNextLevel:   levelInfo.next ? levelInfo.xpNeeded - levelInfo.xpInto : 0,
      sessionCount:    player.sessionCount,
      weeklyStreak:    player.weeklyStreak,
      lastSessionDate: player.lastSessionDate,
      hadDecay:        player.hadDecay || false,
    },
    badges: {
      earned:   (player.badges || []).map(id => ({ id, name: badgeLookup[id]?.name || id, desc: badgeLookup[id]?.desc || '' })),
      locked:   BADGES.filter(b => !player.badges?.includes(b.id)).map(b => ({ id: b.id, name: b.name, desc: b.desc })),
      total:    BADGES.length,
      unlocked: (player.badges || []).length,
    },
    personalRecords: Object.entries(prs).map(([exerciseId, pr]) => ({
      exerciseId, best: pr.best || pr, date: pr.date || null,
    })),
    sessions: sessions.map(s => {
      const allSets   = s.exercises?.flatMap(ex => ex.sets) || [];
      const totalReps = allSets.reduce((a, b) => a + (b.reps || 0), 0);
      const diffCounts = { easy: 0, ish: 0, hard: 0, 'very difficult': 0 };
      allSets.forEach(set => { if (set.difficulty in diffCounts) diffCounts[set.difficulty]++; });
      return { date: s.date, xpEarned: s.xpEarned || 0, totalReps, newPRs: s.newPRs || [], diffBreakdown: diffCounts, exercises: s.exercises };
    }),
    meta: {
      decayConfig:  { intervalDays: 3, baseXPPenalty: 200, intensityScaled: true },
      xpConfig:     { sessionBase: 50, repsMultipliers: { easy: 3, ish: 3.75, hard: 4.5, 'very difficult': 6 } },
    },
  }, null, 2);
}

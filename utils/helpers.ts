import { StudyStreak } from "../types";

/** Returns today's date as YYYY-MM-DD (local time). */
export function getTodayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Updates a study streak given today's date key. Call this once per "active"
 * action per day (e.g. completing an MCQ session or writing an answer).
 */
export function updateStreak(streak: StudyStreak, todayKey: string = getTodayKey()): StudyStreak {
  if (streak.lastActiveDate === todayKey) {
    // Already counted today
    return streak;
  }

  let current = 1;
  if (streak.lastActiveDate) {
    const diff = daysBetween(streak.lastActiveDate, todayKey);
    if (diff === 1) {
      current = streak.current + 1;
    } else if (diff <= 0) {
      current = streak.current; // safety: don't go backwards
    } else {
      current = 1; // streak broken
    }
  }

  return {
    current,
    longest: Math.max(streak.longest, current),
    lastActiveDate: todayKey,
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function formatPercent(numerator: number, denominator: number): number {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 100);
}

// ---------------------------------------------------------------------------
// Weekly progress calculation
// ---------------------------------------------------------------------------
interface DatedEntry {
  date: string; // ISO timestamp or yyyy-mm-dd
}

/**
 * Computes "% of daily goals completed" across the last 7 days, where each
 * day's goal is: at least 1 MCQ session attempted AND at least 1 answer
 * written. Returns a 0-100 percentage.
 */
export function computeWeeklyProgress(
  mcqHistory: DatedEntry[],
  answerHistory: DatedEntry[],
  today: Date = new Date()
): number {
  let completedUnits = 0;
  const totalUnits = 14; // 7 days * 2 goals (MCQ + answer)

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = getTodayKey(d);

    const hasMCQ = mcqHistory.some((h) => h.date.startsWith(key));
    const hasAnswer = answerHistory.some((h) => h.date.startsWith(key));

    if (hasMCQ) completedUnits++;
    if (hasAnswer) completedUnits++;
  }

  return Math.round((completedUnits / totalUnits) * 100);
}

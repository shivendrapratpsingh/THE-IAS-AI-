import { useCallback, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Generic AsyncStorage-backed state hook.
 *
 * Usage:
 *   const [profile, setProfile, loading] = useStorage<UserProfile | null>("user_profile", null);
 *
 * - Reads the stored value (JSON) on mount.
 * - `setValue` updates state AND persists to AsyncStorage.
 * - `setValue` also accepts an updater function, like useState.
 */
export function useStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(key);
        if (raw != null && isMounted.current) {
          setValue(JSON.parse(raw));
        }
      } catch (e) {
        console.warn(`useStorage: failed to load "${key}"`, e);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    })();
    return () => {
      isMounted.current = false;
    };
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (prev: T) => T)(prev) : next;
        AsyncStorage.setItem(key, JSON.stringify(resolved)).catch((e) =>
          console.warn(`useStorage: failed to save "${key}"`, e)
        );
        return resolved;
      });
    },
    [key]
  );

  return [value, update, loading];
}

// ---------------------------------------------------------------------------
// Plain helper functions (for use outside React components / inside hooks)
// ---------------------------------------------------------------------------

export async function getStoredValue<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw != null ? (JSON.parse(raw) as T) : fallback;
  } catch (e) {
    console.warn(`getStoredValue: failed to load "${key}"`, e);
    return fallback;
  }
}

export async function setStoredValue<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`setStoredValue: failed to save "${key}"`, e);
  }
}

export async function removeStoredValue(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.warn(`removeStoredValue: failed to remove "${key}"`, e);
  }
}

// ---------------------------------------------------------------------------
// Storage keys used throughout the app (single source of truth)
// ---------------------------------------------------------------------------
export const STORAGE_KEYS = {
  USER_PROFILE: "ias_user_profile",
  ONBOARDING_DONE: "ias_onboarding_done",
  STUDY_PLAN: "ias_study_plan",
  COMPLETED_TOPICS: "ias_completed_topics",
  MCQ_STATS: "ias_mcq_stats",
  MCQ_HISTORY: "ias_mcq_history",
  MCQ_DAILY_SET: "ias_mcq_daily_set",
  ANSWER_HISTORY: "ias_answer_history",
  ANSWER_PROMPT_INDEX: "ias_answer_prompt_index",
  BOOKMARKED_AFFAIRS: "ias_bookmarked_affairs",
  STUDY_STREAK: "ias_study_streak",
  LEGAL_QUESTION_CACHE: "ias_legal_question_cache",
  DARK_MODE: "ias_dark_mode",
} as const;

// ============================================================================
// Shared TypeScript types used across the app.
// ============================================================================

export type PrepStage = "Beginner" | "Intermediate" | "Advanced";

export interface UserProfile {
  name: string;
  prepStage: PrepStage;
  targetYear: number;
  dailyHours: number;
  subjects: string[]; // optional subject preferences
}

export interface StudyTopic {
  id: string;
  title: string;
  description?: string;
  done?: boolean;
}

export interface StudyWeek {
  week: number;
  title: string;
  focus: string;
  topics: StudyTopic[];
}

export interface StudyPlan {
  generatedAt: string;
  profileSnapshot: UserProfile;
  weeks: StudyWeek[];
  source: "ai" | "fallback";
}

export interface TopicStat {
  attempted: number;
  correct: number;
}

export interface MCQStats {
  totalAttempted: number;
  totalCorrect: number;
  byTopic: Record<string, TopicStat>;
}

export interface MCQHistoryEntry {
  mcqId: string;
  selectedIndex: number;
  isCorrect: boolean;
  date: string; // ISO timestamp
}

export interface StudyStreak {
  current: number;
  longest: number;
  lastActiveDate: string | null; // yyyy-mm-dd
}

export interface DailyStats {
  date: string; // yyyy-mm-dd
  mcqAttempted: number;
  answersWritten: number;
}

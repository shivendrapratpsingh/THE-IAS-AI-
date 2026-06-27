import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import PatrioticHero from "../../components/PatrioticHero";
import ProgressBar from "../../components/ProgressBar";
import LegalQuestionCard from "../../components/LegalQuestionCard";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useStorage, STORAGE_KEYS } from "../../hooks/useStorage";
import { useClaude } from "../../hooks/useClaude";
import { MCQHistoryEntry, StudyStreak, UserProfile } from "../../types";
import { AnswerHistoryEntry } from "../../components/AnswerCard";
import { getFallbackLegalQuestion, LegalQuestion } from "../../data/questions";
import { computeWeeklyProgress, getTodayKey } from "../../utils/helpers";
import { radius, spacing, fontSizes } from "../../constants/theme";

interface LegalQuestionCache {
  date: string;
  data: LegalQuestion | null;
  isFallback: boolean;
}

export default function HomeScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { askClaudeJSON, apiAvailable } = useClaude();

  const [profile] = useStorage<UserProfile | null>(STORAGE_KEYS.USER_PROFILE, null);
  const [mcqHistory] = useStorage<MCQHistoryEntry[]>(STORAGE_KEYS.MCQ_HISTORY, []);
  const [answerHistory] = useStorage<AnswerHistoryEntry[]>(STORAGE_KEYS.ANSWER_HISTORY, []);
  const [streak] = useStorage<StudyStreak>(STORAGE_KEYS.STUDY_STREAK, {
    current: 0,
    longest: 0,
    lastActiveDate: null,
  });
  const [legalCache, setLegalCache] = useStorage<LegalQuestionCache>(
    STORAGE_KEYS.LEGAL_QUESTION_CACHE,
    { date: "", data: null, isFallback: false }
  );
  const [legalLoading, setLegalLoading] = useState(false);

  const todayKey = getTodayKey();
  const mcqAttemptedToday = mcqHistory.filter((h) => h.date.startsWith(todayKey)).length;
  const answersWrittenToday = answerHistory.filter((h) => h.date.startsWith(todayKey)).length;
  const weeklyProgress = computeWeeklyProgress(mcqHistory, answerHistory);

  useEffect(() => {
    if (legalCache.date === todayKey && legalCache.data) return;

    let cancelled = false;
    (async () => {
      setLegalLoading(true);
      if (apiAvailable) {
        const prompt = `Generate a UPSC Civil Services-relevant legal/constitutional question for ${todayKey}. Respond with ONLY valid JSON in exactly this shape: { "question": "...", "options": ["A text", "B text", "C text", "D text"], "correct_answer": "A" | "B" | "C" | "D", "explanation": "..." }`;
        const result = await askClaudeJSON<LegalQuestion>(prompt, { maxTokens: 512 });
        if (!cancelled) {
          if (result && result.question && Array.isArray(result.options)) {
            setLegalCache({ date: todayKey, data: result, isFallback: false });
          } else {
            setLegalCache({ date: todayKey, data: getFallbackLegalQuestion(), isFallback: true });
          }
          setLegalLoading(false);
        }
      } else {
        if (!cancelled) {
          setLegalCache({ date: todayKey, data: getFallbackLegalQuestion(), isFallback: true });
          setLegalLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayKey]);

  const greetingName = profile?.name ? profile.name.split(" ")[0] : "Aspirant";

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.content}>
      <View style={styles.heroWrap}>
        <PatrioticHero variant="banner" />
        <View style={styles.heroOverlay}>
          <Text style={styles.greeting}>Namaste, {greetingName} 🇮🇳</Text>
          <Text style={styles.greetingSub}>Seva, Samarpan, Safalta — Service, Dedication, Success</Text>
        </View>
      </View>

      {/* Today's stats */}
      <View style={styles.statsRow}>
        <StatCard
          icon="checkbox-outline"
          label="MCQs Today"
          value={String(mcqAttemptedToday)}
          color={theme.accent}
          theme={theme}
        />
        <StatCard
          icon="create-outline"
          label="Answers Today"
          value={String(answersWrittenToday)}
          color={theme.accentGreen}
          theme={theme}
        />
        <StatCard
          icon="flame"
          label="Streak"
          value={`${streak.current}d`}
          color="#FF6B35"
          theme={theme}
        />
      </View>

      {/* Weekly progress */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>This Week's Progress</Text>
        <ProgressBar progress={weeklyProgress} label="Daily goals completed" />
        <Text style={[styles.cardHint, { color: theme.textMuted }]}>
          Goal: complete an MCQ session and write one answer every day.
        </Text>
      </View>

      {/* Legal question */}
      <View style={styles.section}>
        {legalCache.data && (
          <LegalQuestionCard
            legalQuestion={legalCache.data}
            loading={legalLoading && !legalCache.data}
            isFallback={legalCache.isFallback}
          />
        )}
      </View>

      {/* Quick actions */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
      <View style={styles.actionsRow}>
        <ActionButton
          icon="checkbox"
          label="Start MCQs"
          color={theme.accent}
          onPress={() => router.push("/mcq")}
          theme={theme}
        />
        <ActionButton
          icon="create"
          label="Write an Answer"
          color={theme.accentGreen}
          onPress={() => router.push("/answers")}
          theme={theme}
        />
        <ActionButton
          icon="calendar"
          label="Study Plan"
          color={theme.primary}
          onPress={() => router.push("/study-plan")}
          theme={theme}
        />
      </View>
    </ScrollView>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  theme,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
  theme: ReturnType<typeof useAppTheme>;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textMuted }]}>{label}</Text>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  color,
  onPress,
  theme,
}: {
  icon: any;
  label: string;
  color: string;
  onPress: () => void;
  theme: ReturnType<typeof useAppTheme>;
}) {
  return (
    <TouchableOpacity
      style={[styles.actionButton, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.actionIcon, { backgroundColor: color + "22" }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.actionLabel, { color: theme.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xl * 2,
  },
  heroWrap: {
    height: 160,
    width: "100%",
    position: "relative",
  },
  heroOverlay: {
    position: "absolute",
    bottom: spacing.md,
    left: spacing.lg,
    right: spacing.lg,
  },
  greeting: {
    color: "#fff",
    fontSize: fontSizes.lg,
    fontWeight: "800",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  greetingSub: {
    color: "#FFE9B8",
    fontSize: fontSizes.xs,
    marginTop: 2,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    gap: 4,
  },
  statValue: {
    fontSize: fontSizes.lg,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: fontSizes.xs,
    textAlign: "center",
  },
  card: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  cardTitle: {
    fontSize: fontSizes.md,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  cardHint: {
    fontSize: fontSizes.xs,
    marginTop: 4,
  },
  section: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: "700",
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: fontSizes.xs,
    fontWeight: "700",
    textAlign: "center",
  },
});

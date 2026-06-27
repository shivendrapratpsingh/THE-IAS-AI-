import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useStorage, STORAGE_KEYS } from "../../hooks/useStorage";
import { useClaude } from "../../hooks/useClaude";
import MCQCard from "../../components/MCQCard";
import ProgressBar from "../../components/ProgressBar";
import { getDailyMCQSet, MCQ, MCQ_BANK } from "../../data/questions";
import { MCQHistoryEntry, MCQStats, StudyStreak } from "../../types";
import { getTodayKey, updateStreak, formatPercent } from "../../utils/helpers";
import { radius, spacing, fontSizes } from "../../constants/theme";

export default function MCQScreen() {
  const theme = useAppTheme();
  const { askClaude, apiAvailable } = useClaude();

  const [mcqStats, setMcqStats] = useStorage<MCQStats>(STORAGE_KEYS.MCQ_STATS, {
    totalAttempted: 0,
    totalCorrect: 0,
    byTopic: {},
  });
  const [mcqHistory, setMcqHistory] = useStorage<MCQHistoryEntry[]>(STORAGE_KEYS.MCQ_HISTORY, []);
  const [streak, setStreak] = useStorage<StudyStreak>(STORAGE_KEYS.STUDY_STREAK, {
    current: 0,
    longest: 0,
    lastActiveDate: null,
  });

  const dailySet = useMemo(() => getDailyMCQSet(new Date(), 10), []);
  const [sessionSet, setSessionSet] = useState<MCQ[]>(dailySet);
  const [answers, setAnswers] = useState<Record<string, { selected: number; correct: boolean }>>({});
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});
  const [explanationLoading, setExplanationLoading] = useState<Record<string, boolean>>({});
  const [sessionComplete, setSessionComplete] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter((a) => a.correct).length;

  const handleAnswer = (mcq: MCQ, selectedIndex: number, isCorrect: boolean) => {
    setAnswers((prev) => {
      if (prev[mcq.id]) return prev; // already answered
      const next = { ...prev, [mcq.id]: { selected: selectedIndex, correct: isCorrect } };

      // Update persistent stats
      setMcqStats((stats) => {
        const topicStat = stats.byTopic[mcq.topic] ?? { attempted: 0, correct: 0 };
        return {
          totalAttempted: stats.totalAttempted + 1,
          totalCorrect: stats.totalCorrect + (isCorrect ? 1 : 0),
          byTopic: {
            ...stats.byTopic,
            [mcq.topic]: {
              attempted: topicStat.attempted + 1,
              correct: topicStat.correct + (isCorrect ? 1 : 0),
            },
          },
        };
      });

      setMcqHistory((history) => [
        ...history,
        { mcqId: mcq.id, selectedIndex, isCorrect, date: new Date().toISOString() } as MCQHistoryEntry,
      ]);

      if (Object.keys(next).length === sessionSet.length) {
        setStreak((s) => updateStreak(s));
        setSessionComplete(true);
      }

      return next;
    });
  };

  const handleExplain = async (mcq: MCQ) => {
    if (!apiAvailable) {
      setAiExplanations((prev) => ({
        ...prev,
        [mcq.id]: "AI unavailable, try again. (Add your Anthropic API key in config/api.js.)",
      }));
      return;
    }
    setExplanationLoading((prev) => ({ ...prev, [mcq.id]: true }));
    const prompt = `A UPSC aspirant answered this MCQ:\n\nQuestion: ${mcq.question}\nOptions: ${mcq.options
      .map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`)
      .join(" | ")}\nCorrect answer: ${String.fromCharCode(65 + mcq.correctIndex)}\nStandard explanation: ${mcq.explanation}\n\nProvide a deeper explanation (3-5 sentences) connecting this concept to related UPSC topics, possible follow-up questions, and any mnemonic or memory tip. Keep it concise and exam-focused.`;

    const result = await askClaude(prompt, { maxTokens: 400 });
    setExplanationLoading((prev) => ({ ...prev, [mcq.id]: false }));
    setAiExplanations((prev) => ({
      ...prev,
      [mcq.id]: result ?? "AI unavailable, try again.",
    }));
  };

  const handleRetryWrong = () => {
    const wrongIds = Object.entries(answers)
      .filter(([, v]) => !v.correct)
      .map(([id]) => id);
    if (!wrongIds.length) return;
    const wrongQuestions = MCQ_BANK.filter((m) => wrongIds.includes(m.id));
    setSessionSet(wrongQuestions);
    setAnswers({});
    setAiExplanations({});
    setSessionComplete(false);
  };

  const handleNewSession = () => {
    // Shuffle a fresh random 10 from the bank (different from today's deterministic set)
    const shuffled = [...MCQ_BANK].sort(() => Math.random() - 0.5).slice(0, 10);
    setSessionSet(shuffled);
    setAnswers({});
    setAiExplanations({});
    setSessionComplete(false);
  };

  const overallAccuracy = formatPercent(mcqStats.totalCorrect, mcqStats.totalAttempted);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.content}>
      <View style={[styles.statsCard, { backgroundColor: theme.primary }]}>
        <View style={styles.statsRow}>
          <View style={styles.statsItem}>
            <Text style={styles.statsValue}>{mcqStats.totalAttempted}</Text>
            <Text style={styles.statsLabel}>Total Attempted</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={styles.statsValue}>{overallAccuracy}%</Text>
            <Text style={styles.statsLabel}>Overall Accuracy</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={styles.statsValue}>
              {correctCount}/{answeredCount || sessionSet.length}
            </Text>
            <Text style={styles.statsLabel}>This Session</Text>
          </View>
        </View>
      </View>

      {Object.keys(mcqStats.byTopic).length > 0 && (
        <View style={[styles.topicCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.topicCardTitle, { color: theme.text }]}>Accuracy by Topic</Text>
          {Object.entries(mcqStats.byTopic).map(([topic, stat]) => (
            <ProgressBar
              key={topic}
              progress={formatPercent(stat.correct, stat.attempted)}
              label={`${topic} (${stat.attempted})`}
              color={theme.accentGreen}
              height={8}
            />
          ))}
        </View>
      )}

      {sessionSet.map((mcq, idx) => (
        <MCQCard
          key={mcq.id}
          mcq={mcq}
          questionNumber={idx + 1}
          totalQuestions={sessionSet.length}
          onAnswer={(selectedIndex, isCorrect) => handleAnswer(mcq, selectedIndex, isCorrect)}
          onRequestExplanation={() => handleExplain(mcq)}
          aiExplanation={aiExplanations[mcq.id]}
          explanationLoading={explanationLoading[mcq.id]}
        />
      ))}

      {sessionComplete && (
        <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.accent }]}>
          <Ionicons name="trophy" size={28} color={theme.accent} />
          <Text style={[styles.summaryTitle, { color: theme.text }]}>
            Session Complete: {correctCount}/{sessionSet.length}
          </Text>
          <View style={styles.summaryActions}>
            {correctCount < sessionSet.length && (
              <TouchableOpacity
                style={[styles.summaryButton, { borderColor: theme.error }]}
                onPress={handleRetryWrong}
              >
                <Text style={[styles.summaryButtonText, { color: theme.error }]}>Retry Wrong Answers</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.summaryButton, { backgroundColor: theme.primary, borderColor: theme.primary }]}
              onPress={handleNewSession}
            >
              <Text style={[styles.summaryButtonText, { color: "#fff" }]}>New Session</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  statsCard: {
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statsItem: {
    alignItems: "center",
    flex: 1,
  },
  statsValue: {
    color: "#fff",
    fontSize: fontSizes.lg,
    fontWeight: "800",
  },
  statsLabel: {
    color: "#FFE9B8",
    fontSize: fontSizes.xs,
    marginTop: 2,
    textAlign: "center",
  },
  topicCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  topicCardTitle: {
    fontSize: fontSizes.sm,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  summaryCard: {
    borderWidth: 1.5,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  summaryTitle: {
    fontSize: fontSizes.md,
    fontWeight: "800",
  },
  summaryActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  summaryButton: {
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  summaryButtonText: {
    fontSize: fontSizes.sm,
    fontWeight: "700",
  },
});

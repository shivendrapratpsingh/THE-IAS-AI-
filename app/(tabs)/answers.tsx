import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useStorage, STORAGE_KEYS } from "../../hooks/useStorage";
import { useClaude } from "../../hooks/useClaude";
import AnswerCard, { AnswerHistoryEntry } from "../../components/AnswerCard";
import { AnswerFeedback } from "../../components/FeedbackCard";
import { getDailyAnswerPrompt } from "../../data/questions";
import { StudyStreak } from "../../types";
import { updateStreak } from "../../utils/helpers";
import { radius, spacing, fontSizes } from "../../constants/theme";

export default function AnswersScreen() {
  const theme = useAppTheme();
  const { askClaudeJSON, apiAvailable, loading } = useClaude();

  const dailyPrompt = useMemo(() => getDailyAnswerPrompt(), []);
  const [answerText, setAnswerText] = useState("");
  const [history, setHistory] = useStorage<AnswerHistoryEntry[]>(STORAGE_KEYS.ANSWER_HISTORY, []);
  const [streak, setStreak] = useStorage<StudyStreak>(STORAGE_KEYS.STUDY_STREAK, {
    current: 0,
    longest: 0,
    lastActiveDate: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const wordCount = answerText.trim().split(/\s+/).filter(Boolean).length;

  const buildEvaluationPrompt = (question: string, answer: string, wordLimit: number) =>
    `You are a strict but encouraging UPSC Mains examiner. Evaluate the following answer to a General Studies / Essay question.

Question: ${question}
Suggested word limit: ${wordLimit}

Candidate's Answer:
"""
${answer}
"""

Respond with ONLY valid JSON in exactly this shape:
{
  "score": <integer 0-10>,
  "strengths": ["point 1", "point 2"],
  "improvements": ["point 1", "point 2"],
  "modelAnswer": "A well-structured model answer of about 250 words."
}
Be specific and reference the candidate's actual content where possible.`;

  const handleSubmit = async () => {
    const trimmed = answerText.trim();
    if (!trimmed) return;

    setSubmitting(true);
    const entryId = `ans-${Date.now()}`;
    const baseEntry: AnswerHistoryEntry = {
      id: entryId,
      paper: dailyPrompt.paper,
      question: dailyPrompt.question,
      userAnswer: trimmed,
      feedback: null,
      date: new Date().toISOString(),
    };

    // Save immediately so the answer isn't lost even if AI fails
    setHistory((prev) => [baseEntry, ...prev]);
    setStreak((s) => updateStreak(s));

    if (apiAvailable) {
      setStatusMessage("Evaluating your answer with AI...");
      const result = await askClaudeJSON<AnswerFeedback>(
        buildEvaluationPrompt(dailyPrompt.question, trimmed, dailyPrompt.wordLimit),
        { maxTokens: 1200 }
      );
      if (result && typeof result.score === "number") {
        setHistory((prev) =>
          prev.map((e) => (e.id === entryId ? { ...e, feedback: result } : e))
        );
        setStatusMessage(null);
      } else {
        setStatusMessage("AI unavailable, try again. Your answer was saved.");
      }
    } else {
      setStatusMessage(
        "AI unavailable — your answer was saved. Add an API key in config/api.js to get feedback."
      );
    }

    setAnswerText("");
    setSubmitting(false);
  };

  const retryFeedback = async (entry: AnswerHistoryEntry) => {
    if (!apiAvailable) return;
    setHistory((prev) =>
      prev.map((e) => (e.id === entry.id ? { ...e, feedback: e.feedback } : e))
    );
    const result = await askClaudeJSON<AnswerFeedback>(
      buildEvaluationPrompt(entry.question, entry.userAnswer, 150),
      { maxTokens: 1200 }
    );
    if (result && typeof result.score === "number") {
      setHistory((prev) => prev.map((e) => (e.id === entry.id ? { ...e, feedback: result } : e)));
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.promptCard, { backgroundColor: theme.primary }]}>
          <View style={[styles.paperTag, { backgroundColor: theme.accent }]}>
            <Text style={styles.paperTagText}>{dailyPrompt.paper}</Text>
          </View>
          <Text style={styles.promptQuestion}>{dailyPrompt.question}</Text>
          <Text style={styles.promptHint}>Suggested length: ~{dailyPrompt.wordLimit} words</Text>
        </View>

        <View style={[styles.inputCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <TextInput
            style={[styles.textInput, { color: theme.text }]}
            placeholder="Write your answer here..."
            placeholderTextColor={theme.textMuted}
            multiline
            value={answerText}
            onChangeText={setAnswerText}
            textAlignVertical="top"
          />
          <View style={styles.inputFooter}>
            <Text style={[styles.wordCount, { color: theme.textMuted }]}>{wordCount} words</Text>
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: theme.accent, opacity: answerText.trim() ? 1 : 0.5 },
              ]}
              onPress={handleSubmit}
              disabled={!answerText.trim() || submitting}
            >
              {submitting || loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Submit & Evaluate</Text>
                  <Ionicons name="send" size={14} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </View>
          {statusMessage && (
            <Text style={[styles.statusMessage, { color: theme.textMuted }]}>{statusMessage}</Text>
          )}
        </View>

        <View style={styles.historyHeader}>
          <Text style={[styles.historyTitle, { color: theme.text }]}>
            Your Answers ({history.length})
          </Text>
        </View>

        {history.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            No answers written yet. Submit your first answer above!
          </Text>
        ) : (
          history.map((entry) => (
            <View key={entry.id}>
              <AnswerCard entry={entry} />
              {!entry.feedback && apiAvailable && (
                <TouchableOpacity
                  style={[styles.retryButton, { borderColor: theme.accent }]}
                  onPress={() => retryFeedback(entry)}
                >
                  <Ionicons name="sparkles" size={14} color={theme.accent} />
                  <Text style={[styles.retryButtonText, { color: theme.accent }]}>Get AI Feedback</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  promptCard: {
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  paperTag: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginBottom: spacing.sm,
  },
  paperTagText: {
    color: "#1A2B4A",
    fontSize: fontSizes.xs,
    fontWeight: "800",
  },
  promptQuestion: {
    color: "#fff",
    fontSize: fontSizes.md,
    fontWeight: "700",
    lineHeight: 22,
  },
  promptHint: {
    color: "#FFE9B8",
    fontSize: fontSizes.xs,
    marginTop: spacing.sm,
  },
  inputCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  textInput: {
    minHeight: 160,
    fontSize: fontSizes.sm,
    lineHeight: 21,
  },
  inputFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  wordCount: {
    fontSize: fontSizes.xs,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: fontSizes.xs,
    fontWeight: "800",
  },
  statusMessage: {
    marginTop: spacing.sm,
    fontSize: fontSizes.xs,
    fontStyle: "italic",
  },
  historyHeader: {
    marginBottom: spacing.sm,
  },
  historyTitle: {
    fontSize: fontSizes.md,
    fontWeight: "700",
  },
  emptyText: {
    fontSize: fontSizes.sm,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
  },
  retryButtonText: {
    fontSize: fontSizes.xs,
    fontWeight: "700",
  },
});

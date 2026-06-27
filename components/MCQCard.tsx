import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../hooks/useAppTheme";
import { radius, spacing, fontSizes } from "../constants/theme";
import { MCQ } from "../data/questions";

interface MCQCardProps {
  mcq: MCQ;
  questionNumber: number;
  totalQuestions: number;
  /** Called when the user selects an option (index 0-3). */
  onAnswer: (selectedIndex: number, isCorrect: boolean) => void;
  /** Called when the user taps "Explain this question". */
  onRequestExplanation?: () => void;
  /** AI explanation text, if fetched. */
  aiExplanation?: string | null;
  /** Loading state for AI explanation. */
  explanationLoading?: boolean;
}

export default function MCQCard({
  mcq,
  questionNumber,
  totalQuestions,
  onAnswer,
  onRequestExplanation,
  aiExplanation,
  explanationLoading,
}: MCQCardProps) {
  const theme = useAppTheme();
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    onAnswer(index, index === mcq.correctIndex);
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.topicTag, { color: theme.accent, borderColor: theme.accent }]}>
          {mcq.topic}
        </Text>
        <Text style={[styles.counter, { color: theme.textMuted }]}>
          {questionNumber} / {totalQuestions}
        </Text>
      </View>

      <Text style={[styles.question, { color: theme.text }]}>{mcq.question}</Text>

      <View style={styles.optionsContainer}>
        {mcq.options.map((option, index) => {
          const isSelected = selected === index;
          const isCorrect = index === mcq.correctIndex;
          let backgroundColor = theme.background;
          let borderColor = theme.border;
          let textColor = theme.text;

          if (selected !== null) {
            if (isCorrect) {
              backgroundColor = theme.success + "22";
              borderColor = theme.success;
            } else if (isSelected) {
              backgroundColor = theme.error + "22";
              borderColor = theme.error;
            }
          }

          return (
            <TouchableOpacity
              key={index}
              style={[styles.option, { backgroundColor, borderColor }]}
              onPress={() => handleSelect(index)}
              disabled={selected !== null}
              activeOpacity={0.7}
            >
              <View style={[styles.optionBullet, { borderColor: theme.accent }]}>
                <Text style={[styles.optionBulletText, { color: theme.accent }]}>
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>
              <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
              {selected !== null && isCorrect && (
                <Ionicons name="checkmark-circle" size={20} color={theme.success} />
              )}
              {selected !== null && isSelected && !isCorrect && (
                <Ionicons name="close-circle" size={20} color={theme.error} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {selected !== null && (
        <View style={[styles.explanationBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <Text style={[styles.explanationLabel, { color: theme.accent }]}>Explanation</Text>
          <Text style={[styles.explanationText, { color: theme.text }]}>{mcq.explanation}</Text>

          {onRequestExplanation && (
            <TouchableOpacity
              style={[styles.aiButton, { borderColor: theme.accent }]}
              onPress={onRequestExplanation}
              disabled={explanationLoading}
              activeOpacity={0.7}
            >
              {explanationLoading ? (
                <ActivityIndicator size="small" color={theme.accent} />
              ) : (
                <>
                  <Ionicons name="sparkles" size={16} color={theme.accent} />
                  <Text style={[styles.aiButtonText, { color: theme.accent }]}>
                    Explain this question (AI)
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {aiExplanation && (
            <View style={[styles.aiExplanationBox, { borderColor: theme.accent }]}>
              <Text style={[styles.aiExplanationText, { color: theme.text }]}>{aiExplanation}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  topicTag: {
    fontSize: fontSizes.xs,
    fontWeight: "700",
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  counter: {
    fontSize: fontSizes.xs,
    fontWeight: "600",
  },
  question: {
    fontSize: fontSizes.md,
    fontWeight: "700",
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: spacing.sm,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  optionBullet: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  optionBulletText: {
    fontSize: fontSizes.sm,
    fontWeight: "700",
  },
  optionText: {
    flex: 1,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  explanationBox: {
    marginTop: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.sm,
  },
  explanationLabel: {
    fontSize: fontSizes.xs,
    fontWeight: "700",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  explanationText: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  aiButton: {
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignSelf: "flex-start",
  },
  aiButtonText: {
    fontSize: fontSizes.xs,
    fontWeight: "700",
  },
  aiExplanationBox: {
    marginTop: spacing.sm,
    borderLeftWidth: 3,
    paddingLeft: spacing.sm,
  },
  aiExplanationText: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
    fontStyle: "italic",
  },
});

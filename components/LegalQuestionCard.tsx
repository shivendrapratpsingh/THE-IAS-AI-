import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../hooks/useAppTheme";
import { radius, spacing, fontSizes } from "../constants/theme";
import { LegalQuestion } from "../data/questions";

interface LegalQuestionCardProps {
  legalQuestion: LegalQuestion;
  loading?: boolean;
  isFallback?: boolean;
}

const LETTERS = ["A", "B", "C", "D"];

export default function LegalQuestionCard({
  legalQuestion,
  loading,
  isFallback,
}: LegalQuestionCardProps) {
  const theme = useAppTheme();
  const [selected, setSelected] = useState<number | null>(null);

  const correctIndex = LETTERS.indexOf(legalQuestion.correct_answer?.toUpperCase?.() ?? "A");

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.headerRow}>
        <View style={[styles.iconBadge, { backgroundColor: theme.primary }]}>
          <Ionicons name="shield-checkmark" size={16} color={theme.accent} />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Today's Legal Question</Text>
      </View>

      {isFallback && (
        <Text style={[styles.fallbackNote, { color: theme.textMuted }]}>
          AI unavailable — showing a saved question.
        </Text>
      )}

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.textMuted }]}>
            Fetching today's question...
          </Text>
        </View>
      ) : (
        <>
          <Text style={[styles.question, { color: theme.text }]}>{legalQuestion.question}</Text>
          <View style={styles.optionsContainer}>
            {legalQuestion.options.map((option, index) => {
              const isSelected = selected === index;
              const isCorrect = index === correctIndex;
              let backgroundColor = theme.background;
              let borderColor = theme.border;

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
                  onPress={() => selected === null && setSelected(index)}
                  disabled={selected !== null}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionLetter, { color: theme.accent }]}>
                    {LETTERS[index]}
                  </Text>
                  <Text style={[styles.optionText, { color: theme.text }]}>{option}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {selected !== null && (
            <View style={[styles.explanationBox, { borderColor: theme.border, backgroundColor: theme.background }]}>
              <Text style={[styles.explanationLabel, { color: theme.accent }]}>
                {selected === correctIndex ? "Correct! " : "Not quite. "}Explanation
              </Text>
              <Text style={[styles.explanationText, { color: theme.text }]}>
                {legalQuestion.explanation}
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: fontSizes.md,
    fontWeight: "700",
  },
  fallbackNote: {
    fontSize: fontSizes.xs,
    fontStyle: "italic",
    marginBottom: spacing.sm,
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  loadingText: {
    fontSize: fontSizes.sm,
  },
  question: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    lineHeight: 21,
    marginBottom: spacing.sm,
  },
  optionsContainer: {
    gap: spacing.xs,
  },
  option: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    borderWidth: 1.5,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  optionLetter: {
    fontSize: fontSizes.sm,
    fontWeight: "800",
    width: 18,
  },
  optionText: {
    flex: 1,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  explanationBox: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
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
});

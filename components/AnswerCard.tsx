import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../hooks/useAppTheme";
import { radius, spacing, fontSizes } from "../constants/theme";
import FeedbackCard, { AnswerFeedback } from "./FeedbackCard";

export interface AnswerHistoryEntry {
  id: string;
  paper: string;
  question: string;
  userAnswer: string;
  feedback: AnswerFeedback | null;
  date: string; // ISO
}

interface AnswerCardProps {
  entry: AnswerHistoryEntry;
}

export default function AnswerCard({ entry }: AnswerCardProps) {
  const theme = useAppTheme();
  const [expanded, setExpanded] = useState(false);
  const dateLabel = new Date(entry.date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <TouchableOpacity onPress={() => setExpanded((e) => !e)} activeOpacity={0.7}>
        <View style={styles.headerRow}>
          <View style={[styles.paperTag, { backgroundColor: theme.primary }]}>
            <Text style={styles.paperTagText}>{entry.paper}</Text>
          </View>
          <Text style={[styles.date, { color: theme.textMuted }]}>{dateLabel}</Text>
        </View>
        <Text style={[styles.question, { color: theme.text }]} numberOfLines={expanded ? undefined : 2}>
          {entry.question}
        </Text>

        <View style={styles.footerRow}>
          {entry.feedback ? (
            <View style={[styles.scorePill, { borderColor: theme.accent }]}>
              <Text style={[styles.scorePillText, { color: theme.accent }]}>
                {entry.feedback.score}/10
              </Text>
            </View>
          ) : (
            <Text style={[styles.pendingText, { color: theme.textMuted }]}>No feedback yet</Text>
          )}
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={18}
            color={theme.textMuted}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedContent}>
          <View style={[styles.userAnswerBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <Text style={[styles.userAnswerLabel, { color: theme.textMuted }]}>Your Answer</Text>
            <Text style={[styles.userAnswerText, { color: theme.text }]}>{entry.userAnswer}</Text>
          </View>
          {entry.feedback && (
            <View style={{ marginTop: spacing.sm }}>
              <FeedbackCard feedback={entry.feedback} />
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
    marginBottom: spacing.xs,
  },
  paperTag: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  paperTagText: {
    color: "#fff",
    fontSize: fontSizes.xs,
    fontWeight: "700",
  },
  date: {
    fontSize: fontSizes.xs,
  },
  question: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scorePill: {
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  scorePillText: {
    fontSize: fontSizes.xs,
    fontWeight: "700",
  },
  pendingText: {
    fontSize: fontSizes.xs,
    fontStyle: "italic",
  },
  expandedContent: {
    marginTop: spacing.sm,
  },
  userAnswerBox: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  userAnswerLabel: {
    fontSize: fontSizes.xs,
    fontWeight: "700",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  userAnswerText: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
});

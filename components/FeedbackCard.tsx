import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../hooks/useAppTheme";
import { radius, spacing, fontSizes } from "../constants/theme";

export interface AnswerFeedback {
  score: number; // out of 10
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
}

interface FeedbackCardProps {
  feedback: AnswerFeedback;
}

export default function FeedbackCard({ feedback }: FeedbackCardProps) {
  const theme = useAppTheme();
  const scoreColor =
    feedback.score >= 7 ? theme.success : feedback.score >= 4 ? theme.accent : theme.error;

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.scoreRow}>
        <Text style={[styles.scoreLabel, { color: theme.textMuted }]}>Your Score</Text>
        <View style={[styles.scoreBadge, { borderColor: scoreColor }]}>
          <Text style={[styles.scoreText, { color: scoreColor }]}>{feedback.score}</Text>
          <Text style={[styles.scoreOutOf, { color: theme.textMuted }]}> / 10</Text>
        </View>
      </View>

      <Section
        icon="thumbs-up"
        iconColor={theme.success}
        title="Strengths"
        items={feedback.strengths}
        theme={theme}
      />

      <Section
        icon="construct"
        iconColor={theme.accent}
        title="Areas to Improve"
        items={feedback.improvements}
        theme={theme}
      />

      <View style={styles.modelAnswerBox}>
        <View style={styles.modelAnswerHeader}>
          <Ionicons name="document-text" size={16} color={theme.primary} />
          <Text style={[styles.modelAnswerTitle, { color: theme.primary }]}>Model Answer (~250 words)</Text>
        </View>
        <Text style={[styles.modelAnswerText, { color: theme.text }]}>{feedback.modelAnswer}</Text>
      </View>
    </View>
  );
}

function Section({
  icon,
  iconColor,
  title,
  items,
  theme,
}: {
  icon: any;
  iconColor: string;
  title: string;
  items: string[];
  theme: ReturnType<typeof useAppTheme>;
}) {
  if (!items?.length) return null;
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={16} color={iconColor} />
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      </View>
      {items.map((item, idx) => (
        <View key={idx} style={styles.bulletRow}>
          <View style={[styles.bulletDot, { backgroundColor: iconColor }]} />
          <Text style={[styles.bulletText, { color: theme.text }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  scoreLabel: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
  },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    borderWidth: 2,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  scoreText: {
    fontSize: fontSizes.lg,
    fontWeight: "800",
  },
  scoreOutOf: {
    fontSize: fontSizes.sm,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: fontSizes.sm,
    fontWeight: "700",
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 4,
    paddingLeft: spacing.sm,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  modelAnswerBox: {
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "transparent",
  },
  modelAnswerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.xs,
  },
  modelAnswerTitle: {
    fontSize: fontSizes.sm,
    fontWeight: "700",
  },
  modelAnswerText: {
    fontSize: fontSizes.sm,
    lineHeight: 21,
  },
});

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useStorage, STORAGE_KEYS } from "../../hooks/useStorage";
import { useClaude } from "../../hooks/useClaude";
import ProgressBar from "../../components/ProgressBar";
import { PrepStage, StudyPlan, UserProfile } from "../../types";
import { MCQ_TOPICS } from "../../data/questions";
import { buildStudyPlanPrompt, generateFallbackPlan, normalizeAIPlan } from "../../utils/studyPlan";
import { radius, spacing, fontSizes } from "../../constants/theme";

const PREP_STAGES: PrepStage[] = ["Beginner", "Intermediate", "Advanced"];

export default function StudyPlanScreen() {
  const theme = useAppTheme();
  const { askClaudeJSON, apiAvailable } = useClaude();

  const [profile, setProfile] = useStorage<UserProfile | null>(STORAGE_KEYS.USER_PROFILE, null);
  const [plan, setPlan] = useStorage<StudyPlan | null>(STORAGE_KEYS.STUDY_PLAN, null);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);
  const [regenerating, setRegenerating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Editable copy of profile fields for regeneration
  const [draftStage, setDraftStage] = useState<PrepStage>(profile?.prepStage ?? "Beginner");
  const [draftHours, setDraftHours] = useState(String(profile?.dailyHours ?? 4));
  const [draftSubjects, setDraftSubjects] = useState<string[]>(profile?.subjects ?? []);

  const totalTopics = plan?.weeks.reduce((sum, w) => sum + w.topics.length, 0) ?? 0;
  const doneTopics =
    plan?.weeks.reduce((sum, w) => sum + w.topics.filter((t) => t.done).length, 0) ?? 0;
  const overallProgress = totalTopics ? Math.round((doneTopics / totalTopics) * 100) : 0;

  const toggleTopic = (weekNumber: number, topicId: string) => {
    if (!plan) return;
    const updated: StudyPlan = {
      ...plan,
      weeks: plan.weeks.map((w) =>
        w.week !== weekNumber
          ? w
          : {
              ...w,
              topics: w.topics.map((t) => (t.id === topicId ? { ...t, done: !t.done } : t)),
            }
      ),
    };
    setPlan(updated);
  };

  const toggleDraftSubject = (subject: string) => {
    setDraftSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const handleRegenerate = async () => {
    if (!profile) return;
    const updatedProfile: UserProfile = {
      ...profile,
      prepStage: draftStage,
      dailyHours: Math.max(1, Math.min(16, Number(draftHours) || 4)),
      subjects: draftSubjects,
    };
    setProfile(updatedProfile);
    setRegenerating(true);
    setStatusMessage(apiAvailable ? "Regenerating plan with AI..." : "AI unavailable — regenerating offline...");

    let newPlan: StudyPlan | null = null;
    if (apiAvailable) {
      const raw = await askClaudeJSON(buildStudyPlanPrompt(updatedProfile), { maxTokens: 2048 });
      newPlan = normalizeAIPlan(raw, updatedProfile);
    }
    if (!newPlan) {
      newPlan = generateFallbackPlan(updatedProfile);
    }
    setPlan(newPlan);
    setRegenerating(false);
    setEditing(false);
    setStatusMessage(null);
    setExpandedWeek(1);
  };

  if (!plan) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.background }]}>
        <Ionicons name="calendar-outline" size={48} color={theme.textMuted} />
        <Text style={[styles.emptyText, { color: theme.textMuted }]}>
          No study plan yet. Complete onboarding to generate one.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.content}>
      <View style={[styles.headerCard, { backgroundColor: theme.primary }]}>
        <Text style={styles.headerTitle}>Your 8-Week Study Plan</Text>
        <Text style={styles.headerSubtitle}>
          {plan.source === "ai" ? "AI-personalized" : "Offline starter plan"} ·{" "}
          {profile?.prepStage} · {profile?.dailyHours}h/day · Target {profile?.targetYear}
        </Text>
        <View style={{ marginTop: spacing.sm }}>
          <ProgressBar progress={overallProgress} label="Overall completion" color={theme.accent} />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.regenerateButton, { borderColor: theme.accent }]}
        onPress={() => setEditing((e) => !e)}
      >
        <Ionicons name="refresh" size={16} color={theme.accent} />
        <Text style={[styles.regenerateText, { color: theme.accent }]}>
          {editing ? "Cancel" : "Regenerate Plan"}
        </Text>
      </TouchableOpacity>

      {editing && (
        <View style={[styles.editPanel, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.editLabel, { color: theme.text }]}>Preparation Stage</Text>
          <View style={styles.chipRow}>
            {PREP_STAGES.map((stage) => (
              <TouchableOpacity
                key={stage}
                style={[
                  styles.chip,
                  {
                    borderColor: theme.accent,
                    backgroundColor: draftStage === stage ? theme.accent : "transparent",
                  },
                ]}
                onPress={() => setDraftStage(stage)}
              >
                <Text style={[styles.chipText, { color: draftStage === stage ? "#fff" : theme.accent }]}>
                  {stage}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.editLabel, { color: theme.text }]}>Daily Hours</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
            value={draftHours}
            onChangeText={(v) => setDraftHours(v.replace(/[^0-9]/g, ""))}
            keyboardType="number-pad"
            maxLength={2}
          />

          <Text style={[styles.editLabel, { color: theme.text }]}>Focus Subjects</Text>
          <View style={styles.chipRow}>
            {MCQ_TOPICS.map((topic) => (
              <TouchableOpacity
                key={topic}
                style={[
                  styles.chip,
                  {
                    borderColor: theme.accentGreen,
                    backgroundColor: draftSubjects.includes(topic) ? theme.accentGreen : "transparent",
                  },
                ]}
                onPress={() => toggleDraftSubject(topic)}
              >
                <Text style={[styles.chipText, { color: draftSubjects.includes(topic) ? "#fff" : theme.accentGreen }]}>
                  {topic}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {statusMessage && (
            <Text style={[styles.statusMessage, { color: theme.accent }]}>{statusMessage}</Text>
          )}

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: theme.primary }]}
            onPress={handleRegenerate}
            disabled={regenerating}
          >
            {regenerating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Generate New Plan</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {plan.weeks.map((week) => {
        const isExpanded = expandedWeek === week.week;
        const weekDone = week.topics.filter((t) => t.done).length;
        return (
          <View key={week.week} style={[styles.weekCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <TouchableOpacity
              style={styles.weekHeader}
              onPress={() => setExpandedWeek(isExpanded ? null : week.week)}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.weekTitle, { color: theme.text }]}>{week.title}</Text>
                <Text style={[styles.weekFocus, { color: theme.textMuted }]} numberOfLines={isExpanded ? undefined : 1}>
                  {week.focus}
                </Text>
              </View>
              <Text style={[styles.weekCount, { color: theme.accent }]}>
                {weekDone}/{week.topics.length}
              </Text>
              <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={18}
                color={theme.textMuted}
                style={{ marginLeft: spacing.xs }}
              />
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.topicsList}>
                {week.topics.map((topic) => (
                  <TouchableOpacity
                    key={topic.id}
                    style={styles.topicRow}
                    onPress={() => toggleTopic(week.week, topic.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={topic.done ? "checkbox" : "square-outline"}
                      size={20}
                      color={topic.done ? theme.success : theme.textMuted}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.topicTitle,
                          {
                            color: theme.text,
                            textDecorationLine: topic.done ? "line-through" : "none",
                            opacity: topic.done ? 0.6 : 1,
                          },
                        ]}
                      >
                        {topic.title}
                      </Text>
                      {topic.description && (
                        <Text style={[styles.topicDescription, { color: theme.textMuted }]}>
                          {topic.description}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: fontSizes.sm,
    textAlign: "center",
  },
  headerCard: {
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  headerTitle: {
    color: "#fff",
    fontSize: fontSizes.lg,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "#FFE9B8",
    fontSize: fontSizes.xs,
    marginTop: 2,
    fontWeight: "600",
  },
  regenerateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  regenerateText: {
    fontSize: fontSizes.sm,
    fontWeight: "700",
  },
  editPanel: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  editLabel: {
    fontSize: fontSizes.sm,
    fontWeight: "700",
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipText: {
    fontSize: fontSizes.sm,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSizes.md,
    width: 80,
  },
  statusMessage: {
    marginTop: spacing.sm,
    fontSize: fontSizes.sm,
    fontWeight: "600",
    textAlign: "center",
  },
  submitButton: {
    marginTop: spacing.md,
    alignItems: "center",
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: fontSizes.sm,
    fontWeight: "800",
  },
  weekCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    overflow: "hidden",
  },
  weekHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
  },
  weekTitle: {
    fontSize: fontSizes.sm,
    fontWeight: "700",
  },
  weekFocus: {
    fontSize: fontSizes.xs,
    marginTop: 2,
  },
  weekCount: {
    fontSize: fontSizes.xs,
    fontWeight: "700",
  },
  topicsList: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  topicRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  topicTitle: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    lineHeight: 20,
  },
  topicDescription: {
    fontSize: fontSizes.xs,
    marginTop: 2,
    lineHeight: 16,
  },
});

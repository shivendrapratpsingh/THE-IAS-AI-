import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import PatrioticHero from "../components/PatrioticHero";
import { useAppTheme } from "../hooks/useAppTheme";
import { STORAGE_KEYS, setStoredValue } from "../hooks/useStorage";
import { useClaude } from "../hooks/useClaude";
import { PrepStage, StudyPlan, UserProfile } from "../types";
import { MCQ_TOPICS } from "../data/questions";
import { buildStudyPlanPrompt, generateFallbackPlan, normalizeAIPlan } from "../utils/studyPlan";
import { radius, spacing, fontSizes } from "../constants/theme";

const PREP_STAGES: PrepStage[] = ["Beginner", "Intermediate", "Advanced"];
const CURRENT_YEAR = new Date().getFullYear();
const TARGET_YEARS = [CURRENT_YEAR, CURRENT_YEAR + 1, CURRENT_YEAR + 2];

export default function OnboardingScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { askClaudeJSON, apiAvailable } = useClaude();

  const [name, setName] = useState("");
  const [prepStage, setPrepStage] = useState<PrepStage>("Beginner");
  const [targetYear, setTargetYear] = useState<number>(TARGET_YEARS[1]);
  const [dailyHours, setDailyHours] = useState("4");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const toggleSubject = (subject: string) => {
    setSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setStatusMessage("Please enter your name to continue.");
      return;
    }
    const hours = Math.max(1, Math.min(16, Number(dailyHours) || 4));

    const profile: UserProfile = {
      name: trimmedName,
      prepStage,
      targetYear,
      dailyHours: hours,
      subjects,
    };

    setSubmitting(true);
    setStatusMessage(
      apiAvailable
        ? "Generating your personalized study plan..."
        : "AI unavailable — creating a starter study plan offline..."
    );

    let plan: StudyPlan | null = null;
    if (apiAvailable) {
      const raw = await askClaudeJSON(buildStudyPlanPrompt(profile), { maxTokens: 2048 });
      plan = normalizeAIPlan(raw, profile);
    }
    if (!plan) {
      plan = generateFallbackPlan(profile);
    }

    await setStoredValue(STORAGE_KEYS.USER_PROFILE, profile);
    await setStoredValue(STORAGE_KEYS.STUDY_PLAN, plan);
    await setStoredValue(STORAGE_KEYS.COMPLETED_TOPICS, []);
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, "true");

    setSubmitting(false);
    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroWrap}>
          <PatrioticHero variant="splash" />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>IAS Prep Companion</Text>
            <Text style={styles.heroSubtitle}>Discipline. Dedication. Duty to the Nation.</Text>
          </View>
        </View>

        <View style={styles.form}>
          <Text style={[styles.heading, { color: theme.text }]}>Let's set up your prep</Text>
          <Text style={[styles.subheading, { color: theme.textMuted }]}>
            A few quick details so we can personalize your study plan.
          </Text>

          {/* Name */}
          <Text style={[styles.label, { color: theme.text }]}>Your Name</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.card }]}
            placeholder="e.g. Anjali Sharma"
            placeholderTextColor={theme.textMuted}
            value={name}
            onChangeText={setName}
          />

          {/* Prep stage */}
          <Text style={[styles.label, { color: theme.text }]}>Preparation Stage</Text>
          <View style={styles.chipRow}>
            {PREP_STAGES.map((stage) => (
              <TouchableOpacity
                key={stage}
                style={[
                  styles.chip,
                  {
                    borderColor: theme.accent,
                    backgroundColor: prepStage === stage ? theme.accent : "transparent",
                  },
                ]}
                onPress={() => setPrepStage(stage)}
              >
                <Text style={[styles.chipText, { color: prepStage === stage ? "#fff" : theme.accent }]}>
                  {stage}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Target year */}
          <Text style={[styles.label, { color: theme.text }]}>Target Exam Year</Text>
          <View style={styles.chipRow}>
            {TARGET_YEARS.map((year) => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.chip,
                  {
                    borderColor: theme.primary,
                    backgroundColor: targetYear === year ? theme.primary : "transparent",
                  },
                ]}
                onPress={() => setTargetYear(year)}
              >
                <Text style={[styles.chipText, { color: targetYear === year ? "#fff" : theme.primary }]}>
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Daily hours */}
          <Text style={[styles.label, { color: theme.text }]}>Daily Study Hours Available</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={[styles.stepperBtn, { borderColor: theme.border }]}
              onPress={() => setDailyHours((h) => String(Math.max(1, Number(h || "1") - 1)))}
            >
              <Ionicons name="remove" size={20} color={theme.text} />
            </TouchableOpacity>
            <TextInput
              style={[styles.stepperInput, { color: theme.text, borderColor: theme.border }]}
              value={dailyHours}
              onChangeText={(v) => setDailyHours(v.replace(/[^0-9]/g, ""))}
              keyboardType="number-pad"
              maxLength={2}
            />
            <TouchableOpacity
              style={[styles.stepperBtn, { borderColor: theme.border }]}
              onPress={() => setDailyHours((h) => String(Math.min(16, Number(h || "0") + 1)))}
            >
              <Ionicons name="add" size={20} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.hoursLabel, { color: theme.textMuted }]}>hours / day</Text>
          </View>

          {/* Subject preferences */}
          <Text style={[styles.label, { color: theme.text }]}>
            Focus Subjects <Text style={{ color: theme.textMuted, fontWeight: "400" }}>(optional)</Text>
          </Text>
          <View style={styles.chipRow}>
            {MCQ_TOPICS.map((topic) => (
              <TouchableOpacity
                key={topic}
                style={[
                  styles.chip,
                  {
                    borderColor: theme.accentGreen,
                    backgroundColor: subjects.includes(topic) ? theme.accentGreen : "transparent",
                  },
                ]}
                onPress={() => toggleSubject(topic)}
              >
                <Text
                  style={[styles.chipText, { color: subjects.includes(topic) ? "#fff" : theme.accentGreen }]}
                >
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
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Generate My Study Plan</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          {!apiAvailable && (
            <Text style={[styles.offlineNote, { color: theme.textMuted }]}>
              Tip: Add your Anthropic API key in config/api.js to enable AI-generated study
              plans, MCQ explanations, and answer feedback.
            </Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  heroWrap: {
    height: 240,
    width: "100%",
    position: "relative",
  },
  heroOverlay: {
    position: "absolute",
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
  },
  heroTitle: {
    color: "#fff",
    fontSize: fontSizes.xxl,
    fontWeight: "800",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  heroSubtitle: {
    color: "#FFE9B8",
    fontSize: fontSizes.sm,
    marginTop: 4,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  form: {
    padding: spacing.lg,
  },
  heading: {
    fontSize: fontSizes.xl,
    fontWeight: "800",
    marginBottom: 4,
  },
  subheading: {
    fontSize: fontSizes.sm,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: "700",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSizes.md,
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
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  stepperBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperInput: {
    width: 56,
    height: 40,
    borderWidth: 1.5,
    borderRadius: radius.md,
    textAlign: "center",
    fontSize: fontSizes.md,
    fontWeight: "700",
  },
  hoursLabel: {
    fontSize: fontSizes.sm,
  },
  statusMessage: {
    marginTop: spacing.lg,
    fontSize: fontSizes.sm,
    fontWeight: "600",
    textAlign: "center",
  },
  submitButton: {
    marginTop: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: fontSizes.md,
    fontWeight: "800",
  },
  offlineNote: {
    marginTop: spacing.md,
    fontSize: fontSizes.xs,
    textAlign: "center",
    lineHeight: 18,
  },
});

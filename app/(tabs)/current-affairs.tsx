import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useStorage, STORAGE_KEYS } from "../../hooks/useStorage";
import { useClaude } from "../../hooks/useClaude";
import { CurrentAffairItem, getWeeklyCurrentAffairs } from "../../data/currentAffairs";
import { radius, spacing, fontSizes } from "../../constants/theme";

interface UPSCExplanation {
  whatHappened: string;
  whyItMatters: string;
  upscAngles: string;
}

export default function CurrentAffairsScreen() {
  const theme = useAppTheme();
  const { askClaudeJSON, apiAvailable } = useClaude();

  const [bookmarks, setBookmarks] = useStorage<string[]>(STORAGE_KEYS.BOOKMARKED_AFFAIRS, []);
  const [activeTab, setActiveTab] = useState<"all" | "saved">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [explanations, setExplanations] = useState<Record<string, UPSCExplanation>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const items = getWeeklyCurrentAffairs();
  const visibleItems = activeTab === "saved" ? items.filter((i) => bookmarks.includes(i.id)) : items;

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]));
  };

  const handleExplain = async (item: CurrentAffairItem) => {
    if (explanations[item.id]) return;
    if (!apiAvailable) {
      setExplanations((prev) => ({
        ...prev,
        [item.id]: {
          whatHappened: item.summary,
          whyItMatters: "AI unavailable, try again. Add your Anthropic API key in config/api.js for a deeper UPSC-context analysis.",
          upscAngles: `Relevant for: ${item.tag}`,
        },
      }));
      return;
    }
    setLoadingId(item.id);
    const prompt = `For the following current affairs topic, provide a UPSC Civil Services exam-oriented breakdown.

Headline: ${item.headline}
Summary: ${item.summary}
Relevance Tag: ${item.tag}

Respond with ONLY valid JSON in exactly this shape:
{
  "whatHappened": "2-3 sentence factual summary",
  "whyItMatters": "2-3 sentences on significance for governance/economy/society/environment as relevant",
  "upscAngles": "2-3 sentences on how this could appear in Prelims (facts/static links) and Mains (analytical angles), including related static topics to revise"
}`;
    const result = await askClaudeJSON<UPSCExplanation>(prompt, { maxTokens: 600 });
    setLoadingId(null);
    if (result) {
      setExplanations((prev) => ({ ...prev, [item.id]: result }));
    } else {
      setExplanations((prev) => ({
        ...prev,
        [item.id]: {
          whatHappened: item.summary,
          whyItMatters: "AI unavailable, try again.",
          upscAngles: `Relevant for: ${item.tag}`,
        },
      }));
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.content}>
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            { borderColor: theme.accent, backgroundColor: activeTab === "all" ? theme.accent : "transparent" },
          ]}
          onPress={() => setActiveTab("all")}
        >
          <Text style={[styles.tabButtonText, { color: activeTab === "all" ? "#fff" : theme.accent }]}>
            This Week
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            { borderColor: theme.accent, backgroundColor: activeTab === "saved" ? theme.accent : "transparent" },
          ]}
          onPress={() => setActiveTab("saved")}
        >
          <Text style={[styles.tabButtonText, { color: activeTab === "saved" ? "#fff" : theme.accent }]}>
            Saved ({bookmarks.length})
          </Text>
        </TouchableOpacity>
      </View>

      {visibleItems.length === 0 && (
        <Text style={[styles.emptyText, { color: theme.textMuted }]}>
          {activeTab === "saved" ? "No saved topics yet. Tap the bookmark icon to save one." : "No current affairs available."}
        </Text>
      )}

      {visibleItems.map((item) => {
        const isExpanded = expandedId === item.id;
        const isBookmarked = bookmarks.includes(item.id);
        const explanation = explanations[item.id];
        const isLoading = loadingId === item.id;

        return (
          <View key={item.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.tag, { borderColor: theme.accent }]}>
                <Text style={[styles.tagText, { color: theme.accent }]}>{item.tag}</Text>
              </View>
              <TouchableOpacity onPress={() => toggleBookmark(item.id)}>
                <Ionicons
                  name={isBookmarked ? "bookmark" : "bookmark-outline"}
                  size={20}
                  color={isBookmarked ? theme.accent : theme.textMuted}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => setExpandedId(isExpanded ? null : item.id)} activeOpacity={0.7}>
              <Text style={[styles.headline, { color: theme.text }]}>{item.headline}</Text>
              <Text
                style={[styles.summary, { color: theme.textMuted }]}
                numberOfLines={isExpanded ? undefined : 3}
              >
                {item.summary}
              </Text>
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.expandedSection}>
                {!explanation && (
                  <TouchableOpacity
                    style={[styles.explainButton, { borderColor: theme.accent }]}
                    onPress={() => handleExplain(item)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color={theme.accent} />
                    ) : (
                      <>
                        <Ionicons name="sparkles" size={16} color={theme.accent} />
                        <Text style={[styles.explainButtonText, { color: theme.accent }]}>
                          Explain in UPSC context
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                {explanation && (
                  <View style={styles.explanationBox}>
                    <ExplanationBlock title="What Happened" text={explanation.whatHappened} theme={theme} icon="information-circle" />
                    <ExplanationBlock title="Why It Matters" text={explanation.whyItMatters} theme={theme} icon="bulb" />
                    <ExplanationBlock title="UPSC Angles" text={explanation.upscAngles} theme={theme} icon="school" />
                  </View>
                )}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

function ExplanationBlock({
  title,
  text,
  icon,
  theme,
}: {
  title: string;
  text: string;
  icon: any;
  theme: ReturnType<typeof useAppTheme>;
}) {
  return (
    <View style={styles.explanationBlock}>
      <View style={styles.explanationHeader}>
        <Ionicons name={icon} size={15} color={theme.accent} />
        <Text style={[styles.explanationTitle, { color: theme.text }]}>{title}</Text>
      </View>
      <Text style={[styles.explanationText, { color: theme.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  tabRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
  },
  tabButtonText: {
    fontSize: fontSizes.sm,
    fontWeight: "700",
  },
  emptyText: {
    fontSize: fontSizes.sm,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  tag: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: fontSizes.xs,
    fontWeight: "700",
  },
  headline: {
    fontSize: fontSizes.sm,
    fontWeight: "700",
    lineHeight: 21,
    marginBottom: spacing.xs,
  },
  summary: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  expandedSection: {
    marginTop: spacing.sm,
  },
  explainButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
  },
  explainButtonText: {
    fontSize: fontSizes.sm,
    fontWeight: "700",
  },
  explanationBox: {
    gap: spacing.sm,
  },
  explanationBlock: {
    gap: 2,
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  explanationTitle: {
    fontSize: fontSizes.xs,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  explanationText: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
});

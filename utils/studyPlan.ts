import { StudyPlan, StudyWeek, StudyTopic, UserProfile } from "../types";

/** Builds the prompt sent to Claude to generate a personalized study plan. */
export function buildStudyPlanPrompt(profile: UserProfile): string {
  const subjectsLine = profile.subjects.length
    ? `The candidate has expressed interest in focusing on: ${profile.subjects.join(", ")}.`
    : "The candidate has no specific subject preference — cover all GS subjects in a balanced way.";

  return `You are an expert UPSC Civil Services (IAS) exam mentor. Create a personalized, week-by-week study plan for a candidate with the following profile:
- Name: ${profile.name}
- Preparation stage: ${profile.prepStage}
- Target exam year: ${profile.targetYear}
- Daily study hours available: ${profile.dailyHours}
${subjectsLine}

Generate a study plan covering 8 weeks. Respond with ONLY valid JSON (no markdown, no commentary) in exactly this shape:
{
  "weeks": [
    {
      "week": 1,
      "title": "Short week title",
      "focus": "One sentence describing the focus of this week",
      "topics": [
        { "title": "Topic name", "description": "One short sentence on what to study" }
      ]
    }
  ]
}
Each week should have 4-6 topics. Topics should be specific and actionable (e.g. "Indian Polity: Fundamental Rights (Art 12-35)" not just "Polity"). Tailor difficulty and pacing to the candidate's preparation stage and daily hours.`;
}

/** Normalizes a raw AI JSON response into a StudyPlan, assigning stable ids. */
export function normalizeAIPlan(raw: any, profile: UserProfile): StudyPlan | null {
  if (!raw || !Array.isArray(raw.weeks)) return null;

  const weeks: StudyWeek[] = raw.weeks.map((w: any, wi: number) => {
    const topics: StudyTopic[] = Array.isArray(w.topics)
      ? w.topics.map((t: any, ti: number) => ({
          id: `w${w.week ?? wi + 1}-t${ti + 1}`,
          title: String(t.title ?? t.name ?? "Untitled topic"),
          description: t.description ? String(t.description) : undefined,
          done: false,
        }))
      : [];

    return {
      week: Number(w.week ?? wi + 1),
      title: String(w.title ?? `Week ${wi + 1}`),
      focus: String(w.focus ?? ""),
      topics,
    };
  });

  if (!weeks.length) return null;

  return {
    generatedAt: new Date().toISOString(),
    profileSnapshot: profile,
    weeks,
    source: "ai",
  };
}

/**
 * Offline fallback plan generator — used when the Claude API is unavailable.
 * Produces an 8-week plan distributed across core GS subjects, scaled by
 * the candidate's preparation stage.
 */
export function generateFallbackPlan(profile: UserProfile): StudyPlan {
  const allSubjects = [
    {
      title: "Polity",
      topics: [
        "Indian Constitution: Preamble, basic features",
        "Fundamental Rights & Duties (Art 12-35, 51A)",
        "Union & State Executive, Legislature",
        "Judiciary & Constitutional Bodies",
      ],
    },
    {
      title: "History",
      topics: [
        "Ancient India: Indus Valley to Gupta period",
        "Medieval India: Delhi Sultanate & Mughals",
        "Modern India: 1857 to Independence",
        "Post-Independence consolidation",
      ],
    },
    {
      title: "Geography",
      topics: [
        "Physical Geography: landforms, climate",
        "Indian Geography: rivers, soils, agriculture",
        "World Geography: resources & regions",
        "Map-based practice & locations in news",
      ],
    },
    {
      title: "Economy",
      topics: [
        "Basic concepts: GDP, inflation, fiscal policy",
        "Banking, monetary policy & RBI",
        "Government schemes & budget basics",
        "External sector: trade, BoP, FDI",
      ],
    },
    {
      title: "Environment & Ecology",
      topics: [
        "Ecosystems, biodiversity & conservation",
        "Climate change & international agreements",
        "Environmental laws & institutions in India",
        "Pollution, waste management & current issues",
      ],
    },
    {
      title: "Science & Technology",
      topics: [
        "Space technology & ISRO missions",
        "Biotechnology & health technology",
        "IT, AI, and emerging technologies",
        "Defence technology & nuclear policy",
      ],
    },
    {
      title: "Current Affairs",
      topics: [
        "National news review & PIB highlights",
        "International relations & summits",
        "Government schemes in the news",
        "Economic survey / budget highlights",
      ],
    },
    {
      title: "Answer Writing & Revision",
      topics: [
        "Daily answer writing practice (GS papers)",
        "Essay writing practice",
        "Weekly MCQ test review & error analysis",
        "Revision of previous weeks' notes",
      ],
    },
  ];

  // Order subjects based on preferences first, then the rest
  const ordered = [
    ...allSubjects.filter((s) => profile.subjects.includes(s.title)),
    ...allSubjects.filter((s) => !profile.subjects.includes(s.title)),
  ];

  const weeks: StudyWeek[] = ordered.slice(0, 8).map((subj, idx) => ({
    week: idx + 1,
    title: `Week ${idx + 1}: ${subj.title}`,
    focus:
      profile.prepStage === "Beginner"
        ? `Build foundational understanding of ${subj.title} with NCERT-level reading.`
        : profile.prepStage === "Intermediate"
        ? `Deepen ${subj.title} concepts and connect with current affairs.`
        : `Revise ${subj.title} rapidly, focus on PYQ patterns and answer writing.`,
    topics: subj.topics.map((t, ti) => ({
      id: `w${idx + 1}-t${ti + 1}`,
      title: t,
      description: `Allocate roughly ${Math.max(1, Math.round(profile.dailyHours / 4))} hour(s) — read, take notes, and attempt related MCQs.`,
      done: false,
    })),
  }));

  return {
    generatedAt: new Date().toISOString(),
    profileSnapshot: profile,
    weeks,
    source: "fallback",
  };
}

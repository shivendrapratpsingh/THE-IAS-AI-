"""
Offline 8-week study plan generator for the IAS Prep Companion.

No AI is used here — this builds a sensible week-by-week plan from a small
template bank, ordered so the user's preferred subjects come first.
"""

SUBJECT_CATEGORIES = [
    "Polity",
    "History",
    "Geography",
    "Economy",
    "Environment & Ecology",
    "Science & Technology",
    "Current Affairs",
    "Answer Writing & Revision",
]

TASK_TEMPLATES = {
    "Polity": [
        "Read the Preamble, Fundamental Rights and Fundamental Duties (Laxmikanth Ch. 1-9)",
        "Make short notes on Centre-State relations and the Inter-State Council",
        "Revise the structure and powers of Parliament, President and Judiciary",
        "Study the Tenth Schedule (anti-defection) and constitutional amendments",
    ],
    "History": [
        "Revise the major phases of the freedom struggle (1857-1947) with a timeline",
        "Read about socio-religious reform movements of the 19th century",
        "Study ancient and medieval India highlights (Indus Valley to Mughals)",
        "Note down important personalities and their contributions for quick revision",
    ],
    "Geography": [
        "Revise physical geography of India: mountains, rivers, plateaus, coastline",
        "Study climate, monsoon mechanism and soil types with a map",
        "Read about natural resources and their regional distribution",
        "Practice locating important physical and political features on a blank map",
    ],
    "Economy": [
        "Revise basic concepts: GDP, inflation, fiscal policy, monetary policy",
        "Read about the banking system, RBI tools (repo rate, CRR, SLR)",
        "Study government schemes related to MSMEs, agriculture and welfare",
        "Go through the latest Economic Survey / Budget highlights",
    ],
    "Environment & Ecology": [
        "Revise ecosystems, biodiversity hotspots and conservation methods",
        "Study international conventions: UNFCCC, CBD, Ramsar, Montreal Protocol",
        "Read about India's climate commitments and renewable energy missions",
        "Make notes on national parks, biosphere reserves and protected species",
    ],
    "Science & Technology": [
        "Revise recent ISRO missions and India's space policy",
        "Read about emerging tech: AI, quantum computing, biotechnology basics",
        "Study health and disease related current developments",
        "Note down science-related government missions (semiconductors, 5G, etc.)",
    ],
    "Current Affairs": [
        "Read this week's curated current affairs items in the app and summarize each in 2 lines",
        "Connect at least 3 current affairs items to relevant static syllabus topics",
        "Revise government schemes launched in the last 3 months",
        "Skim a national newspaper editorial page for analysis practice",
    ],
    "Answer Writing & Revision": [
        "Write today's GS/Essay answer within the word limit and time yourself",
        "Revise your answer using the model structure: intro, body, conclusion",
        "Review last week's weak MCQ topics and redo those questions",
        "Do a quick revision of notes from the past two weeks",
    ],
}

GENERIC_TASKS = [
    "Complete today's daily MCQ practice set (10 questions)",
    "Read today's current affairs items and note the UPSC angle",
    "Revise notes from earlier in the week",
    "Write or outline one answer for practice",
]


def generate_fallback_plan(profile):
    """Build an 8-week plan, prioritizing the user's preferred subjects."""
    preferred = (profile or {}).get("preferred_subjects") or []

    ordered = [s for s in preferred if s in SUBJECT_CATEGORIES]
    for s in SUBJECT_CATEGORIES:
        if s not in ordered:
            ordered.append(s)

    weeks = []
    for week_num in range(1, 9):
        if week_num >= 7:
            focus = "Answer Writing & Revision"
        else:
            focus = ordered[(week_num - 1) % len(ordered)]
            if focus == "Answer Writing & Revision":
                # don't front-load revision weeks; swap with the next subject
                alt_index = (week_num - 1 + 1) % len(ordered)
                focus = ordered[alt_index]

        templates = TASK_TEMPLATES.get(focus, GENERIC_TASKS)
        tasks = []
        for idx, text in enumerate(templates, start=1):
            tasks.append({"id": f"w{week_num}-t{idx}", "text": text})

        extra_start = len(templates) + 1
        tasks.append({
            "id": f"w{week_num}-t{extra_start}",
            "text": "Complete the daily MCQ practice set every day this week",
        })
        tasks.append({
            "id": f"w{week_num}-t{extra_start + 1}",
            "text": "Write at least 3 GS/Essay answers this week using the Answer Writing tracker",
        })

        weeks.append({
            "week": week_num,
            "title": f"Week {week_num}: {focus} Focus",
            "focus_subject": focus,
            "tasks": tasks,
        })

    return {"weeks": weeks, "preferred_subjects": ordered}

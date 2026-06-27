"""
Fully offline, heuristic-based scoring for the Answer Writing tracker.

This is NOT an AI grader - it's a rule-of-thumb checklist turned into a
score out of 10, so users get *some* immediate signal (especially after
OCR-ing a handwritten answer) without needing an internet connection.
"""
import re

STOPWORDS = set("""
a an the and or but if then else for nor so yet of to in on at by from with
about into over after under above below between against during before since
this that these those is are was were be been being have has had do does did
will would shall should can could may might must not no nor as it its their
his her our your my we you they i he she them him us also more most other
some such only own same than too very can will just
""".split())


def _tokenize(text):
    return [w.lower() for w in re.findall(r"[A-Za-z]{3,}", text or "")]


def _keywords(text, top_n=12):
    words = [w for w in _tokenize(text) if w not in STOPWORDS]
    seen = []
    for w in words:
        if w not in seen:
            seen.append(w)
    return seen[:top_n]


def score_answer(answer_text, prompt):
    """Return a heuristic score breakdown for an answer.

    `prompt` is one of the dicts from data/answer_prompts.json, with keys
    'question' and 'wordLimit'.
    """
    text = (answer_text or "").strip()
    word_limit = prompt.get("wordLimit", 150)
    words = text.split()
    word_count = len(words)

    breakdown = []
    feedback = []

    # 1) Length / word-limit adherence (max 2)
    if word_count == 0:
        length_score = 0
    else:
        ratio = word_count / word_limit
        if 0.7 <= ratio <= 1.3:
            length_score = 2
        elif 0.4 <= ratio < 0.7 or 1.3 < ratio <= 1.6:
            length_score = 1
        else:
            length_score = 0

    if word_count == 0:
        feedback.append("No answer text was found - write or upload a clearer photo of your answer.")
    elif length_score < 2:
        if word_count < word_limit * 0.7:
            feedback.append(f"Your answer ({word_count} words) is quite short for the {word_limit}-word limit - try to develop more points.")
        else:
            feedback.append(f"Your answer ({word_count} words) is longer than the {word_limit}-word limit - practice being more concise.")
    breakdown.append({"label": "Length & word-limit adherence", "score": length_score, "max": 2})

    # 2) Structure: intro, body paragraphs, conclusion (max 3)
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n|\r\n\r\n", text) if p.strip()]
    if len(paragraphs) <= 1:
        # fall back to splitting on single newlines if no blank-line paragraphs found
        paragraphs = [p.strip() for p in text.splitlines() if p.strip()]

    structure_score = 0
    if len(paragraphs) >= 3:
        structure_score += 1
    elif len(paragraphs) == 2:
        feedback.append("Try structuring your answer into clear intro, body, and conclusion paragraphs.")

    if paragraphs and len(paragraphs[0].split()) >= 8:
        structure_score += 1
    else:
        feedback.append("Start with a brief introductory line that frames the question.")

    conclusion_markers = [
        "conclusion", "thus", "hence", "therefore", "to conclude",
        "way forward", "overall", "in sum", "to sum up",
    ]
    last_para = paragraphs[-1].lower() if paragraphs else ""
    if any(m in last_para for m in conclusion_markers):
        structure_score += 1
    else:
        feedback.append("End with a concluding line (e.g. 'Therefore...' / 'Way forward...').")

    breakdown.append({"label": "Structure (intro / body / conclusion)", "score": structure_score, "max": 3})

    # 3) Relevance: keyword overlap with the question (max 3)
    q_keywords = set(_keywords(prompt.get("question", ""), top_n=15))
    a_tokens = set(_tokenize(text))
    if q_keywords:
        overlap = len(q_keywords & a_tokens) / len(q_keywords)
    else:
        overlap = 0
    relevance_score = round(overlap * 3)
    relevance_score = max(0, min(3, relevance_score))
    if relevance_score < 2 and word_count > 0:
        feedback.append("Try to directly use more terms from the question itself to stay focused on what's asked.")
    breakdown.append({"label": "Relevance to the question (keyword coverage)", "score": relevance_score, "max": 3})

    # 4) Substantiation: examples, data, references (max 2)
    sub_score = 0
    if re.search(r"\d", text):
        sub_score += 1
    else:
        feedback.append("Add a fact, figure, or year to substantiate your points.")

    example_markers = [
        "for example", "e.g.", "such as", "case of", "instance",
        "article", "scheme", "report", "committee", "act,", "amendment",
    ]
    if any(m in text.lower() for m in example_markers):
        sub_score += 1
    else:
        feedback.append("Cite a specific example, scheme, article, or report to strengthen your answer.")

    breakdown.append({"label": "Substantiation (examples / data / references)", "score": sub_score, "max": 2})

    total = sum(item["score"] for item in breakdown)
    max_total = sum(item["max"] for item in breakdown)

    if not feedback:
        feedback.append("Solid structure and coverage - nice work!")

    return {
        "total": total,
        "max": max_total,
        "breakdown": breakdown,
        "feedback": feedback,
        "word_count": word_count,
    }

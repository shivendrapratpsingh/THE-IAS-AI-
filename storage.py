"""
Local JSON-file storage layer for the IAS Prep Companion (Flask edition).

Multi-user: each phone number gets its own profile in data/users.json.
Legacy single-user data (user_data.json) is still readable for migration.
"""
import json
import os
from datetime import date, datetime, timedelta

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
USER_DATA_FILE = os.path.join(DATA_DIR, "user_data.json")   # legacy
USERS_FILE     = os.path.join(DATA_DIR, "users.json")        # multi-user

DEFAULT_USER_DATA = {
    "onboarded": False,
    "user_type": "upsc",          # "upsc" | "general"
    "profile": {
        "name": "",
        "stage": "beginner",
        "target_year": "",
        "daily_hours": 4,
        "preferred_subjects": [],
        "avatar_id": "ias",
        "avatar_color": "#F4621F",
    },
    "study_plan": None,
    "completed_tasks": [],
    "mcq_stats": {},
    "mcq_history": [],
    "daily_mcq": {"date": None, "question_ids": [], "answers": {}, "submitted": False},
    "answer_history": [],
    "bookmarked_affairs": [],
    "daily_legal": {"date": None, "answer": None},
    "streak": {"current": 0, "longest": 0, "last_active": None},
    # ── Preference tracking (add new keys freely) ──────────────────────────
    "prefs": {
        "language": "en",               # last selected language code
        "topic_time": {},               # topic → total seconds spent in quiz
        "topic_correct_pct": {},        # topic → running accuracy %
        "affairs_read": [],             # list of affair IDs user opened summary for
        "affairs_described": [],        # list of affair IDs user clicked Describe
        "affairs_time": {},             # affair_id → seconds spent reading
        "last_active_page": None,       # last route visited
        "session_count": 0,             # total login sessions
        "first_login": None,            # ISO date of first login
    },
}


def _deep_copy(obj):
    return json.loads(json.dumps(obj))


def _fill_defaults(data):
    """Fill missing keys from DEFAULT_USER_DATA."""
    defaults = _deep_copy(DEFAULT_USER_DATA)
    for key, value in defaults.items():
        if key not in data:
            data[key] = value
        elif isinstance(value, dict) and isinstance(data[key], dict):
            for sub_key, sub_value in value.items():
                data[key].setdefault(sub_key, sub_value)
    return data


# ── Multi-user helpers ──────────────────────────────────────────────────────

def load_all_users():
    """Return dict of phone → user_data."""
    if not os.path.exists(USERS_FILE):
        return {}
    with open(USERS_FILE, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return {}


def save_all_users(users):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2, ensure_ascii=False)


def load_user(phone):
    """Load a single user's data by phone number."""
    users = load_all_users()
    data = users.get(phone, {})
    return _fill_defaults(data)


def save_user(phone, data):
    """Save a single user's data by phone number."""
    users = load_all_users()
    users[phone] = data
    save_all_users(users)


def user_exists(phone):
    return phone in load_all_users()


def get_all_user_summaries():
    """Return list of summary_dicts for admin page. Easily extensible."""
    users = load_all_users()
    result = []
    for phone, data in users.items():
        stats  = data.get("mcq_stats", {})
        prefs  = data.get("prefs", {})
        total_attempted = sum(s["total"]   for s in stats.values())
        total_correct   = sum(s["correct"] for s in stats.values())
        accuracy = round(100 * total_correct / total_attempted) if total_attempted else None

        # Topic heatmap: {topic: {"total": N, "correct": M, "pct": P}}
        topic_heat = {}
        for topic, s in stats.items():
            pct = round(100 * s["correct"] / s["total"]) if s["total"] else 0
            topic_heat[topic] = {"total": s["total"], "correct": s["correct"], "pct": pct}

        result.append({
            # Identity
            "phone":      phone,
            "name":       data.get("profile", {}).get("name", "—"),
            "user_type":  data.get("user_type", "upsc"),
            "stage":      data.get("profile", {}).get("stage", "—"),
            "avatar_id":  data.get("profile", {}).get("avatar_id", "ias"),
            "onboarded":  data.get("onboarded", False),
            # Activity
            "streak":     data.get("streak", {}).get("current", 0),
            "accuracy":   accuracy,
            "attempted":  total_attempted,
            "correct":    total_correct,
            # Topic heatmap
            "topic_heat": topic_heat,
            # Preferences & reading behaviour
            "language":           prefs.get("language", "en"),
            "affairs_read":       len(prefs.get("affairs_read", [])),
            "affairs_described":  len(prefs.get("affairs_described", [])),
            "session_count":      prefs.get("session_count", 0),
            "first_login":        prefs.get("first_login", "—"),
            # ADD MORE FIELDS HERE as needed ↓
        })
    return sorted(result, key=lambda x: x["name"])


def record_pref(data, key, value):
    """Utility: write a preference key into data['prefs'] and return data."""
    prefs = data.setdefault("prefs", {})
    prefs[key] = value
    return data


def record_affair_read(data, affair_id, described=False):
    """Track that user read (and optionally described) a current affair."""
    prefs = data.setdefault("prefs", {})
    reads = prefs.setdefault("affairs_read", [])
    if affair_id not in reads:
        reads.append(affair_id)
    if described:
        descs = prefs.setdefault("affairs_described", [])
        if affair_id not in descs:
            descs.append(affair_id)
    return data


# ── Legacy single-user (kept for backward compat) ──────────────────────────

def load_user_data():
    if not os.path.exists(USER_DATA_FILE):
        return _deep_copy(DEFAULT_USER_DATA)
    with open(USER_DATA_FILE, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            data = {}
    return _fill_defaults(data)


def save_user_data(data):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(USER_DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def mark_active_today(data):
    """Update the study streak based on today's activity."""
    today = date.today()
    streak = data.setdefault("streak", _deep_copy(DEFAULT_USER_DATA["streak"]))
    last_active = streak.get("last_active")

    if last_active == today.isoformat():
        return  # already counted today

    if last_active:
        last_date = datetime.fromisoformat(last_active).date()
        gap = (today - last_date).days
        if gap == 1:
            streak["current"] = streak.get("current", 0) + 1
        else:
            streak["current"] = 1
    else:
        streak["current"] = 1

    streak["longest"] = max(streak.get("longest", 0), streak["current"])
    streak["last_active"] = today.isoformat()


# ---------------------------------------------------------------------------
# Static content
# ---------------------------------------------------------------------------

def _load_json(filename):
    with open(os.path.join(DATA_DIR, filename), "r", encoding="utf-8") as f:
        return json.load(f)


_MCQ_DATA = _load_json("mcq_bank.json")
MCQ_TOPICS = _MCQ_DATA["topics"]
MCQ_BANK   = _MCQ_DATA["questions"]
MCQ_BY_ID  = {q["id"]: q for q in MCQ_BANK}

ANSWER_PROMPTS   = _load_json("answer_prompts.json")
LEGAL_QUESTIONS  = _load_json("legal_questions.json")
CURRENT_AFFAIRS  = _load_json("current_affairs.json")


def get_daily_mcq_set(for_date=None, count=10):
    """Truly random selection from the MCQ bank."""
    import random
    pool = list(MCQ_BANK)
    if len(pool) <= count:
        return pool
    return random.sample(pool, count)


def get_daily_answer_prompt(for_date=None):
    d = for_date or date.today()
    day_index = (d - date(1970, 1, 1)).days
    return ANSWER_PROMPTS[day_index % len(ANSWER_PROMPTS)]


def get_daily_legal_question(for_date=None):
    d = for_date or date.today()
    day_index = (d - date(1970, 1, 1)).days
    return LEGAL_QUESTIONS[day_index % len(LEGAL_QUESTIONS)]


def get_weekly_current_affairs(count=14):
    items = sorted(CURRENT_AFFAIRS, key=lambda x: x["date"], reverse=True)
    return items[:count]

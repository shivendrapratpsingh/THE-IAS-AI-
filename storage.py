"""
Storage layer for IAS Prep Companion.

User data is stored in Neon (free PostgreSQL) as JSONB — one row per user.
Static content (MCQ bank, prompts, etc.) still loads from local JSON files.

Schema (auto-created on first run):
    CREATE TABLE users (
        phone TEXT PRIMARY KEY,
        data  JSONB NOT NULL DEFAULT '{}'
    );

Set DATABASE_URL environment variable on Render to your Neon connection string.
Falls back to local JSON files if DATABASE_URL is not set (local dev).
"""
import json
import os
from datetime import date, datetime

DATA_DIR       = os.path.join(os.path.dirname(__file__), "data")
USER_DATA_FILE = os.path.join(DATA_DIR, "user_data.json")   # legacy fallback
USERS_FILE     = os.path.join(DATA_DIR, "users.json")        # local fallback

DATABASE_URL = os.environ.get("DATABASE_URL", "")

DEFAULT_USER_DATA = {
    "onboarded": False,
    "user_type": "upsc",
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
    "prefs": {
        "language": "en",
        "topic_time": {},
        "topic_correct_pct": {},
        "affairs_read": [],
        "affairs_described": [],
        "affairs_time": {},
        "last_active_page": None,
        "session_count": 0,
        "first_login": None,
    },
}


def _deep_copy(obj):
    return json.loads(json.dumps(obj))


def _fill_defaults(data):
    defaults = _deep_copy(DEFAULT_USER_DATA)
    for key, value in defaults.items():
        if key not in data:
            data[key] = value
        elif isinstance(value, dict) and isinstance(data[key], dict):
            for sub_key, sub_value in value.items():
                data[key].setdefault(sub_key, sub_value)
    return data


# ── Database connection ────────────────────────────────────────────────────────

def _get_conn():
    """Return a psycopg2 connection to Neon. Raises if DATABASE_URL not set."""
    import psycopg2
    return psycopg2.connect(DATABASE_URL, sslmode="require")


def _ensure_table():
    """Create users table if it doesn't exist yet."""
    with _get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    phone TEXT PRIMARY KEY,
                    data  JSONB NOT NULL DEFAULT '{}'
                )
            """)
        conn.commit()


# Auto-create table when module loads (only if DB is configured)
if DATABASE_URL:
    try:
        _ensure_table()
    except Exception as _e:
        print(f"[storage] DB init warning: {_e}")


# ── Core user operations ───────────────────────────────────────────────────────

def _use_db() -> bool:
    return bool(DATABASE_URL)


def load_all_users() -> dict:
    if _use_db():
        try:
            with _get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT phone, data FROM users")
                    return {row[0]: row[1] for row in cur.fetchall()}
        except Exception as e:
            print(f"[storage] load_all_users DB error: {e}")
            return {}
    # ── fallback: local JSON ──
    if not os.path.exists(USERS_FILE):
        return {}
    with open(USERS_FILE, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return {}


def save_all_users(users: dict):
    """Bulk-save all users. Used by migration only; prefer save_user() for single updates."""
    if _use_db():
        try:
            with _get_conn() as conn:
                with conn.cursor() as cur:
                    for phone, data in users.items():
                        cur.execute("""
                            INSERT INTO users (phone, data)
                            VALUES (%s, %s::jsonb)
                            ON CONFLICT (phone) DO UPDATE SET data = EXCLUDED.data
                        """, (phone, json.dumps(data)))
                conn.commit()
            return
        except Exception as e:
            print(f"[storage] save_all_users DB error: {e}")
    # ── fallback: local JSON ──
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2, ensure_ascii=False)


def load_user(phone: str) -> dict:
    if _use_db():
        try:
            with _get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT data FROM users WHERE phone = %s", (phone,))
                    row = cur.fetchone()
                    data = row[0] if row else {}
                    return _fill_defaults(data)
        except Exception as e:
            print(f"[storage] load_user DB error: {e}")
            return _fill_defaults({})
    # ── fallback ──
    users = load_all_users()
    return _fill_defaults(users.get(phone, {}))


def save_user(phone: str, data: dict):
    if _use_db():
        try:
            with _get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute("""
                        INSERT INTO users (phone, data)
                        VALUES (%s, %s::jsonb)
                        ON CONFLICT (phone) DO UPDATE SET data = EXCLUDED.data
                    """, (phone, json.dumps(data)))
                conn.commit()
            return
        except Exception as e:
            print(f"[storage] save_user DB error: {e}")
    # ── fallback ──
    users = load_all_users()
    users[phone] = data
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2, ensure_ascii=False)


def user_exists(phone: str) -> bool:
    if _use_db():
        try:
            with _get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT 1 FROM users WHERE phone = %s", (phone,))
                    return cur.fetchone() is not None
        except Exception as e:
            print(f"[storage] user_exists DB error: {e}")
            return False
    return phone in load_all_users()


def get_all_user_summaries() -> list:
    users = load_all_users()
    result = []
    for phone, data in users.items():
        stats = data.get("mcq_stats", {})
        prefs = data.get("prefs", {})
        total_attempted = sum(s["total"]   for s in stats.values())
        total_correct   = sum(s["correct"] for s in stats.values())
        accuracy = round(100 * total_correct / total_attempted) if total_attempted else None

        topic_heat = {}
        for topic, s in stats.items():
            pct = round(100 * s["correct"] / s["total"]) if s["total"] else 0
            topic_heat[topic] = {"total": s["total"], "correct": s["correct"], "pct": pct}

        result.append({
            "phone":             phone,
            "name":              data.get("profile", {}).get("name", "—"),
            "user_type":         data.get("user_type", "upsc"),
            "stage":             data.get("profile", {}).get("stage", "—"),
            "avatar_id":         data.get("profile", {}).get("avatar_id", "ias"),
            "onboarded":         data.get("onboarded", False),
            "streak":            data.get("streak", {}).get("current", 0),
            "accuracy":          accuracy,
            "attempted":         total_attempted,
            "correct":           total_correct,
            "topic_heat":        topic_heat,
            "language":          prefs.get("language", "en"),
            "affairs_read":      len(prefs.get("affairs_read", [])),
            "affairs_described": len(prefs.get("affairs_described", [])),
            "session_count":     prefs.get("session_count", 0),
            "first_login":       prefs.get("first_login", "—"),
        })
    return sorted(result, key=lambda x: x["name"])


# ── Preference helpers ─────────────────────────────────────────────────────────

def record_pref(data, key, value):
    prefs = data.setdefault("prefs", {})
    prefs[key] = value
    return data


def record_affair_read(data, affair_id, described=False):
    prefs = data.setdefault("prefs", {})
    reads = prefs.setdefault("affairs_read", [])
    if affair_id not in reads:
        reads.append(affair_id)
    if described:
        descs = prefs.setdefault("affairs_described", [])
        if affair_id not in descs:
            descs.append(affair_id)
    return data


# ── Legacy single-user (kept for backward compat) ─────────────────────────────

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
    today = date.today()
    streak = data.setdefault("streak", _deep_copy(DEFAULT_USER_DATA["streak"]))
    last_active = streak.get("last_active")

    if last_active == today.isoformat():
        return

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


# ── Static content ─────────────────────────────────────────────────────────────

def _load_json(filename):
    with open(os.path.join(DATA_DIR, filename), "r", encoding="utf-8") as f:
        return json.load(f)


_MCQ_DATA      = _load_json("mcq_bank.json")
MCQ_TOPICS     = _MCQ_DATA["topics"]
MCQ_BANK       = _MCQ_DATA["questions"]
MCQ_BY_ID      = {q["id"]: q for q in MCQ_BANK}
ANSWER_PROMPTS = _load_json("answer_prompts.json")
LEGAL_QUESTIONS= _load_json("legal_questions.json")
CURRENT_AFFAIRS= _load_json("current_affairs.json")


def get_daily_mcq_set(for_date=None, count=10):
    import random
    pool = list(MCQ_BANK)
    return random.sample(pool, count) if len(pool) > count else pool


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

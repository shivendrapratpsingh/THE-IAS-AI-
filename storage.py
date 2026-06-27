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
import random
from datetime import date, datetime, timedelta

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
        "phone": "",           # stored in profile for general users too
    },
    "study_plan": None,
    "completed_tasks": [],
    "mcq_stats": {},
    "mcq_history": [],
    "daily_mcq": {"quiz_day": None, "date": None, "question_ids": [], "answers": {}, "submitted": False},
    "seen_question_ids": [],   # all question IDs ever shown to this user (no-repeat logic)
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
        "activity_log": [],    # ISO date strings, last 90 days, for regularity tracking
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
    """Create users table if it doesn't exist, and add missing columns if schema is old."""
    with _get_conn() as conn:
        with conn.cursor() as cur:
            # Create table with correct schema
            cur.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    phone TEXT PRIMARY KEY,
                    data  JSONB NOT NULL DEFAULT '{}'
                )
            """)
            # If table existed with wrong schema, add the data column safely
            cur.execute("""
                ALTER TABLE users
                ADD COLUMN IF NOT EXISTS data JSONB NOT NULL DEFAULT '{}'
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
    # ── fallback: local JSON (read-only filesystems like Vercel will skip silently) ──
    try:
        users = load_all_users()
        users[phone] = data
        os.makedirs(DATA_DIR, exist_ok=True)
        with open(USERS_FILE, "w", encoding="utf-8") as f:
            json.dump(users, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"[storage] save_user local fallback error (read-only fs?): {e}")


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

        # Last active date from activity_log
        activity_log = prefs.get("activity_log", [])
        last_active_date = max(activity_log) if activity_log else prefs.get("first_login", "—")
        days_active_30 = sum(
            1 for i in range(30)
            if (date.today() - timedelta(days=i)).isoformat() in set(activity_log)
        )

        result.append({
            "phone":             phone,
            "name":              data.get("profile", {}).get("name", ""),
            "user_type":         data.get("user_type", "upsc"),
            "stage":             data.get("profile", {}).get("stage", ""),
            "avatar_id":         data.get("profile", {}).get("avatar_id", "ias"),
            "avatar_color":      data.get("profile", {}).get("avatar_color", "#F4621F"),
            "onboarded":         data.get("onboarded", False),
            "streak":            data.get("streak", {}).get("current", 0),
            "longest_streak":    data.get("streak", {}).get("longest", 0),
            "accuracy":          accuracy,
            "attempted":         total_attempted,
            "correct":           total_correct,
            "topic_heat":        topic_heat,
            "language":          prefs.get("language", "en"),
            "affairs_read":      len(prefs.get("affairs_read", [])),
            "affairs_described": len(prefs.get("affairs_described", [])),
            "session_count":     prefs.get("session_count", 0),
            "first_login":       prefs.get("first_login", ""),
            "last_active":       last_active_date,
            "days_active_30":    days_active_30,
            "regularity":        compute_regularity(data),
            "seen_questions":    len(data.get("seen_question_ids", [])),
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
    today_iso = today.isoformat()

    # Streak
    streak = data.setdefault("streak", _deep_copy(DEFAULT_USER_DATA["streak"]))
    last_active = streak.get("last_active")

    if last_active != today_iso:
        if last_active:
            last_date = datetime.fromisoformat(last_active).date()
            gap = (today - last_date).days
            streak["current"] = streak.get("current", 0) + 1 if gap == 1 else 1
        else:
            streak["current"] = 1
        streak["longest"] = max(streak.get("longest", 0), streak["current"])
        streak["last_active"] = today_iso

    # Activity log for regularity tracking
    prefs = data.setdefault("prefs", {})
    if not prefs.get("first_login"):
        prefs["first_login"] = today_iso

    activity_log = prefs.setdefault("activity_log", [])
    if today_iso not in activity_log:
        activity_log.append(today_iso)
        cutoff = (today - timedelta(days=90)).isoformat()
        prefs["activity_log"] = [d for d in activity_log if d >= cutoff]
        prefs["session_count"] = prefs.get("session_count", 0) + 1


# ── Static content ─────────────────────────────────────────────────────────────

def _load_json(filename):
    with open(os.path.join(DATA_DIR, filename), "r", encoding="utf-8") as f:
        return json.load(f)


_MCQ_DATA       = _load_json("mcq_bank.json")
MCQ_TOPICS      = _MCQ_DATA["topics"]
MCQ_BANK        = _MCQ_DATA["questions"]
MCQ_BY_ID       = {q["id"]: q for q in MCQ_BANK}
ANSWER_PROMPTS  = _load_json("answer_prompts.json")
LEGAL_QUESTIONS = _load_json("legal_questions.json")
CURRENT_AFFAIRS = _load_json("current_affairs.json")


# ── Daily quiz helpers ─────────────────────────────────────────────────────────

def get_quiz_day():
    """Quiz day resets at 4 AM, not midnight."""
    now = datetime.now()
    if now.hour < 4:
        return (now.date() - timedelta(days=1)).isoformat()
    return now.date().isoformat()


def get_daily_mcq_set(user_data, count=10):
    """
    Returns today's MCQ set for this user.
    - Resets at 4 AM
    - No question repeats until all questions seen
    - Modifies user_data in-place; caller must save.
    """
    quiz_day = get_quiz_day()
    daily = user_data.get("daily_mcq", {})

    # Same day: return existing set
    if daily.get("quiz_day") == quiz_day and daily.get("question_ids"):
        return [MCQ_BY_ID[qid] for qid in daily["question_ids"] if qid in MCQ_BY_ID]

    # New day: pick unseen questions
    seen = set(user_data.get("seen_question_ids", []))
    all_ids = [q["id"] for q in MCQ_BANK]
    available = [qid for qid in all_ids if qid not in seen]

    # Pool exhausted: reset
    if len(available) < count:
        user_data["seen_question_ids"] = []
        available = all_ids[:]

    random.shuffle(available)
    chosen_ids = available[:count]

    user_data.setdefault("seen_question_ids", []).extend(chosen_ids)
    user_data["daily_mcq"] = {
        "quiz_day":     quiz_day,
        "date":         quiz_day,
        "question_ids": chosen_ids,
        "answers":      {},
        "submitted":    False,
    }
    return [MCQ_BY_ID[qid] for qid in chosen_ids if qid in MCQ_BY_ID]


def compute_regularity(data):
    """
    Returns regularity label: champion / regular / occasional / at_risk / churned / new
    """
    prefs  = data.get("prefs", {})
    log    = prefs.get("activity_log", [])
    today  = date.today()

    first_login = prefs.get("first_login")
    if not first_login:
        return "new"

    try:
        days_since_join = (today - date.fromisoformat(first_login)).days
    except Exception:
        days_since_join = 0

    if not log:
        return "new" if days_since_join < 3 else "churned"

    log_set = set(log)
    try:
        last_active_d = max(date.fromisoformat(d) for d in log)
        days_inactive = (today - last_active_d).days
    except Exception:
        days_inactive = 999

    if days_inactive > 30:
        return "churned"
    if days_inactive > 14:
        return "at_risk"

    last_7  = sum(1 for i in range(7)  if (today - timedelta(days=i)).isoformat() in log_set)
    last_30 = sum(1 for i in range(30) if (today - timedelta(days=i)).isoformat() in log_set)

    if last_7 >= 6:
        return "champion"
    if last_7 >= 4 or last_30 >= 15:
        return "regular"
    if last_30 >= 8:
        return "occasional"
    return "at_risk"


def get_startup_metrics():
    """Aggregate KPIs for the admin dashboard."""
    all_users = load_all_users()
    today     = date.today()
    today_iso = today.isoformat()

    dau = wau = mau = 0
    d1_total = d1_retained = 0
    streaks = []
    completed_quiz_users = 0
    regularity_counts = {
        "champion": 0, "regular": 0, "occasional": 0,
        "at_risk": 0, "churned": 0, "new": 0,
    }

    for _phone, udata in all_users.items():
        prefs   = udata.get("prefs", {})
        log_set = set(prefs.get("activity_log", []))

        if today_iso in log_set:
            dau += 1
        if any((today - timedelta(days=i)).isoformat() in log_set for i in range(7)):
            wau += 1
        if any((today - timedelta(days=i)).isoformat() in log_set for i in range(30)):
            mau += 1

        reg = compute_regularity(udata)
        regularity_counts[reg] = regularity_counts.get(reg, 0) + 1

        cs = udata.get("streak", {}).get("current", 0)
        if cs > 0:
            streaks.append(cs)

        first_login = prefs.get("first_login")
        if first_login:
            try:
                first_date = date.fromisoformat(first_login)
                if (today - first_date).days >= 1:
                    d1_total += 1
                    if (first_date + timedelta(days=1)).isoformat() in log_set:
                        d1_retained += 1
            except Exception:
                pass

        if udata.get("mcq_history"):
            completed_quiz_users += 1

    total = len(all_users) or 1
    return {
        "total_users":         len(all_users),
        "dau":                 dau,
        "wau":                 wau,
        "mau":                 mau,
        "d1_retention_pct":    round(100 * d1_retained / d1_total) if d1_total else 0,
        "avg_streak":          round(sum(streaks) / len(streaks), 1) if streaks else 0,
        "max_streak":          max(streaks) if streaks else 0,
        "quiz_completion_pct": round(100 * completed_quiz_users / total),
        "regularity":          regularity_counts,
    }


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

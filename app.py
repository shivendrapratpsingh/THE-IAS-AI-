"""
BASS 50 — IAS Prep Companion (offline Flask edition).

Run with:  python app.py
Then open: http://127.0.0.1:5000

Multi-user: each phone number gets its own profile (data/users.json).
Everything runs offline — no API key or internet required.
"""
import os
import random
from datetime import date, datetime

from flask import Flask, render_template, request, redirect, url_for, flash, session

import grading
import ocr
import storage
import study_plan

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "bass50-ias-prep-secret-key-2024")

ADMIN_PHONE = "+917905225504"   # owner number — auto-redirects to admin on login

# ── Motivational quotes (gym-adapted for UPSC prep) ───────────────────────
QUOTES = [
    {"icon": "💪", "text": "No grind, no IAS. Sweat in preparation so you don't bleed on exam day.", "author": "BASS 50"},
    {"icon": "🔥", "text": "Your competition is also awake right now. What are you doing about it?", "author": "BASS 50"},
    {"icon": "🏆", "text": "Champions don't skip revision day. The syllabus doesn't care about your mood.", "author": "BASS 50"},
    {"icon": "⚡", "text": "One more chapter. One more question. One step closer to the IFoS/IAS badge.", "author": "BASS 50"},
    {"icon": "🧠", "text": "Train your mind like Virat trains his body — relentlessly, without excuses.", "author": "BASS 50"},
    {"icon": "📚", "text": "Every page you read is a rep. Every MCQ is a set. Keep the streak alive.", "author": "BASS 50"},
    {"icon": "🌅", "text": "The officer you want to become is built in the early mornings no one sees.", "author": "BASS 50"},
    {"icon": "🎯", "text": "Progress, not perfection. Read. Revise. Repeat. Don't break the chain.", "author": "BASS 50"},
    {"icon": "🚀", "text": "Be the aspirant who makes the topper nervous. Show up every single day.", "author": "BASS 50"},
    {"icon": "💡", "text": "Coffee + Notes + Consistency = IAS Officer. Simple maths. Hard execution.", "author": "BASS 50"},
    {"icon": "⚔️", "text": "The UPSC doesn't care about your feelings. It respects preparation. Prepare.", "author": "BASS 50"},
    {"icon": "🌟", "text": "Small daily improvements lead to stunning yearly results. Trust the process.", "author": "BASS 50"},
    {"icon": "📖", "text": "Today's hard work is tomorrow's AIR 1. The rank board doesn't lie.", "author": "BASS 50"},
    {"icon": "🏋️", "text": "Your brain is a muscle. The more you use it, the stronger it gets. Lift.", "author": "BASS 50"},
    {"icon": "🦁", "text": "Even Bhagavad Gita says: Do the work. The result will follow. Karma.", "author": "BASS 50"},
    {"icon": "⏰", "text": "The only bad study session is the one that didn't happen. Even 30 min counts.", "author": "BASS 50"},
    {"icon": "🔑", "text": "You didn't come this far to only come this far. Push past the plateau.", "author": "BASS 50"},
    {"icon": "🌊", "text": "Discipline > Motivation. Motivation fades. Discipline builds empires.", "author": "BASS 50"},
    {"icon": "🎖️", "text": "The IAS badge doesn't go to the most talented — it goes to the most consistent.", "author": "BASS 50"},
    {"icon": "🌙", "text": "Sone wala sapna dekhta hai. Jaagne wala sapna pura karta hai. Jago.", "author": "BASS 50"},
]


def _parse_daily_hours(value, default=4, minimum=1, maximum=16):
    try:
        hours = int(value)
    except (TypeError, ValueError):
        return default
    return max(minimum, min(maximum, hours))


def _get_current_user():
    """Return (user_key, data) for logged-in user (UPSC or guest), or (None, None)."""
    key = session.get("phone") or session.get("guest_id")
    if not key:
        return None, None
    return key, storage.load_user(key)


def _save_current_user(key, data):
    storage.save_user(key, data)


def _require_login():
    """Return redirect if not logged in, else None."""
    if not session.get("phone") and not session.get("guest_id"):
        return redirect(url_for("login"))
    return None


def _is_upsc():
    return session.get("user_mode") == "upsc"


def _mcq_count():
    """Number of questions based on user mode."""
    return 50 if _is_upsc() else 10


def _require_onboarding(data):
    """Return redirect if not onboarded, else None."""
    if not data.get("onboarded"):
        return redirect(url_for("onboarding"))
    return None


def _common_ctx(profile, phone):
    """Common template context vars."""
    return {"profile": profile, "phone": phone}


# ─────────────────────────────────────────────────────────────────────────────
# SPLASH
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return redirect(url_for("splash"))


@app.route("/splash")
def splash():
    phone = session.get("phone")
    if phone:
        data = storage.load_user(phone)
        next_url = url_for("home") if data.get("onboarded") else url_for("onboarding")
    else:
        next_url = url_for("login")
    return render_template("splash.html", next_url=next_url)


# ─────────────────────────────────────────────────────────────────────────────
# LOGIN / LOGOUT
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/login", methods=["GET", "POST"])
def login():
    if session.get("phone") or session.get("guest_id"):
        return redirect(url_for("home"))

    if request.method == "POST":
        code  = request.form.get("country_code", "+91").strip()
        phone = request.form.get("phone", "").strip()
        phone = "".join(filter(str.isdigit, phone))

        if len(phone) < 6:
            flash("Please enter a valid phone number.")
            return redirect(url_for("login"))

        full_phone = code + phone
        session["phone"] = full_phone
        session["user_mode"] = "upsc"
        session.permanent = True

        # Admin auto-redirect
        if full_phone == ADMIN_PHONE:
            return redirect(url_for("admin"))

        # First time? Redirect to onboarding
        data = storage.load_user(full_phone)
        if not data.get("onboarded"):
            return redirect(url_for("onboarding"))
        return redirect(url_for("home"))

    return render_template("login.html")


@app.route("/guest-login", methods=["POST"])
def guest_login():
    """General-purpose login — name only, no phone required."""
    name = request.form.get("name", "").strip() or "Guest"
    import uuid
    guest_id = session.get("guest_id") or ("guest_" + uuid.uuid4().hex[:10])
    session["guest_id"] = guest_id
    session["user_mode"] = "general"
    session.permanent = True

    data = storage.load_user(guest_id)
    if not data.get("onboarded"):
        data["profile"]["name"] = name
        data["onboarded"] = True
        data["user_type"] = "general"
        storage.save_user(guest_id, data)

    return redirect(url_for("home"))


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("splash"))


# ─────────────────────────────────────────────────────────────────────────────
# ONBOARDING
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/onboarding", methods=["GET", "POST"])
def onboarding():
    redir = _require_login()
    if redir:
        return redir

    phone, data = _get_current_user()

    if request.method == "POST":
        # Phone from form (general users enter it here; UPSC users get it pre-filled)
        form_phone = request.form.get("phone", "").strip()
        form_country = request.form.get("country_code", "+91").strip()
        full_phone_entered = (form_country + "".join(filter(str.isdigit, form_phone))) if form_phone else ""

        profile = {
            "name":                request.form.get("name", "").strip() or "Aspirant",
            "stage":               request.form.get("stage", "beginner"),
            "target_year":         request.form.get("target_year", "").strip(),
            "daily_hours":         _parse_daily_hours(request.form.get("daily_hours")),
            "preferred_subjects":  request.form.getlist("preferred_subjects"),
            "avatar_id":           data.get("profile", {}).get("avatar_id", "ias"),
            "avatar_color":        data.get("profile", {}).get("avatar_color", "#F4621F"),
            "phone":               full_phone_entered or session.get("phone", ""),
        }
        data["profile"] = profile
        data["onboarded"] = True
        data["study_plan"] = study_plan.generate_fallback_plan(profile)
        data["completed_tasks"] = []
        storage.mark_active_today(data)
        _save_current_user(phone, data)
        return redirect(url_for("avatar_select"))

    # Pre-compute last 10 digits so template never needs string slicing
    phone_digits = phone[-10:] if phone and not phone.startswith("guest_") and len(phone) >= 10 else ""
    return render_template(
        "onboarding.html",
        profile=data.get("profile"),
        phone=phone,
        phone_digits=phone_digits,
    )


# ─────────────────────────────────────────────────────────────────────────────
# AVATAR
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/avatar")
def avatar_select():
    redir = _require_login()
    if redir:
        return redir
    return render_template("avatar.html")


@app.route("/avatar/save", methods=["POST"])
def save_avatar():
    redir = _require_login()
    if redir:
        return redir
    key, data = _get_current_user()
    data["profile"]["avatar_id"]    = request.form.get("avatar_id", "ias")
    data["profile"]["avatar_color"] = request.form.get("avatar_color", "#F4621F")
    _save_current_user(key, data)
    flash("Welcome aboard! Your profile is ready. 🎉")
    return redirect(url_for("home"))


# ─────────────────────────────────────────────────────────────────────────────
# HOME
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/home")
def home():
    redir = _require_login()
    if redir:
        return redir
    phone, data = _get_current_user()
    redir = _require_onboarding(data)
    if redir:
        return redir

    # Track activity on every home visit
    storage.mark_active_today(data)
    _save_current_user(phone, data)

    today_iso = date.today().isoformat()
    daily_mcq = data.get("daily_mcq", {})
    mcq_done_today = daily_mcq.get("date") == today_iso and daily_mcq.get("submitted")
    answer_done_today = any(a["date"] == today_iso for a in data.get("answer_history", []))

    legal_q = storage.get_daily_legal_question(date.today())
    daily_legal = data.get("daily_legal", {})
    legal_answered_today = daily_legal.get("date") == today_iso
    legal_selected = daily_legal.get("answer") if legal_answered_today else None

    plan = data.get("study_plan") or study_plan.generate_fallback_plan(data["profile"])
    total_tasks = sum(len(w["tasks"]) for w in plan["weeks"])
    completed = data.get("completed_tasks", [])
    progress_pct = round(100 * len(completed) / total_tasks) if total_tasks else 0

    stats = data.get("mcq_stats", {})
    total_attempted = sum(s["total"] for s in stats.values())
    total_correct   = sum(s["correct"] for s in stats.values())
    overall_accuracy = round(100 * total_correct / total_attempted) if total_attempted else None

    quote = random.choice(QUOTES)
    is_upsc = _is_upsc()

    return render_template(
        "home.html",
        profile=data["profile"],
        phone=phone,
        streak=data.get("streak", {}),
        mcq_done_today=mcq_done_today,
        answer_done_today=answer_done_today,
        legal_q=legal_q,
        legal_answered_today=legal_answered_today,
        legal_selected=legal_selected,
        progress_pct=progress_pct,
        completed_count=len(completed),
        total_tasks=total_tasks,
        overall_accuracy=overall_accuracy,
        total_attempted=total_attempted,
        total_correct=total_correct,
        quote=quote,
        is_upsc=is_upsc,
    )


@app.route("/legal-question", methods=["POST"])
def legal_question():
    redir = _require_login()
    if redir:
        return redir
    phone, data = _get_current_user()
    data["daily_legal"] = {"date": date.today().isoformat(), "answer": request.form.get("answer")}
    storage.mark_active_today(data)
    _save_current_user(phone, data)
    return redirect(url_for("home"))


# ─────────────────────────────────────────────────────────────────────────────
# STUDY PLAN
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/study-plan", methods=["GET", "POST"])
def study_plan_view():
    redir = _require_login()
    if redir:
        return redir
    phone, data = _get_current_user()
    redir = _require_onboarding(data)
    if redir:
        return redir

    if request.method == "POST":
        action = request.form.get("action")
        if action == "regenerate":
            data["study_plan"] = study_plan.generate_fallback_plan(data["profile"])
            data["completed_tasks"] = []
            _save_current_user(phone, data)
            flash("Generated a fresh 8-week study plan.")
        elif action == "toggle":
            task_id = request.form.get("task_id")
            completed = data.setdefault("completed_tasks", [])
            if task_id in completed:
                completed.remove(task_id)
            else:
                completed.append(task_id)
                storage.mark_active_today(data)
            _save_current_user(phone, data)
        return redirect(url_for("study_plan_view"))

    plan = data.get("study_plan") or study_plan.generate_fallback_plan(data["profile"])
    completed = data.get("completed_tasks", [])
    total_tasks = sum(len(w["tasks"]) for w in plan["weeks"])
    progress_pct = round(100 * len(completed) / total_tasks) if total_tasks else 0

    return render_template(
        "study_plan.html",
        plan=plan,
        completed=completed,
        progress_pct=progress_pct,
        completed_count=len(completed),
        total_tasks=total_tasks,
        profile=data.get("profile"),
        phone=phone,
    )


# ─────────────────────────────────────────────────────────────────────────────
# MCQ PRACTICE
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/mcq", methods=["GET", "POST"])
def mcq():
    redir = _require_login()
    if redir:
        return redir
    phone, data = _get_current_user()
    redir = _require_onboarding(data)
    if redir:
        return redir

    quiz_day = storage.get_quiz_day()
    today_iso = date.today().isoformat()

    # Assign today's set (idempotent — only generates once per quiz_day)
    storage.get_daily_mcq_set(data, count=_mcq_count())
    daily = data["daily_mcq"]
    _save_current_user(phone, data)

    if request.method == "POST":
        action = request.form.get("action")
        if action == "submit" and not daily.get("submitted"):
            answers = {}
            for qid in daily["question_ids"]:
                val = request.form.get(f"answer_{qid}")
                if val is not None and val != "":
                    answers[qid] = int(val)
            daily["answers"] = answers
            daily["submitted"] = True

            stats = data.setdefault("mcq_stats", {})
            for qid, selected in answers.items():
                q = storage.MCQ_BY_ID[qid]
                topic = q["topic"]
                ts = stats.setdefault(topic, {"correct": 0, "total": 0})
                ts["total"] += 1
                is_correct = (selected == q["correctIndex"])
                if is_correct:
                    ts["correct"] += 1
                data.setdefault("mcq_history", []).append({
                    "date": today_iso, "question_id": qid,
                    "topic": topic, "selected": selected, "correct": is_correct,
                })

            storage.mark_active_today(data)
            _save_current_user(phone, data)

        return redirect(url_for("mcq"))

    questions = [storage.MCQ_BY_ID[qid] for qid in daily["question_ids"] if qid in storage.MCQ_BY_ID]
    score = None
    if daily.get("submitted"):
        answers = daily.get("answers", {})
        correct = sum(
            1 for qid, sel in answers.items()
            if storage.MCQ_BY_ID.get(qid, {}).get("correctIndex") == sel
        )
        score = {"correct": correct, "total": len(questions)}

    # Compute reset time for display (next 4 AM)
    from datetime import timedelta as _td
    now = datetime.now()
    if now.hour < 4:
        reset_at = now.replace(hour=4, minute=0, second=0, microsecond=0)
    else:
        reset_at = (now + _td(days=1)).replace(hour=4, minute=0, second=0, microsecond=0)
    hours_left = int((reset_at - now).total_seconds() // 3600)
    mins_left  = int(((reset_at - now).total_seconds() % 3600) // 60)

    return render_template(
        "mcq.html",
        questions=questions, daily=daily, score=score,
        stats=data.get("mcq_stats", {}),
        topics=storage.MCQ_TOPICS,
        profile=data.get("profile"),
        phone=phone,
        is_upsc=_is_upsc(),
        hours_left=hours_left,
        mins_left=mins_left,
        seen_total=len(data.get("seen_question_ids", [])),
        bank_total=len(storage.MCQ_BANK),
    )


# ── ANSWER WRITING ────────────────────────────────────────────────────────────

@app.route("/answers", methods=["GET", "POST"])
def answers():
    redir = _require_login()
    if redir: return redir
    phone, data = _get_current_user()
    redir = _require_onboarding(data)
    if redir: return redir

    today = date.today()
    today_iso = today.isoformat()
    prompt = storage.get_daily_answer_prompt(today)
    history = data.setdefault("answer_history", [])
    today_entry = next((a for a in history if a["date"] == today_iso and a["prompt_id"] == prompt["id"]), None)

    if request.method == "POST":
        text = request.form.get("answer_text", "").strip()
        ocr_used = False
        image_file = request.files.get("answer_image")
        if image_file and image_file.filename:
            extracted, err = ocr.extract_text(image_file.stream)
            if err:
                flash(err)
                return redirect(url_for("answers"))
            text = extracted
            ocr_used = True

        word_count = len(text.split()) if text else 0
        score = grading.score_answer(text, prompt)
        entry = {
            "date": today_iso, "prompt_id": prompt["id"],
            "paper": prompt["paper"], "question": prompt["question"],
            "word_limit": prompt["wordLimit"], "answer_text": text,
            "word_count": word_count, "score": score, "ocr_used": ocr_used,
        }
        if today_entry:
            history.remove(today_entry)
        history.append(entry)
        storage.mark_active_today(data)
        _save_current_user(phone, data)
        flash(f"Answer saved — scored {score['total']}/{score['max']}.")
        return redirect(url_for("answers"))

    return render_template(
        "answers.html",
        prompt=prompt, today_entry=today_entry,
        history=sorted(history, key=lambda a: a["date"], reverse=True)[:10],
        profile=data.get("profile"), phone=phone,
    )


# ── CURRENT AFFAIRS ───────────────────────────────────────────────────────────

@app.route("/current-affairs", methods=["GET", "POST"])
def current_affairs():
    redir = _require_login()
    if redir: return redir
    phone, data = _get_current_user()
    redir = _require_onboarding(data)
    if redir: return redir

    tab = request.args.get("tab", "week")
    if request.method == "POST":
        item_id = request.form.get("item_id")
        bookmarks = data.setdefault("bookmarked_affairs", [])
        if item_id in bookmarks:
            bookmarks.remove(item_id)
        else:
            bookmarks.append(item_id)
        _save_current_user(phone, data)
        return redirect(url_for("current_affairs", tab=tab))

    bookmarks = data.get("bookmarked_affairs", [])
    items = ([i for i in storage.CURRENT_AFFAIRS if i["id"] in bookmarks]
             if tab == "saved" else storage.get_weekly_current_affairs())

    return render_template(
        "current_affairs.html",
        items=items, tab=tab, bookmarks=bookmarks,
        profile=data.get("profile"), phone=phone,
    )


# ── PROFILE ───────────────────────────────────────────────────────────────────

@app.route("/profile", methods=["GET", "POST"])
def profile():
    redir = _require_login()
    if redir: return redir
    phone, data = _get_current_user()
    redir = _require_onboarding(data)
    if redir: return redir

    if request.method == "POST":
        data["profile"] = {
            "name": request.form.get("name", "").strip() or "Aspirant",
            "stage": request.form.get("stage", "beginner"),
            "target_year": request.form.get("target_year", "").strip(),
            "daily_hours": _parse_daily_hours(request.form.get("daily_hours")),
            "preferred_subjects": request.form.getlist("preferred_subjects"),
        }
        _save_current_user(phone, data)
        flash("Profile updated.")
        return redirect(url_for("profile"))

    return render_template(
        "profile.html",
        subjects=study_plan.SUBJECT_CATEGORIES,
        profile=data.get("profile"),
        streak=data.get("streak", {}),
        phone=phone,
    )


# ── ADMIN ─────────────────────────────────────────────────────────────────────

@app.route("/admin")
def admin():
    from collections import Counter
    users       = storage.get_all_user_summaries()
    topic_counts = Counter(q["topic"] for q in storage.MCQ_BANK)
    metrics     = storage.get_startup_metrics()
    return render_template(
        "admin.html",
        users=users,
        mcq_total=len(storage.MCQ_BANK),
        topic_counts=dict(topic_counts),
        metrics=metrics,
    )



# ── AI ASSISTANT ──────────────────────────────────────────────────────────────

@app.route("/assistant/chat", methods=["POST"])
def assistant_chat():
    from flask import jsonify
    import assistant as asst
    data_json = request.get_json(silent=True) or {}
    message   = data_json.get("message", "").strip()
    key, user_data = _get_current_user()
    result = asst.get_response(message, user_data)
    return jsonify(result)


# ── AVATAR SVG ENDPOINT ───────────────────────────────────────────────────────

@app.route("/avatar/svg/<avatar_id>")
def avatar_svg_route(avatar_id):
    from flask import Response
    import svg_avatars
    color = request.args.get("color", "#F4621F")
    svg = svg_avatars.get_avatar_svg(avatar_id, color)
    return Response(svg, mimetype="image/svg+xml",
                    headers={"Cache-Control": "public, max-age=3600"})


if __name__ == "__main__":
    app.run(debug=os.environ.get("FLASK_DEBUG", "false").lower() == "true")

# IAS Prep Companion — Improvement Implementation Spec

This document is a precise, machine-actionable specification for implementing 8 reliability/practice improvements on top of the existing Flask app at `C:\PROJECTS\The-IAS-AI`. It is written so an AI coding agent (or developer) can implement each feature without needing additional clarification.

## Global Constraints (apply to every feature below)

1. **Stay 100% offline.** No network calls, no new external API/AI dependencies. Only existing deps (`Flask`, `Pillow`, `pytesseract`) plus Python stdlib may be used. Timers/animations must be client-side JS only.
2. **Backward-compatible storage.** Every new key added to `DEFAULT_USER_DATA` in `storage.py` must be added so that `load_user_data()`'s existing merge-with-defaults loop (lines ~50-57) picks it up automatically for users with an old `user_data.json`. Do not write a separate migration step — rely on the existing `defaults.items()` merge pattern (extend nested-dict merging if a new key is itself a dict).
3. **Match existing code style.** Follow the patterns already in `app.py` (route structure, `storage.load_user_data()` / `storage.save_user_data()` calls, `flash()` messages, `redirect(url_for(...))`), `storage.py` (helper functions, `_deep_copy`), and templates (`{% extends "base.html" %}`, existing CSS classes in `static/css/style.css`, existing card/grid classes).
4. **No breaking changes.** All existing routes (`/`, `/onboarding`, `/dashboard`, `/legal-question`, `/study-plan`, `/mcq`, `/answers`, `/current-affairs`, `/profile`) must continue to work exactly as before unless a feature explicitly modifies them (noted below).
5. **Add nav links** for any new top-level page to `templates/base.html`'s `<nav class="nav-tabs">`, following the existing `{{ 'active' if request.endpoint == '...' else '' }}` pattern.
6. **Test every change** using `app.test_client()` the same way the existing audit was done (`PYTHONDONTWRITEBYTECODE=1`, fresh `storage._deep_copy(storage.DEFAULT_USER_DATA)` state, exercise GET/POST, check status codes and resulting `user_data.json` contents). Acceptance criteria are listed per feature.

---

## Feature 1 — Expand & Refresh Content Pools

**Why:** `data/mcq_bank.json` (~922 lines), `data/legal_questions.json` (34 lines), and `data/current_affairs.json` (99 lines) are small fixed pools. With 10 MCQs/day and date-seeded rotation, content repeats within weeks, and current affairs goes stale immediately.

### 1a. MCQ bank expansion
- File: `data/mcq_bank.json`. Schema unchanged: `{"topics": [...], "questions": [{"id": "qNNN", "topic": "...", "question": "...", "options": [...4 strings...], "correctIndex": 0-3, "explanation": "..."}]}`.
- Add new questions so **each topic in `topics` has at least 40 questions**, with unique sequential `id` values continuing from the highest existing `qNNN`.
- Keep `storage.MCQ_BY_ID`, `storage.MCQ_TOPICS`, `storage.get_daily_mcq_set()` unchanged — they already work generically over the list.

### 1b. Legal questions expansion
- File: `data/legal_questions.json`. Schema unchanged: `{"question", "options" (4), "correct_answer" ("A"-"D"), "explanation"}` per entry.
- Expand to **at least 60 entries** so `get_daily_legal_question()`'s `day_index % len(LEGAL_QUESTIONS)` doesn't repeat for ~2 months.

### 1c. Current affairs freshness indicator
- File: `data/current_affairs.json`. Schema unchanged: `{"id", "headline", "summary", "date" (YYYY-MM-DD), "tag"}`.
- New function in `storage.py`:
  ```python
  def current_affairs_age_days():
      """Days since the most recent current-affairs item's date."""
      if not CURRENT_AFFAIRS:
          return None
      latest = max(item["date"] for item in CURRENT_AFFAIRS)
      latest_date = datetime.fromisoformat(latest).date()
      return (date.today() - latest_date).days
  ```
- In `app.py`'s `dashboard()` and `current_affairs()` routes, compute `ca_age = storage.current_affairs_age_days()` and pass it to the templates.
- In `templates/dashboard.html` and `templates/current_affairs.html`, if `ca_age is not none and ca_age > 14`, show a small warning banner: `"Current affairs content is {{ ca_age }} days old — consider updating data/current_affairs.json."` Use existing `.flash`-style CSS class or a new `.stale-banner` class added to `static/css/style.css` (light amber background, consistent with existing color variables).

### Acceptance Criteria
- `len(storage.MCQ_BANK)` increases and every topic has ≥40 questions (`Counter(q["topic"] for q in storage.MCQ_BANK)`).
- `len(storage.LEGAL_QUESTIONS) >= 60`.
- `storage.current_affairs_age_days()` returns an int (or `None` if list empty) and the dashboard renders the banner when age > 14, and not when ≤ 14 (test by temporarily setting a recent date).

---

## Feature 2 — Weak-Topic Revision & Wrong-Answer Queue

**Why:** `mcq_stats` tracks per-topic accuracy but nothing acts on it. Missed questions are never resurfaced.

### Data model changes (`storage.py` `DEFAULT_USER_DATA`)
Add:
```python
"wrong_mcq_queue": [],   # list of question-id strings, most-recent-last, deduplicated
```

### `app.py` `/mcq` route changes (in the `action == "submit"` branch)
After computing `is_correct` for each `qid`:
```python
queue = data.setdefault("wrong_mcq_queue", [])
if is_correct:
    if qid in queue:
        queue.remove(qid)
else:
    if qid not in queue:
        queue.append(qid)
```
(Place this inside the existing per-question loop, alongside the `topic_stats`/`mcq_history` updates.)

### New route: `/mcq/revise`
- Methods: `GET`, `POST`.
- `GET`: 
  - Redirect to `/onboarding` if not onboarded (same guard as other routes).
  - If `data["wrong_mcq_queue"]` is empty, render `mcq_revise.html` with `questions=[]` and a friendly "no weak questions right now" message.
  - Otherwise build a `revise_set` = up to 10 questions from `storage.MCQ_BY_ID` for ids in `wrong_mcq_queue` (most recent first). Store this set in `data["mcq_revise"] = {"question_ids": [...], "answers": {}, "submitted": False}` (a separate dict from `daily_mcq`, NOT date-keyed — it's session-persistent until submitted) and save.
- `POST` (`action=="submit"`):
  - Grade the same way `/mcq` does (compare to `correctIndex`).
  - For each correctly-answered question, remove its id from `wrong_mcq_queue` (it's been "redeemed").
  - For incorrectly-answered ones, leave them in the queue (they stay for next time).
  - Update `mcq_stats`/`mcq_history` the same way the main `/mcq` route does (reuse logic — consider factoring the per-question stats update into a shared helper `_record_mcq_attempt(data, qid, selected, today_iso)` in `app.py` used by both routes).
  - Set `data["mcq_revise"]["submitted"] = True`, save, redirect to `/mcq/revise`.
- `GET` after submission: render results (correct/incorrect per question, like `mcq.html`), plus a button "Start a new revision set" that clears `data["mcq_revise"]` and redirects back to `/mcq/revise` (regenerating from the now-updated queue).

### New template: `templates/mcq_revise.html`
- Extend `base.html`. Mirror `mcq.html`'s structure (question cards, options, correct/incorrect styling, "Submit" / "New revision set" buttons). Add a header explaining: *"These are questions you got wrong before. Answer them again to clear them from your revision queue."*
- If `wrong_mcq_queue` is empty, show a congratulatory empty-state card.

### Dashboard changes (`templates/dashboard.html`, `app.py` `dashboard()`)
- Compute `weak_topics`: topics from `data.get("mcq_stats", {})` where `total >= 3` and `correct/total < 0.6`, sorted by accuracy ascending, top 3.
- Add a new card (reuse `.card` styling) titled **"Focus Areas"**:
  - If `weak_topics` non-empty: list topic names with their accuracy %, e.g. `"Environment & Ecology — 40% (2/5)"`.
  - If `data["wrong_mcq_queue"]` non-empty: show `"{{ wrong_mcq_queue|length }} questions in your revision queue"` with a link to `/mcq/revise`.
  - If both empty: `"No weak areas detected yet — keep practicing!"`.

### Nav
- Add `<a href="{{ url_for('mcq_revise') }}" class="...">Revise</a>` to `base.html` nav (endpoint name `mcq_revise` for the new route function).

### Acceptance Criteria
- Answering a question incorrectly on `/mcq` adds its id to `wrong_mcq_queue`; answering it correctly (anywhere) removes it.
- `/mcq/revise` GET with non-empty queue returns 200 and shows ≤10 questions whose ids are all in `wrong_mcq_queue`.
- `/mcq/revise` POST with all-correct answers empties (or shrinks) `wrong_mcq_queue` accordingly; `mcq_stats`/`mcq_history` totals increase.
- Dashboard renders the "Focus Areas" card without error when `mcq_stats` is empty (new user) and when populated.

---

## Feature 3 — Reference / Model-Answer Points

**Why:** The heuristic score (`grading.py`) can't tell a student what a *good* answer contains. A short list of expected points per prompt lets students self-evaluate.

### Data model changes (`data/answer_prompts.json`)
- Add a new key `"model_points"` (array of 4–6 short strings) to **every** prompt object, e.g.:
  ```json
  {
    "id": "ap-galwan",
    "paper": "GS2",
    "question": "...",
    "wordLimit": 150,
    "model_points": [
      "Define the issue/concept in 1-2 lines",
      "Mention 2-3 relevant constitutional articles or schemes",
      "Give at least one concrete example, data point, or recent event",
      "Discuss both positive impact and challenges/criticism",
      "End with a forward-looking conclusion (way forward)"
    ]
  }
  ```
- This is a **content-authoring task**: write 4-6 genuinely relevant points per prompt based on its `question` text and `paper` (GS1/GS2/GS3/GS4/Essay). Do this for all entries in `answer_prompts.json` (currently 565 lines — estimate the prompt count and budget authoring time accordingly).
- `storage.get_daily_answer_prompt()` requires no changes (still returns the full prompt dict, which now includes `model_points`).

### Template changes (`templates/answers.html`)
- In the prompt card (near `prompt.wordLimit`), add a collapsible section (use a native `<details>`/`<summary>` element — no JS needed):
  ```html
  <details class="model-points">
    <summary>What a strong answer should cover</summary>
    <ul>
      {% for point in prompt.model_points %}
      <li>{{ point }}</li>
      {% endfor %}
    </ul>
  </details>
  ```
  Place this **before** the textarea so students can read it while writing, or optionally after submission alongside the score card — implement it in the prompt card (visible always) since students should plan before writing.
- Add `.model-points` styling to `static/css/style.css` (collapsed by default via `<details>`'s native behavior, consistent border/padding with `.prompt-card`).

### Acceptance Criteria
- Every object in `data/answer_prompts.json` has a non-empty `model_points` array with 4-6 string items.
- `/answers` GET renders the model points for today's prompt without error (verify via `r.get_data(as_text=True)` containing the expected point text for the day's prompt).

---

## Feature 4 — Mock Test Modes (Prelims & Mains)

**Why:** Daily 10-question practice builds habit but doesn't simulate real exam pressure (timed, larger sets).

### 4a. Mock Prelims (`/mock/prelims`)
- New route, `GET`/`POST`, guarded by the same onboarding check.
- `GET` (no active mock): show a start screen — choose size via radio buttons: 25 / 50 / `min(100, len(MCQ_BANK))` questions, and fixed time = `questions * 1.2` minutes (UPSC pace ≈ 72 sec/question with negative marking buffer). Render `mock_prelims_start.html`.
- `POST` with `action=="start"`: 
  - `size = int(request.form.get("size", 25))`, clamp to `[10, len(MCQ_BANK)]`.
  - Randomly sample `size` unique questions from `storage.MCQ_BANK` (use `random.sample`).
  - Store in `data["mock_prelims"] = {"question_ids": [...], "answers": {}, "submitted": False, "started_at": <ISO datetime>, "duration_minutes": size*1.2}`. Save.
  - Redirect to `/mock/prelims` (now shows the in-progress test).
- `GET` (active, not submitted): render `mock_prelims_run.html` with all questions, radio inputs (`name="answer_{qid}"`), and a **client-side countdown timer** (JS, see below) computed from `started_at + duration_minutes`. A "Submit" button posts `action=="submit"`.
- `POST` with `action=="submit"`: grade all answered questions against `MCQ_BY_ID`, compute `correct`/`total`/`attempted`, append to `data["mock_history"]` (new default list):
  ```python
  {"date": today_iso, "type": "prelims", "size": size, "correct": correct,
   "attempted": attempted, "total": size, "time_taken_seconds": ...}
  ```
  Clear `data["mock_prelims"]`, call `storage.mark_active_today(data)`, save, flash result, redirect to `/mock/prelims` which now shows `mock_prelims_result.html` (last entry of `mock_history` where `type=="prelims"`).
- **Timer auto-submit:** in `static/js/main.js`, add a function that, given a `data-deadline` ISO timestamp attribute on the form, runs `setInterval` every second, updates a visible `#mock-timer` element with `MM:SS`, and calls `form.submit()` automatically when time reaches 0 (set `action` hidden input to `"submit"` first).

### 4b. Mock Mains (`/mock/mains`)
- New route, `GET`/`POST`.
- `GET` (no active mock): start screen explaining "5 prompts (GS1, GS2, GS3, GS4, Essay), 30 minutes total" → `mock_mains_start.html`.
- `POST action=="start"`: pick one prompt per paper from `ANSWER_PROMPTS` where `prompt["paper"] in {"GS1","GS2","GS3","GS4","Essay"}` (random choice per paper if multiple exist; skip papers with none available). Store:
  ```python
  data["mock_mains"] = {"prompt_ids": [...], "answers": {}, "submitted": False,
                          "started_at": <ISO>, "duration_minutes": 30}
  ```
- `GET` (active): render `mock_mains_run.html` — one `<textarea>` per prompt (labelled with paper + question + word limit), shared countdown timer (same JS mechanism as 4a).
- `POST action=="submit"`: for each prompt, run `grading.score_answer(text, prompt)`, store per-prompt results, append a summary to `data["mock_history"]`:
  ```python
  {"date": today_iso, "type": "mains", "prompts": [{"prompt_id":..., "paper":..., "score": {...}}],
   "total_score": sum, "max_score": sum, "time_taken_seconds": ...}
  ```
  Clear `data["mock_mains"]`, `mark_active_today`, save, redirect to result view (`mock_mains_result.html`).

### Data model changes (`storage.py` `DEFAULT_USER_DATA`)
```python
"mock_prelims": None,
"mock_mains": None,
"mock_history": [],
```

### Dashboard changes
- Add a **"Mock Tests"** card with two links ("Start Prelims Mock", "Start Mains Mock") and, if `mock_history` non-empty, the most recent result of each type (e.g., `"Last Prelims: 18/25 (72%)"`).

### Nav
- Add a "Mock Tests" link to `base.html` pointing at `/mock/prelims` (mains reachable from there or its own nav item — author's choice, but must be reachable within 1 click from nav or dashboard).

### Acceptance Criteria
- `/mock/prelims` POST `start` with `size=10` creates `mock_prelims` with exactly 10 unique question ids from `MCQ_BANK`.
- Submitting answers grades correctly against `MCQ_BY_ID[qid]["correctIndex"]` and appends one entry to `mock_history`.
- `/mock/mains` POST `start` selects ≤5 prompts (one per available paper) and submission scores each via `grading.score_answer`.
- Both flows clear their `mock_prelims`/`mock_mains` state after submission (so GET afterwards shows the start screen or last result, not a stale in-progress test).
- Timer JS auto-submits the form when the deadline passes (manually testable by setting `duration_minutes` very small in a test).

---

## Feature 5 — Adaptive Study Plan + "Today's Tasks"

**Why:** `daily_hours` is collected but never used; the dashboard shows overall % progress but never tells the student what to do *today*.

### `storage.py` `DEFAULT_USER_DATA` changes
```python
"onboarded_date": None,   # ISO date string, set when onboarding completes
```
Merge logic already handles new top-level keys.

### `app.py` `/onboarding` POST changes
After `data["onboarded"] = True`, add:
```python
data["onboarded_date"] = today.isoformat()  # `today = date.today()` already available
```

### `study_plan.py` `generate_fallback_plan(profile)` changes
- Read `daily_hours = (profile or {}).get("daily_hours", 4)`.
- Scale tasks per week:
  - `daily_hours <= 2`: only the 4 template tasks (drop the 2 "extra" generic tasks).
  - `3 <= daily_hours <= 5`: current behavior (4 template + 2 extra = 6 tasks). *(default/unchanged)*
  - `daily_hours >= 6`: 4 template + 2 extra + 1 additional task: `"Do an extra 30-minute revision session on {focus} using previous notes"`.
- **Assign each task a `day_of_week`** (0=Monday..6=Sunday) by distributing the week's tasks as evenly as possible across 7 days (e.g., for 6 tasks: days 0,1,2,3,4,5; for 4 tasks: days 0,2,4,6). Add `"day_of_week": <int>` to each task dict.
- Return value gains nothing structurally new besides the `day_of_week` field per task — `weeks`/`preferred_subjects` keys unchanged.

### New `storage.py` helper
```python
def get_current_plan_week(onboarded_date_iso):
    """1-indexed current week number (1-8, capped) since onboarding."""
    if not onboarded_date_iso:
        return 1
    start = datetime.fromisoformat(onboarded_date_iso).date()
    days_elapsed = (date.today() - start).days
    week = (days_elapsed // 7) + 1
    return max(1, min(8, week))

def get_today_tasks(plan, completed_tasks, onboarded_date_iso):
    """Return today's tasks (current week, matching weekday) with completion flag."""
    week_num = get_current_plan_week(onboarded_date_iso)
    weekday = date.today().weekday()  # 0=Mon
    week = next((w for w in plan["weeks"] if w["week"] == week_num), None)
    if not week:
        return []
    tasks = [t for t in week["tasks"] if t.get("day_of_week") == weekday]
    for t in tasks:
        t["done"] = t["id"] in completed_tasks
    return tasks
```

### `app.py` `dashboard()` changes
```python
today_tasks = storage.get_today_tasks(plan, completed, data.get("onboarded_date"))
```
Pass `today_tasks=today_tasks` to `render_template("dashboard.html", ...)`.

### `templates/dashboard.html` changes
- Add a new card **"Today's Tasks"** (place near the top, after the hero section):
  ```html
  <div class="card" style="margin-bottom: 24px;">
    <h3>Today's Tasks</h3>
    {% if today_tasks %}
    <ul class="task-list">
      {% for task in today_tasks %}
      <li class="task-item {{ 'completed' if task.done }}">
        <form class="task-toggle-form inline" method="post" action="{{ url_for('study_plan_view') }}">
          <input type="hidden" name="action" value="toggle">
          <input type="hidden" name="task_id" value="{{ task.id }}">
          <input type="checkbox" {{ 'checked' if task.done }} onchange="this.form.submit()">
        </form>
        <label>{{ task.text }}</label>
      </li>
      {% endfor %}
    </ul>
    {% else %}
    <p class="stat-sub">No specific tasks scheduled for today — check the <a href="{{ url_for('study_plan_view') }}">full plan</a>.</p>
    {% endif %}
  </div>
  ```
  (Reuses existing `.task-list`/`.task-item`/`.completed` CSS classes from `study_plan.html`'s styling — verify they exist in `static/css/style.css`; if scoped only to `.week-card`, generalize the selector.)
- Submitting the toggle form posts back to `/study-plan` (existing route, unchanged) and redirects to `study_plan_view` — after which the dashboard's checkbox state will reflect on next dashboard load. (Optional enhancement: change the toggle form's redirect target based on a hidden `return_to` field so it redirects back to `/dashboard` when toggled from there — only do this if straightforward; otherwise the current redirect to Study Plan page is acceptable.)

### Acceptance Criteria
- New users (`onboarded_date` set today) see week-1 tasks; `get_today_tasks` returns only tasks whose `day_of_week == date.today().weekday()`.
- `daily_hours=2` produces 4-task weeks; `daily_hours=4` produces 6-task weeks (current behavior); `daily_hours=8` produces 7-task weeks — verify via `study_plan.generate_fallback_plan({"daily_hours": X, ...})["weeks"][0]["tasks"]` length.
- Toggling a task from the dashboard's "Today's Tasks" card updates `completed_tasks` the same as toggling from `/study-plan`.
- `get_current_plan_week(None)` returns `1` (no crash for users without `onboarded_date`, e.g. pre-existing data).

---

## Feature 6 — Weekly Progress Snapshots / Trends

**Why:** Only cumulative totals are shown; students can't see whether they're improving week-over-week.

### `storage.py` `DEFAULT_USER_DATA` changes
```python
"weekly_snapshots": [],   # list of {"week_ending": ISO date, "mcq_accuracy": int|None,
                           #          "mcq_attempted": int, "answers_written": int,
                           #          "tasks_completed": int, "streak": int}
```

### New `storage.py` function
```python
def maybe_record_weekly_snapshot(data):
    """If 7+ days have passed since the last snapshot (or none exists),
    record a snapshot of current cumulative stats."""
    snapshots = data.setdefault("weekly_snapshots", [])
    today = date.today()
    if snapshots:
        last = datetime.fromisoformat(snapshots[-1]["week_ending"]).date()
        if (today - last).days < 7:
            return
    stats = data.get("mcq_stats", {})
    total_attempted = sum(s["total"] for s in stats.values())
    total_correct = sum(s["correct"] for s in stats.values())
    accuracy = round(100 * total_correct / total_attempted) if total_attempted else None
    snapshots.append({
        "week_ending": today.isoformat(),
        "mcq_accuracy": accuracy,
        "mcq_attempted": total_attempted,
        "answers_written": len(data.get("answer_history", [])),
        "tasks_completed": len(data.get("completed_tasks", [])),
        "streak": data.get("streak", {}).get("current", 0),
    })
```
Call `storage.maybe_record_weekly_snapshot(data)` once near the top of `dashboard()` in `app.py` (after `storage.load_user_data()`), before `save_user_data` is needed elsewhere — call `storage.save_user_data(data)` if a snapshot was actually appended (track via comparing list length before/after, or just always save — cheap for a local JSON file).

### New route `/progress`
- `GET` only, onboarding-guarded.
- Render `templates/progress.html` with `snapshots=data.get("weekly_snapshots", [])`.

### New template `templates/progress.html`
- Extend `base.html`.
- Render a simple table: columns "Week Ending", "MCQ Accuracy", "MCQs Attempted", "Answers Written", "Tasks Completed", "Streak".
- Additionally render a **CSS-only bar chart** for `mcq_accuracy` over time: a flex row of `<div>`s with `style="height: {{ snap.mcq_accuracy or 0 }}%"` inside a fixed-height container, each labeled with the week-ending date. Add `.trend-bar-container` / `.trend-bar` classes to `static/css/style.css`.
- If `snapshots` is empty, show: *"Check back after a week of use to see your trends."*

### Nav
- Add a "Progress" link to `base.html` nav → `/progress`.

### Acceptance Criteria
- First dashboard load after 7+ days (or with empty `weekly_snapshots`) appends exactly one snapshot; a second load on the same day does not append another.
- `/progress` GET returns 200 and renders the table/chart without error for both empty and populated `weekly_snapshots`.

---

## Feature 7 — Data Export / Import (Backup)

**Why:** All progress lives in one local JSON file with no backup mechanism.

### New route `/profile/export`
- `GET` only, onboarding-guarded.
- Read `storage.USER_DATA_FILE`, return it as a downloadable attachment:
  ```python
  from flask import send_file
  return send_file(
      storage.USER_DATA_FILE,
      mimetype="application/json",
      as_attachment=True,
      download_name=f"ias_prep_backup_{date.today().isoformat()}.json",
  )
  ```

### New route `/profile/import`
- `POST` only, onboarding-guarded.
- Accept `request.files.get("backup_file")`.
- Validation (all must pass, else `flash(...)` an error and `redirect(url_for("profile"))` without modifying data):
  1. File present and has a filename.
  2. File size ≤ 5 MB (read into memory, check `len(content)`).
  3. `json.loads(content)` succeeds (catch `json.JSONDecodeError`).
  4. Parsed result is a `dict` and contains at least the key `"onboarded"` (sanity check it's a real backup of this app's format).
- On success: merge the imported dict with `DEFAULT_USER_DATA` the same way `load_user_data()` does (reuse/extract that merge logic into a shared helper `storage._merge_with_defaults(data)` called by both `load_user_data()` and the import route), then `storage.save_user_data(merged)`, `flash("Data imported successfully.")`, redirect to `/dashboard`.
- **Never** `eval`/`exec` any part of the uploaded content — `json.loads` only.

### `templates/profile.html` changes
- Add a new section below the existing form:
  ```html
  <div class="card" style="margin-top: 24px;">
    <h3>Backup & Restore</h3>
    <p class="stat-sub">Export your progress as a file you can keep safe, and restore it later or on another computer.</p>
    <a href="{{ url_for('profile_export') }}" class="btn btn-outline btn-sm">Export my data</a>
    <form method="post" action="{{ url_for('profile_import') }}" enctype="multipart/form-data" style="margin-top: 12px;">
      <input type="file" name="backup_file" accept="application/json">
      <button type="submit" class="btn btn-outline btn-sm">Import data</button>
    </form>
  </div>
  ```

### Acceptance Criteria
- `/profile/export` GET returns a response with `Content-Disposition: attachment` and JSON content matching current `user_data.json`.
- `/profile/import` POST with a valid exported file restores that exact state (round-trip test: export, modify data, import, verify restored).
- `/profile/import` POST with a non-JSON file, an oversized file, or a JSON file missing `"onboarded"` is rejected with a flash message and does not alter `user_data.json`.

---

## Feature 8 — Streak Freeze

**Why:** A single missed day resets the streak to 1, which can be demotivating and doesn't reflect realistic study patterns (one busy day shouldn't erase weeks of consistency).

### `storage.py` `DEFAULT_USER_DATA["streak"]` changes
```python
"streak": {
    "current": 0,
    "longest": 0,
    "last_active": None,
    "freeze_available": True,
    "freeze_week_start": None,   # ISO date marking the start of the current freeze-eligibility week
},
```

### `storage.mark_active_today(data)` changes
Current logic resets `streak["current"] = 1` whenever `gap != 1`. New logic:
```python
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
        elif gap == 2 and streak.get("freeze_available", True):
            # Use the freeze: streak continues as if no day was missed
            streak["current"] = streak.get("current", 0) + 1
            streak["freeze_available"] = False
        else:
            streak["current"] = 1
    else:
        streak["current"] = 1

    streak["longest"] = max(streak.get("longest", 0), streak["current"])
    streak["last_active"] = today.isoformat()

    # Replenish the freeze weekly
    week_start = streak.get("freeze_week_start")
    if not week_start or (today - datetime.fromisoformat(week_start).date()).days >= 7:
        streak["freeze_available"] = True
        streak["freeze_week_start"] = today.isoformat()
```

### Template changes
- `templates/dashboard.html` and `templates/profile.html` (wherever the streak card is shown), add a line:
  ```html
  {% if streak.freeze_available %}
  <div class="stat-sub">🧊 1 streak freeze available this week</div>
  {% endif %}
  ```

### Acceptance Criteria
- Simulate: activity on day 1 (`current=1`), no activity day 2, activity on day 3 with `freeze_available=True` → `current=2`, `freeze_available=False` (verify by manipulating `last_active` to a date 2 days in the past before calling `mark_active_today`).
- A second 2-day gap (with `freeze_available=False`) resets `current=1` as before.
- `freeze_available` resets to `True` after 7 days from `freeze_week_start`.
- Existing 1-day-gap (consecutive day) behavior is unchanged (`current` increments by 1).

---

## Suggested Implementation Order (Phasing)

1. **Phase 1 (low effort, immediate value):** Feature 8 (streak freeze), Feature 7 (export/import), Feature 5 (today's tasks + adaptive plan).
2. **Phase 2 (moderate effort):** Feature 2 (weak-topic revision), Feature 6 (progress trends).
3. **Phase 3 (content-heavy / larger features):** Feature 1 (content expansion — ongoing), Feature 3 (model-answer points — content authoring for all prompts), Feature 4 (mock test modes — largest code addition).

## File Change Summary

| File | Features touching it |
|---|---|
| `storage.py` | 1c, 2, 4, 5, 6, 8 (new defaults/helpers, `mark_active_today` rewrite) |
| `app.py` | 1c, 2 (`/mcq`, new `/mcq/revise`), 4 (new `/mock/prelims`, `/mock/mains`), 5 (`/onboarding`, `dashboard()`), 6 (`dashboard()`, new `/progress`), 7 (new `/profile/export`, `/profile/import`) |
| `study_plan.py` | 5 (`generate_fallback_plan` scaling + `day_of_week`) |
| `grading.py` | 4 (reused as-is for mock mains scoring — no changes expected) |
| `data/mcq_bank.json` | 1a |
| `data/legal_questions.json` | 1b |
| `data/answer_prompts.json` | 3 |
| `templates/base.html` | 2, 4, 6 (nav links) |
| `templates/dashboard.html` | 1c, 2, 4, 5, 8 |
| `templates/answers.html` | 3 |
| `templates/profile.html` | 7, 8 |
| `templates/current_affairs.html` | 1c |
| New: `templates/mcq_revise.html` | 2 |
| New: `templates/mock_prelims_start.html`, `mock_prelims_run.html`, `mock_prelims_result.html` | 4 |
| New: `templates/mock_mains_start.html`, `mock_mains_run.html`, `mock_mains_result.html` | 4 |
| New: `templates/progress.html` | 6 |
| `static/css/style.css` | 1c (`.stale-banner`), 3 (`.model-points`), 6 (`.trend-bar*`) |
| `static/js/main.js` | 4 (countdown timer + auto-submit) |

## Final Verification

After implementing any subset of the above, run an end-to-end `app.test_client()` pass covering: every existing route (regression — must still return expected status codes), then each new/changed route's acceptance criteria listed per feature. Use a fresh `storage._deep_copy(storage.DEFAULT_USER_DATA)` state for clean-slate tests and a populated state (after onboarding + some MCQ/answer activity) for realistic tests.

# IAS Prep Companion — Test & Audit Report

Date: 2026-06-15
Scope: Full end-to-end test of every route (onboarding, dashboard, study plan, MCQ practice, answer writing + OCR/scoring, current affairs, profile), plus a code review of `app.py`, `storage.py`, `study_plan.py`, `grading.py`, `ocr.py`, and templates.

---

## 1. Bugs Found

### 1.1 Crash on non-numeric "daily hours" (High priority)
Both `/onboarding` and `/profile` do:

```python
"daily_hours": int(request.form.get("daily_hours") or 4),
```

If the field is empty `int()` falls back to 4, but if a user types anything non-numeric (e.g. "abc", "4 hrs"), `int()` raises `ValueError` and the page crashes with a 500 Internal Server Error. The "Daily hours" field is a free-text input with no client-side restriction, so a student typing the wrong thing here will see a server crash on Profile save or during onboarding.

**Fix:** validate/clean the input server-side (e.g. `try/except` with a fallback, or restrict the HTML input to `type="number"` *and* validate server-side since browsers can still submit non-numeric values).

### 1.2 No bounds-checking on "daily hours"
Negative (`-5`) and absurd (`999999`) values are accepted and saved without complaint. Not crash-causing, but it's stored and could show oddly anywhere it's displayed.

### 1.3 Current-affairs bookmark accepts any `item_id`
`/current-affairs` POST appends whatever `item_id` is submitted to `bookmarked_affairs` without checking it exists in `CURRENT_AFFAIRS`. A bad/garbage id just sits in the list forever (harmless, but it's dead data that never gets cleaned).

### 1.4 Legal "question of the day" can be marked answered with no answer
`/legal-question` POST saves `{"date": today, "answer": request.form.get("answer")}` even if `answer` is `None`. Once that's saved, `legal_answered_today` becomes `True` for the rest of the day — so if a user accidentally submits the form without selecting an option, they can't try again until tomorrow.

---

## 2. Things That Can Be Improved

- **`daily_hours` is collected but never used.** It's asked at onboarding and editable in Profile, but `study_plan.generate_fallback_plan()` never reads it — the plan is identical regardless of whether someone enters 2 hours or 12. Either use it (e.g. scale daily task count, or show a "recommended daily time" per week) or remove it to avoid setting a false expectation.
- **No confirmation before "Regenerate plan."** Regenerating wipes `completed_tasks` (all progress checkmarks) with no warning — easy to do by accident and lose a record of weeks of completed tasks.
- **`mcq_history` grows forever.** Every MCQ submission (including repeated "New set" practice rounds) is appended permanently to `user_data.json` with no cap or archiving. Over months of daily use the file will keep growing — not a big deal at small scale, but worth capping/rotating eventually.
- **`target_year` is a free-text field** with no validation — a student could enter "abcd" or leave it blank and nothing downstream checks it.
- **No reset/export option in the UI.** If a student wants to start over, back up their progress, or move to a new computer, there's no in-app way — they'd have to manually find and edit/delete `data/user_data.json`.
- **No upload size limit on the answer photo.** Flask has no `MAX_CONTENT_LENGTH` set, so a very large photo (e.g. a 20MB phone photo) will be accepted and run through OCR, which could be slow on an older laptop.
- **`debug=True`** is hard-coded in `app.run()`. Fine for local single-user use, but worth a comment/README note that this should stay `False` if the app is ever run somewhere reachable over a network (the Werkzeug debugger can execute arbitrary code).
- **OCR setup is a separate manual step** (installing the Tesseract binary on Windows and ensuring it's on PATH). The app degrades gracefully with a clear message if it's missing, which is good, but this is still the single biggest first-run friction point for non-technical students.

---

## 3. Demerits (Inherent Limitations)

- **Single device, no backup/sync.** All progress (streaks, MCQ stats, answer history, study plan) lives in one local JSON file. If the laptop is reformatted, lost, or the file gets corrupted, everything is gone. No cloud backup, no export.
- **Heuristic, not "real," answer scoring.** `grading.py` scores out of 10 based on word count, paragraph structure, keyword overlap with the question, and presence of numbers/example-markers. This is a useful first-pass nudge, but it can't judge actual analytical quality, factual accuracy, or argument coherence the way a human evaluator or an LLM would. Students should be told clearly (the app already does this in spirit) that this is a "checklist score," not a UPSC-standard evaluation — otherwise a high score on a weak answer (or vice versa) could mislead them.
- **OCR accuracy depends on handwriting and Tesseract quality.** Messy handwriting will produce garbled extracted text, which then feeds into the heuristic scorer and can produce a misleadingly low score — potentially discouraging for students who write by hand (the primary UPSC mode).
- **Static content pool.** MCQs, answer prompts, legal questions, and current affairs are all fixed JSON files with date-seeded rotation. Current affairs in particular will go stale unless someone periodically updates `current_affairs.json` — an app that's "current" only as of whenever it was last edited.
- **No multi-user/login.** By design (simple, offline), but means it can't be shared cleanly on a family/shared computer — one `user_data.json` = one person's data.

---

## 4. Suggestions for Getting Students to Start Using It

1. **Reduce first-run friction.** Package a short Windows setup guide (or a `.bat` script) that installs Python deps and walks through the Tesseract install — most drop-off will happen at "OCR isn't installed" if students hit that wall alone.
2. **Frame it as a daily habit, not a tool.** The streak counter, daily MCQ set, and daily answer prompt are the app's strongest hooks — market it as "10 minutes of MCQs + 1 answer a day" rather than a full study-planner replacement.
3. **Run a small pilot first.** Give it to 5–10 students for 1–2 weeks, specifically asking them to flag: (a) any crash/error screens, (b) whether the OCR scoring feels fair on real handwriting, (c) whether the study plan feels relevant to their prep stage.
4. **Set expectations on scoring up front.** Add a short note on the Answer Writing page (or onboarding) explaining the score is a "structure & coverage checklist," not a mentor's evaluation — this avoids both false confidence and discouragement.
5. **Keep current affairs fresh.** Since this is the most time-sensitive content, set a recurring reminder (weekly/biweekly) to update `current_affairs.json` — stale current affairs will be the fastest way to lose credibility with serious aspirants.
6. **Add a lightweight "reset/export" button** in Profile before wider rollout — students will ask for it, especially if they want to test the app and then start "for real."
7. **Fix the two crash-causing/edge-case bugs above (1.1–1.4) before sharing widely** — a 500 error on the Profile page during a student's first session is the kind of thing that kills adoption immediately.

---

## 5. What Already Works Well (Tested & Confirmed)

- Onboarding → dashboard → study plan → MCQ → answer writing → current affairs → profile, full navigation flow.
- Study plan toggle/untoggle, regenerate, progress percentage calculation.
- MCQ submit, no-double-count on resubmission, "New set" for extra practice, stats accumulate correctly by topic.
- Streak logic increments correctly on first activity of the day.
- Answer Writing: text submission, photo OCR submission (with graceful errors for non-image files and unreadable images), same-day answer replace-not-duplicate, scoring breakdown and feedback render correctly.
- XSS safety: answer text containing `<script>` tags is correctly HTML-escaped by Jinja's autoescaping — no injection risk from user-entered answers.
- Current affairs week/saved tab switching and bookmark toggle.

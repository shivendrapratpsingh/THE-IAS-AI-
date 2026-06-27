# IAS Prep Companion (Offline Web Edition)

A patriotic, fully offline UPSC Civil Services prep companion. This is now a
simple **Python (Flask) + HTML/CSS/JS** web app that runs entirely on your
own computer with a single command - no Node.js, Expo, or npm required.

## Features

- **Home / Dashboard** - greeting, study streak, today's MCQ score, answer
  writing status, overall accuracy, study plan progress, and a daily
  constitutional/legal MCQ.
- **Study Plan** - an 8-week offline plan generated from your prep stage,
  target year, daily hours, and preferred subjects (set during onboarding).
  Check off tasks as you complete them; progress is saved automatically.
  Regenerate anytime from the Study Plan page.
- **MCQ Practice** - 10 questions/day, deterministically rotated across
  Polity, History, Geography, Economy, Environment, Science, and Current
  Affairs (same set every day, even after restarting). Submit to see
  correct/incorrect answers with explanations, plus per-topic accuracy.
- **Answer Writing** - a new GS1-4/Essay prompt rotates in daily. Write your
  answer with a live word counter, or upload a photo of a handwritten
  answer to have its text extracted automatically via OCR. Every saved
  answer gets an offline auto-score out of 10 (length, structure,
  relevance, substantiation) with suggestions for improvement. History of
  your last 10 answers is shown below.
- **Current Affairs** - 14 curated current affairs items with UPSC relevance
  tags. Bookmark items to a "Saved" tab.

Everything works **completely offline** - no API key, no internet
connection, and no AI calls. The "auto-score" is a local rule-based
heuristic, not an AI model. All your data (profile, study plan progress,
MCQ stats/history, answers, bookmarks, streaks) is stored locally in
`data/user_data.json`.

## Getting Started

1. Make sure you have Python 3.8+ installed.
2. Install the Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. (Optional, for photo upload / OCR in Answer Writing) Install the
   **Tesseract OCR** engine - this is a separate program, not a Python
   package:
   - **Windows**: download and run the installer from
     [UB-Mannheim/tesseract](https://github.com/UB-Mannheim/tesseract/wiki),
     then make sure the install folder (e.g.
     `C:\Program Files\Tesseract-OCR`) is on your `PATH` (or add it to
     `PATH` during setup). Restart your terminal afterwards.
   - **macOS**: `brew install tesseract`
   - **Linux**: `sudo apt install tesseract-ocr`

   If Tesseract isn't installed, the rest of the app works fine - you'll
   just see a message when trying to upload a photo, and can type your
   answer instead.

4. Run the app:

   ```bash
   python app.py
   ```

5. Open your browser to **http://127.0.0.1:5000**

On first run you'll see a short onboarding form (name, prep stage, target
year, daily hours, preferred subjects). After that, your 8-week study plan
is generated automatically and you're taken to the dashboard.

## Project Structure

```
app.py                  Flask app - all routes/pages
storage.py              JSON-file storage layer + date-seeded content rotation
study_plan.py           Offline 8-week study plan generator
ocr.py                  Offline OCR (pytesseract) for handwritten answer photos
grading.py              Offline heuristic auto-scoring for answers

templates/
  base.html             Shared layout + navigation
  onboarding.html        First-run profile form
  dashboard.html          Home / dashboard
  study_plan.html         8-week plan + checklist
  mcq.html                Daily MCQ practice
  answers.html            Answer writing tracker
  current_affairs.html    Current affairs feed + bookmarks
  profile.html            Edit profile / preferences

static/
  css/style.css          Patriotic navy/saffron/green theme
  js/main.js              Word counter + checklist auto-submit
  images/                  icon, splash, favicon artwork

data/
  mcq_bank.json            70-question MCQ bank (7 topics x 10 questions)
  answer_prompts.json      94 GS1-4 / Essay prompts
  legal_questions.json     Fallback constitutional MCQs
  current_affairs.json     14 curated current affairs items
  user_data.json           Your local progress (created on first run)
```

## Theme

- Primary: Deep Navy `#1A2B4A`
- Accent: Saffron `#FF9933`
- Secondary accent: India Green `#138808`

## Notes on Daily Content

The daily MCQ set, daily answer prompt, and daily legal question are all
deterministically date-seeded (same formula as the original app), so
"today's" content stays the same across restarts and changes automatically
at midnight.

## Cleaning Up Old Files (optional)

This project was previously a React Native/Expo app. The new Flask app
(`app.py`, `storage.py`, `study_plan.py`, `templates/`, `static/`, plus the
`.json` files in `data/`) is self-contained and works on its own.

The following old files/folders are **no longer used** and can be safely
deleted once you close any editor/terminal that may still have them open
(some were locked while the Expo dev server was running):

```
app/  components/  hooks/  config/  constants/  utils/
node_modules/  .expo/
types.ts  package.json  package-lock.json  app.json
babel.config.js  tsconfig.json  test_write.txt
data/questions.ts  data/currentAffairs.ts  data/studyPlan.ts
```

Deleting them is optional - the Flask app does not read or depend on any of
them.

"""
BASS 50 AI Assistant — keyword-based response engine.
Knows all app features + live user data. Does NOT answer admin or off-topic queries.
"""
import random, json, os, re
from datetime import date

# ── App-knowledge base ───────────────────────────────────────────────────────
# Each entry: keywords (any match triggers), responses (one picked randomly),
# optional "action" for navigation, optional "data_fn" for live data injection.

KB = [
  # ── Navigation commands ────────────────────────────────────────────────────
  {
    "id": "nav_quiz",
    "keys": ["open quiz","start quiz","go quiz","quiz karo","quiz open","quiz start",
             "mcq","mcq open","practice","practice karo","questions","sawaal"],
    "action": {"type":"navigate","url":"/mcq"},
    "replies": ["Opening your quiz now! 🧠","Chalo, quiz shuru karte hain! 🎯","Quiz time! Taking you there →"]
  },
  {
    "id": "nav_news",
    "keys": ["open news","current affairs","news open","affairs","news karo",
             "current affairs open","khabar","samachar"],
    "action": {"type":"navigate","url":"/current-affairs"},
    "replies": ["Opening Current Affairs for you! 📰","Chalo news dekhte hain! 📰"]
  },
  {
    "id": "nav_study",
    "keys": ["study plan","open study","study karo","plan open","study schedule",
             "schedule","padhai ka plan","timetable"],
    "action": {"type":"navigate","url":"/study-plan"},
    "replies": ["Opening your Study Plan! 📅","Study plan aa gaya! 📅"]
  },
  {
    "id": "nav_answers",
    "keys": ["answer writing","writing practice","answers","likhna","essay",
             "answer open","writing open"],
    "action": {"type":"navigate","url":"/answers"},
    "replies": ["Opening Answer Writing practice! ✍️","Chalein likhna shuru karein! ✍️"]
  },
  {
    "id": "nav_home",
    "keys": ["home","home open","go home","ghar","dashboard","main page","homepage"],
    "action": {"type":"navigate","url":"/home"},
    "replies": ["Taking you home! 🏠","Home page aa gaya! 🏠"]
  },
  {
    "id": "nav_profile",
    "keys": ["profile","my profile","profile open","account","settings"],
    "action": {"type":"navigate","url":"/profile"},
    "replies": ["Opening your profile! 👤"]
  },
  {
    "id": "nav_avatar",
    "keys": ["change avatar","avatar change","avatar open","new avatar","avatar edit",
             "avatar badlo","assistant change","character change"],
    "action": {"type":"navigate","url":"/avatar"},
    "replies": ["Let's pick a new avatar! 🎭","Avatar selector aa gaya! 🎭"]
  },

  # ── Quiz / MCQ questions ───────────────────────────────────────────────────
  {
    "id": "quiz_howmany",
    "keys": ["how many questions","kitne questions","questions per day","daily questions",
             "question count","50 questions","10 questions"],
    "replies": [
      "UPSC mode gives you **50 random questions** per day from our bank of 143 real past-paper questions. General mode gives **10 questions**. Fresh set every 24 hours! 🎯",
      "You get **50 questions daily** in UPSC mode — all from actual UPSC papers (2013–2023). General users get 10. New questions every morning at midnight! 🌅"
    ]
  },
  {
    "id": "quiz_topics",
    "keys": ["which topics","kaunse topics","subject","subjects","polity","history",
             "geography","economy","environment","science","topic list"],
    "replies": [
      "The quiz bank covers **7 UPSC topics**:\n• Polity & Constitution\n• History (Ancient/Medieval/Modern)\n• Geography\n• Economy\n• Environment & Ecology\n• Science & Technology\n• Current Affairs\nAll from real UPSC papers 2013–2023! 📚",
      "Our 143-question bank spans: Polity, History, Geography, Economy, Environment, Science, and Current Affairs — all genuine UPSC past-paper questions with detailed explanations! 🎯"
    ]
  },
  {
    "id": "quiz_how",
    "keys": ["how to play","how quiz works","how to answer","quiz kaise","how to use quiz",
             "explain quiz","quiz explain","one question"],
    "replies": [
      "**How the quiz works:**\n1️⃣ One question appears at a time\n2️⃣ Tap any option to answer\n3️⃣ ✅ Green = correct, ❌ Red = wrong\n4️⃣ An explanation card pops up with full analysis\n5️⃣ Tap **Next →** to move on\n6️⃣ At the end, see your full score + topic breakdown! 🎯",
    ]
  },
  {
    "id": "quiz_explanation",
    "keys": ["explanation","explain answer","why correct","answer explain","kyu sahi",
             "popup","description after answer"],
    "replies": [
      "After every answer, an **explanation card** slides up showing:\n• ✅ Correct! or ❌ Wrong + what the right answer was\n• A detailed explanation of the topic\nThis way you learn even from wrong answers! 💡"
    ]
  },
  {
    "id": "quiz_new_set",
    "keys": ["new set","new questions","different questions","change questions",
             "naye questions","refresh quiz","reset quiz"],
    "replies": [
      "After finishing a quiz, tap the **🔀 New Set of Questions** button on the score screen to get a fresh random batch instantly! You can practice as many sets as you want. 🔄"
    ]
  },

  # ── Stats & streak ─────────────────────────────────────────────────────────
  {
    "id": "my_stats",
    "keys": ["my stats","my score","mera score","accuracy","meri accuracy",
             "how many correct","kitne sahi","my progress","progress"],
    "replies": ["__LIVE_STATS__"],   # replaced with live data
  },
  {
    "id": "streak",
    "keys": ["streak","fire","continuous days","consecutive","daily habit","chain",
             "kitne din","how many days","mera streak"],
    "replies": ["__LIVE_STREAK__"],  # replaced with live data
  },

  # ── Current Affairs ────────────────────────────────────────────────────────
  {
    "id": "affairs_how",
    "keys": ["how current affairs","current affairs work","news work","how news",
             "affairs explain","image in news","photo news"],
    "replies": [
      "**Current Affairs works like this:**\n📰 One article at a time — swipe through with Next/Prev\n🖼️ Topic image loads when you're online\n📝 Summary shown by default\n📖 Tap **Describe** for a full 200-word UPSC analysis\n🔖 Bookmark articles to read later! 14 articles updated regularly.",
    ]
  },
  {
    "id": "affairs_topics",
    "keys": ["what news","which affairs","affairs topics","news topics","latest affairs",
             "today news","aaj ki khabar"],
    "replies": [
      "We cover **14 current affairs articles** spanning: Energy & Environment, Polity & Governance, International Relations, Space Technology, Education, Economy, Internal Security, Government Schemes, Health, Defence, Digital Payments, Climate Change, Tribal Issues, and AI & Technology. All with UPSC-angle analysis! 📰"
    ]
  },
  {
    "id": "affairs_describe",
    "keys": ["describe button","full article","read more","full analysis","poora padhna",
             "describe kya hai"],
    "replies": [
      "The **Describe** button expands any article into a full ~200 word UPSC analysis — covering the background, key facts, government schemes, constitutional articles, and exam relevance. Great for answer writing prep! 📖"
    ]
  },
  {
    "id": "affairs_bookmark",
    "keys": ["bookmark","save article","save news","saved","favourites","later padhna"],
    "replies": [
      "Tap the 🔖 **bookmark button** on any article to save it. Switch to the **Saved** tab in Current Affairs to read your bookmarked articles anytime! ⭐"
    ]
  },

  # ── Language ───────────────────────────────────────────────────────────────
  {
    "id": "language",
    "keys": ["language","hindi","punjabi","tamil","translate","bhasha","change language",
             "language change","hinglish","regional","gujarati","marathi"],
    "replies": [
      "Tap the **🌐 button** in the top navigation bar. A panel opens with: 🇬🇧 English, 🇮🇳 Hindi, Hinglish, Punjabi, Tamil, Telugu, Marathi, Bengali.\n\nRequires internet. Your language choice is remembered across sessions! 🌐",
    ]
  },

  # ── Avatar ─────────────────────────────────────────────────────────────────
  {
    "id": "avatar_what",
    "keys": ["what is avatar","avatar kya hai","what assistant","which avatar",
             "ias officer avatar","police avatar","doctor avatar","character"],
    "replies": [
      "You can choose from **6 profession avatars**:\n🎖️ IAS Officer\n👮 Police Officer\n👩‍🏫 Teacher\n🧑‍⚕️ Doctor\n🔬 Scientist\n⚖️ Lawyer\n\nEach avatar can be customized with 10 outfit colors + a custom color picker! Your avatar appears on the Home screen and in the nav bar. 🎭",
    ]
  },
  {
    "id": "avatar_change",
    "keys": ["change avatar","new avatar","different avatar","edit avatar","color change",
             "outfit color","avatar color"],
    "replies": [
      "Open the **drawer menu (☰)** and tap **🎭 Change Avatar**. You can pick a different profession and customize the outfit color. Tap Save to update it everywhere! 🎭"
    ]
  },

  # ── Study Plan ─────────────────────────────────────────────────────────────
  {
    "id": "study_plan_what",
    "keys": ["study plan kya","what study plan","how study plan","plan explain",
             "weekly plan","8 week","padhai plan"],
    "replies": [
      "**Study Plan** gives you an **8-week structured UPSC schedule** tailored to your prep stage (Beginner/Preparing/Advanced/Revision). Tick off tasks as you complete them — your progress bar updates live. You can regenerate a fresh plan anytime! 📅"
    ]
  },
  {
    "id": "study_regenerate",
    "keys": ["regenerate plan","new plan","reset plan","change plan","fresh plan"],
    "replies": [
      "On the Study Plan page, scroll to the bottom and tap **Regenerate Plan** — it creates a fresh 8-week schedule and resets your task progress. Use this when you want to restart your prep! 🔄"
    ]
  },

  # ── Answer Writing ─────────────────────────────────────────────────────────
  {
    "id": "answer_what",
    "keys": ["answer writing kya","what answer writing","how answer writing",
             "essay writing","answer writing explain","writing practice"],
    "replies": [
      "**Answer Writing** gives you a new UPSC-style question every day (GS1/GS2/GS3/GS4). You can:\n✍️ Type your answer directly\n📷 Upload a photo of your handwritten answer (OCR reads it)\n\nYour answer is scored automatically and saved to your history. Great for Mains prep! 📝"
    ]
  },
  {
    "id": "answer_ocr",
    "keys": ["ocr","photo answer","handwritten","upload photo","scan answer",
             "image upload","camera"],
    "replies": [
      "Yes! You can **upload a photo of your handwritten answer** in the Answer Writing section. The app uses OCR to read your handwriting and scores it automatically. Just tap the 📷 camera icon! 📸"
    ]
  },

  # ── Login / Users ──────────────────────────────────────────────────────────
  {
    "id": "login_how",
    "keys": ["how login","login kaise","sign in","register","create account",
             "phone number login","otp","password"],
    "replies": [
      "**No OTP or password needed!** Just:\n1️⃣ Open the app → choose UPSC or General mode\n2️⃣ UPSC: enter your phone number → it creates a unique profile\n3️⃣ General: just enter your name → start instantly\n\nEach phone number = separate profile. Your data stays on this device! 📱"
    ]
  },
  {
    "id": "upsc_vs_general",
    "keys": ["upsc vs general","difference","upsc mode","general mode","which mode",
             "kaunsa mode","mode explain"],
    "replies": [
      "**UPSC Mode** 🎯\n• Phone number login\n• 50 questions/day\n• Full tracking: streak, accuracy, study plan, answer writing, current affairs\n\n**General Mode** 📚\n• Name only (no phone)\n• 10 questions/day\n• Basic stats tracking\n\nChoose UPSC if you're seriously preparing for civil services! 🏆"
    ]
  },
  {
    "id": "data_saved",
    "keys": ["data saved","mera data","where data","data kahan","offline","without internet",
             "internet chahiye","no internet"],
    "replies": [
      "All your data is **saved locally on this device** in a JSON file — no cloud, no internet required! Quiz scores, streak, bookmarks, study plan progress — all stored offline. The only things needing internet are: language translation (Google Translate) and article images (Unsplash). 💾"
    ]
  },

  # ── General app help ───────────────────────────────────────────────────────
  {
    "id": "app_overview",
    "keys": ["what is bass 50","bass 50 kya hai","what is this app","app explain",
             "app overview","ye app kya hai","help","kya kar sakta","features"],
    "replies": [
      "**BASS 50** is an offline IAS/UPSC prep companion! Here's what you can do:\n🧠 **Quiz** — 50 daily MCQs from real UPSC papers\n📰 **Current Affairs** — 14 articles with full analysis\n✍️ **Answer Writing** — daily Mains practice with scoring\n📅 **Study Plan** — 8-week structured schedule\n🎭 **AI Assistant** — that's me! Ask me anything about the app\n🌐 **Languages** — switch to Hindi, Tamil, Punjabi & more!",
    ]
  },
  {
    "id": "streak_how",
    "keys": ["how streak works","streak kaise","streak badhao","increase streak",
             "streak kaise bane","daily streak"],
    "replies": [
      "Your **streak** increases by 1 every day you're active — answering a quiz, completing a study task, or writing an answer all count! Missing even one day resets it to 0. Try to practice daily to keep your 🔥 alive! Check your streak on the Home page. 📅"
    ]
  },
  {
    "id": "legal_question",
    "keys": ["legal question","legal kya","daily legal","law question","legal section",
             "constitution question"],
    "replies": [
      "The **Daily Legal Question** on the Home page gives you one quick constitutional/legal question each day. Tap the correct option and your answer is recorded. It's a great way to strengthen your Polity/Law knowledge for GS2! ⚖️"
    ]
  },
]

# ── Off-topic / blocked ──────────────────────────────────────────────────────
BLOCKED_KEYS = ["admin","password","other users","user list","database","server",
                "weather","cricket","movie","song","recipe","joke","story",
                "politics","election","share market","stock","crypto","bitcoin",
                "religion","god","dating","love","fight","war","news channel"]

OFF_TOPIC_REPLIES = [
    "I'm your BASS 50 app assistant! I can only help with app features — quiz, current affairs, study plan, and more. Try asking: 'how does the quiz work?' 🎯",
    "That's outside my knowledge! I only know about the BASS 50 app. Ask me about the quiz, current affairs, streaks, avatars, or how to use any feature! 📚",
    "I'm focused on helping you with BASS 50 only. Questions about admin, other users, or unrelated topics are outside my scope. What can I help you with in the app? 🤖"
]

CANT_UNDERSTAND = [
    "Hmm, I'm not sure what you mean! Try asking about: quiz, current affairs, study plan, streak, avatar, or language. 🤔",
    "I didn't get that! You can ask me things like 'how many questions per day?' or 'open quiz' or 'how does streak work?' 💬",
    "Not sure I understood! Try a simpler question about the app — like 'what topics are in quiz?' or just say 'open quiz' to jump there! 🧠"
]

# ── Scorer ───────────────────────────────────────────────────────────────────
def _score(msg: str, keys: list) -> int:
    msg_l = msg.lower()
    score = 0
    for k in keys:
        if k in msg_l:
            score += len(k.split())   # longer phrase = higher weight
    return score

def _is_blocked(msg: str) -> bool:
    msg_l = msg.lower()
    return any(b in msg_l for b in BLOCKED_KEYS)

def get_response(message: str, user_data=None) -> dict:
    """
    Returns dict:
      { "text": str, "action": None | {"type":"navigate","url":str} }
    """
    msg = message.strip()
    if not msg:
        return {"text": random.choice(CANT_UNDERSTAND), "action": None}

    # Block check
    if _is_blocked(msg):
        return {"text": random.choice(OFF_TOPIC_REPLIES), "action": None}

    # Score all KB entries
    best_score = 0
    best_entry = None
    for entry in KB:
        s = _score(msg, entry["keys"])
        if s > best_score:
            best_score = s
            best_entry = entry

    if best_score == 0 or best_entry is None:
        return {"text": random.choice(CANT_UNDERSTAND), "action": None}

    # Build reply text
    reply_template = random.choice(best_entry["replies"])

    # Inject live user data
    if reply_template == "__LIVE_STATS__" and user_data:
        stats  = user_data.get("mcq_stats", {})
        total  = sum(s["total"]   for s in stats.values())
        correct= sum(s["correct"] for s in stats.values())
        acc    = round(100 * correct / total) if total else 0
        name   = user_data.get("profile", {}).get("name", "Aspirant")
        reply_template = (
            f"**{name}'s Stats:**\n"
            f"📊 Questions Attempted: {total}\n"
            f"✅ Correct Answers: {correct}\n"
            f"🎯 Overall Accuracy: {acc}%\n"
        )
        if stats:
            reply_template += "\n**Topic-wise:**\n"
            for topic, s in stats.items():
                t_acc = round(100 * s["correct"] / s["total"]) if s["total"] else 0
                emoji = "🟢" if t_acc >= 70 else ("🟡" if t_acc >= 40 else "🔴")
                reply_template += f"{emoji} {topic}: {t_acc}%\n"

    elif reply_template == "__LIVE_STREAK__" and user_data:
        streak = user_data.get("streak", {})
        cur    = streak.get("current", 0)
        longest= streak.get("longest", 0)
        name   = user_data.get("profile", {}).get("name", "Aspirant")
        reply_template = (
            f"**{name}'s Streak:**\n"
            f"🔥 Current Streak: {cur} day{'s' if cur != 1 else ''}\n"
            f"🏆 Longest Streak: {longest} day{'s' if longest != 1 else ''}\n\n"
            f"{'Amazing! Keep it up! 🚀' if cur >= 7 else 'Keep practicing daily to build your streak! 💪'}"
        )

    elif reply_template in ("__LIVE_STATS__", "__LIVE_STREAK__"):
        reply_template = "Log in first so I can show your personal stats! 📊"

    return {
        "text": reply_template,
        "action": best_entry.get("action")
    }

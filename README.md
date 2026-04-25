# ThinkSpace 🧠
> AI-powered knowledge workspace — upload documents, chat with AI, and unlock deep insights.

**Live Demo:** https://think-space-amber.vercel.app

## ✨ Features

### Core
- 📄 **Document Upload** — PDF, TXT, URL scraping
- 💬 **AI Chat** — Q&A with citations, powered by Groq + Llama 3.3 70B
- 📝 **Smart Summaries** — Structured summaries with key points
- 🗺️ **Mind Maps** — Visual knowledge maps
- 🃏 **Flashcards** — Flip cards with known/unknown tracking

### Unique AI Modes
- 🔍 **Insight Mode** — Finds hidden patterns, contradictions & connections
- ⚔️ **Debate Mode** — Two AI agents argue opposing perspectives
- 🎓 **Exam Mode** — Adaptive quizzes that focus on weak areas
- 📅 **Study Planner** — Personalized revision schedule
- 🎤 **Voice Q&A** — Speak questions, hear answers
- 📓 **Notes** — Color-coded sticky notes

### UX
- ELI5 / Normal / Expert explain modes
- Light theme with premium SaaS design
- Fully responsive

## 🛠 Tech Stack
- **Frontend:** Next.js 16, Tailwind CSS, ShadCN UI
- **AI:** Groq API (Llama 3.3 70B)
- **PDF Parsing:** pdf2json
- **State:** Zustand with persistence
- **Deploy:** Vercel

## 🚀 Run Locally
```bash
git clone https://github.com/drax369/ThinkSpace
cd ThinkSpace
npm install
# Add GROQ_API_KEY to .env.local
npm run dev
```

## 🔑 Environment Variables
```
GROQ_API_KEY=your_groq_api_key
NEXT_PUBLIC_APP_NAME=ThinkSpace
```
# 💖 LoveCraft.ai — Turn Memories Into Digital Love Stories ✨

> **The ultimate Gen-Z AI aesthetic website builder.** Create cinematic, high-vibe, interactive digital love stories, anniversary keepsakes, and romantic memory boxes in seconds. 🚀

[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=for-the-badge&logo=vercel)](https://lovecraft.ai)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Supabase RLS](https://img.shields.io/badge/Security-Supabase%20RLS%20Enforced-green?style=for-the-badge&logo=supabase)](https://supabase.com)

---

## ⚡ What is LoveCraft.ai?

LoveCraft.ai is like **Framer + Notion + Vercel**, but built specifically for lovers, besties, and memory hoarders. Drop in your couple names, special date, cute memory, and photos — and boom! 💥 You get a high-aesthetics, interactive, cinematic website hosted live on the web.

---

## 🚀 Main Features & Main Character Energy

### 🎨 1. Aesthetic Vibe Engine
- **Multiple Visual Themes**: Cosmic Love, Vintage Romance, Cyber Neon, Glassmorphism, Velvet Dark.
- **Cinematic Animations**: Smooth Lenis smooth-scroll, Framer Motion transitions, custom canvas particle backgrounds, and background music player.

### 🤖 2. Smart AI Blueprint Generator
- Uses Google Gemini & Groq LLM engines to automatically write personalized love stories, poetry, timeline milestones, and gallery captions based on your prompts.

### 📁 3. Unlimited Website Management
- **Draft Auto-Save**: Saves your progress every 30s so you never lose your work if your browser crashes.
- **Publish & Republish**: One-click deployment to global edge CDN.
- **Publish History & Rollback**: View every past deployment (Publish #1, Publish #2) and instant 1-click rollback!
- **Trash Bin**: Soft delete with 30-day recovery retention.
- **One-Click Export**: Export your love story as a static `.zip` bundle, standalone `.html` file, or React/Next.js `.jsx` component wrapper!

### 🔒 4. Enterprise Security & Isolation
- **Row Level Security (RLS)**: PostgreSQL strict isolation ensures User A can *never* view User B's dashboard or files.
- **Media Optimizer**: Auto-strips EXIF data, resizes images, and converts uploads to compressed WebP.
- **Binary Signature Check**: Blocks dangerous executables (`.exe`, `.sh`, `.bat`, `.dll`, `.js`, `.php`).

### 🔍 5. Automated AI SEO Engine
- Automatically generates page `<title>`, meta description, target keywords, Open Graph (`og:*`) previews, Twitter/X cards, and Schema.org JSON-LD structured data.
- Live **SEO Score (0–100)** badge on every dashboard card.

---

## 🛠️ Quickstart (Run Locally)

### Prerequisites
Make sure you have **Node.js 18+** or **Bun** installed.

```bash
# 1. Clone the repository
git clone https://github.com/astrondice/LoveCraftAi.git
cd LoveCraftAi

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open `http://localhost:3000` in your browser and start crafting! 🎉

---

## 🏗️ Tech Stack & Architecture

- **Frontend**: React 19, TanStack Router, Tailwind CSS, Lucide Icons
- **Animations**: Framer Motion, Lenis Smooth Scroll, Canvas FX
- **Backend & SSR**: TanStack Start, Nitro Server
- **Database & Auth**: Supabase (PostgreSQL with RLS), Google OAuth
- **State Management**: Zustand
- **Media & Storage**: Supabase Storage, WebP Canvas Compressor

---

## 📜 Database Migrations

All migrations live under `supabase/migrations/`:
- `001_initial_schema.sql` — Base tables for users, projects, websites.
- `006_production_hardening.sql` — RLS policies & storage folder isolation.
- `007_enterprise_features.sql` — Deployments history, trash bin, and user quotas.

---

## 🛡️ License

Crafted with 💖 by the **LoveCraft.ai Team**. All rights reserved.

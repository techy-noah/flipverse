# FlipVerse - Bible Quiz Flip-Card App

A mobile-first web application for learning the Bible through interactive flip cards. Built with Next.js, Tailwind CSS, and Supabase.

## Features

- **Flip-Card Quiz System** - Tap to flip cards, swipe to navigate
- **Deck-Based Learning** - 6 curated Bible categories
- **Progress Tracking** - Track mastered, learning, and new cards
- **Review Mistakes** - Revisit cards you marked as "Still Learning"
- **Daily Challenge** - 5 random questions each day
- **Dark Theme UI** - Optimized for mobile (360px+)

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **State**: React hooks + localStorage (client-side progress)
- **Animations**: CSS transitions (300ms Y-axis flip)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a Supabase project at https://supabase.com
2. Run the SQL schema from `supabase/schema.sql` in the SQL Editor
3. Copy your project URL and anon key

### 3. Environment variables

```bash
cp .env.example .env.local
```

Update `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run the development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Project Structure

```
FlipVerse/
├── src/
│   ├── app/
│   │   ├── (app)/
│   │   │   ├── decks/
│   │   │   │   ├── page.tsx          # Deck list
│   │   │   │   └── [id]/page.tsx     # Deck detail
│   │   │   ├── quiz/page.tsx         # Quiz session
│   │   │   ├── review/page.tsx       # Review mistakes
│   │   │   ├── daily/page.tsx        # Daily challenge
│   │   │   └── profile/page.tsx      # User profile
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx        # Login
│   │   │   └── signup/page.tsx       # Sign up
│   │   ├── api/
│   │   │   ├── auth/callback/        # Auth callback
│   │   │   ├── progress/             # Progress API
│   │   │   └── daily/                # Daily challenge API
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                       # Primitive components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── ProgressBar.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── BottomNav.tsx
│   │   ├── FlipCard.tsx              # Core flip card
│   │   └── DeckCard.tsx              # Deck display card
│   ├── hooks/
│   │   ├── useSupabase.ts
│   │   └── useProgress.ts
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── data/
│   │       ├── decks.ts
│   │       └── questions.ts
│   └── types/
│       ├── index.ts
│       └── database.types.ts
├── supabase/
│   └── schema.sql
├── middleware.ts
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
└── package.json
```

## Database Schema

Tables:
- `profiles` - User profiles (extends Supabase auth)
- `decks` - Quiz categories
- `questions` - Bible quiz questions
- `deck_questions` - Many-to-many deck-question mapping
- `user_progress` - Per-user question progress
- `daily_challenges` - Daily challenge assignments

## Deployment

Deploy to Vercel:

```bash
vercel
```

Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Content

The app ships with 72 curated Bible questions across 6 decks:
- Old Testament (12 questions)
- Life of Jesus (12 questions)
- Parables (8 questions)
- Commandments & Law (8 questions)
- Acts & Apostles (8 questions)
- Psalms & Wisdom (8 questions)

## License

MIT

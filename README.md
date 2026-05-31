# Intelligent Task Orchestrator

> A production-ready, AI-powered Kanban board built with React 19, Vite, TypeScript, Tailwind CSS v4, Supabase, and OpenRouter AI.

![Tech Stack](https://img.shields.io/badge/React-19-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss) ![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase)

---

## Features

- 📋 **Kanban Board** — Three-column board (To Do, In Progress, Done) with drag-and-drop via `@dnd-kit`
- 🤖 **Magic Generate** — OpenRouter AI generates 5 categorized, prioritized subtasks from a project title
- 🎯 **Project Management** — Create, edit, delete projects with a color picker from the header dropdown
- ✅ **Task Management** — Full CRUD for tasks with title, description, status, priority, and category
- 💾 **Supabase Persistence** — All changes sync to Supabase with optimistic updates
- 🎨 **Demo Mode** — Works with mock data when Supabase isn't configured
- 🔔 **Toast Notifications** — Success/error feedback for all operations
- 📱 **Responsive** — Works on mobile, tablet, and desktop

---

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd intelligent-task-orchestrator
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_OPENROUTER_API_KEY=sk-or-v1-xxxxxxxx
```

### 3. Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) → create a project
2. Open **SQL Editor** → paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Run the script

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes (for persistence) |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Yes (for persistence) |
| `VITE_OPENROUTER_API_KEY` | OpenRouter API key for AI features | Yes (for Magic Generate) |

> **Demo Mode:** If Supabase isn't configured, the app runs with mock data. A "Demo Mode" badge appears in the header.

---

## Project Structure

```
src/
├── components/
│   ├── ai/
│   │   └── MagicGenerate.tsx     # AI subtask generation modal
│   ├── kanban/
│   │   ├── KanbanBoard.tsx       # DnD context + column layout
│   │   ├── KanbanColumn.tsx      # Droppable column
│   │   ├── TaskCard.tsx          # Draggable task card
│   │   └── TaskForm.tsx          # Create/edit task modal
│   ├── layout/
│   │   └── Header.tsx            # App header with project selector
│   ├── projects/
│   │   └── ProjectForm.tsx       # Create/edit project modal
│   └── ui/                       # Reusable primitives
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── EmptyState.tsx
│       ├── FormFields.tsx
│       ├── Modal.tsx
│       ├── Spinner.tsx
│       └── Toast.tsx
├── hooks/
│   ├── useProjects.ts            # Projects CRUD with optimistic updates
│   ├── useTasks.ts               # Tasks CRUD + drag reorder
│   └── useToast.ts               # Toast notification state
├── lib/
│   ├── openrouter.ts             # OpenRouter AI service
│   ├── supabase.ts               # Supabase client
│   └── utils.ts                  # Utilities + config maps
├── types/
│   └── index.ts                  # All TypeScript interfaces
├── App.tsx                       # Root component
└── main.tsx                      # Entry point
```

---

## Deploy to Vercel

1. Push to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_OPENROUTER_API_KEY`
4. Deploy — the `vercel.json` handles SPA routing automatically

---

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19 | UI framework |
| TypeScript | 6 | Type safety |
| Vite | 8 | Build tool + dev server |
| Tailwind CSS | 4 | Styling |
| @dnd-kit | latest | Drag and drop |
| Supabase | latest | Database + realtime |
| OpenRouter | API | AI model gateway |
| lucide-react | latest | Icons |

---

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint check
```

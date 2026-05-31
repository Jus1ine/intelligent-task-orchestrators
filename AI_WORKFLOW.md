# Intelligent Task Orchestrator — Development & AI Workflow

This project was developed through a hybrid approach combining **AI-assisted software development** and **manual engineering & customization**. The collaborative workflow enabled rapid prototyping while ensuring production-ready architecture, customized UI/UX, and robust business logic.

---

## 1. AI-Assisted Work

AI tools were leveraged as a pair-programming partner to accelerate the development lifecycle. Key areas of AI contribution included:

* **Cursor IDE Scaffolding:** Leveraging Cursor to rapidly scaffold the initial React/Vite file structure, state management patterns using Custom Hooks (`useTasks`, `useProjects`), and the DnD-kit integration for the Kanban board.
* **Database & Backend Guidance:** Providing the initial Supabase setup, recommending standard PostgreSQL schemas, and configuring the `@supabase/supabase-js` client connection.
* **OpenRouter API Integration:** Scaffolding the `fetch` calls and environment variable setup for the Llama 3.1 8B model integration.
* **Prompt Engineering Strategies:** Drafting the initial system prompts to ensure the LLM returned structured, actionable JSON arrays for the Magic Generate feature.
* **Repetitive CRUD Generation:** Writing boilerplate state management, optimistic UI updates, and data mapping functions for the frontend models.
* **Documentation Drafting:** Creating initial README drafts and deployment checklists.

---

## 2. Manual Development & Customization

While AI generated the foundational blocks, significant manual engineering was required to refine, debug, and customize the application for a premium user experience:

* **Complete Manual UI/UX Design:** While AI suggested basic markup, **all of the application's design was done manually by the developer**. The premium glassmorphic aesthetic, tailored responsive layouts, curated color palettes, typography, hover states, and micro-animations were completely hand-crafted from scratch to ensure a premium feel.
* **Responsive Layout Engineering:** Extensive manual work was done to ensure a pixel-perfect desktop experience alongside a custom mobile layout. This included rewriting CSS grid/flex behaviors, converting the desktop modal into a native-feeling mobile "bottom sheet," and implementing a responsive stacking header.
* **Database Schema Refinement:** The AI-generated SQL schemas were manually audited and rewritten to match the exact TypeScript domain models (e.g., converting generic `status` enums to `completed`/`archived` boolean flags, adding JSONB subtask arrays).
* **Supabase Integration & Debugging:** The transition from `localStorage` to a fully live Supabase backend required manual rewriting of the custom hooks to ensure proper error handling, optimistic UI rollbacks, and the implementation of a custom Postgres RPC function (`reorder_tasks`) for efficient drag-and-drop syncing.
* **Application Flow & State Management:** Complex interactions, such as the drag-and-drop collision detection and tab-based filtering, were manually tuned to prevent race conditions and layout shifts.
* **Feature Testing & Validation:** Rigorous manual testing across breakpoints to ensure no overlapping content, proper z-index layering (e.g., modals over sticky headers), and functional CRUD operations.

---

## 3. Magic Generate Feature (Deep Dive)

The **Magic Generate** feature exemplifies the hybrid workflow. While AI assisted with the underlying API integration, the final implementation was heavily customized by the developer:

### The Concept
Magic Generate uses the OpenRouter API (running `meta-llama/llama-3.1-8b-instruct:free`) to automatically break down a project into 5 categorized, actionable subtasks based on the project's title and description.

### Developer Refinements
* **Resilient Parsing:** The developer implemented a defensive JSON parser (`parseSubtasks()`) that strips stray markdown fences and applies default fallbacks to prevent application crashes from hallucinated outputs.
* **UX Flow:** Instead of blindly inserting AI tasks, the workflow was designed to generate a **Preview UI** where users can review, edit titles, change categories, or remove specific AI-generated tasks before committing them to the database via a bulk-create operation.
* **Error Handling:** Robust error states were manually implemented to catch network timeouts, missing API keys, and rate limits, displaying user-friendly toast notifications.

---

## 4. AI Challenges & Human Resolutions

While AI significantly sped up development, it also introduced specific bugs that required manual intervention and architectural course-correction.

### Instance: Claude's Supabase Schema Mismatch
During the Supabase migration, Claude generated a buggy SQL schema (using a `title` column and a `status` enum) that fundamentally mismatched the application's actual TypeScript data models (which relied on `text`, `completed` booleans, and `archived` flags). 

* **The Problem:** Deploying the AI-generated SQL caused immediate runtime errors because the frontend was trying to write to columns that didn't exist in the database.
* **The Resolution:** Instead of relying on a follow-up prompt which might have further complicated the schema, the developer performed a **manual edit**. The SQL migration file (`001_initial_schema.sql`) was manually audited and rewritten by the developer to perfectly match the `src/types/index.ts` models, converting the enums to booleans and adding JSONB support for subtasks.

---

## 5. Development Efficiency Metrics

By employing this hybrid AI-human workflow, the development lifecycle saw significant efficiency gains, offset slightly by time spent debugging AI hallucinations:

* **Scaffolding Efficiency:** ~80% time saved on boilerplate generation (React setup, routing, hook structure) using Cursor.
* **API Integration:** ~60% time saved on OpenRouter / Supabase API wire-up.
* **Design & UX:** 0% time saved. The developer manually engineered 100% of the UI/UX design to meet premium quality standards.
* **Net Development Velocity:** Estimated **2.5x to 3x faster** overall compared to a purely manual development process, shrinking what would typically be a week-long project into a robust two-day sprint.

---

## 6. Development Timeline

The application was built over two highly focused sessions utilizing an iterative build-evaluate-refine loop:

* **Initial Implementation Session:**  
  *May 30, 2026 | 9:00 PM – 11:00 PM (Philippine Time)*  
  Focus: Core UI scaffolding, Kanban drag-and-drop mechanics, localStorage state management, and basic CRUD operations.

* **Continued Development Session:**  
  *May 31, 2026 | Starting at 8:00 PM (Philippine Time)*  
  Focus: Mobile responsiveness overhaul, Supabase backend migration, SQL schema alignment, OpenRouter "Magic Generate" integration, and final visual polish.

---

*This document serves as a record of the collaborative engineering process, demonstrating how AI can accelerate scaffolding while relying on human developer expertise for architecture alignment, UX perfection, and edge-case resolution.*

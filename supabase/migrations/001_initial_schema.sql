-- ============================================================
-- Intelligent Task Orchestrator — Complete Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Projects Table
-- Matches: src/types/index.ts → Project interface
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL
                CHECK (char_length(title) >= 2 AND char_length(title) <= 200),
  description TEXT
                CHECK (description IS NULL OR char_length(description) <= 1000),
  color       TEXT NOT NULL DEFAULT '#6366f1',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Tasks Table
-- Matches: src/types/index.ts → Task interface
-- NOTE: uses `text` (not `title`), `completed` + `archived`
--       booleans (not a `status` enum), and `subtasks` JSONB.
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  text        TEXT NOT NULL
                CHECK (char_length(text) >= 1 AND char_length(text) <= 500),
  description TEXT
                CHECK (description IS NULL OR char_length(description) <= 2000),
  category    TEXT
                CHECK (category IS NULL OR char_length(category) <= 100),
  position    INTEGER NOT NULL DEFAULT 0,
  completed   BOOLEAN NOT NULL DEFAULT false,
  archived    BOOLEAN NOT NULL DEFAULT false,
  image       TEXT,
  subtasks    JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Indexes (for common query patterns)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tasks_project_id
  ON tasks(project_id);

CREATE INDEX IF NOT EXISTS idx_tasks_project_position
  ON tasks(project_id, position);

CREATE INDEX IF NOT EXISTS idx_tasks_project_completed
  ON tasks(project_id, completed, archived);

CREATE INDEX IF NOT EXISTS idx_projects_created_at
  ON projects(created_at DESC);

-- ============================================================
-- Auto-update updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Row Level Security
-- Public policies — no authentication required.
-- Replace with user-scoped policies if you add Supabase Auth.
-- ============================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks    ENABLE ROW LEVEL SECURITY;

-- Projects
CREATE POLICY "Public read projects"
  ON projects FOR SELECT USING (true);
CREATE POLICY "Public insert projects"
  ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update projects"
  ON projects FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete projects"
  ON projects FOR DELETE USING (true);

-- Tasks
CREATE POLICY "Public read tasks"
  ON tasks FOR SELECT USING (true);
CREATE POLICY "Public insert tasks"
  ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update tasks"
  ON tasks FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete tasks"
  ON tasks FOR DELETE USING (true);

-- ============================================================
-- Bulk-reorder helper function
-- Called by useTasks.ts → reorderTasks() to update all
-- task positions in a single round-trip instead of N queries.
-- ============================================================
CREATE OR REPLACE FUNCTION reorder_tasks(updates JSONB)
RETURNS void AS $$
DECLARE
  rec JSONB;
BEGIN
  FOR rec IN SELECT * FROM jsonb_array_elements(updates)
  LOOP
    UPDATE tasks
    SET    position   = (rec->>'position')::INTEGER,
           updated_at = now()
    WHERE  id = (rec->>'id')::UUID;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

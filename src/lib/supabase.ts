import { createClient } from '@supabase/supabase-js';
import type { Project, Task } from '../types';

// ============================================================
// Supabase Database Type Map
// Mirrors supabase/migrations/001_initial_schema.sql exactly.
// ============================================================
export interface Database {
  public: {
    Tables: {
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Functions: {
      reorder_tasks: {
        Args: { updates: { id: string; position: number }[] };
        Returns: void;
      };
    };
  };
}

// ============================================================
// Environment variable validation
// ============================================================
const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Supabase] VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in your .env file.\n' +
    'Copy .env.example → .env and fill in your Supabase project credentials.'
  );
}

// ============================================================
// Supabase Client (singleton)
// ============================================================
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // No auth required for this app (public RLS policies).
    // Set persistSession: true and autoRefreshToken: true
    // if you add Supabase Auth in the future.
    persistSession: false,
    autoRefreshToken: false,
  },
});

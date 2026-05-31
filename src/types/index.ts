// ============================================================
// Core Domain Types
// ============================================================

export type Status = 'todo' | 'in_progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';
export type ProjectColor =
  | '#6366f1'
  | '#8b5cf6'
  | '#ec4899'
  | '#f97316'
  | '#10b981'
  | '#0ea5e9'
  | '#f59e0b'
  | '#ef4444';

// ============================================================
// Database Models
// ============================================================

export interface Project {
  id: string;
  title: string;
  description?: string | null;
  color: ProjectColor | string;
  created_at: string;
  updated_at: string;
}

export interface Subtask {
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  project_id: string;
  text: string;           // Renamed from title
  description?: string;
  position: number;
  completed: boolean;
  archived: boolean;
  image?: string | null;
  subtasks?: Subtask[];
  created_at: string;
  updated_at: string;
}

// ============================================================
// Form / Mutation DTOs
// ============================================================

export type CreateProjectDTO = Pick<Project, 'title' | 'color'> &
  Partial<Pick<Project, 'description'>>;

export type UpdateProjectDTO = Partial<CreateProjectDTO>;

export type TaskInsert = Omit<Task, 'id' | 'created_at' | 'updated_at'>;
export type TaskUpdate = Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>;

// ============================================================
// AI Types
// ============================================================

export interface GeneratedSubtask {
  title: string;
  description: string;
  category: string;
  priority: Priority;
}

// ============================================================
// UI State Types
// ============================================================

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface KanbanColumn {
  id: Status;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
}

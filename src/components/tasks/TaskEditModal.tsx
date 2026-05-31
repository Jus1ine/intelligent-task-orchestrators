import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea, Select } from '../ui/FormFields';
import type { Task } from '../../types';

// ============================================================
// Status helper — maps UI status string ↔ Task boolean flags
// ============================================================

type TaskStatus = 'todo' | 'in_progress' | 'done';

function getStatusFromTask(task: Task): TaskStatus {
  if (task.archived) return 'done';
  if (task.completed) return 'in_progress';
  return 'todo';
}

function getTaskFlagsFromStatus(status: TaskStatus): { completed: boolean; archived: boolean } {
  switch (status) {
    case 'in_progress': return { completed: true, archived: false };
    case 'done':        return { completed: false, archived: true };
    case 'todo':
    default:            return { completed: false, archived: false };
  }
}

const STATUS_OPTIONS = [
  { value: 'todo',        label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done',        label: 'Done' },
];

const CATEGORY_OPTIONS = [
  { value: 'Planning',    label: 'Planning' },
  { value: 'Design',      label: 'Design' },
  { value: 'Development', label: 'Development' },
  { value: 'Testing',     label: 'Testing' },
  { value: 'Deployment',  label: 'Deployment' },
];

// ============================================================
// Props
// ============================================================

interface TaskEditModalProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Task>) => Promise<void>;
}

// ============================================================
// Component
// ============================================================

export function TaskEditModal({ open, task, onClose, onSave }: TaskEditModalProps) {
  const [title, setTitle]       = useState('');
  const [description, setDesc]  = useState('');
  const [category, setCategory] = useState('Development');
  const [status, setStatus]     = useState<TaskStatus>('todo');
  const [saving, setSaving]     = useState(false);
  const [errors, setErrors]     = useState<{ title?: string }>({});

  // Pre-fill when task changes or modal opens
  useEffect(() => {
    if (task && open) {
      setTitle(task.text ?? '');
      setDesc(task.description ?? '');
      setCategory((task as any).category ?? 'Development');
      setStatus(getStatusFromTask(task));
      setErrors({});
    }
  }, [task, open]);

  const validate = (): boolean => {
    const errs: { title?: string } = {};
    if (!title.trim()) errs.title = 'Task title is required.';
    else if (title.trim().length < 2) errs.title = 'Title must be at least 2 characters.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !validate()) return;

    setSaving(true);
    try {
      const flags = getTaskFlagsFromStatus(status);
      await onSave(task.id, {
        text: title.trim(),
        description: description.trim() || undefined,
        ...flags,
        // Store category as a custom field — cast so TS doesn't complain
        ...(({ category: category } as any)),
      });
      onClose();
    } catch {
      // Error handled by parent via toast
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Task"
      description="Update the task details below."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={saving}
            onClick={handleSave as unknown as React.MouseEventHandler<HTMLButtonElement>}
          >
            Save Changes
          </Button>
        </>
      }
    >
      <form onSubmit={handleSave} className="space-y-4">
        {/* Title */}
        <Input
          label="Task Title"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          required
          autoFocus
        />

        {/* Description */}
        <Textarea
          label="Description"
          placeholder="Add more details… (optional)"
          value={description}
          onChange={(e) => setDesc(e.target.value)}
          rows={3}
        />

        {/* Category + Status row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={CATEGORY_OPTIONS}
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            options={STATUS_OPTIONS}
          />
        </div>
      </form>
    </Modal>
  );
}

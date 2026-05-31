import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/FormFields';
import { PROJECT_COLORS } from '../../lib/utils';
import { cn } from '../../lib/utils';
import type { Project, CreateProjectDTO } from '../../types';
import { Check } from 'lucide-react';

// ============================================================
// Project Form Modal
// ============================================================

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProjectDTO) => Promise<void>;
  editProject?: Project | null;
}

export function ProjectForm({ open, onClose, onSubmit, editProject }: ProjectFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState<string>(PROJECT_COLORS[0]);
  const [errors, setErrors] = useState<{ title?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill when editing
  useEffect(() => {
    if (editProject) {
      setTitle(editProject.title);
      setDescription(editProject.description ?? '');
      setColor(editProject.color);
    } else {
      setTitle('');
      setDescription('');
      setColor(PROJECT_COLORS[0]);
    }
    setErrors({});
  }, [editProject, open]);

  const validate = (): boolean => {
    const newErrors: { title?: string } = {};
    if (!title.trim()) newErrors.title = 'Project title is required';
    else if (title.trim().length < 2) newErrors.title = 'Title must be at least 2 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), description: description.trim() || undefined, color });
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editProject ? 'Edit Project' : 'New Project'}
      description={editProject ? 'Update your project details.' : 'Create a new project to organize your tasks.'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={submitting}
            onClick={handleSubmit as unknown as React.MouseEventHandler<HTMLButtonElement>}
          >
            {editProject ? 'Save Changes' : 'Create Project'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Project Title"
          placeholder="e.g. E-Commerce Platform"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          required
          autoFocus
        />

        <Textarea
          label="Description"
          placeholder="What is this project about? (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        {/* Color Picker */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Color</label>
          <div className="flex items-center gap-2 flex-wrap">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  'w-8 h-8 rounded-full transition-all duration-150',
                  'flex items-center justify-center',
                  color === c
                    ? 'ring-2 ring-offset-2 ring-slate-400 scale-110'
                    : 'hover:scale-110 hover:ring-2 hover:ring-offset-2 hover:ring-slate-300'
                )}
                style={{ backgroundColor: c }}
                title={c}
              >
                {color === c && <Check size={14} className="text-white drop-shadow" />}
              </button>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}

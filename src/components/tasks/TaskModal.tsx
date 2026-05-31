import { useState, useEffect } from 'react';
import { Sparkles, Trash2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea, Select } from '../ui/FormFields';
import { generateSubtasks } from '../../lib/openrouter';
import type { Task, GeneratedSubtask } from '../../types';

// ============================================================
// Status Helpers
// ============================================================

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export function getStatusFromTask(task: Task): TaskStatus {
  if (task.archived) return 'done';
  if (task.completed) return 'in_progress';
  return 'todo';
}

export function getTaskFlagsFromStatus(status: TaskStatus): { completed: boolean; archived: boolean } {
  switch (status) {
    case 'in_progress': return { completed: true, archived: false };
    case 'done':        return { completed: false, archived: true };
    case 'todo':
    default:            return { completed: false, archived: false };
  }
}



const CATEGORY_OPTIONS = [
  { value: 'Planning',    label: 'Planning' },
  { value: 'Design',      label: 'Design' },
  { value: 'Development', label: 'Development' },
  { value: 'Testing',     label: 'Testing' },
  { value: 'Deployment',  label: 'Deployment' },
  { value: 'Research',    label: 'Research' },
  { value: 'Marketing',   label: 'Marketing' },
  { value: 'Operations',  label: 'Operations' },
  { value: 'Analytics',   label: 'Analytics' },
  { value: 'Content',     label: 'Content' },
];

// ============================================================
// Props
// ============================================================

interface TaskModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  task?: Task | null; // provided in edit mode
  projectTitle?: string; // used for AI generation context
  projectDescription?: string | null;
  onClose: () => void;
  // Submit handlers
  onCreate?: (data: Partial<Task>) => Promise<void>;
  onUpdate?: (id: string, updates: Partial<Task>) => Promise<void>;
  onBulkCreate?: (tasks: Partial<Task>[]) => Promise<void>;
  onError?: (msg: string) => void;
}

// ============================================================
// Component
// ============================================================

export function TaskModal({
  open,
  mode,
  task,
  projectTitle = 'Project',
  projectDescription,
  onClose,
  onCreate,
  onUpdate,
  onBulkCreate,
  onError,
}: TaskModalProps) {
  // Manual Form State
  const [title, setTitle] = useState('');
  const [description, setDesc] = useState('');
  const [category, setCategory] = useState('Development');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [errors, setErrors] = useState<{ title?: string }>({});
  
  // Loading & View State
  const [saving, setSaving] = useState(false);
  const [savingBulk, setSavingBulk] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [magicError, setMagicError] = useState(false);
  const [generated, setGenerated] = useState<GeneratedSubtask[]>([]);

  // Reset/Prefill on open
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && task) {
        setTitle(task.text ?? '');
        setDesc(task.description ?? '');
        setCategory((task as any).category ?? 'Development');
        setStatus(getStatusFromTask(task));
      } else {
        setTitle('');
        setDesc('');
        setCategory('Development');
        setStatus('todo');
      }
      setErrors({});
      setGenerated([]);
      setSaving(false);
      setSavingBulk(false);
      setMagicLoading(false);
      setMagicError(false);
    }
  }, [open, mode, task]);

  const handleStatusWorkflowClick = async (newStatus: TaskStatus) => {
    setStatus(newStatus);
    if (mode === 'edit' && task && onUpdate) {
      try {
        const flags = getTaskFlagsFromStatus(newStatus);
        await onUpdate(task.id, flags);
      } catch (err: any) {
        onError?.(err.message || 'Failed to update status.');
      }
    }
  };

  const renderStatusWorkflow = () => {
    let actionLabel = '';
    let nextStatus: TaskStatus = 'todo';
    let icon = null;

    if (status === 'todo') {
      actionLabel = 'Mark as In Progress';
      nextStatus = 'in_progress';
      icon = <div className="w-4 h-4 rounded border border-slate-400 bg-white mr-2 flex-shrink-0" />;
    } else if (status === 'in_progress') {
      actionLabel = 'Mark as Done';
      nextStatus = 'done';
      icon = <div className="w-4 h-4 rounded border border-slate-400 bg-white mr-2 flex-shrink-0" />;
    } else if (status === 'done') {
      actionLabel = 'Restore to To Do';
      nextStatus = 'todo';
      // simple lucid-react-like refresh icon
      icon = (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-slate-500">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
        </svg>
      );
    }

    return (
      <div className="status-workflow mt-2 col-span-2 sm:col-span-1">
        <label className="block text-sm font-medium text-slate-700 mb-2">Workflow Stage</label>
        <button
          type="button"
          onClick={() => handleStatusWorkflowClick(nextStatus)}
          className="flex items-center w-full bg-white hover:bg-slate-50 p-2.5 rounded-lg border border-slate-200 transition-colors shadow-sm text-slate-700 font-medium text-sm text-left"
        >
          {icon}
          {actionLabel}
        </button>
      </div>
    );
  };

  // ----------------------------------------------------------
  // Handlers: Manual Create / Edit
  // ----------------------------------------------------------
  const validate = (): boolean => {
    const errs: { title?: string } = {};
    if (!title.trim()) errs.title = 'Task title is required.';
    else if (title.trim().length < 2) errs.title = 'Title must be at least 2 characters.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveSingle = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const flags = getTaskFlagsFromStatus(status);
      const data = {
        text: title.trim(),
        description: description.trim() || undefined,
        category,
        ...flags,
      };

      if (mode === 'edit' && task && onUpdate) {
        await onUpdate(task.id, data);
      } else if (mode === 'create' && onCreate) {
        await onCreate(data);
      }
      
      // If we also had generated tasks, maybe the user wanted them saved too? 
      // We will let "Add All Generated Tasks" handle that instead to be clear.
      onClose();
    } catch (err: any) {
      onError?.(err.message || 'Failed to save task.');
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------------------------
  // Handlers: Magic Generate (AI)
  // ----------------------------------------------------------
  const handleMagicGenerate = async () => {
    setMagicLoading(true);
    setMagicError(false);
    try {
      const res = await generateSubtasks(projectTitle, projectDescription);
      setGenerated(res);
    } catch (err: any) {
      setMagicError(true);
      const msg = err?.message ?? 'AI generation failed';
      if (msg.includes('VITE_OPENROUTER_API_KEY')) {
        onError?.('Magic Generate requires an OpenRouter API key in your .env file.');
      }
    } finally {
      setMagicLoading(false);
    }
  };

  const handleUpdateGeneratedTitle = (index: number, newTitle: string) => {
    const updated = [...generated];
    updated[index].title = newTitle;
    setGenerated(updated);
  };

  const handleRemoveGenerated = (index: number) => {
    const updated = [...generated];
    updated.splice(index, 1);
    setGenerated(updated);
  };

  const handleSaveBulk = async () => {
    if (generated.length === 0) return;
    
    // Validate all generated titles
    const hasEmpty = generated.some((g) => !g.title.trim());
    if (hasEmpty) {
      onError?.('All AI tasks must have a title.');
      return;
    }

    setSavingBulk(true);
    try {
      const taskInputs = generated.map((g) => ({
        text: g.title.trim(),
        description: g.description,
        category: g.category,
        completed: false,
        archived: false,
        image: null,
        subtasks: [],
      }));

      if (onBulkCreate) {
        await onBulkCreate(taskInputs as any);
      }
      onClose();
    } catch (err: any) {
      onError?.(err.message || 'Failed to save AI tasks.');
    } finally {
      setSavingBulk(false);
    }
  };

  // ============================================================
  // Render
  // ============================================================

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'edit' ? "Edit Task" : "Create Task"}
      size="md"
      footer={
        <div className="flex w-full items-center justify-between">
          <Button variant="ghost" onClick={onClose} disabled={saving || savingBulk}>
            Cancel
          </Button>
          <div className="flex gap-2">
            {generated.length > 0 && (
              <Button variant="primary" loading={savingBulk} disabled={saving} onClick={handleSaveBulk}>
                Add Generated Tasks
              </Button>
            )}
            <Button variant={generated.length > 0 ? "outline" : "primary"} loading={saving} disabled={savingBulk} onClick={handleSaveSingle}>
              {mode === 'edit' ? 'Save Changes' : 'Save Task'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Task Title */}
        <Input
          label="Task Title"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          required
          autoFocus
        />

        {/* ✨ Magic Generate Button directly below title */}
        <div className="pt-1">
          <Button
            variant="secondary"
            className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 justify-center shadow-sm"
            icon={<Sparkles size={16} />}
            loading={magicLoading}
            onClick={handleMagicGenerate}
            type="button"
          >
            ✨ Magic Generate
          </Button>
        </div>

        {/* Magic Error State */}
        {magicError && (
          <div className="my-6 p-5 border border-rose-100 bg-rose-50 rounded-xl flex flex-col items-center text-center">
            <h3 className="text-[15px] font-semibold text-rose-900 mb-2">⚠️ Unable to generate subtasks right now.</h3>
            <p className="text-sm text-rose-700 mb-4 px-2">
              The AI service is temporarily unavailable. Please try again in a few moments.
            </p>
            <Button variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-100 bg-white" onClick={handleMagicGenerate}>
              Try Again
            </Button>
          </div>
        )}

        {/* Description */}
        <Textarea
          label="Description"
          placeholder="Add more details… (optional)"
          value={description}
          onChange={(e) => setDesc(e.target.value)}
          rows={3}
        />

        {/* Generated Tasks Preview */}
        {generated.length > 0 && (
          <div className="my-6">
            <h2 className="text-[15px] font-semibold text-slate-900 mb-3 flex items-center gap-2">
              Generated Tasks Preview
            </h2>
            <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 scrollbar-hide">
              {generated.map((item, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-3 bg-white shadow-sm relative group">
                  <button
                    onClick={() => handleRemoveGenerated(idx)}
                    className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                    title="Remove task"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="pr-8 space-y-2">
                    <Input
                      value={item.title}
                      onChange={(e) => handleUpdateGeneratedTitle(idx, e.target.value)}
                      placeholder="Task title..."
                      className="text-sm font-medium"
                    />
                    <div className="mt-2">
                      <Select
                        value={item.category}
                        onChange={(e) => {
                          const updated = [...generated];
                          updated[idx].category = e.target.value;
                          setGenerated(updated);
                        }}
                        options={CATEGORY_OPTIONS}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <hr className="border-slate-100 my-4" />

        {/* Category & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={CATEGORY_OPTIONS}
          />
          {renderStatusWorkflow()}
        </div>
      </div>
    </Modal>
  );
}

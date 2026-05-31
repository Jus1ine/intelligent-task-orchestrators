import { useState } from 'react';
import { Sparkles, Wand2, CheckCircle2, AlertCircle, ChevronRight, Tag, BarChart2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { PriorityBadge } from '../ui/Badge';
import { generateSubtasks } from '../../lib/openrouter';
import type { GeneratedSubtask, Project } from '../../types';
import { cn } from '../../lib/utils';

// ============================================================
// Magic Generate Component
// ============================================================

interface MagicGenerateProps {
  open: boolean;
  onClose: () => void;
  project: Project;
  onAddTasks: (subtasks: GeneratedSubtask[]) => Promise<void>;
}

type Step = 'idle' | 'generating' | 'preview' | 'adding' | 'done' | 'error';

export function MagicGenerate({ open, onClose, project, onAddTasks }: MagicGenerateProps) {
  const [step, setStep] = useState<Step>('idle');
  const [subtasks, setSubtasks] = useState<GeneratedSubtask[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set([0, 1, 2, 3, 4]));

  const handleClose = () => {
    if (step === 'generating' || step === 'adding') return;
    setStep('idle');
    setSubtasks([]);
    setErrorMsg('');
    setSelectedIds(new Set([0, 1, 2, 3, 4]));
    onClose();
  };

  const handleGenerate = async () => {
    setStep('generating');
    setErrorMsg('');
    try {
      const result = await generateSubtasks(project.title, project.description);
      setSubtasks(result);
      setSelectedIds(new Set(result.map((_, i) => i)));
      setStep('preview');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI generation failed. Please try again.';
      setErrorMsg(msg);
      setStep('error');
    }
  };

  const handleAddSelected = async () => {
    const selected = subtasks.filter((_, i) => selectedIds.has(i));
    if (selected.length === 0) return;
    setStep('adding');
    try {
      await onAddTasks(selected);
      setStep('done');
    } catch {
      setErrorMsg('Failed to add tasks. Please try again.');
      setStep('error');
    }
  };

  const toggleSelect = (index: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="lg"
      title=""
    >
      <div className="space-y-5 -mt-2">
        {/* ---- HEADER ---- */}
        <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm shadow-violet-200">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Magic Generate</h2>
            <p className="text-sm text-slate-500">
              AI-powered subtask generation for{' '}
              <span className="font-semibold text-slate-700">{project.title}</span>
            </p>
          </div>
        </div>

        {/* ---- IDLE ---- */}
        {step === 'idle' && (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 flex items-center justify-center mx-auto mb-4">
              <Wand2 size={28} className="text-violet-500" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">
              Generate 5 AI-Powered Subtasks
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed mb-6">
              Our AI will analyze your project and generate 5 specific, actionable subtasks
              categorized by type and priority.
            </p>
            <Button
              variant="primary"
              icon={<Sparkles size={15} />}
              onClick={handleGenerate}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 border-0 shadow-lg shadow-violet-200"
            >
              Generate Subtasks
            </Button>
          </div>
        )}

        {/* ---- GENERATING ---- */}
        {step === 'generating' && (
          <div className="text-center py-10">
            <div className="relative inline-flex mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Sparkles size={22} className="text-white animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -right-1">
                <Spinner size="sm" />
              </div>
            </div>
            <p className="text-base font-semibold text-slate-900 mb-1">Thinking…</p>
            <p className="text-sm text-slate-500">
              Analyzing <span className="font-medium text-slate-700">{project.title}</span> and
              crafting subtasks
            </p>
            <div className="flex justify-center gap-1.5 mt-5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ---- PREVIEW ---- */}
        {step === 'preview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600 font-medium">
                Select tasks to add ({selectedIds.size} of {subtasks.length} selected)
              </p>
              <button
                onClick={() =>
                  setSelectedIds(
                    selectedIds.size === subtasks.length
                      ? new Set()
                      : new Set(subtasks.map((_, i) => i))
                  )
                }
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                {selectedIds.size === subtasks.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {subtasks.map((subtask, index) => {
                const isSelected = selectedIds.has(index);
                return (
                  <button
                    key={index}
                    onClick={() => toggleSelect(index)}
                    className={cn(
                      'w-full text-left p-4 rounded-xl border-2 transition-all duration-150',
                      isSelected
                        ? 'border-indigo-300 bg-indigo-50/50'
                        : 'border-slate-100 bg-white hover:border-slate-200'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <div
                        className={cn(
                          'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                          isSelected
                            ? 'border-indigo-500 bg-indigo-500'
                            : 'border-slate-300 bg-white'
                        )}
                      >
                        {isSelected && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-sm font-semibold text-slate-900">{subtask.title}</p>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed mb-2">
                          {subtask.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <PriorityBadge priority={subtask.priority} />
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                            <Tag size={9} />
                            {subtask.category}
                          </span>
                        </div>
                      </div>

                      <ChevronRight
                        size={14}
                        className={cn('shrink-0 mt-1 transition-colors', isSelected ? 'text-indigo-400' : 'text-slate-300')}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-2 border-t border-slate-100">
              <Button variant="ghost" onClick={() => setStep('idle')} className="flex-1">
                Regenerate
              </Button>
              <Button
                variant="primary"
                onClick={handleAddSelected}
                disabled={selectedIds.size === 0}
                icon={<BarChart2 size={14} />}
                className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 border-0"
              >
                Add {selectedIds.size} Task{selectedIds.size !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        )}

        {/* ---- ADDING ---- */}
        {step === 'adding' && (
          <div className="text-center py-8">
            <Spinner size="lg" className="mx-auto mb-4" />
            <p className="text-sm font-medium text-slate-700">Adding tasks to your board…</p>
          </div>
        )}

        {/* ---- DONE ---- */}
        {step === 'done' && (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} className="text-emerald-500" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">Tasks Added!</h3>
            <p className="text-sm text-slate-500 mb-5">
              {selectedIds.size} subtask{selectedIds.size !== 1 ? 's' : ''} added to your board.
            </p>
            <Button variant="primary" onClick={handleClose}>
              View Board
            </Button>
          </div>
        )}

        {/* ---- ERROR ---- */}
        {step === 'error' && (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} className="text-rose-500" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">Generation Failed</h3>
            <p className="text-sm text-slate-500 mb-1">{errorMsg}</p>
            <p className="text-xs text-slate-400 mb-5">
              Check your OpenRouter API key and network connection.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleGenerate}>
                Try Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

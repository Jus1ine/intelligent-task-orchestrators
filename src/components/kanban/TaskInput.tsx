import { useState } from 'react';
import type { Subtask } from '../../types';

const TASK_TYPES = {
  SIMPLE: 'simple',
  CHECKLIST: 'checklist'
};

interface TaskInputProps {
  onAddTask: (text: string, image: string | null, subtasks: Subtask[]) => void;
}

export function TaskInput({ onAddTask }: TaskInputProps) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskType, setTaskType] = useState(TASK_TYPES.SIMPLE);
  const [subtasks, setSubtasks] = useState<string[]>(['']);

  const handleSubtaskChange = (index: number, value: string) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index] = value;
    setSubtasks(newSubtasks);
  };

  const addSubtask = () => {
    setSubtasks([...subtasks, '']);
  };

  const removeSubtask = (index: number) => {
    if (subtasks.length > 1) {
      setSubtasks(subtasks.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    try {
      const validSubtasks = taskType === TASK_TYPES.CHECKLIST
        ? subtasks.filter(s => s.trim()).map(s => ({ text: s.trim(), completed: false }))
        : [];

      onAddTask(text.trim(), null, validSubtasks);
      setText('');
      setTaskType(TASK_TYPES.SIMPLE);
      setSubtasks(['']);
    } catch (error) {
      console.error('Failed to add task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="task-input-container" onSubmit={handleSubmit}>
      <div className="input-wrapper">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What needs to be done?"
          className="task-input"
          disabled={isSubmitting}
        />

        <div className="input-actions">
          <div className="task-type-toggle">
            <button
              type="button"
              className={`type-btn ${taskType === TASK_TYPES.SIMPLE ? 'active' : ''}`}
              onClick={() => setTaskType(TASK_TYPES.SIMPLE)}
              title="Simple task"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
              </svg>
            </button>
            <button
              type="button"
              className={`type-btn ${taskType === TASK_TYPES.CHECKLIST ? 'active' : ''}`}
              onClick={() => setTaskType(TASK_TYPES.CHECKLIST)}
              title="Checklist"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
          </div>

          <button
            type="submit"
            className="add-btn"
            disabled={isSubmitting || !text.trim()}
          >
            {isSubmitting ? (
              <span className="spinner"></span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                <span>Add Task</span>
              </>
            )}
          </button>
        </div>
      </div>

      {taskType === TASK_TYPES.CHECKLIST && (
        <div className="subtasks-container">
          <div className="subtasks-header">
            <span className="subtasks-label">Subtasks</span>
          </div>
          {subtasks.map((subtask, index) => (
            <div key={index} className="subtask-input-row">
              <input
                type="text"
                value={subtask}
                onChange={(e) => handleSubtaskChange(index, e.target.value)}
                placeholder={`Subtask ${index + 1}`}
                className="subtask-input"
                disabled={isSubmitting}
              />
              {subtasks.length > 1 && (
                <button
                  type="button"
                  className="remove-subtask-btn"
                  onClick={() => removeSubtask(index)}
                  title="Remove subtask"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="add-subtask-btn"
            onClick={addSubtask}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add subtask
          </button>
        </div>
      )}
    </form>
  );
}

import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Sparkles, CheckCircle2, Wand2, ListTodo } from 'lucide-react';

interface MagicGuideModalProps {
  open: boolean;
  onClose: () => void;
}

export function MagicGuideModal({ open, onClose }: MagicGuideModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="How Magic Generate Works"
      size="md"
      footer={
        <div className="w-full flex justify-end">
          <Button variant="primary" onClick={onClose}>
            Got it!
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <p className="text-sm text-slate-600 leading-relaxed">
          The <strong>✨ Magic Generate</strong> feature uses advanced AI to instantly break down your project into actionable subtasks. Here is how to use it:
        </p>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
              1
            </div>
            <div>
              <h4 className="text-[15px] font-semibold text-slate-800 flex items-center gap-2">
                <Wand2 size={16} className="text-indigo-500" />
                Add Context
              </h4>
              <p className="text-sm text-slate-500 mt-1">
                Make sure your Project has a good Title and Description. The AI uses this context to understand what needs to be done.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
              2
            </div>
            <div>
              <h4 className="text-[15px] font-semibold text-slate-800 flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-500" />
                Click Magic Generate
              </h4>
              <p className="text-sm text-slate-500 mt-1">
                Open the "Add Task" modal and click the Magic Generate button. The AI will brainstorm 5 specific tasks based on your project.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
              3
            </div>
            <div>
              <h4 className="text-[15px] font-semibold text-slate-800 flex items-center gap-2">
                <ListTodo size={16} className="text-indigo-500" />
                Review & Edit
              </h4>
              <p className="text-sm text-slate-500 mt-1">
                You'll see a preview of the generated tasks. You can rename them, change their categories, or delete ones you don't like.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
              4
            </div>
            <div>
              <h4 className="text-[15px] font-semibold text-slate-800 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-indigo-500" />
                Save to Board
              </h4>
              <p className="text-sm text-slate-500 mt-1">
                Click "Save Task". It will save your manual task along with all the AI-generated tasks to your board instantly!
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

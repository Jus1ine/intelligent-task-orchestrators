import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

// ============================================================
// Delete Confirmation Modal
// ============================================================

interface DeleteConfirmModalProps {
  open: boolean;
  taskTitle: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteConfirmModal({
  open,
  taskTitle,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      // Error handled by parent via toast
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Task"
      description="This action cannot be undone."
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>
            Delete Task
          </Button>
        </>
      }
    >
      <p className="text-sm text-slate-600 pb-2">
        Are you sure you want to permanently delete{' '}
        <span className="font-semibold text-slate-900">"{taskTitle}"</span>?
      </p>
    </Modal>
  );
}

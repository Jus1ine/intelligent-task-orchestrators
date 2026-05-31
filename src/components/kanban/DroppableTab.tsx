import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableTabProps {
  id: string;
  isActive: boolean;
  isDropTarget?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export function DroppableTab({ id, isActive, isDropTarget, onClick, children }: DroppableTabProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <button
      ref={setNodeRef}
      className={`tab-btn ${isActive ? 'active' : ''} ${isOver || isDropTarget ? 'drop-target' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

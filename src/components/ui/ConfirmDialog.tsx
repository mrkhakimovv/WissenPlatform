import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Tasdiqlash',
  cancelText = 'Bekor qilish'
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <p className="text-sm text-[color:var(--theme-text-primary)]/70 mb-6">{message}</p>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onCancel} className="flex-1">
          {cancelText}
        </Button>
        <Button variant="danger" onClick={onConfirm} className="flex-1">
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}

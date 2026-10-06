import { Modal } from './Modal';
import { Button } from './Button';
import { Icon } from './Icon';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start gap-4">
        <div
          className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${
            variant === 'danger'
              ? 'bg-rose-50 text-rose-600'
              : 'bg-amber-50 text-amber-600'
          }`}
        >
          <Icon name={variant === 'danger' ? 'alert' : 'warning'} size={22} />
        </div>
        <div>
          <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <Button variant="secondary" size="md" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button
          variant={variant}
          size="md"
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

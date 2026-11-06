'use client';

import { messageForError } from '@/api/error-messages';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { catalogAdminLabels as labels } from '@/lib/labels';

interface FormDialogProps {
  title: string;
  description?: string;
  isPending: boolean;
  error: unknown;
  onSubmit: () => void;
  onClose: () => void;
  children: React.ReactNode;
}

export function FormDialog({
  title,
  description,
  isPending,
  error,
  onSubmit,
  onClose,
  children,
}: FormDialogProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] gap-4 overflow-y-auto rounded-[14px] p-6 sm:max-w-[520px]">
        <DialogHeader className="gap-1.5 text-left">
          <DialogTitle className="text-lg font-bold text-brand">{title}</DialogTitle>
          <DialogDescription className={description ? 'text-ink-soft' : 'sr-only'}>
            {description ?? title}
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          {children}
          {error !== null && error !== undefined && (
            <p role="alert" className="font-semibold text-red-700">
              {messageForError(error)}
            </p>
          )}
          <DialogFooter className="gap-2 sm:flex-row-reverse">
            <button type="submit" className="btn btn-gold" disabled={isPending}>
              {isPending ? labels.saving : labels.save}
            </button>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              {labels.cancel}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

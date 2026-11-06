'use client';

import { messageForError } from '@/api/error-messages';
import { FeedbackDialog } from '@/components/shared/FeedbackDialog';
import type { CatalogSubject } from '@/features/catalog/admin/catalog-subject';
import { FutureReservationsList } from '@/features/catalog/admin/FutureReservationsList';
import { useFutureReservations, useToggleActive } from '@/features/catalog/admin/useCatalogAdmin';
import { catalogAdminLabels as labels } from '@/lib/labels';

function describe(subject: CatalogSubject, name: string, deactivating: boolean): string {
  const copy = labels.toggle;
  if (deactivating) {
    const cascade =
      subject === 'AI_LAB' ? copy.labCascade : subject === 'BUILDING' ? copy.buildingCascade : '';
    return copy.deactivate(name) + cascade;
  }
  return copy.activate(name) + (subject === 'AI_LAB' ? copy.labKeepsLaptops : '');
}

interface ToggleCatalogDialogProps {
  subject: CatalogSubject;
  id: string;
  name: string;
  isActive: boolean;
  onClose: () => void;
}

export function ToggleCatalogDialog({
  subject,
  id,
  name,
  isActive,
  onClose,
}: ToggleCatalogDialogProps) {
  const deactivating = isActive;
  const noun = labels.subjects[subject];
  const copy = labels.toggle;
  const { toggle, isPending, error } = useToggleActive(subject);
  const future = useFutureReservations(subject, id, deactivating);
  const reservations = future.data ?? [];
  const blocked = deactivating && reservations.length > 0;
  const checking = deactivating && future.isPending;

  return (
    <FeedbackDialog
      open
      onOpenChange={(open) => !open && onClose()}
      variant={deactivating ? 'error' : 'info'}
      title={deactivating ? copy.deactivateTitle(noun) : copy.activateTitle(noun)}
      description={describe(subject, name, deactivating)}
      footer={
        <>
          <button
            type="button"
            className="btn btn-gold"
            disabled={isPending || checking || blocked}
            onClick={() => toggle(id, !isActive, onClose)}
          >
            {isPending
              ? labels.saving
              : deactivating
                ? copy.confirmDeactivate
                : copy.confirmActivate}
          </button>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            {labels.cancel}
          </button>
        </>
      }
    >
      {checking && (
        <p role="status" className="flex items-center gap-2 text-sm">
          <span className="spinner" aria-hidden />
          {copy.checking}
        </p>
      )}
      {future.isError && (
        <p role="alert" className="font-semibold text-red-700">
          {messageForError(future.error)}
        </p>
      )}
      {blocked && (
        <>
          <p role="alert" className="font-semibold text-red-700">
            {copy.blocked(reservations.length)}
          </p>
          <FutureReservationsList reservations={reservations} />
        </>
      )}
      {error && (
        <p role="alert" className="font-semibold text-red-700">
          {messageForError(error)}
        </p>
      )}
    </FeedbackDialog>
  );
}

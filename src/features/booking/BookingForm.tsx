'use client';

import { useMemo } from 'react';
import { messageForError } from '@/api/error-messages';
import type { Reservation } from '@/api/types';
import { BookingFormBody } from '@/features/booking/BookingFormBody';
import { useCatalogTree } from '@/features/catalog/useCatalogTree';
import type { BookingInitial } from '@/lib/booking-form';
import { bookingLabels as labels } from '@/lib/labels';
import { bookableResources } from '@/lib/resource-options';

interface BookingFormProps {
  initial: BookingInitial;
  reservation?: Reservation;
  onClose: () => void;
}

export function BookingForm({ initial, reservation, onClose }: BookingFormProps) {
  const tree = useCatalogTree();
  const resources = useMemo(() => bookableResources(tree.data ?? []), [tree.data]);

  if (tree.isPending) {
    return (
      <p role="status" className="flex items-center gap-2">
        <span className="spinner" aria-hidden />
        {labels.loading}
      </p>
    );
  }

  if (tree.isError) {
    return (
      <div role="alert" className="alert flex flex-wrap items-center justify-between gap-2">
        <span>{messageForError(tree.error)}</span>
        <button type="button" className="btn btn-outline" onClick={() => void tree.refetch()}>
          {labels.retry}
        </button>
      </div>
    );
  }

  if (resources.length === 0) return <p>{labels.noResources}</p>;

  return (
    <BookingFormBody
      resources={resources}
      initial={initial}
      reservation={reservation}
      onClose={onClose}
    />
  );
}

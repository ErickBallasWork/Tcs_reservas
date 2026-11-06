'use client';

import type { Reservation } from '@/api/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BookingForm } from '@/features/booking/BookingForm';
import type { BookingInitial } from '@/lib/booking-form';
import { bookingLabels as labels } from '@/lib/labels';

interface BookingDialogProps {
  initial: BookingInitial;
  reservation?: Reservation;
  onClose: () => void;
}

export function BookingDialog({ initial, reservation, onClose }: BookingDialogProps) {
  const title = reservation ? labels.editTitle : labels.createTitle;
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92dvh] gap-4 overflow-y-auto rounded-[14px] p-4 sm:max-w-4xl md:p-6">
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg font-bold text-brand">{title}</DialogTitle>
          <DialogDescription className="sr-only">{title}</DialogDescription>
        </DialogHeader>
        <BookingForm initial={initial} reservation={reservation} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}

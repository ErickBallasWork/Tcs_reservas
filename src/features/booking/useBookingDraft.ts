import { useCallback, useState } from 'react';
import { applyBookingPatch, type BookingFormValues } from '@/lib/booking-form';

export interface BookingDraft {
  values: BookingFormValues;
  patch: (next: Partial<BookingFormValues>) => void;
  reset: (values: BookingFormValues) => void;
}

export function useBookingDraft(initial: () => BookingFormValues): BookingDraft {
  const [values, setValues] = useState<BookingFormValues>(initial);
  const patch = useCallback(
    (next: Partial<BookingFormValues>) =>
      setValues((previous) => applyBookingPatch(previous, next)),
    [],
  );
  return { values, patch, reset: setValues };
}

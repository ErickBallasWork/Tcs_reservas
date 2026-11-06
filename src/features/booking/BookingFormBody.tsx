'use client';

import { useMemo, useState } from 'react';
import type { Reservation } from '@/api/types';
import { BookingFeedbackDialogs } from '@/features/booking/BookingFeedbackDialogs';
import { BookingFields } from '@/features/booking/BookingFields';
import { RepeatFields } from '@/features/booking/RepeatFields';
import { SeriesPreviewList } from '@/features/booking/SeriesPreviewList';
import { useBookingSubmit } from '@/features/booking/useBookingSubmit';
import { useResourceAvailability } from '@/features/availability/useAvailability';
import { checkDraft, type BookingProblem } from '@/lib/booking-checks';
import {
  initialValues,
  instantsOf,
  isSlotChange,
  toCreateBody,
  toSeriesBody,
  toUpdateBody,
  valuesFromReservation,
  type BookingFormValues,
  type BookingInitial,
} from '@/lib/booking-form';
import { dayRange, firstBookableDate, weekdayOf } from '@/lib/booking-time';
import { bookingLabels as labels, bookingProblemMessages } from '@/lib/labels';
import type { BookableResource } from '@/lib/resource-options';
import { findRangeConflict, withoutRange } from '@/lib/slot-grid';
import { errorMessages, messageForError } from '@/api/error-messages';
import { cn } from '@/lib/utils';

const MAX_AVAILABILITY_DAYS = 14;

interface BookingFormBodyProps {
  resources: readonly BookableResource[];
  initial: BookingInitial;
  reservation?: Reservation;
  onClose: () => void;
}

const ATTENDEE_PROBLEMS: BookingProblem[] = ['ATTENDEES_REQUIRED', 'ATTENDEES_EXCEEDS_CAPACITY'];

export function BookingFormBody({
  resources,
  initial,
  reservation,
  onClose,
}: BookingFormBodyProps) {
  const [values, setValues] = useState<BookingFormValues>(() =>
    reservation ? valuesFromReservation(reservation) : initialValues(initial, resources[0].id),
  );
  const submit = useBookingSubmit(reservation);

  const selected = resources.find((resource) => resource.id === values.resourceId) ?? resources[0];
  const { start, end } = instantsOf(values);
  const range = {
    from: dayRange(values.startDate).from,
    to: dayRange(values.endDate >= values.startDate ? values.endDate : values.startDate).to,
  };
  const rangeDays = (new Date(range.to).getTime() - new Date(range.from).getTime()) / 86_400_000;
  const availability = useResourceAvailability(
    rangeDays > 0 && rangeDays <= MAX_AVAILABILITY_DAYS ? selected.id : undefined,
    range.from,
    range.to,
  );

  const updateBody = useMemo(
    () => (reservation ? toUpdateBody(values, selected.type, reservation) : null),
    [reservation, values, selected.type],
  );

  const problems = checkDraft({
    start,
    end,
    resourceType: selected.type,
    capacity: selected.capacity,
    attendees: values.attendees,
    purpose: values.purpose,
    detail: values.detail,
    editing:
      reservation && updateBody
        ? { originalStart: reservation.startDateTime, slotChanged: isSlotChange(updateBody) }
        : undefined,
  });

  const conflict = useMemo(() => {
    if (!availability.data || problems.includes('END_BEFORE_START')) return null;
    if (updateBody && !isSlotChange(updateBody)) return null;
    const own = reservation && reservation.resourceId === selected.id ? reservation : null;
    const laptopSlots = availability.data.laptops.flatMap((laptop) => laptop.busySlots);
    const busy = [...availability.data.busySlots, ...laptopSlots];
    return findRangeConflict(start, end, {
      busySlots: own ? withoutRange(busy, own.startDateTime, own.endDateTime) : busy,
      openWindows: availability.data.openWindows,
    });
  }, [availability.data, problems, updateBody, reservation, selected.id, start, end]);

  const rules = [
    {
      key: 'advance',
      text: labels.ruleAdvance,
      violated: problems.includes('MIN_ADVANCE') || problems.includes('EDIT_TOO_LATE'),
    },
    { key: 'duration', text: labels.ruleDuration, violated: problems.includes('MAX_DURATION') },
    { key: 'slot', text: labels.ruleSlot, violated: conflict !== null },
    {
      key: 'attendees',
      text: labels.ruleAttendees,
      violated: problems.some((problem) => ATTENDEE_PROBLEMS.includes(problem)),
    },
  ];

  const patch = (next: Partial<BookingFormValues>) =>
    setValues((previous) => {
      const merged = { ...previous, ...next };
      if (next.startDate === undefined || next.startDate === previous.startDate) return merged;
      const wasSameDay = previous.endDate === previous.startDate;
      return {
        ...merged,
        endDate:
          wasSameDay || merged.endDate < merged.startDate ? merged.startDate : merged.endDate,
        repeat: { ...merged.repeat, weekdays: [weekdayOf(merged.startDate)] },
      };
    });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const messages = problems.map((problem) => bookingProblemMessages[problem]);
    if (conflict) messages.push(labels.conflicts[conflict]);
    if (messages.length > 0) {
      submit.reject(messages);
      return;
    }
    if (!values.purpose) return;

    if (reservation && updateBody) {
      if (Object.keys(updateBody).length === 0) {
        submit.reject([errorMessages.NOTHING_TO_CHANGE]);
        return;
      }
      submit.update(updateBody);
      return;
    }
    if (values.repeat.enabled) {
      submit.createSeries(toSeriesBody(values, selected.type, values.purpose));
      return;
    }
    submit.create(toCreateBody(values, selected.type, values.purpose));
  };

  const handlePreview = () => {
    if (!values.purpose) {
      submit.reject([bookingProblemMessages.MISSING_PURPOSE]);
      return;
    }
    submit.preview.mutate(toSeriesBody(values, selected.type, values.purpose));
  };

  const resetForAnother = () => {
    submit.clearFeedback();
    setValues(initialValues(initial, resources[0].id));
  };

  const submitLabel = reservation
    ? labels.submitEdit
    : values.repeat.enabled
      ? labels.submitSeries
      : labels.submit;

  return (
    <div className="grid gap-4 md:grid-cols-[3fr_2fr]">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
        <BookingFields
          values={values}
          resources={resources}
          selected={selected}
          minDate={reservation ? undefined : firstBookableDate()}
          onChange={patch}
        />

        {!reservation && (
          <RepeatFields
            value={values.repeat}
            startWeekday={weekdayOf(values.startDate)}
            onChange={(repeat) => setValues({ ...values, repeat })}
          />
        )}

        {!reservation && values.repeat.enabled && (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              className="btn btn-outline"
              disabled={submit.preview.isPending}
              onClick={handlePreview}
            >
              {submit.preview.isPending ? labels.previewing : labels.preview}
            </button>
            {submit.preview.isError && (
              <p role="alert" className="font-semibold text-red-700">
                {messageForError(submit.preview.error)}
              </p>
            )}
            {submit.preview.data && (
              <SeriesPreviewList occurrences={submit.preview.data.occurrences} />
            )}
          </div>
        )}

        <ul className="flex flex-col gap-2 md:hidden">
          {rules
            .filter((rule) => rule.violated)
            .map((rule) => (
              <li key={rule.key} className="alert">
                {rule.text}
              </li>
            ))}
        </ul>

        <button type="submit" className="btn btn-gold" disabled={submit.isPending}>
          {submit.isPending && <span className="spinner" aria-hidden />}
          {submit.isPending ? labels.sending : submitLabel}
        </button>
      </form>

      <aside className="panel hidden flex-col gap-3 self-start md:flex">
        <h2 className="text-base font-bold text-brand">{labels.validations}</h2>
        {rules.map((rule) => (
          <div
            key={rule.key}
            className={cn(
              rule.violated ? 'alert' : 'rounded-[10px] border border-line bg-soft p-3 text-brand',
            )}
          >
            {rule.text}
          </div>
        ))}
        {conflict && <div className="alert">{labels.conflicts[conflict]}</div>}
        <small className="text-ink-soft">{labels.trainingHint}</small>
      </aside>

      <BookingFeedbackDialogs
        feedback={submit.feedback}
        onDismiss={submit.clearFeedback}
        onAnother={resetForAnother}
        onClose={onClose}
      />
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { addMonths, format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CatalogBuilding } from '@/api/types';
import { MonthCalendar, WeekStrip } from '@/components/shared/MonthCalendar';
import { Tag } from '@/components/shared/Tag';
import { ResourceAvailabilityCard } from '@/features/availability/ResourceAvailabilityCard';
import { SlotLegend } from '@/features/availability/SlotRow';
import type { AvailabilityDraft } from '@/features/availability/useAvailabilityDraft';
import { BookingDialog } from '@/features/booking/BookingDialog';
import { useMyReservations } from '@/features/reservations/useReservations';
import type { BookingInitial } from '@/lib/booking-form';
import { formatDay, toLocal } from '@/lib/booking-time';
import { matchesFilters } from '@/lib/floor-plan/plan-window';
import { availabilityLabels as labels, sanctionBannerLabels as sanctionLabels } from '@/lib/labels';
import { slotStartsBetween, type TimeRange } from '@/lib/slot-grid';

const ACTIVE_STATUSES = ['PENDING_APPROVAL', 'CONFIRMED', 'CHECKED_IN'];
const HOUR_MINUTES = 60;

function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number);
  const total = Math.min(hours * 60 + mins + minutes, 23 * 60 + 30);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

interface AvailabilityListProps {
  building: CatalogBuilding | undefined;
  draft: AvailabilityDraft;
  firstDate: string;
  isSanctioned: boolean;
}

export function AvailabilityList({
  building,
  draft,
  firstDate,
  isSanctioned,
}: AvailabilityListProps) {
  const { values, patch } = draft.booking;
  const date = values.startDate;
  const [shown, setShown] = useState({ date, month: date.slice(0, 7) });
  if (shown.date !== date) setShown({ date, month: date.slice(0, 7) });
  const month = shown.month;
  const [booking, setBooking] = useState<BookingInitial | null>(null);
  const mine = useMyReservations({ page: 1, pageSize: 100, from: new Date().toISOString() });

  const slotStarts = useMemo(
    () => slotStartsBetween(date, values.startTime, values.endTime),
    [date, values.startTime, values.endTime],
  );

  const markedDates = useMemo(
    () =>
      new Set(
        (mine.data?.items ?? [])
          .filter((item) => ACTIVE_STATUSES.includes(item.status))
          .map((item) => toLocal(item.startDateTime).date),
      ),
    [mine.data],
  );

  const resources = useMemo(
    () =>
      (building?.resources ?? []).filter(
        (resource) => resource.isActive && matchesFilters(resource, draft.type, draft.minCapacity),
      ),
    [building, draft.type, draft.minCapacity],
  );

  const monthDate = parseISO(`${month}-01`);
  const monthTitle = format(monthDate, 'MMMM yyyy', { locale: es });
  const shiftMonth = (delta: number) =>
    setShown({ date, month: format(addMonths(monthDate, delta), 'yyyy-MM') });

  const handleReserve = (resourceId: string | undefined, picked?: TimeRange) => {
    if (isSanctioned) return;
    const startTime = picked ? toLocal(picked.start).time : values.startTime;
    const pickedEnd = picked ? toLocal(picked.end).time : null;
    const minimumEnd = addMinutes(startTime, HOUR_MINUTES);
    setBooking({
      resourceId,
      date,
      startTime,
      endTime: pickedEnd && pickedEnd > minimumEnd ? pickedEnd : minimumEnd,
    });
  };

  const calendarProps = {
    selected: date,
    markedDates,
    firstSelectableDate: firstDate,
    onSelect: (next: string) => patch({ startDate: next }),
  };

  const reserveButton = (
    <button
      type="button"
      className="btn btn-gold"
      disabled={isSanctioned}
      title={isSanctioned ? sanctionLabels.blockedHint : undefined}
      onClick={() => handleReserve(undefined)}
    >
      {labels.reserve}
    </button>
  );

  const cards = (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold text-brand">{formatDay(date)}</h2>
        <SlotLegend />
      </div>
      {resources.map((resource) => (
        <ResourceAvailabilityCard
          key={resource.id}
          resource={resource}
          date={date}
          slotStarts={slotStarts}
          onReserve={handleReserve}
        />
      ))}
      {resources.length === 0 && <small className="text-ink-soft">{labels.noResources}</small>}
      <small className="hidden text-ink-soft md:block">{labels.freeRangeHint}</small>
    </div>
  );

  return (
    <>
      <div className="hidden gap-4 md:grid md:grid-cols-[300px_1fr]">
        <div className="panel flex flex-col gap-3 self-start">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label={labels.previousMonth}
              className="grid size-11 place-items-center rounded-lg hover:bg-soft"
              onClick={() => shiftMonth(-1)}
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <h2 className="text-base font-bold text-brand capitalize">{monthTitle}</h2>
            <button
              type="button"
              aria-label={labels.nextMonth}
              className="grid size-11 place-items-center rounded-lg hover:bg-soft"
              onClick={() => shiftMonth(1)}
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </div>
          <Tag variant="gold" className="self-start">
            {labels.hasReservations}
          </Tag>
          <MonthCalendar
            year={monthDate.getFullYear()}
            month={monthDate.getMonth()}
            {...calendarProps}
          />
          <small className="text-ink-soft">{labels.pickDay}</small>
          {reserveButton}
        </div>
        {cards}
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        <div className="flex items-start justify-between gap-3">
          <b className="capitalize">{monthTitle}</b>
          <Tag variant="gold">{labels.hasReservations}</Tag>
        </div>
        <WeekStrip {...calendarProps} />
        {cards}
        {reserveButton}
      </div>

      {booking && <BookingDialog initial={booking} onClose={() => setBooking(null)} />}
    </>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { addMonths, format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { messageForError } from '@/api/error-messages';
import { MonthCalendar, WeekStrip } from '@/components/shared/MonthCalendar';
import { Tag } from '@/components/shared/Tag';
import { ResourceAvailabilityCard } from '@/features/availability/ResourceAvailabilityCard';
import { SlotLegend } from '@/features/availability/SlotRow';
import { BookingDialog } from '@/features/booking/BookingDialog';
import { useCatalogTree } from '@/features/catalog/useCatalogTree';
import { useMyReservations } from '@/features/reservations/useReservations';
import type { BookingInitial } from '@/lib/booking-form';
import { firstBookableDate, formatDay, toLocal } from '@/lib/booking-time';
import { availabilityLabels as labels } from '@/lib/labels';
import { slotStartsBetween, type TimeRange } from '@/lib/slot-grid';

const ACTIVE_STATUSES = ['PENDING_APPROVAL', 'CONFIRMED', 'CHECKED_IN'];
const HOUR_MINUTES = 60;

function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number);
  const total = Math.min(hours * 60 + mins + minutes, 23 * 60 + 30);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function AvailabilityView() {
  const firstDate = useMemo(() => firstBookableDate(), []);
  const [date, setDate] = useState(firstDate);
  const [month, setMonth] = useState(firstDate.slice(0, 7));
  const [buildingId, setBuildingId] = useState('');
  const [rangeValue, setRangeValue] = useState(labels.ranges[0].value);
  const [minCapacity, setMinCapacity] = useState('');
  const [booking, setBooking] = useState<BookingInitial | null>(null);

  const tree = useCatalogTree();
  const mine = useMyReservations({ page: 1, pageSize: 100, from: new Date().toISOString() });

  const buildings = useMemo(() => (tree.data ?? []).filter((b) => b.isActive), [tree.data]);
  const activeBuilding = buildings.find((b) => b.id === buildingId) ?? buildings[0];
  const range = labels.ranges.find((r) => r.value === rangeValue) ?? labels.ranges[0];
  const slotStarts = useMemo(
    () => slotStartsBetween(date, range.from, range.to),
    [date, range.from, range.to],
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

  const resources = useMemo(() => {
    const min = Number(minCapacity) || 0;
    return (activeBuilding?.resources ?? []).filter(
      (resource) => resource.isActive && resource.capacity >= min,
    );
  }, [activeBuilding, minCapacity]);

  const monthDate = parseISO(`${month}-01`);
  const monthTitle = format(monthDate, 'MMMM yyyy', { locale: es });
  const shiftMonth = (delta: number) => setMonth(format(addMonths(monthDate, delta), 'yyyy-MM'));

  const handleReserve = (resourceId: string | undefined, picked?: TimeRange) => {
    const startTime = picked ? toLocal(picked.start).time : range.from;
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
    onSelect: (next: string) => {
      setDate(next);
      setMonth(next.slice(0, 7));
    },
  };

  const buildingSelect = (
    <select
      className="field"
      value={activeBuilding?.id ?? ''}
      onChange={(event) => setBuildingId(event.target.value)}
    >
      {buildings.map((b) => (
        <option key={b.id} value={b.id}>
          {b.name}
        </option>
      ))}
    </select>
  );

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
        </div>

        <div className="flex flex-col gap-3">
          <div className="panel flex items-end gap-3">
            <label className="field-label flex-1">
              {labels.building}
              {buildingSelect}
            </label>
            <label className="field-label flex-1">
              {labels.timeRange}
              <select
                className="field"
                value={rangeValue}
                onChange={(event) => setRangeValue(event.target.value)}
              >
                {labels.ranges.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-label flex-1">
              {labels.capacity}
              <input
                className="field"
                type="number"
                min={1}
                placeholder={labels.anyCapacity}
                value={minCapacity}
                onChange={(event) => setMinCapacity(event.target.value)}
              />
            </label>
            <button type="button" className="btn btn-gold" onClick={() => handleReserve(undefined)}>
              {labels.reserve}
            </button>
          </div>
          {cards}
        </div>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        <div className="flex items-start justify-between gap-3">
          <b className="capitalize">{monthTitle}</b>
          <Tag variant="gold">{labels.hasReservations}</Tag>
        </div>
        <WeekStrip {...calendarProps} />
        <label className="field-label">
          {labels.building}
          {buildingSelect}
        </label>
        <label className="field-label">
          {labels.timeRange}
          <select
            className="field"
            value={rangeValue}
            onChange={(event) => setRangeValue(event.target.value)}
          >
            {labels.ranges.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        {cards}
        <button type="button" className="btn btn-gold" onClick={() => handleReserve(undefined)}>
          {labels.reserve}
        </button>
      </div>

      {booking && <BookingDialog initial={booking} onClose={() => setBooking(null)} />}
    </>
  );
}

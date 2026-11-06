'use client';

import { useMemo, useState } from 'react';
import { messageForError } from '@/api/error-messages';
import type { AvailabilityDraft } from '@/features/availability/useAvailabilityDraft';
import { BookingDialog } from '@/features/booking/BookingDialog';
import { BookingForm } from '@/features/booking/BookingForm';
import { FloorPlanCanvas } from '@/features/floor-plans/FloorPlanCanvas';
import { FloorPlanLegend } from '@/features/floor-plans/FloorPlanLegend';
import { FloorPlanViewport } from '@/features/floor-plans/FloorPlanViewport';
import { useFloorPlan, useFloorPlanStatus } from '@/features/floor-plans/useFloorPlans';
import { ZoneSheet } from '@/features/floor-plans/ZoneSheet';
import type { BookingInitial } from '@/lib/booking-form';
import type { FloorSeat, FloorZone } from '@/lib/floor-plan/types';
import { countFreeSpaces, seatStates, zoneStatuses } from '@/lib/floor-plan/zone-presentation';
import { floorPlanLabels as labels } from '@/lib/labels';
import { useMediaQuery } from '@/lib/useMediaQuery';

interface FloorPlanWorkspaceProps {
  planId: string;
  draft: AvailabilityDraft;
  isSanctioned: boolean;
}

const DESKTOP_QUERY = '(min-width: 768px)';

export function FloorPlanWorkspace({ planId, draft, isSanctioned }: FloorPlanWorkspaceProps) {
  const plan = useFloorPlan(planId);
  const status = useFloorPlanStatus(planId, draft.query);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [sheetZoneId, setSheetZoneId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const { values, patch } = draft.booking;

  const byZone = useMemo(() => zoneStatuses(status.data), [status.data]);
  const bySeat = useMemo(() => seatStates(status.data), [status.data]);
  const announcement =
    plan.data && status.data && !draft.problem
      ? labels.freeAnnouncement(countFreeSpaces(plan.data.zones, status.data))
      : '';

  if (plan.isPending) {
    return (
      <p role="status" className="flex items-center gap-2">
        <span className="spinner" aria-hidden />
        {labels.loading}
      </p>
    );
  }

  if (plan.isError) {
    return (
      <div role="alert" className="alert flex flex-wrap items-center justify-between gap-2">
        <span>{messageForError(plan.error)}</span>
        <button type="button" className="btn btn-outline" onClick={() => void plan.refetch()}>
          {labels.retry}
        </button>
      </div>
    );
  }

  const sheetZone = plan.data.zones.find((zone) => zone.id === sheetZoneId) ?? null;
  const initial: BookingInitial = {
    resourceId: values.resourceId,
    date: values.startDate,
    startTime: values.startTime,
    endTime: values.endTime,
  };

  const selectZone = (zone: FloorZone) => {
    if (isDesktop && zone.resourceId) patch({ resourceId: zone.resourceId });
    else setSheetZoneId(zone.id);
  };
  const selectSeat = (_zone: FloorZone, seat: FloorSeat) => patch({ resourceId: seat.resourceId });
  const reserve = (resourceId: string) => {
    patch({ resourceId });
    setSheetZoneId(null);
    setDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 xl:grid xl:grid-cols-[minmax(0,1fr)_420px] xl:items-start">
      <section
        aria-label={labels.mapTitle(plan.data.buildingName)}
        aria-busy={status.isFetching}
        className="flex flex-col gap-3"
      >
        <FloorPlanViewport>
          <FloorPlanCanvas
            plan={plan.data}
            status={draft.problem ? undefined : status.data}
            selectedResourceId={isDesktop ? values.resourceId : undefined}
            seatsInteractive={isDesktop}
            onSelectZone={selectZone}
            onSelectSeat={selectSeat}
          />
        </FloorPlanViewport>
        <div className="flex min-h-6 flex-wrap items-center justify-between gap-2">
          <FloorPlanLegend />
          {status.isFetching && (
            <span className="flex items-center gap-2 text-sm text-ink-soft">
              <span className="spinner" aria-hidden />
              {labels.loadingStatus}
            </span>
          )}
        </div>
        {status.isError && (
          <div role="alert" className="alert flex flex-wrap items-center justify-between gap-2">
            <span>{messageForError(status.error)}</span>
            <button type="button" className="btn btn-outline" onClick={() => void status.refetch()}>
              {labels.retry}
            </button>
          </div>
        )}
        <p aria-live="polite" className="sr-only">
          {announcement}
        </p>
      </section>

      {isDesktop && (
        <section
          aria-label={labels.bookingPanel}
          className="panel flex flex-col gap-3 xl:sticky xl:top-4"
        >
          <h2 className="text-base font-bold text-brand">{labels.bookingPanel}</h2>
          <small className="text-ink-soft">{labels.pickZoneHint}</small>
          <BookingForm
            key={formKey}
            initial={initial}
            draft={draft.booking}
            onClose={() => setFormKey((key) => key + 1)}
          />
        </section>
      )}

      <ZoneSheet
        zone={isDesktop ? null : sheetZone}
        status={sheetZone ? byZone.get(sheetZone.id) : undefined}
        seatStates={bySeat}
        blocked={isSanctioned}
        onReserve={reserve}
        onClose={() => setSheetZoneId(null)}
      />
      {dialogOpen && !isDesktop && (
        <BookingDialog
          initial={initial}
          draft={draft.booking}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </div>
  );
}

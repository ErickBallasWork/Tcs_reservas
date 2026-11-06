import { useCallback, useMemo, useState } from 'react';
import { useBookingDraft, type BookingDraft } from '@/features/booking/useBookingDraft';
import { initialValues, type BookingFormValues } from '@/lib/booking-form';
import {
  buildingOfResource,
  DEFAULT_END_TIME,
  DEFAULT_START_TIME,
  minCapacityOf,
  planWindow,
  resourceInBuilding,
  statusQuery,
  windowProblem,
  type TypeFilter,
} from '@/lib/floor-plan/plan-window';
import type { BookableResource } from '@/lib/resource-options';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

const STATUS_DEBOUNCE_MS = 250;

export interface AvailabilityDraft {
  booking: BookingDraft;
  buildingId: string;
  setBuildingId: (buildingId: string) => void;
  type: TypeFilter;
  setType: (type: TypeFilter) => void;
  minCapacity: number | undefined;
  problem: ReturnType<typeof windowProblem>;
  query: ReturnType<typeof statusQuery>;
}

export function useAvailabilityDraft(
  resources: readonly BookableResource[],
  firstDate: string,
  firstBuildingId: string,
): AvailabilityDraft {
  const fallback = resources.find((resource) => resource.buildingId === firstBuildingId);
  const draft = useBookingDraft(() =>
    initialValues(
      { date: firstDate, startTime: DEFAULT_START_TIME, endTime: DEFAULT_END_TIME },
      fallback?.id ?? resources[0]?.id ?? '',
    ),
  );
  const [buildingId, setBuilding] = useState(firstBuildingId);
  const [type, setType] = useState<TypeFilter>('ALL');
  const { values, patch: patchValues, reset } = draft;

  const patch = useCallback(
    (next: Partial<BookingFormValues>) => {
      patchValues(next);
      const building = next.resourceId ? buildingOfResource(next.resourceId, resources) : undefined;
      if (building) setBuilding(building);
    },
    [patchValues, resources],
  );

  const setBuildingId = useCallback(
    (next: string) => {
      setBuilding(next);
      patchValues({ resourceId: resourceInBuilding(values.resourceId, next, resources) });
    },
    [patchValues, resources, values.resourceId],
  );

  const { startDate, startTime, endDate, endTime, attendees } = values;
  const immediate = useMemo(
    () => statusQuery({ startDate, startTime, endDate, endTime, attendees }, type),
    [startDate, startTime, endDate, endTime, attendees, type],
  );
  const query = useDebouncedValue(immediate, STATUS_DEBOUNCE_MS);
  const problem = windowProblem(planWindow({ startDate, startTime, endDate, endTime }));

  return {
    booking: { values, patch, reset },
    buildingId,
    setBuildingId,
    type,
    setType,
    minCapacity: minCapacityOf(attendees),
    problem,
    query: problem ? null : query,
  };
}

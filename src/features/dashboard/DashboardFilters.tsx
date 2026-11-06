'use client';

import type { ReservationPurpose, ReservationStatus } from '@/api/types';
import { Field } from '@/components/shared/Field';
import type { DashboardFilter } from '@/lib/dashboard-filter';
import { dashboardLabels as labels, purposeLabels, reservationStatusLabels } from '@/lib/labels';

interface DashboardFiltersProps {
  filter: DashboardFilter;
  rangeError: boolean;
  onChange: (changes: Partial<DashboardFilter>) => void;
}

const STATUSES = Object.keys(reservationStatusLabels) as ReservationStatus[];
const PURPOSES = Object.keys(purposeLabels) as ReservationPurpose[];

export function DashboardFilters({ filter, rangeError, onChange }: DashboardFiltersProps) {
  return (
    <form
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      onSubmit={(event) => event.preventDefault()}
    >
      <Field label={labels.from}>
        <input
          type="date"
          className="field"
          value={filter.from}
          max={filter.to || undefined}
          onChange={(event) => onChange({ from: event.target.value, page: 1 })}
        />
      </Field>
      <Field label={labels.to} error={rangeError ? labels.invalidRange : undefined}>
        <input
          type="date"
          className="field"
          value={filter.to}
          min={filter.from || undefined}
          onChange={(event) => onChange({ to: event.target.value, page: 1 })}
        />
      </Field>
      <Field label={labels.status}>
        <select
          className="field"
          value={filter.status}
          onChange={(event) =>
            onChange({ status: event.target.value as DashboardFilter['status'], page: 1 })
          }
        >
          <option value="">{labels.allStatuses}</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {reservationStatusLabels[status]}
            </option>
          ))}
        </select>
      </Field>
      <Field label={labels.purpose}>
        <select
          className="field"
          value={filter.purpose}
          onChange={(event) =>
            onChange({ purpose: event.target.value as DashboardFilter['purpose'], page: 1 })
          }
        >
          <option value="">{labels.allPurposes}</option>
          {PURPOSES.map((purpose) => (
            <option key={purpose} value={purpose}>
              {purposeLabels[purpose]}
            </option>
          ))}
        </select>
      </Field>
    </form>
  );
}

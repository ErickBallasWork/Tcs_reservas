'use client';

import { Field } from '@/components/shared/Field';
import { TIME_OPTIONS } from '@/lib/booking-time';
import type { BookingFormValues } from '@/lib/booking-form';
import { bookingLabels as labels, catalogResourceTypeLabels, purposeLabels } from '@/lib/labels';
import { resourceLabel, type BookableResource } from '@/lib/resource-options';
import type { ReservationPurpose, ResourceType } from '@/api/types';

const PURPOSES: ReservationPurpose[] = ['TRAINING', 'INTERNAL_MEETING', 'CLIENT_MEETING'];
const GROUP_ORDER: ResourceType[] = ['MEETING_ROOM', 'AI_LAB', 'LAPTOP'];

interface BookingFieldsProps {
  values: BookingFormValues;
  resources: readonly BookableResource[];
  selected: BookableResource;
  minDate?: string;
  onChange: (patch: Partial<BookingFormValues>) => void;
}

function TimeSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <select className="field" value={value} onChange={(event) => onChange(event.target.value)}>
        {TIME_OPTIONS.map((time) => (
          <option key={time} value={time}>
            {time}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function BookingFields({
  values,
  resources,
  selected,
  minDate,
  onChange,
}: BookingFieldsProps) {
  return (
    <>
      <Field label={labels.resource}>
        <select
          className="field"
          value={values.resourceId}
          onChange={(event) => onChange({ resourceId: event.target.value })}
        >
          {GROUP_ORDER.map((type) => {
            const group = resources.filter((resource) => resource.type === type);
            if (group.length === 0) return null;
            return (
              <optgroup key={type} label={labels.groups[type] ?? catalogResourceTypeLabels[type]}>
                {group.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resourceLabel(resource)}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={labels.startDate}>
          <input
            className="field"
            type="date"
            min={minDate}
            value={values.startDate}
            onChange={(event) => onChange({ startDate: event.target.value })}
          />
        </Field>
        <TimeSelect
          label={labels.startTime}
          value={values.startTime}
          onChange={(startTime) => onChange({ startTime })}
        />
        <Field label={labels.endDate}>
          <input
            className="field"
            type="date"
            min={values.startDate}
            value={values.endDate}
            onChange={(event) => onChange({ endDate: event.target.value })}
          />
        </Field>
        <TimeSelect
          label={labels.endTime}
          value={values.endTime}
          onChange={(endTime) => onChange({ endTime })}
        />
      </div>

      <Field label={labels.purpose}>
        <select
          className="field"
          value={values.purpose}
          onChange={(event) => onChange({ purpose: event.target.value as ReservationPurpose | '' })}
        >
          <option value="">{labels.choosePurpose}</option>
          {PURPOSES.map((purpose) => (
            <option key={purpose} value={purpose}>
              {purposeLabels[purpose]}
            </option>
          ))}
        </select>
      </Field>

      {selected.type !== 'LAPTOP' && (
        <Field label={`${labels.attendees} (${labels.attendeesMax(selected.capacity)})`}>
          <input
            className="field"
            type="number"
            inputMode="numeric"
            min={1}
            max={selected.capacity}
            value={values.attendees}
            onChange={(event) => onChange({ attendees: event.target.value })}
          />
        </Field>
      )}

      <Field label={labels.detail}>
        <textarea
          className="field min-h-[76px] py-2.5"
          maxLength={1000}
          value={values.detail}
          onChange={(event) => onChange({ detail: event.target.value })}
        />
      </Field>
    </>
  );
}

'use client';

import { useState } from 'react';
import { messageForError } from '@/api/error-messages';
import { Field } from '@/components/shared/Field';
import {
  useClosedDates,
  useCreateClosedDate,
  useDeleteClosedDate,
} from '@/features/operating-hours/useOperatingHours';
import { firstBookableDate, formatDay } from '@/lib/booking-time';
import { operatingHoursLabels as labels } from '@/lib/labels';

interface ScopeOption {
  id: string;
  label: string;
}

export function ClosedDatesPanel({ scopes }: { scopes: readonly ScopeOption[] }) {
  const closedDates = useClosedDates();
  const create = useCreateClosedDate();
  const remove = useDeleteClosedDate();
  const [date, setDate] = useState(firstBookableDate());
  const [name, setName] = useState('');
  const [resourceId, setResourceId] = useState('');
  const [error, setError] = useState('');

  const scopeName = (id: string | null) =>
    id === null ? labels.allResources : (scopes.find((scope) => scope.id === id)?.label ?? id);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!date || name.trim().length === 0) {
      setError(labels.closedDateRequired);
      return;
    }
    setError('');
    create.mutate(
      { date, name: name.trim(), resourceId: resourceId || undefined },
      { onSuccess: () => setName('') },
    );
  };

  return (
    <section className="flex flex-col gap-3" aria-label={labels.closedDatesTitle}>
      <h2 className="text-base font-bold text-brand">{labels.closedDatesTitle}</h2>

      <form onSubmit={handleSubmit} noValidate className="panel grid gap-3 md:grid-cols-4">
        <Field label={labels.closedDate}>
          <input
            className="field"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </Field>
        <Field label={labels.closedName}>
          <input
            className="field"
            maxLength={150}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <Field label={labels.closedScope}>
          <select
            className="field"
            value={resourceId}
            onChange={(event) => setResourceId(event.target.value)}
          >
            <option value="">{labels.allResources}</option>
            {scopes.map((scope) => (
              <option key={scope.id} value={scope.id}>
                {scope.label}
              </option>
            ))}
          </select>
        </Field>
        <button type="submit" className="btn btn-gold self-end" disabled={create.isPending}>
          {create.isPending ? labels.saving : labels.closeDay}
        </button>
        {(error || create.isError) && (
          <p role="alert" className="font-semibold text-red-700 md:col-span-4">
            {error || messageForError(create.error)}
          </p>
        )}
      </form>

      {closedDates.isPending && (
        <p role="status" className="flex items-center gap-2">
          <span className="spinner" aria-hidden />
          {labels.loading}
        </p>
      )}
      {closedDates.isError && (
        <p role="alert" className="font-semibold text-red-700">
          {messageForError(closedDates.error)}
        </p>
      )}
      {closedDates.data && closedDates.data.length === 0 && (
        <p className="text-ink-soft">{labels.noClosedDates}</p>
      )}
      {closedDates.data && closedDates.data.length > 0 && (
        <ul className="flex flex-col gap-2">
          {closedDates.data.map((item) => (
            <li
              key={item.id}
              className="panel flex flex-wrap items-center justify-between gap-2 p-3"
            >
              <div className="flex flex-col">
                <b className="text-brand">{item.name}</b>
                <small className="text-ink-soft">
                  {formatDay(item.date)} · {scopeName(item.resourceId)}
                </small>
              </div>
              <button
                type="button"
                className="btn btn-outline"
                disabled={remove.isPending}
                onClick={() => remove.mutate(item.id)}
              >
                {labels.reopen}
              </button>
            </li>
          ))}
        </ul>
      )}
      {remove.isError && (
        <p role="alert" className="font-semibold text-red-700">
          {messageForError(remove.error)}
        </p>
      )}
    </section>
  );
}

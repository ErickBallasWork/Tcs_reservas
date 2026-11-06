'use client';

import { useState } from 'react';
import { messageForError } from '@/api/error-messages';
import type { OperatingHours } from '@/api/types';
import { useReplaceOperatingHours } from '@/features/operating-hours/useOperatingHours';
import { operatingHoursLabels as labels, weekdayFullLabels } from '@/lib/labels';
import {
  CLOSE_OPTIONS,
  DEFAULT_WINDOW,
  OPEN_OPTIONS,
  WEEK_ORDER,
  weekFromWindows,
  weekHasProblem,
  windowsFromWeek,
  type DayWindow,
  type WeekForm,
} from '@/lib/operating-hours-form';

interface WeeklyScheduleEditorProps {
  scopeResourceId: string | undefined;
  current: OperatingHours;
}

function TimeSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <select
      aria-label={label}
      className="field"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export function WeeklyScheduleEditor({ scopeResourceId, current }: WeeklyScheduleEditorProps) {
  const [week, setWeek] = useState<WeekForm>(() => weekFromWindows(current.windows));
  const [saved, setSaved] = useState(false);
  const replace = useReplaceOperatingHours();
  const hasProblem = weekHasProblem(week);

  const change = (day: number, next: DayWindow[]) => {
    setSaved(false);
    setWeek({ ...week, [day]: next });
  };

  const save = (windows = windowsFromWeek(week)) =>
    replace.mutate({ resourceId: scopeResourceId, windows }, { onSuccess: () => setSaved(true) });

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3">
        {WEEK_ORDER.map((day) => (
          <li key={day} className="panel flex flex-col gap-2 p-3">
            <div className="flex items-center justify-between gap-2">
              <b className="text-brand">{weekdayFullLabels[day]}</b>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => change(day, [...week[day], DEFAULT_WINDOW])}
              >
                {labels.addWindow}
              </button>
            </div>
            {week[day].length === 0 && <small className="text-ink-soft">{labels.closedDay}</small>}
            {week[day].map((window, index) => (
              <div key={index} className="flex flex-wrap items-center gap-2">
                <TimeSelect
                  label={`${labels.opens} ${weekdayFullLabels[day]}`}
                  value={window.opensAt}
                  options={OPEN_OPTIONS}
                  onChange={(opensAt) =>
                    change(
                      day,
                      week[day].map((w, i) => (i === index ? { ...w, opensAt } : w)),
                    )
                  }
                />
                <span aria-hidden>–</span>
                <TimeSelect
                  label={`${labels.closes} ${weekdayFullLabels[day]}`}
                  value={window.closesAt}
                  options={CLOSE_OPTIONS}
                  onChange={(closesAt) =>
                    change(
                      day,
                      week[day].map((w, i) => (i === index ? { ...w, closesAt } : w)),
                    )
                  }
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() =>
                    change(
                      day,
                      week[day].filter((_, i) => i !== index),
                    )
                  }
                >
                  {labels.removeWindow}
                </button>
              </div>
            ))}
          </li>
        ))}
      </ul>

      {hasProblem && (
        <p role="alert" className="font-semibold text-red-700">
          {labels.invalid}
        </p>
      )}
      {replace.isError && (
        <p role="alert" className="font-semibold text-red-700">
          {messageForError(replace.error)}
        </p>
      )}
      {saved && (
        <p role="status" className="font-semibold text-brand">
          {labels.saved}
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <button
          type="button"
          className="btn btn-gold"
          disabled={replace.isPending || hasProblem}
          onClick={() => save()}
        >
          {replace.isPending ? labels.saving : labels.save}
        </button>
        {current.source === 'OWN' || (!scopeResourceId && current.source === 'GLOBAL') ? (
          <button
            type="button"
            className="btn btn-outline"
            disabled={replace.isPending}
            onClick={() => {
              setWeek(weekFromWindows([]));
              save([]);
            }}
          >
            {scopeResourceId ? labels.removeOwn : labels.removeGlobal}
          </button>
        ) : null}
      </div>
    </div>
  );
}

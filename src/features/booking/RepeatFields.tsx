'use client';

import { Field } from '@/components/shared/Field';
import {
  REPEAT_COUNT_OPTIONS,
  REPEAT_INTERVAL_OPTIONS,
  type RepeatValues,
} from '@/lib/booking-form';
import { bookingLabels as labels, weekdayShortLabels } from '@/lib/labels';
import { cn } from '@/lib/utils';

interface RepeatFieldsProps {
  value: RepeatValues;
  startWeekday: number;
  onChange: (next: RepeatValues) => void;
}

export function RepeatFields({ value, startWeekday, onChange }: RepeatFieldsProps) {
  const toggleWeekday = (weekday: number) => {
    if (weekday === startWeekday) return;
    const weekdays = value.weekdays.includes(weekday)
      ? value.weekdays.filter((day) => day !== weekday)
      : [...value.weekdays, weekday];
    onChange({ ...value, weekdays });
  };

  return (
    <fieldset className="flex flex-col gap-3 rounded-[10px] border border-line p-3">
      <label className="flex items-center gap-2 font-semibold text-brand">
        <input
          type="checkbox"
          checked={value.enabled}
          onChange={(event) => onChange({ ...value, enabled: event.target.checked })}
        />
        {labels.repeat}
      </label>

      {value.enabled && (
        <>
          <Field label={labels.repeatEvery}>
            <select
              className="field"
              value={value.intervalWeeks}
              onChange={(event) =>
                onChange({ ...value, intervalWeeks: Number(event.target.value) })
              }
            >
              {REPEAT_INTERVAL_OPTIONS.map((weeks) => (
                <option key={weeks} value={weeks}>
                  {labels.everyWeeks(weeks)}
                </option>
              ))}
            </select>
          </Field>

          <div className="flex flex-col gap-1.5">
            <span className="field-label">{labels.weekdays}</span>
            <div className="flex flex-wrap gap-1.5">
              {weekdayShortLabels.map((name, weekday) => (
                <button
                  key={name}
                  type="button"
                  aria-pressed={value.weekdays.includes(weekday)}
                  disabled={weekday === startWeekday}
                  onClick={() => toggleWeekday(weekday)}
                  className={cn(
                    'min-h-11 min-w-12 rounded-lg border border-line px-2 text-sm font-semibold',
                    value.weekdays.includes(weekday)
                      ? 'bg-brand text-white'
                      : 'bg-white text-brand hover:bg-soft',
                  )}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <Field label={labels.limit}>
            <select
              className="field"
              value={value.limit}
              onChange={(event) =>
                onChange({ ...value, limit: event.target.value === 'until' ? 'until' : 'count' })
              }
            >
              <option value="count">{labels.limitCount}</option>
              <option value="until">{labels.limitUntil}</option>
            </select>
          </Field>

          {value.limit === 'count' ? (
            <Field label={labels.occurrenceCount}>
              <select
                className="field"
                value={value.occurrenceCount}
                onChange={(event) =>
                  onChange({ ...value, occurrenceCount: Number(event.target.value) })
                }
              >
                {REPEAT_COUNT_OPTIONS.map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <Field label={labels.until}>
              <input
                className="field"
                type="date"
                value={value.until}
                onChange={(event) => onChange({ ...value, until: event.target.value })}
              />
            </Field>
          )}
        </>
      )}
    </fieldset>
  );
}

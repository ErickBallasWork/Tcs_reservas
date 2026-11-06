'use client';

import { useState } from 'react';
import { messageForError } from '@/api/error-messages';
import type { FloorPlanDetail } from '@/api/types';
import { Field } from '@/components/shared/Field';
import { Switch } from '@/components/ui/switch';
import { useUpdateFloorPlan } from '@/features/floor-plans/useFloorPlans';
import { parsePlanForm, type PlanForm } from '@/lib/floor-plan/zone-schema';
import { floorPlanAdminLabels as labels } from '@/lib/labels';

export function PlanSettings({ plan }: { plan: FloorPlanDetail }) {
  const update = useUpdateFloorPlan();
  const [form, setForm] = useState<PlanForm>({
    name: plan.name,
    width: String(plan.width),
    height: String(plan.height),
  });
  const [errors, setErrors] = useState<Partial<Record<keyof PlanForm, string>>>({});
  const switchId = `plan-active-${plan.id}`;

  const save = () => {
    const parsed = parsePlanForm(form);
    if (!parsed.success) {
      setErrors(parsed.errors);
      return;
    }
    setErrors({});
    update.mutate({ id: plan.id, body: parsed.data });
  };

  return (
    <details className="panel flex flex-col gap-3">
      <summary className="min-h-11 cursor-pointer py-2.5 font-bold text-brand">
        {labels.planProperties}
      </summary>
      <div className="flex flex-col gap-3 pt-2">
        <Field label={labels.fields.name} error={errors.name}>
          <input
            className="field"
            maxLength={150}
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label={labels.fields.width} error={errors.width}>
            <input
              className="field"
              type="number"
              inputMode="numeric"
              value={form.width}
              onChange={(event) => setForm({ ...form, width: event.target.value })}
            />
          </Field>
          <Field label={labels.fields.height} error={errors.height}>
            <input
              className="field"
              type="number"
              inputMode="numeric"
              value={form.height}
              onChange={(event) => setForm({ ...form, height: event.target.value })}
            />
          </Field>
        </div>
        <button
          type="button"
          className="btn btn-outline"
          disabled={update.isPending}
          onClick={save}
        >
          {update.isPending ? labels.saving : labels.savePlan}
        </button>
        <div className="flex min-h-11 items-center justify-between gap-3">
          <label htmlFor={switchId} className="text-sm font-semibold">
            {labels.fields.planActive}
          </label>
          <Switch
            id={switchId}
            checked={plan.isActive}
            disabled={update.isPending}
            onCheckedChange={(isActive) => update.mutate({ id: plan.id, body: { isActive } })}
          />
        </div>
        {update.isError && (
          <p role="alert" className="text-sm font-semibold text-red-700">
            {messageForError(update.error)}
          </p>
        )}
      </div>
    </details>
  );
}

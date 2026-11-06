'use client';

import { useState } from 'react';
import type { CatalogBuilding, FloorPlanDetail } from '@/api/types';
import { Field } from '@/components/shared/Field';
import { FormDialog } from '@/components/shared/FormDialog';
import { useCreateFloorPlan } from '@/features/floor-plans/useFloorPlans';
import { parsePlanForm, type PlanForm } from '@/lib/floor-plan/zone-schema';
import { floorPlanAdminLabels as labels } from '@/lib/labels';

const DEFAULT_WIDTH = '900';
const DEFAULT_HEIGHT = '600';

interface CreateFloorPlanDialogProps {
  building: CatalogBuilding;
  onCreated: (plan: FloorPlanDetail) => void;
  onClose: () => void;
}

export function CreateFloorPlanDialog({
  building,
  onCreated,
  onClose,
}: CreateFloorPlanDialogProps) {
  const create = useCreateFloorPlan();
  const [form, setForm] = useState<PlanForm>({
    name: labels.defaultPlanName,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof PlanForm, string>>>({});

  const submit = () => {
    const parsed = parsePlanForm(form);
    if (!parsed.success) {
      setErrors(parsed.errors);
      return;
    }
    setErrors({});
    create.mutate({ buildingId: building.id, level: 0, ...parsed.data }, { onSuccess: onCreated });
  };

  return (
    <FormDialog
      title={labels.createTitle}
      description={building.name}
      isPending={create.isPending}
      error={create.error}
      onSubmit={submit}
      onClose={onClose}
    >
      <Field label={labels.fields.name} error={errors.name}>
        <input
          className="field"
          maxLength={150}
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
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
    </FormDialog>
  );
}

'use client';

import { useState } from 'react';
import type { Building } from '@/api/types';
import { Field } from '@/components/shared/Field';
import { FormDialog } from '@/components/shared/FormDialog';
import { useCreateBuilding, useUpdateBuilding } from '@/features/catalog/admin/useCatalogAdmin';
import {
  parseBuildingForm,
  toCreateBuildingBody,
  type BuildingForm,
  type FormErrors,
} from '@/lib/catalog-form';
import { catalogAdminLabels as labels } from '@/lib/labels';

interface BuildingFormDialogProps {
  building?: Building;
  onClose: () => void;
}

export function BuildingFormDialog({ building, onClose }: BuildingFormDialogProps) {
  const create = useCreateBuilding();
  const update = useUpdateBuilding();
  const mutation = building ? update : create;
  const [form, setForm] = useState<BuildingForm>({
    name: building?.name ?? '',
    address: building?.address ?? '',
  });
  const [errors, setErrors] = useState<FormErrors<BuildingForm>>({});

  const handleSubmit = () => {
    const parsed = parseBuildingForm(form);
    if (!parsed.success) {
      setErrors(parsed.errors);
      return;
    }
    setErrors({});
    if (building) {
      update.mutate({ id: building.id, body: parsed.data }, { onSuccess: onClose });
    } else {
      create.mutate(toCreateBuildingBody(parsed.data), { onSuccess: onClose });
    }
  };

  return (
    <FormDialog
      title={building ? labels.buildings.editTitle : labels.buildings.createTitle}
      isPending={mutation.isPending}
      error={mutation.error}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      <Field label={labels.fields.name} error={errors.name}>
        <input
          className="field"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
        />
      </Field>
      <Field label={labels.fields.address} error={errors.address}>
        <input
          className="field"
          value={form.address}
          onChange={(event) => setForm({ ...form, address: event.target.value })}
        />
      </Field>
    </FormDialog>
  );
}

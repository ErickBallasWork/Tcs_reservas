'use client';

import { useState } from 'react';
import type { CatalogItem } from '@/api/types';
import { Field } from '@/components/shared/Field';
import { FormDialog } from '@/components/shared/FormDialog';
import { useCreateResource, useUpdateResource } from '@/features/catalog/admin/useCatalogAdmin';
import { parseLaptopForm, type FormErrors, type LaptopForm } from '@/lib/catalog-form';
import { catalogAdminLabels as labels } from '@/lib/labels';

export interface LabOption {
  id: string;
  name: string;
  buildingName: string;
}

interface LaptopFormDialogProps {
  laptop?: CatalogItem;
  labs: LabOption[];
  defaultLabId: string;
  onClose: () => void;
}

export function LaptopFormDialog({ laptop, labs, defaultLabId, onClose }: LaptopFormDialogProps) {
  const create = useCreateResource();
  const update = useUpdateResource();
  const mutation = laptop ? update : create;
  const [form, setForm] = useState<LaptopForm>({
    name: laptop?.name ?? '',
    assetTag: laptop?.assetTag ?? '',
    labId: laptop?.parentResourceId ?? defaultLabId,
  });
  const [errors, setErrors] = useState<FormErrors<LaptopForm>>({});

  const handleSubmit = () => {
    const parsed = parseLaptopForm(form);
    if (!parsed.success) {
      setErrors(parsed.errors);
      return;
    }
    setErrors({});
    if (laptop) {
      const { name, assetTag, parentResourceId } = parsed.data;
      update.mutate(
        {
          id: laptop.id,
          body: {
            name,
            assetTag: assetTag ?? '',
            parentResourceId:
              parentResourceId === laptop.parentResourceId ? undefined : parentResourceId,
          },
        },
        { onSuccess: onClose },
      );
    } else {
      create.mutate(parsed.data, { onSuccess: onClose });
    }
  };

  return (
    <FormDialog
      title={laptop ? labels.laptops.editTitle : labels.laptops.createTitle}
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
      <Field label={labels.fields.assetTag} error={errors.assetTag}>
        <input
          className="field"
          value={form.assetTag}
          onChange={(event) => setForm({ ...form, assetTag: event.target.value })}
        />
      </Field>
      <Field label={labels.fields.lab} error={errors.labId}>
        <select
          className="field"
          value={form.labId}
          onChange={(event) => setForm({ ...form, labId: event.target.value })}
        >
          <option value="">{labels.chooseOption}</option>
          {labs.map((lab) => (
            <option key={lab.id} value={lab.id}>
              {lab.name} · {lab.buildingName}
            </option>
          ))}
        </select>
      </Field>
      <p className="text-sm text-ink-soft">
        {laptop ? labels.laptops.moveHint : labels.laptops.newLabHint}
      </p>
    </FormDialog>
  );
}

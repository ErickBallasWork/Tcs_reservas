'use client';

import { useState } from 'react';
import { messageForError } from '@/api/error-messages';
import type { CatalogResource } from '@/api/types';
import { Field } from '@/components/shared/Field';
import { useUpdateResource } from '@/features/catalog/admin/useCatalogAdmin';
import { catalogAdminLabels, floorPlanAdminLabels as labels } from '@/lib/labels';

const CAPACITY_PATTERN = /^[1-9]\d{0,5}$/;

export function CapacityEditor({ resource }: { resource: CatalogResource }) {
  const [value, setValue] = useState(String(resource.capacity));
  const [saved, setSaved] = useState(false);
  const update = useUpdateResource();
  const valid = CAPACITY_PATTERN.test(value.trim());
  const changed = value.trim() !== String(resource.capacity);

  const save = () => {
    if (!valid) return;
    setSaved(false);
    update.mutate(
      { id: resource.id, body: { capacity: Number(value.trim()) } },
      { onSuccess: () => setSaved(true) },
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-[1fr_auto] items-end gap-2">
        <Field
          label={labels.fields.capacity}
          error={valid ? undefined : catalogAdminLabels.errors.capacityInvalid}
        >
          <input
            className="field"
            type="number"
            inputMode="numeric"
            min={1}
            value={value}
            onChange={(event) => {
              setSaved(false);
              setValue(event.target.value);
            }}
          />
        </Field>
        <button
          type="button"
          className="btn btn-outline"
          disabled={!valid || !changed || update.isPending}
          onClick={save}
        >
          {update.isPending ? labels.saving : labels.updateCapacity}
        </button>
      </div>
      {update.isError && (
        <p role="alert" className="text-sm font-semibold text-red-700">
          {messageForError(update.error)}
        </p>
      )}
      {saved && (
        <p role="status" className="text-sm text-ink-soft">
          {labels.capacityUpdated}
        </p>
      )}
    </div>
  );
}

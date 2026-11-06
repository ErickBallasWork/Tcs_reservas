'use client';

import { useState } from 'react';
import type { CatalogBuilding, CatalogResource } from '@/api/types';
import { Field } from '@/components/shared/Field';
import { FormDialog } from '@/components/shared/FormDialog';
import { useCreateResource, useUpdateResource } from '@/features/catalog/admin/useCatalogAdmin';
import { parseRoomOrLabForm, type FormErrors, type RoomOrLabForm } from '@/lib/catalog-form';
import { catalogAdminLabels as labels, catalogResourceTypeLabels } from '@/lib/labels';

function initialForm(resource: CatalogResource | undefined, buildingId: string): RoomOrLabForm {
  if (!resource) {
    return { type: '', name: '', buildingId, capacity: '', equipment: '', rules: '' };
  }
  return {
    type: resource.type === 'LAPTOP' ? '' : resource.type,
    name: resource.name,
    buildingId: resource.buildingId,
    capacity: String(resource.capacity),
    equipment: resource.equipment ?? '',
    rules: resource.rules ?? '',
  };
}

interface ResourceFormDialogProps {
  resource?: CatalogResource;
  buildings: CatalogBuilding[];
  defaultBuildingId: string;
  onClose: () => void;
}

export function ResourceFormDialog({
  resource,
  buildings,
  defaultBuildingId,
  onClose,
}: ResourceFormDialogProps) {
  const create = useCreateResource();
  const update = useUpdateResource();
  const mutation = resource ? update : create;
  const [form, setForm] = useState<RoomOrLabForm>(() => initialForm(resource, defaultBuildingId));
  const [errors, setErrors] = useState<FormErrors<RoomOrLabForm>>({});
  const activeBuildings = buildings.filter(
    (building) => building.isActive || building.id === resource?.buildingId,
  );
  const movesLab = resource?.type === 'AI_LAB' && form.buildingId !== resource.buildingId;

  const handleSubmit = () => {
    const parsed = parseRoomOrLabForm(form);
    if (!parsed.success) {
      setErrors(parsed.errors);
      return;
    }
    setErrors({});
    if (resource) {
      const { name, capacity, equipment, rules, buildingId } = parsed.data;
      update.mutate(
        {
          id: resource.id,
          body: {
            name,
            capacity,
            equipment: equipment ?? '',
            rules: rules ?? '',
            buildingId: buildingId === resource.buildingId ? undefined : buildingId,
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
      title={resource ? labels.resources.editTitle : labels.resources.createTitle}
      isPending={mutation.isPending}
      error={mutation.error}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      <Field label={labels.fields.type} error={errors.type}>
        <select
          className="field"
          value={form.type}
          disabled={resource !== undefined}
          onChange={(event) =>
            setForm({ ...form, type: event.target.value as RoomOrLabForm['type'] })
          }
        >
          <option value="">{labels.chooseOption}</option>
          <option value="MEETING_ROOM">{catalogResourceTypeLabels.MEETING_ROOM}</option>
          <option value="AI_LAB">{catalogResourceTypeLabels.AI_LAB}</option>
        </select>
      </Field>
      <Field label={labels.fields.name} error={errors.name}>
        <input
          className="field"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
        />
      </Field>
      <Field label={labels.fields.building} error={errors.buildingId}>
        <select
          className="field"
          value={form.buildingId}
          onChange={(event) => setForm({ ...form, buildingId: event.target.value })}
        >
          <option value="">{labels.chooseOption}</option>
          {activeBuildings.map((building) => (
            <option key={building.id} value={building.id}>
              {building.name}
            </option>
          ))}
        </select>
      </Field>
      {movesLab && <p className="text-sm text-ink-soft">{labels.resources.moveHint}</p>}
      <Field label={labels.fields.capacity} error={errors.capacity}>
        <input
          className="field"
          inputMode="numeric"
          value={form.capacity}
          onChange={(event) => setForm({ ...form, capacity: event.target.value })}
        />
      </Field>
      <Field label={labels.fields.equipment} error={errors.equipment}>
        <textarea
          className="field min-h-20 py-2"
          value={form.equipment}
          onChange={(event) => setForm({ ...form, equipment: event.target.value })}
        />
      </Field>
      <Field label={labels.fields.rules} error={errors.rules}>
        <textarea
          className="field min-h-20 py-2"
          value={form.rules}
          onChange={(event) => setForm({ ...form, rules: event.target.value })}
        />
      </Field>
    </FormDialog>
  );
}

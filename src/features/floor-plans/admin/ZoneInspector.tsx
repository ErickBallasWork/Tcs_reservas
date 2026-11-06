'use client';

import { Trash2 } from 'lucide-react';
import type { CatalogBuilding } from '@/api/types';
import { Field } from '@/components/shared/Field';
import { Switch } from '@/components/ui/switch';
import { CapacityEditor } from '@/features/floor-plans/admin/CapacityEditor';
import { LabSeatsEditor } from '@/features/floor-plans/admin/LabSeatsEditor';
import type { FloorZoneKind } from '@/lib/floor-plan/types';
import {
  linkableResources,
  RESOURCE_TYPE_FOR_KIND,
  type EditorZone,
  type ZoneFieldErrors,
} from '@/lib/floor-plan/zone-schema';
import {
  catalogAdminLabels,
  floorPlanAdminLabels as labels,
  floorZoneKindLabels,
} from '@/lib/labels';

const KINDS: readonly FloorZoneKind[] = ['ROOM', 'LAB', 'DECORATIVE', 'LABEL'];
const GEOMETRY = ['x', 'y', 'width', 'height'] as const;

type ZonePatch = Partial<Omit<EditorZone, 'key' | 'id'>>;

interface ZoneInspectorProps {
  zone: EditorZone;
  zones: readonly EditorZone[];
  building: CatalogBuilding | undefined;
  errors: ZoneFieldErrors;
  onChange: (patch: ZonePatch) => void;
  onDelete: () => void;
}

function isKind(value: string): value is FloorZoneKind {
  return KINDS.some((kind) => kind === value);
}

export function ZoneInspector({
  zone,
  zones,
  building,
  errors,
  onChange,
  onDelete,
}: ZoneInspectorProps) {
  const resources = building?.resources ?? [];
  const options = linkableResources(zone, zones, resources);
  const canBeReservable = RESOURCE_TYPE_FOR_KIND[zone.kind] !== undefined;
  const linked = zone.isReservable
    ? resources.find((resource) => resource.id === zone.resourceId)
    : undefined;
  const switchId = `reservable-${zone.key}`;

  return (
    <section className="flex flex-col gap-3" aria-label={labels.zoneProperties}>
      <h2 className="text-base font-bold text-brand">{labels.zoneProperties}</h2>
      <Field label={labels.fields.name} error={errors.name}>
        <input
          className="field"
          maxLength={100}
          value={zone.name}
          onChange={(event) => onChange({ name: event.target.value })}
        />
      </Field>
      <Field label={labels.fields.kind}>
        <select
          className="field"
          value={zone.kind}
          onChange={(event) => isKind(event.target.value) && onChange({ kind: event.target.value })}
        >
          {KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {floorZoneKindLabels[kind]}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-2">
        {GEOMETRY.map((field) => (
          <Field key={field} label={labels.fields[field]} error={errors[field]}>
            <input
              className="field"
              type="number"
              inputMode="numeric"
              step={10}
              min={0}
              value={Number.isNaN(zone[field]) ? '' : zone[field]}
              onChange={(event) => onChange({ [field]: event.target.valueAsNumber })}
            />
          </Field>
        ))}
      </div>
      <small className="text-ink-soft">{labels.keyboardHint}</small>

      <div className="flex min-h-11 items-center justify-between gap-3">
        <label htmlFor={switchId} className="text-sm font-semibold">
          {labels.fields.reservable}
        </label>
        <Switch
          id={switchId}
          checked={zone.isReservable}
          disabled={!canBeReservable}
          onCheckedChange={(isReservable) => onChange({ isReservable })}
        />
      </div>
      {errors.isReservable && (
        <p role="alert" className="text-xs font-semibold text-red-700">
          {errors.isReservable}
        </p>
      )}

      {zone.isReservable && (
        <Field label={labels.fields.resource} error={errors.resourceId}>
          <select
            className="field"
            value={zone.resourceId ?? ''}
            onChange={(event) => onChange({ resourceId: event.target.value || null })}
          >
            <option value="">{labels.chooseResource}</option>
            {options.map((resource) => (
              <option key={resource.id} value={resource.id}>
                {resource.isActive
                  ? resource.name
                  : `${resource.name} (${catalogAdminLabels.inactive})`}
              </option>
            ))}
          </select>
        </Field>
      )}
      {zone.isReservable && options.length === 0 && (
        <small className="text-ink-soft">{labels.noResourcesForKind}</small>
      )}

      {linked && <CapacityEditor key={linked.id} resource={linked} />}
      {linked && zone.kind === 'LAB' && building && (
        <LabSeatsEditor lab={linked} buildingName={building.name} />
      )}
      {zone.kind === 'LAB' && !linked && (
        <small className="text-ink-soft">{labels.linkResourceFirst}</small>
      )}

      <button type="button" className="btn btn-outline" onClick={onDelete}>
        <Trash2 className="size-4" aria-hidden />
        {labels.deleteZone}
      </button>
    </section>
  );
}

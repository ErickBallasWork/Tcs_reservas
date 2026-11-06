'use client';

import { Plus } from 'lucide-react';
import { useEffect, useMemo, useReducer, useState } from 'react';
import { messageForError } from '@/api/error-messages';
import type { CatalogBuilding, FloorPlanDetail } from '@/api/types';
import { EditorCanvas } from '@/features/floor-plans/admin/EditorCanvas';
import { PlanSettings } from '@/features/floor-plans/admin/PlanSettings';
import { ZoneInspector } from '@/features/floor-plans/admin/ZoneInspector';
import { useReplaceFloorZones } from '@/features/floor-plans/useFloorPlans';
import { newZoneRect } from '@/lib/floor-plan/editor-geometry';
import {
  editorReducer,
  initialEditorState,
  isDirty,
  selectedZone,
} from '@/lib/floor-plan/editor-state';
import type { FloorResourceType } from '@/lib/floor-plan/types';
import { toEditorZone, validateZones, type ZoneErrors } from '@/lib/floor-plan/zone-schema';
import { floorPlanAdminLabels as labels } from '@/lib/labels';

interface FloorPlanEditorProps {
  plan: FloorPlanDetail;
  building: CatalogBuilding | undefined;
  onDirtyChange: (dirty: boolean) => void;
}

function isFloorResourceType(type: string): type is FloorResourceType {
  return type === 'MEETING_ROOM' || type === 'AI_LAB';
}

export function FloorPlanEditor({ plan, building, onDirtyChange }: FloorPlanEditorProps) {
  const [state, dispatch] = useReducer(editorReducer, plan.zones, (zones) =>
    initialEditorState(zones.map(toEditorZone)),
  );
  const [errors, setErrors] = useState<ZoneErrors>({});
  const [saved, setSaved] = useState(false);
  const replace = useReplaceFloorZones();
  const dirty = isDirty(state);
  const selected = selectedZone(state);

  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const resourceTypes = useMemo(
    () =>
      new Map(
        (building?.resources ?? []).flatMap((resource) =>
          isFloorResourceType(resource.type) ? [[resource.id, resource.type] as const] : [],
        ),
      ),
    [building],
  );

  const save = () => {
    setSaved(false);
    const result = validateZones(state.zones, plan, resourceTypes);
    if (!result.success) {
      setErrors(result.errors);
      const firstKey = Object.keys(result.errors)[0];
      if (firstKey) dispatch({ type: 'select', key: firstKey });
      return;
    }
    setErrors({});
    replace.mutate(
      { id: plan.id, body: { zones: result.zones } },
      {
        onSuccess: (updated) => {
          dispatch({ type: 'load', zones: updated.zones.map(toEditorZone) });
          setSaved(true);
        },
      },
    );
  };

  const discard = () => {
    setErrors({});
    setSaved(false);
    replace.reset();
    dispatch({ type: 'discard' });
  };

  const errorCount = Object.keys(errors).length;

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() =>
              dispatch({ type: 'add', rect: newZoneRect(plan), name: labels.newZoneName })
            }
          >
            <Plus className="size-4" aria-hidden />
            {labels.addZone}
          </button>
          <span className="flex-1" />
          {dirty && (
            <span role="status" className="text-sm font-semibold text-gold-ink">
              {labels.unsaved}
            </span>
          )}
          <button
            type="button"
            className="btn btn-outline"
            disabled={!dirty || replace.isPending}
            onClick={discard}
          >
            {labels.discard}
          </button>
          <button
            type="button"
            className="btn btn-gold"
            disabled={!dirty || replace.isPending}
            onClick={save}
          >
            {replace.isPending ? labels.saving : labels.save}
          </button>
        </div>
        {errorCount > 0 && (
          <p role="alert" className="alert">
            {labels.errors.invalidZones}
          </p>
        )}
        {replace.isError && (
          <p role="alert" className="alert">
            {messageForError(replace.error)}
          </p>
        )}
        {saved && !dirty && (
          <p role="status" className="text-sm font-semibold text-brand">
            {labels.saved}
          </p>
        )}
        <EditorCanvas
          size={plan}
          zones={state.zones}
          selectedKey={state.selectedKey}
          errors={errors}
          onSelect={(key) => dispatch({ type: 'select', key })}
          onChange={(key, rect) => dispatch({ type: 'update', key, patch: rect })}
        />
      </div>

      <aside className="flex flex-col gap-3 self-start">
        <div className="panel">
          {selected ? (
            <ZoneInspector
              key={selected.key}
              zone={selected}
              zones={state.zones}
              building={building}
              errors={errors[selected.key] ?? {}}
              onChange={(patch) => dispatch({ type: 'update', key: selected.key, patch })}
              onDelete={() => dispatch({ type: 'remove', key: selected.key })}
            />
          ) : (
            <p className="text-sm text-ink-soft">{labels.selectZoneHint}</p>
          )}
        </div>
        <PlanSettings key={`${plan.id}-${plan.width}-${plan.height}-${plan.name}`} plan={plan} />
      </aside>
    </div>
  );
}

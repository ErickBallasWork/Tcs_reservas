'use client';

import { useState } from 'react';
import type { CatalogBuilding, CatalogResource } from '@/api/types';
import { Tag } from '@/components/shared/Tag';
import { CatalogAdminBoundary } from '@/features/catalog/admin/CatalogAdminBoundary';
import { CatalogItemActions } from '@/features/catalog/admin/CatalogItemActions';
import { ResourceFormDialog } from '@/features/catalog/admin/ResourceFormDialog';
import { ToggleCatalogDialog } from '@/features/catalog/admin/ToggleCatalogDialog';
import { catalogAdminLabels as labels, catalogResourceTypeLabels } from '@/lib/labels';

type TypeFilter = '' | 'MEETING_ROOM' | 'AI_LAB';

interface ResourceRow {
  resource: CatalogResource;
  buildingName: string;
}

type OpenDialog =
  | { kind: 'create' }
  | { kind: 'edit'; resource: CatalogResource }
  | { kind: 'toggle'; resource: CatalogResource };

function ResourceCard({ row, onOpen }: { row: ResourceRow; onOpen: (dialog: OpenDialog) => void }) {
  const { resource, buildingName } = row;
  return (
    <li className="panel flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold">{resource.name}</p>
          <p className="truncate text-sm text-ink-soft">{buildingName}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Tag variant={resource.type === 'AI_LAB' ? 'gold' : 'default'}>
            {catalogResourceTypeLabels[resource.type]}
          </Tag>
          <Tag variant={resource.isActive ? 'default' : 'gold'}>
            {resource.isActive ? labels.active : labels.inactive}
          </Tag>
        </div>
      </div>
      <p className="text-sm">
        {resource.capacity} {resource.capacity === 1 ? 'persona' : 'personas'}
        {resource.type === 'AI_LAB' &&
          ` · ${labels.resources.laptopCount(resource.children.length)}`}
      </p>
      {resource.equipment && <p className="text-sm text-ink-soft">{resource.equipment}</p>}
      {resource.rules && <p className="text-sm text-ink-soft">{resource.rules}</p>}
      <CatalogItemActions
        isActive={resource.isActive}
        onEdit={() => onOpen({ kind: 'edit', resource })}
        onToggle={() => onOpen({ kind: 'toggle', resource })}
      />
    </li>
  );
}

function ResourcesList({ buildings }: { buildings: CatalogBuilding[] }) {
  const [buildingId, setBuildingId] = useState('');
  const [type, setType] = useState<TypeFilter>('');
  const [showInactive, setShowInactive] = useState(true);
  const [open, setOpen] = useState<OpenDialog | null>(null);
  const close = () => setOpen(null);

  const rows: ResourceRow[] = buildings
    .filter((building) => !buildingId || building.id === buildingId)
    .flatMap((building) =>
      building.resources.map((resource) => ({ resource, buildingName: building.name })),
    )
    .filter(({ resource }) => !type || resource.type === type)
    .filter(({ resource }) => showInactive || resource.isActive);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto] md:items-end">
        <label className="field-label">
          {labels.filterBuilding}
          <select
            className="field"
            value={buildingId}
            onChange={(event) => setBuildingId(event.target.value)}
          >
            <option value="">{labels.allBuildings}</option>
            {buildings.map((building) => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field-label">
          {labels.filterType}
          <select
            className="field"
            value={type}
            onChange={(event) => setType(event.target.value as TypeFilter)}
          >
            <option value="">{labels.allTypes}</option>
            <option value="MEETING_ROOM">{catalogResourceTypeLabels.MEETING_ROOM}</option>
            <option value="AI_LAB">{catalogResourceTypeLabels.AI_LAB}</option>
          </select>
        </label>
        <label className="flex min-h-11 items-center gap-3 text-sm">
          <input
            type="checkbox"
            className="size-5 accent-brand"
            checked={showInactive}
            onChange={(event) => setShowInactive(event.target.checked)}
          />
          {labels.showInactive}
        </label>
        <button type="button" className="btn btn-gold" onClick={() => setOpen({ kind: 'create' })}>
          {labels.resources.create}
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="text-ink-soft">{labels.noResults}</p>
      ) : (
        <ul className="grid gap-3 xl:grid-cols-2">
          {rows.map((row) => (
            <ResourceCard key={row.resource.id} row={row} onOpen={setOpen} />
          ))}
        </ul>
      )}

      {open?.kind === 'create' && (
        <ResourceFormDialog buildings={buildings} defaultBuildingId={buildingId} onClose={close} />
      )}
      {open?.kind === 'edit' && (
        <ResourceFormDialog
          resource={open.resource}
          buildings={buildings}
          defaultBuildingId={open.resource.buildingId}
          onClose={close}
        />
      )}
      {open?.kind === 'toggle' && (
        <ToggleCatalogDialog
          subject={open.resource.type}
          id={open.resource.id}
          name={open.resource.name}
          isActive={open.resource.isActive}
          onClose={close}
        />
      )}
    </div>
  );
}

export function ResourcesAdminView() {
  return (
    <CatalogAdminBoundary>
      {(buildings) => <ResourcesList buildings={buildings} />}
    </CatalogAdminBoundary>
  );
}

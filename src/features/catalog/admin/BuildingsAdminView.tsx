'use client';

import { useState } from 'react';
import type { CatalogBuilding } from '@/api/types';
import { Tag } from '@/components/shared/Tag';
import { BuildingFormDialog } from '@/features/catalog/admin/BuildingFormDialog';
import { CatalogAdminBoundary } from '@/features/catalog/admin/CatalogAdminBoundary';
import { CatalogItemActions } from '@/features/catalog/admin/CatalogItemActions';
import { ToggleCatalogDialog } from '@/features/catalog/admin/ToggleCatalogDialog';
import { catalogAdminLabels as labels } from '@/lib/labels';

type OpenDialog =
  | { kind: 'create' }
  | { kind: 'edit'; building: CatalogBuilding }
  | { kind: 'toggle'; building: CatalogBuilding };

function BuildingCard({
  building,
  onOpen,
}: {
  building: CatalogBuilding;
  onOpen: (dialog: OpenDialog) => void;
}) {
  return (
    <li className="panel flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold">{building.name}</p>
          <p className="truncate text-sm text-ink-soft">{building.address || labels.noAddress}</p>
        </div>
        <Tag variant={building.isActive ? 'default' : 'gold'}>
          {building.isActive ? labels.active : labels.inactive}
        </Tag>
      </div>
      <p className="text-sm text-ink-soft">
        {labels.buildings.resourceCount(building.resources.length)}
      </p>
      <CatalogItemActions
        isActive={building.isActive}
        onEdit={() => onOpen({ kind: 'edit', building })}
        onToggle={() => onOpen({ kind: 'toggle', building })}
      />
    </li>
  );
}

function BuildingsList({ buildings }: { buildings: CatalogBuilding[] }) {
  const [showInactive, setShowInactive] = useState(true);
  const [open, setOpen] = useState<OpenDialog | null>(null);
  const visible = buildings.filter((building) => showInactive || building.isActive);
  const close = () => setOpen(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
          {labels.buildings.create}
        </button>
      </div>

      {visible.length === 0 ? (
        <p className="text-ink-soft">{labels.noResults}</p>
      ) : (
        <ul className="grid gap-3 xl:grid-cols-2">
          {visible.map((building) => (
            <BuildingCard key={building.id} building={building} onOpen={setOpen} />
          ))}
        </ul>
      )}

      {open?.kind === 'create' && <BuildingFormDialog onClose={close} />}
      {open?.kind === 'edit' && <BuildingFormDialog building={open.building} onClose={close} />}
      {open?.kind === 'toggle' && (
        <ToggleCatalogDialog
          subject="BUILDING"
          id={open.building.id}
          name={open.building.name}
          isActive={open.building.isActive}
          onClose={close}
        />
      )}
    </div>
  );
}

export function BuildingsAdminView() {
  return (
    <CatalogAdminBoundary>
      {(buildings) => <BuildingsList buildings={buildings} />}
    </CatalogAdminBoundary>
  );
}

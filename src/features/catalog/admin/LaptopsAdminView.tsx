'use client';

import { useState } from 'react';
import type { CatalogBuilding, CatalogItem, CatalogResource } from '@/api/types';
import { Tag } from '@/components/shared/Tag';
import { CatalogAdminBoundary } from '@/features/catalog/admin/CatalogAdminBoundary';
import { CatalogItemActions } from '@/features/catalog/admin/CatalogItemActions';
import { LaptopFormDialog, type LabOption } from '@/features/catalog/admin/LaptopFormDialog';
import { ToggleCatalogDialog } from '@/features/catalog/admin/ToggleCatalogDialog';
import { catalogAdminLabels as labels } from '@/lib/labels';

interface LabEntry {
  lab: CatalogResource;
  buildingName: string;
}

type OpenDialog =
  | { kind: 'create'; labId: string }
  | { kind: 'edit'; laptop: CatalogItem }
  | { kind: 'toggle'; laptop: CatalogItem };

function LaptopRow({
  laptop,
  labIsActive,
  onOpen,
}: {
  laptop: CatalogItem;
  labIsActive: boolean;
  onOpen: (dialog: OpenDialog) => void;
}) {
  return (
    <li className="flex flex-col gap-2 rounded-lg border border-line p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold">{laptop.name}</p>
          {laptop.assetTag && <p className="truncate text-sm text-ink-soft">{laptop.assetTag}</p>}
        </div>
        <Tag variant={laptop.isActive ? 'default' : 'gold'}>
          {laptop.isActive ? labels.active : labels.inactive}
        </Tag>
      </div>
      <CatalogItemActions
        isActive={laptop.isActive}
        toggleDisabled={!laptop.isActive && !labIsActive}
        onEdit={() => onOpen({ kind: 'edit', laptop })}
        onToggle={() => onOpen({ kind: 'toggle', laptop })}
      />
    </li>
  );
}

function LabPanel({ entry, onOpen }: { entry: LabEntry; onOpen: (dialog: OpenDialog) => void }) {
  const { lab, buildingName } = entry;
  return (
    <section className="panel flex flex-col gap-3" aria-label={lab.name}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="truncate font-semibold">{lab.name}</h2>
          <p className="truncate text-sm text-ink-soft">{buildingName}</p>
        </div>
        <Tag variant={lab.isActive ? 'default' : 'gold'}>
          {lab.isActive ? labels.active : labels.inactive}
        </Tag>
      </div>
      {lab.children.length === 0 ? (
        <p className="text-sm text-ink-soft">{labels.laptops.noLaptops}</p>
      ) : (
        <ul className="grid gap-2 md:grid-cols-2">
          {lab.children.map((laptop) => (
            <LaptopRow key={laptop.id} laptop={laptop} labIsActive={lab.isActive} onOpen={onOpen} />
          ))}
        </ul>
      )}
      <div className="flex sm:justify-end">
        <button
          type="button"
          className="btn btn-gold w-full sm:w-auto"
          disabled={!lab.isActive}
          onClick={() => onOpen({ kind: 'create', labId: lab.id })}
        >
          {labels.laptops.add}
        </button>
      </div>
    </section>
  );
}

function labsOf(buildings: CatalogBuilding[]): LabEntry[] {
  return buildings.flatMap((building) =>
    building.resources
      .filter((resource) => resource.type === 'AI_LAB')
      .map((lab) => ({ lab, buildingName: building.name })),
  );
}

function LaptopsList({ buildings }: { buildings: CatalogBuilding[] }) {
  const [open, setOpen] = useState<OpenDialog | null>(null);
  const close = () => setOpen(null);
  const labs = labsOf(buildings);
  const labOptions: LabOption[] = labs
    .filter(({ lab }) => lab.isActive)
    .map(({ lab, buildingName }) => ({ id: lab.id, name: lab.name, buildingName }));
  const laptopOf = (dialog: OpenDialog) => (dialog.kind === 'create' ? undefined : dialog.laptop);

  if (labs.length === 0) {
    return <p className="text-ink-soft">{labels.laptops.noLabs}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {labs.map((entry) => (
        <LabPanel key={entry.lab.id} entry={entry} onOpen={setOpen} />
      ))}

      {(open?.kind === 'create' || open?.kind === 'edit') && (
        <LaptopFormDialog
          laptop={laptopOf(open)}
          labs={labOptions}
          defaultLabId={open.kind === 'create' ? open.labId : (open.laptop.parentResourceId ?? '')}
          onClose={close}
        />
      )}
      {open?.kind === 'toggle' && (
        <ToggleCatalogDialog
          subject="LAPTOP"
          id={open.laptop.id}
          name={open.laptop.name}
          isActive={open.laptop.isActive}
          onClose={close}
        />
      )}
    </div>
  );
}

export function LaptopsAdminView() {
  return (
    <CatalogAdminBoundary>
      {(buildings) => <LaptopsList buildings={buildings} />}
    </CatalogAdminBoundary>
  );
}

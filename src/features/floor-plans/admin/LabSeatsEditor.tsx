'use client';

import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import type { CatalogItem, CatalogResource } from '@/api/types';
import { LaptopFormDialog } from '@/features/catalog/admin/LaptopFormDialog';
import { ToggleCatalogDialog } from '@/features/catalog/admin/ToggleCatalogDialog';
import { floorPlanAdminLabels as labels } from '@/lib/labels';

interface LabSeatsEditorProps {
  lab: CatalogResource;
  buildingName: string;
}

export function LabSeatsEditor({ lab, buildingName }: LabSeatsEditorProps) {
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<CatalogItem | null>(null);
  const seats = lab.children.filter((laptop) => laptop.isActive);

  return (
    <section className="flex flex-col gap-2" aria-label={labels.seats}>
      <h3 className="text-sm font-bold text-brand">
        {labels.seats} · {seats.length}
      </h3>
      {seats.length === 0 ? (
        <p className="text-sm text-ink-soft">{labels.noSeats}</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {seats.map((seat) => (
            <li
              key={seat.id}
              className="flex min-h-11 items-center justify-between gap-2 rounded-lg border border-line pl-3"
            >
              <span className="truncate text-sm font-semibold">{seat.name}</span>
              <button
                type="button"
                aria-label={labels.removeSeat(seat.name)}
                className="grid size-11 place-items-center rounded-lg text-ink-soft hover:bg-soft hover:text-brand"
                onClick={() => setRemoving(seat)}
              >
                <X className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        className="btn btn-outline"
        disabled={!lab.isActive}
        onClick={() => setAdding(true)}
      >
        <Plus className="size-4" aria-hidden />
        {labels.addSeat}
      </button>

      {adding && (
        <LaptopFormDialog
          labs={[{ id: lab.id, name: lab.name, buildingName }]}
          defaultLabId={lab.id}
          onClose={() => setAdding(false)}
        />
      )}
      {removing && (
        <ToggleCatalogDialog
          subject="LAPTOP"
          id={removing.id}
          name={removing.name}
          isActive
          onClose={() => setRemoving(null)}
        />
      )}
    </section>
  );
}

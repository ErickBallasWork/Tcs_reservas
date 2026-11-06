'use client';

import { useState } from 'react';
import { initialReservations, resources } from '@/lib/mock-data';
import { reasonLabels, statusLabels } from '@/lib/labels';
import { Tag } from '@/components/shared/Tag';
import type { Reservation, ReservationStatus } from '@/types';

export function MyReservationsList() {
  const [reservationList, setReservationList] = useState<Reservation[]>(initialReservations);

  const getResourceName = (resourceId: string) => {
    const res = resources.find((r) => r.id === resourceId);
    return res ? res.name : resourceId;
  };

  const handleCancel = (id: string) => {
    setReservationList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'cancelled' as ReservationStatus } : item,
      ),
    );
  };

  const hasPendingTraining = reservationList.some(
    (r) => r.reason === 'training' && r.status === 'pending',
  );

  const formatReservationTime = (item: Reservation) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const startStr = `${pad(item.startHour)}:00`;
    const endStr = `${pad(item.endHour)}:00`;
    return `${item.date} • ${startStr} - ${endStr}`;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Banner de aviso de aprobación cuando hay entrenamientos pendientes */}
      {hasPendingTraining && (
        <div className="panel border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-900 md:text-sm">
          Entrenamiento pendiente de aprobación del Líder. El espacio queda bloqueado.
        </div>
      )}

      {/* --- VISTA DESKTOP (Tabla) --- */}
      <div className="panel hidden overflow-x-auto p-0 md:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-soft font-bold text-brand">
              <th className="px-4 py-3">RECURSO</th>
              <th className="px-4 py-3">FECHA</th>
              <th className="px-4 py-3">MOTIVO</th>
              <th className="px-4 py-3">ESTADO</th>
              <th className="px-4 py-3 text-right">ACCIÓN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {reservationList.map((item) => (
              <tr key={item.id} className="transition-colors hover:bg-soft/50">
                <td className="px-4 py-3 font-semibold text-brand">
                  {getResourceName(item.resourceId)}
                </td>
                <td className="px-4 py-3 text-ink-soft">{formatReservationTime(item)}</td>
                <td className="px-4 py-3">{reasonLabels[item.reason] || item.reason}</td>
                <td className="px-4 py-3">
                  <StatusTag status={item.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  {item.status !== 'cancelled' && item.status !== 'rejected' ? (
                    <button
                      type="button"
                      onClick={() => handleCancel(item.id)}
                      className="btn btn-gold w-auto px-3 py-1.5 text-xs"
                    >
                      Cancelar
                    </button>
                  ) : (
                    <span className="text-xs text-ink-soft">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- VISTA MÓVIL (Tarjetas idénticas al PDF) --- */}
      <div className="flex flex-col gap-3 md:hidden">
        {reservationList.map((item) => (
          <div key={item.id} className="panel flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-brand">{getResourceName(item.resourceId)}</span>
              <StatusTag status={item.status} />
            </div>

            <div className="flex flex-col gap-0.5 text-xs text-ink-soft">
              <span>{formatReservationTime(item)}</span>
              <span className="font-medium text-brand">
                {reasonLabels[item.reason] || item.reason}
              </span>
            </div>

            {/* Botón de cancelar abajo y abarcando todo el ancho en móvil */}
            {item.status !== 'cancelled' && item.status !== 'rejected' && (
              <button
                type="button"
                onClick={() => handleCancel(item.id)}
                className="mt-1 w-full rounded-[10px] border border-line bg-white py-2 text-center text-xs font-semibold text-brand shadow-sm transition-colors hover:bg-soft"
              >
                Cancelar
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusTag({ status }: { status: ReservationStatus }) {
  if (status === 'confirmed') {
    return <Tag variant="default">{statusLabels[status] || status}</Tag>;
  }
  if (status === 'pending') {
    return <Tag variant="gold">{statusLabels[status] || status}</Tag>;
  }
  return <Tag variant="dark">{statusLabels[status] || status}</Tag>;
}

"use client";

import { useState } from "react";
import { initialReservations, resources } from "@/lib/mock-data";
import { reasonLabels, statusLabels } from "@/lib/labels";
import { Tag } from "@/components/shared/Tag";
import type { Reservation, ReservationStatus } from "@/types";

export function MyReservationsList() {
  const [reservationList, setReservationList] = useState<Reservation[]>(initialReservations);

  const getResourceName = (resourceId: string) => {
    const res = resources.find((r) => r.id === resourceId);
    return res ? res.name : resourceId;
  };

  const handleCancel = (id: string) => {
    setReservationList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "cancelled" as ReservationStatus } : item
      )
    );
  };

  const hasPendingTraining = reservationList.some(
    (r) => r.reason === "training" && r.status === "pending"
  );

  const formatReservationTime = (item: Reservation) => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    const startStr = `${pad(item.startHour)}:00`;
    const endStr = `${pad(item.endHour)}:00`;
    return `${item.date} • ${startStr} - ${endStr}`;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Banner de aviso de aprobación cuando hay entrenamientos pendientes */}
      {hasPendingTraining && (
        <div className="panel border-amber-200 bg-amber-50 p-3 text-xs md:text-sm font-medium text-amber-900">
          Entrenamiento pendiente de aprobación del Líder. El espacio queda bloqueado.
        </div>
      )}

      {/* --- VISTA DESKTOP (Tabla) --- */}
      <div className="panel hidden overflow-x-auto md:block p-0">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-soft text-brand font-bold">
              <th className="py-3 px-4">RECURSO</th>
              <th className="py-3 px-4">FECHA</th>
              <th className="py-3 px-4">MOTIVO</th>
              <th className="py-3 px-4">ESTADO</th>
              <th className="py-3 px-4 text-right">ACCIÓN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {reservationList.map((item) => (
              <tr key={item.id} className="hover:bg-soft/50 transition-colors">
                <td className="py-3 px-4 font-semibold text-brand">
                  {getResourceName(item.resourceId)}
                </td>
                <td className="py-3 px-4 text-ink-soft">
                  {formatReservationTime(item)}
                </td>
                <td className="py-3 px-4">{reasonLabels[item.reason] || item.reason}</td>
                <td className="py-3 px-4">
                  <StatusTag status={item.status} />
                </td>
                <td className="py-3 px-4 text-right">
                  {item.status !== "cancelled" && item.status !== "rejected" ? (
                    <button
                      type="button"
                      onClick={() => handleCancel(item.id)}
                      className="btn btn-gold text-xs py-1.5 px-3 w-auto"
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
            
            <div className="text-xs text-ink-soft flex flex-col gap-0.5">
              <span>{formatReservationTime(item)}</span>
              <span className="font-medium text-brand">
                {reasonLabels[item.reason] || item.reason}
              </span>
            </div>

            {/* Botón de cancelar abajo y abarcando todo el ancho en móvil */}
            {item.status !== "cancelled" && item.status !== "rejected" && (
              <button
                type="button"
                onClick={() => handleCancel(item.id)}
                className="w-full mt-1 rounded-[10px] border border-line bg-white py-2 text-xs font-semibold text-brand shadow-sm hover:bg-soft transition-colors text-center"
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
  if (status === "confirmed") {
    return <Tag variant="default">{statusLabels[status] || status}</Tag>;
  }
  if (status === "pending") {
    return <Tag variant="gold">{statusLabels[status] || status}</Tag>;
  }
  return <Tag variant="dark">{statusLabels[status] || status}</Tag>;
}
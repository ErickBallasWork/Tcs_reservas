"use client";

import { useEffect, useState } from "react";
import { reasonLabels, statusLabels } from "@/lib/labels";
import { Tag } from "@/components/shared/Tag";
import type { Reservation, ReservationReason, ReservationStatus } from "@/types";
import { api } from "@/lib/api";
import { initialReservations, resources as mockResources } from "@/lib/mock-data";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function MyReservationsList() {
  const [reservationList, setReservationList] = useState<Reservation[]>([]);
  const [resourceNames, setResourceNames] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        // Cargar catálogo de recursos para tener los nombres
        const resources = await api.catalog.getResources().catch(() => []);
        const nameMap: Record<string, string> = {};
        for (const r of resources) {
          nameMap[r.id] = r.name;
        }
        for (const mr of mockResources) {
          if (!nameMap[mr.id]) nameMap[mr.id] = mr.name;
        }
        if (isMounted) setResourceNames(nameMap);

        // Cargar reservas del usuario
        const apiReservations = await api.reservations.listMine();
        if (isMounted) {
          const mapped: Reservation[] = apiReservations.map((r) => {
            const start = parseISO(r.startDateTime);
            const end = parseISO(r.endDateTime);
            const dateStr = format(start, "yyyy-MM-dd");

            let status: ReservationStatus = "confirmed";
            if (r.status === "PENDING_APPROVAL") status = "pending";
            else if (r.status === "REJECTED") status = "rejected";
            else if (r.status === "CANCELLED") status = "cancelled";

            let reason: ReservationReason = "internal_meeting";
            if (r.purpose === "TRAINING") reason = "training";
            else if (r.purpose === "CLIENT_MEETING") reason = "client_meeting";

            if (r.resource?.name) {
              nameMap[r.resourceId] = r.resource.name;
            }

            return {
              id: r.id,
              resourceId: r.resourceId,
              associateName: r.user?.fullName || "Yo",
              date: dateStr,
              startHour: start.getHours(),
              endHour: end.getHours(),
              reason,
              detail: r.justification,
              status,
            };
          });
          setReservationList(mapped);
          setErrorMessage(null);
        }
      } catch {
        // Fallback a datos mock si la API aún no está disponible
        if (isMounted) {
          setReservationList(initialReservations);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const getResourceName = (resourceId: string) => {
    return resourceNames[resourceId] || resourceId;
  };

  const handleCancel = async (id: string) => {
    try {
      setErrorMessage(null);
      await api.reservations.cancel(id);
      setReservationList((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "cancelled" as ReservationStatus } : item
        )
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No se pudo cancelar la reserva";
      setErrorMessage(msg);
      // Actualizar localmente de todas formas si estamos en modo offline/mock
      setReservationList((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "cancelled" as ReservationStatus } : item
        )
      );
    }
  };

  const hasPendingTraining = reservationList.some(
    (r) => r.reason === "training" && r.status === "pending"
  );

  const formatReservationTime = (item: Reservation) => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    const startStr = `${pad(item.startHour)}:00`;
    const endStr = `${pad(item.endHour)}:00`;
    try {
      const dateFormatted = format(parseISO(item.date), "d 'de' MMMM", { locale: es });
      return `${dateFormatted} • ${startStr} - ${endStr}`;
    } catch {
      return `${item.date} • ${startStr} - ${endStr}`;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {errorMessage && (
        <div className="alert border-red-200 bg-red-50 text-red-800 text-xs md:text-sm">
          {errorMessage}
        </div>
      )}

      {/* Banner de aviso de aprobación cuando hay entrenamientos pendientes */}
      {hasPendingTraining && (
        <div className="panel border-amber-200 bg-amber-50 p-3 text-xs md:text-sm font-medium text-amber-900">
          Entrenamiento pendiente de aprobación del Líder. El espacio queda bloqueado.
        </div>
      )}

      {isLoading && (
        <div className="panel flex items-center justify-center p-6 text-sm text-ink-soft">
          <span className="spinner mr-2" aria-hidden /> Cargando reservas…
        </div>
      )}

      {!isLoading && reservationList.length === 0 && (
        <div className="panel p-6 text-center text-sm text-ink-soft">
          No tienes reservas activas ni pasadas.
        </div>
      )}

      {/* --- VISTA DESKTOP (Tabla) --- */}
      {!isLoading && reservationList.length > 0 && (
        <div className="panel hidden overflow-x-auto md:block p-0">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-soft text-brand font-bold">
                <th className="py-3 px-4">RECURSO</th>
                <th className="py-3 px-4">FECHA Y HORARIO</th>
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
      )}

      {/* --- VISTA MÓVIL --- */}
      {!isLoading && reservationList.length > 0 && (
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
                {item.detail && (
                  <span className="text-[11px] text-ink-soft truncate">{item.detail}</span>
                )}
              </div>

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
      )}
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

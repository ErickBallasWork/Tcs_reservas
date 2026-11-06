"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Tag } from "@/components/shared/Tag";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { ApiReservation, ApiResource } from "@/types/api";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export default function SpocAgendaPage() {
  const { currentUser } = useAuth();
  const [reservations, setReservations] = useState<ApiReservation[]>([]);
  const [availableRooms, setAvailableRooms] = useState<ApiResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal de Reasignación
  const [reallocateModalOpen, setReallocateModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<ApiReservation | null>(null);
  const [targetRoomId, setTargetRoomId] = useState("");
  const [justification, setJustification] = useState("");
  const [isReallocating, setIsReallocating] = useState(false);

  // Edificio administrado por el SPOC (si no tiene uno asignado, usa el primero)
  const spocBuildingId = currentUser?.spocBuildingIds?.[0];

  async function loadAgenda() {
    try {
      setIsLoading(true);
      const [resData, roomsData] = await Promise.all([
        api.dashboard.reservations({
          buildingId: spocBuildingId,
          status: "CONFIRMED",
        }),
        api.catalog.getResources({
          buildingId: spocBuildingId,
          type: "MEETING_ROOM",
        }),
      ]);
      setReservations(resData.items);
      setAvailableRooms(roomsData);
      setErrorMessage(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al cargar la agenda de salas";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadAgenda();
  }, [spocBuildingId]);

  const openReallocateModal = (r: ApiReservation) => {
    setSelectedReservation(r);
    // Filtrar salas para que seleccione una diferente
    const alternative = availableRooms.find((room) => room.id !== r.resourceId);
    setTargetRoomId(alternative?.id || "");
    setJustification("Evento prioritario con cliente en sala original");
    setReallocateModalOpen(true);
  };

  const handleReallocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReservation || !targetRoomId || !justification.trim()) return;

    setIsReallocating(true);
    setErrorMessage(null);

    try {
      await api.reallocations.reallocate(selectedReservation.id, {
        newResourceId: targetRoomId,
        justification: justification.trim(),
      });
      setReallocateModalOpen(false);
      await loadAgenda();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al reasignar la sala";
      setErrorMessage(msg);
    } finally {
      setIsReallocating(false);
    }
  };

  return (
    <AppShell title="Agenda del Edificio">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-brand">Agenda y Reasignación de Salas</h1>
            <p className="text-xs text-ink-soft">
              Vista del SPOC de Edificio para gestionar salas y resolver conflictos ante eventos corporativos (HU-17, HU-18).
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline text-xs"
            onClick={() => void loadAgenda()}
          >
            Actualizar agenda
          </button>
        </div>

        {errorMessage && (
          <div className="alert border-red-200 bg-red-50 text-xs text-red-800 md:text-sm">
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <div className="panel flex items-center justify-center p-8 text-sm text-ink-soft">
            <span className="spinner mr-2" aria-hidden /> Cargando agenda del edificio…
          </div>
        ) : reservations.length === 0 ? (
          <div className="panel p-8 text-center text-sm text-ink-soft">
            No hay reservas confirmadas activas en las salas del edificio.
          </div>
        ) : (
          <div className="panel overflow-x-auto p-0">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-soft text-brand font-bold">
                  <th className="py-3 px-4">SALA ACTUAL</th>
                  <th className="py-3 px-4">HORARIO</th>
                  <th className="py-3 px-4">ASOCIADO</th>
                  <th className="py-3 px-4">MOTIVO</th>
                  <th className="py-3 px-4">ESTADO</th>
                  <th className="py-3 px-4 text-right">ACCIÓN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {reservations.map((r) => {
                  const start = parseISO(r.startDateTime);
                  const end = parseISO(r.endDateTime);
                  const dateStr = format(start, "d 'de' MMMM", { locale: es });
                  const hoursStr = `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`;

                  return (
                    <tr key={r.id} className="hover:bg-soft/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-brand">
                        {r.resource?.name}
                      </td>
                      <td className="py-3 px-4 text-ink-soft text-xs">
                        <span className="block font-medium text-ink">{dateStr}</span>
                        {hoursStr}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-brand block">{r.user?.fullName}</span>
                        <small className="text-ink-soft">{r.user?.email}</small>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <span className="font-medium text-brand">{r.purpose}</span>
                        {r.justification && (
                          <small className="text-ink-soft block italic truncate max-w-xs">
                            &quot;{r.justification}&quot;
                          </small>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Tag variant="default">Confirmada</Tag>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          className="btn btn-gold text-xs py-1.5 px-3"
                          onClick={() => openReallocateModal(r)}
                        >
                          Reasignar Sala
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal de Reasignación de Sala (HU-17, HU-18) */}
        {reallocateModalOpen && selectedReservation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="panel w-full max-w-md bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
                <h3 className="text-lg font-bold text-brand">Reasignar Sala de Reunión</h3>
                <button
                  type="button"
                  onClick={() => setReallocateModalOpen(false)}
                  className="text-sm font-bold text-ink-soft hover:text-brand"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleReallocate} className="flex flex-col gap-3">
                <div className="rounded-lg bg-surface p-2.5 text-xs">
                  <p className="font-semibold text-brand">
                    Reserva actual:{" "}
                    <span className="font-normal text-ink">
                      {selectedReservation.resource?.name} ({selectedReservation.user?.fullName})
                    </span>
                  </p>
                  <p className="text-ink-soft mt-1">
                    Horario: {format(parseISO(selectedReservation.startDateTime), "d 'de' MMMM, HH:mm", { locale: es })}
                  </p>
                </div>

                <label className="field-label">
                  Selecciona la nueva sala *
                  <select
                    className="field"
                    required
                    value={targetRoomId}
                    onChange={(e) => setTargetRoomId(e.target.value)}
                  >
                    <option value="">Selecciona sala de destino</option>
                    {availableRooms.map((room) => (
                      <option
                        key={room.id}
                        value={room.id}
                        disabled={room.id === selectedReservation.resourceId}
                      >
                        {room.name} (Capacidad: {room.capacity})
                        {room.id === selectedReservation.resourceId ? " (Actual)" : ""}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field-label">
                  Justificación obligatoria para el asociado (RF-11) *
                  <textarea
                    className="field min-h-[85px] py-2"
                    required
                    placeholder="Ej. Visita de delegación de cliente corporativo en sala original."
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                  />
                </label>

                <small className="text-ink-soft text-[11px]">
                  El asociado recibirá un aviso en su bandeja informándole de la reasignación.
                </small>

                <div className="mt-4 flex justify-end gap-2 border-t border-line pt-4">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setReallocateModalOpen(false)}
                    disabled={isReallocating}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-gold"
                    disabled={isReallocating || !targetRoomId || !justification.trim()}
                  >
                    {isReallocating && <span className="spinner mr-1" aria-hidden />}
                    Confirmar Reasignación
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}


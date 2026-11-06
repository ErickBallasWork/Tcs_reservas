"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Tag } from "@/components/shared/Tag";
import { api } from "@/lib/api";
import type { ApiReservation } from "@/types/api";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export default function LeaderInboxPage() {
  const [pendingList, setPendingList] = useState<ApiReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal Rechazar / Aprobar con comentario
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<ApiReservation | null>(null);
  const [decisionType, setDecisionType] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadPending() {
    try {
      setIsLoading(true);
      const data = await api.approvals.listPending();
      setPendingList(data);
      setErrorMessage(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al cargar solicitudes pendientes";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadPending();
  }, []);

  const openDecisionModal = (res: ApiReservation, type: "APPROVE" | "REJECT") => {
    setSelectedReservation(res);
    setDecisionType(type);
    setComments(type === "APPROVE" ? "Aprobado para capacitación interna" : "");
    setDecisionModalOpen(true);
  };

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReservation) return;
    if (decisionType === "REJECT" && !comments.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await api.approvals.decide(selectedReservation.id, {
        decision: decisionType,
        comments: comments.trim() || undefined,
      });
      setDecisionModalOpen(false);
      await loadPending();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al procesar la decisión";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell title="Bandeja de Aprobaciones">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-brand">Bandeja del Líder de Conocimiento</h1>
            <p className="text-xs text-ink-soft">
              Revisa y autoriza solicitudes de reserva para Entrenamientos y Capacitaciones (HU-15).
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline text-xs"
            onClick={() => void loadPending()}
          >
            Actualizar bandeja
          </button>
        </div>

        {errorMessage && (
          <div className="alert border-red-200 bg-red-50 text-xs text-red-800 md:text-sm">
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <div className="panel flex items-center justify-center p-8 text-sm text-ink-soft">
            <span className="spinner mr-2" aria-hidden /> Cargando solicitudes de entrenamiento…
          </div>
        ) : pendingList.length === 0 ? (
          <div className="panel p-8 text-center text-sm text-ink-soft">
            <p className="font-semibold text-brand text-base mb-1">¡Todo al día!</p>
            No hay solicitudes de entrenamiento pendientes de revisión.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {pendingList.map((res) => {
              const start = parseISO(res.startDateTime);
              const end = parseISO(res.endDateTime);
              const dateFormatted = format(start, "EEEE d 'de' MMMM", { locale: es });
              const hoursFormatted = `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`;

              return (
                <div key={res.id} className="panel flex flex-col justify-between gap-3 border-amber-200">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-brand text-base">{res.resource?.name}</h3>
                        <small className="text-ink-soft">{res.resource?.building?.name || "Edificio"}</small>
                      </div>
                      <Tag variant="gold">Pendiente Aprobación</Tag>
                    </div>

                    <div className="rounded-lg bg-surface p-2.5 text-xs">
                      <p className="font-semibold text-brand">
                        Solicitante: <span className="font-normal text-ink">{res.user?.fullName} ({res.user?.email})</span>
                      </p>
                      <p className="font-semibold text-brand mt-1">
                        Horario: <span className="font-normal text-ink">{dateFormatted} · {hoursFormatted}</span>
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold uppercase text-ink-soft block">
                        Justificación del curso:
                      </span>
                      <p className="text-xs text-ink bg-soft/40 p-2 rounded mt-1 italic">
                        &quot;{res.justification}&quot;
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-line pt-3">
                    <button
                      type="button"
                      className="btn btn-outline text-red-600 hover:bg-red-50 text-xs py-1.5 px-3"
                      onClick={() => openDecisionModal(res, "REJECT")}
                    >
                      Rechazar
                    </button>
                    <button
                      type="button"
                      className="btn btn-gold text-xs py-1.5 px-4"
                      onClick={() => openDecisionModal(res, "APPROVE")}
                    >
                      Aprobar Entrenamiento
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal de Decisión */}
        {decisionModalOpen && selectedReservation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="panel w-full max-w-md bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
                <h3 className="text-lg font-bold text-brand">
                  {decisionType === "APPROVE" ? "Aprobar Entrenamiento" : "Rechazar Solicitud"}
                </h3>
                <button
                  type="button"
                  onClick={() => setDecisionModalOpen(false)}
                  className="text-sm font-bold text-ink-soft hover:text-brand"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleDecisionSubmit} className="flex flex-col gap-3">
                <p className="text-xs text-ink-soft">
                  Espacio: <strong className="text-brand">{selectedReservation.resource?.name}</strong> para{" "}
                  <strong>{selectedReservation.user?.fullName}</strong>.
                </p>

                <label className="field-label">
                  {decisionType === "APPROVE" ? "Comentarios (opcional)" : "Motivo del rechazo (obligatorio) *"}
                  <textarea
                    className="field min-h-[80px] py-2"
                    required={decisionType === "REJECT"}
                    placeholder={
                      decisionType === "APPROVE"
                        ? "Ej. Autorizado para capacitación del equipo"
                        : "Indica por qué no procede la solicitud para liberar la franja horaria"
                    }
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                  />
                </label>

                <div className="mt-4 flex justify-end gap-2 border-t border-line pt-4">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setDecisionModalOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className={
                      decisionType === "APPROVE"
                        ? "btn btn-gold"
                        : "btn btn-gold bg-red-600 hover:bg-red-700 text-white"
                    }
                    disabled={isSubmitting || (decisionType === "REJECT" && !comments.trim())}
                  >
                    {isSubmitting && <span className="spinner mr-1" aria-hidden />}
                    {decisionType === "APPROVE" ? "Confirmar Aprobación" : "Confirmar Rechazo"}
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


"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Tag } from "@/components/shared/Tag";
import { api } from "@/lib/api";
import type { ApiAuditLog, ApiSanction } from "@/types/api";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export default function AdminSanctionsPage() {
  const [activeTab, setActiveTab] = useState<"sanctions" | "audit">("sanctions");

  // Estado Sanciones
  const [sanctions, setSanctions] = useState<ApiSanction[]>([]);
  const [sanctionStatusFilter, setSanctionStatusFilter] = useState<string>("ACTIVE");
  const [isLoadingSanctions, setIsLoadingSanctions] = useState(true);

  // Modal Regularizar Sanción
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedSanction, setSelectedSanction] = useState<ApiSanction | null>(null);
  const [justification, setJustification] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  // Estado Auditoría
  const [auditLogs, setAuditLogs] = useState<ApiAuditLog[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadSanctions() {
    try {
      setIsLoadingSanctions(true);
      const res = await api.admin.sanctions.list({
        status: sanctionStatusFilter === "ALL" ? undefined : sanctionStatusFilter,
      });
      setSanctions(res.items);
      setErrorMessage(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al cargar sanciones";
      setErrorMessage(msg);
    } finally {
      setIsLoadingSanctions(false);
    }
  }

  async function loadAudit() {
    try {
      setIsLoadingAudit(true);
      const res = await api.admin.audit.list();
      setAuditLogs(res.items);
      setErrorMessage(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al cargar auditoría";
      setErrorMessage(msg);
    } finally {
      setIsLoadingAudit(false);
    }
  }

  useEffect(() => {
    if (activeTab === "sanctions") {
      void loadSanctions();
    } else {
      void loadAudit();
    }
  }, [activeTab, sanctionStatusFilter]);

  const openResolveModal = (s: ApiSanction) => {
    setSelectedSanction(s);
    setJustification("");
    setResolveModalOpen(true);
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSanction || !justification.trim()) return;

    setIsResolving(true);
    setErrorMessage(null);

    try {
      await api.admin.sanctions.resolve(selectedSanction.id, justification.trim());
      setResolveModalOpen(false);
      await loadSanctions();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al regularizar sanción";
      setErrorMessage(msg);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <AppShell title="Sanciones y Auditoría">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-brand">Sanciones y Registro de Auditoría</h1>
            <p className="text-xs text-ink-soft">
              Control de bloqueos por inasistencia (No-Show) y trazabilidad inalterable de operaciones.
            </p>
          </div>

          <div className="flex rounded-lg border border-line bg-surface p-1">
            <button
              type="button"
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === "sanctions"
                  ? "bg-brand text-white shadow-sm"
                  : "text-ink-soft hover:text-brand"
              }`}
              onClick={() => setActiveTab("sanctions")}
            >
              Sanciones por Inasistencia
            </button>
            <button
              type="button"
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === "audit"
                  ? "bg-brand text-white shadow-sm"
                  : "text-ink-soft hover:text-brand"
              }`}
              onClick={() => setActiveTab("audit")}
            >
              Registro de Auditoría (Log)
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="alert border-red-200 bg-red-50 text-xs text-red-800 md:text-sm">
            {errorMessage}
          </div>
        )}

        {/* PESTAÑA: SANCIONES */}
        {activeTab === "sanctions" && (
          <div className="flex flex-col gap-3">
            <div className="panel flex items-center justify-between gap-3">
              <label className="field-label flex-1 max-w-xs">
                Filtro de estado
                <select
                  className="field"
                  value={sanctionStatusFilter}
                  onChange={(e) => setSanctionStatusFilter(e.target.value)}
                >
                  <option value="ACTIVE">Activas (bloqueadas)</option>
                  <option value="RESOLVED">Regularizadas</option>
                  <option value="ALL">Todas las sanciones</option>
                </select>
              </label>
              <button
                type="button"
                className="btn btn-outline text-xs mt-4"
                onClick={() => void loadSanctions()}
              >
                Actualizar lista
              </button>
            </div>

            {isLoadingSanctions ? (
              <div className="panel flex items-center justify-center p-8 text-sm text-ink-soft">
                <span className="spinner mr-2" aria-hidden /> Cargando sanciones…
              </div>
            ) : sanctions.length === 0 ? (
              <div className="panel p-8 text-center text-sm text-ink-soft">
                No hay sanciones registradas con el filtro actual.
              </div>
            ) : (
              <div className="panel overflow-x-auto p-0">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-line bg-soft text-brand font-bold">
                      <th className="py-3 px-4">ASOCIADO</th>
                      <th className="py-3 px-4">MOTIVO</th>
                      <th className="py-3 px-4">ESPACIO AFECTADO</th>
                      <th className="py-3 px-4">FECHA SANCIONADO</th>
                      <th className="py-3 px-4">ESTADO</th>
                      <th className="py-3 px-4 text-right">ACCIÓN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {sanctions.map((s) => (
                      <tr key={s.id} className="hover:bg-soft/40 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-brand block">{s.user.fullName}</span>
                          <small className="text-ink-soft">{s.user.email}</small>
                        </td>
                        <td className="py-3 px-4 text-ink-soft text-xs max-w-[200px]">
                          {s.reason}
                        </td>
                        <td className="py-3 px-4 font-medium text-brand">
                          {s.reservation?.resource?.name || "Espacio"}
                        </td>
                        <td className="py-3 px-4 text-ink-soft text-xs">
                          {format(parseISO(s.startDate), "d 'de' MMMM yyyy, HH:mm", { locale: es })}
                        </td>
                        <td className="py-3 px-4">
                          {s.status === "ACTIVE" ? (
                            <Tag variant="dark">Bloqueado</Tag>
                          ) : (
                            <Tag variant="default">Regularizado</Tag>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {s.status === "ACTIVE" ? (
                            <button
                              type="button"
                              className="btn btn-gold text-xs py-1.5 px-3"
                              onClick={() => openResolveModal(s)}
                            >
                              Regularizar
                            </button>
                          ) : (
                            <span className="text-xs text-ink-soft">
                              Por {s.resolvedBy?.fullName || "Admin"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA: AUDITORÍA */}
        {activeTab === "audit" && (
          <div className="flex flex-col gap-3">
            {isLoadingAudit ? (
              <div className="panel flex items-center justify-center p-8 text-sm text-ink-soft">
                <span className="spinner mr-2" aria-hidden /> Cargando registro de auditoría…
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="panel p-8 text-center text-sm text-ink-soft">
                No hay registros de auditoría almacenados.
              </div>
            ) : (
              <div className="panel overflow-x-auto p-0">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-line bg-soft text-brand font-bold">
                      <th className="py-3 px-4">FECHA Y HORA</th>
                      <th className="py-3 px-4">ACCIÓN</th>
                      <th className="py-3 px-4">ENTIDAD</th>
                      <th className="py-3 px-4">USUARIO RESPONSABLE</th>
                      <th className="py-3 px-4">DETALLES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line font-mono text-xs">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-soft/40 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap text-ink-soft">
                          {format(parseISO(log.eventDate), "yyyy-MM-dd HH:mm:ss")}
                        </td>
                        <td className="py-3 px-4 font-semibold text-brand">
                          {log.action}
                        </td>
                        <td className="py-3 px-4 text-ink-soft">
                          {log.entity} {log.entityId ? `(#${log.entityId.slice(0, 8)})` : ""}
                        </td>
                        <td className="py-3 px-4 font-sans text-brand">
                          {log.user ? `${log.user.fullName} (${log.user.email})` : "Sistema automático"}
                        </td>
                        <td className="py-3 px-4 text-ink-soft max-w-xs truncate" title={log.details || ""}>
                          {log.details || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modal Regularizar Sanción (HU-22) */}
        {resolveModalOpen && selectedSanction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="panel w-full max-w-md bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
                <h3 className="text-lg font-bold text-brand">Regularizar Sanción</h3>
                <button
                  type="button"
                  onClick={() => setResolveModalOpen(false)}
                  className="text-sm font-bold text-ink-soft hover:text-brand"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleResolve} className="flex flex-col gap-3">
                <p className="text-xs text-ink-soft">
                  El asociado <strong className="text-brand">{selectedSanction.user.fullName}</strong> quedará desbloqueado para volver a realizar reservas en el sistema.
                </p>

                <label className="field-label">
                  Justificación administrativa obligatoria *
                  <textarea
                    className="field min-h-[90px] py-2"
                    required
                    placeholder="Ej. El asociado presentó justificativo médico / reunión de emergencia con cliente."
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                  />
                </label>

                <div className="mt-4 flex justify-end gap-2 border-t border-line pt-4">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setResolveModalOpen(false)}
                    disabled={isResolving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-gold"
                    disabled={isResolving || !justification.trim()}
                  >
                    {isResolving && <span className="spinner mr-1" aria-hidden />}
                    Confirmar Regularización
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


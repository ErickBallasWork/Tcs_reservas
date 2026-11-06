"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Tag } from "@/components/shared/Tag";
import { api } from "@/lib/api";
import type { ApiReservation, DashboardMetrics } from "@/types/api";
import { reasonLabels, statusLabels } from "@/lib/labels";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export default function LeaderDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [reservations, setReservations] = useState<ApiReservation[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [purposeFilter, setPurposeFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadDashboard() {
    try {
      setIsLoading(true);
      const [m, r] = await Promise.all([
        api.dashboard.metrics(),
        api.dashboard.reservations({
          status: statusFilter || undefined,
          purpose: purposeFilter || undefined,
        }),
      ]);
      setMetrics(m);
      setReservations(r.items);
      setErrorMessage(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al cargar datos del panel";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, [statusFilter, purposeFilter]);

  return (
    <AppShell title="Panel de Seguimiento">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand">Panel de Métricas y Seguimiento</h1>
          <p className="text-xs text-ink-soft">
            Indicadores de gestión de espacios para Líder de Conocimiento y SPOC Administrativo (HU-16).
          </p>
        </div>

        {errorMessage && (
          <div className="alert border-red-200 bg-red-50 text-xs text-red-800 md:text-sm">
            {errorMessage}
          </div>
        )}

        {/* Tarjetas KPI */}
        {metrics && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="panel flex flex-col p-4 bg-white border-line">
              <span className="text-xs text-ink-soft font-medium uppercase">Total Solicitudes</span>
              <span className="text-2xl font-bold text-brand mt-1">{metrics.total}</span>
            </div>

            <div className="panel flex flex-col p-4 bg-white border-line">
              <span className="text-xs text-ink-soft font-medium uppercase">Confirmadas</span>
              <span className="text-2xl font-bold text-emerald-600 mt-1">
                {metrics.byStatus.CONFIRMED}
              </span>
            </div>

            <div className="panel flex flex-col p-4 bg-white border-line">
              <span className="text-xs text-ink-soft font-medium uppercase">Por Aprobar</span>
              <span className="text-2xl font-bold text-amber-600 mt-1">
                {metrics.byStatus.PENDING_APPROVAL}
              </span>
            </div>

            <div className="panel flex flex-col p-4 bg-white border-line">
              <span className="text-xs text-ink-soft font-medium uppercase">Tasa No-Show</span>
              <span className="text-2xl font-bold text-red-600 mt-1">
                {Math.round(metrics.noShowRate * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Desglose por Motivo y Tipo */}
        {metrics && (
          <div className="grid gap-3 md:grid-cols-2">
            <div className="panel flex flex-col gap-2 p-4">
              <h3 className="text-sm font-bold text-brand border-b border-line pb-2">
                Distribución por Motivo de Uso
              </h3>
              <div className="flex flex-col gap-2 text-xs pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-ink-soft">Reuniones Internas</span>
                  <span className="font-bold text-brand">{metrics.byPurpose.INTERNAL_MEETING}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink-soft">Reuniones con Clientes</span>
                  <span className="font-bold text-brand">{metrics.byPurpose.CLIENT_MEETING}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink-soft">Entrenamientos y Capacitación</span>
                  <span className="font-bold text-brand">{metrics.byPurpose.TRAINING}</span>
                </div>
              </div>
            </div>

            <div className="panel flex flex-col gap-2 p-4">
              <h3 className="text-sm font-bold text-brand border-b border-line pb-2">
                Distribución por Tipo de Espacio
              </h3>
              <div className="flex flex-col gap-2 text-xs pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-ink-soft">Salas de Reunión</span>
                  <span className="font-bold text-brand">{metrics.byReservationType.ROOM}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink-soft">Laboratorio de IA Completo</span>
                  <span className="font-bold text-brand">{metrics.byReservationType.FULL_LAB}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink-soft">Laptops de IA Individuales</span>
                  <span className="font-bold text-brand">{metrics.byReservationType.LAPTOP}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Historial Filtrable de Solicitudes */}
        <div className="flex flex-col gap-3">
          <div className="panel flex flex-wrap items-center gap-3">
            <label className="field-label flex-1 min-w-[180px]">
              Estado
              <select
                className="field"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="CONFIRMED">Confirmada</option>
                <option value="PENDING_APPROVAL">Pendiente Aprobación</option>
                <option value="CHECKED_IN">Uso Registrado</option>
                <option value="NO_SHOW">No-Show</option>
                <option value="CANCELLED">Cancelada</option>
                <option value="REJECTED">Rechazada</option>
              </select>
            </label>

            <label className="field-label flex-1 min-w-[180px]">
              Motivo
              <select
                className="field"
                value={purposeFilter}
                onChange={(e) => setPurposeFilter(e.target.value)}
              >
                <option value="">Todos los motivos</option>
                <option value="INTERNAL_MEETING">Reunión Interna</option>
                <option value="CLIENT_MEETING">Reunión con Cliente</option>
                <option value="TRAINING">Entrenamiento</option>
              </select>
            </label>
          </div>

          {isLoading ? (
            <div className="panel flex items-center justify-center p-8 text-sm text-ink-soft">
              <span className="spinner mr-2" aria-hidden /> Cargando solicitudes…
            </div>
          ) : reservations.length === 0 ? (
            <div className="panel p-8 text-center text-sm text-ink-soft">
              No hay solicitudes que coincidan con los filtros.
            </div>
          ) : (
            <div className="panel overflow-x-auto p-0">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-soft text-brand font-bold">
                    <th className="py-3 px-4">ASOCIADO</th>
                    <th className="py-3 px-4">ESPACIO</th>
                    <th className="py-3 px-4">FECHA Y HORA</th>
                    <th className="py-3 px-4">MOTIVO</th>
                    <th className="py-3 px-4">ESTADO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {reservations.map((r) => {
                    const start = parseISO(r.startDateTime);
                    const end = parseISO(r.endDateTime);
                    const formatted = `${format(start, "d 'de' MMM, HH:mm", { locale: es })} - ${format(end, "HH:mm")}`;

                    return (
                      <tr key={r.id} className="hover:bg-soft/40 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-brand block">{r.user?.fullName}</span>
                          <small className="text-ink-soft">{r.user?.email}</small>
                        </td>
                        <td className="py-3 px-4 font-medium text-brand">
                          {r.resource?.name}
                        </td>
                        <td className="py-3 px-4 text-ink-soft text-xs">
                          {formatted}
                        </td>
                        <td className="py-3 px-4 text-xs">
                          {reasonLabels[r.purpose.toLowerCase() as keyof typeof reasonLabels] || r.purpose}
                        </td>
                        <td className="py-3 px-4">
                          <Tag
                            variant={
                              r.status === "CONFIRMED"
                                ? "default"
                                : r.status === "PENDING_APPROVAL"
                                ? "gold"
                                : "dark"
                            }
                          >
                            {statusLabels[r.status.toLowerCase() as keyof typeof statusLabels] || r.status}
                          </Tag>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}


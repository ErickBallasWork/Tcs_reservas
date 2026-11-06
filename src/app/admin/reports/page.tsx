"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import type { ApiBuilding, DepartmentUsageRow, OccupancyReportRow } from "@/types/api";

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<"occupancy" | "department">("occupancy");

  const [from, setFrom] = useState("2026-11-01T00:00:00Z");
  const [to, setTo] = useState("2026-11-30T23:59:59Z");
  const [buildingId, setBuildingId] = useState<string>("all");
  const [buildings, setBuildings] = useState<ApiBuilding[]>([]);

  const [occupancyData, setOccupancyData] = useState<OccupancyReportRow[]>([]);
  const [departmentData, setDepartmentData] = useState<DepartmentUsageRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function initBuildings() {
      try {
        const b = await api.catalog.getBuildings();
        setBuildings(b);
      } catch {}
    }
    void initBuildings();
  }, []);

  async function loadReport() {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      if (activeTab === "occupancy") {
        const data = await api.admin.reports.occupancy({
          from,
          to,
          buildingId: buildingId === "all" ? undefined : buildingId,
        });
        setOccupancyData(data);
      } else {
        const data = await api.admin.reports.usageByDepartment({ from, to });
        setDepartmentData(data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al cargar reporte";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadReport();
  }, [activeTab, from, to, buildingId]);

  const downloadCsv = () => {
    if (activeTab === "occupancy") {
      const url = api.admin.reports.getOccupancyCsvUrl({
        from,
        to,
        buildingId: buildingId === "all" ? undefined : buildingId,
      });
      window.open(url, "_blank");
    } else {
      const url = api.admin.reports.getDepartmentCsvUrl({ from, to });
      window.open(url, "_blank");
    }
  };

  return (
    <AppShell title="Reportes de Gestión">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-brand">Reportes de Ocupación y Uso</h1>
            <p className="text-xs text-ink-soft">
              Indicadores clave de rendimiento, tasa de ocupación por espacio y comportamiento por departamento (HU-23).
            </p>
          </div>

          <div className="flex rounded-lg border border-line bg-surface p-1">
            <button
              type="button"
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === "occupancy"
                  ? "bg-brand text-white shadow-sm"
                  : "text-ink-soft hover:text-brand"
              }`}
              onClick={() => setActiveTab("occupancy")}
            >
              Tasa de Ocupación
            </button>
            <button
              type="button"
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === "department"
                  ? "bg-brand text-white shadow-sm"
                  : "text-ink-soft hover:text-brand"
              }`}
              onClick={() => setActiveTab("department")}
            >
              Uso por Departamento
            </button>
          </div>
        </div>

        {/* Filtros de Rango y Edificio */}
        <div className="panel flex flex-wrap items-center gap-3">
          <label className="field-label flex-1 min-w-[160px]">
            Desde
            <input
              className="field"
              type="date"
              value={from.split("T")[0]}
              onChange={(e) => setFrom(`${e.target.value}T00:00:00Z`)}
            />
          </label>

          <label className="field-label flex-1 min-w-[160px]">
            Hasta
            <input
              className="field"
              type="date"
              value={to.split("T")[0]}
              onChange={(e) => setTo(`${e.target.value}T23:59:59Z`)}
            />
          </label>

          {activeTab === "occupancy" && (
            <label className="field-label flex-1 min-w-[180px]">
              Edificio
              <select
                className="field"
                value={buildingId}
                onChange={(e) => setBuildingId(e.target.value)}
              >
                <option value="all">Todos los edificios</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="flex items-end gap-2 pt-4">
            <button
              type="button"
              className="btn btn-gold text-xs min-h-10 px-4"
              onClick={downloadCsv}
            >
              📥 Descargar CSV (Excel)
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="alert border-red-200 bg-red-50 text-xs text-red-800 md:text-sm">
            {errorMessage}
          </div>
        )}

        {/* TABLA DE OCUPACIÓN */}
        {activeTab === "occupancy" && (
          <div className="flex flex-col gap-3">
            {isLoading ? (
              <div className="panel flex items-center justify-center p-8 text-sm text-ink-soft">
                <span className="spinner mr-2" aria-hidden /> Generando reporte de ocupación…
              </div>
            ) : occupancyData.length === 0 ? (
              <div className="panel p-8 text-center text-sm text-ink-soft">
                No hay datos de ocupación para el rango seleccionado.
              </div>
            ) : (
              <div className="panel overflow-x-auto p-0">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-line bg-soft text-brand font-bold">
                      <th className="py-3 px-4">RECURSO</th>
                      <th className="py-3 px-4">EDIFICIO</th>
                      <th className="py-3 px-4">TIPO</th>
                      <th className="py-3 px-4 text-right">HORAS RESERVADAS</th>
                      <th className="py-3 px-4 text-right">HORAS DISPONIBLES</th>
                      <th className="py-3 px-4 text-right">TASA DE OCUPACIÓN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {occupancyData.map((row) => {
                      const pct = Math.round(row.occupancyRate * 100);
                      return (
                        <tr key={row.id} className="hover:bg-soft/40 transition-colors">
                          <td className="py-3 px-4 font-semibold text-brand">
                            {row.name}
                          </td>
                          <td className="py-3 px-4 text-ink-soft">
                            {row.building}
                          </td>
                          <td className="py-3 px-4 text-xs">
                            {row.type}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-brand">
                            {row.reservedHours} h
                          </td>
                          <td className="py-3 px-4 text-right text-ink-soft">
                            {row.availableHours} h
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={`inline-block font-bold rounded-full px-2.5 py-0.5 text-xs ${
                                pct > 60
                                  ? "bg-amber-100 text-amber-800"
                                  : pct > 30
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {pct}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TABLA DE USO POR DEPARTAMENTO */}
        {activeTab === "department" && (
          <div className="flex flex-col gap-3">
            {isLoading ? (
              <div className="panel flex items-center justify-center p-8 text-sm text-ink-soft">
                <span className="spinner mr-2" aria-hidden /> Generando reporte departamental…
              </div>
            ) : departmentData.length === 0 ? (
              <div className="panel p-8 text-center text-sm text-ink-soft">
                No hay datos departamentales registrados en este período.
              </div>
            ) : (
              <div className="panel overflow-x-auto p-0">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-line bg-soft text-brand font-bold">
                      <th className="py-3 px-4">DEPARTAMENTO / ÁREA</th>
                      <th className="py-3 px-4 text-right">USUARIOS ACTIVOS</th>
                      <th className="py-3 px-4 text-right">TOTAL RESERVAS</th>
                      <th className="py-3 px-4 text-right">CHECK-IN EXITOSOS</th>
                      <th className="py-3 px-4 text-right">NO-SHOW (INASISTENCIA)</th>
                      <th className="py-3 px-4 text-right">CANCELACIONES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {departmentData.map((d) => (
                      <tr key={d.department} className="hover:bg-soft/40 transition-colors">
                        <td className="py-3 px-4 font-semibold text-brand">
                          {d.department || "Sin departamento asignado"}
                        </td>
                        <td className="py-3 px-4 text-right text-ink-soft">
                          {d.users}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-brand">
                          {d.reservations}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                          {d.checkedIn}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-red-600">
                          {d.noShows}
                        </td>
                        <td className="py-3 px-4 text-right text-ink-soft">
                          {d.cancelled}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}


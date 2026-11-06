"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Tag } from "@/components/shared/Tag";
import { FeedbackDialog } from "@/components/shared/FeedbackDialog";
import { api } from "@/lib/api";
import type {
  ApiBuilding,
  ApiResource,
  BackendResourceType,
  CreateResourcePayload,
  FutureReservationAffected,
} from "@/types/api";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<ApiResource[]>([]);
  const [buildings, setBuildings] = useState<ApiBuilding[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal Crear / Editar
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ApiResource | null>(null);
  const [buildingId, setBuildingId] = useState("");
  const [type, setType] = useState<BackendResourceType>("MEETING_ROOM");
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("8");
  const [equipment, setEquipment] = useState("");
  const [rules, setRules] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Diálogo de confirmación con reservas afectadas al inactivar (HU-05)
  const [inactivatingResource, setInactivatingResource] = useState<ApiResource | null>(null);
  const [futureReservations, setFutureReservations] = useState<FutureReservationAffected[]>([]);
  const [isCheckingFuture, setIsCheckingFuture] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  async function loadData() {
    try {
      setIsLoading(true);
      const [bData, rData] = await Promise.all([
        api.catalog.getBuildings(true),
        api.admin.resources.list({ includeInactive: true }),
      ]);
      setBuildings(bData);
      setResources(rData.filter((r) => r.type !== "LAPTOP")); // Las laptops se gestionan en catálogo
      setErrorMessage(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al cargar recursos";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const openCreateModal = () => {
    setEditingResource(null);
    setBuildingId(buildings[0]?.id || "");
    setType("MEETING_ROOM");
    setName("");
    setCapacity("8");
    setEquipment("");
    setRules("");
    setModalOpen(true);
  };

  const openEditModal = (res: ApiResource) => {
    setEditingResource(res);
    setBuildingId(res.buildingId);
    setType(res.type);
    setName(res.name);
    setCapacity(String(res.capacity || 1));
    setEquipment(res.equipment || "");
    setRules(res.rules || "");
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !buildingId) return;

    setIsSaving(true);
    setErrorMessage(null);

    try {
      if (editingResource) {
        await api.admin.resources.update(editingResource.id, {
          name: name.trim(),
          capacity: Number(capacity) || 1,
          equipment: equipment.trim() || undefined,
          rules: rules.trim() || undefined,
        });
      } else {
        const payload: CreateResourcePayload = {
          buildingId,
          type,
          name: name.trim(),
          capacity: Number(capacity) || 1,
          equipment: equipment.trim() || undefined,
          rules: rules.trim() || undefined,
        };
        await api.admin.resources.create(payload);
      }
      setModalOpen(false);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al guardar el recurso";
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Manejo de inactivación con consulta de reservas futuras (HU-05)
  const handleToggleActiveClick = async (res: ApiResource) => {
    if (!res.isActive) {
      // Si está inactivo, reactivarlo directamente
      await api.admin.resources.update(res.id, { isActive: true });
      await loadData();
      return;
    }

    // Si está activo y se va a inactivar, consultar si hay reservas futuras afectadas
    setInactivatingResource(res);
    setIsCheckingFuture(true);
    try {
      const affected = await api.admin.resources.futureReservations(res.id);
      setFutureReservations(affected);
      setConfirmDialogOpen(true);
    } catch {
      // Si falla, permitir confirmar directamente
      setFutureReservations([]);
      setConfirmDialogOpen(true);
    } finally {
      setIsCheckingFuture(false);
    }
  };

  const confirmInactivation = async () => {
    if (!inactivatingResource) return;
    try {
      await api.admin.resources.update(inactivatingResource.id, { isActive: false });
      setConfirmDialogOpen(false);
      setInactivatingResource(null);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al inactivar recurso";
      setErrorMessage(msg);
    }
  };

  const filteredResources = resources.filter((r) => {
    if (selectedBuildingId !== "all" && r.buildingId !== selectedBuildingId) return false;
    if (selectedType !== "all" && r.type !== selectedType) return false;
    return true;
  });

  return (
    <AppShell title="Salas y Laboratorios">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-brand">Salas de Reuniones y Laboratorios de IA</h1>
            <p className="text-xs text-ink-soft">
              Configura los espacios físicos, capacidad, equipamiento y normativas de uso.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-gold"
            onClick={openCreateModal}
          >
            + Nuevo Espacio
          </button>
        </div>

        {/* Filtros */}
        <div className="panel flex flex-wrap items-center gap-3">
          <label className="field-label flex-1 min-w-[200px]">
            Edificio
            <select
              className="field"
              value={selectedBuildingId}
              onChange={(e) => setSelectedBuildingId(e.target.value)}
            >
              <option value="all">Todos los edificios</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field-label flex-1 min-w-[200px]">
            Tipo de espacio
            <select
              className="field"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">Todos los tipos</option>
              <option value="MEETING_ROOM">Sala de reuniones</option>
              <option value="AI_LAB">Laboratorio de IA</option>
            </select>
          </label>
        </div>

        {errorMessage && (
          <div className="alert border-red-200 bg-red-50 text-xs text-red-800 md:text-sm">
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <div className="panel flex items-center justify-center p-8 text-sm text-ink-soft">
            <span className="spinner mr-2" aria-hidden /> Cargando recursos…
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="panel p-8 text-center text-sm text-ink-soft">
            No se encontraron espacios con los filtros seleccionados.
          </div>
        ) : (
          <div className="panel overflow-x-auto p-0">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-soft text-brand font-bold">
                  <th className="py-3 px-4">NOMBRE</th>
                  <th className="py-3 px-4">EDIFICIO</th>
                  <th className="py-3 px-4">TIPO</th>
                  <th className="py-3 px-4">CAPACIDAD</th>
                  <th className="py-3 px-4">EQUIPAMIENTO</th>
                  <th className="py-3 px-4">ESTADO</th>
                  <th className="py-3 px-4 text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredResources.map((r) => (
                  <tr key={r.id} className="hover:bg-soft/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-brand">
                      {r.name}
                    </td>
                    <td className="py-3 px-4 text-ink-soft">
                      {r.building?.name || buildings.find((b) => b.id === r.buildingId)?.name || "-"}
                    </td>
                    <td className="py-3 px-4">
                      {r.type === "AI_LAB" ? (
                        <Tag variant="gold">Laboratorio IA</Tag>
                      ) : (
                        <Tag variant="default">Sala Reunión</Tag>
                      )}
                    </td>
                    <td className="py-3 px-4 text-ink-soft">
                      {r.capacity} personas
                    </td>
                    <td className="py-3 px-4 text-xs text-ink-soft max-w-[200px] truncate">
                      {r.equipment || "Estándar"}
                    </td>
                    <td className="py-3 px-4">
                      {r.isActive ? (
                        <Tag variant="default">Activo</Tag>
                      ) : (
                        <Tag variant="dark">Inactivo</Tag>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="btn btn-outline py-1 px-2.5 text-xs"
                          onClick={() => openEditModal(r)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          disabled={isCheckingFuture}
                          className={`btn py-1 px-2.5 text-xs ${
                            r.isActive ? "btn-outline text-red-600 hover:bg-red-50" : "btn-gold"
                          }`}
                          onClick={() => void handleToggleActiveClick(r)}
                        >
                          {r.isActive ? "Inactivar" : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal Crear / Editar Recurso */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="panel w-full max-w-lg bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
                <h3 className="text-lg font-bold text-brand">
                  {editingResource ? "Editar Espacio" : "Nuevo Espacio"}
                </h3>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="text-sm font-bold text-ink-soft hover:text-brand"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSave} className="flex flex-col gap-3">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <label className="field-label flex-1">
                    Edificio *
                    <select
                      className="field"
                      value={buildingId}
                      disabled={!!editingResource}
                      onChange={(e) => setBuildingId(e.target.value)}
                    >
                      {buildings.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field-label flex-1">
                    Tipo de espacio *
                    <select
                      className="field"
                      value={type}
                      disabled={!!editingResource}
                      onChange={(e) => setType(e.target.value as BackendResourceType)}
                    >
                      <option value="MEETING_ROOM">Sala de reuniones</option>
                      <option value="AI_LAB">Laboratorio de IA</option>
                    </select>
                  </label>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <label className="field-label flex-1">
                    Nombre del recurso *
                    <input
                      className="field"
                      type="text"
                      required
                      placeholder="Ej. Sala Pichincha"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </label>

                  <label className="field-label flex-1">
                    Capacidad (personas)
                    <input
                      className="field"
                      type="number"
                      min={1}
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                    />
                  </label>
                </div>

                <label className="field-label">
                  Equipamiento disponible
                  <input
                    className="field"
                    type="text"
                    placeholder="Ej. Pantalla 65 pulgadas, videoconferencia, pizarra"
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value)}
                  />
                </label>

                <label className="field-label">
                  Reglas o restricciones de uso
                  <textarea
                    className="field min-h-[70px] py-2"
                    placeholder="Ej. Exclusivo para reuniones con clientes o planificación"
                    value={rules}
                    onChange={(e) => setRules(e.target.value)}
                  />
                </label>

                <div className="mt-4 flex justify-end gap-2 border-t border-line pt-4">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setModalOpen(false)}
                    disabled={isSaving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-gold"
                    disabled={isSaving || !name.trim()}
                  >
                    {isSaving && <span className="spinner mr-1" aria-hidden />}
                    {editingResource ? "Actualizar" : "Crear Espacio"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Diálogo con Reservas Afectadas al Inactivar (HU-05) */}
        <FeedbackDialog
          open={confirmDialogOpen}
          onOpenChange={setConfirmDialogOpen}
          variant="error"
          title={`Inactivar ${inactivatingResource?.name}`}
          description={
            futureReservations.length > 0
              ? `ATENCIÓN: Existen ${futureReservations.length} reservas futuras confirmadas en este espacio. Al inactivarlo, se alertará a los asociados afectados.`
              : `¿Estás seguro de inactivar "${inactivatingResource?.name}"? Ningún asociado podrá seleccionarlo para nuevas reservas.`
          }
          footer={
            <>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setConfirmDialogOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-gold bg-red-600 hover:bg-red-700 text-white"
                onClick={() => void confirmInactivation()}
              >
                Confirmar Inactivación
              </button>
            </>
          }
        >
          {futureReservations.length > 0 && (
            <div className="max-h-48 overflow-y-auto rounded-lg border border-line bg-surface p-3 text-xs">
              <p className="font-bold text-red-700 mb-2">Reservas que se verán afectadas:</p>
              <ul className="divide-y divide-line">
                {futureReservations.map((r) => (
                  <li key={r.id} className="py-1.5 flex justify-between">
                    <span>{r.user.fullName} ({r.user.email})</span>
                    <span className="font-semibold text-brand">
                      {format(parseISO(r.startDateTime), "d 'de' MMM, HH:mm", { locale: es })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </FeedbackDialog>
      </div>
    </AppShell>
  );
}


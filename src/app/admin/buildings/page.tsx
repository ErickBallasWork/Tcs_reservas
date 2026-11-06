"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Tag } from "@/components/shared/Tag";
import { api } from "@/lib/api";
import type { ApiBuilding, CreateBuildingPayload } from "@/types/api";

export default function AdminBuildingsPage() {
  const [buildings, setBuildings] = useState<ApiBuilding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal de Crear / Editar
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<ApiBuilding | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function loadBuildings() {
    try {
      setIsLoading(true);
      const data = await api.admin.buildings.list(true);
      setBuildings(data);
      setErrorMessage(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al cargar edificios";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadBuildings();
  }, []);

  const openCreateModal = () => {
    setEditingBuilding(null);
    setName("");
    setAddress("");
    setModalOpen(true);
  };

  const openEditModal = (building: ApiBuilding) => {
    setEditingBuilding(building);
    setName(building.name);
    setAddress(building.address || "");
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    setErrorMessage(null);

    try {
      if (editingBuilding) {
        await api.admin.buildings.update(editingBuilding.id, {
          name: name.trim(),
          address: address.trim() || undefined,
        });
      } else {
        const payload: CreateBuildingPayload = {
          name: name.trim(),
          address: address.trim() || undefined,
        };
        await api.admin.buildings.create(payload);
      }
      setModalOpen(false);
      await loadBuildings();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al guardar edificio";
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (building: ApiBuilding) => {
    try {
      setErrorMessage(null);
      await api.admin.buildings.update(building.id, {
        isActive: !building.isActive,
      });
      await loadBuildings();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al cambiar estado";
      setErrorMessage(msg);
    }
  };

  return (
    <AppShell title="Administración de Edificios">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-brand">Edificios Corporativos</h1>
            <p className="text-xs text-ink-soft">
              Gestiona las sedes autorizadas para reservas de salas y laboratorios.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-gold"
            onClick={openCreateModal}
          >
            + Nuevo Edificio
          </button>
        </div>

        {errorMessage && (
          <div className="alert border-red-200 bg-red-50 text-xs text-red-800 md:text-sm">
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <div className="panel flex items-center justify-center p-8 text-sm text-ink-soft">
            <span className="spinner mr-2" aria-hidden /> Cargando edificios…
          </div>
        ) : buildings.length === 0 ? (
          <div className="panel p-8 text-center text-sm text-ink-soft">
            No hay edificios registrados en el sistema.
          </div>
        ) : (
          <div className="panel overflow-x-auto p-0">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-soft text-brand font-bold">
                  <th className="py-3 px-4">NOMBRE</th>
                  <th className="py-3 px-4">DIRECCIÓN</th>
                  <th className="py-3 px-4">ESTADO</th>
                  <th className="py-3 px-4 text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {buildings.map((b) => (
                  <tr key={b.id} className="hover:bg-soft/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-brand">
                      {b.name}
                    </td>
                    <td className="py-3 px-4 text-ink-soft">
                      {b.address || "Sin dirección especificada"}
                    </td>
                    <td className="py-3 px-4">
                      {b.isActive ? (
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
                          onClick={() => openEditModal(b)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className={`btn py-1 px-2.5 text-xs ${
                            b.isActive ? "btn-outline text-red-600 hover:bg-red-50" : "btn-gold"
                          }`}
                          onClick={() => void handleToggleActive(b)}
                        >
                          {b.isActive ? "Inactivar" : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal de Crear / Editar Edificio */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="panel w-full max-w-md bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
                <h3 className="text-lg font-bold text-brand">
                  {editingBuilding ? "Editar Edificio" : "Nuevo Edificio"}
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
                <label className="field-label">
                  Nombre del edificio *
                  <input
                    className="field"
                    type="text"
                    required
                    placeholder="Ej. Edificio Quito Norte"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>

                <label className="field-label">
                  Dirección
                  <input
                    className="field"
                    type="text"
                    placeholder="Av. Amazonas y Naciones Unidas"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
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
                    {editingBuilding ? "Actualizar" : "Crear Edificio"}
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


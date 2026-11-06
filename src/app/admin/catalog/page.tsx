"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Tag } from "@/components/shared/Tag";
import { api } from "@/lib/api";
import type { ApiBuilding, ApiResource } from "@/types/api";

export default function AdminCatalogPage() {
  const [tree, setTree] = useState<ApiBuilding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal para agregar Laptop a un laboratorio
  const [laptopModalOpen, setLaptopModalOpen] = useState(false);
  const [targetLab, setTargetLab] = useState<{ id: string; name: string; buildingId: string } | null>(null);
  const [laptopName, setLaptopName] = useState("");
  const [assetTag, setAssetTag] = useState("");
  const [equipment, setEquipment] = useState("GPU RTX 4060, 32 GB RAM");
  const [isSaving, setIsSaving] = useState(false);

  async function loadTree() {
    try {
      setIsLoading(true);
      const data = await api.catalog.getTree();
      setTree(data);
      setErrorMessage(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al cargar catálogo en árbol";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadTree();
  }, []);

  const openAddLaptopModal = (lab: ApiResource, buildingId: string) => {
    setTargetLab({ id: lab.id, name: lab.name, buildingId });
    setLaptopName(`LAP-IA-0${(lab.children?.length || 0) + 1}`);
    setAssetTag(`TCS-LAP-${Date.now().toString().slice(-4)}`);
    setEquipment("Core i7, 32 GB RAM, GPU RTX 4060");
    setLaptopModalOpen(true);
  };

  const handleSaveLaptop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetLab || !laptopName.trim()) return;

    setIsSaving(true);
    try {
      await api.admin.resources.create({
        buildingId: targetLab.buildingId,
        parentResourceId: targetLab.id,
        type: "LAPTOP",
        name: laptopName.trim(),
        capacity: 1,
        assetTag: assetTag.trim() || undefined,
        equipment: equipment.trim() || undefined,
      });
      setLaptopModalOpen(false);
      await loadTree();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al crear laptop";
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleLaptopActive = async (laptop: ApiResource) => {
    try {
      await api.admin.resources.update(laptop.id, { isActive: !laptop.isActive });
      await loadTree();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al cambiar estado";
      setErrorMessage(msg);
    }
  };

  return (
    <AppShell title="Catálogo y Laptops">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-brand">Estructura del Catálogo y Laptops de IA</h1>
            <p className="text-xs text-ink-soft">
              Vista jerárquica de Edificios, Laboratorios y laptops con código de inventario (HU-03, HU-04).
            </p>
          </div>
          <input
            className="field max-w-xs"
            type="search"
            placeholder="Buscar sala, lab o laptop…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {errorMessage && (
          <div className="alert border-red-200 bg-red-50 text-xs text-red-800 md:text-sm">
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <div className="panel flex items-center justify-center p-8 text-sm text-ink-soft">
            <span className="spinner mr-2" aria-hidden /> Cargando árbol del catálogo…
          </div>
        ) : tree.length === 0 ? (
          <div className="panel p-8 text-center text-sm text-ink-soft">
            No hay elementos en el catálogo actualmente.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {tree.map((b) => {
              const matchedResources = (b.resources || []).filter((r) => {
                if (!searchTerm.trim()) return true;
                const matchRes = r.name.toLowerCase().includes(searchTerm.toLowerCase());
                const matchChild = (r.children || []).some(
                  (c) =>
                    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (c.assetTag && c.assetTag.toLowerCase().includes(searchTerm.toLowerCase()))
                );
                return matchRes || matchChild;
              });

              if (searchTerm.trim() && matchedResources.length === 0) return null;

              return (
                <div key={b.id} className="panel flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-line pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-brand">🏢 {b.name}</span>
                      <small className="text-ink-soft">{b.address}</small>
                    </div>
                    <Tag variant="default">{matchedResources.length} Espacios</Tag>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {matchedResources.map((r) => (
                      <div
                        key={r.id}
                        className="rounded-lg border border-line bg-surface/50 p-3.5 flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-brand">{r.name}</span>
                              {r.type === "AI_LAB" ? (
                                <Tag variant="gold">Laboratorio IA</Tag>
                              ) : (
                                <Tag variant="default">Sala</Tag>
                              )}
                            </div>
                            <small className="text-ink-soft block mt-0.5">
                              Capacidad: {r.capacity} personas · {r.equipment || "Equipamiento base"}
                            </small>
                          </div>
                          {r.type === "AI_LAB" && (
                            <button
                              type="button"
                              className="btn btn-gold py-1 px-2 text-xs"
                              onClick={() => openAddLaptopModal(r, b.id)}
                            >
                              + Laptop
                            </button>
                          )}
                        </div>

                        {/* Sub-recursos / Laptops del Laboratorio */}
                        {r.type === "AI_LAB" && (
                          <div className="mt-1 rounded-md border border-line/80 bg-white p-2.5">
                            <span className="text-[11px] font-bold uppercase text-ink-soft block mb-1.5">
                              Laptops asignadas ({r.children?.length || 0}):
                            </span>
                            {(!r.children || r.children.length === 0) ? (
                              <p className="text-xs text-ink-soft italic">
                                No tiene laptops asociadas aún.
                              </p>
                            ) : (
                              <div className="grid gap-1.5">
                                {r.children.map((lap) => (
                                  <div
                                    key={lap.id}
                                    className="flex items-center justify-between text-xs py-1 border-b border-line/40 last:border-0"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-semibold text-brand">💻 {lap.name}</span>
                                      {lap.assetTag && (
                                        <span className="rounded bg-soft px-1.5 py-0.5 text-[10px] text-ink-soft font-mono">
                                          {lap.assetTag}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className={lap.isActive ? "text-emerald-700" : "text-gray-400"}>
                                        {lap.isActive ? "Activa" : "Inactiva"}
                                      </span>
                                      <button
                                        type="button"
                                        className="text-[11px] text-brand hover:underline"
                                        onClick={() => void handleToggleLaptopActive(lap)}
                                      >
                                        {lap.isActive ? "Inactivar" : "Activar"}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal para Agregar Laptop */}
        {laptopModalOpen && targetLab && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="panel w-full max-w-md bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
                <h3 className="text-lg font-bold text-brand">
                  Nueva Laptop en {targetLab.name}
                </h3>
                <button
                  type="button"
                  onClick={() => setLaptopModalOpen(false)}
                  className="text-sm font-bold text-ink-soft hover:text-brand"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveLaptop} className="flex flex-col gap-3">
                <label className="field-label">
                  Nombre identificador *
                  <input
                    className="field"
                    type="text"
                    required
                    placeholder="Ej. LAP-IA-01"
                    value={laptopName}
                    onChange={(e) => setLaptopName(e.target.value)}
                  />
                </label>

                <label className="field-label">
                  Código de Activo / Asset Tag
                  <input
                    className="field"
                    type="text"
                    placeholder="Ej. TCS-LAP-0045"
                    value={assetTag}
                    onChange={(e) => setAssetTag(e.target.value)}
                  />
                </label>

                <label className="field-label">
                  Especificaciones técnicas
                  <input
                    className="field"
                    type="text"
                    placeholder="Core i7, 32 GB RAM, RTX 4060"
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value)}
                  />
                </label>

                <div className="mt-4 flex justify-end gap-2 border-t border-line pt-4">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setLaptopModalOpen(false)}
                    disabled={isSaving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-gold"
                    disabled={isSaving || !laptopName.trim()}
                  >
                    {isSaving && <span className="spinner mr-1" aria-hidden />}
                    Guardar Laptop
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


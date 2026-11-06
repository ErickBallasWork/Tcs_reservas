"use client";

import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { MonthCalendar, WeekStrip } from "@/components/shared/MonthCalendar";
import { SlotCell } from "@/components/shared/SlotCell";
import { Tag } from "@/components/shared/Tag";
import { BookingForm } from "@/features/booking/BookingForm";
import {
  DEFAULT_DATE,
  FIRST_SELECTABLE_DATE,
  getDaysWithReservations,
  getSlotStatus,
} from "@/lib/availability";
import { buildings as fallbackBuildings, resources as fallbackResources } from "@/lib/mock-data";
import type { Building, Resource, ResourceType, SlotStatus } from "@/types";
import type { BackendResourceType } from "@/types/api";
import { api } from "@/lib/api";

const HOUR_RANGES = [
  { value: "morning", label: "08:00–13:00", hours: [8, 9, 10, 11, 12] },
  { value: "afternoon", label: "13:00–18:00", hours: [13, 14, 15, 16, 17] },
];

const BACKEND_TYPE_TO_FRONTEND: Record<BackendResourceType, ResourceType> = {
  MEETING_ROOM: "room",
  AI_LAB: "ai_lab",
  LAPTOP: "laptop",
};

const TYPE_ORDER: Record<ResourceType, number> = {
  room: 0,
  ai_lab: 1,
  laptop: 2,
};

const hourLabel = (h: number) => `${String(h).padStart(2, "0")}:00`;

const mobileTagVariant: Record<SlotStatus, "default" | "dark" | "gold"> = {
  free: "default",
  occupied: "dark",
  blocked: "gold",
};

export function AvailabilityView() {
  const [date, setDate] = useState(DEFAULT_DATE);
  const [buildingId, setBuildingId] = useState("b-a");
  const [rangeValue, setRangeValue] = useState("morning");
  const [minCapacity, setMinCapacity] = useState("");

  const [buildingList, setBuildingList] = useState<Building[]>(fallbackBuildings);
  const [resourceList, setResourceList] = useState<Resource[]>(fallbackResources);
  const [busySlotsMap, setBusySlotsMap] = useState<Record<string, string[]>>({});

  // Control del modal de reserva
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cargar edificios y recursos reales del backend
  useEffect(() => {
    let isMounted = true;
    async function loadCatalog() {
      try {
        const [apiBuildings, apiResources] = await Promise.all([
          api.catalog.getBuildings(),
          api.catalog.getResources(),
        ]);

        if (isMounted) {
          if (apiBuildings.length > 0) {
            const mappedBuildings: Building[] = apiBuildings.map((b) => ({
              id: b.id,
              name: b.name,
              address: b.address || "",
              active: b.isActive,
            }));
            setBuildingList(mappedBuildings);
            setBuildingId(mappedBuildings[0].id);
          }

          if (apiResources.length > 0) {
            const mappedResources: Resource[] = apiResources.map((r) => ({
              id: r.id,
              name: r.name,
              type: BACKEND_TYPE_TO_FRONTEND[r.type] || "room",
              buildingId: r.buildingId,
              capacity: r.capacity,
              active: r.isActive,
              parentLabId: r.parentResourceId || undefined,
            }));
            setResourceList(mappedResources);
          }
        }
      } catch {
        // Mantiene fallbacks
      }
    }

    void loadCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  // Consultar disponibilidad real del backend para el edificio y fecha seleccionados
  useEffect(() => {
    let isMounted = true;
    async function loadAvailability() {
      try {
        const from = `${date}T00:00:00Z`;
        const to = `${date}T23:59:59Z`;
        
        // Obtener recursos del edificio actual
        const currentResources = resourceList.filter(
          (r) => r.active && r.buildingId === buildingId
        );

        if (currentResources.length === 0) return;

        // Consultar slots de las salas y laboratorios principales
        const promises = currentResources
          .filter((r) => r.type !== "laptop")
          .map((r) => api.availability.getResource(r.id, from, to).catch(() => null));

        const results = await Promise.all(promises);

        if (isMounted) {
          const newBusyMap: Record<string, string[]> = {};
          for (const res of results) {
            if (!res) continue;
            newBusyMap[res.resourceId] = res.busySlots;
            if (res.laptops) {
              for (const lap of res.laptops) {
                newBusyMap[lap.id] = lap.busySlots;
              }
            }
          }
          setBusySlotsMap(newBusyMap);
        }
      } catch {
        // Fallback
      }
    }

    void loadAvailability();
    return () => {
      isMounted = false;
    };
  }, [date, buildingId, resourceList]);

  const markedDates = useMemo(() => getDaysWithReservations(), []);
  const activeBuildings = buildingList.filter((b) => b.active);
  const hours = HOUR_RANGES.find((r) => r.value === rangeValue)!.hours;

  const rows = useMemo(() => {
    const min = Number(minCapacity) || 0;
    return resourceList
      .filter(
        (r) =>
          r.active &&
          r.buildingId === buildingId &&
          (r.type === "laptop" || (r.capacity ?? 0) >= min),
      )
      .sort((a, b) => TYPE_ORDER[a.type] - TYPE_ORDER[b.type]);
  }, [buildingId, minCapacity, resourceList]);

  const rawTitle = format(parseISO(date), "EEEE d 'de' MMMM", { locale: es });
  const dateTitle = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);

  const calendarProps = {
    selected: date,
    markedDates,
    firstSelectableDate: FIRST_SELECTABLE_DATE,
    onSelect: setDate,
  };

  const calculateSlotStatus = (resource: Resource, h: number): SlotStatus => {
    const slots = busySlotsMap[resource.id];
    if (slots && slots.length > 0) {
      // El slot ISO viene como 2026-11-12T15:00:00.000Z
      const isBusy = slots.some((s) => {
        const slotDate = new Date(s);
        return slotDate.getUTCHours() === h || slotDate.getHours() === h;
      });
      if (isBusy) return "occupied";
    }

    // Si es laptop y su lab está ocupado
    if (resource.type === "laptop" && resource.parentLabId) {
      const parentSlots = busySlotsMap[resource.parentLabId];
      if (parentSlots && parentSlots.length > 0) {
        const parentBusy = parentSlots.some((s) => {
          const slotDate = new Date(s);
          return slotDate.getUTCHours() === h || slotDate.getHours() === h;
        });
        if (parentBusy) return "blocked";
      }
    }

    // Si no tenemos datos del backend para ese recurso, usamos el cálculo local
    return getSlotStatus(resource, date, h);
  };

  const buildingSelect = (
    <select
      className="field"
      value={buildingId}
      onChange={(e) => setBuildingId(e.target.value)}
    >
      {activeBuildings.map((b) => (
        <option key={b.id} value={b.id}>
          {b.name}
        </option>
      ))}
    </select>
  );

  const openModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Desktop */}
      <div className="hidden gap-4 md:grid md:grid-cols-[300px_1fr]">
        <div className="panel flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-brand">Noviembre 2026</h2>
            <Tag variant="gold">Con reservas</Tag>
          </div>
          <MonthCalendar year={2026} month={10} {...calendarProps} />
          <small className="text-ink-soft">
            Elige el día; solo desde mañana en adelante.
          </small>
        </div>

        <div className="flex flex-col gap-3">
          <div className="panel flex items-center gap-3">
            <label className="field-label flex-1">
              Edificio
              {buildingSelect}
            </label>
            <label className="field-label flex-1">
              Hora
              <select
                className="field"
                value={rangeValue}
                onChange={(e) => setRangeValue(e.target.value)}
              >
                {HOUR_RANGES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-label flex-1">
              Capacidad
              <input
                className="field"
                type="number"
                min={1}
                placeholder="Cualquiera"
                value={minCapacity}
                onChange={(e) => setMinCapacity(e.target.value)}
              />
            </label>
          </div>

          <div className="panel flex flex-col gap-3">
            <h2 className="text-base font-bold text-brand">{dateTitle}</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border-b-2 border-line p-2 text-left text-xs uppercase text-ink-soft">
                      Recurso
                    </th>
                    {hours.map((h) => (
                      <th
                        key={h}
                        className="border-b-2 border-line p-2 text-left text-xs uppercase text-ink-soft"
                      >
                        {hourLabel(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td className="whitespace-nowrap border-b border-soft px-2 py-1.5">
                        {r.type === "ai_lab" ? `${r.name} (completo)` : r.name}
                      </td>
                      {hours.map((h) => (
                        <td key={h} className="border-b border-soft px-2 py-1.5">
                          <SlotCell status={calculateSlotStatus(r, h)} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-3">
              <Tag>Libre</Tag>
              <Tag variant="dark">Ocupado</Tag>
              <Tag variant="gold">Bloqueado por laboratorio</Tag>
              <span className="flex-1" />
              <button
                type="button"
                onClick={openModal}
                className="btn btn-gold"
              >
                Reservar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="flex flex-col gap-3 md:hidden">
        <div className="flex items-start justify-between gap-3">
          <b>Noviembre 2026</b>
          <Tag variant="gold">Con reservas</Tag>
        </div>
        <WeekStrip {...calendarProps} />
        <label className="field-label">
          Edificio
          {buildingSelect}
        </label>
        {rows.map((r) => (
          <div key={r.id} className="panel flex flex-col gap-3">
            <b>{r.name}</b>
            <div className="flex flex-wrap items-center gap-3">
              {hours.map((h) => (
                <Tag key={h} variant={mobileTagVariant[calculateSlotStatus(r, h)]}>
                  {hourLabel(h)}
                </Tag>
              ))}
            </div>
            <button
              type="button"
              onClick={openModal}
              className="btn btn-gold"
            >
              Reservar
            </button>
            {r.type === "laptop" && (
              <small className="text-ink-soft">
                Amarillo: bloqueada por laboratorio completo.
              </small>
            )}
          </div>
        ))}
        {rows.length === 0 && (
          <small className="text-ink-soft">
            No hay recursos con esos filtros.
          </small>
        )}
      </div>

      {/* --- MODAL FLOTANTE DE RESERVA --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4 backdrop-blur-sm">
          <div className="panel relative max-h-[95vh] w-full max-w-[95vw] sm:max-w-7xl overflow-y-auto bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-lg font-bold text-brand">Nueva reserva</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-sm font-bold text-ink-soft hover:text-brand"
              >
                ✕ Cerrar
              </button>
            </div>
            <BookingForm />
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { MonthCalendar, WeekStrip } from "@/components/shared/MonthCalendar";
import { SlotCell } from "@/components/shared/SlotCell";
import { Tag } from "@/components/shared/Tag";
import {
  DEFAULT_DATE,
  FIRST_SELECTABLE_DATE,
  getDaysWithReservations,
  getSlotStatus,
} from "@/lib/availability";
import { buildings, resources } from "@/lib/mock-data";
import type { ResourceType, SlotStatus } from "@/types";

const HOUR_RANGES = [
  { value: "morning", label: "08:00–13:00", hours: [8, 9, 10, 11, 12] },
  { value: "afternoon", label: "13:00–18:00", hours: [13, 14, 15, 16, 17] },
];

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

  const markedDates = useMemo(() => getDaysWithReservations(), []);
  const activeBuildings = buildings.filter((b) => b.active);
  const hours = HOUR_RANGES.find((r) => r.value === rangeValue)!.hours;

  const rows = useMemo(() => {
    const min = Number(minCapacity) || 0;
    return resources
      .filter(
        (r) =>
          r.active &&
          r.buildingId === buildingId &&
          (r.type === "laptop" || (r.capacity ?? 0) >= min),
      )
      .sort((a, b) => TYPE_ORDER[a.type] - TYPE_ORDER[b.type]);
  }, [buildingId, minCapacity]);

  const rawTitle = format(parseISO(date), "EEEE d 'de' MMMM", { locale: es });
  const dateTitle = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);
  const hasLaptops = rows.some((r) => r.type === "laptop");

  const calendarProps = {
    selected: date,
    markedDates,
    firstSelectableDate: FIRST_SELECTABLE_DATE,
    onSelect: setDate,
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
                          <SlotCell status={getSlotStatus(r, date, h)} />
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
              <Link href={`/book?date=${date}`} className="btn btn-gold">
                Reservar
              </Link>
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
                <Tag key={h} variant={mobileTagVariant[getSlotStatus(r, date, h)]}>
                  {hourLabel(h)}
                </Tag>
              ))}
            </div>
            <Link
              href={`/book?resource=${r.id}&date=${date}`}
              className="btn btn-gold"
            >
              Reservar
            </Link>
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
    </>
  );
}

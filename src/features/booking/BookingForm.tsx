"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { FIRST_SELECTABLE_DATE } from "@/lib/availability";
import { checkBooking } from "@/lib/booking-rules";
import { reasonLabels, resourceTypeLabels } from "@/lib/labels";
import { resources } from "@/lib/mock-data";
import type { ReservationReason, ResourceType } from "@/types";

const TYPES: ResourceType[] = ["room", "ai_lab", "laptop"];
const SELECTABLE_REASONS: ReservationReason[] = [
  "training",
  "internal_meeting",
  "client_meeting",
];
const activeResources = resources.filter((r) => r.active);

export function BookingForm() {
  const params = useSearchParams();

  // Prefill from /book?resource=...&date=... (links from the availability screen)
  const [initial] = useState(() => {
    const preset = activeResources.find((r) => r.id === params.get("resource"));
    const dateParam = params.get("date");
    const date =
      dateParam && dateParam >= FIRST_SELECTABLE_DATE
        ? dateParam
        : FIRST_SELECTABLE_DATE;
    const type: ResourceType = preset?.type ?? "room";
    return {
      type,
      resourceId:
        preset?.id ?? activeResources.find((r) => r.type === type)!.id,
      start: `${date}T10:00`,
      end: `${date}T12:00`,
    };
  });

  const [type, setType] = useState<ResourceType>(initial.type);
  const [resourceId, setResourceId] = useState(initial.resourceId);
  const [start, setStart] = useState(initial.start);
  const [end, setEnd] = useState(initial.end);
  const [reason, setReason] = useState<ReservationReason | "">("");
  const [detail, setDetail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const resourceOptions = activeResources.filter((r) => r.type === type);
  const check = useMemo(
    () => checkBooking({ resourceId, start, end, reason, detail }),
    [resourceId, start, end, reason, detail],
  );

  const rules = [
    { key: "overlap", text: "La franja se cruza con otra reserva.", violated: check.overlap },
    { key: "anticipation", text: "Se requiere al menos 1 día de anticipación.", violated: check.anticipation },
    { key: "duration", text: "La duración máxima continua es de 2 días.", violated: check.duration },
  ];

  const extraErrors: string[] = [];
  if (check.rangeInvalid) {
    extraErrors.push("La fecha de fin debe ser posterior al inicio.");
  }
  if (submitted && check.missingFields) {
    extraErrors.push("Motivo y detalle son obligatorios.");
  }

  const handleTypeChange = (next: ResourceType) => {
    setType(next);
    setResourceId(activeResources.find((r) => r.type === next)!.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setSuccess(null);

    const blocked =
      check.rangeInvalid ||
      check.overlap ||
      check.anticipation ||
      check.duration ||
      check.missingFields;
    if (blocked) return;

    setSuccess(
      reason === "training"
        ? "Solicitud enviada. Entrenamiento pendiente de aprobación del Líder de Conocimiento; el espacio queda bloqueado mientras se decide."
        : "Reserva confirmada.",
    );
    setReason("");
    setDetail("");
    setSubmitted(false);
  };

  const successBox = success && (
    <div className="rounded-[10px] border border-line bg-soft p-3 font-semibold text-brand">
      {success}
    </div>
  );

  return (
    <div className="grid gap-4 md:grid-cols-[3fr_2fr]">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="panel flex flex-col gap-3"
      >
        <div className="flex flex-col gap-3 md:flex-row">
          <label className="field-label md:flex-1">
            Tipo
            <select
              className="field"
              value={type}
              onChange={(e) => handleTypeChange(e.target.value as ResourceType)}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {resourceTypeLabels[t]}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label md:flex-1">
            Recurso
            <select
              className="field"
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
            >
              {resourceOptions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <label className="field-label md:flex-1">
            Inicio
            <input
              className="field"
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </label>
          <label className="field-label md:flex-1">
            Fin
            <input
              className="field"
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </label>
        </div>

        <label className="field-label">
          Motivo
          <select
            className="field"
            value={reason}
            onChange={(e) => setReason(e.target.value as ReservationReason | "")}
          >
            <option value="">Selecciona un motivo</option>
            {SELECTABLE_REASONS.map((r) => (
              <option key={r} value={r}>
                {reasonLabels[r]}
              </option>
            ))}
          </select>
        </label>

        <label className="field-label">
          <span className="md:hidden">Detalle</span>
          <span className="hidden md:inline">Detalle / justificación</span>
          <textarea
            className="field min-h-[76px] py-2.5"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
          />
        </label>

        {/* Mobile: only the violated rules, right above the button */}
        <div className="flex flex-col gap-3 md:hidden">
          {rules
            .filter((r) => r.violated)
            .map((r) => (
              <div key={r.key} className="alert">
                {r.text}
              </div>
            ))}
          {extraErrors.map((m) => (
            <div key={m} className="alert">
              {m}
            </div>
          ))}
          {successBox}
        </div>

        <button type="submit" className="btn btn-gold">
          Solicitar reserva
        </button>
      </form>

      {/* Desktop: validations card */}
      <div className="panel hidden flex-col gap-3 md:flex">
        <h2 className="text-base font-bold text-brand">Validaciones</h2>
        {rules.map((r) => (
          <div
            key={r.key}
            className={cn(
              r.violated
                ? "alert"
                : "rounded-[10px] border border-line bg-soft p-3 text-brand",
            )}
          >
            {r.text}
          </div>
        ))}
        {extraErrors.map((m) => (
          <div key={m} className="alert">
            {m}
          </div>
        ))}
        {successBox}
        <small className="text-ink-soft">
          Motivo y detalle son obligatorios. Entrenamiento requiere aprobación
          del Líder.
        </small>
      </div>
    </div>
  );
}
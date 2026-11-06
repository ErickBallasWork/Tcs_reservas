"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { FIRST_SELECTABLE_DATE } from "@/lib/availability";
import { checkBooking } from "@/lib/booking-rules";
import { reasonLabels, resourceTypeLabels } from "@/lib/labels";
import { resources as fallbackResources } from "@/lib/mock-data";
import type { ReservationReason, Resource, ResourceType } from "@/types";
import type { BackendPurpose, BackendResourceType } from "@/types/api";
import { api } from "@/lib/api";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { FeedbackDialog } from "@/components/shared/FeedbackDialog";

const TYPES: ResourceType[] = ["room", "ai_lab", "laptop"];
const SELECTABLE_REASONS: ReservationReason[] = [
  "training",
  "internal_meeting",
  "client_meeting",
];

const BACKEND_TYPE_TO_FRONTEND: Record<BackendResourceType, ResourceType> = {
  MEETING_ROOM: "room",
  AI_LAB: "ai_lab",
  LAPTOP: "laptop",
};

const FRONTEND_REASON_TO_BACKEND: Record<ReservationReason, BackendPurpose> = {
  training: "TRAINING",
  internal_meeting: "INTERNAL_MEETING",
  client_meeting: "CLIENT_MEETING",
  client_event: "CLIENT_MEETING",
};

const RULE_TEXT = {
  overlap: "La franja se cruza con otra reserva.",
  anticipation: "Se requiere al menos 1 día de anticipación.",
  duration: "La duración máxima continua es de 2 días.",
  range: "La fecha de fin debe ser posterior al inicio.",
  required: "Motivo y detalle son obligatorios.",
};

type Feedback =
  | { kind: "error"; messages: string[] }
  | {
      kind: "success";
      training: boolean;
      resourceName: string;
      start: string;
      end: string;
      reasonLabel: string;
    };

const formatDateTime = (value: string) => {
  try {
    return format(parseISO(value), "d 'de' MMMM, HH:mm", { locale: es });
  } catch {
    return value;
  }
};

export function BookingForm() {
  const params = useSearchParams();
  const [resourceList, setResourceList] = useState<Resource[]>(fallbackResources.filter((r) => r.active));

  const [initial] = useState(() => {
    const preset = fallbackResources.find((r) => r.id === params.get("resource"));
    const dateParam = params.get("date");
    const hourParam = params.get("hour");
    
    const date =
      dateParam && dateParam >= FIRST_SELECTABLE_DATE
        ? dateParam
        : FIRST_SELECTABLE_DATE;
        
    const type: ResourceType = preset?.type ?? "room";
    const startHour = hourParam ? Number(hourParam) : 10;
    const endHour = startHour + 1;
    const pad = (n: number) => String(n).padStart(2, "0");

    return {
      type,
      resourceId: preset?.id ?? fallbackResources.find((r) => r.type === type)?.id ?? "r-101",
      start: `${date}T${pad(startHour)}:00`,
      end: `${date}T${pad(endHour)}:00`,
    };
  });

  const [type, setType] = useState<ResourceType>(initial.type);
  const [resourceId, setResourceId] = useState(initial.resourceId);
  const [start, setStart] = useState(initial.start);
  const [end, setEnd] = useState(initial.end);
  const [reason, setReason] = useState<ReservationReason | "">("");
  const [detail, setDetail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Cargar recursos del catálogo del backend
  useEffect(() => {
    let isMounted = true;
    async function loadCatalog() {
      try {
        const apiResources = await api.catalog.getResources();
        if (isMounted && apiResources.length > 0) {
          const mapped: Resource[] = apiResources.map((r) => ({
            id: r.id,
            name: r.name,
            type: BACKEND_TYPE_TO_FRONTEND[r.type] || "room",
            buildingId: r.buildingId,
            capacity: r.capacity,
            active: r.isActive,
            parentLabId: r.parentResourceId || undefined,
          }));
          setResourceList(mapped.filter((r) => r.active));
          // Si el resourceId actual no existe en la nueva lista, seleccionar el primero compatible
          if (!mapped.some((r) => r.id === resourceId)) {
            const firstOfType = mapped.find((r) => r.type === type);
            if (firstOfType) setResourceId(firstOfType.id);
          }
        }
      } catch {
        // Mantiene fallbackResources
      }
    }
    void loadCatalog();
    return () => {
      isMounted = false;
    };
  }, [resourceId, type]);

  const resourceOptions = resourceList.filter((r) => r.type === type);

  const check = useMemo(
    () => checkBooking({ resourceId, start, end, reason, detail }),
    [resourceId, start, end, reason, detail],
  );

  const rules = [
    { key: "overlap", text: RULE_TEXT.overlap, violated: check.overlap },
    { key: "anticipation", text: RULE_TEXT.anticipation, violated: check.anticipation },
    { key: "duration", text: RULE_TEXT.duration, violated: check.duration },
  ];

  const extraErrors: string[] = [];
  if (check.rangeInvalid) extraErrors.push(RULE_TEXT.range);
  if (submitted && check.missingFields) extraErrors.push(RULE_TEXT.required);

  const handleTypeChange = (next: ResourceType) => {
    setType(next);
    const found = resourceList.find((r) => r.type === next);
    if (found) {
      setResourceId(found.id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const messages: string[] = [];
    if (check.rangeInvalid) messages.push(RULE_TEXT.range);
    if (check.anticipation) messages.push(RULE_TEXT.anticipation);
    if (check.duration) messages.push(RULE_TEXT.duration);
    if (check.missingFields) messages.push(RULE_TEXT.required);

    if (messages.length > 0) {
      setFeedback({ kind: "error", messages });
      setDialogOpen(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Formato ISO requerido por el backend
      const startDate = new Date(start);
      const endDate = new Date(end);
      const purposeBackend = FRONTEND_REASON_TO_BACKEND[reason as ReservationReason] || "INTERNAL_MEETING";

      await api.reservations.create({
        resourceId,
        startDateTime: startDate.toISOString(),
        endDateTime: endDate.toISOString(),
        purpose: purposeBackend,
        justification: detail,
      });

      const resource = resourceList.find((r) => r.id === resourceId);
      setFeedback({
        kind: "success",
        training: reason === "training",
        resourceName: resource?.name ?? "",
        start,
        end,
        reasonLabel: reason ? reasonLabels[reason] : "",
      });
      setDialogOpen(true);
      setReason("");
      setDetail("");
      setSubmitted(false);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Ocurrió un error al procesar tu solicitud con el servidor.";
      setFeedback({ kind: "error", messages: [errorMsg] });
      setDialogOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            placeholder="Describe brevemente el motivo de la reserva"
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
        </div>

        <button type="submit" className="btn btn-gold" disabled={isSubmitting}>
          {isSubmitting && <span className="spinner" aria-hidden />}
          {isSubmitting ? "Enviando…" : "Solicitar reserva"}
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
        <small className="text-ink-soft">
          Motivo y detalle son obligatorios. Entrenamiento requiere aprobación
          del Líder.
        </small>
      </div>

      {feedback?.kind === "error" && (
        <FeedbackDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          variant="error"
          title="No se pudo solicitar la reserva"
          description="Ocurrió el siguiente inconveniente:"
          footer={
            <button
              type="button"
              className="btn btn-gold"
              onClick={() => setDialogOpen(false)}
            >
              Entendido
            </button>
          }
        >
          <div className="flex flex-col gap-2">
            {feedback.messages.map((m) => (
              <div key={m} className="alert">
                {m}
              </div>
            ))}
          </div>
        </FeedbackDialog>
      )}

      {feedback?.kind === "success" && (
        <FeedbackDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          variant="success"
          title={feedback.training ? "Solicitud enviada" : "Reserva confirmada"}
          description={
            feedback.training
              ? "Tu entrenamiento quedó pendiente de aprobación del Líder de Conocimiento. El espacio queda bloqueado mientras se decide."
              : "Tu reserva quedó registrada exitosamente en el sistema."
          }
          footer={
            <>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setDialogOpen(false)}
              >
                Hacer otra reserva
              </button>
              <Link href="/my-reservations" className="btn btn-gold">
                Ver mis reservas
              </Link>
            </>
          }
        >
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-[10px] border border-line bg-surface p-3 text-sm">
            <dt className="font-semibold text-ink-soft">Recurso</dt>
            <dd>{feedback.resourceName}</dd>
            <dt className="font-semibold text-ink-soft">Inicio</dt>
            <dd>{formatDateTime(feedback.start)}</dd>
            <dt className="font-semibold text-ink-soft">Fin</dt>
            <dd>{formatDateTime(feedback.end)}</dd>
            <dt className="font-semibold text-ink-soft">Motivo</dt>
            <dd>{feedback.reasonLabel}</dd>
          </dl>
        </FeedbackDialog>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FeedbackDialog } from "@/components/shared/FeedbackDialog";
import { Tag } from "@/components/shared/Tag";
import { useAuth } from "@/lib/auth";
import {
  REQUIRE_NOTIFICATIONS,
  requestPermission,
  showSystemNotification,
} from "@/lib/notifications";

const ALLOWED_DOMAINS = ["@tcs.com", "@pichincha.com"];

type BlockedReason = "denied" | "dismissed" | "unsupported";

const blockedContent: Record<
  BlockedReason,
  { title: string; description: string; steps?: string[] }
> = {
  denied: {
    title: "Notificaciones bloqueadas",
    description:
      "Para usar TCS Reservas debes permitir las notificaciones del navegador, y ahora están bloqueadas para este sitio.",
    steps: [
      "Haz clic en el icono del candado (o de ajustes) junto a la dirección del sitio.",
      "Busca «Notificaciones» y cámbialo a «Permitir».",
      "Recarga la página e inicia sesión de nuevo.",
    ],
  },
  dismissed: {
    title: "Falta tu permiso",
    description:
      "Las notificaciones son obligatorias para ingresar. Vuelve a intentarlo y elige «Permitir» cuando el navegador te pregunte.",
  },
  unsupported: {
    title: "Tu navegador no admite notificaciones",
    description:
      "Para ingresar necesitas un navegador compatible. En iPhone, abre el menú Compartir, elige «Agregar a pantalla de inicio» y abre la app desde ahí (iOS 16.4 o superior).",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dialog, setDialog] = useState<{
    open: boolean;
    reason: BlockedReason;
  }>({ open: false, reason: "dismissed" });

  const attemptLogin = async () => {
    const normalized = email.trim().toLowerCase();
    const allowed = ALLOWED_DOMAINS.some(
      (d) => normalized.endsWith(d) && normalized.length > d.length,
    );
    if (!allowed) {
      setHasError(true);
      return;
    }
    setHasError(false);

    if (REQUIRE_NOTIFICATIONS) {
      setIsLoading(true);
      const permission = await requestPermission();
      setIsLoading(false);

      if (permission !== "granted") {
        setDialog({
          open: true,
          reason: permission === "default" ? "dismissed" : permission,
        });
        return;
      }
      void showSystemNotification(
        "Notificaciones activadas",
        "Recibirás avisos de tus reservas.",
      );
    }

    login(normalized); // TODO: replace with the real MSAL / Entra ID login
    router.push("/");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void attemptLogin();
  };

  const content = blockedContent[dialog.reason];

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="bg-brand p-5 text-white md:flex md:flex-1 md:flex-col md:justify-center md:gap-2.5 md:p-20">
        <div className="text-lg font-bold md:text-[46px] md:font-extrabold">
          TCS <span className="md:text-gold">Reservas</span>
        </div>
        <p className="hidden md:block">Salas de reuniones y Laboratorio de IA</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col justify-center gap-3.5 bg-surface p-4 md:bg-white md:px-[120px]"
      >
        <h1 className="text-[22px] font-bold text-brand">Iniciar sesión</h1>
        <p>Usa tu correo corporativo (SSO)</p>
        <label className="field-label">
          Correo
          <input
            className="field"
            type="email"
            placeholder="nombre@tcs.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <button type="submit" className="btn btn-gold" disabled={isLoading}>
          {isLoading && <span className="spinner" aria-hidden />}
          {isLoading ? "Solicitando permiso…" : "Continuar con SSO"}
        </button>
        <div className="flex items-center gap-3">
          <Tag>@tcs.com</Tag>
          <Tag>@pichincha.com</Tag>
        </div>
        <small
          role={hasError ? "alert" : undefined}
          className={hasError ? "font-semibold text-red-700" : "text-ink-soft"}
        >
          Otros dominios no están permitidos.
        </small>
        {REQUIRE_NOTIFICATIONS && (
          <small className="text-ink-soft">
            Para ingresar debes permitir las notificaciones del navegador.
          </small>
        )}
      </form>

      <FeedbackDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
        variant="error"
        title={content.title}
        description={content.description}
        footer={
          <>
            {dialog.reason === "dismissed" && (
              <button
                type="button"
                className="btn btn-gold"
                onClick={() => {
                  setDialog((d) => ({ ...d, open: false }));
                  void attemptLogin();
                }}
              >
                Intentar de nuevo
              </button>
            )}
            <button
              type="button"
              className={
                dialog.reason === "dismissed"
                  ? "btn btn-outline"
                  : "btn btn-gold"
              }
              onClick={() => setDialog((d) => ({ ...d, open: false }))}
            >
              {dialog.reason === "dismissed" ? "Cancelar" : "Entendido"}
            </button>
          </>
        }
      >
        {content.steps && (
          <ol className="list-decimal space-y-1.5 rounded-[10px] border border-line bg-surface p-3 pl-7 text-sm">
            {content.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        )}
      </FeedbackDialog>
    </div>
  );
}

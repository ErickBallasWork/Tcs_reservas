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

const ALLOWED_DOMAINS = ["@tcs.com", "@pichincha.com", "@demo.com"];

const DEMO_USERS = [
  { label: "Ana (Asociado)", email: "ana.asociado@demo.com" },
  { label: "Luis (Líder)", email: "luis.lider@demo.com" },
  { label: "Carlos (SPOC Edificio)", email: "carlos.spoc@demo.com" },
  { label: "Sofía (SPOC Admin)", email: "sofia.spocadmin@demo.com" },
  { label: "Admin", email: "admin@demo.com" },
];

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
  const [loginErrorMessage, setLoginErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dialog, setDialog] = useState<{
    open: boolean;
    reason: BlockedReason;
  }>({ open: false, reason: "dismissed" });

  const attemptLogin = async (targetEmail?: string) => {
    const rawEmail = targetEmail ?? email;
    const normalized = rawEmail.trim().toLowerCase();
    const allowed = ALLOWED_DOMAINS.some(
      (d) => normalized.endsWith(d) && normalized.length > d.length,
    );
    if (!allowed) {
      setHasError(true);
      return;
    }
    setHasError(false);
    setLoginErrorMessage(null);

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

    try {
      setIsLoading(true);
      await login(normalized);
      router.push("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al iniciar sesión";
      setLoginErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
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
            placeholder="nombre@tcs.com o usuario@demo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <button type="submit" className="btn btn-gold" disabled={isLoading}>
          {isLoading && <span className="spinner" aria-hidden />}
          {isLoading ? "Iniciando sesión…" : "Continuar con SSO"}
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <Tag>@tcs.com</Tag>
          <Tag>@pichincha.com</Tag>
          <Tag variant="gold">@demo.com</Tag>
        </div>

        {/* Accesos rápidos de desarrollo con usuarios del backend */}
        <div className="mt-2 rounded-lg border border-line bg-surface/60 p-3">
          <p className="mb-2 text-xs font-semibold uppercase text-ink-soft">
            Usuarios Demo (Backend):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {DEMO_USERS.map((u) => (
              <button
                key={u.email}
                type="button"
                className="cursor-pointer rounded-md border border-line bg-white px-2 py-1 text-xs text-brand hover:border-gold hover:text-gold transition-colors"
                onClick={() => {
                  setEmail(u.email);
                  void attemptLogin(u.email);
                }}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>

        {hasError && (
          <small role="alert" className="font-semibold text-red-700">
            Solo se permiten correos @tcs.com, @pichincha.com o @demo.com.
          </small>
        )}

        {loginErrorMessage && (
          <small role="alert" className="font-semibold text-red-700">
            {loginErrorMessage}
          </small>
        )}

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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tag } from "@/components/shared/Tag";

const ALLOWED_DOMAINS = ["@tcs.com", "@pichincha.com"];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [hasError, setHasError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = email.trim().toLowerCase();
    const allowed = ALLOWED_DOMAINS.some(
      (d) => normalized.endsWith(d) && normalized.length > d.length,
    );
    if (!allowed) {
      setHasError(true);
      return;
    }
    setHasError(false);
    router.push("/"); // TODO: replace with the real MSAL / Entra ID login
  };

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
        <button type="submit" className="btn btn-gold">
          Continuar con SSO
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
      </form>
    </div>
  );
}

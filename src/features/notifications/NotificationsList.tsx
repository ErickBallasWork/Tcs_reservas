"use client";

import { useState } from "react";
import { notifications as initialNotifications } from "@/lib/mock-data";
import { Tag } from "@/components/shared/Tag";
import type { AppNotification } from "@/types";

export function NotificationsList() {
  const [notificationList, setNotificationList] = useState<AppNotification[]>(initialNotifications);

  const handleRegisterUse = () => {
    // Simula la acción de registrar uso (elimina la notificación de check-in de la lista)
    setNotificationList((prev) => 
      prev.filter((n) => !n.message.toLowerCase().includes("registrar uso"))
    );
  };

  const hasCheckin = notificationList.some((n) => 
    n.message.toLowerCase().includes("registrar uso")
  );

  return (
    <div className="grid gap-6 md:grid-cols-[3fr_2fr] items-start">
      
      {/* Columna Izquierda: Centro de notificaciones */}
      <div className="flex flex-col gap-3">
        <h2 className="text-base font-bold text-brand">Centro de notificaciones</h2>

        {/* Tabla contenedora en un panel idéntico al PDF */}
        <div className="panel overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-line bg-soft text-brand font-bold text-xs">
                  <th className="py-3 px-4">AVISO</th>
                  <th className="py-3 px-4 text-right">ESTADO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {notificationList
                  .filter((n) => !n.message.toLowerCase().includes("registrar uso") && !n.message.toLowerCase().includes("bloqueo por inasistencia"))
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-soft/50 transition-colors">
                      <td className="py-3.5 px-4 text-brand text-xs md:text-sm font-medium">
                        {item.message}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <NotificationStatusTag read={item.read} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Registrar uso y Aviso de bloqueo */}
      <div className="flex flex-col gap-4">
        
        {/* Bloque Registrar uso */}
        <div className="flex flex-col gap-3">
          <h2 className="text-base font-bold text-brand">Registrar uso</h2>

          <div className="panel flex flex-col gap-4 p-5">
            <span className="text-xs md:text-sm font-medium text-brand">
              Sala 101 · hoy 10:00–12:00
            </span>

            {hasCheckin ? (
              <button
                type="button"
                onClick={handleRegisterUse}
                className="btn btn-gold w-full py-2.5 text-sm font-bold shadow-sm"
              >
                Registrar uso
              </button>
            ) : (
              <div className="rounded-[10px] border border-line bg-soft py-2.5 text-center text-xs font-semibold text-brand">
                ¡Uso registrado!
              </div>
            )}
          </div>
        </div>

        {/* Alerta / Bloqueo por inasistencia (idéntico a la primera imagen) */}
        <div className="rounded-[10px] border border-amber-200 bg-amber-50 p-4 text-xs md:text-sm font-medium text-amber-900 leading-relaxed shadow-sm">
          Bloqueo por inasistencia: no puedes reservar hasta que un Administrador lo regularice.
        </div>

      </div>

    </div>
  );
}

function NotificationStatusTag({ read }: { read: boolean }) {
  if (!read) {
    return <Tag variant="gold">Nueva</Tag>;
  }
  return <Tag variant="default">Leída</Tag>;
}
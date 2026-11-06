'use client';

import { useState } from 'react';
import { Tag } from '@/components/shared/Tag';
import { notifications as initialNotifications } from '@/lib/mock-data';
import { showSystemNotification } from '@/lib/notifications';
import type { AppNotification } from '@/types';

function NewTagButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Marcar como leída"
      className="cursor-pointer rounded-full transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <Tag variant="gold">Nueva</Tag>
    </button>
  );
}

export function NotificationsView() {
  const [items, setItems] = useState<AppNotification[]>(initialNotifications);

  const unreadCount = items.filter((n) => !n.read).length;

  const markRead = (id: string) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  const sendTest = () => {
    const note: AppNotification = {
      id: `n-${Date.now()}`,
      title: 'Aviso de prueba',
      detail: 'Las notificaciones del navegador funcionan.',
      message: 'Aviso de prueba: las notificaciones del navegador funcionan.',
      read: false,
    };
    setItems((prev) => [note, ...prev]);
    void showSystemNotification(note.title, note.detail);
  };

  return (
    <>
      <div className="panel hidden flex-col gap-3 md:flex">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-brand">Centro de notificaciones</h2>
          <button
            type="button"
            className="btn btn-outline min-h-9 px-3 text-sm"
            onClick={markAllRead}
            disabled={unreadCount === 0}
          >
            Marcar todas como leídas
          </button>
        </div>
        {items.length === 0 ? (
          <small className="text-ink-soft">No tienes notificaciones.</small>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b-2 border-line p-2 text-left text-xs text-ink-soft uppercase">
                  Aviso
                </th>
                <th className="border-b-2 border-line p-2 text-left text-xs text-ink-soft uppercase">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((n) => (
                <tr key={n.id}>
                  <td className="border-b border-soft px-2 py-1.5">{n.message}</td>
                  <td className="border-b border-soft px-2 py-1.5">
                    {n.read ? <Tag>Leída</Tag> : <NewTagButton onClick={() => markRead(n.id)} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {items.map((n) => (
          <div key={n.id} className="panel flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <b>{n.title}</b>
              {n.read ? <Tag>Leída</Tag> : <NewTagButton onClick={() => markRead(n.id)} />}
            </div>
            <small className="text-ink-soft">{n.detail}</small>
          </div>
        ))}
        {items.length === 0 && <small className="text-ink-soft">No tienes notificaciones.</small>}
        {unreadCount > 0 && (
          <button type="button" className="btn btn-outline" onClick={markAllRead}>
            Marcar todas como leídas
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn btn-outline" onClick={sendTest}>
          Enviar aviso de prueba
        </button>
        <small className="text-ink-soft">
          Demo: agrega un aviso y lo muestra como notificación del navegador.
        </small>
      </div>
    </>
  );
}

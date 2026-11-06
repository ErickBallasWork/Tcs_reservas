'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { messageForError } from '@/api/error-messages';
import type { ManagedUser } from '@/api/types';
import { Tag } from '@/components/shared/Tag';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRevokeDevice, useUserDevices } from '@/features/users/useUsers';
import { userLabels as labels } from '@/lib/labels';

const DATE_FORMAT = 'd MMM yyyy, HH:mm';

interface DevicesDialogProps {
  user: ManagedUser;
  onClose: () => void;
}

export function DevicesDialog({ user, onClose }: DevicesDialogProps) {
  const devices = useUserDevices(user.id);
  const revoke = useRevokeDevice(user.id);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-4 rounded-[14px] p-6 sm:max-w-[520px]">
        <DialogHeader className="gap-1.5 text-left">
          <DialogTitle className="text-lg font-bold text-brand">{labels.devicesTitle}</DialogTitle>
          <DialogDescription>
            {user.fullName} ({user.email})
          </DialogDescription>
        </DialogHeader>
        {devices.isPending && (
          <p role="status" className="flex items-center gap-2">
            <span className="spinner" aria-hidden />
            {labels.loading}
          </p>
        )}
        {(devices.isError || revoke.isError) && (
          <p role="alert" className="font-semibold text-red-700">
            {messageForError(devices.error ?? revoke.error)}
          </p>
        )}
        {devices.data?.length === 0 && <p className="text-ink-soft">{labels.noDevices}</p>}
        <ul className="flex flex-col gap-2">
          {devices.data?.map((device) => (
            <li
              key={device.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line p-3"
            >
              <div className="min-w-0 text-sm">
                <p className="font-semibold">{device.label ?? labels.unnamedDevice}</p>
                <p className="text-ink-soft">
                  {labels.lastUsed(
                    format(new Date(device.lastUsedAt), DATE_FORMAT, { locale: es }),
                  )}
                </p>
              </div>
              {device.revokedAt ? (
                <Tag>{labels.revoked}</Tag>
              ) : (
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={revoke.isPending}
                  onClick={() => revoke.mutate(device.id)}
                >
                  {labels.revoke}
                </button>
              )}
            </li>
          ))}
        </ul>
        <DialogFooter>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            {labels.close}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

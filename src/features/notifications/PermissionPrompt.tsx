'use client';

import { useState } from 'react';
import { FeedbackDialog } from '@/components/shared/FeedbackDialog';
import {
  REQUIRE_NOTIFICATIONS,
  requestPermission,
  showSystemNotification,
  useNotificationPermission,
} from '@/lib/notifications';
import { notificationPermissionLabels as labels } from '@/lib/labels';

export function PermissionPrompt() {
  const permission = useNotificationPermission();
  const [stepsOpen, setStepsOpen] = useState(false);

  if (!REQUIRE_NOTIFICATIONS || permission === null || permission === 'granted') return null;

  const handleEnable = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      void showSystemNotification(labels.granted.title, labels.granted.body);
    } else if (result !== 'default') {
      setStepsOpen(true);
    }
  };

  const blocked = permission === 'denied' || permission === 'unsupported';
  const content = permission === 'unsupported' ? labels.unsupported : labels.denied;

  return (
    <>
      <div
        role="status"
        className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-gold bg-gold-soft px-3 py-2 text-sm font-semibold text-gold-ink"
      >
        <span>{labels.banner}</span>
        <button
          type="button"
          className="btn btn-gold min-h-11"
          onClick={blocked ? () => setStepsOpen(true) : () => void handleEnable()}
        >
          {blocked ? labels.seeSteps : labels.enable}
        </button>
      </div>
      <FeedbackDialog
        open={stepsOpen}
        onOpenChange={setStepsOpen}
        variant="error"
        title={content.title}
        description={content.description}
        footer={
          <button type="button" className="btn btn-gold" onClick={() => setStepsOpen(false)}>
            {labels.understood}
          </button>
        }
      >
        {content.steps.length > 0 && (
          <ol className="list-decimal space-y-1.5 rounded-[10px] border border-line bg-surface p-3 pl-7 text-sm">
            {content.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        )}
      </FeedbackDialog>
    </>
  );
}

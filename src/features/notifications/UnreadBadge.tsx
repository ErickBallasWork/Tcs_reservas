import { notificationsLabels as labels } from '@/lib/labels';
import { cn } from '@/lib/utils';

const MAX_SHOWN = 99;

interface UnreadBadgeProps {
  count: number;
  className?: string;
}

export function UnreadBadge({ count, className }: UnreadBadgeProps) {
  if (count <= 0) return null;
  return (
    <span
      role="status"
      aria-label={labels.unreadBadge(count)}
      className={cn(
        'inline-flex min-w-5 items-center justify-center rounded-full bg-gold px-1.5 text-[11px] leading-5 font-extrabold text-brand-dark',
        className,
      )}
    >
      {count > MAX_SHOWN ? `${MAX_SHOWN}+` : count}
    </span>
  );
}

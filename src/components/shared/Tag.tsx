import { cn } from '@/lib/utils';

type TagVariant = 'default' | 'gold' | 'dark';

const variants: Record<TagVariant, string> = {
  default: 'bg-soft text-brand',
  gold: 'bg-gold-soft text-gold-ink',
  dark: 'bg-brand text-white',
};

interface TagProps {
  variant?: TagVariant;
  className?: string;
  children: React.ReactNode;
}

export function Tag({ variant = 'default', className, children }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-[3px] text-xs font-bold whitespace-nowrap',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

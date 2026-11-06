import { describe, expect, it } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn', () => {
  it('joins conditional classes', () => {
    const isActive = true;
    const isHidden = false;

    expect(cn('px-2', isActive && 'font-bold', isHidden && 'hidden', undefined)).toBe(
      'px-2 font-bold',
    );
  });

  it('lets the last conflicting tailwind class win', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });
});

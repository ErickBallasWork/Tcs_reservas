import type { KeyboardEvent } from 'react';

export function onActivate(action: () => void) {
  return (event: KeyboardEvent) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    action();
  };
}

export function svgId(reactId: string, suffix: string): string {
  return `${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}-${suffix}`;
}

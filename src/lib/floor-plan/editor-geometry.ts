import type { Rect, Size } from '@/lib/floor-plan/types';

export const GRID_SIZE = 10;
export const MIN_ZONE_SIZE = GRID_SIZE;

export type ResizeHandle = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';

export const RESIZE_HANDLES: readonly ResizeHandle[] = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];

export interface Point {
  x: number;
  y: number;
}

export function snap(value: number, grid: number = GRID_SIZE): number {
  return Math.round(value / grid) * grid;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function clampRect(rect: Rect, bounds: Size): Rect {
  const width = clamp(Math.round(rect.width), MIN_ZONE_SIZE, bounds.width);
  const height = clamp(Math.round(rect.height), MIN_ZONE_SIZE, bounds.height);
  return {
    x: clamp(Math.round(rect.x), 0, bounds.width - width),
    y: clamp(Math.round(rect.y), 0, bounds.height - height),
    width,
    height,
  };
}

export function moveRect(rect: Rect, dx: number, dy: number, bounds: Size): Rect {
  return clampRect({ ...rect, x: snap(rect.x + dx), y: snap(rect.y + dy) }, bounds);
}

export function resizeRect(
  rect: Rect,
  handle: ResizeHandle,
  dx: number,
  dy: number,
  bounds: Size,
): Rect {
  let left = rect.x;
  let top = rect.y;
  let right = rect.x + rect.width;
  let bottom = rect.y + rect.height;
  if (handle.includes('w')) left = clamp(snap(left + dx), 0, right - MIN_ZONE_SIZE);
  if (handle.includes('e')) right = clamp(snap(right + dx), left + MIN_ZONE_SIZE, bounds.width);
  if (handle.includes('n')) top = clamp(snap(top + dy), 0, bottom - MIN_ZONE_SIZE);
  if (handle.includes('s')) bottom = clamp(snap(bottom + dy), top + MIN_ZONE_SIZE, bounds.height);
  return { x: left, y: top, width: right - left, height: bottom - top };
}

export function handlePoint(rect: Rect, handle: ResizeHandle): Point {
  const x = handle.includes('w')
    ? rect.x
    : handle.includes('e')
      ? rect.x + rect.width
      : rect.x + rect.width / 2;
  const y = handle.includes('n')
    ? rect.y
    : handle.includes('s')
      ? rect.y + rect.height
      : rect.y + rect.height / 2;
  return { x, y };
}

export function toPlanDelta(
  clientDx: number,
  clientDy: number,
  renderedWidth: number,
  plan: Size,
): Point {
  const scale = renderedWidth > 0 ? plan.width / renderedWidth : 1;
  return { x: clientDx * scale, y: clientDy * scale };
}

export function newZoneRect(plan: Size, size: Size = { width: 120, height: 80 }): Rect {
  return clampRect(
    {
      x: snap((plan.width - size.width) / 2),
      y: snap((plan.height - size.height) / 2),
      width: size.width,
      height: size.height,
    },
    plan,
  );
}

import type { Rect } from '@/lib/floor-plan/types';

export interface SeatSpot {
  x: number;
  y: number;
  size: number;
}

const HEADER_HEIGHT = 40;
const HEADER_MAX_RATIO = 0.4;
const PADDING = 8;
const MAX_SEAT_SIZE = 28;
const GAP_RATIO = 0.25;

export function seatArea(zone: Rect): Rect {
  const header = Math.min(HEADER_HEIGHT, zone.height * HEADER_MAX_RATIO);
  const padding = Math.min(PADDING, zone.width * 0.1, zone.height * 0.1);
  return {
    x: zone.x + padding,
    y: zone.y + header,
    width: Math.max(0, zone.width - padding * 2),
    height: Math.max(0, zone.height - header - padding),
  };
}

function bestColumns(area: Rect, count: number): { columns: number; cell: number } {
  let best = { columns: 1, cell: 0 };
  for (let columns = 1; columns <= count; columns++) {
    const rows = Math.ceil(count / columns);
    const cell = Math.min(area.width / columns, area.height / rows);
    if (cell > best.cell) best = { columns, cell };
  }
  return best;
}

export function layoutSeats(area: Rect, count: number): SeatSpot[] {
  if (count <= 0 || area.width <= 0 || area.height <= 0) return [];
  const { columns, cell } = bestColumns(area, count);
  const rows = Math.ceil(count / columns);
  const pitch = Math.min(cell, MAX_SEAT_SIZE / (1 - GAP_RATIO));
  const size = pitch * (1 - GAP_RATIO);
  const originX = area.x + (area.width - columns * pitch) / 2;
  const originY = area.y + (area.height - rows * pitch) / 2;
  return Array.from({ length: count }, (_, index) => ({
    x: originX + (index % columns) * pitch + (pitch - size) / 2,
    y: originY + Math.floor(index / columns) * pitch + (pitch - size) / 2,
    size,
  }));
}

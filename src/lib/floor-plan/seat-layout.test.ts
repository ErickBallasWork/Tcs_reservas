import { describe, expect, it } from 'vitest';
import { layoutSeats, seatArea, type SeatSpot } from '@/lib/floor-plan/seat-layout';
import type { Rect } from '@/lib/floor-plan/types';

const inside = (spot: SeatSpot, area: Rect) =>
  spot.x >= area.x - 1e-9 &&
  spot.y >= area.y - 1e-9 &&
  spot.x + spot.size <= area.x + area.width + 1e-9 &&
  spot.y + spot.size <= area.y + area.height + 1e-9;

const overlaps = (a: SeatSpot, b: SeatSpot) =>
  a.x < b.x + b.size && b.x < a.x + a.size && a.y < b.y + b.size && b.y < a.y + a.size;

describe('seatArea', () => {
  it('leaves room on top for the zone name and padding around', () => {
    expect(seatArea({ x: 100, y: 50, width: 200, height: 200 })).toEqual({
      x: 108,
      y: 90,
      width: 184,
      height: 152,
    });
  });

  it('never returns a negative size for a tiny zone', () => {
    const area = seatArea({ x: 0, y: 0, width: 4, height: 4 });

    expect(area.width).toBeGreaterThanOrEqual(0);
    expect(area.height).toBeGreaterThanOrEqual(0);
  });
});

describe('layoutSeats', () => {
  const area: Rect = { x: 10, y: 20, width: 180, height: 120 };

  it('returns no seats for an empty lab or an empty area', () => {
    expect(layoutSeats(area, 0)).toEqual([]);
    expect(layoutSeats({ ...area, width: 0 }, 3)).toEqual([]);
  });

  it.each([1, 3, 8, 13, 40])('places %i seats inside the area without overlaps', (count) => {
    const spots = layoutSeats(area, count);

    expect(spots).toHaveLength(count);
    for (const spot of spots) expect(inside(spot, area)).toBe(true);
    for (let i = 0; i < spots.length; i++)
      for (let j = i + 1; j < spots.length; j++) expect(overlaps(spots[i], spots[j])).toBe(false);
  });

  it('uses a single row in a wide and short area', () => {
    const spots = layoutSeats({ x: 0, y: 0, width: 400, height: 40 }, 4);

    expect(new Set(spots.map((spot) => spot.y)).size).toBe(1);
  });

  it('builds a balanced grid in a square area', () => {
    const spots = layoutSeats({ x: 0, y: 0, width: 300, height: 300 }, 9);

    expect(new Set(spots.map((spot) => spot.x)).size).toBe(3);
    expect(new Set(spots.map((spot) => spot.y)).size).toBe(3);
  });

  it('caps the seat size so a few seats do not fill a huge zone', () => {
    const spots = layoutSeats({ x: 0, y: 0, width: 1000, height: 1000 }, 2);

    expect(spots[0].size).toBeLessThanOrEqual(28);
  });

  it('keeps the seats in reading order', () => {
    const spots = layoutSeats({ x: 0, y: 0, width: 200, height: 200 }, 4);

    expect(spots[0].x).toBeLessThan(spots[1].x);
    expect(spots[0].y).toBeLessThan(spots[2].y);
  });
});

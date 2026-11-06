import { describe, expect, it } from 'vitest';
import {
  clampRect,
  handlePoint,
  moveRect,
  newZoneRect,
  resizeRect,
  snap,
  toPlanDelta,
} from '@/lib/floor-plan/editor-geometry';

const plan = { width: 600, height: 400 };
const rect = { x: 100, y: 100, width: 120, height: 80 };

describe('snap', () => {
  it('rounds to the 10 unit grid', () => {
    expect(snap(14)).toBe(10);
    expect(snap(15)).toBe(20);
    expect(snap(-6)).toBe(-10);
  });
});

describe('clampRect', () => {
  it('keeps the zone inside the plan', () => {
    expect(clampRect({ x: 550, y: -20, width: 120, height: 80 }, plan)).toEqual({
      x: 480,
      y: 0,
      width: 120,
      height: 80,
    });
  });

  it('enforces the minimum size and the plan size', () => {
    expect(clampRect({ x: 0, y: 0, width: 2, height: 900 }, plan)).toEqual({
      x: 0,
      y: 0,
      width: 10,
      height: 400,
    });
  });

  it('rounds to integer coordinates', () => {
    expect(clampRect({ x: 10.4, y: 20.6, width: 50.5, height: 40.2 }, plan)).toEqual({
      x: 10,
      y: 21,
      width: 51,
      height: 40,
    });
  });
});

describe('moveRect', () => {
  it('moves by the delta snapped to the grid', () => {
    expect(moveRect(rect, 23, -16, plan)).toMatchObject({ x: 120, y: 80, width: 120 });
  });

  it('stops at the plan edges', () => {
    expect(moveRect(rect, 1000, 1000, plan)).toMatchObject({ x: 480, y: 320 });
    expect(moveRect(rect, -1000, -1000, plan)).toMatchObject({ x: 0, y: 0 });
  });
});

describe('resizeRect', () => {
  it('grows from the bottom right corner', () => {
    expect(resizeRect(rect, 'se', 38, 21, plan)).toEqual({
      x: 100,
      y: 100,
      width: 160,
      height: 100,
    });
  });

  it('moves the left and top edges keeping the opposite ones', () => {
    expect(resizeRect(rect, 'nw', -20, 30, plan)).toEqual({
      x: 80,
      y: 130,
      width: 140,
      height: 50,
    });
  });

  it('changes a single axis from a side handle', () => {
    expect(resizeRect(rect, 'e', 50, 999, plan)).toEqual({ ...rect, width: 170 });
    expect(resizeRect(rect, 'n', 999, -50, plan)).toEqual({ ...rect, y: 50, height: 130 });
  });

  it('never collapses below the minimum size', () => {
    expect(resizeRect(rect, 'w', 500, 0, plan)).toMatchObject({ x: 210, width: 10 });
    expect(resizeRect(rect, 's', 0, -500, plan)).toMatchObject({ height: 10 });
  });

  it('never grows past the plan', () => {
    expect(resizeRect(rect, 'se', 5000, 5000, plan)).toEqual({
      x: 100,
      y: 100,
      width: 500,
      height: 300,
    });
    expect(resizeRect(rect, 'nw', -5000, -5000, plan)).toEqual({
      x: 0,
      y: 0,
      width: 220,
      height: 180,
    });
  });
});

describe('handlePoint', () => {
  it('places corner and side handles on the zone border', () => {
    expect(handlePoint(rect, 'nw')).toEqual({ x: 100, y: 100 });
    expect(handlePoint(rect, 'se')).toEqual({ x: 220, y: 180 });
    expect(handlePoint(rect, 'e')).toEqual({ x: 220, y: 140 });
    expect(handlePoint(rect, 'n')).toEqual({ x: 160, y: 100 });
  });
});

describe('toPlanDelta', () => {
  it('converts screen pixels to plan units with the rendered scale', () => {
    expect(toPlanDelta(30, 15, 300, plan)).toEqual({ x: 60, y: 30 });
  });

  it('falls back to a 1:1 scale before the canvas is measured', () => {
    expect(toPlanDelta(30, 15, 0, plan)).toEqual({ x: 30, y: 15 });
  });
});

describe('newZoneRect', () => {
  it('starts a new zone centered and on the grid', () => {
    expect(newZoneRect(plan)).toEqual({ x: 240, y: 160, width: 120, height: 80 });
  });

  it('fits a new zone in a small plan', () => {
    expect(newZoneRect({ width: 100, height: 50 })).toEqual({ x: 0, y: 0, width: 100, height: 50 });
  });
});

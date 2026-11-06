'use client';

import { useId, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { PlanBackdrop } from '@/features/floor-plans/PlanBackdrop';
import { svgId } from '@/features/floor-plans/svg-keys';
import {
  GRID_SIZE,
  handlePoint,
  moveRect,
  RESIZE_HANDLES,
  resizeRect,
  toPlanDelta,
  type ResizeHandle,
} from '@/lib/floor-plan/editor-geometry';
import type { Rect, Size } from '@/lib/floor-plan/types';
import type { EditorZone, ZoneErrors } from '@/lib/floor-plan/zone-schema';
import { floorPlanAdminLabels as labels, floorZoneKindLabels } from '@/lib/labels';
import { cn } from '@/lib/utils';

type Gesture =
  | { mode: 'move'; key: string; startX: number; startY: number; rect: Rect }
  | {
      mode: 'resize';
      key: string;
      handle: ResizeHandle;
      startX: number;
      startY: number;
      rect: Rect;
    };

interface EditorCanvasProps {
  size: Size;
  zones: readonly EditorZone[];
  selectedKey: string | null;
  errors: ZoneErrors;
  onSelect: (key: string | null) => void;
  onChange: (key: string, rect: Rect) => void;
}

const ZONE_STYLE: Record<EditorZone['kind'], string> = {
  ROOM: 'fill-plan-free-soft stroke-plan-free',
  LAB: 'fill-plan-free-soft stroke-plan-free',
  DECORATIVE: 'fill-plan-muted stroke-plan-grid',
  LABEL: 'fill-transparent stroke-plan-muted-ink',
};

const HANDLE_SIZE = 12;

const HANDLE_CURSOR: Record<ResizeHandle, string> = {
  n: 'cursor-ns-resize',
  s: 'cursor-ns-resize',
  e: 'cursor-ew-resize',
  w: 'cursor-ew-resize',
  ne: 'cursor-nesw-resize',
  sw: 'cursor-nesw-resize',
  nw: 'cursor-nwse-resize',
  se: 'cursor-nwse-resize',
};

const ARROW_DELTAS: Record<string, [number, number]> = {
  ArrowUp: [0, -GRID_SIZE],
  ArrowDown: [0, GRID_SIZE],
  ArrowLeft: [-GRID_SIZE, 0],
  ArrowRight: [GRID_SIZE, 0],
};

function rectOf(zone: EditorZone): Rect {
  return { x: zone.x, y: zone.y, width: zone.width, height: zone.height };
}

export function EditorCanvas({
  size,
  zones,
  selectedKey,
  errors,
  onSelect,
  onChange,
}: EditorCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [gesture, setGesture] = useState<Gesture | null>(null);
  const reactId = useId();

  const start = (event: PointerEvent, next: Gesture) => {
    event.stopPropagation();
    svgRef.current?.setPointerCapture(event.pointerId);
    onSelect(next.key);
    setGesture(next);
  };

  const handleMove = (event: PointerEvent) => {
    if (!gesture) return;
    const width = svgRef.current?.getBoundingClientRect().width ?? 0;
    const delta = toPlanDelta(
      event.clientX - gesture.startX,
      event.clientY - gesture.startY,
      width,
      size,
    );
    const rect =
      gesture.mode === 'move'
        ? moveRect(gesture.rect, delta.x, delta.y, size)
        : resizeRect(gesture.rect, gesture.handle, delta.x, delta.y, size);
    onChange(gesture.key, rect);
  };

  const handleKey = (zone: EditorZone) => (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(zone.key);
      return;
    }
    const delta = ARROW_DELTAS[event.key];
    if (!delta) return;
    event.preventDefault();
    const rect = event.shiftKey
      ? resizeRect(rectOf(zone), 'se', delta[0], delta[1], size)
      : moveRect(rectOf(zone), delta[0], delta[1], size);
    onSelect(zone.key);
    onChange(zone.key, rect);
  };

  const selected = zones.find((zone) => zone.key === selectedKey);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${size.width} ${size.height}`}
      role="group"
      aria-label={labels.canvasLabel}
      className="block h-auto w-full touch-none rounded-xl border border-line select-none"
      onPointerDown={() => onSelect(null)}
      onPointerMove={handleMove}
      onPointerUp={() => setGesture(null)}
      onPointerCancel={() => setGesture(null)}
    >
      <PlanBackdrop
        size={size}
        hatchId={svgId(reactId, 'hatch')}
        gridId={svgId(reactId, 'grid')}
        gridStep={GRID_SIZE * 2}
      />
      {zones.map((zone) => {
        const invalid = errors[zone.key] !== undefined;
        return (
          <g
            key={zone.key}
            role="button"
            tabIndex={0}
            aria-label={`${zone.name}, ${floorZoneKindLabels[zone.kind]}`}
            aria-pressed={zone.key === selectedKey}
            onKeyDown={handleKey(zone)}
            onPointerDown={(event) =>
              start(event, {
                mode: 'move',
                key: zone.key,
                startX: event.clientX,
                startY: event.clientY,
                rect: rectOf(zone),
              })
            }
            className="group cursor-move outline-none"
          >
            <rect
              x={zone.x}
              y={zone.y}
              width={zone.width}
              height={zone.height}
              rx={zone.kind === 'LABEL' ? 4 : 10}
              strokeWidth={zone.key === selectedKey ? 3 : 1.5}
              strokeDasharray={zone.kind === 'LABEL' || invalid ? '6 4' : undefined}
              className={cn(ZONE_STYLE[zone.kind], invalid && 'stroke-destructive')}
            />
            <rect
              x={zone.x - 4}
              y={zone.y - 4}
              width={zone.width + 8}
              height={zone.height + 8}
              rx={12}
              strokeWidth={2}
              className="fill-none stroke-plan-selected opacity-0 group-focus-visible:opacity-100"
            />
            <svg x={zone.x} y={zone.y} width={zone.width} height={zone.height}>
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="pointer-events-none fill-plan-zone-ink text-[13px] font-bold"
              >
                {zone.name}
              </text>
            </svg>
          </g>
        );
      })}
      {selected &&
        RESIZE_HANDLES.map((handle) => {
          const point = handlePoint(rectOf(selected), handle);
          return (
            <rect
              key={handle}
              aria-hidden
              x={point.x - HANDLE_SIZE / 2}
              y={point.y - HANDLE_SIZE / 2}
              width={HANDLE_SIZE}
              height={HANDLE_SIZE}
              rx={3}
              strokeWidth={2}
              className={cn(HANDLE_CURSOR[handle], 'fill-plan-zone stroke-plan-free')}
              onPointerDown={(event) =>
                start(event, {
                  mode: 'resize',
                  key: selected.key,
                  handle,
                  startX: event.clientX,
                  startY: event.clientY,
                  rect: rectOf(selected),
                })
              }
            />
          );
        })}
    </svg>
  );
}

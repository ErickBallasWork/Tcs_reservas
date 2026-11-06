'use client';

import { Minus, Plus, Scan } from 'lucide-react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { floorPlanLabels as labels } from '@/lib/labels';

interface FloorPlanViewportProps {
  children: React.ReactNode;
}

const CONTROL =
  'grid size-11 place-items-center rounded-lg border border-line bg-white text-brand shadow-sm hover:bg-soft focus-visible:outline-2 focus-visible:outline-brand';

export function FloorPlanViewport({ children }: FloorPlanViewportProps) {
  return (
    <TransformWrapper
      minScale={0.6}
      maxScale={4}
      centerOnInit
      doubleClick={{ disabled: true }}
      wheel={{ step: 0.15 }}
    >
      {({ zoomIn, zoomOut, resetTransform }) => (
        <div className="relative overflow-hidden rounded-xl border border-line bg-plan-canvas">
          <TransformComponent wrapperStyle={{ width: '100%' }} contentStyle={{ width: '100%' }}>
            {children}
          </TransformComponent>
          <div className="absolute right-2 bottom-2 flex flex-col gap-1.5">
            <button
              type="button"
              className={CONTROL}
              aria-label={labels.zoomIn}
              onClick={() => zoomIn()}
            >
              <Plus className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              className={CONTROL}
              aria-label={labels.zoomOut}
              onClick={() => zoomOut()}
            >
              <Minus className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              className={CONTROL}
              aria-label={labels.center}
              onClick={() => resetTransform()}
            >
              <Scan className="size-5" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </TransformWrapper>
  );
}

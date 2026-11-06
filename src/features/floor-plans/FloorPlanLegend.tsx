'use client';

import { useId } from 'react';
import { STATE_ICONS, STATE_SHAPE_TONE } from '@/features/floor-plans/state-styles';
import { svgId } from '@/features/floor-plans/svg-keys';
import { HatchPattern } from '@/features/floor-plans/HatchPattern';
import { FLOOR_STATES, presentState } from '@/lib/floor-plan/zone-presentation';
import { floorPlanLabels as labels } from '@/lib/labels';

export function FloorPlanLegend() {
  const reactId = useId();
  const hatchId = svgId(reactId, 'legend-hatch');

  return (
    <ul aria-label={labels.legend} className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-ink">
      {FLOOR_STATES.map((state) => {
        const presentation = presentState(state);
        const Icon = STATE_ICONS[presentation.icon];
        return (
          <li key={state} className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="size-6 shrink-0" aria-hidden>
              {state === 'OCCUPIED' && (
                <defs>
                  <HatchPattern id={hatchId} />
                </defs>
              )}
              <rect
                x={2}
                y={2}
                width={20}
                height={20}
                rx={5}
                strokeWidth={2}
                strokeDasharray={presentation.border === 'dashed' ? '4 3' : undefined}
                fill={presentation.pattern === 'hatch' ? `url(#${hatchId})` : undefined}
                opacity={presentation.dimmed ? 0.6 : 1}
                className={STATE_SHAPE_TONE[state]}
              />
            </svg>
            {Icon && <Icon className="size-4 text-ink-soft" aria-hidden />}
            {presentation.label}
          </li>
        );
      })}
    </ul>
  );
}

import { HatchPattern } from '@/features/floor-plans/HatchPattern';
import type { Size } from '@/lib/floor-plan/types';

interface PlanBackdropProps {
  size: Size;
  hatchId: string;
  gridId: string;
  gridStep?: number;
}

export function PlanBackdrop({ size, hatchId, gridId, gridStep = 20 }: PlanBackdropProps) {
  return (
    <>
      <defs>
        <HatchPattern id={hatchId} />
        <pattern id={gridId} width={gridStep} height={gridStep} patternUnits="userSpaceOnUse">
          <circle cx={1} cy={1} r={1} className="fill-plan-grid" />
        </pattern>
      </defs>
      <rect width={size.width} height={size.height} rx={16} className="fill-plan-canvas" />
      <rect width={size.width} height={size.height} rx={16} fill={`url(#${gridId})`} />
    </>
  );
}

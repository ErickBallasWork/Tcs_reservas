export function HatchPattern({ id }: { id: string }) {
  return (
    <pattern
      id={id}
      width={8}
      height={8}
      patternUnits="userSpaceOnUse"
      patternTransform="rotate(45)"
    >
      <rect width={8} height={8} className="fill-plan-occupied-soft" />
      <line x1={0} y1={0} x2={0} y2={8} strokeWidth={3} className="stroke-plan-occupied/40" />
    </pattern>
  );
}

import type { DashboardMetrics as Metrics } from '@/api/types';
import { dashboardLabels as labels, purposeLabels, reservationStatusLabels } from '@/lib/labels';

interface DashboardMetricsProps {
  metrics: Metrics;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="panel flex flex-col gap-1">
      <small className="text-ink-soft">{label}</small>
      <b className="text-2xl text-brand">{value}</b>
    </div>
  );
}

function percent(rate: number): string {
  return `${Math.round(rate * 100)} %`;
}

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
      <Stat label={labels.metrics.total} value={metrics.total} />
      <Stat label={labels.metrics.noShowRate} value={percent(metrics.noShowRate)} />
      {Object.entries(reservationStatusLabels).map(([status, label]) => (
        <Stat key={status} label={label} value={metrics.byStatus[status] ?? 0} />
      ))}
      {Object.entries(purposeLabels).map(([purpose, label]) => (
        <Stat key={purpose} label={label} value={metrics.byPurpose[purpose] ?? 0} />
      ))}
    </section>
  );
}

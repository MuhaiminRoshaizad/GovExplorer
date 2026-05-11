import { formatDate } from '@/lib/format';
import type { CategoricalPoint, TimePoint } from '@/lib/queries';

const num = (v: number, digits = 2) =>
  Math.abs(v) >= 1000 ? Math.round(v).toLocaleString() : v.toFixed(digits);

export function timeSeriesAnalysis(
  points: TimePoint[],
  opts: { unit?: string; fmt?: (v: number) => string; periodLabel?: string } = {}
): string[] {
  if (points.length === 0) return [];
  const fmt = opts.fmt ?? ((v) => num(v));
  const unit = opts.unit ? ` ${opts.unit}` : '';
  const period = opts.periodLabel ?? 'period';

  const latest = points[points.length - 1];
  const prev = points[points.length - 2];
  const first = points[0];
  const max = points.reduce((a, b) => (b.value > a.value ? b : a));
  const min = points.reduce((a, b) => (b.value < a.value ? b : a));

  const lines: string[] = [];
  lines.push(`Latest reading: ${fmt(latest.value)}${unit} on ${formatDate(latest.date)}.`);

  if (prev && prev.value !== 0) {
    const delta = ((latest.value - prev.value) / Math.abs(prev.value)) * 100;
    const arrow = delta > 0.05 ? '↑' : delta < -0.05 ? '↓' : '→';
    lines.push(
      `${arrow} ${Math.abs(delta).toFixed(2)}% vs previous ${period} (${fmt(prev.value)}${unit}).`
    );
  }

  if (first !== latest && first.value !== 0) {
    const totalDelta = ((latest.value - first.value) / Math.abs(first.value)) * 100;
    lines.push(
      `${totalDelta >= 0 ? '↑' : '↓'} ${Math.abs(totalDelta).toFixed(1)}% over the shown range (since ${formatDate(first.date)}).`
    );
  }

  if (max.value !== min.value) {
    lines.push(
      `High ${fmt(max.value)}${unit} (${formatDate(max.date)}) · low ${fmt(min.value)}${unit} (${formatDate(min.date)}).`
    );
  }

  return lines;
}

export function categoricalAnalysis(
  points: CategoricalPoint[],
  opts: { unit?: string; fmt?: (v: number) => string; userStateName?: string } = {}
): string[] {
  if (points.length === 0) return [];
  const fmt = opts.fmt ?? ((v) => num(v, 0));
  const unit = opts.unit ? ` ${opts.unit}` : '';

  const total = points.reduce((acc, p) => acc + p.value, 0);
  const top = points[0];

  const lines: string[] = [];
  lines.push(`${top.name} leads with ${fmt(top.value)}${unit}.`);

  if (total > 0 && top.value !== total) {
    const pct = (top.value / total) * 100;
    lines.push(`Top entry holds ${pct.toFixed(1)}% of the total (${fmt(total)}${unit}).`);
  }

  if (points.length >= 3) {
    const top3 = points.slice(0, 3);
    const top3Sum = top3.reduce((acc, p) => acc + p.value, 0);
    const pct3 = (top3Sum / total) * 100;
    lines.push(`Top 3 (${top3.map((p) => p.name).join(', ')}) hold ${pct3.toFixed(1)}%.`);
  }

  if (opts.userStateName) {
    const myEntry = points.find((p) => p.name === opts.userStateName);
    if (myEntry) {
      const rank = points.findIndex((p) => p.name === opts.userStateName) + 1;
      const myPct = (myEntry.value / total) * 100;
      lines.push(
        `Your state — ${opts.userStateName}: ${fmt(myEntry.value)}${unit} (rank ${rank}/${points.length}, ${myPct.toFixed(1)}%).`
      );
    }
  }

  if (points.length > 3) {
    const bottom = points[points.length - 1];
    lines.push(`${points.length} entries shown · bottom: ${bottom.name} (${fmt(bottom.value)}${unit}).`);
  }

  return lines;
}

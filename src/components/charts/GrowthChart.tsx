import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { MixPct, Tray } from '../../types';
import { mixLabel } from '../../lib/format';
import { EmptyState } from '../EmptyState';

const COLORS: Record<MixPct, string> = { 0: '#8B6447', 25: '#2F5D43', 50: '#3B7EA1', 75: '#C8553D' };

export function GrowthChart({ trays }: { trays: Tray[] }) {
  const maxWeek = Math.max(0, ...trays.flatMap((t) => t.weekly.map((w) => w.week)));
  if (maxWeek === 0) return <EmptyState title="No weekly photos yet" body="Heights appear after the first weekly photo." />;

  const rows = Array.from({ length: maxWeek + 1 }, (_, week) => {
    const row: Record<string, number> = { week };
    for (const t of trays) {
      const rec = t.weekly.find((w) => w.week === week);
      if (rec) row[`m${t.mixPct}`] = rec.heightCm;
    }
    return row;
  });

  return (
    <div className="h-64 w-full" role="img" aria-label="Line chart of mean seedling height per week for each compost mix">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid vertical={false} stroke="#E6D5C3" />
          <XAxis dataKey="week" tickFormatter={(w: number) => `Wk ${w}`} tick={{ fontSize: 12, fill: '#5A3E2B' }} tickLine={false} />
          <YAxis unit=" cm" tick={{ fontSize: 12, fill: '#5A3E2B' }} tickLine={false} axisLine={false} width={64} />
          <Tooltip labelFormatter={(w: number) => `Week ${w}`} formatter={(v: number) => `${v.toFixed(1)} cm`} />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          {trays.map((t) => (
            <Line
              key={t.id}
              type="monotone"
              dataKey={`m${t.mixPct}`}
              name={mixLabel(t.mixPct)}
              stroke={COLORS[t.mixPct]}
              strokeWidth={2.5}
              dot={{ r: 3 }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

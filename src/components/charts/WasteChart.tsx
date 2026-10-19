import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatKg, formatShortDate } from '../../lib/format';

export function WasteChart({ weeks }: { weeks: { weekStart: string; kg: number }[] }) {
  return (
    <div className="h-56 w-full" role="img" aria-label="Bar chart of kilograms of garden waste collected each week">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={weeks} margin={{ top: 8, right: 4, bottom: 0, left: -12 }}>
          <CartesianGrid vertical={false} stroke="#E6D5C3" />
          <XAxis dataKey="weekStart" tickFormatter={formatShortDate} tick={{ fontSize: 12, fill: '#5A3E2B' }} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#5A3E2B' }} tickLine={false} axisLine={false} />
          <Tooltip
            formatter={(v: number) => [formatKg(v), 'Collected']}
            labelFormatter={(l: string) => `Week of ${formatShortDate(l)}`}
          />
          <Bar dataKey="kg" fill="#4C8A5E" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

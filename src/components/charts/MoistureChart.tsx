import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { MoistureReading } from '../../types';
import { formatDateTime, formatShortDate } from '../../lib/format';
import { EmptyState } from '../EmptyState';

const toIso = (ms: number) => new Date(ms).toISOString();

export function MoistureChart({ readings }: { readings: MoistureReading[] }) {
  if (readings.length < 2) return <EmptyState title="No readings yet" body="The soil sensor sends a reading every 6 hours." />;
  const points = readings.map((r) => ({ x: Date.parse(r.t), vwc: r.vwc }));

  return (
    <div className="h-48 w-full" role="img" aria-label="Line chart of tray soil moisture, as volumetric water content in percent">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid vertical={false} stroke="#E6D5C3" />
          <XAxis
            dataKey="x"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(x: number) => formatShortDate(toIso(x))}
            tick={{ fontSize: 12, fill: '#5A3E2B' }}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis domain={[0, 60]} unit="%" tick={{ fontSize: 12, fill: '#5A3E2B' }} tickLine={false} axisLine={false} />
          <Tooltip labelFormatter={(x: number) => formatDateTime(toIso(x))} formatter={(v: number) => [`${v.toFixed(1)}%`, 'VWC']} />
          <Line type="monotone" dataKey="vwc" stroke="#3B7EA1" strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

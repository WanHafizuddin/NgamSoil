import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TempReading } from '../../types';
import { formatDateTime, formatShortDate } from '../../lib/format';
import { EmptyState } from '../EmptyState';

const toIso = (ms: number) => new Date(ms).toISOString();

export function TempChart({ readings }: { readings: TempReading[] }) {
  if (readings.length < 2) return <EmptyState title="No readings yet" body="The probe sends a reading every 30 minutes." />;
  const points = readings.map((r) => ({ x: Date.parse(r.t), celsius: r.celsius }));

  return (
    <div className="h-64 w-full" role="img" aria-label="Line chart of compost pile temperature over time, with 40°C and 70°C limits">
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
          <YAxis domain={[20, 75]} tick={{ fontSize: 12, fill: '#5A3E2B' }} tickLine={false} axisLine={false} unit="°" />
          <Tooltip labelFormatter={(x: number) => formatDateTime(toIso(x))} formatter={(v: number) => [`${v.toFixed(1)}°C`, 'Pile core']} />
          <ReferenceLine y={70} stroke="#8E3524" strokeDasharray="4 4" label={{ value: '70°C maximum', position: 'insideTopRight', fontSize: 11, fill: '#8E3524' }} />
          <ReferenceLine y={40} stroke="#285A75" strokeDasharray="4 4" label={{ value: '40°C active minimum', position: 'insideBottomRight', fontSize: 11, fill: '#285A75' }} />
          <Line type="monotone" dataKey="celsius" stroke="#C8553D" strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

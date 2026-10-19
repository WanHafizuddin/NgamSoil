import { useState } from 'react';
import type { SpeciesId, Tray } from '../../types';
import { useData } from '../../state/DataContext';
import { simulateSeedlingAnalysis } from '../../sim/ai';
import { hashString } from '../../lib/random';
import { formatDate } from '../../lib/format';
import { Panel } from '../../components/Panel';
import { PhotoAnalyser } from '../../components/PhotoAnalyser';
import { MoistureChart } from '../../components/charts/MoistureChart';
import { TrayLogForm } from './TrayLogForm';

const LOG_LABEL = { death: 'Death', pest: 'Pest', watering: 'Watering' } as const;

export function TrayPanel({ trialId, species, tray }: { trialId: string; species: SpeciesId; tray: Tray }) {
  const { dispatch } = useData();
  const [status, setStatus] = useState('');
  const last = tray.weekly[tray.weekly.length - 1];

  const addWeek = () => {
    const week = last.week + 1;
    const reading = simulateSeedlingAnalysis({
      species,
      mixPct: tray.mixPct,
      prevHeightCm: last.heightCm,
      seed: hashString(`${tray.id}-w${week}`),
    });
    dispatch({ type: 'addWeeklyRecord', trialId, trayId: tray.id, record: { week, ...reading, alive: last.alive } });
    setStatus(`Week ${week} added: ${reading.heightCm.toFixed(1)} cm, leaf health ${reading.leafHealth}`);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Soil moisture" sample caption="Capacitive sensor in the tray, volumetric water content.">
        <MoistureChart readings={tray.moisture} />
      </Panel>

      <Panel title="Weekly records" sample>
        <div className="overflow-x-auto">
          <table aria-label="Weekly records" className="w-full text-right text-sm tabular-nums">
            <thead className="text-soil-700">
              <tr>
                <th scope="col" className="py-1 text-left font-bold">Week</th>
                <th scope="col" className="py-1 font-bold">Height (cm)</th>
                <th scope="col" className="py-1 font-bold">Leaf health</th>
                <th scope="col" className="py-1 font-bold">Alive</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soil-100">
              {tray.weekly.map((w) => (
                <tr key={w.week}>
                  <td className="py-1.5 text-left">{w.week}</td>
                  <td className="py-1.5">{w.heightCm.toFixed(1)}</td>
                  <td className="py-1.5">{w.leafHealth}</td>
                  <td className="py-1.5">{w.alive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Weekly photo" sample caption="The photo analysis estimates mean height and a leaf health score from 0 to 100.">
        <PhotoAnalyser inputLabel="Weekly seedling photo" onAnalysed={addWeek} />
        <p role="status" aria-live="polite" className="mt-3 min-h-6 font-bold text-leaf-700">
          {status}
        </p>
      </Panel>

      <Panel title="Tray log">
        <TrayLogForm trialId={trialId} trayId={tray.id} />
        {tray.logs.length > 0 && (
          <ul aria-label="Tray log entries" className="mt-4 divide-y divide-soil-100 text-sm">
            {[...tray.logs].reverse().map((log, i) => (
              <li key={i} className="flex justify-between gap-3 py-2">
                <span>
                  <span className="font-bold">{LOG_LABEL[log.kind]}</span>
                  {log.count ? ` (${log.count})` : ''}: {log.note}
                </span>
                <span className="shrink-0 text-soil-700">{formatDate(log.date)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

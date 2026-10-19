import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Info } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Panel } from '../components/Panel';
import { PhotoAnalyser } from '../components/PhotoAnalyser';
import { btnPrimary, textLink } from '../components/ui';
import { GiEditor, type GiResult } from '../features/maturity/GiEditor';
import { useData } from '../state/DataContext';
import { simulateGerminationAnalysis } from '../sim/ai';
import { hashString } from '../lib/random';
import { isPass } from '../lib/gi';
import { nowIso } from '../lib/dates';
import { formatDate, formatGI } from '../lib/format';
import type { GerminationInput } from '../types';

function MaturityNote() {
  return (
    <p className="mb-4 flex gap-2 rounded-xl border border-water-500/30 bg-water-100 p-3 text-sm text-water-700">
      <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
      <span>This test shows compost maturity, not that it is free of pathogens.</span>
    </p>
  );
}

export function MaturityTestPage() {
  const { id } = useParams();
  const { data, dispatch } = useData();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<GerminationInput | null>(null);
  const [result, setResult] = useState<GiResult>(null);
  const batch = data.batches.find((b) => b.id === id);

  if (!batch) {
    return <PageHeader title="Batch not found" intro={<Link to="/batches" className={textLink}>See all batches</Link>} />;
  }

  const header = (
    <PageHeader
      title="Maturity test"
      intro={
        <>
          Germination test for{' '}
          <Link to={`/batches/${batch.id}`} className={textLink}>
            {batch.id}
          </Link>
          . Cress seeds grown on compost extract are compared with seeds grown on water.
        </>
      }
    />
  );

  if (batch.status === 'composting') {
    return (
      <>
        {header}
        <MaturityNote />
        <Panel title="Not ready yet">
          <p className="text-soil-700">Mark this batch ready for test first.</p>
          <Link to={`/batches/${batch.id}`} className={`${textLink} mt-2 inline-block`}>
            Open {batch.id}
          </Link>
        </Panel>
      </>
    );
  }

  if (batch.status !== 'ready_for_test') {
    const saved = batch.testResult;
    return (
      <>
        {header}
        <MaturityNote />
        <Panel title="Saved result" sample>
          {saved ? (
            <p className="text-soil-900">
              <span className="font-display text-3xl font-semibold text-leaf-900">GI {formatGI(saved.gi)}</span>{' '}
              <span className="font-bold">{saved.passed ? 'Pass' : 'Fail'}</span>, tested {formatDate(saved.date)}
            </p>
          ) : (
            <p className="text-soil-700">This batch has no saved test.</p>
          )}
        </Panel>
      </>
    );
  }

  const save = () => {
    if (!result) return;
    dispatch({
      type: 'saveTestResult',
      batchId: batch.id,
      result: { ...result.input, date: nowIso(), gi: result.gi, passed: isPass(result.gi) },
    });
    navigate(`/batches/${batch.id}`);
  };

  return (
    <>
      {header}
      <MaturityNote />
      {analysis === null ? (
        <Panel title="Germination photo" caption="Photograph both dishes after 5 days, side by side.">
          <PhotoAnalyser inputLabel="Germination test photo" onAnalysed={() => setAnalysis(simulateGerminationAnalysis(hashString(batch.id)))} />
        </Panel>
      ) : (
        <Panel title="Results" sample caption="Simulated photo analysis. Check the root lengths before saving.">
          <GiEditor initial={analysis} onChange={setResult} />
          <div className="mt-6 flex justify-end">
            <button type="button" className={btnPrimary} disabled={!result} onClick={save}>
              Save result
            </button>
          </div>
        </Panel>
      )}
    </>
  );
}

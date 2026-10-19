import { useEffect, useId, useRef, useState } from 'react';
import { Camera, LoaderCircle } from 'lucide-react';
import { btnPrimary, fieldLabel } from './ui';

export const ANALYSIS_DELAY_MS = 2000;

export function PhotoAnalyser({ inputLabel, onAnalysed }: { inputLabel: string; onAnalysed: () => void }) {
  const inputId = useId();
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [inputKey, setInputKey] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const analyse = () => {
    setBusy(true);
    timer.current = setTimeout(() => {
      setBusy(false);
      setPreview(null);
      setInputKey((k) => k + 1);
      onAnalysed();
    }, ANALYSIS_DELAY_MS);
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label htmlFor={inputId} className={fieldLabel}>
          {inputLabel}
        </label>
        <input
          key={inputKey}
          id={inputId}
          type="file"
          accept="image/*"
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            setPreview(file ? URL.createObjectURL(file) : null);
          }}
          className="mt-1 block w-full text-sm text-soil-700 file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-full file:border-0 file:bg-leaf-100 file:px-4 file:font-bold file:text-leaf-900"
        />
      </div>

      {preview ? (
        <img src={preview} alt="Uploaded photo preview" className="max-h-64 w-full rounded-xl object-cover" />
      ) : (
        <div className="flex h-32 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-soil-200 text-sm text-soil-700">
          <Camera aria-hidden className="h-5 w-5" />
          Any photo works in this demo
        </div>
      )}

      <button type="button" className={btnPrimary} disabled={!preview || busy} aria-busy={busy} onClick={analyse}>
        {busy && <LoaderCircle aria-hidden className="h-5 w-5 animate-spin motion-reduce:animate-none" />}
        {busy ? 'Analysing…' : 'Analyse'}
      </button>
    </div>
  );
}

import type { GerminationInput } from '../types';
import { round1 } from './random';

export const GI_PASS_THRESHOLD = 80;

const isValid = (n: number) => Number.isFinite(n) && n >= 0;
const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;

export function computeGI(input: GerminationInput): number | null {
  const { seedsSample, seedsControl, rootLengthsSample, rootLengthsControl } = input;
  const values = [seedsSample, seedsControl, ...rootLengthsSample, ...rootLengthsControl];
  if (!values.every(isValid)) return null;
  if (seedsControl <= 0 || rootLengthsControl.length === 0) return null;

  const meanControl = mean(rootLengthsControl);
  if (meanControl <= 0) return null;
  if (seedsSample === 0 || rootLengthsSample.length === 0) return 0;

  return round1((seedsSample / seedsControl) * (mean(rootLengthsSample) / meanControl) * 100);
}

export function isPass(gi: number | null): boolean {
  return gi !== null && gi > GI_PASS_THRESHOLD;
}

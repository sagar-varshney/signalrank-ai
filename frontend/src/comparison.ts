import type { Report } from './types';

export function incompatibilities(a: Report, b: Report): string[] {
  const reasons: string[] = [];
  for (const [key, label] of [['mode', 'Data mode'], ['dataset_sha256', 'Dataset fingerprint'], ['target', 'Prediction target'], ['horizon_days', 'Forecast horizon']] as const) {
    if (a[key] !== b[key]) reasons.push(label);
  }
  for (const name of ['train', 'calibration', 'test'] as const) {
    if (['count', 'first', 'last'].some(key => a.splits[name][key as keyof typeof a.splits.train] !== b.splits[name][key as keyof typeof b.splits.train])) reasons.push(name + ' partition');
  }
  return reasons;
}

export const metricLabels = [
  ['average_precision', 'Average precision', 'Higher is better'],
  ['brier_score', 'Brier score', 'Lower is better'],
  ['recall_at_50', 'Recall at 50', 'Higher is better'],
] as const;

export function delta(value: number): string { return (value > 0 ? '+' : '') + value.toFixed(4); }

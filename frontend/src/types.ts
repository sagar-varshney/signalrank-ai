export interface Metrics { average_precision: number; brier_score: number; recall_at_50: number; precision_at_50?: number }
export interface Split { count: number; first: string; last: string }
export interface Configuration { seed: number; count: number; regularization_c: number; source: string }
export interface Report {
  mode: string; target: string; dataset_sha256: string; seed: number; horizon_days: number;
  splits: Record<'train' | 'calibration' | 'test', Split>; model: Metrics;
  configuration?: Configuration; warning: string; test_prevalence: number;
  temporal_evaluation?: { protocol: string; folds: { fold: number; status: string; model?: Metrics }[] };
}
export interface Summary {
  id: string; created_at: string; mode: string; dataset_sha256: string; core_sha256: string;
  model: Metrics; seed: number; configuration?: Configuration | null; temporal_windows: number;
}
export interface Snapshot {
  id: string; created_at: string; report: Report;
  provenance: { core_sha256: string; python: string; numpy: string; scikit_learn: string; model: string; forecast_scope: string };
  forecasts: unknown[];
}
export interface History { current_id: string; total: number; items: Summary[] }

export type DateFilterPreset =
  | 'all'
  | 'today'
  | 'this_week'
  | 'this_month'
  | 'custom';

export interface DateRangeResult {
  fromDate?: string;
  toDate?: string;
}

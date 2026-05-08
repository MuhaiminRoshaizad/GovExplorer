export type FuelPriceSeriesType = 'level' | 'change_weekly';

export interface FuelPriceRow {
  date: string;
  series_type: FuelPriceSeriesType;
  ron95: number;
  ron97: number;
  diesel: number;
  diesel_eastmsia: number;
  ron95_skps: number | null;
  ron95_budi95: number | null;
}

export interface WeeklyFuelPrice {
  date: string;
  level: Pick<FuelPriceRow, 'ron95' | 'ron97' | 'diesel' | 'diesel_eastmsia' | 'ron95_skps' | 'ron95_budi95'>;
  change: Pick<FuelPriceRow, 'ron95' | 'ron97' | 'diesel'> | null;
}

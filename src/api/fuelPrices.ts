import { apiGet } from './client';
import type { FuelPriceRow, WeeklyFuelPrice } from '../types/fuelPrice';

export async function getWeeklyFuelPrices(limit = 26): Promise<WeeklyFuelPrice[]> {
  const rows = await apiGet<FuelPriceRow[]>('/data-catalogue', {
    id: 'fuelprice',
    sort: '-date',
    limit: limit * 2,
  });

  const byDate = new Map<string, { level?: FuelPriceRow; change?: FuelPriceRow }>();
  for (const row of rows) {
    const bucket = byDate.get(row.date) ?? {};
    if (row.series_type === 'level') bucket.level = row;
    if (row.series_type === 'change_weekly') bucket.change = row;
    byDate.set(row.date, bucket);
  }

  const result: WeeklyFuelPrice[] = [];
  for (const [date, { level, change }] of byDate) {
    if (!level) continue;
    result.push({
      date,
      level: {
        ron95: level.ron95,
        ron97: level.ron97,
        diesel: level.diesel,
        diesel_eastmsia: level.diesel_eastmsia,
        ron95_skps: level.ron95_skps,
        ron95_budi95: level.ron95_budi95,
      },
      change: change ? { ron95: change.ron95, ron97: change.ron97, diesel: change.diesel } : null,
    });
  }

  return result.slice(0, limit);
}

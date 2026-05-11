import {
  BarChart3,
  Building2,
  Cloud,
  CloudRain,
  Coins,
  Droplet,
  Fuel,
  HeartPulse,
  Home,
  type LucideIcon,
  TrainFront,
  TrendingUp,
  Users,
  Wind,
} from 'lucide-react-native';

export type CategoryTone = 'gold' | 'chart-blue' | 'chart-teal' | 'accent';

export type Dataset = {
  id: string;
  name: string;
  agency: string;
  cadence: string;
  description: string;
  Icon: LucideIcon;
  wired?: boolean;
};

export type Category = {
  key: 'economy' | 'transit' | 'climate' | 'society';
  Icon: LucideIcon;
  tone: CategoryTone;
  datasets: Dataset[];
};

export const CATEGORIES: Category[] = [
  {
    key: 'economy',
    Icon: TrendingUp,
    tone: 'gold',
    datasets: [
      {
        id: 'currency',
        name: 'Exchange rates',
        agency: 'BNM',
        cadence: 'Daily',
        description: 'Daily reference rates published by Bank Negara Malaysia.',
        Icon: Coins,
        wired: true,
      },
      {
        id: 'fuelprice',
        name: 'Fuel prices',
        agency: 'KPDN',
        cadence: 'Weekly',
        description: 'RON95, RON97 and diesel pump prices, set every Thursday.',
        Icon: Fuel,
        wired: true,
      },
      {
        id: 'cpi_headline',
        name: 'CPI inflation',
        agency: 'DOSM',
        cadence: 'Monthly',
        description: 'Headline consumer price index — year-on-year and month-on-month change.',
        Icon: BarChart3,
        wired: true,
      },
      {
        id: 'gdp_qtr_real_sa',
        name: 'Real GDP',
        agency: 'DOSM',
        cadence: 'Quarterly',
        description: 'Seasonally-adjusted real GDP growth.',
        Icon: TrendingUp,
      },
      {
        id: 'bnm_reserves',
        name: 'International reserves',
        agency: 'BNM',
        cadence: 'Bi-monthly',
        description: 'Total external reserves of Bank Negara Malaysia.',
        Icon: Coins,
      },
    ],
  },
  {
    key: 'transit',
    Icon: TrainFront,
    tone: 'chart-blue',
    datasets: [
      {
        id: 'ridership_headline',
        name: 'Rail ridership',
        agency: 'Prasarana',
        cadence: 'Daily',
        description: 'Daily passenger trips across LRT, MRT, KLIA Ekspres, KTM, monorail.',
        Icon: TrainFront,
        wired: true,
      },
      {
        id: 'road_accidents_daily',
        name: 'Road accidents',
        agency: 'PDRM',
        cadence: 'Daily',
        description: 'Road accidents reported across Malaysia.',
        Icon: TrendingUp,
      },
      {
        id: 'vehicles_active',
        name: 'Active vehicles',
        agency: 'JPJ',
        cadence: 'Monthly',
        description: 'Active vehicle registrations by type and state.',
        Icon: TrendingUp,
      },
    ],
  },
  {
    key: 'climate',
    Icon: Cloud,
    tone: 'chart-teal',
    datasets: [
      {
        id: 'weather_warning',
        name: 'Weather warnings',
        agency: 'MetMalaysia',
        cadence: 'Realtime',
        description: 'Active warnings for thunderstorms, rain, wind, and heat.',
        Icon: Wind,
      },
      {
        id: 'rainfall_daily',
        name: 'Daily rainfall',
        agency: 'MetMalaysia',
        cadence: 'Daily',
        description: 'Daily rainfall by station.',
        Icon: CloudRain,
      },
      {
        id: 'aqi_continuous',
        name: 'Air quality',
        agency: 'DOE',
        cadence: 'Hourly',
        description: 'Continuous AQI readings by monitoring station.',
        Icon: Wind,
      },
      {
        id: 'water_levels_dam',
        name: 'Reservoir levels',
        agency: 'JPS',
        cadence: 'Daily',
        description: 'Water levels at major dams.',
        Icon: Droplet,
      },
    ],
  },
  {
    key: 'society',
    Icon: Users,
    tone: 'accent',
    datasets: [
      {
        id: 'population_state',
        name: 'Population by state',
        agency: 'DOSM',
        cadence: 'Annual',
        description: 'Population estimates by state, age group, and sex.',
        Icon: Users,
      },
      {
        id: 'lfs_month',
        name: 'Unemployment rate',
        agency: 'DOSM',
        cadence: 'Monthly',
        description: 'Headline labour force survey indicators.',
        Icon: HeartPulse,
      },
      {
        id: 'hies_household_income',
        name: 'Household income',
        agency: 'DOSM',
        cadence: 'Biennial',
        description: 'Median and mean household income.',
        Icon: Home,
      },
      {
        id: 'births_state',
        name: 'Births by state',
        agency: 'DOSM',
        cadence: 'Annual',
        description: 'Live births registered by state.',
        Icon: HeartPulse,
      },
      {
        id: 'school_enrolment',
        name: 'School enrolment',
        agency: 'KPM',
        cadence: 'Annual',
        description: 'Primary and secondary enrolment by state.',
        Icon: Building2,
      },
    ],
  },
];

export function findDataset(id: string): { dataset: Dataset; category: Category } | null {
  for (const cat of CATEGORIES) {
    const dataset = cat.datasets.find((d) => d.id === id);
    if (dataset) return { dataset, category: cat };
  }
  return null;
}

export const TONE_COLOR: Record<CategoryTone, (t: { gold: { base: string }; chart: { blue: string; teal: string }; accent: { base: string } }) => string> = {
  gold: (t) => t.gold.base,
  'chart-blue': (t) => t.chart.blue,
  'chart-teal': (t) => t.chart.teal,
  accent: (t) => t.accent.base,
};

export const TONE_GLOW: Record<CategoryTone, (t: { gold: { glow: string }; accent: { glow: string } }) => string> = {
  gold: (t) => t.gold.glow,
  'chart-blue': () => 'rgba(59,111,168,0.14)',
  'chart-teal': () => 'rgba(62,142,132,0.14)',
  accent: (t) => t.accent.glow,
};

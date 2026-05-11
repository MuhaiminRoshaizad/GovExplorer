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
        id: 'exchangerates_daily_1700',
        name: 'Exchange rates',
        agency: 'BNM',
        cadence: 'Daily',
        description:
          'Bank Negara Malaysia daily reference rates (17:00 cut). Buying / middle / selling against MYR for major currencies.',
        Icon: Coins,
        wired: true,
      },
      {
        id: 'fuelprice',
        name: 'Fuel prices',
        agency: 'KPDN',
        cadence: 'Weekly',
        description: 'RON95, RON97 and diesel pump prices, set every Thursday by KPDN.',
        Icon: Fuel,
        wired: true,
      },
      {
        id: 'cpi_headline',
        name: 'CPI inflation',
        agency: 'DOSM',
        cadence: 'Monthly',
        description:
          'Headline consumer price index. Year-on-year inflation rate computed from the overall CPI division.',
        Icon: BarChart3,
        wired: true,
      },
      {
        id: 'gdp_qtr_nominal',
        name: 'GDP growth',
        agency: 'DOSM',
        cadence: 'Quarterly',
        description: 'Nominal GDP — absolute value, year-on-year growth, quarter-on-quarter growth.',
        Icon: TrendingUp,
        wired: true,
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
        name: 'Public transport ridership',
        agency: 'Prasarana / KTMB',
        cadence: 'Daily',
        description:
          'Daily passenger trips across LRT, MRT, KLIA Ekspres, KTM Komuter, ETS, monorail, intercity and Rapid bus networks.',
        Icon: TrainFront,
        wired: true,
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
        name: 'Air quality (AQI)',
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
        description: 'Population estimates by state, age group, sex, and ethnicity.',
        Icon: Users,
        wired: true,
      },
      {
        id: 'lfs_month',
        name: 'Unemployment rate',
        agency: 'DOSM',
        cadence: 'Monthly',
        description: 'Headline labour force survey — unemployment rate, participation rate, employment.',
        Icon: HeartPulse,
        wired: true,
      },
      {
        id: 'hh_income',
        name: 'Household income',
        agency: 'DOSM',
        cadence: 'Biennial',
        description: 'Median and mean monthly household income.',
        Icon: Home,
      },
      {
        id: 'births_annual_state',
        name: 'Births by state',
        agency: 'DOSM',
        cadence: 'Annual',
        description: 'Live births registered by state.',
        Icon: HeartPulse,
      },
      {
        id: 'enrolment_school_district',
        name: 'School enrolment',
        agency: 'KPM',
        cadence: 'Annual',
        description: 'Primary and secondary enrolment by district.',
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

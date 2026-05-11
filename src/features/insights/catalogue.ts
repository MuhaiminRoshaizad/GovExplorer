import {
  Activity,
  BarChart3,
  Briefcase,
  Building2,
  CircuitBoard,
  Cloud,
  Coins,
  Droplet,
  Factory,
  Flame,
  Fuel,
  Gavel,
  HandCoins,
  HeartPulse,
  Home,
  Landmark,
  LineChart,
  type LucideIcon,
  Pill,
  Receipt,
  ShieldAlert,
  Stethoscope,
  Syringe,
  TrainFront,
  TreePine,
  TrendingUp,
  Users,
  Wifi,
  Wind,
  Zap,
} from 'lucide-react-native';

export type CategoryTone = 'gold' | 'chart-blue' | 'chart-teal' | 'accent' | 'chart-plum' | 'chart-coral';

export type Cadence = 'Realtime' | 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annual' | 'Biennial' | 'Other';

export type Dataset = {
  id: string;
  name: string;
  agency: string;
  cadence: Cadence;
  description: string;
  Icon: LucideIcon;
  wired?: boolean;
};

export type Category = {
  key: string;
  label: string;
  Icon: LucideIcon;
  tone: CategoryTone;
  datasets: Dataset[];
};

export const CATEGORIES: Category[] = [
  {
    key: 'economy',
    label: 'Economy & finance',
    Icon: TrendingUp,
    tone: 'gold',
    datasets: [
      {
        id: 'exchangerates_daily_1700',
        name: 'Exchange rates',
        agency: 'BNM',
        cadence: 'Daily',
        description:
          'Bank Negara Malaysia daily reference rates (17:00 cut). Buying / middle / selling against MYR.',
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
        description: 'Headline consumer price index. Year-on-year and month-on-month change.',
        Icon: BarChart3,
        wired: true,
      },
      {
        id: 'gdp_qtr_nominal',
        name: 'GDP growth',
        agency: 'DOSM',
        cadence: 'Quarterly',
        description: 'Nominal GDP — absolute, year-on-year and quarter-on-quarter growth.',
        Icon: TrendingUp,
        wired: true,
      },
      {
        id: 'monetary_aggregates',
        name: 'Monetary aggregates',
        agency: 'BNM',
        cadence: 'Monthly',
        description: 'M1, M2 and M3 monetary aggregates.',
        Icon: Landmark,
      },
      {
        id: 'interestrates',
        name: 'Interest rates',
        agency: 'BNM',
        cadence: 'Monthly',
        description: 'Average lending rate, base lending rate, fixed deposit rates.',
        Icon: LineChart,
      },
      {
        id: 'trnsc_daily_fpx',
        name: 'FPX transactions',
        agency: 'PayNet',
        cadence: 'Daily',
        description: 'Daily Financial Process Exchange transaction value and volume.',
        Icon: Receipt,
      },
      {
        id: 'payment_instruments',
        name: 'Payment instruments',
        agency: 'BNM',
        cadence: 'Monthly',
        description: 'Cards in circulation, mobile payment penetration.',
        Icon: HandCoins,
      },
    ],
  },
  {
    key: 'transport',
    label: 'Transport & mobility',
    Icon: TrainFront,
    tone: 'chart-blue',
    datasets: [
      {
        id: 'ridership_headline',
        name: 'Public transport ridership',
        agency: 'Prasarana / KTMB',
        cadence: 'Daily',
        description: 'Daily passenger trips across LRT, MRT, ETS, KTM Komuter, monorail, intercity and Rapid buses.',
        Icon: TrainFront,
        wired: true,
      },
    ],
  },
  {
    key: 'environment',
    label: 'Environment & energy',
    Icon: TreePine,
    tone: 'chart-teal',
    datasets: [
      {
        id: 'electricity_consumption',
        name: 'Electricity consumption',
        agency: 'ST',
        cadence: 'Annual',
        description: 'Final electricity consumption by sector.',
        Icon: Zap,
      },
      {
        id: 'electricity_supply',
        name: 'Electricity supply',
        agency: 'ST',
        cadence: 'Annual',
        description: 'Generation capacity by fuel source.',
        Icon: Flame,
      },
      {
        id: 'electricity_access',
        name: 'Electricity access',
        agency: 'ST',
        cadence: 'Annual',
        description: 'Share of population with electricity access by state.',
        Icon: Zap,
      },
      {
        id: 'water_consumption',
        name: 'Water consumption',
        agency: 'SPAN',
        cadence: 'Annual',
        description: 'Domestic and non-domestic water consumption.',
        Icon: Droplet,
      },
      {
        id: 'water_access',
        name: 'Water access',
        agency: 'SPAN',
        cadence: 'Annual',
        description: 'Share of population with treated water access.',
        Icon: Droplet,
      },
      {
        id: 'air_pollution',
        name: 'Air pollution',
        agency: 'DOE',
        cadence: 'Annual',
        description: 'PM2.5, PM10, NOx and SO2 readings.',
        Icon: Wind,
      },
      {
        id: 'ghg_emissions',
        name: 'GHG emissions',
        agency: 'NRES',
        cadence: 'Annual',
        description: 'Greenhouse gas emissions by sector.',
        Icon: Factory,
      },
      {
        id: 'forest_reserve_state',
        name: 'Forest reserves',
        agency: 'JPSM',
        cadence: 'Annual',
        description: 'Permanent reserved forest area by state.',
        Icon: TreePine,
      },
    ],
  },
  {
    key: 'society',
    label: 'Population & society',
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
        description: 'Labour force survey — unemployment, participation, employment.',
        Icon: Briefcase,
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
        id: 'hies_district',
        name: 'Income by district',
        agency: 'DOSM',
        cadence: 'Biennial',
        description: 'Household income, gini, poverty rate by district.',
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
        id: 'productivity_qtr',
        name: 'Labour productivity',
        agency: 'DOSM',
        cadence: 'Quarterly',
        description: 'Labour productivity growth.',
        Icon: TrendingUp,
      },
      {
        id: 'epf_dividend',
        name: 'EPF dividend',
        agency: 'EPF',
        cadence: 'Annual',
        description: 'Annual EPF dividend declared (conventional and Shariah).',
        Icon: Coins,
      },
    ],
  },
  {
    key: 'healthcare',
    label: 'Healthcare',
    Icon: Stethoscope,
    tone: 'chart-coral',
    datasets: [
      {
        id: 'hospital_beds',
        name: 'Hospital beds',
        agency: 'MOH',
        cadence: 'Annual',
        description: 'Hospital bed count by state.',
        Icon: Building2,
      },
      {
        id: 'healthcare_staff',
        name: 'Healthcare workforce',
        agency: 'MOH',
        cadence: 'Annual',
        description: 'Doctors, nurses and allied health staff by state.',
        Icon: Stethoscope,
      },
      {
        id: 'blood_donations',
        name: 'Blood donations',
        agency: 'PDN',
        cadence: 'Daily',
        description: 'Daily blood donations at the National Blood Centre.',
        Icon: HeartPulse,
      },
      {
        id: 'organ_pledges',
        name: 'Organ pledges',
        agency: 'MOH',
        cadence: 'Daily',
        description: 'Cumulative organ pledges in Malaysia.',
        Icon: HeartPulse,
      },
      {
        id: 'infant_immunisation',
        name: 'Infant immunisation',
        agency: 'MOH',
        cadence: 'Annual',
        description: 'Immunisation coverage for infants.',
        Icon: Syringe,
      },
      {
        id: 'covid_cases',
        name: 'COVID-19 cases',
        agency: 'MOH',
        cadence: 'Daily',
        description: 'Daily COVID-19 case reports by state.',
        Icon: Activity,
      },
      {
        id: 'pharmaceutical_products',
        name: 'Pharmaceutical products',
        agency: 'NPRA',
        cadence: 'Other',
        description: 'Registered pharmaceutical products.',
        Icon: Pill,
      },
    ],
  },
  {
    key: 'safety',
    label: 'Public safety',
    Icon: ShieldAlert,
    tone: 'chart-plum',
    datasets: [
      {
        id: 'crime_district',
        name: 'Crime by district',
        agency: 'PDRM',
        cadence: 'Annual',
        description: 'Crime statistics by district and category.',
        Icon: ShieldAlert,
      },
      {
        id: 'prisoners_state',
        name: 'Prisoners by state',
        agency: 'JPM',
        cadence: 'Annual',
        description: 'Prison population by state.',
        Icon: Gavel,
      },
      {
        id: 'drug_arrests_age',
        name: 'Drug arrests by age',
        agency: 'PDRM',
        cadence: 'Annual',
        description: 'Drug-related arrests categorised by age.',
        Icon: ShieldAlert,
      },
      {
        id: 'drug_addicts_age',
        name: 'Drug addicts by age',
        agency: 'AADK',
        cadence: 'Annual',
        description: 'Drug addicts categorised by age and state.',
        Icon: Activity,
      },
      {
        id: 'drug_addicts_education',
        name: 'Drug addicts · education',
        agency: 'AADK',
        cadence: 'Annual',
        description: 'Highest education level of drug addicts.',
        Icon: BarChart3,
      },
      {
        id: 'legal_advisory_services',
        name: 'Legal aid cases',
        agency: 'BBGK',
        cadence: 'Annual',
        description: 'Legal advisory services and cases.',
        Icon: Gavel,
      },
    ],
  },
  {
    key: 'tech',
    label: 'Connectivity & tech',
    Icon: Wifi,
    tone: 'chart-blue',
    datasets: [
      {
        id: 'cellular_subscribers',
        name: 'Cellular subscribers',
        agency: 'MCMC',
        cadence: 'Annual',
        description: 'Mobile phone subscriptions in Malaysia.',
        Icon: CircuitBoard,
      },
    ],
  },
];

export const ALL_DATASETS: Dataset[] = CATEGORIES.flatMap((c) => c.datasets);

export function findDataset(id: string): { dataset: Dataset; category: Category } | null {
  for (const cat of CATEGORIES) {
    const dataset = cat.datasets.find((d) => d.id === id);
    if (dataset) return { dataset, category: cat };
  }
  return null;
}

export const CADENCE_FILTERS: Cadence[] = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual'];

export const TONE_COLOR: Record<CategoryTone, (t: {
  gold: { base: string };
  chart: { blue: string; teal: string; coral: string; plum: string };
  accent: { base: string };
}) => string> = {
  gold: (t) => t.gold.base,
  'chart-blue': (t) => t.chart.blue,
  'chart-teal': (t) => t.chart.teal,
  'chart-coral': (t) => t.chart.coral,
  'chart-plum': (t) => t.chart.plum,
  accent: (t) => t.accent.base,
};

export const TONE_GLOW: Record<CategoryTone, (t: { gold: { glow: string }; accent: { glow: string } }) => string> = {
  gold: (t) => t.gold.glow,
  'chart-blue': () => 'rgba(59,111,168,0.14)',
  'chart-teal': () => 'rgba(62,142,132,0.14)',
  'chart-coral': () => 'rgba(226,109,92,0.14)',
  'chart-plum': () => 'rgba(126,90,140,0.14)',
  accent: (t) => t.accent.glow,
};

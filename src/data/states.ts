export interface MalaysianState {
  code: string;
  nameEn: string;
  nameMs: string;
  /** METMalaysia forecast location ID (api.data.gov.my/weather/forecast). */
  metLocationId: string;
}

export const STATES: MalaysianState[] = [
  { code: 'JHR', nameEn: 'Johor',                  nameMs: 'Johor',                  metLocationId: 'Ds090' }, // Johor Bahru
  { code: 'KDH', nameEn: 'Kedah',                  nameMs: 'Kedah',                  metLocationId: 'Ds004' }, // Kota Setar
  { code: 'KTN', nameEn: 'Kelantan',               nameMs: 'Kelantan',               metLocationId: 'Ds024' }, // Kota Bharu
  { code: 'MLK', nameEn: 'Melaka',                 nameMs: 'Melaka',                 metLocationId: 'Ds078' }, // Melaka Tengah
  { code: 'NSN', nameEn: 'Negeri Sembilan',        nameMs: 'Negeri Sembilan',        metLocationId: 'Ds068' }, // Seremban
  { code: 'PHG', nameEn: 'Pahang',                 nameMs: 'Pahang',                 metLocationId: 'Ds069' }, // Kuantan
  { code: 'PNG', nameEn: 'Pulau Pinang',           nameMs: 'Pulau Pinang',           metLocationId: 'Tn013' }, // Georgetown
  { code: 'PRK', nameEn: 'Perak',                  nameMs: 'Perak',                  metLocationId: 'Tn041' }, // Ipoh
  { code: 'PLS', nameEn: 'Perlis',                 nameMs: 'Perlis',                 metLocationId: 'Ds002' }, // Perlis
  { code: 'SBH', nameEn: 'Sabah',                  nameMs: 'Sabah',                  metLocationId: 'Ds554' }, // Kota Kinabalu
  { code: 'SWK', nameEn: 'Sarawak',                nameMs: 'Sarawak',                metLocationId: 'Ds504' }, // Kuching
  { code: 'SGR', nameEn: 'Selangor',               nameMs: 'Selangor',               metLocationId: 'Tn070' }, // Shah Alam
  { code: 'TRG', nameEn: 'Terengganu',             nameMs: 'Terengganu',             metLocationId: 'Ds048' }, // Kuala Terengganu
  { code: 'KUL', nameEn: 'WP Kuala Lumpur',        nameMs: 'WP Kuala Lumpur',        metLocationId: 'Ds058' }, // Kuala Lumpur
  { code: 'LBN', nameEn: 'WP Labuan',              nameMs: 'WP Labuan',              metLocationId: 'Ds542' }, // FP Labuan
  { code: 'PJY', nameEn: 'WP Putrajaya',           nameMs: 'WP Putrajaya',           metLocationId: 'Ds062' }, // Putrajaya
];

export const DEFAULT_STATE_CODE = 'KUL';

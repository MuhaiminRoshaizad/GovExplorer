export type StateCode =
  | 'jhr'
  | 'kdh'
  | 'ktn'
  | 'mlk'
  | 'nsn'
  | 'phg'
  | 'png'
  | 'prk'
  | 'pls'
  | 'sbh'
  | 'swk'
  | 'sgr'
  | 'trg'
  | 'kul'
  | 'lbn'
  | 'pjy';

export type MalaysiaState = {
  code: StateCode;
  name: string;
  apiName: string;
};

export const STATES: MalaysiaState[] = [
  { code: 'jhr', name: 'Johor', apiName: 'Johor' },
  { code: 'kdh', name: 'Kedah', apiName: 'Kedah' },
  { code: 'ktn', name: 'Kelantan', apiName: 'Kelantan' },
  { code: 'mlk', name: 'Melaka', apiName: 'Melaka' },
  { code: 'nsn', name: 'Negeri Sembilan', apiName: 'Negeri Sembilan' },
  { code: 'phg', name: 'Pahang', apiName: 'Pahang' },
  { code: 'png', name: 'Pulau Pinang', apiName: 'Pulau Pinang' },
  { code: 'prk', name: 'Perak', apiName: 'Perak' },
  { code: 'pls', name: 'Perlis', apiName: 'Perlis' },
  { code: 'sbh', name: 'Sabah', apiName: 'Sabah' },
  { code: 'swk', name: 'Sarawak', apiName: 'Sarawak' },
  { code: 'sgr', name: 'Selangor', apiName: 'Selangor' },
  { code: 'trg', name: 'Terengganu', apiName: 'Terengganu' },
  { code: 'kul', name: 'W.P. Kuala Lumpur', apiName: 'W.P. Kuala Lumpur' },
  { code: 'lbn', name: 'W.P. Labuan', apiName: 'W.P. Labuan' },
  { code: 'pjy', name: 'W.P. Putrajaya', apiName: 'W.P. Putrajaya' },
];

export function findState(code: StateCode | string): MalaysiaState | undefined {
  return STATES.find((s) => s.code === code);
}

export const DEFAULT_STATE_CODE: StateCode = 'kul';

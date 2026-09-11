import { StateCode, StateConfiguration } from '@/types';
import { chandigarhConfig } from './chandigarh';
import { tamilNaduConfig } from './tamilNadu';

export const STATE_CONFIGS: Record<StateCode, StateConfiguration> = {
  CH: chandigarhConfig,
  TN: tamilNaduConfig,
};

export const getStateConfig = (code: StateCode): StateConfiguration => {
  return STATE_CONFIGS[code] || STATE_CONFIGS.CH;
};

export const DEFAULT_STATE_CODE: StateCode =
  (import.meta.env.VITE_DEFAULT_STATE as StateCode) || 'CH';

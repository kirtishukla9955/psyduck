import { create } from 'zustand';
import { StateCode, StateConfiguration, DepartmentCode, ConflictStatus } from '@/types';
import { getStateConfig, DEFAULT_STATE_CODE, STATE_CONFIGS } from '@/config/states';

interface StateConfigState {
  currentStateCode: StateCode;
  config: StateConfiguration;
  setStateCode: (code: StateCode) => void;
  getDeptLabel: (dept: DepartmentCode) => string;
  getRorTerm: () => string;
  getAreaUnit: () => string;
  formatArea: (value: number) => string;
  getWorkflowStageLabel: (status: ConflictStatus) => string;
}

const STORAGE_STATE_CODE = 'land_stack_selected_state';

const getInitialStateCode = (): StateCode => {
  const saved = localStorage.getItem(STORAGE_STATE_CODE) as StateCode;
  if (saved && STATE_CONFIGS[saved]) {
    return saved;
  }
  return DEFAULT_STATE_CODE;
};

export const useStateConfig = create<StateConfigState>((set, get) => ({
  currentStateCode: getInitialStateCode(),
  config: getStateConfig(getInitialStateCode()),

  setStateCode: (code: StateCode) => {
    const config = getStateConfig(code);
    localStorage.setItem(STORAGE_STATE_CODE, code);
    set({ currentStateCode: code, config });
  },

  getDeptLabel: (dept: DepartmentCode) => {
    const { config } = get();
    return config.departmentLabels[dept] || dept;
  },

  getRorTerm: () => {
    return get().config.rorTerm;
  },

  getAreaUnit: () => {
    return get().config.areaUnit;
  },

  formatArea: (value: number) => {
    const { config } = get();
    return `${value.toFixed(2)} ${config.areaUnit}`;
  },

  getWorkflowStageLabel: (status: ConflictStatus) => {
    const { config } = get();
    return config.workflowStageLabels[status] || status;
  },
}));

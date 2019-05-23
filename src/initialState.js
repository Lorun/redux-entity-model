import { REQUEST_STATUS } from './constant';

/**
 * Create Form initialState
 * @returns {{error: null, value: {}, status: string}}
 */
export const createFormInitialState = () => {
  return {
    status: REQUEST_STATUS.TODO,
    value: {},
    error: null
  };
};

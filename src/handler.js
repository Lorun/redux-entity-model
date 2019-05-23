import { REQUEST_STATUS } from './constant';
import { always, append, assoc, dissoc, evolve, mergeLeft, without } from 'ramda';
import { createFormInitialState } from './initialState';

export const onFetchReq = state => ({
  ...state,
  status: REQUEST_STATUS.FETCHING
});

export const onFetchOk = (state, { byId, allIds }) => ({
  ...state,
  status: REQUEST_STATUS.COMPLETED,
  byId,
  allIds,
  error: null
});

export const onFetchError = (state, { error }) => ({
  ...state,
  status: REQUEST_STATUS.FAILED,
  error
});

/* Create */
export const onCreateInit = (state, { value = {} }) => ({
  ...state,
  create: {
    ...state.create,
    value
  }
});

export const onCreateChange = (state, { values }) =>
  evolve({
    create: {
      value: mergeLeft(values),
      error: always(null)
    }
  })(state);

export const onCreateReq = state =>
  evolve({
    create: {
      status: always(REQUEST_STATUS.FETCHING),
      error: always(null)
    }
  })(state);

export const onCreateOk = (state, { entity }) =>
  evolve({
    create: {
      status: always(REQUEST_STATUS.COMPLETED)
    },
    byId: assoc(entity.id, entity),
    allIds: append(entity.id)
  })(state);

export const onCreateError = (state, { error }) =>
  evolve({
    create: {
      status: always(REQUEST_STATUS.FAILED),
      error: always(error)
    }
  })(state);

export const onCreateCancel = state => ({
  ...state,
  create: createFormInitialState()
});

/* Update */
export const onUpdateInit = (state, { value = {} }) => ({
  ...state,
  update: {
    ...state.update,
    value
  }
});

export const onUpdateChange = (state, { values }) =>
  evolve({
    update: {
      value: mergeLeft(values),
      error: always(null)
    }
  })(state);

export const onUpdateReq = state =>
  evolve({
    update: {
      status: always(REQUEST_STATUS.FETCHING),
      error: always(null)
    }
  })(state);

export const onUpdateOk = (state, { entity }) =>
  evolve({
    update: {
      status: always(REQUEST_STATUS.COMPLETED)
    },
    byId: assoc(entity.id, entity),
    allIds: append(entity.id)
  })(state);

export const onUpdateError = (state, { error }) =>
  evolve({
    update: {
      status: always(REQUEST_STATUS.FAILED),
      error: always(error)
    }
  })(state);

export const onUpdateCancel = state => ({
  ...state,
  create: createFormInitialState()
});

/* Remove */
export const onRemoveReq = state =>
  evolve({
    remove: {
      status: always(REQUEST_STATUS.FETCHING),
      error: always(null)
    }
  })(state);

export const onRemoveOk = (state, { entity }) =>
  evolve({
    remove: {
      status: always(REQUEST_STATUS.COMPLETED)
    },
    byId: dissoc(entity.id),
    allIds: without([entity.id])
  })(state);

export const onRemoveError = (state, { error }) =>
  evolve({
    remove: {
      status: always(REQUEST_STATUS.FAILED),
      error: always(error)
    }
  })(state);

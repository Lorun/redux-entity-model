import { combineReducers } from 'redux';
import { filter, sort } from 'ramda';
import { createReducer } from 'redux-create-reducer';
import { createSelector } from 'reselect';
import { REQUEST_STATUS } from './constant';
import { createFormInitialState } from './initialState';
import * as handler from './handler';

/**
 * Create Redux Entity model
 */
export class ReduxEntity {
  constructor(actionTypes, initialState) {
    this.actionTypes = actionTypes;
    this.initialState = initialState || this.createInitialState();
  }

  /**
   * Create entity initial state
   * @returns {{byId: {}, error: null, allIds: Array, status: string}}
   */
  createInitialState() {
    const _initialState = {
      status: REQUEST_STATUS.TODO,
      byId: {},
      allIds: [],
      error: null
    };
    if (this.actionTypes.CREATE) {
      _initialState.create = createFormInitialState();
    }
    if (this.actionTypes.UPDATE) {
      _initialState.update = createFormInitialState();
    }
    if (this.actionTypes.REMOVE) {
      _initialState.remove = createFormInitialState();
    }

    return _initialState;
  }

  /**
   * Create entity reducer
   * @param customHandlers
   * @param reducersToCombine
   * @returns {any}
   */
  createReducer(customHandlers = {}, reducersToCombine) {
    const handlers = {
      [this.actionTypes.FETCH.REQUEST]: handler.onFetchReq,
      [this.actionTypes.FETCH.SUCCESS]: handler.onFetchOk,
      [this.actionTypes.FETCH.FAILURE]: handler.onFetchError
    };

    if (this.actionTypes.CREATE) {
      handlers[this.actionTypes.CREATE.INIT] = handler.onCreateInit;
      handlers[this.actionTypes.CREATE.CHANGE] = handler.onCreateChange;
      handlers[this.actionTypes.CREATE.REQUEST] = handler.onCreateReq;
      handlers[this.actionTypes.CREATE.SUCCESS] = handler.onCreateOk;
      handlers[this.actionTypes.CREATE.FAILURE] = handler.onCreateError;
      handlers[this.actionTypes.CREATE.CANCEL] = handler.onCreateCancel;
    }

    if (this.actionTypes.UPDATE) {
      handlers[this.actionTypes.UPDATE.INIT] = handler.onUpdateInit;
      handlers[this.actionTypes.UPDATE.CHANGE] = handler.onUpdateChange;
      handlers[this.actionTypes.UPDATE.REQUEST] = handler.onUpdateReq;
      handlers[this.actionTypes.UPDATE.SUCCESS] = handler.onUpdateOk;
      handlers[this.actionTypes.UPDATE.FAILURE] = handler.onUpdateError;
      handlers[this.actionTypes.UPDATE.CANCEL] = handler.onUpdateCancel;
    }

    if (this.actionTypes.REMOVE) {
      handlers[this.actionTypes.REMOVE.REQUEST] = handler.onRemoveReq;
      handlers[this.actionTypes.REMOVE.SUCCESS] = handler.onRemoveOk;
      handlers[this.actionTypes.REMOVE.FAILURE] = handler.onRemoveError;
    }

    const entityReducer = createReducer(this.initialState, {
      ...handlers,
      ...customHandlers
    });

    return reducersToCombine
      ? combineReducers({
          entity: entityReducer,
          ...reducersToCombine
        })
      : entityReducer;
  }

  /**
   * Generate entity actions
   * @param customActions
   * @returns {{fetchOk: (function({byId: *, allIds: *}): {type: (string), byId: *, allIds: *}), fetchFail: (function(*): {type: (string), error: *}), fetchReq: (function(*): {payload: *, type: (string)})}}
   */
  createActions(customActions = {}) {
    const actions = {
      fetchReq: payload => ({
        type: this.actionTypes.FETCH.REQUEST,
        payload
      }),
      fetchOk: ({ byId, allIds }) => ({
        type: this.actionTypes.FETCH.SUCCESS,
        byId,
        allIds
      }),
      fetchFail: error => ({
        type: this.actionTypes.FETCH.FAILURE,
        error
      })
    };

    if (this.actionTypes.CREATE) {
      actions.initCreating = (payload = {}) => ({
        type: this.actionTypes.CREATE.INIT,
        ...payload
      });

      actions.changeCreating = values => ({
        type: this.actionTypes.CREATE.CHANGE,
        values
      });

      actions.createReq = payload => ({
        type: this.actionTypes.CREATE.REQUEST,
        payload
      });

      actions.createOk = entity => ({
        type: this.actionTypes.CREATE.SUCCESS,
        entity
      });

      actions.createFail = error => ({
        type: this.actionTypes.CREATE.FAILURE,
        error
      });

      actions.cancelCreating = () => ({
        type: this.actionTypes.CREATE.CANCEL
      });
    }

    if (this.actionTypes.UPDATE) {
      actions.initUpdating = (payload = {}) => ({
        type: this.actionTypes.UPDATE.INIT,
        ...payload
      });

      actions.changeUpdating = values => ({
        type: this.actionTypes.UPDATE.CHANGE,
        values
      });

      actions.updateReq = payload => ({
        type: this.actionTypes.UPDATE.REQUEST,
        payload
      });

      actions.updateOk = entity => ({
        type: this.actionTypes.UPDATE.SUCCESS,
        entity
      });

      actions.updateFail = error => ({
        type: this.actionTypes.UPDATE.FAILURE,
        error
      });

      actions.cancelUpdating = () => ({
        type: this.actionTypes.UPDATE.CANCEL
      });
    }

    if (this.actionTypes.REMOVE) {
      actions.removeReq = payload => ({
        type: this.actionTypes.REMOVE.REQUEST,
        payload
      });

      actions.removeOk = id => ({
        type: this.actionTypes.REMOVE.SUCCESS,
        id
      });

      actions.removeFail = error => ({
        type: this.actionTypes.REMOVE.FAILURE,
        error
      });
    }

    return {
      ...actions,
      ...customActions
    };
  }

  /**
   * Generate entity selectors
   * @param pathToState
   * @param mapCustomSelectors
   * @returns {*}
   */
  createSelectors(pathToState, mapCustomSelectors) {
    let _entityState;
    function getByPath(state) {
      if (!_entityState) {
        _entityState = pathToState.reduce((_state, key) => {
          return _state[key];
        }, state);
      }
      return _entityState;
    }

    // Common
    const selector = {
      itemsById: state => getByPath(state).byId,
      itemIds: state => getByPath(state).allIds,
      itemById: (state, id) => getByPath(state).byId[id],
      status: state => getByPath(state).status,
      isFetching: state => getByPath(state).status === REQUEST_STATUS.FETCHING,
      error: state => getByPath(state).error,
      entity: state => getByPath(state)
    };

    selector.items = options => {
      const injectedSelectors = [selector.itemIds, selector.itemsById];
      if (!options) {
        return createSelector(
          injectedSelectors,
          (itemIds, itemsById) => itemIds.map(id => itemsById[id])
        );
      }

      const { filterFn, sortFn, selectParams } = options;

      if (selectParams && typeof selectParams === 'function') {
        injectedSelectors.push(selectParams);
      }

      return createSelector(
        injectedSelectors,
        (itemIds, itemsById, params) => {
          let _itemIds = itemIds;

          if (filterFn && typeof filterFn === 'function') {
            _itemIds = filter(filterFn(itemsById, params), _itemIds);
          }

          if (sortFn && typeof sortFn === 'function') {
            _itemIds = sort(sortFn(itemsById, params), _itemIds);
          }
          return _itemIds.map(id => itemsById[id]);
        }
      );
    };

    selector.errorIfFailed = createSelector(
      [selector.status, selector.error],
      (_status, _error) => (_status === REQUEST_STATUS.FAILED ? _error : this.initialState.error)
    );

    // Create
    if (this.actionTypes.CREATE) {
      selector.createValue = state => getByPath(state).create.value;
      selector.createStatus = state => getByPath(state).create.status;
      selector.createError = state => getByPath(state).create.error;
      selector.createSubmitting = state =>
        getByPath(state).create.status === REQUEST_STATUS.FETCHING;
    }

    // Update
    if (this.actionTypes.UPDATE) {
      selector.updateValue = state => getByPath(state).update.value;
      selector.updateStatus = state => getByPath(state).update.status;
      selector.updateError = state => getByPath(state).update.error;
      selector.updateSubmitting = state =>
        getByPath(state).update.status === REQUEST_STATUS.FETCHING;
    }

    // Remove
    if (this.actionTypes.REMOVE) {
      selector.removeStatus = state => getByPath(state).update.status;
      selector.removeError = state => getByPath(state).update.error;
      selector.removeSubmitting = state =>
        getByPath(state).remove.status === REQUEST_STATUS.FETCHING;
    }

    if (mapCustomSelectors && typeof mapCustomSelectors === 'function') {
      const customSelectors = mapCustomSelectors(selector);
      return {
        ...selector,
        ...customSelectors
      };
    }

    return selector;
  }
}

// Example of using
const ReduxEntity = require('./lib').ReduxEntity;
const combineReducers = require('redux').combineReducers;
const createReducer = require('redux-create-reducer').createReducer;
const createSelector = require('reselect').createSelector;

// Action types
const BLOG = {
  ARTICLE: {
    FETCH: {
      REQUEST: '@blog/article/fetch/request',
      SUCCESS: '@blog/article/fetch/success',
      FAILURE: '@blog/article/fetch/failure'
    },
    CREATE: {
      INIT: '@blog/article/create/init',
      CHANGE: '@blog/article/create/change',
      REQUEST: '@blog/article/create/request',
      SUCCESS: '@blog/article/create/success',
      FAILURE: '@blog/article/create/failure',
      CANCEL: '@blog/article/create/cancel',
      DIALOG: {
        OPEN: '@blog/article/create/dialog/open',
        CLOSE: '@blog/article/create/dialog/close'
      }
    },
    UPDATE: {
      INIT: '@blog/article/update/init',
      CHANGE: '@blog/article/update/change',
      REQUEST: '@blog/article/update/request',
      SUCCESS: '@blog/article/update/success',
      FAILURE: '@blog/article/update/failure',
      CANCEL: '@blog/article/update/cancel'
    },
    REMOVE: {
      REQUEST: '@blog/article/remove/request',
      SUCCESS: '@blog/article/remove/success',
      FAILURE: '@blog/article/remove/failure'
    },
    COMMENT: {
      FETCH: {
        REQUEST: '@blog/article/comment/fetch/request',
        SUCCESS: '@blog/article/comment/fetch/success',
        FAILURE: '@blog/article/comment/fetch/failure'
      }
    }
  }
};

// Article entity
const article = new ReduxEntity(BLOG.ARTICLE);

// Comment entity
const comment = new ReduxEntity(BLOG.ARTICLE.COMMENT);

// Reducers
const commentReducer = comment.createReducer();
const dialogReducer = createReducer({ isOpen: false }, {});
const articleReducer = article.createReducer(
  {
    [BLOG.ARTICLE.CREATE.DIALOG.CLOSE]: state => ({
      ...state,
      create: article.initialState.create
    })
  },
  {
    comment: commentReducer,
    dialog: dialogReducer
  }
);
const blogReducer = combineReducers({
  article: articleReducer
});

// Actions
const articleAction = article.createActions();

// Selectors
const commentSelector = comment.createSelectors(['article', 'comment']);

const articleSelector = article.createSelectors(
  ['article', 'entity'],
  ({ itemsById, itemIds }) => ({
    itemList: createSelector(
      [itemsById, itemIds],
      (byId, ids) => {
        return ids.map(id => byId[id]);
      }
    )
  })
);

// Tested store
const state = {
  article: {
    entity: {
      status: 'TODO',
      create: {
        status: 'TODO'
      },
      byId: {
        '100': {
          id: '100',
          title: 'New article',
          created: '2019-05-21'
        },
        '101': {
          id: '101',
          title: 'Old article',
          created: '2019-05-15'
        }
      },
      allIds: ['100', '101'],
      error: null
    },
    comment: {
      status: 'TODO',
      byId: {
        '1000': {
          id: '1000',
          message: 'Comment message'
        }
      },
      allIds: ['1000'],
      error: null
    },
    dialog: {
      isOpen: false
    }
  }
};

const action1 = articleAction.initCreating();
console.log('\n action1\n', action1);

const action2 = articleAction.changeCreating({ name: 'New name' });
console.log('\n action2\n', action2);

const nextState = blogReducer(state, action1);
console.log('\n nextState.article.entity\n', nextState.article.entity);

console.log(
  '\n blogReducer(nextState, action2).article.entity\n',
  blogReducer(nextState, action2).article.entity
);

console.log('\n articleSelector.itemsById(state)\n', articleSelector.itemsById(state));

console.log('\n articleSelector.itemList(state)\n', articleSelector.itemList(state));

const filteredItems = articleSelector.items({
  filterFn: byId => id => byId[id].created === '2019-05-21'
})(state);
console.log('\n filteredItems\n', filteredItems);

console.log(
  '\n commentSelector.itemById(state, "1000")\n',
  commentSelector.itemById(state, '1000')
);

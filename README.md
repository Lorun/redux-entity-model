# redux-entity-model
```redux-entity-model``` is just a creator of redux units such as reducer, actions and selectors for domain entities. This library creates model that helps to perform CRUD operations with redux store.

## Features
* Normalized data in store
* Basic redux units
  * initial state
  * reducer
  * actions
  * selectors
* Cover CRUD operations

## Install
```yarn add redux-entity-model```

## Basic usage

```javascript
import { ReduxEntity } from 'redux-entity-model';

const ACTION_TYPES = {
  ARTICLE: {
    // Predefined fetch types of an entity
    FETCH: {
      REQUEST: '@article/fetch/request',
      SUCCESS: '@article/fetch/success',
      FAILURE: '@article/fetch/failure'
    }
  }
}

// Create article model
const article = new ReduxEntity(ACTION_TYPES.ARTICLE);

// Create article reducer
const articleReducer = article.createReducer();

// Create article actions
const articleAction = article.createActions();

// Create selectors
const selectArticle = article.createSelectors(['article']);

// Available actions:
articleAction.fetchReq(payload);
articleAction.fetchOk({ byId, allIds });
articleAction.fetchFail(error);

// Available selectors:
selectArticle.itemIds(state);
selectArticle.itemsById(state);
selectArticle.itemById(state, itemId);
selectArticle.status(state);
selectArticle.isFetching(state);
selectArticle.error(state);
selectArticle.entity(state);
selectArticle.items({
  filterFn: filterByCreated,
  sortFn: sortByTitle,
  selectParams: state => state.article.filter.value
})(state);

function filterByCreated(byId, date) {
  return id => byId[id].createdDate === date;
}

function sortByTitle(byId) {
  return (a, b) => {
    return byId[a] < byId[b] ? -1 : byId[a] > byId[b] ? 1 : 0;
  }
}

// Created store
const store = {
  article: {
    status: 'TODO',
    byId: {},
    allIds: [],
    error: null
  }
};

```

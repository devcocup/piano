import { createStore, applyMiddleware, compose } from 'redux';
import logger from 'redux-logger'
import thunk from 'redux-thunk';

import rootReducer from '../reducers/index';
const store = createStore(
  rootReducer,
  compose(
    applyMiddleware(thunk)
    //applyMiddleware(logger)
  )
);
export default store;
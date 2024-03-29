import reduxThunk from 'redux-thunk'
import { createStore, applyMiddleware } from 'redux'
import filteredLogger from './store_ignore'
import reducers from './reducers'
// import establishWebSockets from './middleware/websocket_middleware'
import pouchDB from './middleware/pouchdb_middleware'

// reduxThunk allows us to store functions inside our actions (instead of only objects)
// recall that all actions will flow through each middleware until it reaches the end to be passed to reducers
const createStoreWithMiddleware = applyMiddleware(
	reduxThunk,
	filteredLogger,
	pouchDB,
)(createStore);
// create an instance of the redux store with all our reducers
const store = createStoreWithMiddleware(
  reducers
);

export default store;

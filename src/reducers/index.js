import { combineReducers } from 'redux'
import tenantReducer from './tenant/tenant_reducer'
import selectionReducer from './selection/selection_reducer'
import messageReducer from './messaging/messaging_reducer'

const rootReducer = combineReducers({
	tenant: tenantReducer,
	selection: selectionReducer,
	messages: messageReducer,
})

export default rootReducer

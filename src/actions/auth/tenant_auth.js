import {
	SET_TENANT_PROFILE,
	CONNECT_WEBSOCKETS,
	INITIATE_POUCHDB,
} from '../action_types'

export const setupWebsockets = (userId) => {
	return (dispatch) => {
		dispatch({
			type: CONNECT_WEBSOCKETS,
			payload: userId
		})
	}
}

export const saveTenantProfile = (userId) => {
	return (dispatch) => {
		dispatch({
			type: SET_TENANT_PROFILE,
			payload: {
        tenant_id: userId,
				tenant_name: 'Jake Malliaros',
      }
		})
	}
}

// initiate pouchdb
export const initiatePouchDB = (userId) => {
	return {
		type: INITIATE_POUCHDB,
		payload: userId
	}
}

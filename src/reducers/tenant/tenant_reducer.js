import {
	SET_TENANT_PROFILE,
} from '../../actions/action_types'

const INITIAL_STATE = {
	tenant_profile: null,
}

export default function (state = INITIAL_STATE, action) {
	switch (action.type) {
		case SET_TENANT_PROFILE:
			return {
				...state,
				tenant_profile: action.payload
			}
		default:
			return {
				...state
			}
	}
}

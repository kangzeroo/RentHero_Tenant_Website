import {
	SET_TENANT_PROFILE,
} from '../../actions/action_types'

const INITIAL_STATE = {
	tenant_profile: {
		// tenant_id: '99cc0669-f407-4470-bb26-5e43742e3758',
		// tenant_name: 'Jake Malliaros',
	},
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

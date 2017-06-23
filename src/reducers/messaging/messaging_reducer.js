import {
	SET_TENANT_PROFILE,
	ADD_MESSAGE,
	SELECT_CHAT_BUILDING,
	SELECT_CHAT_CHANNEL,
} from '../../actions/action_types'

const INITIAL_STATE = {
	all_messages: [],
}

export default function (state = INITIAL_STATE, action) {
	switch (action.type) {
		case SET_TENANT_PROFILE:
			return {
				...state,
				tenant_profile: action.payload
			}
		case ADD_MESSAGE:
			return {
				...state,
				all_messages: state.all_messages.concat(action.payload)
			}
		default:
			return {
				...state
			}
	}
}

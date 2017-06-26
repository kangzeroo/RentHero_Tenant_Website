import {
	ADD_MESSAGE,
	SELECT_CHAT_BUILDING,
	SELECT_CHAT_LANDLORD,
	SELECT_CHAT_CHANNEL,
	BACK_TO_CHAT_CHANNELS,
} from '../../actions/action_types'

const INITIAL_STATE = {
	all_messages: [],
	building_target: {
    // building_id: 25245921949,
		// building_type: 'highrise',
		// formatted_address: '1 Columbia',
  },
	landlord_target: {
    // landlord_id: '33cc0669-f407-4470-bb26-5e43742e3758',
		// landlord_name: 'Sage Living',
  },
	channel_target: {
		// channel_id: ''
	}
}

export default function (state = INITIAL_STATE, action) {
	switch (action.type) {
		case ADD_MESSAGE:
			return {
				...state,
				all_messages: state.all_messages.concat(action.payload)
			}
		case SELECT_CHAT_BUILDING:
			return {
				...state,
				building_target: action.payload
			}
		case SELECT_CHAT_LANDLORD:
			return {
				...state,
				landlord_target: action.payload
			}
		case SELECT_CHAT_CHANNEL:
			return {
				...state,
				channel_target: action.payload
			}
		case BACK_TO_CHAT_CHANNELS:
			return {
				...state,
				building_target: {},
				landlord_target: {},
				channel_target: {},
			}
		default:
			return {
				...state
			}
	}
}

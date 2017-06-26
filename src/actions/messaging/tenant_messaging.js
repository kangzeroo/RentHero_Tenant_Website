import {
	SEND_MESSAGE,
	ADD_MESSAGE,
	SELECT_CHAT_BUILDING,
	SELECT_CHAT_LANDLORD,
	SELECT_CHAT_CHANNEL,
	BACK_TO_CHAT_CHANNELS,
} from '../action_types'

// send a message via pouchdb
export const sendChatMessage = (msg) => {
	return (dispatch) => {
		dispatch({
			type: SEND_MESSAGE,
			payload: [msg]
		})
	}
}

// save a message to redux, from the global socket connection
export const addChatHistory = (msgs) => {
	return {
		type: ADD_MESSAGE,
		payload: msgs
	}
}

// select the chat channel that we are on
export const selectChatChannel = (message) => {
	return (dispatch) => {
		dispatch({
			type: SELECT_CHAT_CHANNEL,
			payload: {
				channel_id: message.channel_id,
			}
		})
		// select the building that we are chatting about
		dispatch({
			type: SELECT_CHAT_BUILDING,
			payload: {
				building_id: message.building_id,
				building_type: message.building_type,
				formatted_address: message.formatted_address,
			}
		})
		// select the landlord that we are chatting to
		dispatch({
			type: SELECT_CHAT_LANDLORD,
			payload: {
				landlord_id: message.landlord_id,
				landlord_name: message.landlord_name,
			}
		})
	}
}

// go back to the list of channels
export const backToChatChannels = () => {
	return (dispatch) => {
		dispatch({
			type: BACK_TO_CHAT_CHANNELS,
		})
	}
}

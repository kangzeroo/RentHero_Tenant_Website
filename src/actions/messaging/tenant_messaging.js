import {
	SEND_MESSAGE,
	ADD_MESSAGE,
} from '../action_types'

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

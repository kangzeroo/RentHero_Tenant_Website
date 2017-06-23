import {
  SELECT_BUILDING,
  SELECT_LANDLORD,
} from '../../actions/action_types'

const INITIAL_STATE = {
	current_building: {
    building_id: 25245921949
  },
  current_landlord: {
    landlord_id: '33cc0669-f407-4470-bb26-5e43742e3758'
  },
}

export default function (state = INITIAL_STATE, action) {
	switch (action.type) {
		case SELECT_BUILDING:
			return {
				...state,
				current_building: action.payload
			}
    case SELECT_LANDLORD:
			return {
				...state,
				current_landlord: action.payload
			}
		default:
			return {
				...state
			}
	}
}

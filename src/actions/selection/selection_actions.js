import {
  SELECT_BUILDING,
  SELECT_LANDLORD,
} from '../action_types'

export const selectBuilding = (building) => {
	return (dispatch) => {
		dispatch({
			type: SELECT_BUILDING,
			payload: building
		})
	}
}

export const selectLandlord = (landlord) => {
	return (dispatch) => {
		dispatch({
			type: SELECT_LANDLORD,
			payload: landlord
		})
	}
}

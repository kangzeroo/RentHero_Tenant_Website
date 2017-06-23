import { createLogger } from 'redux-logger'
import {

} from './actions/action_types'

const listOfBlacklisted = [
	
]

const filteredLogger = createLogger({
	predicate: (getState, action) => {
		let allow = false
		listOfBlacklisted.forEach((black) => {
			if (black === action.type) {
				allow = true
			}
		})
		return allow
	}
})

export default filteredLogger

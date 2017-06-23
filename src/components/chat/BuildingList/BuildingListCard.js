import React, { Component } from 'react'
import { connect } from 'react-redux'
import Radium from 'radium'
import PropTypes from 'prop-types'

class BuildingListCard extends Component {

	render() {
		return (
			<div style={comStyles().mainview}>
				BuildingListCard
			</div>
		)
	}
}

BuildingListCard.propTypes = {
  building_id: PropTypes.string.isRequired
}

BuildingListCard.defaultProps = {

}

const RadiumHOC = Radium(BuildingListCard)

function mapStateToProps(state) {
	return {

	}
}

export default connect(mapStateToProps, {})(RadiumHOC)

// ===============================

const comStyles = () => {
	return {
		mainview: {

		}
	}
}

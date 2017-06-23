import React, { Component } from 'react'
import { connect } from 'react-redux'
import Radium from 'radium'
import PropTypes from 'prop-types'


class Feature extends Component {

	render() {
		return (
			<div style={comStyles().mainview}>
				Feature
			</div>
		)
	}
}

Feature.propTypes = {

}

Feature.defaultProps = {

}

const RadiumHOC = Radium(Feature)

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

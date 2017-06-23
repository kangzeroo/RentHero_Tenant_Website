import React, { Component } from 'react'
import { connect } from 'react-redux'
import Radium from 'radium'
import PropTypes from 'prop-types'
import Chatbox from './ChatInterface/Chatbox'
import BuildingList from './BuildingList/BuildingList'


class ChatContainer extends Component {

	renderAppropriateView() {
		let view = null
		if (this.props.channel_id) {
			view = (
				<BuildingList />
			)
		} else {
			view = (
				<Chatbox
					id='Chatbox'
					tenant={this.props.tenant}
					hideChat={() => this.props.hideChat()}
					style={comStyles().chatbox}
				/>
			)
		}
		return view
	}

	render() {
		return (
			<div style={comStyles().container}>
				{
					this.renderAppropriateView()
				}
			</div>
		)
	}
}

ChatContainer.propTypes = {
	tenant: PropTypes.object,
	hideChat: PropTypes.func,
	chat_open: PropTypes.bool,
	building_id: PropTypes.string,
	channel_id: PropTypes.string,
}

ChatContainer.defaultProps = {
	chat_open: false,
	building_id: '',
	channel_id: '',
}

const RadiumHOC = Radium(ChatContainer)

function mapStateToProps(state) {
	return {

	}
}

export default connect(mapStateToProps, {})(RadiumHOC)

// ===============================

const comStyles = () => {
	return {
		container: {
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'flex-end',
			alignItems: 'flex-end',
			position: 'absolute',
			bottom: '50px',
			right: '50px'
		},
		chatbox: {
		},
		icon: {
		}
	}
}

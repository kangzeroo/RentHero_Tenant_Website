import React, { Component } from 'react'
import { connect } from 'react-redux'
import Radium from 'radium'
import PropTypes from 'prop-types'
import {
  xMidBlue
} from '../../../styles/base_colors'
import { sendChatMessage } from '../../../actions/messaging/tenant_messaging'
import ChatFeed from './ChatFeed'
import ChatInput from './ChatInput'

class Chatbox extends Component {

	render() {
		return (
			<div style={comStyles().container}>
        <div style={headerStyles().header}>
          <i className='ion-chevron-left' onClick={() => this.props.hideChat()} style={headerStyles().icon} />
          <p style={headerStyles().recipient_name}>Atlas Housing</p>
          <i className='ion-close-round' onClick={() => this.props.hideChat()} style={headerStyles().icon} />
        </div>
        <ChatFeed
          all_messages={this.props.all_messages}
          tenant={this.props.tenant}
        />
        <ChatInput
          tenant={this.props.tenant}
          landlord_id={this.props.landlord_id}
          building_id={this.props.building_id}
          sendChatMessage={this.props.sendChatMessage}
        />
			</div>
		)
	}
}

Chatbox.propTypes = {
  tenant: PropTypes.object,
  all_messages: PropTypes.array.isRequired,
  building_id: PropTypes.number.isRequired,
  landlord_id: PropTypes.string.isRequired,
  sendChatMessage: PropTypes.func.isRequired,
  hideChat: PropTypes.func.isRequired,
}

Chatbox.defaultProps = {
  tenant: null,
}

const RadiumHOC = Radium(Chatbox)

function mapStateToProps(state) {
	return {
    tenant: state.tenant.tenant_profile,
    all_messages: state.messages.all_messages,
    building_id: state.selection.current_building.building_id,
    landlord_id: state.selection.current_landlord.landlord_id,
	}
}

export default connect(mapStateToProps, {
  sendChatMessage,
})(RadiumHOC)

// ===============================

const comStyles = () => {
	return {
		container: {
      minWidth: '380px',
      maxWidth: '380px',
      height: '600px',
      margin: '0px 0px 20px 0px',
      border: `4px solid ${xMidBlue}`,
      borderRadius: '25px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative'
		},
	}
}

const headerStyles = () => {
  return {
    header: {
      // height: '50px',
      backgroundColor: xMidBlue,
      textAlign: 'center',
      flex: 1,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center'
    },
    recipient_name: {
      color: 'white',
      fontSize: '1.3rem',
      fontWeight: 'bold',
      fontFamily: `'Montserrat', 'sans-serif'`,
      margin: '10px',
      flex: 4
    },
    icon: {
      flex: 1
    }
  }
}

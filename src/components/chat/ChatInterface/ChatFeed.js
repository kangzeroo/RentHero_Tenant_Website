import React, { Component } from 'react'
import { connect } from 'react-redux'
import Radium from 'radium'
import PropTypes from 'prop-types'
import {
  xMidBlue
} from '../../../styles/base_colors'

class ChatFeed extends Component {

  componentDidMount() {
    this.scrollDown()
  }

  componentDidUpdate() {
    this.scrollDown()
  }

  scrollDown() {
    const objDiv = document.getElementById('chatfeed');
    objDiv.scrollTop = objDiv.scrollHeight;
  }

	render() {
    const { all_messages, tenant } = this.props
		return (
      <div id='chatfeed' style={chatlogStyles().chatlog}>
        {all_messages.map((msg) => {
          return (
            <div key={msg.message_id} style={chatlogStyles().messageRow}>
              {
                msg.sender_id === tenant.tenant_id
                ?
                <div style={chatlogStyles().messageMe}>
                  {msg.contents}
                </div>
                :
                <div style={chatlogStyles().messageThem}>
                  {msg.contents}
                </div>
              }
            </div>
          )
        })}
        <div style={chatlogStyles().status}></div>
      </div>
		)
	}
}

ChatFeed.propTypes = {
  all_messages: PropTypes.array,
  tenant: PropTypes.object.isRequired,
  socket_channels: PropTypes.array,
}

ChatFeed.defaultProps = {
  all_messages: [],
  socket_channels: []
}

const RadiumHOC = Radium(ChatFeed)

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


const chatlogStyles = () => {
  return {
    chatlog: {
      // alignSelf: 'stretch',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'scroll',
      padding: '15px 15px 20px 15px',
      flex: 7
    },
    messageRow: {
      margin: '5px',
      display: 'flex',
      height: 'auto',
      minHeight: '25px',
    },
    status: {
      height: '20px',
      width: '100%',
    },
    messageMe: {
      display: 'flex',
      backgroundColor: xMidBlue,
      padding: '5px',
      color: 'black',
      maxWidth: '80%',
      textAlign: 'flex-start',
      flexWrap: 'wrap',
      height: 'auto',
      wordWrap: 'break-word',
    },
    messageThem: {
      display: 'flex',
      backgroundColor: 'gray',
      padding: '5px',
      color: 'black',
      maxWidth: '80%',
      textAlign: 'flex-end',
      flexWrap: 'wrap',
      height: 'auto',
      wordWrap: 'break-word',
    }
  }
}

import React, { Component } from 'react'
import { connect } from 'react-redux'
import Radium from 'radium'
import PropTypes from 'prop-types'
import {
  xMidBlue
} from '../../../styles/base_colors'


class ChatIcon extends Component {

	render() {
		return (
			<div onClick={()=>this.props.toggleChatVisible()} style={comStyles().container}>
        {
          this.props.chat_open
          ?
          <img src='https://s3.amazonaws.com/rentburrow-images/data-image-png%3Bbase%E2%80%A6.png' style={comStyles().cancel} />
          :
          <img src='https://s3.amazonaws.com/rentburrow-images/happychat.png' style={comStyles().happychat} />
        }
			</div>
		)
	}
}

ChatIcon.propTypes = {
  chat_open: PropTypes.bool,
  toggleChatVisible: PropTypes.func.isRequired
}

ChatIcon.defaultProps = {
  chat_open: false
}

const RadiumHOC = Radium(ChatIcon)

function mapStateToProps(state) {
	return {

	}
}

export default connect(mapStateToProps, {})(RadiumHOC)

// ===============================

const comStyles = () => {
	return {
		container: {
      minHeight: '70px',
      minWidth: '70px',
      maxHeight: '70px',
      maxWidth: '70px',
      borderRadius: '50%',
      backgroundColor: xMidBlue,
      cursor: 'pointer',
      overflow: 'hidden'
		},
    happychat: {
      height: '50px',
      width: 'auto',
      margin: '10px 20px 10px 10px'
    },
    cancel: {
      height: '30px',
      width: 'auto',
      margin: '20px 20px 20px 20px'
    }
	}
}

import React, { Component } from 'react'
import { connect } from 'react-redux'
import Radium from 'radium'
import PropTypes from 'prop-types'
import Rx from 'rxjs'
import uuid from 'uuid'
import { Form, TextArea } from 'semantic-ui-react'
import {
  xMidBlue
} from '../../../styles/base_colors'

class ChatInput extends Component {

  constructor() {
    super()
    this.state = {
      inputText: '',
    }
  }

  componentDidMount() {
    // get a hold of our stream sources
    // const sendBtn = document.getElementById('sendBtn')
    const textInput = document.getElementById('textInput')

    // create a stream for each source
    // const sendBtnStream = Rx.Observable.fromEvent(sendBtn, 'click').map(e => true)
    const enterKeyPressedStream = Rx.Observable.fromEvent(textInput, 'keyup').filter(e => e.keyCode === 13)
    const textEnteredStream = Rx.Observable.fromEvent(textInput, 'keyup').map(e => e.target.value)

    // merge the sendBtnStream and the enterKeyPressedStream
    // const sendMessageStream = Rx.Observable.merge(sendBtnStream, enterKeyPressedStream)
    // our merged stream will allow for textEnteredStream until sendMessageStream occurs
    const mergedStream = textEnteredStream.takeUntil(enterKeyPressedStream)

    const onNext = (text) => {
      this.setState({ inputText: text, checked: true })
    }
    const onError = (err) => {
      console.log(err)
    }
    const onComplete = () => {
      // a channel_id is comprised of tenant_id + landlord_id + building_id
      const newMessage = {
        _id: uuid.v4(),
        message_id: uuid.v4(),
        sender_id: this.props.tenant.tenant_id,
        receiver_id: this.props.landlord_target.landlord_id,
        building_id: this.props.building_target.building_id,
        tenant_id: this.props.tenant.tenant_id,
        landlord_id: this.props.landlord_target.landlord_id,
        channel_id: `${this.props.tenant.tenant_id}_${this.props.landlord_target.landlord_id}_${this.props.building_target.building_id}`,
        contents: this.state.inputText,
        address: this.props.building_target.formatted_address,
        building_type: this.props.building_target.building_type,
        landlord_name: this.props.landlord_target.landlord_name,
        tenant_name: this.props.tenant.tenant_name,
      }
      this.setState({
        inputText: '',
        checked: false
      })
      this.props.sendChatMessage(newMessage)
      mergedStream.subscribe({
        next: onNext,
        error: onError,
        complete: onComplete
      })
    }

    mergedStream.subscribe({
      next: onNext,
      error: onError,
      complete: onComplete
    })
  }

  handleTyping(event) {
    this.setState({
      inputText: event.target.value
    })
  }

	render() {
    return (
      <Form>
        <TextArea
          id='textInput'
          autoHeight
          value={this.state.inputText}
          onChange={(e, v) => this.handleTyping(e)}
          placeholder='Send landlord a message'
        />
      </Form>
    )
	}
}

ChatInput.propTypes = {
  sendChatMessage: PropTypes.func.isRequired,
  building_target: PropTypes.object.isRequired,
  tenant: PropTypes.object.isRequired,
  landlord_target: PropTypes.object.isRequired,
}

ChatInput.defaultProps = {

}

const RadiumHOC = Radium(ChatInput)

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

const inputStyles = () => {
  return {
    input: {
      // height: 'auto',
      flex: 1,
      minHeight: '50px',
      minWidth: '380px',
      maxWidth: '380px',
      borderTop: `3px solid ${xMidBlue}`,
      position: 'absolute',
      bottom: '0px',
    },
    inputDiv: {
      position: 'relative',
      height: '100%',
    },
    textInput: {
      minHeight: '50px',
      fontFamily: 'sans-serif',
      fontSize: '14px',
      boxSizing: 'border-box',
      padding: '4px',
      border: '1px solid',
      overflow: 'hidden',
      width: '85%',
      height: '100%',
      position: 'absolute',
      resize: 'none',
      whiteSpace: 'normal',
      padding: '10px 20px 10px 20px',
    },
    textHeight: {
      minHeight: '50px',
      fontFamily: 'sans-serif',
      fontSize: '14px',
      boxSizing: 'border-box',
      padding: '4px',
      border: '1px solid',
      overflow: 'hidden',
      width: '85%',
      visibility: 'hidden',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
      overflowWrap: 'break-word',
      padding: '10px 20px 10px 20px',
    },
    sendBtn: {
      position: 'absolute',
      height: '20px',
      right: '8px',
      bottom: '8px',
      margin: '5px auto',
      border: '2px gray',
      borderRadius: '5px',
      fontSize: '1rem',
      color: 'gray',
      padding: '5px',
      cursor: 'pointer'
    }
  }
}

import React, { Component } from 'react'
import { connect } from 'react-redux'
import Radium from 'radium'
import PropTypes from 'prop-types'
import { Feed } from 'semantic-ui-react'
import {
  xMidBlue
} from '../../../styles/base_colors'
import BuildingListCard from './BuildingListCard'
import { selectChatChannel } from '../../../actions/messaging/tenant_messaging'

class BuildingList extends Component {

  constructor() {
    super()
    this.state = {
      latest_messages: []
    }
  }

  componentDidMount() {
    this.sortMessages(this.props.all_messages)
  }

  componentWillUpdate(prevProps, prevState) {
    if (prevProps.all_messages !== this.props.all_messages) {
      this.sortMessages(this.props.all_messages)
    }
  }

  // take all messages and sort into channels
  sortMessages(all_messages) {
    // first collect a list of all the unique channels
    const channels = []
    all_messages.forEach((message) => {
      let exists = false
      channels.forEach((channel) => {
        if (message.channel_id === channel.channel_id) {
          exists = true
        }
      })
      if (!exists) {
        channels.push(message)
      }
    })
    // then create a chat history list for each unique channel, and put all histories into a master list
    // each chat history is ordered by date sent, with latest first
    const latest_messages = []
    channels.forEach((channel) => {
      const sorted_messages_per_channel = all_messages.filter((message) => {
        return message.channel_id === channel.channel_id
      }).sort((a, b) => {
        return b.sent_at - a.sent_at
      })
      latest_messages.push(sorted_messages_per_channel)
    })
    // and then the list of lists is ordered by most recent unread messages first
    // latest_messages.sort((a, b) => {
    //   return
    // })
    // and save to the internal state
    this.setState({
      latest_messages: latest_messages
    })
  }

  // generate the name of the person you are talking to
  // if you are a tenant, then the label should be the landlord
  generateLabel(message) {
    let label = message.landlord_name
    if (message.sender_id === message.landlord_id) {
      label = message.tenant_name
    }
    return label
  }

	render() {
		return (
      <div id='building_list' style={comStyles().container}>
        <Feed style={feedStyles().feed}>
          {
            this.state.latest_messages.map((messages) => {
              const message = messages[0]
              return (
                <div key={message.channel_id} role='menuitem' onClick={() => this.props.selectChatChannel(message)} style={feedStyles().item}>
                  <Feed.Event>
                    <Feed.Label image={message.building_type === 'House' ? require('../../../../assets/icons/house.png') : require('../../../../assets/icons/apartment.png')} />
                    <Feed.Content>
                      <Feed.Label content={this.generateLabel(message)} />
                      <Feed.Date content='1 day ago' />
                      <Feed.Summary>
                        {message.content}
                      </Feed.Summary>
                    </Feed.Content>
                  </Feed.Event>
                </div>
              )
            })
          }
        </Feed>
      </div>
		)
	}
}

BuildingList.propTypes = {
  all_messages: PropTypes.array,
  selectChatChannel: PropTypes.func.isRequired,
}

BuildingList.defaultProps = {
  all_messages: []
}

const RadiumHOC = Radium(BuildingList)

function mapStateToProps(state) {
	return {
    all_messages: state.messaging.all_messages
	}
}

export default connect(mapStateToProps, {
  selectChatChannel,
})(RadiumHOC)

// ===============================

const comStyles = () => {
	return {
    container: {
      minWidth: '100%',
      minHeight: '100%',
      maxWidth: '100%',
      maxHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    },
	}
}

const feedStyles = () => {
  return {
    feed: {
      minWidth: '100%',
      minHeight: '100%',
      maxWidth: '100%',
      maxHeight: '100%',
      overflowY: 'scroll',
    },
    item: {
      minWidth: '100%',
      maxWidth: '100%',
      padding: '20px',
      cursor: 'pointer',
      ':hover': {
        backgroundColor: xMidBlue,
      }
    }
  }
}

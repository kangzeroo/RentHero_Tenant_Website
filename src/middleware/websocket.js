import socketio from 'socket.io-client'
import { MESSAGING_MICROSERVICE } from '../api/API_URLS'
import { CONNECT_WEBSOCKETS } from '../actions/action_types'
import { SetupWebsocketMessaging } from '../api/messaging/websockets_setup'
import { EstablishChatRelay } from '../api/messaging/message_stream'
import { ListenForNewChannels } from '../api/messaging/channel_stream'

// this middleware is to establish websocket connections for messaging
// our websocket lives here in rxjs observables
const establishWebSockets = (() => {
    let socket = null
    let all_channels = null

    // middleware has access to the redux store
    return store => next => action => {
      switch (action.type) {
        // Step 1: Connect to websockets
        case CONNECT_WEBSOCKETS:
          // Start a new connection to the server
          if (socket != null) {
            socket.close();
          }
          const userId = action.payload
        	// Set up the websocket connection
        	socket = socketio(MESSAGING_MICROSERVICE, { secure: true })
          // initilizes websocket connections and saves channels for this user to redux
          SetupWebsocketMessaging(socket, userId, store).then((channels) => {
              all_channels = channels
              // subscribes to all channels for this user as well as any new channels. saves to redux
              return ListenForNewChannels(socket, store)
            }).then(() => {
              // listens to messages incoming to channels and saves to redux
              return EstablishChatRelay(socket, all_channels, store)
            }).catch((err) => {
              console.log(err)
            })
          break;

        // This action is irrelevant to us, pass it on to the next middleware
        default:
          return next(action);
      }
    }
})()

export default establishWebSockets

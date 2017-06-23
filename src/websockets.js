import { SetupWebsocketMessaging } from './api/messaging/websockets_setup'
import { EstablishChatRelay } from './api/messaging/message_stream'
import { addMessageToRedux } from './actions/auth/tenant_auth'

const establishWebSockets = (store) => {
  SetupWebsocketMessaging().then((socket) => {
      return EstablishChatRelay(socket)
    }).then((messageStream) => {
      messageStream.subscribe({
        next: (msg) => store.dispatch(addMessageToRedux(msg)),
        error: (err) => console.log(err),
        complete: () => {}
      })
    })
}

export default establishWebSockets

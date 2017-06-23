import Rx from 'rxjs'

// an observable for subscribing to existing channels and listening in on new messages
export const EstablishChatRelay = (socket, allChannels, store) => {
  const p = new Promise((res, rej) => {
    Rx.Observable.create((observer) => {
      // subscribe to all existing channels
      allChannels.map((channel) => {
        console.log(channel)
        socket.emit('subscribe_channel', channel.channel_id)
      })
      // on each message received from server, we will save the message to redux
      // note that socket.io clients listen to all incoming requests, not specific to a channel
      // this means the sorting of messages to channels is done manually on client
      socket.on('message_from_server', (data) => {
        console.log(data)
        observer.next(data)
      })
    }).subscribe({
      next: (msg) => {},
      error: (err) => console.log(err),
      complete: () => {}
    })
    res()
  })
  return p
}

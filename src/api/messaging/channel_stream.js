import Rx from 'rxjs'

// we listen to new channels being made
// a new channel is made every time we initiate a new convo with a unique building/landlord combo
export const ListenForNewChannels = (socket, store) => {
  const p = new Promise((res, rej) => {
    Rx.Observable.create((observer) => {
      socket.on('new_channel', (channel) => {
        observer.next(channel)
			})
    }).subscribe({
      next: (channel) => {
        // subscribe to the channel in the backend server
        socket.emit('subscribe_channel', channel.channel_id)
      },
      error: (err) => console.log(err),
      complete: () => {}
    })
    res()
  })
  return p
}

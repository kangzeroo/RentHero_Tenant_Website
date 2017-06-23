import Rx from 'rxjs'

export const SetupWebsocketMessaging = (socket, userId, store) => {
	const p = new Promise((res, rej) => {
		// one obv for connecting to the server
		// step 1: client connects with server
		Rx.Observable.create((observer) => {
			// check for the next event
			socket.on('step1: identify client', (data) => {
				// data = {'socketId': socket.id, 'connectTime': Date.now()}
				console.log('1) connected to websockets')
				// step 2: send confirmation
				observer.next({
					data,
					userId
				})
			})
			// client disconnects
			socket.on('disconnect', (err) => {
				console.log(err)
				observer.complete()
			})
		})
		.subscribe({
		  next: ({ data, userId }) => {
		    // nextObj = {'socketId': socket.id, 'connectTime': Date.now()}
		    console.log('2) verifying client with server')
		    socket.emit('step2: client verified', { data, userId })
		  },
		  error: () => {},
		  complete: () => {
		    console.log('Client disconnected from websockets, goodbye!')
			}
		})
		// step3: handshake complete
		socket.on('step3: handshake complete', (data) => {
		 console.log('3) handshake completed')
		 res(data.channels)
		})
	})
	return p
}

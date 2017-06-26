import PouchDB from 'pouchdb-browser'
import Rx from 'rxjs'
import {
  SEND_MESSAGE,
  ADD_MESSAGE,
  INITIATE_POUCHDB,
} from '../actions/action_types'
import { addChatHistory } from '../actions/messaging/tenant_messaging'
import { InitializePouchDb, SendMessage, getMessagesFromChannels } from '../api/messaging/pouchdb_api'

// allows for mango queries
PouchDB.plugin(require('pouchdb-find'))

// The PouchDB Connection
let Message_DB
// The PouchDB changes event
let changes
// The PouchDB changes observable
let MessageDBChanges

const connectPouchDB = (userId) => {
  const p = new Promise((res, rej) => {
    InitializePouchDb(userId).then((db_id) => {
      const _Message_DB = new PouchDB(`http://localhost:5984/${db_id}`, {
        ajax: {
          // retry HTTP for 60 seconds before throwing fatal disconnect error
          timeout: 60000
        }
      })
      const _changes = _Message_DB.changes({
        live: true,
        include_docs: true,
        since: 'now'
      })
      const _MessageDBChanges = Rx.Observable.create((observer) => {
        _changes.on('change', (change) => observer.next(change))
        _changes.on('error', (error) => observer.error(error))
        _changes.on('complete', (info) => observer.complete(info))
      }).share()
      res({
        _Message_DB,
        _MessageDBChanges,
        _changes
      })
    })
  })
  return p
}

// this middleware is to establish websocket connections for messaging
// our websocket lives here in rxjs observables
const establishPouchDb = (() => {

    // middleware has access to the redux store
    return store => next => action => {
      switch (action.type) {
        case INITIATE_POUCHDB:
          const user_id = action.payload
          // grab the right channels for this user
          connectPouchDB(user_id).then(({ _Message_DB, _MessageDBChanges, _changes }) => {
            Message_DB = _Message_DB
            MessageDBChanges = _MessageDBChanges
            changes = _changes
            // grab messages for this user
            getMessagesFromChannels(_Message_DB, user_id).then((data) => {
              store.dispatch(addChatHistory(data.docs))
            })
            // listen to every change of messages
            MessageDBChanges.subscribe({
              next: (changed) => {
                if(changed && changed.doc && changed.doc.message_id){
                  store.dispatch({
                    type: ADD_MESSAGE,
                    payload: [changed.doc]
                  })
                }
              }
            })
          })
          break;

          // any messages will also get emitted to socket.io server
        case SEND_MESSAGE:
          if (action.payload) {
            SendMessage(action.payload).then((response) => {
              // handle response
              console.log(response)
            }).catch((err) => {
              console.log(err)
            })
            next(action)
          }

        // This action is irrelevant to us, pass it on to the next middleware
        default:
          return next(action);
      }
    }
})()

export default establishPouchDb

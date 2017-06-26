import axios from 'axios'
import { MESSAGING_MICROSERVICE } from '../API_URLS'

export const InitializePouchDb = (userId) => {
  const p = new Promise((res, rej) => {
    axios.post(`${MESSAGING_MICROSERVICE}/pouchdb`, { userId }).then((data) => {
      res(data.data.db_name)
    }).catch((err) => {
      console.log(err)
    })
  })
  return p
}

export const getMessagesFromChannels = (db, user_id) => {
  const p = new Promise((res, rej) => {
    db.createIndex({
      index: { fields: ['sent_at', 'sender_id', 'receiver_id'] }
    }).then((data) => {
      // we must first set the indexes used for pouchdb if we want to query through that key
      db.getIndexes().then(function (result) {
        // handle result
        const daysAgo300 = new Date().getTime()/1000 - (60*60*24*300)
        const results = db.find({
          selector: {
            $and: [
              {
                sent_at: { $gt: daysAgo300 }
              },
              {
                $or: [
                  { sender_id: { $eq: user_id } },
                  { receiver_id: { $eq: user_id } },
                ]
              }
            ]
          },
          fields: [
            '_id',
            'sender_id',
            'receiver_id',
            'contents',
            'sent_at',
            'message_id',
            'channel_id',
            'address',
            'building_id',
            'building_type',
            'landlord_id',
            'landlord_name',
            'tenant_name',
            'seen_at',
          ],
          // sort: [
          //   { sent_at: 'asc' }
          // ]
        })
        res(results)
      }).catch(function (err) {
        console.log(err);
      });
    })
  })
  return p
}

export const SendMessage = (messages) => {
  const p = new Promise((res, rej) => {
    axios.post(`${MESSAGING_MICROSERVICE}/message`, messages[0]).then((data) => {
      // console.log(data)
    })
  })
  return p
}

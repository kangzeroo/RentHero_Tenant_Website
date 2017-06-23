import {PIPELINE_MICROSERVICE} from '../API_URLS'
import axios from 'axios'
import CryptoJS from "crypto-js"
import uuid from 'uuid'

export function submitActivities(trackedActivities, geoCoords){
  const p = new Promise((res, rej)=>{
    let user_gps = []
    if(geoCoords){
      user_gps = JSON.stringify( [parseFloat(geoCoords[0]), parseFloat(geoCoords[1]) ])
    }

    const mappedTrackedActivities = trackedActivities.map((a)=>{
      if(a && a.Item && a.Item.USER_GPS && a.Item.USER_GPS[0] && a.Item.USER_GPS[1]){
        return a
      }else if(a && a.Item){
        a.Item.USER_GPS = user_gps
        return a
      }
    })

    // console.log(trackedActivities)
    const x = JSON.stringify(mappedTrackedActivities)
    const encryptedText = CryptoJS.AES.encrypt(x, 'heartbeatIsStronk').toString()

    axios.post(PIPELINE_MICROSERVICE+"/websocket", {heartbeat: encryptedText})
      .then((data)=>{
        // console.log(data)
        res()
      })
      .catch((err)=>{
        // console.log(err)
        rej()
      })
  })
  return p
}


export function createActivityItem(type, action, subject, currentUser, geoCoords, extraDetails){
  // console.log(geoCoords)
  // console.log(action)
  // console.log(subject)
  // console.log(currentUser)
  if(currentUser){
    if(type=='SUBLET' || type =='LEASE' || type == 'PROPERTY'){
      if(subject.company){
        // assume its a lease
        return generateLeaseItem(action, subject, currentUser, geoCoords, extraDetails)
      }else if(subject.core){
        return generatePropertyItem(action, subject, currentUser, geoCoords, extraDetails)
      }else{
      // otherwise its a sublet
        return generateSubletItem(action, subject, currentUser, geoCoords, extraDetails)
      }
    }
    if(type=='APP'){
      return generateAppItem(action, currentUser, geoCoords, extraDetails)
    }
  }else{
    if(type=='LANDLORD'){
      return generateLandlordItem(action, subject, geoCoords, extraDetails)
    }
  }
}

function generatePropertyItem(action, property, fbUser, geoCoords, extraDetails){
  // console.log(action)
  const unixDate = new Date().getTime() /1000
  let prop_gps
  if(property.coords){
    prop_gps = JSON.stringify([property.coords[1], property.coords[0]])
  } // switch from mongodb [lng, lat] to standard [lat, lng]
  let user_gps
  if(geoCoords){
    user_gps = JSON.stringify( [parseFloat(geoCoords[1]), parseFloat(geoCoords[0]) ])
  }
  const id = uuid.v4()
  let EXTRA_DETAILS = {}
  if(extraDetails){
    EXTRA_DETAILS.EXTRA_DETAILS = JSON.stringify(extraDetails)
  }
  return {
    TableName: "RentBurrow-Leases",
    Item: {
      ID: id,
      LEASE_ID: property.meta.property_id,
      PLACE_ID: property.core.place_id,
      ACTION: action,
      DATE: unixDate,
      USER_FB_ID: fbUser ? fbUser.id : "Unauth_User",
      OWNER_ID: property.core.owner_id,
      PROP_GPS: prop_gps,
      USER_GPS: user_gps,
      ADDRESS: property.core.formatted_address,
      ...EXTRA_DETAILS
    }
  }
}

function generateSubletItem(action, property, fbUser, geoCoords, extraDetails){
  const unixDate = new Date().getTime() /1000
  let prop_gps
  if(property.coords){
    prop_gps = JSON.stringify([property.coords[1], property.coords[0]])
  } // switch from mongodb [lng, lat] to standard [lat, lng]
  let user_gps
  if(geoCoords){
    user_gps = JSON.stringify( [parseFloat(geoCoords[1]), parseFloat(geoCoords[0]) ])
  }
  const id = uuid.v4()
  let EXTRA_DETAILS = {}
  if(extraDetails){
    EXTRA_DETAILS.EXTRA_DETAILS = JSON.stringify(extraDetails)
  }
  // console.log(property)
  return {
    TableName: "RentBurrow-Sublets",
    Item: {
      ID: id,
      PLACE_ID: property.place_id,
      SUBLET_ID: property._id,
      ACTION: action,
      DATE: unixDate,
      USER_FB_ID: fbUser.id,
      OWNER_ID: property.userid,
      PROP_GPS: prop_gps,
      USER_GPS: user_gps,
      ADDRESS: property.address,
      ...EXTRA_DETAILS
    }
  }
}

function generateLeaseItem(action, property, fbUser, geoCoords, extraDetails){
  const unixDate = new Date().getTime() /1000
  let prop_gps
  if(property.coords){
    prop_gps = JSON.stringify([property.coords[1], property.coords[0]])
    // console.log(prop_gps)
  }   // switch from mongodb [lng, lat] to standard [lat, lng]
  let user_gps
  if(geoCoords){
    user_gps = JSON.stringify([parseFloat(geoCoords[1]), parseFloat(geoCoords[0]) ])
  }
  const id = uuid.v4()
  let EXTRA_DETAILS = {}
  if(extraDetails){
    EXTRA_DETAILS.EXTRA_DETAILS = JSON.stringify(extraDetails)
  }
  // console.log(property)
  return {
    TableName: "RentBurrow-Leases",
    Item: {
      ID: id,
      LEASE_ID: property._id,
      PLACE_ID: property.place_id,
      ACTION: action,
      DATE: unixDate,
      USER_FB_ID: fbUser.id,
      OWNER_ID: property.landlord_id,
      PROP_GPS: prop_gps,
      USER_GPS: user_gps,
      ADDRESS: property.address,
      ...EXTRA_DETAILS
    }
  }
}

function generateLandlordItem(action, landlord, geoCoords, extraDetails){
  const unixDate = new Date().getTime() /1000
  let user_gps
  if(geoCoords){
    user_gps = JSON.stringify([parseFloat(geoCoords[1]), parseFloat(geoCoords[0]) ])
  }
  const id = uuid.v4()
  let EXTRA_DETAILS = {}
  if(extraDetails){
    EXTRA_DETAILS.EXTRA_DETAILS = JSON.stringify(extraDetails)
  }
  return {
    TableName: "RentBurrow-Landlords",
    Item: {
      ID: id,
      LANDLORD_ID: landlord.id,
      ACTION: action,
      DATE: unixDate,
      USER_GPS: user_gps,
      ...EXTRA_DETAILS
    }
  }
}

function generateAppItem(action, fbUser, geoCoords, extraDetails){
  const unixDate = new Date().getTime() /1000
  let user_gps = []
  if(geoCoords){
    user_gps = JSON.stringify([parseFloat(geoCoords[1]), parseFloat(geoCoords[0]) ])
  }
  const id = uuid.v4()
  let EXTRA_DETAILS = {}
  if(extraDetails){
    EXTRA_DETAILS.EXTRA_DETAILS = JSON.stringify(extraDetails)
  }
  return {
    TableName: "RentBurrow-App",
    Item: {
      ID: id,
      ACTION: action,
      USER_FB_ID: fbUser.id,
      USER_GPS: user_gps,
      DATE: unixDate,
      ...EXTRA_DETAILS
    }
  }
}




const subletItems = [
    {
      "TableName": "RentBurrow-Sublets",
      "Item": {
          "SUBLET_ID":"000000010",
          "ACTION":"CARD_ON_HOVER",
          "DATE":1474416000,
          "USER_FB_ID": "000020000",
          "OWNER_ID": "000050000",
          "PROP_GPS": "[1, -1]",
          "USER_GPS": "[1, -1]"
      }
    },
    {
      "TableName": "RentBurrow-Sublets",
      "Item": {
          "SUBLET_ID":"000000060",
          "ACTION":"CARD_FAVORITED",
          "DATE":1474416000,
          "USER_FB_ID": "000500000",
          "OWNER_ID": "000020000",
          "PROP_GPS": "[1, -1]",
          "USER_GPS": "[1, -1]"
      }
    },
    {
      "TableName": "RentBurrow-Sublets",
      "Item": {
          "SUBLET_ID":"0000002000",
          "ACTION":"CARD_UNFAVORITED",
          "DATE":1474416000,
          "USER_FB_ID": "0005000000",
          "OWNER_ID": "0002000000",
          "PROP_GPS": "[1, -1]",
          "USER_GPS": "[1, -1]"
      }
    },
    {
      "TableName": "RentBurrow-Sublets",
      "Item": {
          "SUBLET_ID":"0000060000",
          "ACTION":"CARD_MAP_BUTTON",
          "DATE":1474416000,
          "USER_FB_ID": "0000070000",
          "OWNER_ID": "0000040000",
          "PROP_GPS": "[1, -1]",
          "USER_GPS": "[1, -1]"
      }
    },
    {
      "TableName": "RentBurrow-Sublets",
      "Item": {
          "SUBLET_ID":"00000009600",
          "ACTION":"CARD_ORIGINAL_BUTTON",
          "DATE":1474416000,
          "USER_FB_ID": "0000rey00000",
          "OWNER_ID": "000sdfg00000",
          "PROP_GPS": "[1, -1]",
          "USER_GPS": "[1, -1]"
      }
    },
    {
      "TableName": "RentBurrow-Sublets",
      "Item": {
          "SUBLET_ID":"00sdfg0000",
          "ACTION":"PIN_CLICK",
          "DATE":1474416000,
          "USER_FB_ID": "000sdfg00fg000",
          "OWNER_ID": "0sfg000000",
          "PROP_GPS": "[1, -1]",
          "USER_GPS": "[1, -1]"
      }
    }
]

const leaseItems = [
  {
    "TableName": "RentBurrow-Leases",
    "Item": {
        "LEASE_ID":"0000dsg000",
        "ACTION":"CARD_ON_HOVER",
        "DATE":1474416000,
        "USER_FB_ID": "000000dsfg00",
        "OWNER_ID": "00004h0000",
        "PROP_GPS": "[1, -1]",
        "USER_GPS": "[1, -1]"
    }
  },
  {
    "TableName": "RentBurrow-Leases",
    "Item": {
        "LEASE_ID":"00sg3f00000",
        "ACTION":"CARD_FAVORITED",
        "DATE":1474416000,
        "USER_FB_ID": "000fgjh000",
        "OWNER_ID": "000ert00000",
        "PROP_GPS": "[1, -1]",
        "USER_GPS": "[1, -1]"
    }
  },
  {
    "TableName": "RentBurrow-Leases",
    "Item": {
        "LEASE_ID":"00000ju000",
        "ACTION":"CARD_UNFAVORITED",
        "DATE":1474416000,
        "USER_FB_ID": "000sdf0000",
        "OWNER_ID": "00000k00",
        "PROP_GPS": "[1, -1]",
        "USER_GPS": "[1, -1]"
    }
  },
  {
    "TableName": "RentBurrow-Leases",
    "Item": {
        "LEASE_ID":"00sfgh00000",
        "ACTION":"CARD_MAP_BUTTON",
        "DATE":1474416000,
        "USER_FB_ID": "0000rth0000",
        "OWNER_ID": "0004500000",
        "PROP_GPS": "[1, -1]",
        "USER_GPS": "[1, -1]"
    }
  },
  {
    "TableName": "RentBurrow-Leases",
    "Item": {
        "LEASE_ID":"000v50000",
        "ACTION":"PIN_CLICK",
        "DATE":1474416000,
        "USER_FB_ID": "004b6j0000",
        "OWNER_ID": "0b47j00000",
        "PROP_GPS": "[1, -1]",
        "USER_GPS": "[1, -1]"
    }
  },
  {
    "TableName": "RentBurrow-Leases",
    "Item": {
        "LEASE_ID":"000yku000",
        "ACTION":"DETAILS_HOVER",
        "DATE":1474416000,
        "USER_FB_ID": "00sfgh0000",
        "OWNER_ID": "0000k8000",
        "PROP_GPS": "[1, -1]",
        "USER_GPS": "[1, -1]"
    }
  },
  {
    "TableName": "RentBurrow-Leases",
    "Item": {
        "LEASE_ID":"00mk0000",
        "ACTION":"IMAGE_VIEW",
        "DATE":1474416000,
        "USER_FB_ID": "000fng000",
        "OWNER_ID": "0004weds000",
        "PROP_GPS": "[1, -1]",
        "USER_GPS": "[1, -1]"
    }
  },
  {
    "TableName": "RentBurrow-Leases",
    "Item": {
        "LEASE_ID":"000byuk0000",
        "ACTION":"LEASE_REVIEW_VIEWED",
        "DATE":1474416000,
        "USER_FB_ID": "00000loi00",
        "OWNER_ID": "sdftr0000000",
        "PROP_GPS": "[1, -1]",
        "USER_GPS": "[1, -1]"
    }
  },
  {
    "TableName": "RentBurrow-Leases",
    "Item": {
        "LEASE_ID":"000fghb0000",
        "ACTION":"LEASE_REVIEW_POSTED",
        "DATE":1474416000,
        "USER_FB_ID": "0000fg000",
        "OWNER_ID": "00sfg0000",
        "PROP_GPS": "[1, -1]",
        "USER_GPS": "[1, -1]",
        "EXTRA_DETAILS": "JSON.Stringify(object)"
    }
  },
  {
    "TableName": "RentBurrow-Leases",
    "Item": {
        "LEASE_ID":"000000000",
        "ACTION":"INQUIRE_CLICK",
        "DATE":1474416000,
        "USER_FB_ID": "000sdfg000",
        "OWNER_ID": "0000dghs0000",
        "PROP_GPS": "[1, -1]",
        "USER_GPS": "[1, -1]"
    }
  },
  {
    "TableName": "RentBurrow-Leases",
    "Item": {
        "LEASE_ID":"000000000",
        "ACTION":"EMAIL_SENT",
        "DATE":1474416000,
        "USER_FB_ID": "000fgjh000",
        "OWNER_ID": "000sdfg00000",
        "PROP_GPS": "[1, -1]",
        "USER_GPS": "[1, -1]",
        "EXTRA_DETAILS": "JSON.Stringify(object)"
    }
  },
  {
    "TableName": "RentBurrow-Leases",
    "Item": {
        "LEASE_ID":"000000000",
        "ACTION":"LEASE_REVIEW_VIEWED",
        "DATE":1474416000,
        "USER_FB_ID": "000fgjh000",
        "OWNER_ID": "000sdfg00000",
        "PROP_GPS": "[1, -1]",
        "USER_GPS": "[1, -1]",
    }
  },
  {
    "TableName": "RentBurrow-Leases",
    "Item": {
        "LEASE_ID":"000000000",
        "ACTION":"LEASE_REVIEW_POSTED",
        "DATE":1474416000,
        "USER_FB_ID": "000fgjh000",
        "OWNER_ID": "000sdfg00000",
        "PROP_GPS": "[1, -1]",
        "USER_GPS": "[1, -1]",
        "EXTRA_DETAILS": "JSON.Stringify(object)"
    }
  }
]

const landlordItems = [
  {
    "TableName": "RentBurrow-Landlords",
    "Item": {
        "LANDLORD_ID":"000000000",
        "ACTION":"LOGGED_IN",
        "DATE":1474416000,
        "USER_GPS": "[1, -1]"
    }
  },
  {
    "TableName": "RentBurrow-Landlords",
    "Item": {
        "LANDLORD_ID":"000000000",
        "ACTION":"LOGGED_OUT",
        "DATE":1474416000,
        "USER_GPS": "[1, -1]"
    }
  },
  {
    "TableName": "RentBurrow-Landlords",
    "Item": {
        "LANDLORD_ID":"000000000",
        "ACTION":"EMAIL_VIEWED",
        "DATE":1474416000,
        "USER_GPS": "[1, -1]"
    }
  },
  {
    "TableName": "RentBurrow-Landlords",
    "Item": {
        "LANDLORD_ID":"000000000",
        "ACTION":"NEW_PROPERTY",
        "DATE":1474416000,
        "USER_FB_ID": "0000fg000",
        "USER_GPS": "[1, -1]",
        "EXTRA_DETAILS": "JSON.Stringify(object)"
    }
  },
  {
    "TableName": "RentBurrow-Landlords",
    "Item": {
        "LANDLORD_ID":"000000000",
        "ACTION":"PROPERTY_EDITED",
        "DATE":1474416000,
        "USER_FB_ID": "0000fg000",
        "USER_GPS": "[1, -1]",
        "EXTRA_DETAILS": "JSON.Stringify(object)"
    }
  },
  {
    "TableName": "RentBurrow-Landlords",
    "Item": {
        "LANDLORD_ID":"000000000",
        "ACTION":"LANDLORD_REVIEW_VIEWED",
        "DATE":1474416000,
        "USER_FB_ID": "sadljfasdfsfs",
        "USER_GPS": "[1, -1]",
        "EXTRA_DETAILS": "JSON.stringify(object)"
    }
  },
  {
    "TableName": "RentBurrow-Landlords",
    "Item": {
        "LANDLORD_ID":"000000000",
        "ACTION":"LANDLORD_REVIEW_POSTED",
        "DATE":1474416000,
        "USER_FB_ID": "0000fg000",
        "USER_GPS": "[1, -1]",
        "EXTRA_DETAILS": "JSON.Stringify(object)"
    }
  },
  {
    "TableName": "RentBurrow-App",
    "Item": {
        "LANDLORD_ID":"000000000",
        "ACTION":"LINK_TO_WEBSITE",
        "DATE":1474416000,
        "USER_FB_ID": "0000fg000",
        "USER_GPS": "[1, -1]",
    }
  },
  {
    "TableName": "RentBurrow-App",
    "Item": {
        "LANDLORD_ID":"000000000",
        "ACTION":"LINK_TO_PROFILE",
        "DATE":1474416000,
        "USER_FB_ID": "0000fg000",
        "USER_GPS": "[1, -1]",
    }
  }
]

const rentburrowItems = [
  {
    "TableName": "RentBurrow-App",
    "Item": {
        "ACTION":"LOGGED_IN",
        "USER_FB_ID": "00000dfgh000",
        "USER_GPS": "[1, -1]",
        "DATE":1474416000,
    }
  },
  {
    "TableName": "RentBurrow-App",
    "Item": {
        "ACTION":"SET_CITY",
        "USER_FB_ID": "00000dfgh000",
        "USER_GPS": "[1, -1]",
        "DATE":1474416000,
    }
  },
  {
    "TableName": "RentBurrow-App",
    "Item": {
        "ACTION":"SUBLET_VIEW",
        "USER_FB_ID": "00000dfgh000",
        "USER_GPS": "[1, -1]",
        "DATE":1474416000,
    }
  },
  {
    "TableName": "RentBurrow-App",
    "Item": {
        "ACTION":"LEASE_VIEW",
        "USER_FB_ID": "00000dfgh000",
        "USER_GPS": "[1, -1]",
        "DATE":1474416000,
    }
  },
  {
    "TableName": "RentBurrow-App",
    "Item": {
        "ACTION":"PRIVACY_POLICY_VIEWED",
        "USER_FB_ID": "00000dfgh000",
        "USER_GPS": "[1, -1]",
        "DATE":1474416000,
    }
  },
  {
    "TableName": "RentBurrow-App",
    "Item": {
        "ACTION":"CHANGE_CITY",
        "USER_FB_ID": "00000dfgh000",
        "USER_GPS": "[1, -1]",
        "DATE":1474416000,
    }
  },
  {
    "TableName": "RentBurrow-App",
    "Item": {
        "ACTION":"STRING_SEARCH",
        "USER_FB_ID": "00000dfgh000",
        "USER_GPS": "[1, -1]",
        "DATE":1474416000,
        "EXTRA_DETAILS": "JSON.Stringify(object)"
    }
  },
  {
    "TableName": "RentBurrow-App",
    "Item": {
        "ACTION":"LOGGED_OUT",
        "USER_FB_ID": "00000dfgh000",
        "USER_GPS": "[1, -1]",
        "DATE":1474416000,
        "EXTRA_DETAILS": "JSON.Stringify(object)"
    }
  },
  {
    "TableName": "RentBurrow-App",
    "Item": {
        "ACTION":"GO_TO_SETTINGS",
        "USER_FB_ID": "00000dfgh000",
        "USER_GPS": "[1, -1]",
        "DATE":1474416000,
        "EXTRA_DETAILS": "JSON.Stringify(object)"
    }
  },
  {
    "TableName": "RentBurrow-App",
    "Item": {
        "ACTION":"GO_TO_FAVORITES",
        "USER_FB_ID": "00000dfgh000",
        "USER_GPS": "[1, -1]",
        "DATE":1474416000,
        "EXTRA_DETAILS": "JSON.Stringify(object)"
    }
  },
  {
    "TableName": "RentBurrow-App",
    "Item": {
        "ACTION":"GO_TO_POST_SUBLET",
        "USER_FB_ID": "00000dfgh000",
        "USER_GPS": "[1, -1]",
        "DATE":1474416000,
        "EXTRA_DETAILS": "JSON.Stringify(object)"
    }
  },
  {
    "TableName": "RentBurrow-App",
    "Item": {
        "ACTION":"POST_SUBLET",
        "USER_FB_ID": "00000dfgh000",
        "USER_GPS": "[1, -1]",
        "DATE":1474416000,
        "EXTRA_DETAILS": "JSON.Stringify(object)"
    }
  },
  {
    "TableName": "RentBurrow-App",
    "Item": {
        "ACTION":"SUBLET_UPDATED",
        "USER_FB_ID": "00000dfgh000",
        "PROP_GPS": "[1, -1]",
        "DATE":1474416000,
        "EXTRA_DETAILS": "JSON.Stringify(object)"
    }
  },
  {
    "TableName": "RentBurrow-App",
    "Item": {
        "ACTION":"ADVANCED_SUBLET_SEARCH",
        "USER_FB_ID": "000sdfg00000",
        "DATE":1474416000,
        "USER_GPS": "[1, -1]",
        "EXTRA_DETAILS": "JSON.Stringify(object)"
    }
  },
  {
    "TableName": "RentBurrow-App",
    "Item": {
        "ACTION":"ADVANCED_LEASE_SEARCH",
        "USER_FB_ID": "000sdfg00000",
        "DATE":1474416000,
        "USER_GPS": "[1, -1]",
        "EXTRA_DETAILS": "JSON.Stringify(object)"
    }
  }
]

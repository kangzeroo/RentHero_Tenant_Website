import uuid from 'uuid'
import Cookies from 'js-cookie'

export const GrabTenantIdFromCookie = () => {
  const p = new Promise((res, rej) => {
    const user_id = Cookies.get('userId')
    // const user_id = parseInt(userId)
		if (user_id) {
			res(user_id)
		} else {
      // const newUserId = Math.floor(Math.random() * 9999999999);
      const newUserId = uuid.v4()
			console.log(`Created new user with id ${newUserId}`)
			Cookies.set('userId', newUserId, { expires: 500 });
			res(newUserId)
		}
  })
  return p
}

import FriskisApiWrapper from 'friskis-js-api-wrapper'

const book = function (activityid, options) {
  const {
    apikey,
    username,
    password
  } = options
  return new Promise((resolve, reject) => {
    FriskisApiWrapper.createBooking({
      apikey,
      username,
      password,
      activityid
    })
    .then((response) => {
      const bookingId = response.activitybooking.id
      resolve(`Booked activity with booking id ${bookingId}`)
    })
    .catch((e) => {
      reject(e)
    })
  })
}

export default book

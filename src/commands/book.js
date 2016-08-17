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
      resolve(`Booked activity with id ${activityid}`)
    })
    .catch((e) => {
      reject(e)
    })
  })
}

export default book

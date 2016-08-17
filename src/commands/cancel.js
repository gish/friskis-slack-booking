import FriskisApiWrapper from 'friskis-js-api-wrapper'

const cancel = function (id, options) {
  const {
    apikey,
    username,
    password
  } = options
  return new Promise((resolve, reject) => {
    FriskisApiWrapper.deleteBooking({
      apikey,
      username,
      password,
      id,
      type: 'ordinary'
    })
    .then((response) => {
      resolve(`Cancelled activity with booking id ${id}`)
    })
    .catch((e) => {
      reject(e)
    })
  })
}

export default cancel

const book = (apiWrapper) => (activityid) => {
  return new Promise((resolve, reject) => {
    apiWrapper.createBooking({
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

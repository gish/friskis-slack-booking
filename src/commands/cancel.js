const cancel = (apiWrapper) => (id) => {
  return new Promise((resolve, reject) => {
    apiWrapper.deleteBooking({
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

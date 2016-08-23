import moment from 'moment'
import textTable from 'text-table'

const list = (apiWrapper) => () => {
  return new Promise((resolve, reject) => {
    apiWrapper.getBookings()
    .then((response) => {
      console.log(response)
      const bookings = response.activitybookings.activitybooking
      .map((booking) => {
        const bookingId = booking.id
        const startTime = booking.start.timepoint.datetime
        const dayOfWeek = moment(startTime).format('dddd')
        const time = moment(startTime).format('HH:mm')
        const activityName = booking.activity.product.name

        return [
          bookingId,
          dayOfWeek,
          time,
          activityName
        ]
      })

      if (bookings.length === 0) {
        resolve('No active bookings')
      }

      const table = textTable(bookings)
      const spacedTable = `\`\`\`${table.toString()}\`\`\``
      resolve(spacedTable)
    })
  })
}

export default list

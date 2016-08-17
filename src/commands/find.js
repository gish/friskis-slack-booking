import moment from 'moment'
import textTable from 'text-table'
import FriskisApiWrapper from 'friskis-js-api-wrapper'

const find = function (search, options) {
  const {
    apikey,
    username,
    password,
    startDate,
    endDate,
    businessunitids
  } = options
  return new Promise((resolve, reject) => {
    FriskisApiWrapper.getActivities({
      apikey,
      username,
      password,
      startDate,
      endDate,
      businessunitids
    })
    .then((response) => {
      const searchParam = search.toLowerCase()
      const activities = response.activities.activity
      const foundActivities = activities.filter((activity) => {
        const name = activity.product.name.toLowerCase()
        const bookableSlots = parseInt(activity.bookableslots, 10)

        return name.indexOf(searchParam) !== -1 && bookableSlots > 0
      })
      .map((activity) => {
        const startTime = activity.start.timepoint.datetime
        const dayOfWeek = moment(startTime).format('dddd')
        const time = moment(startTime).format('HH:mm')
        const formattedStartTime = `${dayOfWeek} ${time}`

        return [
          activity.id,
          formattedStartTime,
          activity.product.name,
          activity.bookableslots
        ]
      })

      if (foundActivities.length === 0) {
        resolve('No activities found')
      }

      const table = textTable([['id', 'Time', 'Name', '#slots'], ...foundActivities])
      resolve(table.toString())
    })
  })
}

export default find

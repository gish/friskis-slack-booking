import bodyParser from 'body-parser'
import express from 'express'
import moment from 'moment'
import request from 'request'
import textTable from 'text-table'
import FriskisApiWrapper from 'friskis-js-api-wrapper'

const PORT = process.env.PORT
const SLACK_TOKEN = process.env.SLACK_TOKEN
const FRISKIS_API_KEY = process.env.FRISKIS_API_KEY
const FRISKIS_USERNAME = process.env.FRISKIS_USERNAME
const FRISKIS_PASSWORD = process.env.FRISKIS_PASSWORD

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const findActivities = function (search) {
  return new Promise((resolve, reject) => {
    FriskisApiWrapper.getActivities({
      apikey: FRISKIS_API_KEY,
      username: FRISKIS_USERNAME,
      password: FRISKIS_PASSWORD,
      startDate: moment().add(0, 'days').format('YYYY-MM-DD'),
      endDate: moment().add(5, 'days').format('YYYY-MM-DD'),
      businessunitids: '1'
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
        return [
          activity.id,
          activity.start.timepoint.datetime,
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

const bookActivity = function (id) {
  return new Promise((resolve, reject) => {
    FriskisApiWrapper.createBooking({
      apikey: FRISKIS_API_KEY,
      username: FRISKIS_USERNAME,
      password: FRISKIS_PASSWORD,
      activityid: id
    })
    .then((response) => {
      resolve(`Booked activity with id ${id}`)
    })
    .catch((e) => {
      reject(e)
    })
  })
}

const runCommand = function (action, data) {
  const actions = {
    find: findActivities,
    book: bookActivity
  }

  if (actions[action]) {
    return actions[action](data)
  } else {
    return new Promise((resolve, reject) => {
      console.error('Unknown command')
      reject('Unknown command')
    })
  }
}

const sendDelayedReponse = function (responseUrl, params) {
  console.log(`Sends response to ${responseUrl}`)
  console.log(params)
  request.post({
    json: params,
    uri: responseUrl
  }, (error, response, body) => {
    if (error) {
      console.log(error)
    } else {
      console.log(body)
    }
  })
}

app.post('/', (req, res) => {
  const token = req.body.token
  const text = req.body.text
  const responseUrl = req.body.response_url
  const payload = text.match(/^([a-z]+) ([a-z0-9]+)$/).slice(1)
  const command = {
    action: payload[0],
    data: payload[1]
  }

  if (token !== SLACK_TOKEN) {
    console.log(`Unauthorized POST. Provided token: ${token}`)
    res.status(401)
    res.send({
      error: 'Unauthorized',
      message: 'Invalid Slack token'
    })
  }

  console.log(`Got command`, command)

  runCommand(command.action, command.data)
  .then((response) => {
    sendDelayedReponse(responseUrl, {
      text: response
    })
  })

  res.status(200)
  res.send(`Running ${command.action} with "${command.data}"...`)
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Slack token: ${SLACK_TOKEN}`)
})

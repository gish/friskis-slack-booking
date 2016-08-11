import bodyParser from 'body-parser'
import express from 'express'
import moment from 'moment'
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
      console.log(response, search)
      const searchParam = search.toLowerCase()
      console.log(response)
      const activities = response.activities.activity
      let foundActivities = activities.filter((activity) => {
        const name = activity.product.name.toLowerCase()

        return name.indexOf(searchParam) !== -1
      })
      console.log(foundActivities)
      foundActivities = foundActivities.map((activity) => {
        return {
          id: activity.id,
          starttime: activity.start.timepoint.datetime,
          name: activity.product.name,
          bookableslots: activity.bookableslots
        }
      })
      resolve(foundActivities)
    })
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

  findActivities(command.data)
  .then((response) => {
    // Send to response url
  })
  res.status(200)
  res.send(`Searching for "${command.data}"`)
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Slack token: ${SLACK_TOKEN}`)
})

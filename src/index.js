import bodyParser from 'body-parser'
import express from 'express'
import FriskisApiWrapper from 'friskis-js-api-wrapper'

const PORT = process.env.PORT
const SLACK_TOKEN = process.env.SLACK_TOKEN
const FRISKIS_API_KEY = process.env.FRISKIS_API_KEY
const FRISKIS_USERNAME = process.env.FRISKIS_USERNAME
const FRISKIS_PASSWORD = process.env.FRISKIS_PASSWORD

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.post('/', (req, res) => {
  const token = req.body.token
  const text = req.body.text
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

  FriskisApiWrapper.getActivities({
    apikey: FRISKIS_API_KEY,
    username: FRISKIS_USERNAME,
    password: FRISKIS_PASSWORD,
    startdate: '2016-09-09',
    enddate: '2016-09-09',
    businessunitids: '1'
  })
  .then((response) => {
    const searchParam = command.data.toLowerCase()
    const activities = response.activities.activity
    const foundActivities = activities.filter((activity) => {
      const name = activity.product.name.toLowerCase()

      return name.indexOf(searchParam) !== -1
    })
    .map((activity) => {
      return {
        id: activity.id,
        starttime: activity.start.timepoint.datetime,
        name: activity.product.name,
        bookableslots: activity.bookableslots
      }
    })

    res.status(200)
    res.send(foundActivities)
  })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Slack token: ${SLACK_TOKEN}`)
})

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
    const activities = response.activities.activity.map((activity) => {
      return activity.product.name
    })

    res.status(200)
    res.send(activities)
  })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Slack token: ${SLACK_TOKEN}`)
})

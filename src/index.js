import bodyParser from 'body-parser'
import express from 'express'
import moment from 'moment'
import request from 'request'

import commands from './commands'

const PORT = process.env.PORT
const SLACK_TOKEN = process.env.SLACK_TOKEN
const FRISKIS_API_KEY = process.env.FRISKIS_API_KEY
const FRISKIS_USERNAME = process.env.FRISKIS_USERNAME
const FRISKIS_PASSWORD = process.env.FRISKIS_PASSWORD

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const runCommand = function (action, data) {
  const actions = {
    find: (search) => commands.find(search, {
      apikey: FRISKIS_API_KEY,
      username: FRISKIS_USERNAME,
      password: FRISKIS_PASSWORD,
      startDate: moment().add(0, 'days').format('YYYY-MM-DD'),
      endDate: moment().add(5, 'days').format('YYYY-MM-DD'),
      businessunitids: '1'
    }),
    book: (activityid) => commands.book(activityid, {
      apikey: FRISKIS_API_KEY,
      username: FRISKIS_USERNAME,
      password: FRISKIS_PASSWORD
    }),
    cancel: (activityid) => commands.cancel(activityid, {
      apikey: FRISKIS_API_KEY,
      username: FRISKIS_USERNAME,
      password: FRISKIS_PASSWORD
    })
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

import bodyParser from 'body-parser'
import express from 'express'
import moment from 'moment'
import request from 'request'

import commands from './commands'

const PORT = process.env.PORT
const SLACK_TOKEN = process.env.SLACK_TOKEN

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const runCommand = (action, data) => {
  const actions = {
    find: (search) => commands.find(search, {
      startdate: moment().add(0, 'days').format('YYYY-MM-DD'),
      enddate: moment().add(5, 'days').format('YYYY-MM-DD'),
      businessunitids: '1'
    }),
    book: (activityid) => commands.book(activityid),
    cancel: (activityid) => commands.cancel(activityid),
    list: commands.list
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

const sendDelayedReponse = (responseUrl, params) => {
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

const getAction = (text) => {
  return text.match(/^([a-z]+)/).slice(1)[0]
}

const getActionData = (text) => {
  return /^([a-z]+) ([a-z0-9]+)$/.test(text) && text.match(/^([a-z]+) ([a-z0-9]+)$/).slice(2)[0]
}

app.post('/', (req, res) => {
  const token = req.body.token
  const text = req.body.text
  const responseUrl = req.body.response_url
  const command = {
    action: getAction(text),
    data: getActionData(text)
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

  let responseString = `Running ${command.action}`
  if (command.data) {
    responseString = `${responseString} with "${command.data}"`
  }
  responseString = `${responseString}...`

  res.status(200)
  res.send(responseString)
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Slack token: ${SLACK_TOKEN}`)
})

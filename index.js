import bodyParser from 'body-parser'
import dotenv from 'dotenv'
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
    const token = req.query.token
    const text = req.query.text

    if (token !== SLACK_TOKEN) {
        res.sendStatus(401)
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
})


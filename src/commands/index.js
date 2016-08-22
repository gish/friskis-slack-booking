import FriskisJsApiWrapper from 'friskis-js-api-wrapper'

import book from './book'
import cancel from './cancel'
import find from './find'

const FRISKIS_API_KEY = process.env.FRISKIS_API_KEY
const FRISKIS_USERNAME = process.env.FRISKIS_USERNAME
const FRISKIS_PASSWORD = process.env.FRISKIS_PASSWORD

const apiHandler = FriskisJsApiWrapper({
  apikey: FRISKIS_API_KEY,
  username: FRISKIS_USERNAME,
  password: FRISKIS_PASSWORD
})

export default {
  book: book(apiHandler),
  cancel: cancel(apiHandler),
  find: find(apiHandler)
}

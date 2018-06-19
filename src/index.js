// @flow

import express from 'express'
import passport from 'passport'
import bodyParser from 'body-parser'

import getAPIRouter from './routes/api'
import getAuthRouter from './routes/auth'
import { sequelize } from './models'

// REST API structure
async function main() {
  // TODO: When DB structure changes, comment this line and uncomment the line below
  await sequelize.authenticate()
  // await sequelize.sync({ force: true })

  express()
    .use(passport.initialize())
    .use(bodyParser.json())
    .use('/auth', getAuthRouter())
    .use('/api', passport.authenticate('jwt', { session: false }), getAPIRouter())
    .listen(3001)
}

main().catch(error => {
  console.error(error && error.stack)
  process.exit(1)
})

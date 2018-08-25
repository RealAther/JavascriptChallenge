// @flow

import cors from 'cors'
import express from 'express'
import passport from 'passport'
import bodyParser from 'body-parser'

import settings from './settings'
import getAPIRouter from './routes/api'
import getAuthRouter from './routes/auth'
import { sequelize } from './models'

// REST API structure
async function main() {
  // TODO: When DB structure changes, comment this line and uncomment the line below
  await sequelize.authenticate()
  // await sequelize.sync({ force: true })

  let app = express()

  if (settings.NODE_ENV === 'development') {
    app = app.use(
      cors({
        origin: ['http://localhost:3000'],
        credentials: true,
      }),
    )
  }

  app = app
    .use(passport.initialize())
    .use(bodyParser.json())
    .use('/auth', getAuthRouter())
    .use('/api', passport.authenticate('jwt', { session: false }), getAPIRouter())

  const server = app.listen(3001)
  const serverPort = server.address().port
  console.log(`Starting API server on http://localhost:${serverPort}/`)
}

main().catch(error => {
  console.error(error && error.stack)
  process.exit(1)
})

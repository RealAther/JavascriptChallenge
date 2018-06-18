// @flow

import express from 'express'
import passport from 'passport'
import connectRedis from 'connect-redis'
import expressSession from 'express-session'

import getAPIRouter from './routes/api'
import getAuthRouter from './routes/auth'
import { sequelize } from './models'

// REST API structure
async function main() {
  const RedisStore = connectRedis(expressSession)

  // TODO: When DB structure changes, comment this line and uncomment the line below
  await sequelize.authenticate()
  // await sequelize.sync({ force: true })

  express()
    .use(
      expressSession({
        store: new RedisStore({
          port: 16379,
        }),
        cookie: {},
        resave: false,
        saveUninitialized: false,
        secret: 'some-really-secret-thing?',
      }),
    )
    .use(passport.initialize())
    .use(passport.session())
    .use('/auth', getAuthRouter())
    .use('/api', getAPIRouter())
    .listen(3001)
}

main().catch(error => {
  console.error(error && error.stack)
  process.exit(1)
})

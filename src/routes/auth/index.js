// @flow

import { Router } from 'express'
import bcrypt from 'bcrypt'
import passport from 'passport'
import LocalStrategy from 'passport-local'

import { User } from '../../models'
import { asyncRoute } from '../common'

const SALT_ROUNDS = 10

export default function getAuthRouter() {
  passport.serializeUser(function(user, done) {
    done(null, user.id)
  })

  passport.deserializeUser(function(id, done) {
    User.findById(id).then(user => done(null, user), err => done(err, null))
  })
  passport.use(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    new LocalStrategy(function(email, password, done) {
      User.findOne({ email }, function(err, user) {
        if (err) {
          done(err)
          return
        }
        if (!user) {
          done(null, false)
          return
        }
        bcrypt.compare(password, user.password, function(bcryptErr, matches) {
          if (bcryptErr) {
            done(bcryptErr)
          } else {
            done(null, matches ? user : false)
          }
        })
      })
    }),
  )

  const router = new Router()

  router.post('/login', function(req, res, next) {
    // TODO: Validate inputs
    passport.authenticate('local', function(err, user) {
      if (err) {
        console.error('Error while authenticating', err)
        res.statusCode = 500
        res.json({ status: 0, error: 'Login failed. Please try again later' })
        return
      }
      if (!user) {
        res.statusCode = 401
        res.json({ status: 0, error: 'Invalid username or password' })
        return
      }
      res.json({ status: 1 })
    })(req, res, next)
  })
  router.post(
    '/register',
    asyncRoute(async function(req, res) {
      // TODO: MAGIC Here.
      const params = req.body

      // TODO: Validate inputs
      const existingUser = await User.find({
        where: { email: params.email },
      })
      if (existingUser) {
        res.json({ status: 0, errors: [{ field: 'email', message: 'The email you entered is already in use' }] })
        return
      }

      // TODO: Validate strength/length of password
      const password = new Promise(function(resolve, reject) {
        bcrypt.hash(params.passport, SALT_ROUNDS, function(err, hash) {
          if (err) {
            reject(err)
          } else resolve(hash)
        })
      })

      const newUser = await User.create({
        email: params.email,
        firstName: params.firstName,
        lastName: params.lastName,
        password,
      })

      await new Promise(function(resolve, reject) {
        req.login(newUser, function(err) {
          if (err) {
            reject(err)
          } else resolve()
        })
      })
    }),
  )
  router.post('/logout', function(req, res) {
    req.logout()
    res.json({ status: 1 })
  })
  router.get('/me', function(req, res) {
    res.json({ status: 1, loggedIn: !!req.user })
  })

  return router
}

// @flow

import { Router } from 'express'
import bcrypt from 'bcrypt'
import passport from 'passport'
import LocalStrategy from 'passport-local'

import { User } from '../../models'
import { validatedRoute } from '../common'
import { loginSchema, registerSchema } from './validation'

const SALT_ROUNDS = 10

export default function getAuthRouter() {
  passport.serializeUser(function(user, done) {
    done(null, user.id)
  })

  passport.deserializeUser(function(id, done) {
    User.findById(id).then(user => done(null, user), err => done(err, null))
  })
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      function(email, password, done) {
        User.findOne({ where: { email } })
          .then(user => {
            if (!user) {
              done(null, false)
            }
            bcrypt.compare(password, user.password, function(bcryptErr, matches) {
              if (bcryptErr) {
                done(bcryptErr)
              } else {
                done(null, matches ? user : false)
              }
            })
          })
          .catch(done)
      },
    ),
  )

  const router = new Router()

  router.post(
    '/login',
    validatedRoute(loginSchema, async function(req, res, next) {
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
    }),
  )
  router.post(
    '/register',
    validatedRoute(registerSchema, async function(req, res, next, params) {
      const existingUser = await User.find({
        where: { email: params.email },
      })
      if (existingUser) {
        res.json({ status: 0, errors: [{ field: 'email', message: 'The email you entered is already in use' }] })
        return
      }

      const password = await new Promise(function(resolve, reject) {
        bcrypt.hash(params.password, SALT_ROUNDS, function(err, hash) {
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

      res.json({ status: 1 })
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

// @flow

import express from 'express'
import passport from 'passport'
import bodyParser from 'body-parser'
import connectRedis from 'connect-redis'
import expressSession from 'express-session'

import { sequelize, Post, User } from './models'
// default export
// named export

async function renderPage(req, res) {
  const allPosts = await Post.findAll() // All = array of objects
  // { id: string, content: string, createdAt: Date, updateAt: Date }

  res.end(`
    <!DOCTYPE HTML>
    <html>
      <head>
        <link rel="stylesheet" href="/styles/style.css" type="text/css">
      </head>
      <body>
        ${req.user ? `You are logged in as '${req.user.firstName} ${req.user.lastName}'` : ''}
        <form method="post" id="writePost">
          <div class="text-container">
            <textarea name="content" class="text-area" placeholder="Write something here!"></textarea>
            <button class="submit">Submit</button>
          </div>
        </form>
        Previously sent stuff:
        <pre id="content">${allPosts.map(item => item.content).join('\n')}</pre>
        <script src="/scripts/common.js"></script>
        <script src="/scripts/client.js"></script>
      </body>
    </html>
  `)
}

async function main() {
  const RedisStore = connectRedis(expressSession)

  // TODO: When DB structure changes, comment this line and uncomment the line below
  await sequelize.authenticate()
  // await sequelize.sync({ force: true })
  passport.serializeUser(function(user, done) {
    done(null, user.id)
  })

  passport.deserializeUser(function(id, done) {
    User.findById(id).then(user => done(null, user), err => done(err, null))
  })

  express()
    .use(bodyParser.urlencoded({ extended: true }))
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
    .use(express.static('./public'))
    .post('/', async function(req, res) {
      await Post.create({
        content: req.body.content,
      })
      if (req.accepts('json')) {
        const allPosts = await Post.findAll()
        res.json(allPosts.map(item => item.content))
      } else {
        await renderPage(req, res)
      }
    })
    .get('/', async function(req, res) {
      await renderPage(req, res)
    })
    .post('/signup', async function(req, res, next) {
      const newlyCreatedUser = await User.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
      })

      await new Promise(function(resolve) {
        req.login(newlyCreatedUser, function(err) {
          if (err) next(err)
          else resolve()
        })
      })

      if (req.accepts('json')) {
        res.json({
          userId: newlyCreatedUser.id,
          status: 'success', // or 'fail',
          failMessage: null,
        })
      } else {
        res.end(`
          <!DOCTYPE HTML>
          <html>
            <head></head>
            <body>
              You have been successfully signed up. Please wait while we redirect you

              OR

              Signup unsuccessful. Kindly check your fields 'blah' and try again
            </body>
          </html>
        `)
      }
    })
    .get('/signup', async function(req, res) {
      res.end(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Sign Up</title>
            <link rel="stylesheet" href="/styles/style.css" type="text/css">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/normalize.css@8.0.0/normalize.css" type="text/css">
          </head>
          <body>
            <form method="post" id="emailForm">
              <div class="email-main-container">
                <div class="input-name-container">
                  <input type="text" class="firstNameInput"placeholder="FirstName" name="firstName">
                  <input type="text" placeholder="LastName" name="lastName">
                </div>
                <div class="input-email-container">
                  <input type="email" placeholder="example@gmail.com" name="email">
                  <input type="password" placeholder="*****" name="password">
                </div>
                <div class="signup-button">
                  <button class="submit">Sign Up</button>
                </div>
              </div>
            </form>
            <script src="/scripts/common.js" type="application/javascript"></script>
            <script src="/scripts/signup.js" type="application/javascript"></script>
          </body>
        </html>
        `)
    })
    .get('/signout', function(req, res) {
      if (req.accepts('html')) {
        req.logout()
        res.redirect('/')
      } else {
        res.json({ status: 'success' })
      }
    })
    .listen(8080)
}

main().catch(error => {
  console.error(error && error.stack)
  process.exit(1)
})

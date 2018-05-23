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
        ${
          req.user
            ? `<div class="signout-button">
          <a href="/signout"><button class="logout">Log Out</button></a>
        </div>`
            : ''
        }
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
            <title>Sign-Up</title>
            <link rel="stylesheet" href="/styles/signup.css" type="text/css">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/normalize.css@8.0.0/normalize.css" type="text/css">
            <link href="https://fonts.googleapis.com/css?family=Jura:300" rel="stylesheet">
          </head>
          <body>
            <div class="body-wrapper">
              <div class="body-header">
                <div class="body-header-items">
                  <div class="body-header-item-one ">
                    <span class="js-word">JS</span>
                  </div>
                  <div class="body-header-item-two">
                    <span class="challenge-word">Challenge</span>
                  </div>
                </div>
              </div>
              <div class="body-container">
                <div class="body-container-items">
                  <div class="body-container-item-one">
                    <div class="body-container-item-one-left">
                      <div class="body-container-item-one-left-first">
                        <span class="bfl">built for learning</span>
                      </div>
                      <div class="body-container-item-one-left-second">
                        <p class="signup-paragraph"><a href="#" class="JSChallenge-link">JSChallenge</a> is a GitHub Repository where i'm learning javascript. <br /> It's for learning purposes</p>
                      </div>
                    </div>
                    <div class="body-container-item-one-right">
                      <form method="post" id="emailForm">
                        <div class="email-main-container">
                          <div class="input-first-name">
                            <span class="input-firstName">first name</span>
                            <input type="text" class="firstNameInput" placeholder="Your first name" name="firstName">
                          </div>
                          <div class="input-last-name">
                            <span class="input-lastName">last name</span>
                            <input type="text" placeholder="Your last name" name="lastName">
                          </div>
                          <div class="input-email">
                            <span class="inputEmail">email</span>
                            <input type="email" placeholder="you@example.com" name="email">
                          </div>
                          <div class="input-password">
                            <span class="inputPassword">password</span>
                            <input type="password"  placeholder="Create a password" name="password">
                          </div>
                          <div class="signup-button">
                            <button class="submit">Sign Up</button>
                            <span class="Log-In">Already have an account? <a href="/login" class="Log-In-Link">Log-In</a></span>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
    .post('/login', async function(req, res, next) {
      const foundUser = await User.findOne({
        where: {
          email: req.body.email,
          password: req.body.password,
        },
      })
      if (!foundUser) {
        if (req.accepts('html')) {
          res.status(400).end('Invalid username/password')
        } else {
          res.json({ status: 'error', message: 'Invalid username or password' })
        }
        return
      }
      await new Promise(function(resolve) {
        req.login(foundUser, function(err) {
          if (err) next(err)
          else resolve()
        })
      })
      if (req.accepts('html')) {
        res.end('Login successful')
      } else {
        res.json({ status: 'success' })
      }
    })
    .get('/login', async function(req, res) {
      res.end(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Log-In</title>
              <link rel="stylesheet" href="/styles/login.css" type="text/css"/>
              <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/normalize.css@8.0.0/normalize.css" type="text/css"/>
              <link href="https://fonts.googleapis.com/css?family=Jura:300" rel="stylesheet">
            </head>
            <body>
              <div class="body-wrapper">
                <div class="body-header">
                  <div class="body-header-items">
                    <div class="body-header-item-one ">
                      <span class="js-word">JS</span>
                    </div>
                    <div class="body-header-item-two">
                      <span class="challenge-word">Challenge</span>
                    </div>
                  </div>
                </div>
                <div class="body-container">
                  <div class="body-container-itemOne">
                    <form method="post" id="emailForm">
                      <div class="email-main-container">
                        <div class="input-email-container">
                          <div class="inputEmail">
                            <span class="span-email">Email</span>
                            <input type="email" placeholder="example@gmail.com" name="email">
                          </div>
                          <div class="inputPassword">
                            <span class="span-password">Password</span>
                            <input type="password" placeholder="*****" name="password">
                          </div>
                        </div>
                        <div class="signup-button">
                            <a href="/"><button class="signup">Log In</button></a>
                            <span class="create-account">Don't have an account yet? <a href="/signup" class="create-account-link">create an account</a></span>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `)
    })
    .listen(8080)
}

main().catch(error => {
  console.error(error && error.stack)
  process.exit(1)
})

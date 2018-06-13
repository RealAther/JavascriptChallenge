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
        <title>Home-page</title>
        <link rel="stylesheet" href="/styles/main.css" type="text/css"/>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/normalize.css@8.0.0/normalize.css" type="text/css"/>
        <link href="https://fonts.googleapis.com/css?family=PT+Sans:400,400i,700,700i" rel="stylesheet">
      </head>
      <body>
        <header>
          <div class="header-logo">
            <span class="javascript-logo">javaScript</span>
            <span class="challenge-logo">challenge</span>
          </div>
        </header>
        <div class="body-welcome-message">
          <span class="welcome-message">${req.user ? `Welcome back: ${req.user.firstName} ${req.user.lastName}` : ''}</span>
          <div class="body-logout-button">
            ${
              req.user
                ? `<div class="signout-button">
            <a class="button-link" href="/login"><button class="logout">Log out</button></a>
            </div>`
                : ''
            }
          </div>
        </div>
        <div class="body-wrapper">
          <div class="body-container">
            <div class="body-container-items">
              <div class="body-container-itemOne">
                <form method="post" id="writePost">
                  <div class="text-container-items">
                    <div class="text-container">
                      <textarea name="content" class="text-area" placeholder="Write something here!" onfocus="this.placeholder = ''" onblur="this.placeholder = 'Write something here!'"></textarea>
                    </div>
                    <div class="text-container-post">
                      <button class="post">post</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div class="body-wrapper-two">
          <span class="my-posts">My posts:</span>
          <pre id="content">${allPosts.map(item => item.content).join('\n')}</pre>
        </div>
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
        res.redirect('/')
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
            <title>sign-up</title>
            <link rel="stylesheet" href="/styles/signup.css" type="text/css"/>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/normalize.css@8.0.0/normalize.css" type="text/css"/>
            <link href="https://fonts.googleapis.com/css?family=PT+Sans:400,400i,700,700i" rel="stylesheet">
          </head>
          <body>
            <header>
              <div class="header-logo">
                <span class="javascript-logo">javaScript</span>
                <span class="challenge-logo">challenge</span>
              </div>
            </header>
            <div class="form-background-wrapper">
              <div class="form-background">
                <div class="form-background-left">
                  <div class="form-background-left-items">
                    <img src="/images/sign-up-logo.svg" class="form-logo"/>
                    <span class="signup-left">SIGN UP</span>
                    <p class="paragraph">Javascript Challange is a <br/> Github repository where <br/> I'm learning javascript</p>
                  </div>
                </div>
                <div class="form-background-right">
                  <div class="form-background-right-items">
                    <form method="post" id="emailForm">
                      <div class="form-items">
                        <div class="form-name-inputs">
                          <div class="input-first-name-container">
                            <label class="first-name-label">first name</label>
                            <input class="first-name-input" name="firstName" placeholder="First Name"></input>
                          </div>
                          <div class="input-last-name-container">
                            <label class="last-name-label">last name</label>
                            <input class="last-name-input" name="lastName" placeholder="Last Name"></input>
                          </div>
                        </div>
                        <div class="form-mail-inputs">
                          <div class="input-email-container">
                            <label class="email-label">email</label>
                            <input class="input-email" type="email" placeholder="Example@gmail.com" name="email">
                          </div>
                          <div class="input-password-container">
                            <label class="password-label">password</label>
                            <input class="input-password" type="password" placeholder="*****" name="password">
                          </div>
                        </div>
                        <div class="button-container">
                          <button class="signup-button">sign-up</button>
                        </div>
                        <div class="form-right-paragraphs">
                          <div class="terms-and-conditions">
                            <p class="terms-paragraph">by clicking signup, you're agreeing to our <a class="terms-link" href="#">terms of service</a> </p>
                          </div>
                          <div class="login">
                            <span class="login-span">already have an account?</span>
                            <a href="/login" class="login-link">log in</a>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
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
        res.redirect('/')
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
              <link href="https://fonts.googleapis.com/css?family=PT+Sans:400,400i,700,700i" rel="stylesheet">
            </head>
            <body>
              <header>
                <div class="header-logo">
                  <span class="javascript-logo">javaScript</span>
                  <span class="challenge-logo">challenge</span>
                </div>
              </header>
              <div class="form-background-wrapper">
                <div class="form-background">
                  <div class="form-background-top">
                    <div class="form-background-top-items">
                      <img src="/images/login-logo.svg" class="login-logo"></img>
                      <span class="login-span">login</span>
                      <p class="login-top-paragraph1">Hey, good to see you again!</p>
                      <p class="login-top-paragraph2">Log in to get going</p>
                    </div>
                  </div>
                  <div class="form-background-bottom">
                    <div class="form-background-bottom-items">
                      <form id="emailForm" method="post">
                        <div class="form-items">
                          <div class="form-mail-inputs">
                            <div class="input-email-container">
                              <label class="email-label">email</label>
                              <input class="input-email" type="email" placeholder="Example@gmail.com" name="email">
                            </div>
                            <div class="input-password-container">
                              <label class="password-label">password</label>
                              <input class="input-password" type="password" placeholder="*****" name="password">
                            </div>
                          </div>
                          <div class="button-container">
                            <button class="login-button">login</button>
                          </div>
                          <div class="signup">
                            <span class="signup-span">Don't have an account yet?</span>
                            <a href="/signup" class="signup-link">sign up</a>
                          </div>
                        </div>
                      </form>
                    </div>
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

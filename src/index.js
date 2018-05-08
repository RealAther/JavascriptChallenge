// @flow

import express from 'express'
import bodyParser from 'body-parser'

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
  // TODO: When DB structure changes, comment this line and uncomment the line below
  await sequelize.authenticate()
  // await sequelize.sync({ force: true })

  express()
    .use(bodyParser.urlencoded({ extended: true }))
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
    .post('/signup', async function(req, res) {
      const newlyCreatedUser = await User.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
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
    .listen(8080)
}

main().catch(error => {
  console.error(error && error.stack)
  process.exit(1)
})

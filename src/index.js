// @flow

import express from 'express'
import bodyParser from 'body-parser'

import { sequelize } from './models'

let userCount = 0
const array = []

function renderPage(req, res) {
  res.end(`
    <!DOCTYPE HTML>
    <html>
      <head>
        <link rel="stylesheet" href="style.css" type="text/css">
      </head>
      <body>
        Hello World!: You have had ${userCount} visits.
        <form method="post" id="writePost">
          <div class="text-container">
            <textarea name="content" class="text-area" placeholder="Write something here!"></textarea>
            <button class="submit">Submit</button>
          </div>
        </form>
        Previously sent stuff:
        <pre id="content">${array.join('\n')}</pre>
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
    .post('/', function(req, res) {
      array.push(req.body.content)
      if (req.accepts('application/x-maohra')) {
        res.end(array.join('\n'))
      } else {
        renderPage(req, res)
      }
    })
    .get('/', function(req, res) {
      userCount++
      renderPage(req, res)
    })
    .listen(8080)
}

main().catch(error => {
  console.error(error && error.stack)
  process.exit(1)
})

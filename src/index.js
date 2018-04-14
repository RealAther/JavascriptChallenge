// @flow

import express from 'express'
import bodyParser from 'body-parser'

let userCount = 0
let array = []

function renderPage(req, res) {
  res.end(`
    <!DOCTYPE HTML>
    <html>
      <head>
        <link rel="stylesheet" href="style.css" type="text/css">
      </head>
      <body>
        Hello World!: You have had ${userCount} visits.
        <form method="post">
          <div class="text-container">
            <textarea name="content" class="text-area" placeholder="Write something here!"></textarea>
            <button class="submit">Submit</button>
          </div>
        </form>
        Previously sent stuff:
        <pre>${array.join('\n')}</pre>
      </body>
    </html>
  `)
}

async function main() {
  express()
    .use(bodyParser.urlencoded({ extended: true }))
    .use(express.static('./public'))
    .post('/', function(req, res) {
      array.push(req.body.content)
      renderPage(req, res)
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

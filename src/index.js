// @flow

import express from 'express'
import bodyParser from 'body-parser'

let userCount = 0
let array = []

async function main() {
  express()
    .use(bodyParser.urlencoded({ extended: true }))
    .use(express.static('./public'))
    .post('/', function(req, res) {
      // console.log(req.body)
      array.push(req.body[array])
    })
    .get('/', function(req, res) {
      userCount++
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
                <textarea name="Text-Area" class="text-area" placeholder="Write something here!"></textarea>
                <button class="submit">Submit</button>
              </div>
            </form>
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

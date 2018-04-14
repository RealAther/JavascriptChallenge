// @flow

import express from 'express'
import bodyParser from 'body-parser'

let userCount = 0

async function main() {
  express()
    .use(bodyParser.urlencoded({ extended: true }))
    .use(express.static('./public'))
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

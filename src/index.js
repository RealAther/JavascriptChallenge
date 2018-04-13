// @flow

import express from 'express'

async function main() {
  express()
    .use(express.static('./public'))
    .get('/', function(req, res) {
      res.end(`
        <!DOCTYPE HTML>
        <html>
          <head>
            <link rel="stylesheet" href="style.css" type="text/css">
          </head>
          <body>
            Hello World
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

// @flow

import http from 'http'

let userCount = 0

async function main() {
  // TODO: Do something here
  http
    .createServer(function(request, response) {
      userCount++
      response.write(`Hello World!:  We have had ${userCount} visits!`)
      response.end()
    })
    .listen(8080)
}

main().catch(error => {
  console.error(error && error.stack)
  process.exit(1)
})

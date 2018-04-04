// @flow

import url from 'url'
import http from 'http'
import querystring from 'querystring'

let userCount = 0

const ROUTES = {
  '/': function(request, response, parsed) {
    userCount++
    response.write(`Hello World!:  We have had ${userCount} visits!`)
    response.end()
    console.log('handling request', parsed)
  },
}

function handleConnection(request, response) {
  const parsedUrl = url.parse(request.url)
  if (ROUTES[parsedUrl.pathname]) {
    ROUTES[parsedUrl.pathname](request, response, {
      path: parsedUrl.pathname,
      query: querystring.parse(parsedUrl.query || ''),
    })
  } else {
    response.statusCode = 404
    response.end(`Requested resource at '${parsedUrl.pathname}' was not found`)
  }
}

async function main() {
  await new Promise((resolve, reject) => {
    http
      .createServer(handleConnection)
      .listen(8080, resolve)
      .on('error', reject)
  })
}

main().catch(error => {
  console.error(error && error.stack)
  process.exit(1)
})

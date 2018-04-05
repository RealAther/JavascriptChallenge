// @flow

import express from 'express'

async function main() {
  express()
    .use(express.static('./public'))
    .listen(8080)
}

main().catch(error => {
  console.error(error && error.stack)
  process.exit(1)
})

// @flow

async function main() {
  // TODO: Do something here
  console.log('Hello World!')
}

main().catch(error => {
  console.error(error && error.stack)
  process.exit(1)
})

// @flow

import express from 'express'
import bodyParser from 'body-parser'

import { sequelize, Post } from './models'
// default export
// named export

async function renderPage(req, res) {
  const allPosts = await Post.findAll() // All = array of objects
  // { id: string, content: string, createdAt: Date, updateAt: Date }

  res.end(`
    <!DOCTYPE HTML>
    <html>
      <head>
        <link rel="stylesheet" href="style.css" type="text/css">
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
      if (req.accepts('application/x-maohra')) {
        const allPosts = await Post.findAll()
        res.end(allPosts.map(item => item.content).join('\n'))
      } else {
        await renderPage(req, res)
      }
    })
    .get('/', async function(req, res) {
      await renderPage(req, res)
    })
    .listen(8080)
}

main().catch(error => {
  console.error(error && error.stack)
  process.exit(1)
})

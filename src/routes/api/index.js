// @flow

import { Router } from 'express'

import { Post, Sequelize } from '../../models'
import { asyncRoute, validatedRoute } from '../common'
import { createPostSchema } from './validation'

export default function getAPIRouter() {
  const router = new Router()

  router.use(function(req, res, next) {
    if (!req.user) {
      res.statusCode = 401
      res.json({ status: 0, error: 'Authentication required' })
    } else next()
  })

  // TODO: Abstract out post ownership queries
  router.get(
    '/posts',
    asyncRoute(async function(req, res) {
      // TODO: Allow ability get posts of a different user
      // TODO: Add pagination
      const posts = await Post.findAll({
        where: {
          [Sequelize.Op.or]: [
            // TODO: Allow posts of other IDs when friendships are done
            { author_id: req.user.id },
            { user_id: req.user.id },
          ],
        },
      })

      res.json({ status: 1, posts })
    }),
  )
  router.post(
    '/posts',
    validatedRoute(createPostSchema, async function(req, res, _, body) {
      const newPost = await Post.create({
        author_id: req.user.id,
        user_id: null, // TODO: Fix this when we make friends :(
        content: body.content,
      })

      res.json({ status: 1, post: newPost })
    }),
  )
  router.get(
    '/post/:id',
    asyncRoute(async function(req, res) {
      const post = await Post.findOne({
        where: {
          id: req.params.id,
          [Sequelize.Op.or]: [
            // TODO: Allow posts of other IDs when friendships are done
            { author_id: req.user.id },
            { user_id: req.user.id },
          ],
        },
      })

      res.json({ status: 1, post })
    }),
  )
  router.delete(
    '/post/:id',
    asyncRoute(async function(req, res) {
      await Post.destroy({
        where: {
          id: req.params.id,
          [Sequelize.Op.or]: [
            // TODO: Allow posts of other IDs when friendships are done
            { author_id: req.user.id },
            { user_id: req.user.id },
          ],
        },
      })

      res.json({ status: 1 })
    }),
  )

  router.get('/post/:id/comments', function(req, res) {})
  router.post('/post/:id/comments', function(req, res) {})
  router.put('/post/:id/comment/:cid/likes', function(req, res) {})
  router.delete('/post/:id/comment/:cid/likes', function(req, res) {})
  router.put('/post/:id/likes', function(req, res) {})
  router.delete('/post/:id/likes', function(req, res) {})

  router.get('/users', function(req, res) {})
  router.get('/user/:id', function(req, res) {})
  router.post('/user/:id/friends', function(req, res) {})
  router.delete('/user/:id/friends', function(req, res) {})

  return router
}

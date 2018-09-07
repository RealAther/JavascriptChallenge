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
      let userId = null
      if (req.query && req.query.user) {
        userId = parseInt(req.query.user, 10)
        if (Number.isNaN(userId)) {
          throw new Error('Invalid user ID specified')
        }
        // TODO: Check if the user id is a friend
      }
      // TODO: Allow ability get posts of a different user
      // TODO: Add pagination
      const posts = await Post.findAll({
        where: {
          ...(userId === null
            ? {
                [Sequelize.Op.or]: [
                  // TODO: Allow posts of other IDs when friendships are done
                  { author_id: req.user.id },
                  { user_id: req.user.id },
                ],
              }
            : {
                user_id: userId,
              }),
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
        user_id: req.user.id, // TODO: Fix this when we make friends :(
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
  router.post(
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

      if (!post) {
        throw new Error('Requested post was not found')
      }
      await post.update({ content: req.body.content })

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

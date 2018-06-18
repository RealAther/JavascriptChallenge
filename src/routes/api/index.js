// @flow

import { Router } from 'express'

export default function getAPIRouter() {
  const router = new Router()

  router.use(function(req, res, next) {
    if (!req.user) {
      res.statusCode = 401
      res.json({ status: 0, error: 'Authentication required' })
    } else next()
  })

  router.get('/posts', function(req, res) {})
  router.get('/post/:id', function(req, res) {})
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

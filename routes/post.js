const express = require('express');
const passport = require('passport');

const router = express.Router();

const postController = require('../controllers/postController');

// Get All Posts
router.get('/posts/all', postController.postAll);

// GET 10 Posts.
router.get('/posts', postController.postList);

// GET single post
router.get('/post/:id', postController.postDetail);

// Create Post
router.put(
  '/posts',
  passport.authenticate('jwt', { session: false }),
  postController.createPost
);

// Edit Post
router.patch(
  '/post/:id',
  passport.authenticate('jwt', { session: false }),
  postController.editPost
);

// Delete Post
router.delete(
  '/posts',
  passport.authenticate('jwt', { session: false }),
  postController.deletePost
);

// Create Comment
router.put('/post/:id/comment', postController.createComment);

// Delete Comment
router.delete(
  '/post/:id/comment',
  passport.authenticate('jwt', { session: false }),
  postController.deleteComment
);

module.exports = router;

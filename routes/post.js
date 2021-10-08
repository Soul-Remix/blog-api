const express = require('express');
const passport = require('passport');

const router = express.Router();

const postController = require('../controllers/postController');

/* GET home page. */
router.get('/posts', postController.postList_get);

// GET single post
router.get('/post/:id', postController.postDetail_get);

// Create Post
router.put(
  '/posts',
  passport.authenticate('jwt', { session: false }),
  postController.createPost_put
);

// Edit Post
router.patch(
  '/post/:id/edit',
  passport.authenticate('jwt', { session: false }),
  postController.editPost_patch
);

// Delete Post
router.delete(
  '/post/:id/delete',
  passport.authenticate('jwt', { session: false }),
  postController.deletePost
);

// Create Comment
router.put('/post/:id/comment', postController.createComment_put);

// Delete Comment
router.delete(
  '/post/:id/comment',
  passport.authenticate('jwt', { session: false }),
  postController.deleteComment
);

module.exports = router;

const express = require('express');
const router = express.Router();

const postController = require('../controllers/postController');

/* GET home page. */
router.get('/posts', postController.postList_get);

// GET single post
router.get('/post/:id', postController.postDetail_get);

// Create Post
router.put('/posts', postController.createPost_put);

// Edit Post
router.patch('/post/:id/edit', postController.editPost_patch);

// Delete Post
router.delete('/post/:id/delete', postController.deletePost);

// Create Comment
router.put('/post/:id/comment', postController.createComment_put);

// Delete Comment
router.delete('/post/:id/comment', postController.deleteComment);

module.exports = router;

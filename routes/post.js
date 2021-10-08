const express = require('express');
const router = express.Router();

const postController = require('../controllers/postController');

/* GET home page. */
router.get('/posts', postController.postList_get);

// GET single post
router.get('/post/:id', postController.postDetail_get);

// Create Post
router.put('/posts', postController.createPost_put);

module.exports = router;

const express = require('express');
const router = express.Router();

const postController = require('../controllers/postController');

/* GET home page. */
router.get('/posts', postController.postList_get);

router.get('/post/:id', postController.postDetail_get);

module.exports = router;

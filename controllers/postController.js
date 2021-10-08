const Post = require('../models/post');

// GET all Posts
const postList_get = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const limit = 10;
    const [totalItems, posts] = await Promise.all([
      Post.countDocuments(),
      Post.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author')
        .populate('comments'),
    ]);
    res.status(200).json({ posts, totalItems });
  } catch (err) {
    return next(err);
  }
};

// GET single Post
const postDetail_get = async (req, res, next) => {
  try {
    const id = req.params.id;
    const post = await Post.findById(id);
    if (!post) {
      const err = new Error('Failed to find a post');
      err.status = 404;
      return next(err);
    }
    res.status(200).json(post);
  } catch (err) {
    err.message = 'Failed to connect to server, Please try again later';
    return next(err);
  }
};

module.exports = { postList_get, postDetail_get };

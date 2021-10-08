const Joi = require('joi');

const Post = require('../models/post');
const Comment = require('../models/comment');

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
        .sort({ createdAt: -1 })
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

// PUT Create Post
const createPost_put = async (req, res, next) => {
  try {
    const joiSchema = Joi.object({
      title: Joi.string().min(3).max(30).required(),
      description: Joi.string().min(7).required(),
      id: Joi.string(),
    });
    const { error, value } = joiSchema.validate(req.body);
    if (error) {
      return res.status(422).json({ message: 'Invalid request', error });
    }
    const post = new Post({
      title: req.body.title,
      description: req.body.title,
      author: req.user.id,
      image: req.file.path,
    });
    await post.save();
    return res.status(200).json({ message: 'Post Created Successfully' });
  } catch (err) {
    return next(err);
  }
};

// PATCH Edit Post
const editPost_patch = async (req, res, next) => {
  try {
    const joiSchema = Joi.object({
      title: Joi.string().min(3).max(30).required(),
      description: Joi.string().min(7).required(),
    });
    const { error, value } = joiSchema.validate(req.body);
    if (error) {
      return res.status(422).json({ message: 'Invalid request', error });
    }
    const id = req.params.id;
    const foundPost = await Post.findById(id);
    if (!foundPost) {
      return res.status(422).json({
        message: 'Invalid request',
        error: { message: 'Post Not Found' },
      });
    } else {
      foundPost.title = req.body.title;
      foundPost.description = req.body.description;
      if (req.file) {
        foundPost.image = req.file.path;
      }
      await foundPost.save();
      return res.status(200).json({ message: 'Post Edited Successfully' });
    }
  } catch (err) {
    return next(err);
  }
};

// PUT create Comment
const createComment_put = async (req, res, next) => {
  try {
    const joiSchema = Joi.object({
      userName: Joi.string().min(3).max(30).required(),
      description: Joi.string().min(3).max(255).required(),
    });
    const { error, value } = joiSchema.validate(req.body);
    if (error) {
      return res.status(422).json({ message: 'Invalid request', error });
    }
    const id = req.params.id;
    const post = await Post.findById(id).populate('comments');
    if (!post) {
      return res.status(422).json({
        message: 'Invalid request',
        error: { message: 'Post Not Found' },
      });
    }
    const comment = new Comment({
      userName: req.body.userName,
      description: req.body.description,
      post: id,
    });
    post.comments.push(comment);
    await Promise.all([comment.save(), post.save()]);
    return res.status(200).json({ message: 'Created Comment Successfully' });
  } catch (err) {
    return next(err);
  }
};

// Delete Comment
const deleteComment = async (req, res, next) => {
  try {
    const commentId = req.get('commentId');
    const postId = req.params.id;
    const comment = await Comment.findOneAndRemove(commentId);
    if (!comment) {
      return res.status(422).json({
        message: 'Invalid request',
        error: { message: 'Comment Not Found' },
      });
    }
    res.status(200).json({ message: 'Deleted Comment Successfully' });
    const post = await Post.findById(postId);
    await post.comments.pull({ _id: commentId });
    await post.save();
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  postList_get,
  postDetail_get,
  createPost_put,
  editPost_patch,
  createComment_put,
  deleteComment,
};

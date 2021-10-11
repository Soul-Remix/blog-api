const fs = require('fs');
const path = require('path');
const Joi = require('joi');

const Post = require('../models/post');
const Comment = require('../models/comment');

// GET all Posts
const postList = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const limit = 10;
    const [totalItems, posts] = await Promise.all([
      Post.countDocuments(),
      Post.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate('comments'),
    ]);
    const nextPage = totalItems / 10 > page ? page++ : false;
    const hasNextPage = nextPage ? true : false;
    res.status(200).json({ posts, totalItems, nextPage, hasNextPage });
  } catch (err) {
    return next(err);
  }
};

// GET single Post
const postDetail = async (req, res, next) => {
  try {
    const id = req.params.id;
    const post = await Post.findById(id).populate('author');
    if (!post) {
      const err = new Error('Failed to find a post');
      err.status = 404;
      return next(err);
    }
    post.views += 1;
    await post.save();
    res.status(200).json(post);
  } catch (err) {
    err.message = 'Failed to connect to server, Please try again later';
    return next(err);
  }
};

// Create Post
const createPost = async (req, res, next) => {
  try {
    const joiSchema = Joi.object({
      title: Joi.string().min(3).max(100).required(),
      description: Joi.string().min(7).required(),
      id: Joi.string(),
    });
    const { error, value } = joiSchema.validate(req.body);
    if (error) {
      return res.status(422).json({ message: 'Invalid request', error });
    }
    const post = new Post({
      title: req.body.title,
      description: req.body.description,
      author: req.user._id,
      image: req.file.path,
    });
    await post.save();
    return res.status(200).json({ message: 'Post Created Successfully', post });
  } catch (err) {
    return next(err);
  }
};

// Edit Post
const editPost = async (req, res, next) => {
  try {
    const joiSchema = Joi.object({
      title: Joi.string().min(3).max(100).required(),
      description: Joi.string().min(7).required(),
    });
    const { error, value } = joiSchema.validate(req.body);
    if (error) {
      return res.status(422).json({ message: 'Invalid request', error });
    }
    const id = req.params.id;
    const foundPost = await Post.findById(id);
    if (!foundPost) {
      return res.status(422).json({ message: 'Post Not Found' });
    } else {
      foundPost.title = req.body.title;
      foundPost.description = req.body.description;
      if (req.file) {
        clearImage(foundPost.image);
        foundPost.image = req.file.path;
      }
      await foundPost.save();
      return res.status(200).json({ message: 'Post Edited Successfully' });
    }
  } catch (err) {
    return next(err);
  }
};

// Delete Post
const deletePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const post = await Post.findOneAndRemove(postId);
    if (!post) {
      return res.status(422).json({ message: 'Post Not Found' });
    }
    clearImage(post.image);
    res.status(200).json({ message: 'Deleted Post Successfully' });
    await Comment.deleteMany({ post: postId });
  } catch (err) {
    return next(err);
  }
};

// create Comment
const createComment = async (req, res, next) => {
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
      return res.status(422).json({ message: 'Post Not Found' });
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
  postList,
  postDetail,
  createPost,
  editPost,
  deletePost,
  createComment,
  deleteComment,
};

function clearImage(fPath) {
  filePath = path.join(__dirname, '..', fPath);
  fs.unlink(filePath, (err) => console.log(err));
}

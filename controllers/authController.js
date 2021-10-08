const Joi = require('joi');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Post = require('../models/post');

const signup = async (req, res, next) => {
  try {
    const joiSchema = Joi.object({
      userName: Joi.string().min(3).max(30).required(),
      password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
      confirmPassword: Joi.ref('password'),
    });
    const { error, value } = joiSchema.validate(req.body);
    if (error) {
      return res.status(422).json({ message: 'Invalid request', error });
    }
    const foundUser = await User.findOne({ userName: req.body.userName });
    if (foundUser) {
      return res.status(422).json({
        message: 'Invalid request',
        error: { msg: 'User Name is already in use' },
      });
    } else {
      const hashedPassword = await bcryptjs.hash(req.body.password, 12);
      const user = new User({
        userName: req.body.userName,
        password: hashedPassword,
      });
      await user.save();
      return res.status(200).json({ message: 'User Created Successfully' });
    }
  } catch (err) {
    err.message = 'Failed to connect to server, Please try again later';
    return next(err);
  }
};

const logIn = async (req, res, next) => {
  try {
    const joiSchema = Joi.object({
      userName: Joi.string().min(3).max(30).required(),
      password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    });
    const { error, value } = joiSchema.validate(req.body);
    if (error) {
      return res.status(422).json({ message: 'Invalid request', error });
    }
    const { userName, password } = req.body;
    const user = await User.find({ userName: userName });
    if (user.length === 0) {
      return res.status(401).json({
        message: 'Invalid request',
        error: { msg: "User Name or password doesn't match" },
      });
    }
    const validPassword = await bcryptjs.compare(password, user[0].password);
    if (!validPassword) {
      return res.status(401).json({
        message: 'Invalid request',
        error: { msg: "User Name or password doesn't match" },
      });
    } else {
      const opts = {};
      opts.expiresIn = '2h';
      const secret = process.env.SECRET;
      const token = jwt.sign({ id: user[0]._id }, secret, opts);
      return res.status(200).json({
        message: 'Auth Passed',
        token,
      });
    }
  } catch (err) {
    return next(err);
  }
};

module.exports = { signup, logIn };

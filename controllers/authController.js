const Joi = require('joi');
const bcryptjs = require('bcryptjs');

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

module.exports = { signup };

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const multer = require('multer');
const passport = require('passport');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const jwtStrategy = require('./config/passport');

// Create DB connection
const mongoDB = process.env.MONGO_URI;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const postRouter = require('./routes/post');
const authRouter = require('./routes/auth');

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './images');
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4());
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter }).single('image'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'images')));

passport.use(jwtStrategy);

app.use('/api/v1', postRouter);
app.use('/api/v1', authRouter);

app.use((error, req, res, next) => {
  error.status = error.status || 500;
  res
    .status(error.status)
    .json({ status: error.status, message: error.message });
});

module.exports = app;

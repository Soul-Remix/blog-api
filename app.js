const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const multer = require('multer');
const passport = require('passport');
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

app.use(logger('dev'));
app.use(multer({ dest: '/images' }).single('image'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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

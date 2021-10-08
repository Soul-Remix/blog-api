const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    userName: { type: String, required: true },
    description: { type: String, required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);

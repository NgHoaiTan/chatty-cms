import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const commentSchema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: 'Post', index: true },
  comment: { type: String, default: '' },
  username: { type: String },
  avataColor: { type: String },
  profilePicture: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const CommentsModel = model('Comment', commentSchema, 'Comment');

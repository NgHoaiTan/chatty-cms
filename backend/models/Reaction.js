import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const reactionSchema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: 'Post', index: true },
  type: { type: String, default: '' },
  username: { type: String, default: '' },
  avataColor: { type: String, default: '' },
  profilePicture: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export const ReactionModel = model('Reaction', reactionSchema, 'Reaction');

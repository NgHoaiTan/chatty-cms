import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const followerSchema = new Schema({
  followerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  followeeId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  createdAt: { type: Date, default: Date.now }
});

export const FollowerModel = model('Follower', followerSchema, 'Follower');

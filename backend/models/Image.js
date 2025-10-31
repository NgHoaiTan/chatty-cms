import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const imageSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  bgImageVersion: { type: String, default: '' },
  bgImageId: { type: String, default: '' },
  imgVersion: { type: String, default: '' },
  imgId: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now, index: true }
});

export const ImageModel = model('Image', imageSchema, 'Image');

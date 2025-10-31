import { hash, compare } from 'bcryptjs';
import mongoose from 'mongoose';

const { Schema, model } = mongoose;
const SALT_ROUND = 10;

const authSchema = new Schema(
  {
    username: { type: String },
    uId: { type: String },
    email: { type: String },
    password: { type: String },
    avatarColor: { type: String },
    createdAt: { type: Date, default: Date.now },
    passwordResetToken: { type: String, default: '' },
    passwordResetExpires: { type: Number },
    emailActiveToken: { type: String, default: '' },
    emailActiveExpires: { type: Number },
    isActive: { type: Boolean, default: false }
  },
  {
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        return ret;
      }
    }
  }
);

authSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const hashedPassword = await hash(this.password, SALT_ROUND);
  this.password = hashedPassword;
  next();
});

// Compare password method
authSchema.methods.comparePassword = async function (password) {
  return compare(password, this.password);
};

// Generate hash manually if needed
authSchema.methods.hashPassword = async function (password) {
  return hash(password, SALT_ROUND);
};

export const AuthModel = model('Auth', authSchema, 'Auth');

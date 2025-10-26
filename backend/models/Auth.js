import mongoose from 'mongoose';

const authSchema = new mongoose.Schema({
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
}, {
  collection: 'Auth'
});

// Transform to remove password when converting to JSON
authSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

const Auth = mongoose.model('Auth', authSchema);

export default Auth;


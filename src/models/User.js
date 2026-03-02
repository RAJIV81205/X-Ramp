import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  identityCommitment: {
    type: String,
    required: true,
    unique: true
  },
  identityNonce: {
    type: String,
    required: true
  },
  publicKey: {
    type: String,
    required: true,
    unique: true
  },
  encryptedSecretKey: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  walletFunded: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
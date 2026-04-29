import mongoose from 'mongoose';

const AttestationSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  userAddress: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  timestamp: {
    type: Number,
    required: true
  },
  signature: {
    type: String,
    required: true
  },
  anchorPublicKey: {
    type: String,
    required: true
  },
  bankReference: {
    type: String,
    required: false
  },
  used: {
    type: Boolean,
    default: false
  },
  usedAt: {
    type: Date,
    required: false
  },
  zkProof: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Indexes for faster queries
AttestationSchema.index({ userAddress: 1, createdAt: -1 });
AttestationSchema.index({ userId: 1, used: 1 });

export default mongoose.models.Attestation || mongoose.model('Attestation', AttestationSchema);
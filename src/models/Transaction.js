import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  hash: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: ['deposit', 'withdrawal', 'transfer_sent', 'transfer_received']
  },
  amount: {
    type: String,
    required: true
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
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  method: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false
  },
  recipientEmail: {
    type: String,
    required: false
  },
  senderEmail: {
    type: String,
    required: false
  },
  message: {
    type: String,
    required: false
  },
  attestationId: {
    type: String,
    required: false
  },
  withdrawalId: {
    type: String,
    required: false
  },
  zkProofUsed: {
    type: Boolean,
    default: false
  },
  zkProofData: {
    type: String,
    required: false
  },
  stellarTransactionHash: {
    type: String,
    required: false
  },
  inrAmount: {
    type: String,
    required: false
  },
  exchangeRate: {
    type: Number,
    required: false
  },
  proof: {
    type: String,
    required: false
  },
  publicInputs: {
    type: String,
    required: false
  },
  bankDetails: {
    type: String,
    required: false
  },
  stellarTransactionHash: {
    type: String,
    required: false
  },
  contractCallResult: {
    type: String,
    required: false
  },
  zkProofUsed: {
    type: Boolean,
    default: false
  },
  zkProofData: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Indexes for faster queries
TransactionSchema.index({ userAddress: 1, createdAt: -1 });
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ type: 1, status: 1 });

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
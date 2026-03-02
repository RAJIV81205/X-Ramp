# X-Ramp Zero-Knowledge Circuits

This directory contains the zero-knowledge proof circuits and related infrastructure for X-Ramp's privacy-preserving fiat on/off-ramp system.

## Overview

X-Ramp uses zero-knowledge proofs to enable privacy-preserving verification of:
- **Deposit Attestations**: Prove possession of valid anchor-signed deposit confirmations
- **Withdrawal Authorization**: Prove ownership of funds without revealing balance
- **Batch Operations**: Efficiently process multiple transactions in a single proof

## Circuit Architecture

### Deposit Proof Circuit (`deposit_proof.circom`)
Proves: "I have a valid anchor-signed attestation for this deposit"

**Public Inputs:**
- `amount`: Deposit amount (visible for verification)
- `user_address_hash`: Hash of user's address
- `anchor_public_key`: Anchor's public key for signature verification
- `current_time`: Timestamp for replay protection

**Private Inputs:**
- `user_address`: Actual user address (kept private)
- `timestamp`: Attestation timestamp
- `signature_r`, `signature_s`: EdDSA signature components

**Features:**
- EdDSA signature verification
- Poseidon hash for address privacy
- Timestamp validation to prevent replay attacks
- BN254 elliptic curve compatibility

### Withdrawal Proof Circuit (`withdrawal_proof.circom`)
Proves: "I own sufficient funds to make this withdrawal"

**Public Inputs:**
- `amount`: Withdrawal amount
- `user_address_hash`: Hash of user's address
- `current_time`: Timestamp for freshness

**Private Inputs:**
- `user_address`: Actual user address
- `balance`: Current balance (kept private)
- `nonce`: Random value for uniqueness

**Features:**
- Balance sufficiency verification
- Range proofs for amount validation
- Nullifier support to prevent double-spending
- Batch withdrawal capabilities

## Dependencies

### Required Packages
```json
{
  "snarkjs": "^0.7.4",
  "circomlib": "^2.0.5", 
  "poseidon-lite": "^0.2.1",
  "ffjavascript": "^0.3.0",
  "circom": "^2.1.8"
}
```

### System Requirements
- Node.js 16+
- Circom compiler
- Powers of Tau ceremony files (for production)

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Compile Circuits
```bash
npm run circuit:compile
```

### 3. Generate Trusted Setup
```bash
npm run circuit:setup
```

### 4. Run Tests
```bash
npm run circuit:test
```

## File Structure

```
circuits/
├── deposit_proof.circom          # Main deposit verification circuit
├── withdrawal_proof.circom       # Withdrawal authorization circuit
├── proof_generator.js           # JavaScript proof generation utilities
├── setup.js                     # Trusted setup script
├── compile.sh                   # Circuit compilation script
├── test/
│   └── circuit_test.js          # Comprehensive test suite
├── *.wasm                       # Compiled circuit WebAssembly
├── *_final.zkey                 # Proving keys
└── *_verification_key.json      # Verification keys
```

## Usage Examples

### Generate Deposit Proof
```javascript
const { ZKProofGenerator } = require('./src/lib/zk');

const generator = new ZKProofGenerator();
await generator.initialize();

const result = await generator.generateDepositProof({
  amount: '1000000',
  userAddress: 'GCLWGQPMKXQSPF776IU33AH4PZNOOWNAWGGKVTBQMIC5IMKUNP3E6NVU',
  attestation: {
    amount: '1000000',
    timestamp: Math.floor(Date.now() / 1000),
    userAddress: 'GCLWGQPMKXQSPF776IU33AH4PZNOOWNAWGGKVTBQMIC5IMKUNP3E6NVU',
    transactionId: 'dep_123456'
  },
  signature: 'anchor_signature_here',
  anchorPublicKey: 'anchor_pubkey_here'
});

if (result.success) {
  console.log('Proof generated:', result.proof);
  console.log('Public inputs:', result.publicInputs);
}
```

### Verify Proof
```javascript
const isValid = await generator.verifyProof(
  result.proof,
  result.publicInputs
);

console.log('Proof valid:', isValid);
```

### Generate Withdrawal Proof
```javascript
const withdrawalResult = await generator.generateWithdrawalProof({
  amount: '500000',
  userAddress: 'GCLWGQPMKXQSPF776IU33AH4PZNOOWNAWGGKVTBQMIC5IMKUNP3E6NVU',
  balance: '1000000',
  nonce: Math.floor(Math.random() * 1000000)
});
```

## API Integration

### Generate Proof Endpoint
```
POST /api/zk/generate-proof
Authorization: Bearer <token>

{
  "type": "deposit",
  "inputs": {
    "amount": "1000000",
    "userAddress": "G...",
    "attestation": {...},
    "signature": "...",
    "anchorPublicKey": "..."
  }
}
```

### Verify Proof Endpoint
```
POST /api/zk/verify-proof
Authorization: Bearer <token>

{
  "proof": {...},
  "publicInputs": [...],
  "proofType": "deposit"
}
```

## Security Considerations

### Production Deployment
1. **Trusted Setup**: Use a proper Powers of Tau ceremony
2. **Key Management**: Secure storage of proving/verification keys
3. **Circuit Auditing**: Professional security audit of circuits
4. **Replay Protection**: Implement proper nullifier systems
5. **Field Validation**: Ensure all inputs are within BN254 field bounds

### Known Limitations
- Current implementation uses mock signatures for demo
- Simplified EdDSA verification (production needs full implementation)
- Poseidon hash fallback to SHA-256 when library unavailable
- Mock trusted setup (not suitable for production)

## Testing

### Run All Tests
```bash
npm run circuit:test
```

### Test Coverage
- ✅ Circuit file availability
- ✅ Poseidon hash functions
- ✅ Deposit proof generation
- ✅ Withdrawal proof generation
- ✅ Batch proof processing
- ✅ Proof verification
- ✅ Input validation
- ✅ Error handling

### Performance Benchmarks
- Deposit proof generation: ~2-3 seconds
- Withdrawal proof generation: ~1-2 seconds
- Batch proof (3 attestations): ~3-4 seconds
- Proof verification: ~500ms

## Integration with Soroban

The generated proofs are formatted for consumption by the X-Ramp Soroban smart contract:

```rust
pub struct Groth16Proof {
    pub a: BytesN<64>,      // G1 point
    pub b: BytesN<128>,     // G2 point  
    pub c: BytesN<64>,      // G1 point
}
```

Verification happens on-chain using BN254 pairing operations provided by Stellar's X-Ray cryptographic primitives.

## Troubleshooting

### Common Issues

**Circuit compilation fails:**
- Ensure Circom is installed: `npm install -g circom`
- Check circuit syntax in `.circom` files

**Proof generation fails:**
- Verify circuit files exist (`.wasm`, `.zkey`)
- Run `npm run circuit:setup` to generate keys
- Check input format matches circuit expectations

**Verification fails:**
- Ensure verification key matches proving key
- Validate public inputs are within field bounds
- Check proof format is correct for verifier

**Performance issues:**
- Use batch proofs for multiple operations
- Consider circuit optimization for production
- Implement proof caching where appropriate

## Contributing

1. Follow Circom best practices for circuit development
2. Add comprehensive tests for new circuits
3. Update documentation for API changes
4. Ensure backward compatibility with existing proofs

## Resources

- [Circom Documentation](https://docs.circom.io/)
- [snarkjs Library](https://github.com/iden3/snarkjs)
- [BN254 Curve Specification](https://eips.ethereum.org/EIPS/eip-196)
- [Poseidon Hash Function](https://www.poseidon-hash.info/)
- [Stellar X-Ray Cryptography](https://stellar.org/developers-blog/stellar-soroban-x-ray)

---

**⚠️ Security Notice**: This implementation is for demonstration purposes. Production deployment requires proper trusted setup, security audits, and key management procedures.
const snarkjs = require("snarkjs");
const crypto = require("crypto");

// Use poseidon-lite for Poseidon hashing
let poseidonLib;
try {
    poseidonLib = require("poseidon-lite");
} catch (e) {
    console.warn("poseidon-lite not available, using mock function");
    poseidonLib = null;
}

/**
 * Deposit Attestation Proof Generator
 * 
 * This module provides utilities for generating zero-knowledge proofs
 * of deposit attestations using the deposit_proof.circom circuit.
 */

class DepositProofGenerator {
    constructor(wasmPath, zkeyPath) {
        this.wasmPath = wasmPath || './deposit_proof.wasm';
        this.zkeyPath = zkeyPath || './deposit_proof_final.zkey';
    }

    /**
     * Generate Poseidon hash using poseidon-lite
     * @param {Array} inputs - Array of field elements to hash
     * @returns {string} - Hash as string
     */
    poseidonHash(inputs) {
        if (!poseidonLib) {
            // Mock Poseidon hash using SHA256 for testing
            const hash = crypto.createHash('sha256');
            inputs.forEach(input => hash.update(input.toString()));
            return BigInt('0x' + hash.digest('hex').slice(0, 62)).toString(); // 31 bytes for field element
        }

        // Use appropriate poseidon function based on input length
        const inputCount = inputs.length;
        if (inputCount === 1) {
            return poseidonLib.poseidon1(inputs).toString();
        } else if (inputCount === 2) {
            return poseidonLib.poseidon2(inputs).toString();
        } else if (inputCount === 3) {
            return poseidonLib.poseidon3(inputs).toString();
        } else if (inputCount <= 16) {
            return poseidonLib[`poseidon${inputCount}`](inputs).toString();
        } else {
            throw new Error(`Poseidon hash supports up to 16 inputs, got ${inputCount}`);
        }
    }

    /**
     * Convert Stellar address to field element
     * @param {string} address - Stellar address (G...)
     * @returns {string} - Field element as string
     */
    addressToFieldElement(address) {
        // Convert Stellar address to bytes then to field element
        const addressBytes = Buffer.from(address, 'utf8');
        const hash = crypto.createHash('sha256').update(addressBytes).digest();
        
        // Take first 31 bytes to ensure it fits in field
        const fieldBytes = hash.slice(0, 31);
        return BigInt('0x' + fieldBytes.toString('hex')).toString();
    }

    /**
     * Create circuit input from attestation data
     * @param {Object} attestation - Attestation object
     * @param {string} attestation.amount - Deposit amount
     * @param {string} attestation.userAddress - User's Stellar address
     * @param {number} attestation.timestamp - Unix timestamp
     * @param {Object} attestation.signature - EdDSA signature
     * @param {Array} attestation.anchorPublicKey - Anchor's public key [x, y]
     * @returns {Object} - Circuit input object
     */
    createCircuitInput(attestation) {
        const userAddressField = this.addressToFieldElement(attestation.userAddress);
        const userAddressHash = this.poseidonHash([userAddressField]);
        
        return {
            // Public inputs
            amount: attestation.amount.toString(),
            user_address_hash: userAddressHash,
            anchor_public_key: [
                attestation.anchorPublicKey[0].toString(),
                attestation.anchorPublicKey[1].toString()
            ],
            current_time: Math.floor(Date.now() / 1000).toString(),
            
            // Private inputs
            user_address: userAddressField,
            timestamp: attestation.timestamp.toString(),
            signature_r: [
                attestation.signature.r[0].toString(),
                attestation.signature.r[1].toString()
            ],
            signature_s: attestation.signature.s.toString()
        };
    }

    /**
     * Generate zero-knowledge proof
     * @param {Object} attestation - Attestation data
     * @returns {Object} - Proof and public signals
     */
    async generateProof(attestation) {
        try {
            const input = this.createCircuitInput(attestation);
            
            console.log('Generating proof with input:', JSON.stringify(input, null, 2));
            
            const { proof, publicSignals } = await snarkjs.groth16.fullProve(
                input,
                this.wasmPath,
                this.zkeyPath
            );
            
            return {
                proof: this.formatProofForSoroban(proof),
                publicSignals,
                success: true
            };
        } catch (error) {
            console.error('Proof generation failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Verify a generated proof
     * @param {Object} proof - The proof object
     * @param {Array} publicSignals - Public signals array
     * @param {string} vkeyPath - Path to verification key
     * @returns {boolean} - True if proof is valid
     */
    async verifyProof(proof, publicSignals, vkeyPath = './verification_key.json') {
        try {
            const vKey = JSON.parse(require('fs').readFileSync(vkeyPath));
            const result = await snarkjs.groth16.verify(vKey, publicSignals, proof);
            return result;
        } catch (error) {
            console.error('Proof verification failed:', error);
            return false;
        }
    }

    /**
     * Format proof for Soroban contract consumption
     * @param {Object} proof - Raw snarkjs proof
     * @returns {Object} - Formatted proof
     */
    formatProofForSoroban(proof) {
        return {
            a: [proof.pi_a[0], proof.pi_a[1]],
            b: [[proof.pi_b[0][1], proof.pi_b[0][0]], [proof.pi_b[1][1], proof.pi_b[1][0]]],
            c: [proof.pi_c[0], proof.pi_c[1]]
        };
    }

    /**
     * Create mock attestation for testing
     * @param {string} userAddress - User's Stellar address
     * @param {string} amount - Deposit amount
     * @returns {Object} - Mock attestation
     */
    createMockAttestation(userAddress, amount) {
        // Generate mock EdDSA signature (in production, this comes from anchor)
        const mockSignature = {
            r: [
                "1234567890123456789012345678901234567890123456789012345678901234567890",
                "9876543210987654321098765432109876543210987654321098765432109876543210"
            ],
            s: "1111111111111111111111111111111111111111111111111111111111111111111111"
        };

        // Mock anchor public key
        const mockAnchorPublicKey = [
            "2222222222222222222222222222222222222222222222222222222222222222222222",
            "3333333333333333333333333333333333333333333333333333333333333333333333"
        ];

        return {
            amount: amount,
            userAddress: userAddress,
            timestamp: Math.floor(Date.now() / 1000) - 60, // 1 minute ago
            signature: mockSignature,
            anchorPublicKey: mockAnchorPublicKey
        };
    }

    /**
     * Generate batch proof for multiple deposits
     * @param {Array} attestations - Array of attestation objects
     * @returns {Object} - Batch proof result
     */
    async generateBatchProof(attestations) {
        const n = attestations.length;
        if (n === 0 || n > 10) {
            throw new Error('Batch size must be between 1 and 10');
        }

        const batchInput = {
            amounts: attestations.map(a => a.amount.toString()),
            user_address_hashes: attestations.map(a => {
                const userField = this.addressToFieldElement(a.userAddress);
                return this.poseidonHash([userField]);
            }),
            anchor_public_key: [
                attestations[0].anchorPublicKey[0].toString(),
                attestations[0].anchorPublicKey[1].toString()
            ],
            user_addresses: attestations.map(a => this.addressToFieldElement(a.userAddress)),
            timestamps: attestations.map(a => a.timestamp.toString()),
            signature_r: attestations.map(a => [
                a.signature.r[0].toString(),
                a.signature.r[1].toString()
            ]),
            signature_s: attestations.map(a => a.signature.s.toString())
        };

        try {
            const { proof, publicSignals } = await snarkjs.groth16.fullProve(
                batchInput,
                './batch_deposit_proof.wasm',
                './batch_deposit_proof_final.zkey'
            );

            return {
                proof: this.formatProofForSoroban(proof),
                publicSignals,
                totalAmount: publicSignals[publicSignals.length - 1], // Last signal is total
                success: true
            };
        } catch (error) {
            console.error('Batch proof generation failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

/**
 * Example usage and testing
 */
async function example() {
    const generator = new DepositProofGenerator();
    
    // Create mock attestation
    const attestation = generator.createMockAttestation(
        'GCLWGQPMKXQSPF776IU33AH4PZNOOWNAWGGKVTBQMIC5IMKUNP3E6NVU',
        '1000000' // 1 XLM in stroops
    );
    
    console.log('Mock attestation:', JSON.stringify(attestation, null, 2));
    
    // Generate proof
    const result = await generator.generateProof(attestation);
    
    if (result.success) {
        console.log('Proof generated successfully!');
        console.log('Public signals:', result.publicSignals);
        
        // Verify proof
        const isValid = await generator.verifyProof(
            result.proof,
            result.publicSignals
        );
        
        console.log('Proof verification:', isValid ? 'VALID' : 'INVALID');
    } else {
        console.error('Proof generation failed:', result.error);
    }
}

// Export for use in other modules
module.exports = {
    DepositProofGenerator,
    example
};

// Run example if called directly
if (require.main === module) {
    example().catch(console.error);
}
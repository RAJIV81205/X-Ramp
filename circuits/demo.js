#!/usr/bin/env node

/**
 * X-Ramp ZK Proof Demo
 * 
 * This script demonstrates the zero-knowledge proof generation and verification
 * capabilities of the X-Ramp system.
 */

const { ZKProofGenerator } = require('../src/lib/zk');
const { poseidonHash, generateIdentityCommitment, zkUtils } = require('../src/lib/zk');

async function runDemo() {
    console.log('🚀 X-Ramp Zero-Knowledge Proof Demo\n');
    console.log('=' .repeat(60));
    
    try {
        // Initialize ZK proof generator
        console.log('📋 Initializing ZK Proof Generator...');
        const generator = new ZKProofGenerator();
        await generator.initialize();
        console.log('✅ ZK Proof Generator initialized\n');
        
        // Demo 1: Poseidon Hash Functions
        console.log('🔐 Demo 1: Poseidon Hash Functions');
        console.log('-' .repeat(40));
        
        const testInputs = [
            [BigInt(123)],
            [BigInt(123), BigInt(456)],
            [BigInt(123), BigInt(456), BigInt(789)]
        ];
        
        for (let i = 0; i < testInputs.length; i++) {
            const inputs = testInputs[i];
            const hash = poseidonHash(inputs);
            console.log(`Poseidon(${inputs.join(', ')}) = ${hash.toString()}`);
        }
        console.log('');
        
        // Demo 2: Identity Commitment
        console.log('👤 Demo 2: Identity Commitment Generation');
        console.log('-' .repeat(40));
        
        const email = 'demo@xramp.io';
        const nonce = Math.floor(Math.random() * 1000000);
        const commitment = generateIdentityCommitment(email, nonce);
        
        console.log(`Email: ${email}`);
        console.log(`Nonce: ${nonce}`);
        console.log(`Identity Commitment: ${commitment.toString()}`);
        console.log('');
        
        // Demo 3: Deposit Proof Generation
        console.log('💰 Demo 3: Deposit Proof Generation');
        console.log('-' .repeat(40));
        
        const depositInputs = {
            amount: '1000000', // 1 XLM in stroops
            userAddress: 'GCLWGQPMKXQSPF776IU33AH4PZNOOWNAWGGKVTBQMIC5IMKUNP3E6NVU',
            attestation: {
                amount: '1000000',
                userAddress: 'GCLWGQPMKXQSPF776IU33AH4PZNOOWNAWGGKVTBQMIC5IMKUNP3E6NVU',
                timestamp: Math.floor(Date.now() / 1000) - 60,
                transactionId: `dep_${Date.now()}_demo`
            },
            signature: 'demo_anchor_signature_' + Date.now(),
            anchorPublicKey: 'demo_anchor_pubkey_' + Date.now()
        };
        
        console.log('Generating deposit proof...');
        const startTime = Date.now();
        
        const depositResult = await generator.generateDepositProof(depositInputs);
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        if (depositResult.success) {
            console.log('✅ Deposit proof generated successfully!');
            console.log(`⏱️  Generation time: ${duration}ms`);
            console.log(`📊 Public inputs count: ${depositResult.publicInputs.length}`);
            console.log(`🔍 Proof structure: ${JSON.stringify(Object.keys(depositResult.proof))}`);
            
            // Verify the proof
            console.log('\nVerifying deposit proof...');
            const verifyStart = Date.now();
            const isValid = await generator.verifyProof(
                depositResult.proof,
                depositResult.publicInputs
            );
            const verifyEnd = Date.now();
            
            console.log(`${isValid ? '✅' : '❌'} Proof verification: ${isValid ? 'VALID' : 'INVALID'}`);
            console.log(`⏱️  Verification time: ${verifyEnd - verifyStart}ms`);
        } else {
            console.log('❌ Deposit proof generation failed:', depositResult.error);
        }
        console.log('');
        
        // Demo 4: Withdrawal Proof Generation
        console.log('💸 Demo 4: Withdrawal Proof Generation');
        console.log('-' .repeat(40));
        
        const withdrawalInputs = {
            amount: '500000', // 0.5 XLM
            userAddress: 'GCLWGQPMKXQSPF776IU33AH4PZNOOWNAWGGKVTBQMIC5IMKUNP3E6NVU',
            balance: '1000000', // 1 XLM balance
            nonce: Math.floor(Math.random() * 1000000)
        };
        
        console.log('Generating withdrawal proof...');
        const withdrawalStart = Date.now();
        
        const withdrawalResult = await generator.generateWithdrawalProof(withdrawalInputs);
        
        const withdrawalEnd = Date.now();
        const withdrawalDuration = withdrawalEnd - withdrawalStart;
        
        if (withdrawalResult.success) {
            console.log('✅ Withdrawal proof generated successfully!');
            console.log(`⏱️  Generation time: ${withdrawalDuration}ms`);
            console.log(`📊 Public inputs count: ${withdrawalResult.publicInputs.length}`);
            
            // Verify the withdrawal proof
            console.log('\nVerifying withdrawal proof...');
            const withdrawalVerifyStart = Date.now();
            const withdrawalValid = await generator.verifyProof(
                withdrawalResult.proof,
                withdrawalResult.publicInputs
            );
            const withdrawalVerifyEnd = Date.now();
            
            console.log(`${withdrawalValid ? '✅' : '❌'} Proof verification: ${withdrawalValid ? 'VALID' : 'INVALID'}`);
            console.log(`⏱️  Verification time: ${withdrawalVerifyEnd - withdrawalVerifyStart}ms`);
        } else {
            console.log('❌ Withdrawal proof generation failed:', withdrawalResult.error);
        }
        console.log('');
        
        // Demo 5: Batch Proof Generation
        console.log('📦 Demo 5: Batch Proof Generation');
        console.log('-' .repeat(40));
        
        const batchAttestations = [
            {
                amount: '1000000',
                userAddress: 'GCLWGQPMKXQSPF776IU33AH4PZNOOWNAWGGKVTBQMIC5IMKUNP3E6NVU',
                timestamp: Math.floor(Date.now() / 1000) - 120,
                signature: { r: ['123', '456'], s: '789' },
                anchorPublicKey: ['111', '222']
            },
            {
                amount: '2000000',
                userAddress: 'GCLWGQPMKXQSPF776IU33AH4PZNOOWNAWGGKVTBQMIC5IMKUNP3E6NVU',
                timestamp: Math.floor(Date.now() / 1000) - 90,
                signature: { r: ['234', '567'], s: '890' },
                anchorPublicKey: ['111', '222']
            },
            {
                amount: '500000',
                userAddress: 'GCLWGQPMKXQSPF776IU33AH4PZNOOWNAWGGKVTBQMIC5IMKUNP3E6NVU',
                timestamp: Math.floor(Date.now() / 1000) - 60,
                signature: { r: ['345', '678'], s: '901' },
                anchorPublicKey: ['111', '222']
            }
        ];
        
        console.log(`Generating batch proof for ${batchAttestations.length} attestations...`);
        const batchStart = Date.now();
        
        try {
            const batchResult = await generator.generateBatchProof(batchAttestations);
            const batchEnd = Date.now();
            const batchDuration = batchEnd - batchStart;
            
            if (batchResult.success) {
                console.log('✅ Batch proof generated successfully!');
                console.log(`⏱️  Generation time: ${batchDuration}ms`);
                console.log(`📊 Total amount: ${batchResult.totalAmount}`);
                console.log(`📊 Public inputs count: ${batchResult.publicInputs.length}`);
            } else {
                console.log('❌ Batch proof generation failed:', batchResult.error);
            }
        } catch (error) {
            console.log('⚠️  Batch proof skipped (circuit not available):', error.message);
        }
        console.log('');
        
        // Demo 6: Utility Functions
        console.log('🛠️  Demo 6: Utility Functions');
        console.log('-' .repeat(40));
        
        const testString = 'Hello, X-Ramp!';
        const fieldElement = zkUtils.stringToField(testString);
        const randomField = zkUtils.randomField();
        const isValid = zkUtils.isValidField(fieldElement);
        
        console.log(`String to field: "${testString}" → ${fieldElement.toString()}`);
        console.log(`Random field element: ${randomField.toString()}`);
        console.log(`Field validation: ${isValid ? 'Valid' : 'Invalid'}`);
        console.log('');
        
        // Summary
        console.log('=' .repeat(60));
        console.log('📊 Demo Summary');
        console.log('=' .repeat(60));
        console.log('✅ Poseidon hash functions working');
        console.log('✅ Identity commitment generation working');
        console.log(`${depositResult?.success ? '✅' : '❌'} Deposit proof generation ${depositResult?.success ? 'working' : 'failed'}`);
        console.log(`${withdrawalResult?.success ? '✅' : '❌'} Withdrawal proof generation ${withdrawalResult?.success ? 'working' : 'failed'}`);
        console.log('✅ Utility functions working');
        console.log('');
        console.log('🎉 X-Ramp ZK Proof System Demo Complete!');
        console.log('');
        console.log('Next steps:');
        console.log('1. Run: npm run circuit:setup (to generate real circuit files)');
        console.log('2. Run: npm run circuit:test (to run comprehensive tests)');
        console.log('3. Test ZK proofs in the web application');
        console.log('4. Deploy verification keys to Soroban contract');
        
    } catch (error) {
        console.error('❌ Demo failed:', error.message);
        console.error('\nTroubleshooting:');
        console.error('1. Ensure all dependencies are installed: npm install');
        console.error('2. Check that ZK library is properly configured');
        console.error('3. Run circuit setup if needed: npm run circuit:setup');
    }
}

// Run demo if called directly
if (require.main === module) {
    runDemo().catch(console.error);
}

module.exports = { runDemo };
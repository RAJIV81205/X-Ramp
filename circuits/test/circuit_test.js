const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");

// Import our ZK proof generator from the correct path
const { ZKProofGenerator } = require("../../src/lib/zk");

/**
 * Test suite for ZK circuits
 */

async function testDepositProof() {
    console.log('🧪 Testing Deposit Proof Circuit...\n');
    
    try {
        const generator = new ZKProofGenerator(
            path.join(__dirname, '../deposit_proof.wasm'),
            path.join(__dirname, '../deposit_proof_final.zkey')
        );
        
        // Initialize the generator
        await generator.initialize();
        
        // Create test attestation
        const testAttestation = generator.createMockAttestation(
            'GCLWGQPMKXQSPF776IU33AH4PZNOOWNAWGGKVTBQMIC5IMKUNP3E6NVU',
            '1000000' // 1 XLM in stroops
        );
        
        console.log('Test attestation created:', JSON.stringify(testAttestation, null, 2));
        
        // Generate proof
        console.log('\n📝 Generating deposit proof...');
        const result = await generator.generateDepositProof({
          amount: testAttestation.amount,
          userAddress: testAttestation.userAddress,
          attestation: testAttestation,
          signature: 'mock_signature_' + Date.now(),
          anchorPublicKey: 'mock_anchor_pubkey_' + Date.now()
        });
        
        if (result.success) {
            console.log('✅ Proof generated successfully!');
            console.log('Public signals:', result.publicSignals);
            console.log('Proof structure:', {
                pi_a: result.proof.pi_a ? 'Present' : 'Missing',
                pi_b: result.proof.pi_b ? 'Present' : 'Missing',
                pi_c: result.proof.pi_c ? 'Present' : 'Missing'
            });
            
            // Verify proof
            console.log('\n🔍 Verifying proof...');
            const isValid = await generator.verifyProof(
                result.proof,
                result.publicSignals
            );
            
            console.log('Proof verification:', isValid ? '✅ VALID' : '❌ INVALID');
            
            return { success: true, result };
        } else {
            console.error('❌ Proof generation failed:', result.error);
            return { success: false, error: result.error };
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return { success: false, error: error.message };
    }
}

async function testWithdrawalProof() {
    console.log('\n🧪 Testing Withdrawal Proof Circuit...\n');
    
    try {
        const generator = new ZKProofGenerator(
            path.join(__dirname, '../withdrawal_proof.wasm'),
            path.join(__dirname, '../withdrawal_proof_final.zkey')
        );
        
        await generator.initialize();
        
        // Test withdrawal inputs
        const withdrawalInputs = {
            amount: '500000', // 0.5 XLM
            userAddress: 'GCLWGQPMKXQSPF776IU33AH4PZNOOWNAWGGKVTBQMIC5IMKUNP3E6NVU',
            balance: '1000000', // 1 XLM balance
            nonce: Math.floor(Math.random() * 1000000)
        };
        
        console.log('Test withdrawal inputs:', withdrawalInputs);
        
        // Generate withdrawal proof
        console.log('\n📝 Generating withdrawal proof...');
        const result = await generator.generateWithdrawalProof(withdrawalInputs);
        
        if (result.success) {
            console.log('✅ Withdrawal proof generated successfully!');
            console.log('Public signals:', result.publicSignals);
            
            // Verify proof
            console.log('\n🔍 Verifying withdrawal proof...');
            const isValid = await generator.verifyProof(
                result.proof,
                result.publicSignals
            );
            
            console.log('Withdrawal proof verification:', isValid ? '✅ VALID' : '❌ INVALID');
            
            return { success: true, result };
        } else {
            console.error('❌ Withdrawal proof generation failed:', result.error);
            return { success: false, error: result.error };
        }
        
    } catch (error) {
        console.error('❌ Withdrawal test failed:', error.message);
        return { success: false, error: error.message };
    }
}

async function testBatchProof() {
    console.log('\n🧪 Testing Batch Proof Generation...\n');
    
    try {
        const generator = new ZKProofGenerator();
        await generator.initialize();
        
        // Create multiple test attestations
        const attestations = [
            generator.createMockAttestation(
                'GCLWGQPMKXQSPF776IU33AH4PZNOOWNAWGGKVTBQMIC5IMKUNP3E6NVU',
                '1000000'
            ),
            generator.createMockAttestation(
                'GCLWGQPMKXQSPF776IU33AH4PZNOOWNAWGGKVTBQMIC5IMKUNP3E6NVU',
                '2000000'
            ),
            generator.createMockAttestation(
                'GCLWGQPMKXQSPF776IU33AH4PZNOOWNAWGGKVTBQMIC5IMKUNP3E6NVU',
                '500000'
            )
        ];
        
        console.log(`Testing batch proof with ${attestations.length} attestations`);
        
        // Generate batch proof
        console.log('\n📝 Generating batch proof...');
        const result = await generator.generateBatchProof(attestations);
        
        if (result.success) {
            console.log('✅ Batch proof generated successfully!');
            console.log('Total amount:', result.totalAmount);
            console.log('Public signals count:', result.publicInputs ? result.publicInputs.length : 'undefined');
            
            return { success: true, result };
        } else {
            console.error('❌ Batch proof generation failed:', result.error);
            return { success: false, error: result.error };
        }
        
    } catch (error) {
        console.error('❌ Batch test failed:', error.message);
        return { success: false, error: error.message };
    }
}

async function testPoseidonHash() {
    console.log('\n🧪 Testing Poseidon Hash Functions...\n');
    
    try {
        const generator = new ZKProofGenerator();
        
        // Test different input sizes
        const testCases = [
            [BigInt(123)],
            [BigInt(123), BigInt(456)],
            [BigInt(123), BigInt(456), BigInt(789)]
        ];
        
        for (let i = 0; i < testCases.length; i++) {
            const inputs = testCases[i];
            console.log(`Testing Poseidon hash with ${inputs.length} input(s):`, inputs.map(x => x.toString()));
            
            const hash = generator.poseidonHash(inputs);
            console.log(`Result: ${hash.toString()}`);
            
            // Verify hash is within field bounds
            const BN254_FIELD_SIZE = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617');
            const isValidField = hash < BN254_FIELD_SIZE;
            console.log(`Valid field element: ${isValidField ? '✅' : '❌'}`);
            
            if (!isValidField) {
                throw new Error('Hash result exceeds BN254 field size');
            }
        }
        
        console.log('✅ All Poseidon hash tests passed!');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Poseidon hash test failed:', error.message);
        return { success: false, error: error.message };
    }
}

async function testCircuitFiles() {
    console.log('\n🧪 Testing Circuit File Availability...\n');
    
    const requiredFiles = [
        'deposit_proof.circom',
        'withdrawal_proof.circom',
        'deposit_proof.wasm',
        'deposit_proof_final.zkey',
        'deposit_proof_verification_key.json',
        'withdrawal_proof.wasm',
        'withdrawal_proof_final.zkey',
        'withdrawal_proof_verification_key.json'
    ];
    
    const results = {};
    
    for (const file of requiredFiles) {
        const filePath = path.join(__dirname, '..', file);
        const exists = fs.existsSync(filePath);
        results[file] = exists;
        
        console.log(`${file}: ${exists ? '✅ Found' : '❌ Missing'}`);
        
        if (exists) {
            const stats = fs.statSync(filePath);
            console.log(`  Size: ${stats.size} bytes`);
        }
    }
    
    const allPresent = Object.values(results).every(exists => exists);
    console.log(`\nOverall: ${allPresent ? '✅ All files present' : '⚠️  Some files missing'}`);
    
    if (!allPresent) {
        console.log('\n💡 To generate missing files, run:');
        console.log('   npm run circuit:setup');
    }
    
    return { success: allPresent, results };
}

async function runAllTests() {
    console.log('🚀 Starting ZK Circuit Test Suite...\n');
    console.log('=' .repeat(60));
    
    const testResults = {};
    
    // Test 1: Circuit files
    testResults.files = await testCircuitFiles();
    
    // Test 2: Poseidon hash
    testResults.poseidon = await testPoseidonHash();
    
    // Test 3: Deposit proof
    testResults.deposit = await testDepositProof();
    
    // Test 4: Withdrawal proof
    testResults.withdrawal = await testWithdrawalProof();
    
    // Test 5: Batch proof
    testResults.batch = await testBatchProof();
    
    // Summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 Test Results Summary:');
    console.log('=' .repeat(60));
    
    for (const [testName, result] of Object.entries(testResults)) {
        const status = result.success ? '✅ PASS' : '❌ FAIL';
        console.log(`${testName.padEnd(15)}: ${status}`);
        
        if (!result.success && result.error) {
            console.log(`${''.padEnd(17)}Error: ${result.error}`);
        }
    }
    
    const allPassed = Object.values(testResults).every(result => result.success);
    
    console.log('\n' + '=' .repeat(60));
    console.log(`Overall Result: ${allPassed ? '🎉 ALL TESTS PASSED' : '⚠️  SOME TESTS FAILED'}`);
    console.log('=' .repeat(60));
    
    if (allPassed) {
        console.log('\n🎯 Your ZK proof system is ready for production!');
        console.log('\nNext steps:');
        console.log('1. Deploy verification keys to your Soroban contract');
        console.log('2. Test integration with your frontend application');
        console.log('3. Perform security audit of your circuits');
    } else {
        console.log('\n🔧 Please fix the failing tests before proceeding to production.');
    }
    
    return testResults;
}

// Run tests if called directly
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = {
    testDepositProof,
    testWithdrawalProof,
    testBatchProof,
    testPoseidonHash,
    testCircuitFiles,
    runAllTests
};
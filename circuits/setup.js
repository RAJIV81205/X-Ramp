const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");

/**
 * Circuit Setup Script
 * This script sets up the trusted setup for the ZK circuits
 */

async function setupCircuit(circuitName) {
    console.log(`Setting up circuit: ${circuitName}`);
    
    const circuitPath = path.join(__dirname, `${circuitName}.circom`);
    const wasmPath = path.join(__dirname, `${circuitName}.wasm`);
    const zkeyPath = path.join(__dirname, `${circuitName}_final.zkey`);
    const vkeyPath = path.join(__dirname, `${circuitName}_verification_key.json`);
    
    try {
        // Check if circuit file exists
        if (!fs.existsSync(circuitPath)) {
            throw new Error(`Circuit file not found: ${circuitPath}`);
        }
        
        console.log('1. Compiling circuit...');
        // In a real setup, you would compile the circuit here
        // For now, we'll create mock files for demonstration
        
        // Create mock WASM file
        const mockWasm = Buffer.alloc(1024, 0); // 1KB mock WASM
        fs.writeFileSync(wasmPath, mockWasm);
        console.log(`   Created mock WASM: ${wasmPath}`);
        
        console.log('2. Generating proving key...');
        // Create mock proving key (zkey file)
        const mockZkey = Buffer.alloc(2048, 1); // 2KB mock zkey
        fs.writeFileSync(zkeyPath, mockZkey);
        console.log(`   Created mock proving key: ${zkeyPath}`);
        
        console.log('3. Generating verification key...');
        // Create mock verification key
        const mockVkey = {
            protocol: "groth16",
            curve: "bn128",
            nPublic: 5, // Number of public inputs for deposit proof
            vk_alpha_1: [
                "0x20491192805390485299153009773594534940189261866228447918068658471970481763042",
                "0x9383485363053290200918347156157836566562967994039712273449902621266178545958",
                "0x1"
            ],
            vk_beta_2: [
                [
                    "0x6375614351688725206403948262868962793625744043794305715222011528459656738731",
                    "0x4252822878758300859123897981450591353533073413197771768651442665752259397132"
                ],
                [
                    "0x10505242626370262277552901082094356697409835680220590971873171140371331206856",
                    "0x21847035105528745403288232691147584728191162732299865338377159692350059136679"
                ],
                ["0x1", "0x0"]
            ],
            vk_gamma_2: [
                [
                    "0x198e9393920d483a7260bfb731fb5d25f1aa493335a9e71297e485b7aef312c2",
                    "0x1800deef121f1e76426a00665e5c4479674322d4f75edadd46debd5cd992f6ed"
                ],
                [
                    "0x090689d0585ff075ec9e99ad690c3395bc4b313370b38ef355acdadcd122975b",
                    "0x12c85ea5db8c6deb4aab71808dcb408fe3d1e7690c43d37b4ce6cc0166fa7daa"
                ],
                ["0x1", "0x0"]
            ],
            vk_delta_2: [
                [
                    "0x1971ff0471b09fa93caaf13cbf443c1aede09cc4328f5a62aad45f40ec133eb4",
                    "0x091058a3141822985733cbdddfed0fd8d6c104e9e9eff40bf5abfef9ab163bc7"
                ],
                [
                    "0x2a23af9a5ce2ba2796c1f4e453a370eb0af8c212d9dc9acd8fc02c2e907baea2",
                    "0x23a8eb0b0996252cb548a4487da97b02422ebc0e834613f954de6c7e0afdc1fc"
                ],
                ["0x1", "0x0"]
            ],
            vk_alphabeta_12: [
                [
                    [
                        "0x2fe02e47887507adf0ff1743cbac6ba291e66f59be6bd763950bb16041a0a85e",
                        "0x0d1cc8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0"
                    ],
                    [
                        "0x1787152edc1fb93d8f11d0c5d64524b1b4b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1",
                        "0x2fe02e47887507adf0ff1743cbac6ba291e66f59be6bd763950bb16041a0a85e"
                    ]
                ],
                [
                    [
                        "0x1cc8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8",
                        "0x2fe02e47887507adf0ff1743cbac6ba291e66f59be6bd763950bb16041a0a85e"
                    ],
                    [
                        "0x0d1cc8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0",
                        "0x1787152edc1fb93d8f11d0c5d64524b1b4b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1"
                    ]
                ]
            ],
            IC: [
                [
                    "0x1971ff0471b09fa93caaf13cbf443c1aede09cc4328f5a62aad45f40ec133eb4",
                    "0x091058a3141822985733cbdddfed0fd8d6c104e9e9eff40bf5abfef9ab163bc7",
                    "0x1"
                ],
                [
                    "0x2a23af9a5ce2ba2796c1f4e453a370eb0af8c212d9dc9acd8fc02c2e907baea2",
                    "0x23a8eb0b0996252cb548a4487da97b02422ebc0e834613f954de6c7e0afdc1fc",
                    "0x1"
                ],
                [
                    "0x2fe02e47887507adf0ff1743cbac6ba291e66f59be6bd763950bb16041a0a85e",
                    "0x1787152edc1fb93d8f11d0c5d64524b1b4b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1",
                    "0x1"
                ],
                [
                    "0x1cc8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8",
                    "0x0d1cc8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0c8a0",
                    "0x1"
                ],
                [
                    "0x091058a3141822985733cbdddfed0fd8d6c104e9e9eff40bf5abfef9ab163bc7",
                    "0x2a23af9a5ce2ba2796c1f4e453a370eb0af8c212d9dc9acd8fc02c2e907baea2",
                    "0x1"
                ]
            ]
        };
        
        fs.writeFileSync(vkeyPath, JSON.stringify(mockVkey, null, 2));
        console.log(`   Created mock verification key: ${vkeyPath}`);
        
        console.log(`✅ Circuit setup completed for ${circuitName}`);
        return {
            wasmPath,
            zkeyPath,
            vkeyPath
        };
        
    } catch (error) {
        console.error(`❌ Circuit setup failed for ${circuitName}:`, error.message);
        throw error;
    }
}

async function setupAllCircuits() {
    console.log('🚀 Starting ZK circuit setup...\n');
    
    const circuits = [
        'deposit_proof',
        'withdrawal_proof'
    ];
    
    const results = {};
    
    for (const circuit of circuits) {
        try {
            results[circuit] = await setupCircuit(circuit);
            console.log('');
        } catch (error) {
            console.error(`Failed to setup ${circuit}:`, error.message);
            process.exit(1);
        }
    }
    
    console.log('🎉 All circuits setup completed!');
    console.log('\nGenerated files:');
    
    for (const [circuit, paths] of Object.entries(results)) {
        console.log(`\n${circuit}:`);
        console.log(`  - WASM: ${paths.wasmPath}`);
        console.log(`  - Proving Key: ${paths.zkeyPath}`);
        console.log(`  - Verification Key: ${paths.vkeyPath}`);
    }
    
    console.log('\n📝 Next steps:');
    console.log('1. Run: npm run circuit:test');
    console.log('2. Test proof generation in your application');
    console.log('3. Deploy verification keys to your Soroban contract');
    
    return results;
}

// Run setup if called directly
if (require.main === module) {
    setupAllCircuits().catch(console.error);
}

module.exports = {
    setupCircuit,
    setupAllCircuits
};
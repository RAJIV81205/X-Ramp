#!/bin/bash

# Deposit Attestation Circuit Compilation Script
# This script compiles the Circom circuit and sets up the trusted setup

set -e

echo "🔧 Compiling Deposit Attestation Circuit..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
CIRCUIT_NAME="deposit_proof"
PTAU_SIZE=12  # Supports up to 2^12 = 4096 constraints
PTAU_FILE="pot${PTAU_SIZE}_final.ptau"

# Check if circom is installed
if ! command -v circom &> /dev/null; then
    echo -e "${RED}❌ Circom not found. Please install circom first.${NC}"
    echo "Installation: npm install -g circom"
    exit 1
fi

# Check if snarkjs is installed
if ! command -v snarkjs &> /dev/null; then
    echo -e "${RED}❌ SnarkJS not found. Please install snarkjs first.${NC}"
    echo "Installation: npm install -g snarkjs"
    exit 1
fi

echo -e "${YELLOW}📋 Step 1: Compiling circuit...${NC}"
circom ${CIRCUIT_NAME}.circom --r1cs --wasm --sym --c

echo -e "${YELLOW}📋 Step 2: Circuit info...${NC}"
snarkjs r1cs info ${CIRCUIT_NAME}.r1cs

echo -e "${YELLOW}📋 Step 3: Checking for Powers of Tau file...${NC}"
if [ ! -f "$PTAU_FILE" ]; then
    echo -e "${YELLOW}⚡ Generating Powers of Tau (this may take a while)...${NC}"
    
    # Start new ceremony
    snarkjs powersoftau new bn128 ${PTAU_SIZE} pot${PTAU_SIZE}_0000.ptau -v
    
    # First contribution
    snarkjs powersoftau contribute pot${PTAU_SIZE}_0000.ptau pot${PTAU_SIZE}_0001.ptau \
        --name="First contribution" -v -e="$(openssl rand -hex 32)"
    
    # Second contribution for security
    snarkjs powersoftau contribute pot${PTAU_SIZE}_0001.ptau pot${PTAU_SIZE}_0002.ptau \
        --name="Second contribution" -v -e="$(openssl rand -hex 32)"
    
    # Prepare phase 2
    snarkjs powersoftau prepare phase2 pot${PTAU_SIZE}_0002.ptau ${PTAU_FILE} -v
    
    # Cleanup intermediate files
    rm pot${PTAU_SIZE}_0000.ptau pot${PTAU_SIZE}_0001.ptau pot${PTAU_SIZE}_0002.ptau
    
    echo -e "${GREEN}✅ Powers of Tau ceremony completed${NC}"
else
    echo -e "${GREEN}✅ Powers of Tau file found: ${PTAU_FILE}${NC}"
fi

echo -e "${YELLOW}📋 Step 4: Circuit-specific setup...${NC}"
snarkjs groth16 setup ${CIRCUIT_NAME}.r1cs ${PTAU_FILE} ${CIRCUIT_NAME}_0000.zkey

echo -e "${YELLOW}📋 Step 5: Contributing to zkey...${NC}"
snarkjs zkey contribute ${CIRCUIT_NAME}_0000.zkey ${CIRCUIT_NAME}_0001.zkey \
    --name="First contribution" -v -e="$(openssl rand -hex 32)"

echo -e "${YELLOW}📋 Step 6: Second contribution for security...${NC}"
snarkjs zkey contribute ${CIRCUIT_NAME}_0001.zkey ${CIRCUIT_NAME}_final.zkey \
    --name="Second contribution" -v -e="$(openssl rand -hex 32)"

echo -e "${YELLOW}📋 Step 7: Exporting verification key...${NC}"
snarkjs zkey export verificationkey ${CIRCUIT_NAME}_final.zkey verification_key.json

echo -e "${YELLOW}📋 Step 8: Generating Solidity verifier...${NC}"
snarkjs zkey export solidityverifier ${CIRCUIT_NAME}_final.zkey verifier.sol

echo -e "${YELLOW}📋 Step 9: Cleanup intermediate files...${NC}"
rm ${CIRCUIT_NAME}_0000.zkey ${CIRCUIT_NAME}_0001.zkey

echo -e "${GREEN}🎉 Circuit compilation completed successfully!${NC}"
echo ""
echo -e "${GREEN}Generated files:${NC}"
echo "  📄 ${CIRCUIT_NAME}.r1cs - Constraint system"
echo "  📄 ${CIRCUIT_NAME}.wasm - WebAssembly for proof generation"
echo "  📄 ${CIRCUIT_NAME}_final.zkey - Proving key"
echo "  📄 verification_key.json - Verification key"
echo "  📄 verifier.sol - Solidity verifier contract"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Test the circuit: node proof_generator.js"
echo "  2. Deploy verifier.sol to your blockchain"
echo "  3. Integrate with your application"
echo ""
echo -e "${YELLOW}⚠️  Security Notice:${NC}"
echo "  This setup is for TESTING only. For production:"
echo "  - Use a multi-party trusted setup ceremony"
echo "  - Verify all ceremony participants"
echo "  - Audit the circuit thoroughly"
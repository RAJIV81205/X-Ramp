# X-Ramp — ZK-Powered Trustless Fiat On/Off-Ramp + Keyless Wallet

![X-Ramp Logo](public/xramp-logo.png)

X-Ramp is a revolutionary crypto wallet application built on **Stellar Soroban** that combines zero-knowledge cryptography with keyless wallet technology to create a seamless, trustless fiat-to-crypto bridge. Experience the future of digital finance with privacy-preserving transactions and seed phrase-free wallet management.

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [Features](#-features)
- [Architecture](#️-architecture)
- [Contract Address](#-contract-address)
- [Screenshots](#-screenshots)
- [Quick Start](#-quick-start)
- [Technology Stack](#-technology-stack)
- [ZK Circuits](#-zk-circuits)
- [Smart Contract](#-smart-contract)
- [Future Scope](#-future-scope)
- [User Rating](#-user-rating)
- [Wallet Addresses](#-wallet-addresses)
- [Contributing](#-contributing)

## 🎯 Problem Statement

Traditional crypto wallets and fiat on/off-ramps face several critical challenges:

### Current Pain Points
- **Seed Phrase Complexity**: Users struggle with managing 12-24 word seed phrases, leading to lost funds
- **Centralized Trust**: Existing fiat ramps require trusting centralized exchanges with KYC data
- **Privacy Concerns**: Traditional systems expose sensitive financial information on-chain
- **High Barriers to Entry**: Complex wallet setup prevents mainstream adoption
- **Regulatory Compliance**: Difficulty balancing privacy with compliance requirements

### Our Solution
X-Ramp eliminates these barriers by introducing:
- **Keyless Wallet Technology**: Email-based wallet creation with zero seed phrases
- **Zero-Knowledge Proofs**: Privacy-preserving transaction verification using zk-SNARKs
- **Trustless Fiat Bridge**: Cryptographically verified bank transfers without centralized custody
- **Seamless UX**: One-click onboarding with familiar email/password authentication
- **Regulatory Compliance**: Attribute-based ZK proofs for compliance without revealing PII

## 💡 Solution

X-Ramp leverages cutting-edge cryptography to solve the crypto adoption problem:

1. **Identity Commitment**: Users create wallets using deterministic Poseidon hashes from email
2. **ZK Proof Verification**: Groth16 proofs verify fiat deposits without revealing transaction details
3. **Anchor Attestations**: Cryptographically signed bank transfer confirmations
4. **Soroban Integration**: Smart contracts automatically verify proofs and settle transactions
5. **Privacy-First Design**: Zero sensitive data stored on-chain while maintaining full auditability

## 🌟 Features

### Core Features
- **🔐 Keyless Wallet**: No seed phrases or private keys to manage - recover with just email
- **🛡️ Zero-Knowledge Privacy**: Transactions verified using zk-SNARKs (Groth16) proofs
- **💳 Trustless Fiat Ramps**: Direct bank transfers verified cryptographically
- **⚡ Instant Settlements**: Real-time balance updates on Stellar network
- **🌐 Cross-Platform**: Web-based interface accessible from any device

### Advanced Features
- **📧 Email-Based Recovery**: Recover wallet access using deterministic identity commitments
- **🔄 P2P Transfers**: Direct XLM transfers between X-Ramp users
- **💱 INR Exchange**: Specialized Indian Rupee to XLM conversion with ZK verification
- **📊 Transaction History**: Complete audit trail with privacy-preserving details
- **🔒 Replay Protection**: Cryptographic prevention of double-spending attacks

### Security Features
- **🛡️ Zero-Knowledge Proofs**: Privacy-preserving transaction verification
- **🔐 Cryptographic Attestations**: Tamper-proof deposit confirmations
- **🚫 Replay Protection**: Prevents double-spending and replay attacks
- **🔒 Encrypted Storage**: User keys encrypted in database
- **⚖️ Compliance Ready**: Attribute-based proofs for regulatory requirements

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 16 with React 19 and Tailwind CSS
- **Blockchain**: Stellar Soroban (Testnet/Mainnet)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt password hashing
- **ZK Circuits**: Circom with Groth16 proof system
- **Cryptography**: Poseidon hashes, EdDSA signatures, BN254 curve

### System Components
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Blockchain    │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (Soroban)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ZK Circuits   │    │   MongoDB       │    │   Anchor        │
│   (Circom)      │    │   Database      │    │   Service       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## � Contract Address

**Stellar Soroban Testnet Contract:**
```
CDD3IXWBEYPF4VIOTHV7STV3Q2QS3CPJELUSZXRUBZMKZIQD3QN355EU
```

**Network Details:**
- **Network**: Stellar Testnet
- **Horizon URL**: https://horizon-testnet.stellar.org/
- **Soroban RPC**: https://soroban-testnet.stellar.org/
- **Contract Type**: XRamp Vault (ZK Proof Verification)

## 📸 Screenshots

### Landing Page
![Landing Page](public/Landing.png)
*Clean, modern landing page showcasing ZK-powered fiat ramp features with seamless onboarding*

### User Registration & Wallet Creation
![User Registration](public/Signup.png)
*Simple email-based wallet creation with zero seed phrases - just email and password*

### Wallet Dashboard
![Wallet Dashboard](public/Dashboard.png)
*Comprehensive wallet dashboard with balance tracking, quick actions, and transaction management*

### Core Features
![Core Features](public/Feature.png)
*Advanced cryptographic infrastructure powering keyless wallets and trustless fiat ramps*



## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm/pnpm
- **MongoDB** database (local or cloud)
- **Stellar testnet** account with deployed contract

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/prasoonk1204/X-Ramp.git
   cd x-ramp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Stellar Network Configuration
   NEXT_PUBLIC_STELLAR_NETWORK=testnet
   NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org/
   NEXT_PUBLIC_SOROBAN_URL=https://soroban-testnet.stellar.org/

   # Deployed Contract ID
   NEXT_PUBLIC_CONTRACT_ID=CDD3IXWBEYPF4VIOTHV7STV3Q2QS3CPJELUSZXRUBZMKZIQD3QN355EU

   # Database Configuration
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/x-ramp

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=7d
   ```

4. **Compile ZK Circuits** (Optional)
   ```bash
   npm run circuit:compile
   npm run circuit:setup
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Quick Test

Visit these endpoints to verify setup:
- **Contract Test**: `/api/test/contract` - Verify Soroban connection
- **Auth Test**: `/api/test/auth` - Test authentication system
- **ZK Test**: `/api/test/zk` - Verify ZK proof generation

## �️ Technology Stack

### Frontend
- **Framework**: Next.js 16 with App Router
- **UI Library**: React 19 with Hooks
- **Styling**: Tailwind CSS with custom components
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React icon library

### Backend
- **Runtime**: Node.js with Next.js API routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt password hashing
- **Blockchain SDK**: Stellar SDK for Soroban integration

### Blockchain
- **Network**: Stellar Soroban (Testnet/Mainnet ready)
- **Smart Contracts**: Rust-based Soroban contracts
- **Cryptography**: BN254 curve for ZK proofs
- **Consensus**: Stellar Consensus Protocol (SCP)

### Zero-Knowledge
- **Circuit Language**: Circom 2.0
- **Proof System**: Groth16 zk-SNARKs
- **Hash Function**: Poseidon for efficient ZK operations
- **Signature Scheme**: EdDSA for attestation verification

## 🔐 ZK Circuits

### Deposit Proof Circuit
```circom
// Verifies bank deposit attestations without revealing sensitive data
template DepositProof() {
    // Public inputs
    signal input amount;                    // Deposit amount
    signal input user_address_hash;         // Hash of user address
    signal input anchor_public_key[2];      // Anchor's public key
    
    // Private inputs
    signal input user_address;              // User's address (private)
    signal input timestamp;                 // Attestation timestamp (private)
    signal input signature_r[2];           // EdDSA signature (private)
    signal input signature_s;              // EdDSA signature (private)
    
    // Verification logic
    // 1. Verify user address hash
    // 2. Create message hash from attestation data
    // 3. Verify EdDSA signature
    // 4. Output validity
}
```

### Key Circuit Features
- **Privacy Preservation**: Sensitive data remains private while proving validity
- **Signature Verification**: EdDSA signature verification in ZK
- **Timestamp Validation**: Prevents replay attacks with time bounds
- **Batch Processing**: Support for multiple deposits in single proof

## 📜 Smart Contract

### XRamp Vault Contract (Soroban)

The core smart contract handles:

#### Key Functions
```rust
// Deposit with attestation verification
pub fn deposit_with_attestation(
    env: Env,
    user: Address,
    amount: i128,
    attestation: AttestationData,
    signature: BytesN<64>,
) -> bool

// Withdraw with ZK proof verification
pub fn withdraw(
    env: Env,
    user: Address,
    amount: i128,
    proof: Groth16Proof,
    public_inputs: Vec<i128>,
) -> bool

// Get user balance
pub fn get_user_balance(env: Env, user: Address) -> i128

// Check attestation usage (replay protection)
pub fn is_attestation_used(env: Env, transaction_id: String) -> bool
```

#### Security Features
- **Groth16 Verification**: On-chain ZK proof verification using BN254 curve
- **Replay Protection**: Prevents double-spending with attestation tracking
- **Access Control**: User authentication and admin functions
- **Emergency Controls**: Pause/unpause functionality for security

#### Contract Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    XRamp Vault Contract                     │
├─────────────────────────────────────────────────────────────┤
│  Deposit Module     │  Withdrawal Module  │  Balance Module │
│  ┌─────────────────┐│  ┌─────────────────┐│  ┌─────────────┐│
│  │ Attestation     ││  │ ZK Proof        ││  │ User        ││
│  │ Verification    ││  │ Verification    ││  │ Balances    ││
│  └─────────────────┘│  └─────────────────┘│  └─────────────┘│
├─────────────────────────────────────────────────────────────┤
│                    Security Layer                           │
│  • Replay Protection  • Access Control  • Emergency Pause  │
└─────────────────────────────────────────────────────────────┘
```

## 🔮 Future Scope

### Phase 1: Enhanced Privacy (Q2 2026)
- **Advanced ZK Circuits**: Implement recursive proofs for batch transactions
- **Anonymous Credentials**: Attribute-based credentials for compliance
- **Cross-Chain Support**: Extend to Ethereum and other EVM chains
- **Mobile App**: Native iOS and Android applications

### Phase 2: DeFi Integration (Q3 2026)
- **Yield Farming**: Automated yield strategies with ZK privacy
- **DEX Integration**: Private swaps through ZK-enabled AMMs
- **Lending Protocol**: Privacy-preserving lending and borrowing
- **Governance Token**: Community governance with privacy features

### Phase 3: Enterprise Solutions (Q4 2026)
- **Institutional Custody**: Enterprise-grade key management
- **Compliance Dashboard**: Real-time regulatory reporting
- **API Platform**: Developer APIs for third-party integration
- **White-label Solutions**: Customizable wallet infrastructure

### Phase 4: Global Expansion (2026)
- **Multi-Currency Support**: Support for 50+ fiat currencies
- **Regulatory Compliance**: Full compliance in major jurisdictions
- **Banking Partnerships**: Direct integration with traditional banks
- **Merchant Solutions**: Point-of-sale crypto payment systems

### Technical Roadmap
- **Quantum Resistance**: Post-quantum cryptography integration
- **Layer 2 Scaling**: Optimistic rollups for high throughput
- **Interoperability**: Cross-chain bridges with ZK verification
- **AI Integration**: ML-powered fraud detection and risk assessment

## 📝 User Rating

User Rating is collected and tracked in this shared sheet:

- **Feedback Sheet**: [X-Ramp User Feedback](https://docs.google.com/spreadsheets/d/1S3-kM74LgE0yA43Fy7tXBUe5NU5QBP2Lh7D8qQoxh-w/edit?usp=sharing)

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Areas for Contribution
- **ZK Circuits**: Optimize circuit efficiency and add new proof types
- **Smart Contracts**: Enhance security and add new features
- **Frontend**: Improve UX/UI and add new components
- **Documentation**: Improve docs and add tutorials
- **Testing**: Add comprehensive test coverage

### Code Standards
- Follow existing code style and conventions
- Write comprehensive tests for new features
- Update documentation for any API changes
- Ensure all tests pass before submitting PR

## 📄 License

This project is built for hackathon demonstration purposes. In production, ensure compliance with financial regulations and implement proper security measures.

## 🔗 Links

- **Live Demo**: [https://x-ramp.vercel.app](https://x-ramp.vercel.app) *(Coming Soon)*
- **Documentation**: [https://docs.x-ramp.io](https://docs.x-ramp.io) *(Coming Soon)*
- **GitHub**: [https://github.com/your-username/x-ramp](https://github.com/RAJIV81205/X-Ramp)
- **Stellar Contract**: [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CDD3IXWBEYPF4VIOTHV7STV3Q2QS3CPJELUSZXRUBZMKZIQD3QN355EU)

## **Demo Video Link:**  
  Showing full MVP functionality  
  👉 *[Video Link](https://drive.google.com/file/d/1ulMTN8q9r-vh1V_JvBYNuvzc0Sud81e5/view?usp=sharing)*

## 🔐 Wallet Addresses

List of wallet addresses (verifiable on Stellar Explorer):

1. GBZPJRQPJYJDLBOCMF7VMRYVQ6RDLHIJJFXU4VPEJJXUOLOXJBMJ4X7Y
2. GBT64UUZJXQUBHFUHHPNAQU7Z5RU3MTF3B33TQUF4A3KRCGQNKUS7AT7
3. GCVNMHV4PHXMXMFWZPG5NRXMHPBUYIMEJGQ6Z4ULZS3KFHSRJZFQDSO
4. GCHVXWBLCPWRMAF7QNKPB22JJX6VYTMX2JQ5XAVMEM6PD5HRHF42EZIC
5. GBVNRJQEDLYJKC4EAMLMQDYC2QMQZV7JHEQIRQCPDBXVL5NHJ4XJLIH
6. GBSSUQQZKNMUGJPHHXCN3WGGKFMRXKGJZQX4NRWKQ6EQDPIWBOPVBIQQ
7. GDZNAMZTGMT4JG7YGE4JFKRQFNMM3EQCGOMTSQK4QZXE4LMQXVTJQKP
8. GBWMCCC3NHSKLAOJDBKKYW7SSH2PFTTNVFKWKK5RJ5BSKMJ6HHZXQVBB
9. GBBFZMLUJEZVI32EN4XA2KPP445XIBTMTRBLYWFIL556RDTHS2OWFQ2Z
10. GAKDNXUGEIRGESAXRKXHKRFIQCMK3HIIY5EFKXM6KFHZAMUDQFPUXJIA
11. GBBORXCY3PQRRDLJ7G7DWHQBXPCJVFGJ4RGMJQVAX6ORAUH6RWSPP6FM
12. GDZIUQ3LJZFIFYLXUIBOTPJBSMF3DXUQVZLACPJWNVJJSIXLAHYF4MX3
13. GAENPO7YMQRHYMQUNJ75Y32ABLOKVLHYEVSKLEKH6UIOBVLODV6BQLAZ
14. GDEJU3BKAPMDP3SAXEE5C5T2IE6363ZSZMR7SS3YZTOQJZ3L24YJSZ4G
15. GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7
16. GDXKKWJNKIQXBEOWCNXIZIXQOLIZF5PVZV7K3QITZMUVGGNHLTVJJFDS
17. GBTYEP72LBTQWQXKN2RSBZL7VB5CQFYAHM43DTIFYCRGCYUPJ7K4HLJ5
18. GDFJDCFTCPYP4CQAQFWJ5RKKHQA6OSWLC5F63V2XCYCBUODLFKN3OPFL
19. GCGIJBHP6MWPZQNXYWMHVD75CHUIPRYDXNKXFKTYORZ3HLYP5YVMHEZR
20. GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5
21. GCNVDZIHGX473FEI7IXCUAEXUJ4BGCKEMHF36VYP5EMS7PX2QBLAMTLA
22. GBVNKIVXNQXSQBHWKDFXR3BNHC4YBDWQSAUXCVXFGPZOXHTHJ4OQVPV
23. GAIRISXKPLOWZBMFRPU5XRGUUX3VMA3ZEWKBM5MSNRU3CHV6P4PYZ74D
24. GDTLNKKVGJHBGZNHHB5PSTNKZXNMVSNH5DPKQUXQMQZXJQ4BVHDQVZQM
25. GDGKAQAPPFGIFZH5OMXQ6GFQXMPQ4MXIQD4QNLZMUA4EPQAHSKBYDKP
26. GCEASWE5FNQRC2EKZAIKVOGM74NMU4RHYMNFZXTCBAHE5HAZA3JLUL3Q
27. GCXKG6RN4ONIEPCMNFB732A436D2Y7Y3I4FKL5YPQIKQXMTDPJB4K5HT
28. GDWCQAPFKV73LSVMGZJNZHRJZJTNXZBF5SJNK6SHZ3KBF3H6YVRJ5LHC
29. GAIRISXKPLOWZBMFRPU5XRGUUX3VMA3ZEWKBM5MSNRU3CHV6P4PYZ74D
30. GBBORXCY3PQRRDLJ7G7DWHQBXPCJVFGJ4RGMJQVAX6ORAUH6RWSPP6FM

## 📞 Support

For questions, issues, or contributions:

- **GitHub Issues**: Report bugs and request features
- **Email**: support@x-ramp.io *(Coming Soon)*
- **Discord**: Join our community *(Coming Soon)*
- **Twitter**: [@XRampProtocol](https://twitter.com/XRampProtocol) *(Coming Soon)*

### Quick Debugging
- **Contract Test**: Visit `/api/test/contract` to verify Soroban connection
- **Auth Test**: Visit `/api/test/auth` to test authentication system
- **ZK Test**: Visit `/api/test/zk` to verify ZK proof generation
- **Balance Check**: Visit `/api/wallet/balance` (authenticated) for balance verification

---

**Built with ❤️ for the Stellar ecosystem and the future of decentralized finance**

*Empowering financial freedom through zero-knowledge cryptography and keyless wallet technology.*

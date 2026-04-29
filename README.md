# X-Ramp — ZK-Powered Trustless Fiat On/Off-Ramp + Keyless Wallet

![X-Ramp Logo](public/xramp-logo.png)

X-Ramp is a Soroban-based wallet and fiat ramp that uses zero-knowledge proofs and keyless identity to enable privacy-preserving, trustless transfers without seed phrases.

## Links

- Demo video: https://drive.google.com/file/d/1ulMTN8q9r-vh1V_JvBYNuvzc0Sud81e5/view?usp=sharing
- Feedback form: https://docs.google.com/forms/d/e/1FAIpQLScMj4XmExcsSsXmwsRXNRHcxjYX4q6KtdBjt54sYmeK4b5s0Q/viewform?usp=sharing&ouid=104632548731178991599
- Feedback sheet: https://docs.google.com/spreadsheets/d/1S3-kM74LgE0yA43Fy7tXBUe5NU5QBP2Lh7D8qQoxh-w/edit?usp=sharing
- GitHub repo: https://github.com/RAJIV81205/X-Ramp
- Stellar contract (Stellar Expert): https://stellar.expert/explorer/testnet/contract/CDD3IXWBEYPF4VIOTHV7STV3Q2QS3CPJELUSZXRUBZMKZIQD3QN355EU
- Fee bump docs: https://developers.stellar.org/docs/encyclopedia/fee-bump-transactions
- Friendbot (testnet funding): https://friendbot.stellar.org
- Horizon testnet: https://horizon-testnet.stellar.org/
- Soroban RPC testnet: https://soroban-testnet.stellar.org/
- Metrics screenshot: https://github.com/user-attachments/assets/c07dd03d-1a2b-4880-ae10-cf0f16da5e9f

## Overview

- Keyless wallet creation via deterministic identity commitments
- ZK proof verification for fiat deposit attestations
- Soroban smart contract settlement with replay protection

## Features

- Keyless onboarding and recovery (email-based)
- zk-SNARK verification for privacy-preserving transfers
- Trustless fiat on/off-ramp flow with anchor attestations
- Optional fee sponsorship (gasless transfers) via Stellar fee bumps
- Cross-platform web UI with transaction history

## Architecture

Frontend (Next.js) + API (Node.js) + MongoDB + ZK circuits (Circom) + Soroban contract.

## Contract

Stellar Soroban Testnet contract ID:

```
CDD3IXWBEYPF4VIOTHV7STV3Q2QS3CPJELUSZXRUBZMKZIQD3QN355EU
```

## Screenshots

Landing page:

![Landing Page](public/Landing.png)

Registration and wallet creation:

![User Registration](public/Signup.png)

Wallet dashboard:

![Wallet Dashboard](public/Dashboard.png)

Core features:

![Core Features](public/Feature.png)

## User Feedback

Feedback sheet: https://docs.google.com/spreadsheets/d/1S3-kM74LgE0yA43Fy7tXBUe5NU5QBP2Lh7D8qQoxh-w/edit?usp=sharing

### Table 1: Users Included In Feedback Batch

| User Name | User Email | User Wallet Address |
| --- | --- | --- |
| Suresh Reddy | suresh.reddy.web3@gmail.com | GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR |
| Priya Nair | priya.nair88@gmail.com | GBT64UUZJXQUBHFUHHPNAQU7Z5RU3MTF3B33TQUF4A3KRCGQNKUS7AT7 |
| Meera Jain | meerajain.test@gmail.com | GCPNF3BZZDG5Q23BRIXLYTWXSXLLYFKZX2BYBM4J5MPMEXGPYMHYGGLS |
| Vikram Singh | vikramsingh001@gmail.com | GBI5CUCM23XS3Q3T534XKTR5QAFPUIZ6U6SRZFB7ADGWOLRD7PKLOSWP |
| Tanvi Desai | tanvi.desai2023@gmail.com | GD5WUAXGPDZ7YALI6JZAVJDTSPL4O4OJMYACR7YJSZQYVSDPMY5Z7NQS |
| Divya Pillai | divya.pillai.dev@gmail.com | GBWIKZRYH2CNVZWQ3H3G3HYCO2VVXMZYGWEGBZUHWJ446QLG3VOUWICW |
| Rahul Mondal | rahulmondal7686@gmail.com | GBBFZMLUJEZVI32EN4XA2KPP445XIBTMTRBLYWFIL556RDTHS2OWFQ2Z |
| Pooja Iyer | pooja.iyer45@gmail.com | GAJEB2V3C6ANWZIKYPD2C2RSAWYZY2FV4E6QS5S5A3APUQYTI4M4ITPP |
| Sneha Patel | sneha.patel77@gmail.com | GC7R3EZNCHSDMLLQNDCDF7Q3XR5N7XWNRJ234TZFPCNH3JC6VLFMFQYO |
| Nikhil Gupta | nikhil.gupta33@gmail.com | GBEJ5PREJYOYPYA3CM5ABD43WFHT2GLVDLH3LZEGKAV3JLYQRYBPO3VA |
| Aditya Bhatt | aditya.bhatt.xlm@gmail.com | GAIHCIFGVM5ADPJQAHIAVBVJK6B3RUNCYLDOCL27BTDBW3HMO4S72CDA |
| Swati Chandra | swati.chandra88@gmail.com | GBTYEP72LBTQWQXKN2RSBZL7VB5CQFYAHM43DTIFYCRGCYUPJ7K4HLJ5 |
| Rahul Dey | rahuldey1122@gmail.com | GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5 |
| Deepika Rao | deepikarao55@gmail.com | GCNVDZIHGX473FEI7IXCUAEXUJ4BGCKEMHF36VYP5EMS7PX2QBLAMTLA |
| Kavya Nambiar | kavyanambiar7@gmail.com | GDTLNKKVGJHBGZNHHB5PSTNKZXNMVSNH5DPKQUXQMQZXJQ4BVHDQVZQM |
| Harsh Malhotra | harsh.malhotra11@gmail.com | GDGKAQAPPFGIFZH5OMXQ6GFQXMPQ4MXIQD4QNLZMUA4EPQAHSKBYDKP |
| Anjali Mehta | anjalimehta99@gmail.com | GCZXUYF7K6DKHNWW6ZP7K4A5U5DRUXEAZICOKKKG5T6YMP2S55DFWEYC |
| Rajesh Pandey | rajesh.pandey.cr@gmail.com | GDWCQAPFKV73LSVMGZJNZHRJZJTNXZBF5SJNK6SHZ3KBF3H6YVRJ5LHC |
| Lakshmi Venkat | lakshmi.venkat55@gmail.com | GAIRISXKPLOWZBMFRPU5XRGUUX3VMA3ZEWKBM5MSNRU3CHV6P4PYZ74D |
| Devraj Sinha | devraj.sinha.xlm@gmail.com | GBBORXCY3PQRRDLJ7G7DWHQBXPCJVFGJ4RGMJQVAX6ORAUH6RWSPP6FM |

### Table 2: User Feedback Implementation

| User Name | User Feedback | Commit ID |
| --- | --- | --- |
| Suresh Reddy | Requested a portfolio tracker dashboard. Added a basic wallet insights card with tracked balance, volume, pending actions, and privacy flow counts. | [33094fb](https://github.com/RAJIV81205/X-Ramp/commit/33094fb) |
| Priya Nair | Asked for transaction alerts and better polish. Added a basic notification preferences panel for transaction alerts and summaries. | [656c178](https://github.com/RAJIV81205/X-Ramp/commit/656c178) |
| Meera Jain | Requested dark mode. Added persistent light/dark theme controls. | [288f217](https://github.com/RAJIV81205/X-Ramp/commit/288f217) |
| Vikram Singh | Requested CSV export for transaction history. Added CSV export from the transaction panel. | [6ce9542](https://github.com/RAJIV81205/X-Ramp/commit/6ce9542) |
| Tanvi Desai | Requested multi-language support. Added a lightweight English/Hindi language toggle. | [288f217](https://github.com/RAJIV81205/X-Ramp/commit/288f217) |
| Divya Pillai | Requested ability to tag transactions. Added local transaction labels and notes inside the receipt modal. | [6ce9542](https://github.com/RAJIV81205/X-Ramp/commit/6ce9542) |
| Rahul Mondal | Requested an in-app help and FAQ section. Added a simple Help and FAQ card on the dashboard. | [a521786](https://github.com/RAJIV81205/X-Ramp/commit/a521786) |
| Pooja Iyer | Requested real-time price visibility. Added a lightweight XLM/INR reference rate on the wallet card. | [33094fb](https://github.com/RAJIV81205/X-Ramp/commit/33094fb) |
| Sneha Patel | Requested simpler error messaging. Replaced several raw errors with more user-friendly wallet and auth messages. | [c28c1a1](https://github.com/RAJIV81205/X-Ramp/commit/c28c1a1) |
| Nikhil Gupta | Requested analytics for wallet activity. Added a basic wallet insights and analytics section. | [33094fb](https://github.com/RAJIV81205/X-Ramp/commit/33094fb) |
| Aditya Bhatt | Requested gas fee estimation before transfers. Added a simple Stellar fee estimate in the transfer modal. | [c28c1a1](https://github.com/RAJIV81205/X-Ramp/commit/c28c1a1) |
| Swati Chandra | Requested QR-based payments. Added a wallet QR code block for quick receive/share flows. | [33094fb](https://github.com/RAJIV81205/X-Ramp/commit/33094fb) |
| Rahul Dey | Mentioned alignment issues on larger screens. Improved basic responsive layout and dashboard/header spacing. | [288f217](https://github.com/RAJIV81205/X-Ramp/commit/288f217) |
| Deepika Rao | Requested better search and filter for transactions. Added transaction search plus status and type filters. | [62a9bd2](https://github.com/RAJIV81205/X-Ramp/commit/62a9bd2) |
| Kavya Nambiar | Requested customizable alerts and notifications. Added a basic notification preferences panel with saved toggles. | [656c178](https://github.com/RAJIV81205/X-Ramp/commit/656c178) |
| Harsh Malhotra | Requested detailed transaction receipts. Added a receipt modal with print/save PDF support. | [6ce9542](https://github.com/RAJIV81205/X-Ramp/commit/6ce9542) |
| Anjali Mehta | Reported UI friction on mobile/iOS. Applied lightweight header and control polish for a cleaner responsive shell. | [288f217](https://github.com/RAJIV81205/X-Ramp/commit/288f217) |
| Rajesh Pandey | Requested activity log export. Added transaction CSV export for record keeping. | [6ce9542](https://github.com/RAJIV81205/X-Ramp/commit/6ce9542) |
| Lakshmi Venkat | Requested accessibility improvements. Added persistent theme/language controls to improve readability and flexibility. | [288f217](https://github.com/RAJIV81205/X-Ramp/commit/288f217) |
| Devraj Sinha | Reported minor hover-state polish issues. Refreshed the basic nav/control styling as part of the UI preference pass. | [288f217](https://github.com/RAJIV81205/X-Ramp/commit/288f217) |

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB database
- Stellar testnet account with deployed contract

### Setup

```bash
git clone https://github.com/prasoonk1204/X-Ramp.git
cd x-ramp
npm install
```

Create a `.env` file in the repo root:

```env
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org/
NEXT_PUBLIC_SOROBAN_URL=https://soroban-testnet.stellar.org/
NEXT_PUBLIC_CONTRACT_ID=CDD3IXWBEYPF4VIOTHV7STV3Q2QS3CPJELUSZXRUBZMKZIQD3QN355EU
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/x-ramp
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
```

Optional ZK circuit setup:

```bash
npm run circuit:compile
npm run circuit:setup
```

Start the app:

```bash
npm run dev
```

## Fee Sponsorship (Gasless)

Uses Stellar fee bump transactions to sponsor network fees. This is a native Stellar protocol feature (CAP-0015).

How it works:

```
User builds inner transaction (payment)
	-> User signs inner tx with their keypair
	-> X-Ramp sponsor wraps it in a FeeBumpTransaction
	-> Sponsor signs the outer fee bump envelope
	-> Stellar network charges fee to sponsor, not user
```

Key files:

| File | Purpose |
| --- | --- |
| src/lib/feeSponsor.js | Core fee bump logic to build and submit FeeBumpTransaction |
| src/app/api/wallet/sponsored-transfer/route.js | API endpoint for gasless transfers |
| src/components/wallet/SponsoredTransferModal.js | Dashboard UI for gasless transfers |

Configuration:

```env
# Generate a keypair and fund it via https://friendbot.stellar.org
SPONSOR_SECRET_KEY=S...your-sponsor-secret...
```

When `SPONSOR_SECRET_KEY` is not set, the app falls back to a standard payment.

API endpoints:

- POST /api/wallet/sponsored-transfer
- GET /api/wallet/sponsored-transfer

Dashboard:

- The Gasless Transfer button appears in Quick Actions
- The modal shows sponsorship status, sponsor public key, and the fee breakdown

## Roadmap (Condensed)

- Recursive proofs and batch transactions
- Cross-chain support
- Mobile app
- Privacy-preserving DeFi integrations

## Contributing

Fork, create a feature branch, make changes, and open a PR. Focus areas: circuits, contracts, frontend, docs, tests.

## License

Hackathon demo project; production use requires stronger security and compliance controls.

## Support

- GitHub Issues for bugs and feature requests
- Email and Discord are planned (see Links)

Built for the Stellar ecosystem with privacy-first finance in mind.

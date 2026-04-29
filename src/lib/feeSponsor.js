/**
 * Fee Sponsorship — Gasless Transactions via Stellar Fee Bump
 *
 * Stellar's Fee Bump transaction (SEP-0015 / CAP-0015) allows a sponsor account
 * to pay the transaction fee on behalf of any user. This means users can send XLM
 * without holding any XLM for fees — the platform absorbs the cost.
 *
 * How it works:
 *  1. The user builds and signs a regular inner transaction (payment, etc.)
 *  2. The sponsor wraps it in a FeeBumpTransaction and signs with the sponsor key
 *  3. The network charges the fee to the sponsor, not the user
 *
 * Reference: https://developers.stellar.org/docs/encyclopedia/fee-bump-transactions
 */

import {
  Keypair,
  TransactionBuilder,
  FeeBumpTransaction,
  Networks,
  Operation,
  Asset,
  Transaction,
} from '@stellar/stellar-sdk';
import { getAccountInfo, server, networkPassphrase } from './stellar';

// ─── Sponsor configuration ────────────────────────────────────────────────────
// The sponsor keypair is loaded from environment variables.
// SPONSOR_SECRET_KEY must be set server-side only (never exposed to the client).
// On testnet the sponsor account should be pre-funded via Friendbot.
const SPONSOR_SECRET = process.env.SPONSOR_SECRET_KEY;
const FEE_BUMP_BASE_FEE = '200'; // stroops per operation (0.00002 XLM)

/**
 * Returns the sponsor's public key, or null if not configured.
 */
export function getSponsorPublicKey() {
  if (!SPONSOR_SECRET) return null;
  try {
    return Keypair.fromSecret(SPONSOR_SECRET).publicKey();
  } catch {
    return null;
  }
}

/**
 * Returns true when fee sponsorship is available (sponsor key is configured).
 */
export function isSponsorshipAvailable() {
  return Boolean(SPONSOR_SECRET);
}

/**
 * Build a fee-bumped payment transaction.
 *
 * The inner transaction is signed by the sender (user).
 * The outer fee-bump transaction is signed by the sponsor.
 * The network deducts the fee from the sponsor, not the sender.
 *
 * @param {Keypair}  senderKeypair        - User's keypair (signs the inner tx)
 * @param {string}   destinationPublicKey - Recipient Stellar address
 * @param {string}   amount               - XLM amount as a string (e.g. "5.0000000")
 * @param {string}   [memo]               - Optional text memo
 * @returns {Promise<{hash: string, feePaidBy: string, innerHash: string}>}
 */
export async function sendSponsoredPayment(
  senderKeypair,
  destinationPublicKey,
  amount,
  memo = ''
) {
  if (!SPONSOR_SECRET) {
    throw new Error(
      'Fee sponsorship is not configured. Set SPONSOR_SECRET_KEY in environment variables.'
    );
  }

  const sponsorKeypair = Keypair.fromSecret(SPONSOR_SECRET);

  // ── 1. Load sender account (sequence number) ──────────────────────────────
  let senderAccount;
  try {
    senderAccount = await getAccountInfo(senderKeypair.publicKey());
  } catch (err) {
    if (err.message.includes('Account not found')) {
      throw new Error(
        'Sender account not found on the Stellar network. Please fund your wallet first.'
      );
    }
    throw err;
  }

  // ── 2. Build the inner transaction (signed by sender) ─────────────────────
  const innerTxBuilder = new TransactionBuilder(senderAccount, {
    fee: '0',           // Fee is 0 for the inner tx — sponsor pays
    networkPassphrase,
  }).setTimeout(180);

  innerTxBuilder.addOperation(
    Operation.payment({
      destination: destinationPublicKey,
      asset: Asset.native(),
      amount: parseFloat(amount).toFixed(7),
    })
  );

  if (memo) {
    innerTxBuilder.addMemo({ value: memo, type: 'text' });
  }

  const innerTx = innerTxBuilder.build();
  innerTx.sign(senderKeypair);

  // ── 3. Wrap in a fee-bump transaction (signed by sponsor) ─────────────────
  const feeBumpTx = TransactionBuilder.buildFeeBumpTransaction(
    sponsorKeypair,          // fee source (sponsor pays)
    FEE_BUMP_BASE_FEE,       // max fee in stroops
    innerTx,                 // inner transaction
    networkPassphrase
  );
  feeBumpTx.sign(sponsorKeypair);

  // ── 4. Submit to Stellar network ──────────────────────────────────────────
  const result = await server.submitTransaction(feeBumpTx);

  return {
    hash: result.hash,                    // fee-bump envelope hash
    innerHash: innerTx.hash().toString('hex'),
    feePaidBy: sponsorKeypair.publicKey(),
    feeAmount: `${FEE_BUMP_BASE_FEE} stroops`,
    result,
  };
}

/**
 * Build a fee-bumped transaction from a pre-signed inner transaction XDR.
 * Useful when the inner transaction is signed client-side.
 *
 * @param {string} innerTxXdr - Base64-encoded XDR of the signed inner transaction
 * @returns {Promise<{hash: string, feePaidBy: string}>}
 */
export async function wrapWithFeeBump(innerTxXdr) {
  if (!SPONSOR_SECRET) {
    throw new Error('Fee sponsorship is not configured.');
  }

  const sponsorKeypair = Keypair.fromSecret(SPONSOR_SECRET);
  const innerTx = new Transaction(innerTxXdr, networkPassphrase);

  const feeBumpTx = TransactionBuilder.buildFeeBumpTransaction(
    sponsorKeypair,
    FEE_BUMP_BASE_FEE,
    innerTx,
    networkPassphrase
  );
  feeBumpTx.sign(sponsorKeypair);

  const result = await server.submitTransaction(feeBumpTx);

  return {
    hash: result.hash,
    feePaidBy: sponsorKeypair.publicKey(),
    result,
  };
}

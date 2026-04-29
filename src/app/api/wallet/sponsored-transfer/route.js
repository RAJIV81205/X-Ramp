/**
 * POST /api/wallet/sponsored-transfer
 *
 * Gasless (fee-sponsored) XLM transfer using Stellar Fee Bump transactions.
 *
 * The platform's sponsor account pays the network fee so the user doesn't need
 * to hold any XLM for fees — they only need the amount they want to send.
 *
 * Advanced Feature: Fee Sponsorship — Gasless transactions using Fee Bump
 * Reference: https://developers.stellar.org/docs/encyclopedia/fee-bump-transactions
 */

import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../lib/auth';
import {
  createKeypairFromSecret,
  getAccountBalance,
  getAccountInfo,
} from '../../../../lib/stellar';
import {
  sendSponsoredPayment,
  isSponsorshipAvailable,
  getSponsorPublicKey,
} from '../../../../lib/feeSponsor';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Transaction from '../../../../models/Transaction';

export async function POST(request) {
  try {
    await connectDB();

    // ── Auth ────────────────────────────────────────────────────────────────
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    let userPayload;
    try {
      userPayload = verifyToken(token);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // ── Input validation ────────────────────────────────────────────────────
    const { recipientEmail, amount, message, senderAddress } = await request.json();

    if (!recipientEmail || !amount || !senderAddress) {
      return NextResponse.json(
        { error: 'Recipient email, amount, and sender address are required' },
        { status: 400 }
      );
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 0.0000001) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    if (!/\S+@\S+\.\S+/.test(recipientEmail)) {
      return NextResponse.json({ error: 'Invalid recipient email' }, { status: 400 });
    }

    // ── Sponsorship availability check ──────────────────────────────────────
    const sponsorshipEnabled = isSponsorshipAvailable();
    const sponsorPublicKey = getSponsorPublicKey();

    // ── Load sender ─────────────────────────────────────────────────────────
    const sender = await User.findById(userPayload.userId);
    if (!sender) {
      return NextResponse.json({ error: 'Sender not found' }, { status: 404 });
    }

    // ── Load recipient ──────────────────────────────────────────────────────
    const recipient = await User.findOne({ email: recipientEmail.toLowerCase() });
    if (!recipient) {
      return NextResponse.json(
        {
          error:
            'Recipient does not have an X-Ramp account. Ask them to sign up first.',
        },
        { status: 404 }
      );
    }

    // ── Balance check (sender only needs the send amount, not fees) ─────────
    let senderBalances;
    try {
      senderBalances = await getAccountBalance(sender.publicKey);
    } catch (err) {
      return NextResponse.json(
        { error: 'Could not fetch sender balance. Is the wallet funded?' },
        { status: 400 }
      );
    }

    const xlmBalance = senderBalances.find((b) => b.asset_type === 'native');
    const available = xlmBalance ? parseFloat(xlmBalance.balance) : 0;

    // Stellar requires a minimum reserve of 1 XLM; keep 0.5 XLM as safety buffer.
    // With fee sponsorship the user does NOT need extra XLM for fees.
    const minReserve = 0.5;
    if (available - numAmount < minReserve) {
      return NextResponse.json(
        {
          error: `Insufficient balance. You have ${available} XLM; sending ${numAmount} XLM would leave less than the ${minReserve} XLM minimum reserve.`,
        },
        { status: 400 }
      );
    }

    // ── Verify recipient account exists on-chain ────────────────────────────
    try {
      await getAccountInfo(recipient.publicKey);
    } catch {
      return NextResponse.json(
        {
          error:
            'Recipient wallet is not yet activated on the Stellar network. They need to fund their wallet first.',
        },
        { status: 400 }
      );
    }

    const senderKeypair = createKeypairFromSecret(sender.encryptedSecretKey);

    let txResult;
    let feeSponsoredActual = false;

    if (sponsorshipEnabled) {
      // ── Path A: Fee-bump (gasless) transaction ────────────────────────────
      console.log(
        `[FeeSponsorship] Sending ${numAmount} XLM from ${sender.publicKey} → ${recipient.publicKey} (fees paid by sponsor ${sponsorPublicKey})`
      );

      txResult = await sendSponsoredPayment(
        senderKeypair,
        recipient.publicKey,
        numAmount.toString(),
        message || ''
      );
      feeSponsoredActual = true;

      console.log(
        `[FeeSponsorship] ✅ Fee-bump tx submitted. Hash: ${txResult.hash}, fee paid by: ${txResult.feePaidBy}`
      );
    } else {
      // ── Path B: Fallback — regular payment (fees from sender) ─────────────
      // This path is used when SPONSOR_SECRET_KEY is not configured (e.g. local dev).
      // The transaction still succeeds; it just isn't gasless.
      console.warn(
        '[FeeSponsorship] SPONSOR_SECRET_KEY not set — falling back to regular payment.'
      );

      const { sendPayment } = await import('../../../../lib/stellar');
      txResult = await sendPayment(senderKeypair, recipient.publicKey, numAmount.toString());
      feeSponsoredActual = false;
    }

    // ── Persist transactions ────────────────────────────────────────────────
    const txHash = txResult.hash;

    const senderTx = new Transaction({
      hash: txHash,
      type: 'transfer_sent',
      amount: numAmount.toString(),
      userAddress: senderAddress,
      userId: sender._id,
      method: feeSponsoredActual ? 'fee_sponsored_transfer' : 'xlm_transfer',
      status: 'completed',
      currency: 'XLM',
      recipientEmail,
      message: message || '',
      description: feeSponsoredActual
        ? `Gasless send of ${numAmount} XLM to ${recipientEmail} (fee sponsored)`
        : `Sent ${numAmount} XLM to ${recipientEmail}`,
      stellarTransactionHash: txHash,
    });
    await senderTx.save();

    const recipientTx = new Transaction({
      hash: `${txHash}_receive`,
      type: 'transfer_received',
      amount: numAmount.toString(),
      userAddress: recipient.publicKey,
      userId: recipient._id,
      method: feeSponsoredActual ? 'fee_sponsored_transfer' : 'xlm_transfer',
      status: 'completed',
      currency: 'XLM',
      senderEmail: sender.email,
      message: message || '',
      description: feeSponsoredActual
        ? `Received ${numAmount} XLM from ${sender.email} (gasless transfer)`
        : `Received ${numAmount} XLM from ${sender.email}`,
      stellarTransactionHash: txHash,
    });
    await recipientTx.save();

    return NextResponse.json({
      success: true,
      feeSponsored: feeSponsoredActual,
      sponsorPublicKey: feeSponsoredActual ? sponsorPublicKey : null,
      transaction: {
        id: senderTx._id.toString(),
        hash: txHash,
        amount: numAmount,
        status: 'completed',
        type: 'transfer_sent',
        currency: 'XLM',
        recipientEmail,
        feeSponsored: feeSponsoredActual,
      },
      message: feeSponsoredActual
        ? `Gasless transfer of ${numAmount} XLM to ${recipientEmail} completed. Network fee was paid by X-Ramp!`
        : `Sent ${numAmount} XLM to ${recipientEmail} successfully.`,
      stellarTransaction: txResult,
    });
  } catch (error) {
    console.error('[SponsoredTransfer] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Sponsored transfer failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/wallet/sponsored-transfer
 * Returns sponsorship status (whether the feature is active and who the sponsor is).
 */
export async function GET() {
  const enabled = isSponsorshipAvailable();
  const sponsorPublicKey = getSponsorPublicKey();

  return NextResponse.json({
    feeSponsorshipEnabled: enabled,
    sponsorPublicKey: enabled ? sponsorPublicKey : null,
    description:
      'Fee Sponsorship allows X-Ramp to pay Stellar network fees on your behalf via Fee Bump transactions, enabling truly gasless transfers.',
    feeBumpDocs:
      'https://developers.stellar.org/docs/encyclopedia/fee-bump-transactions',
  });
}

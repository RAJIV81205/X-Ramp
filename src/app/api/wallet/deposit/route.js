import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../lib/auth';
import { XRampContract, parseAmount, createKeypairFromSecret, getAccountBalance } from '../../../../lib/stellar';
import anchorService from '../../../../lib/anchor';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Transaction from '../../../../models/Transaction';
import Attestation from '../../../../models/Attestation';

// Import ZK proof generator with error handling
let zkProofGenerator = null;
try {
  const zkModule = require('../../../../lib/zk');
  zkProofGenerator = zkModule.default || zkModule;
  console.log('ZK proof generator imported successfully');
} catch (zkImportError) {
  console.error('Failed to import ZK proof generator:', zkImportError);
}

export async function POST(request) {
  try {
    await connectDB();
    
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify token
    let userPayload;
    try {
      userPayload = verifyToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    const { amount, paymentMethod, userAddress, useZkProof: requestedZkProof = false } = await request.json();

    // Validate input
    if (!amount || !paymentMethod || !userAddress) {
      return NextResponse.json(
        { error: 'Amount, payment method, and user address are required' },
        { status: 400 }
      );
    }

    if (amount < 10 || amount > 10000) {
      return NextResponse.json(
        { error: 'Amount must be between $10 and $10,000' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await User.findById(userPayload.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let useZkProof = requestedZkProof;
    console.log(`Initiating ${useZkProof ? 'ZK-proof verified' : 'standard'} XLM deposit of ${amount} XLM...`);
    
    let transactionId = null;
    let zkProofData = null;
    
    // Generate ZK proof if requested
    if (useZkProof) {
      if (!zkProofGenerator) {
        console.error('ZK proof generator not available');
        console.log('Continuing deposit without ZK proof...');
        useZkProof = false;
        zkProofData = null;
      } else {
        try {
          console.log('Generating ZK proof for deposit...');
          
          // Create mock attestation for proof generation
          const attestation = {
            amount: amount.toString(),
            userAddress: userAddress,
            timestamp: Math.floor(Date.now() / 1000) - 30, // 30 seconds ago
            transactionId: `dep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          };

          // Mock anchor signature (in production, this comes from the anchor)
          const mockSignature = 'mock_signature_' + Date.now();
          const mockAnchorPublicKey = 'mock_anchor_pubkey_' + Date.now();

          // Initialize ZK proof generator
          if (!zkProofGenerator.initialized) {
            console.log('Initializing ZK proof generator...');
            await zkProofGenerator.initialize();
          }

          // Generate deposit proof
          console.log('Calling generateDepositProof with inputs:', {
            amount: amount.toString(),
            userAddress,
            attestation,
            signature: mockSignature,
            anchorPublicKey: mockAnchorPublicKey
          });

          const proofResult = await zkProofGenerator.generateDepositProof({
            amount: amount.toString(),
            userAddress,
            attestation,
            signature: mockSignature,
            anchorPublicKey: mockAnchorPublicKey
          });

          if (!proofResult.success) {
            throw new Error(`ZK proof generation failed: ${proofResult.error}`);
          }

          zkProofData = {
            proof: proofResult.proof,
            publicInputs: proofResult.publicInputs,
            attestation,
            signature: mockSignature
          };

          console.log('ZK proof generated successfully');
          
          // Verify the proof
          console.log('Verifying generated proof...');
          const isValid = await zkProofGenerator.verifyProof(
            proofResult.proof,
            proofResult.publicInputs
          );

          if (!isValid) {
            throw new Error('Generated ZK proof failed verification');
          }

          console.log('ZK proof verified successfully');
          
        } catch (zkError) {
          console.error('ZK proof generation/verification failed:', zkError);
          console.error('ZK Error stack:', zkError.stack);
          
          // For demo purposes, continue without ZK proof if it fails
          console.log('Continuing deposit without ZK proof due to error...');
          useZkProof = false;
          zkProofData = null;
          
          // Optionally, you could return an error instead:
          // return NextResponse.json(
          //   { error: `ZK proof failed: ${zkError.message}` },
          //   { status: 500 }
          // );
        }
      }
    }
    
    // Perform the actual XLM deposit
    try {
      // Check if user's account exists and is funded
      let accountExists = false;
      try {
        const balances = await getAccountBalance(userAddress);
        accountExists = true;
        console.log(`User account exists, proceeding with XLM deposit`);
      } catch (error) {
        if (error.message.includes('Account not found')) {
          console.log('User account not found, needs initial funding first');
          return NextResponse.json(
            { error: 'Account not found. Please fund your wallet first using the "Fund Wallet Now" button.' },
            { status: 400 }
          );
        }
        throw error;
      }

      // Create a temporary keypair to send XLM from (simulating an exchange/anchor)
      const { createKeypair, fundTestnetAccount, sendPayment } = await import('../../../../lib/stellar');
      const tempKeypair = createKeypair();
      
      // Fund the temporary account
      console.log('Funding temporary sender account...');
      await fundTestnetAccount(tempKeypair.publicKey());
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Send the specific XLM amount to user
      console.log(`Sending ${amount} XLM to user account...`);
      const paymentResult = await sendPayment(tempKeypair, userAddress, amount.toString());
      
      console.log(`Successfully sent ${amount} XLM to ${userAddress}:`, paymentResult.hash);
      
      // Set transaction ID from the real Stellar transaction
      transactionId = paymentResult.hash;
      
    } catch (depositError) {
      console.error('Real XLM deposit failed:', depositError);
      throw new Error(`XLM deposit failed: ${depositError.message}`);
    }

    // Simulate some processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('XLM deposit completed, creating transaction record...');

    // Ensure we have a transaction ID
    if (!transactionId) {
      transactionId = `xlm_deposit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('Using fallback transaction ID:', transactionId);
    }

    // Create transaction record for XLM deposit
    const transaction = new Transaction({
      hash: transactionId,
      type: 'deposit',
      amount: amount.toString(),
      userAddress,
      userId: user._id,
      method: paymentMethod,
      status: 'completed',
      currency: 'XLM',
      description: `${useZkProof ? 'ZK-verified ' : ''}XLM deposit of ${amount} XLM`,
      stellarTransactionHash: transactionId,
      zkProofUsed: useZkProof,
      zkProofData: zkProofData ? JSON.stringify(zkProofData) : null
    });

    await transaction.save();

    // Store attestation if ZK proof was used
    if (useZkProof && zkProofData) {
      const attestation = new Attestation({
        transactionId: zkProofData.attestation.transactionId,
        userAddress,
        userId: user._id,
        amount: amount.toString(),
        currency: 'USD',
        timestamp: zkProofData.attestation.timestamp,
        signature: zkProofData.signature,
        anchorPublicKey: 'mock_anchor_pubkey',
        used: true,
        usedAt: new Date(),
        zkProof: JSON.stringify({
          proof: zkProofData.proof,
          publicInputs: zkProofData.publicInputs
        })
      });

      try {
        await attestation.save();
        console.log('ZK attestation stored successfully');
      } catch (attestationError) {
        console.error('Failed to store attestation:', attestationError);
        // Don't fail the entire transaction for attestation storage issues
        console.log('Continuing without storing attestation...');
      }
    }

    console.log(`${useZkProof ? 'ZK-verified ' : ''}XLM deposit completed successfully`);

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction._id.toString(),
        hash: transactionId,
        amount,
        status: 'completed',
        type: 'deposit',
        currency: 'XLM',
        zkProofUsed: useZkProof && zkProofData !== null
      },
      zkProof: zkProofData ? {
        verified: true,
        publicInputs: zkProofData.publicInputs,
        proofGenerated: true
      } : (requestedZkProof ? {
        verified: false,
        error: 'ZK proof generation failed, deposit completed without ZK verification',
        proofGenerated: false
      } : null),
      message: `Successfully deposited ${amount} XLM to your wallet${useZkProof && zkProofData ? ' with ZK proof verification' : (requestedZkProof && !zkProofData ? ' (ZK proof failed, but deposit completed)' : '')}`
    });

  } catch (error) {
    console.error('Deposit error:', error);
    return NextResponse.json(
      { error: error.message || 'Deposit failed' },
      { status: 500 }
    );
  }
}
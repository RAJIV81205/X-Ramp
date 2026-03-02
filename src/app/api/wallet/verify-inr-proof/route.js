import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../lib/auth';
import { sendPayment, createKeypairFromSecret } from '../../../../lib/stellar';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Transaction from '../../../../models/Transaction';

// Import ZK proof generator for verification
let zkProofGenerator = null;
try {
  const zkModule = require('../../../../lib/zk');
  zkProofGenerator = zkModule.default || zkModule;
  console.log('ZK proof generator imported successfully');
} catch (zkImportError) {
  console.error('Failed to import ZK proof generator:', zkImportError);
}

// Mock exchange rate service
const getINRToXLMRate = async () => {
  return 19.5; // 1 XLM = 19.5 INR
};

export async function POST(request) {
  try {
    await connectDB();
    
    // Get token from Authorization header (this is the XLM sender/verifier)
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
    
    const { 
      proof,
      publicInputs,
      inrSenderEmail,
      message = ''
    } = await request.json();

    // Validate input
    if (!proof || !publicInputs || !inrSenderEmail) {
      return NextResponse.json(
        { error: 'Proof, public inputs, and INR sender email are required' },
        { status: 400 }
      );
    }

    if (!/\S+@\S+\.\S+/.test(inrSenderEmail)) {
      return NextResponse.json(
        { error: 'Invalid INR sender email' },
        { status: 400 }
      );
    }

    // Get XLM sender (the one verifying the proof)
    const xlmSender = await User.findById(userPayload.userId);
    if (!xlmSender) {
      return NextResponse.json(
        { error: 'XLM sender not found' },
        { status: 404 }
      );
    }

    // Get INR sender (the one who made the INR payment)
    const inrSender = await User.findOne({ email: inrSenderEmail.toLowerCase() });
    if (!inrSender) {
      return NextResponse.json(
        { error: 'INR sender not found. They need to create an account first.' },
        { status: 404 }
      );
    }

    console.log(`Processing INR proof verification from ${inrSenderEmail} to ${xlmSender.email}`);

    // Verify the ZK proof
    let proofValid = false;
    let proofDetails = {};

    if (zkProofGenerator) {
      try {
        console.log('Verifying ZK proof...');
        
        // Initialize ZK proof generator if needed
        if (!zkProofGenerator.initialized) {
          await zkProofGenerator.initialize();
        }

        // Verify the proof
        proofValid = await zkProofGenerator.verifyProof(proof, publicInputs);
        
        // Additional validation for INR transfer proof
        if (proofValid && publicInputs.length === 5) {
          const [inrAmount, xlmAmount, exchangeRate, recipientAddressHash, currentTime] = publicInputs;
          
          // Validate amounts are positive
          if (parseFloat(inrAmount) <= 0 || parseFloat(xlmAmount) <= 0) {
            proofValid = false;
            throw new Error('Invalid amounts in proof');
          }

          // Validate exchange rate
          const expectedRate = await getINRToXLMRate();
          const proofRate = parseFloat(exchangeRate) / 10000;
          const rateTolerance = 0.5; // 0.5 INR tolerance
          
          if (Math.abs(proofRate - expectedRate) > rateTolerance) {
            proofValid = false;
            throw new Error(`Exchange rate mismatch. Expected ~${expectedRate}, got ${proofRate}`);
          }

          // Validate timestamp (within last hour)
          const now = Math.floor(Date.now() / 1000);
          const proofTime = parseInt(currentTime);
          
          if (proofTime < now - 3600 || proofTime > now + 300) {
            proofValid = false;
            throw new Error('Proof timestamp is invalid or expired');
          }

          // Validate currency conversion
          const expectedXlm = parseFloat(inrAmount) / proofRate;
          const actualXlm = parseFloat(xlmAmount);
          const conversionTolerance = 0.001;
          
          if (Math.abs(expectedXlm - actualXlm) > expectedXlm * conversionTolerance) {
            proofValid = false;
            throw new Error('Currency conversion validation failed');
          }

          proofDetails = {
            inrAmount: inrAmount,
            xlmAmount: xlmAmount,
            exchangeRate: proofRate,
            proofTimestamp: proofTime,
            conversionValid: true
          };

          console.log('Proof validation successful:', proofDetails);
        }
      } catch (error) {
        console.error('Proof verification failed:', error);
        proofValid = false;
        
        return NextResponse.json(
          { error: `Proof verification failed: ${error.message}` },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'ZK proof verification not available' },
        { status: 500 }
      );
    }

    if (!proofValid) {
      return NextResponse.json(
        { error: 'Invalid proof. Cannot process XLM transfer.' },
        { status: 400 }
      );
    }

    // Proof is valid - now send XLM from xlmSender to inrSender
    try {
      console.log(`Proof verified! Sending ${proofDetails.xlmAmount} XLM from ${xlmSender.email} to ${inrSender.email}`);
      
      const xlmSenderKeypair = createKeypairFromSecret(xlmSender.encryptedSecretKey);
      
      // Send XLM payment
      const paymentResult = await sendPayment(
        xlmSenderKeypair,
        inrSender.publicKey,
        proofDetails.xlmAmount,
        `INR-to-XLM: ₹${proofDetails.inrAmount} verified → ${proofDetails.xlmAmount} XLM${message ? ` - ${message}` : ''}`
      );

      console.log('XLM payment successful:', paymentResult.hash);

      const transferId = `inr_xlm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create transaction records
      const xlmSenderTransaction = new Transaction({
        hash: paymentResult.hash,
        type: 'transfer_sent',
        amount: proofDetails.xlmAmount,
        userAddress: xlmSender.publicKey,
        userId: xlmSender._id,
        status: 'completed',
        method: 'inr_proof_verification',
        description: `Sent ${proofDetails.xlmAmount} XLM for verified INR payment of ₹${proofDetails.inrAmount} from ${inrSenderEmail}`,
        recipientEmail: inrSenderEmail,
        message: message,
        stellarTransactionHash: paymentResult.hash,
        zkProofUsed: true,
        zkProofData: JSON.stringify({
          proof: proof,
          publicInputs: publicInputs,
          proofType: 'inr_transfer',
          verifiedAt: new Date().toISOString(),
          ...proofDetails
        }),
        inrAmount: proofDetails.inrAmount,
        exchangeRate: proofDetails.exchangeRate
      });

      const inrSenderTransaction = new Transaction({
        hash: paymentResult.hash + '_received',
        type: 'transfer_received',
        amount: proofDetails.xlmAmount,
        userAddress: inrSender.publicKey,
        userId: inrSender._id,
        status: 'completed',
        method: 'inr_proof_verification',
        description: `Received ${proofDetails.xlmAmount} XLM for INR payment of ₹${proofDetails.inrAmount} verified by ${xlmSender.email}`,
        senderEmail: xlmSender.email,
        message: message,
        stellarTransactionHash: paymentResult.hash,
        zkProofUsed: true,
        zkProofData: JSON.stringify({
          proof: proof,
          publicInputs: publicInputs,
          proofType: 'inr_transfer',
          verifiedAt: new Date().toISOString(),
          ...proofDetails
        }),
        inrAmount: proofDetails.inrAmount,
        exchangeRate: proofDetails.exchangeRate
      });

      await Promise.all([
        xlmSenderTransaction.save(),
        inrSenderTransaction.save()
      ]);

      return NextResponse.json({
        success: true,
        message: `Successfully verified INR proof and sent ${proofDetails.xlmAmount} XLM to ${inrSenderEmail}`,
        transactionHash: paymentResult.hash,
        transferId: transferId,
        proofDetails: proofDetails,
        xlmSent: proofDetails.xlmAmount,
        inrVerified: proofDetails.inrAmount,
        exchangeRate: proofDetails.exchangeRate
      });

    } catch (stellarError) {
      console.error('XLM payment failed:', stellarError);
      
      // Create failed transaction record
      const failedTransaction = new Transaction({
        hash: transferId || `failed_${Date.now()}`,
        type: 'transfer_sent',
        amount: proofDetails.xlmAmount,
        userAddress: xlmSender.publicKey,
        userId: xlmSender._id,
        status: 'failed',
        method: 'inr_proof_verification',
        description: `Failed to send ${proofDetails.xlmAmount} XLM for verified INR payment: ${stellarError.message}`,
        recipientEmail: inrSenderEmail,
        message: message,
        zkProofUsed: true,
        zkProofData: JSON.stringify({
          proof: proof,
          publicInputs: publicInputs,
          proofType: 'inr_transfer',
          verificationFailed: true,
          error: stellarError.message,
          ...proofDetails
        }),
        inrAmount: proofDetails.inrAmount,
        exchangeRate: proofDetails.exchangeRate
      });

      await failedTransaction.save();

      return NextResponse.json(
        { error: `Proof verified but XLM transfer failed: ${stellarError.message}` },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('INR proof verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
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

/**
 * Automatically verify INR proof and send XLM
 * This endpoint is called internally when a proof is generated
 */
export async function POST(request) {
  try {
    await connectDB();
    
    const { 
      proof,
      publicInputs,
      inrSenderEmail,
      xlmSenderEmail,
      inrAmount,
      xlmAmount,
      exchangeRate,
      message = ''
    } = await request.json();

    console.log(`Auto-verifying INR proof: ${inrSenderEmail} → ${xlmSenderEmail}`);

    // Validate input
    if (!proof || !publicInputs || !inrSenderEmail || !xlmSenderEmail) {
      return NextResponse.json(
        { error: 'Missing required parameters for auto-verification' },
        { status: 400 }
      );
    }

    // Get both users
    const [inrSender, xlmSender] = await Promise.all([
      User.findOne({ email: inrSenderEmail.toLowerCase() }),
      User.findOne({ email: xlmSenderEmail.toLowerCase() })
    ]);

    if (!inrSender) {
      return NextResponse.json(
        { error: 'INR sender not found' },
        { status: 404 }
      );
    }

    if (!xlmSender) {
      return NextResponse.json(
        { error: 'XLM sender not found' },
        { status: 404 }
      );
    }

    // Verify the ZK proof automatically
    let proofValid = false;
    let proofDetails = {};

    if (zkProofGenerator) {
      try {
        console.log('Auto-verifying ZK proof...');
        
        // Initialize ZK proof generator if needed
        if (!zkProofGenerator.initialized) {
          await zkProofGenerator.initialize();
        }

        // Verify the proof
        proofValid = await zkProofGenerator.verifyProof(proof, publicInputs);
        
        // Additional validation for INR transfer proof
        if (proofValid && publicInputs.length === 5) {
          const [proofInrAmount, proofXlmAmount, proofExchangeRate, recipientAddressHash, currentTime] = publicInputs;
          
          // Validate amounts match
          const expectedXlmAmountScaled = Math.floor(parseFloat(xlmAmount) * 10000000).toString();
          if (proofInrAmount !== inrAmount.toString() || proofXlmAmount !== expectedXlmAmountScaled) {
            console.log('Amount mismatch:', {
              proofInrAmount,
              expectedInrAmount: inrAmount.toString(),
              proofXlmAmount,
              expectedXlmAmountScaled,
              originalXlmAmount: xlmAmount
            });
            proofValid = false;
            throw new Error(`Proof amounts do not match expected values. Expected INR: ${inrAmount}, XLM: ${expectedXlmAmountScaled}, Got INR: ${proofInrAmount}, XLM: ${proofXlmAmount}`);
          }

          // Validate exchange rate
          const expectedRate = await getINRToXLMRate();
          const proofRate = parseFloat(proofExchangeRate) / 10000;
          const rateTolerance = 0.5; // 0.5 INR tolerance
          
          if (Math.abs(proofRate - expectedRate) > rateTolerance) {
            proofValid = false;
            throw new Error(`Exchange rate mismatch. Expected ~${expectedRate}, got ${proofRate}`);
          }

          // Validate timestamp (within last 10 minutes for auto-verification)
          const now = Math.floor(Date.now() / 1000);
          const proofTime = parseInt(currentTime);
          
          if (proofTime < now - 600 || proofTime > now + 300) {
            proofValid = false;
            throw new Error('Proof timestamp is invalid or expired for auto-verification');
          }

          // Validate currency conversion using scaled amounts
          // Formula: xlmAmount = inrAmount / exchangeRate
          // With scaling: xlmAmountScaled = (inrAmount / (exchangeRate / 10000)) * 10000000
          const exchangeRateActual = parseFloat(proofExchangeRate) / 10000; // Convert back from scaled
          const expectedXlmScaled = (parseFloat(inrAmount) / exchangeRateActual) * 10000000;
          const actualXlmScaled = parseFloat(proofXlmAmount);
          const conversionTolerance = 0.001; // 0.1% tolerance (very precise)
          
          console.log('Currency conversion validation:', {
            inrAmount: parseFloat(inrAmount),
            exchangeRateScaled: parseFloat(proofExchangeRate),
            exchangeRateActual,
            expectedXlmScaled,
            actualXlmScaled,
            difference: Math.abs(expectedXlmScaled - actualXlmScaled),
            tolerance: expectedXlmScaled * conversionTolerance,
            percentageDiff: (Math.abs(expectedXlmScaled - actualXlmScaled) / expectedXlmScaled) * 100
          });
          
          if (Math.abs(expectedXlmScaled - actualXlmScaled) > expectedXlmScaled * conversionTolerance) {
            proofValid = false;
            throw new Error(`Currency conversion validation failed. Expected: ${expectedXlmScaled}, Actual: ${actualXlmScaled}, Difference: ${Math.abs(expectedXlmScaled - actualXlmScaled)}, Tolerance: ${expectedXlmScaled * conversionTolerance}, Percentage Diff: ${((Math.abs(expectedXlmScaled - actualXlmScaled) / expectedXlmScaled) * 100).toFixed(8)}%`);
          }

          proofDetails = {
            inrAmount: inrAmount,
            xlmAmount: xlmAmount,
            exchangeRate: proofRate,
            proofTimestamp: proofTime,
            conversionValid: true
          };

          console.log('Auto-verification successful:', proofDetails);
        }
      } catch (error) {
        console.error('Auto-verification failed:', error);
        proofValid = false;
        
        return NextResponse.json(
          { 
            success: false,
            error: `Auto-verification failed: ${error.message}`,
            autoVerified: false
          },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: 'ZK proof verification not available',
          autoVerified: false
        },
        { status: 500 }
      );
    }

    if (!proofValid) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid proof. Auto-verification failed.',
          autoVerified: false
        },
        { status: 400 }
      );
    }

    // Proof is valid - automatically send XLM from xlmSender to inrSender
    try {
      console.log(`Auto-verification passed! Sending ${xlmAmount} XLM from ${xlmSender.email} to ${inrSender.email}`);
      
      const xlmSenderKeypair = createKeypairFromSecret(xlmSender.encryptedSecretKey);
      
      // Send XLM payment automatically
      const paymentResult = await sendPayment(
        xlmSenderKeypair,
        inrSender.publicKey,
        xlmAmount,
        `Auto-verified INR-to-XLM: ₹${inrAmount} → ${xlmAmount} XLM${message ? ` - ${message}` : ''}`
      );

      console.log('Auto XLM payment successful:', paymentResult.hash);

      const transferId = `auto_inr_xlm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create transaction records with unique hashes
      const xlmSenderTransaction = new Transaction({
        hash: paymentResult.hash,
        type: 'transfer_sent',
        amount: xlmAmount,
        userAddress: xlmSender.publicKey,
        userId: xlmSender._id,
        status: 'completed',
        method: 'auto_inr_verification',
        description: `Auto-sent ${xlmAmount} XLM for verified INR payment of ₹${inrAmount} from ${inrSenderEmail}`,
        recipientEmail: inrSenderEmail,
        message: message,
        stellarTransactionHash: paymentResult.hash,
        zkProofUsed: true,
        zkProofData: JSON.stringify({
          proof: proof,
          publicInputs: publicInputs,
          proofType: 'inr_transfer',
          autoVerified: true,
          verifiedAt: new Date().toISOString(),
          ...proofDetails
        }),
        inrAmount: inrAmount,
        exchangeRate: proofDetails.exchangeRate
      });

      const inrSenderTransaction = new Transaction({
        hash: `${paymentResult.hash}_received_${Date.now()}`, // Make unique
        type: 'transfer_received',
        amount: xlmAmount,
        userAddress: inrSender.publicKey,
        userId: inrSender._id,
        status: 'completed',
        method: 'auto_inr_verification',
        description: `Auto-received ${xlmAmount} XLM for INR payment of ₹${inrAmount} verified automatically`,
        senderEmail: xlmSender.email,
        message: message,
        stellarTransactionHash: paymentResult.hash,
        zkProofUsed: true,
        zkProofData: JSON.stringify({
          proof: proof,
          publicInputs: publicInputs,
          proofType: 'inr_transfer',
          autoVerified: true,
          verifiedAt: new Date().toISOString(),
          ...proofDetails
        }),
        inrAmount: inrAmount,
        exchangeRate: proofDetails.exchangeRate
      });

      await Promise.all([
        xlmSenderTransaction.save(),
        inrSenderTransaction.save()
      ]);

      return NextResponse.json({
        success: true,
        autoVerified: true,
        message: `Auto-verification successful! Sent ${xlmAmount} XLM to ${inrSenderEmail}`,
        transactionHash: paymentResult.hash,
        transferId: transferId,
        proofDetails: proofDetails,
        xlmSent: xlmAmount,
        inrVerified: inrAmount,
        exchangeRate: proofDetails.exchangeRate
      });

    } catch (stellarError) {
      console.error('Auto XLM payment failed:', stellarError);
      
      // Create failed transaction record
      const failedTransaction = new Transaction({
        hash: transferId || `auto_failed_${Date.now()}`,
        type: 'transfer_sent',
        amount: xlmAmount,
        userAddress: xlmSender.publicKey,
        userId: xlmSender._id,
        status: 'failed',
        method: 'auto_inr_verification',
        description: `Auto-verification passed but XLM transfer failed: ${stellarError.message}`,
        recipientEmail: inrSenderEmail,
        message: message,
        zkProofUsed: true,
        zkProofData: JSON.stringify({
          proof: proof,
          publicInputs: publicInputs,
          proofType: 'inr_transfer',
          autoVerified: true,
          autoTransferFailed: true,
          error: stellarError.message,
          ...proofDetails
        }),
        inrAmount: inrAmount,
        exchangeRate: proofDetails.exchangeRate
      });

      await failedTransaction.save();

      return NextResponse.json(
        { 
          success: false,
          autoVerified: true,
          error: `Auto-verification passed but XLM transfer failed: ${stellarError.message}` 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Auto-verification error:', error);
    return NextResponse.json(
      { 
        success: false,
        autoVerified: false,
        error: 'Auto-verification system error' 
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../lib/auth';
import { sendPayment, createKeypairFromSecret, getAccountBalance } from '../../../../lib/stellar';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Transaction from '../../../../models/Transaction';

// Import ZK proof generator
let zkProofGenerator = null;
try {
  const zkModule = require('../../../../lib/zk');
  zkProofGenerator = zkModule.default || zkModule;
  console.log('ZK proof generator imported successfully');
} catch (zkImportError) {
  console.error('Failed to import ZK proof generator:', zkImportError);
}

// Mock exchange rate service (in production, use real API)
const getINRToXLMRate = async () => {
  // Mock rate: 1 XLM = 19.5 INR (current market rate)
  return 19.5;
};

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
    
    const { 
      recipientEmail, 
      inrAmount, 
      senderBankAccount, 
      transactionId, 
      message,
      generateProof = true 
    } = await request.json();

    // Validate input
    if (!recipientEmail || !inrAmount || !senderBankAccount || !transactionId) {
      return NextResponse.json(
        { error: 'Recipient email, INR amount, sender bank account, and transaction ID are required' },
        { status: 400 }
      );
    }

    if (inrAmount < 50) {
      return NextResponse.json(
        { error: 'Minimum transfer amount is ₹50' },
        { status: 400 }
      );
    }

    if (inrAmount > 200000) {
      return NextResponse.json(
        { error: 'Maximum transfer amount is ₹200,000' },
        { status: 400 }
      );
    }

    if (!/\S+@\S+\.\S+/.test(recipientEmail)) {
      return NextResponse.json(
        { error: 'Invalid recipient email' },
        { status: 400 }
      );
    }

    // Get sender user
    const sender = await User.findById(userPayload.userId);
    if (!sender) {
      return NextResponse.json(
        { error: 'Sender not found' },
        { status: 404 }
      );
    }

    console.log(`Processing INR to XLM transfer: ₹${inrAmount} to ${recipientEmail}`);

    // Get current exchange rate
    const exchangeRate = await getINRToXLMRate();
    const xlmAmount = (parseFloat(inrAmount) / exchangeRate).toFixed(7);

    console.log(`Exchange rate: 1 XLM = ₹${exchangeRate}, Converting ₹${inrAmount} to ${xlmAmount} XLM`);

    // Check if recipient exists
    let recipient = await User.findOne({ email: recipientEmail.toLowerCase() });
    
    const transferId = `inr_transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let zkProofData = null;

    // Generate ZK proof if requested
    if (generateProof && zkProofGenerator) {
      try {
        console.log('Generating ZK proof for INR transfer...');
        
        const nonce = Math.floor(Math.random() * 1000000).toString();
        const paymentSignature = `bank_sig_${transactionId}_${Date.now()}`;

        const proofResult = await zkProofGenerator.generateINRTransferProof({
          inrAmount: inrAmount.toString(),
          xlmAmount: xlmAmount.toString(),
          exchangeRate: Math.floor(exchangeRate * 10000).toString(), // Scale for precision
          recipientAddress: recipient ? recipient.publicKey : 'pending_recipient',
          senderBankAccount: senderBankAccount,
          transactionId: transactionId,
          nonce: nonce,
          paymentSignature: paymentSignature
        });

        if (proofResult.success) {
          zkProofData = {
            proof: proofResult.proof,
            publicInputs: proofResult.publicInputs,
            proofType: 'inr_transfer',
            generatedAt: new Date().toISOString(),
            inrAmount: inrAmount,
            xlmAmount: xlmAmount,
            exchangeRate: exchangeRate
          };
          console.log('ZK proof generated successfully for INR transfer');
        } else {
          console.error('ZK proof generation failed:', proofResult.error);
          return NextResponse.json(
            { error: `ZK proof generation failed: ${proofResult.error}` },
            { status: 500 }
          );
        }
      } catch (proofError) {
        console.error('ZK proof generation error:', proofError);
        return NextResponse.json(
          { error: 'Failed to generate ZK proof for transfer' },
          { status: 500 }
        );
      }
    }

    if (recipient) {
      // Recipient has account - generate proof and auto-verify
      console.log('Recipient found. Generating proof and auto-verifying...');
      
      if (zkProofData) {
        // Automatically verify the proof and send XLM
        try {
          console.log('Calling auto-verification system...');
          
          const autoVerifyResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/wallet/auto-verify-inr`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              proof: zkProofData.proof,
              publicInputs: zkProofData.publicInputs,
              inrSenderEmail: sender.email,
              xlmSenderEmail: recipientEmail,
              inrAmount: inrAmount,
              xlmAmount: xlmAmount,
              exchangeRate: exchangeRate,
              message: message
            })
          });

          const autoVerifyData = await autoVerifyResponse.json();

          if (autoVerifyData.success && autoVerifyData.autoVerified) {
            console.log('Auto-verification successful!', autoVerifyData.transactionHash);
            
            // Update the pending transaction to completed
            const completedTransaction = new Transaction({
              hash: `${autoVerifyData.transactionHash}_inr_completed_${Date.now()}`, // Make unique
              type: 'transfer_sent',
              amount: xlmAmount,
              userAddress: sender.publicKey,
              userId: sender._id,
              status: 'completed',
              method: 'auto_inr_transfer',
              description: `Auto-completed: ₹${inrAmount} → ${xlmAmount} XLM to ${recipientEmail}`,
              recipientEmail: recipientEmail,
              message: message,
              stellarTransactionHash: autoVerifyData.transactionHash,
              zkProofUsed: true,
              zkProofData: JSON.stringify({
                ...zkProofData,
                autoVerified: true,
                autoVerificationResult: autoVerifyData
              }),
              inrAmount: inrAmount,
              exchangeRate: exchangeRate
            });

            await completedTransaction.save();

            return NextResponse.json({
              success: true,
              message: `INR payment proof generated and automatically verified! ${xlmAmount} XLM sent to ${recipientEmail}`,
              transactionHash: autoVerifyData.transactionHash,
              transferId: transferId,
              status: 'completed',
              autoVerified: true,
              inrAmount: inrAmount,
              xlmAmount: xlmAmount,
              exchangeRate: exchangeRate,
              zkProofGenerated: true,
              zkProofData: zkProofData
            });
          } else {
            console.log('Auto-verification failed:', autoVerifyData.error);
            
            // Create pending transaction since auto-verification failed
            const pendingTransaction = new Transaction({
              hash: transferId,
              type: 'transfer_sent',
              amount: xlmAmount,
              userAddress: sender.publicKey,
              userId: sender._id,
              status: 'pending',
              method: 'inr_transfer',
              description: `INR payment proof generated: ₹${inrAmount} → ${xlmAmount} XLM. Auto-verification failed: ${autoVerifyData.error}`,
              recipientEmail: recipientEmail,
              message: message,
              zkProofUsed: true,
              zkProofData: JSON.stringify({
                ...zkProofData,
                autoVerificationFailed: true,
                autoVerificationError: autoVerifyData.error
              }),
              inrAmount: inrAmount,
              exchangeRate: exchangeRate
            });

            await pendingTransaction.save();

            return NextResponse.json({
              success: true,
              message: `INR payment proof generated but auto-verification failed. Manual verification required.`,
              transferId: transferId,
              status: 'pending_manual_verification',
              autoVerified: false,
              autoVerificationError: autoVerifyData.error,
              inrAmount: inrAmount,
              xlmAmount: xlmAmount,
              exchangeRate: exchangeRate,
              zkProofGenerated: true,
              zkProofData: zkProofData
            });
          }
        } catch (autoVerifyError) {
          console.error('Auto-verification system error:', autoVerifyError);
          
          // Create pending transaction since auto-verification system failed
          const pendingTransaction = new Transaction({
            hash: transferId,
            type: 'transfer_sent',
            amount: xlmAmount,
            userAddress: sender.publicKey,
            userId: sender._id,
            status: 'pending',
            method: 'inr_transfer',
            description: `INR payment proof generated: ₹${inrAmount} → ${xlmAmount} XLM. Auto-verification system error.`,
            recipientEmail: recipientEmail,
            message: message,
            zkProofUsed: true,
            zkProofData: JSON.stringify({
              ...zkProofData,
              autoVerificationSystemError: true,
              systemError: autoVerifyError.message
            }),
            inrAmount: inrAmount,
            exchangeRate: exchangeRate
          });

          await pendingTransaction.save();

          return NextResponse.json({
            success: true,
            message: `INR payment proof generated but auto-verification system failed. Manual verification required.`,
            transferId: transferId,
            status: 'pending_system_error',
            autoVerified: false,
            systemError: autoVerifyError.message,
            inrAmount: inrAmount,
            xlmAmount: xlmAmount,
            exchangeRate: exchangeRate,
            zkProofGenerated: true,
            zkProofData: zkProofData
          });
        }
      } else {
        // No proof generated, create pending transaction
        const pendingTransaction = new Transaction({
          hash: transferId,
          type: 'transfer_sent',
          amount: xlmAmount,
          userAddress: sender.publicKey,
          userId: sender._id,
          status: 'pending',
          method: 'inr_transfer',
          description: `INR payment recorded: ₹${inrAmount} → ${xlmAmount} XLM. No proof generated.`,
          recipientEmail: recipientEmail,
          message: message,
          zkProofUsed: false,
          inrAmount: inrAmount,
          exchangeRate: exchangeRate
        });

        await pendingTransaction.save();

        return NextResponse.json({
          success: true,
          message: `INR payment recorded for ₹${inrAmount} (${xlmAmount} XLM). No proof generated.`,
          transferId: transferId,
          status: 'pending_no_proof',
          autoVerified: false,
          inrAmount: inrAmount,
          xlmAmount: xlmAmount,
          exchangeRate: exchangeRate,
          zkProofGenerated: false
        });
      }
    } else {
      // Recipient doesn't have account - create pending transfer with proof
      console.log('Recipient not found, creating pending transfer...');
      
      const pendingTransaction = new Transaction({
        hash: transferId,
        type: 'transfer_sent',
        amount: xlmAmount,
        userAddress: sender.publicKey,
        userId: sender._id,
        status: 'pending',
        method: 'inr_transfer',
        description: `Pending transfer: ${xlmAmount} XLM (₹${inrAmount}) to ${recipientEmail}`,
        recipientEmail: recipientEmail,
        message: message,
        zkProofUsed: !!zkProofData,
        zkProofData: zkProofData ? JSON.stringify(zkProofData) : null,
        inrAmount: inrAmount,
        exchangeRate: exchangeRate
      });

      await pendingTransaction.save();

      // In a real system, you would:
      // 1. Send email notification to recipient
      // 2. Store the proof for later verification when they sign up
      // 3. Set up a claim mechanism

      return NextResponse.json({
        success: true,
        message: `Transfer initiated. ₹${inrAmount} (${xlmAmount} XLM) will be sent to ${recipientEmail} when they create an account.`,
        transferId: transferId,
        status: 'pending',
        inrAmount: inrAmount,
        xlmAmount: xlmAmount,
        exchangeRate: exchangeRate,
        zkProofGenerated: !!zkProofData,
        zkProofData: zkProofData
      });
    }

  } catch (error) {
    console.error('INR transfer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve exchange rates
export async function GET(request) {
  try {
    const exchangeRate = await getINRToXLMRate();
    
    return NextResponse.json({
      success: true,
      exchangeRate: exchangeRate,
      currency: 'INR',
      baseCurrency: 'XLM',
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to get exchange rate:', error);
    return NextResponse.json(
      { error: 'Failed to get exchange rate' },
      { status: 500 }
    );
  }
}
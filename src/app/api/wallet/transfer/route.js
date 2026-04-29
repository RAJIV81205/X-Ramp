import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../lib/auth';
import { sendPayment, createKeypairFromSecret } from '../../../../lib/stellar';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Transaction from '../../../../models/Transaction';

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
    
    const { recipientEmail, amount, message, senderAddress } = await request.json();

    // Validate input
    if (!recipientEmail || !amount || !senderAddress) {
      return NextResponse.json(
        { error: 'Recipient email, amount, and sender address are required' },
        { status: 400 }
      );
    }

    if (amount < 1) {
      return NextResponse.json(
        { error: 'Minimum transfer amount is 1 XLM' },
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

    console.log('Processing P2P transfer...');

    // Check if recipient exists
    let recipient = await User.findOne({ email: recipientEmail.toLowerCase() });
    
    const transferId = `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (recipient) {
      // Recipient has account - perform REAL Stellar XLM payment
      try {
        console.log('Making real XLM payment on Stellar network...');
        
        const senderKeypair = createKeypairFromSecret(sender.encryptedSecretKey);
        
        // Send real XLM payment on Stellar network
        const paymentResult = await sendPayment(
          senderKeypair,
          recipient.publicKey,
          amount
        );

        console.log('Real Stellar XLM payment successful:', paymentResult.hash);

        // Create sender transaction
        const senderTransaction = new Transaction({
          hash: paymentResult.hash,
          type: 'transfer_sent',
          amount: amount.toString(),
          userAddress: senderAddress,
          userId: sender._id,
          method: 'xlm_transfer',
          status: 'completed',
          currency: 'XLM',
          recipientEmail,
          message: message || '',
          description: `Sent ${amount} XLM to ${recipientEmail}`,
          stellarTransactionHash: paymentResult.hash
        });

        await senderTransaction.save();

        // Create recipient transaction
        const recipientTransaction = new Transaction({
          hash: `${paymentResult.hash}_receive`,
          type: 'transfer_received',
          amount: amount.toString(),
          userAddress: recipient.publicKey,
          userId: recipient._id,
          method: 'xlm_transfer',
          status: 'completed',
          currency: 'XLM',
          senderEmail: sender.email,
          message: message || '',
          description: `Received ${amount} XLM from ${sender.email}`,
          stellarTransactionHash: paymentResult.hash
        });

        await recipientTransaction.save();

        console.log('Real XLM transfer completed successfully');

        return NextResponse.json({
          success: true,
          transaction: {
            id: senderTransaction._id.toString(),
            hash: paymentResult.hash,
            amount,
            status: 'completed',
            type: 'transfer_sent',
            currency: 'XLM',
            recipientEmail
          },
          recipientExists: true,
          message: `Successfully sent ${amount} XLM to ${recipientEmail}`,
          stellarTransaction: paymentResult
        });

      } catch (stellarError) {
        console.error('Real Stellar XLM payment failed:', stellarError);
        
        // Create failed transaction record
        const failedTransaction = new Transaction({
          hash: `failed_${transferId}`,
          type: 'transfer_sent',
          amount: amount.toString(),
          userAddress: senderAddress,
          userId: sender._id,
          method: 'xlm_transfer',
          status: 'failed',
          currency: 'XLM',
          recipientEmail,
          message: message || '',
          description: `Failed XLM transfer to ${recipientEmail}: ${stellarError.message}`,
          contractCallResult: stellarError.message
        });

        await failedTransaction.save();

        throw new Error(`XLM payment failed: ${stellarError.message}`);
      }
    } else {
      // Recipient doesn't have account - create pending transfer
      const senderTransaction = new Transaction({
        hash: `pending_${transferId}`,
        type: 'transfer_sent',
        amount: amount.toString(),
        userAddress: senderAddress,
        userId: sender._id,
        method: 'p2p_transfer',
        status: 'pending',
        recipientEmail,
        message: message || '',
        description: `Pending transfer to ${recipientEmail}`
      });

      await senderTransaction.save();

      console.log('Transfer pending - recipient needs to create account');
      
      // In production, send email notification to recipient
      console.log(`Email notification would be sent to ${recipientEmail}`);

      return NextResponse.json({
        success: true,
        transaction: {
          id: senderTransaction._id.toString(),
          hash: senderTransaction.hash,
          amount,
          status: 'pending',
          type: 'transfer_sent',
          recipientEmail
        },
        recipientExists: false,
        message: 'Transfer initiated. Recipient will be notified via email.'
      });
    }

  } catch (error) {
    console.error('Transfer error:', error);
    return NextResponse.json(
      { error: error.message || 'Transfer failed' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../lib/auth';
import { XRampContract, parseAmount, createKeypairFromSecret } from '../../../../lib/stellar';
import anchorService from '../../../../lib/anchor';
import zkProofGenerator from '../../../../lib/zk';
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
    
    const { amount, bankDetails, userAddress } = await request.json();

    // Validate input
    if (!amount || !bankDetails || !userAddress) {
      return NextResponse.json(
        { error: 'Amount, bank details, and user address are required' },
        { status: 400 }
      );
    }

    if (amount < 10 || amount > 5000) {
      return NextResponse.json(
        { error: 'Amount must be between $10 and $5,000' },
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

    // Validate bank details
    const validation = await anchorService.validateBankAccount(bankDetails);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid bank details' },
        { status: 400 }
      );
    }

    console.log('Processing XLM withdrawal...');

    // For XLM withdrawal, we'll simulate converting XLM back to fiat
    // In a real system, this would involve selling XLM on an exchange
    
    // Check current XLM balance from Stellar network
    try {
      const balances = await getAccountBalance(userAddress);
      const xlmBalance = balances.find(b => b.asset_type === 'native');
      const availableXLM = xlmBalance ? parseFloat(xlmBalance.balance) : 0;
      
      if (availableXLM < amount + 1) { // Need extra for fees
        return NextResponse.json(
          { error: `Insufficient XLM balance. Available: ${availableXLM} XLM, Required: ${amount + 1} XLM (including fees)` },
          { status: 400 }
        );
      }
    } catch (balanceError) {
      console.error('Failed to check XLM balance:', balanceError);
      return NextResponse.json(
        { error: 'Failed to check wallet balance' },
        { status: 500 }
      );
    }

    // Simulate XLM to fiat conversion process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate withdrawal transaction ID
    const withdrawalId = `xlm_withdrawal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create transaction record for XLM withdrawal
    const transaction = new Transaction({
      hash: withdrawalId,
      type: 'withdrawal',
      amount: amount.toString(),
      userAddress,
      userId: user._id,
      method: 'xlm_to_fiat',
      status: 'processing',
      currency: 'XLM',
      bankDetails: JSON.stringify(bankDetails),
      description: `Withdrawal of ${amount} XLM to bank account`,
      stellarTransactionHash: withdrawalId
    });

    await transaction.save();

    // Simulate bank transfer processing (complete after 5 seconds)
    setTimeout(async () => {
      try {
        transaction.status = 'completed';
        await transaction.save();
        console.log('XLM withdrawal completed');
      } catch (error) {
        console.error('Failed to update withdrawal status:', error);
      }
    }, 5000);

    console.log('XLM withdrawal initiated successfully');

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction._id.toString(),
        hash: withdrawalId,
        amount,
        status: 'processing',
        type: 'withdrawal',
        currency: 'XLM'
      },
      message: `XLM withdrawal of ${amount} XLM initiated`,
      estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });

  } catch (error) {
    console.error('Withdrawal error:', error);
    return NextResponse.json(
      { error: error.message || 'Withdrawal failed' },
      { status: 500 }
    );
  }
}
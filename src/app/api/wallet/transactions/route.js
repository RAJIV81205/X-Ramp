import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../lib/auth';
import connectDB from '../../../../lib/mongodb';
import Transaction from '../../../../models/Transaction';

export async function GET(request) {
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
    
    const userAddress = userPayload.publicKey;
    
    // Get transactions for user
    const transactions = await Transaction.find({ userAddress })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      success: true,
      transactions: transactions.map(tx => ({
        id: tx._id.toString(),
        hash: tx.hash,
        type: tx.type,
        amount: tx.amount,
        status: tx.status,
        method: tx.method,
        description: tx.description,
        recipientEmail: tx.recipientEmail,
        senderEmail: tx.senderEmail,
        message: tx.message,
        createdAt: tx.createdAt,
        stellarTransactionHash: tx.stellarTransactionHash
      }))
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to get transactions' },
      { status: 500 }
    );
  }
}
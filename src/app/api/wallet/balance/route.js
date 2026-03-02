import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../lib/auth';
import { XRampContract, formatBalance, getAccountBalance } from '../../../../lib/stellar';
import connectDB from '../../../../lib/mongodb';

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
    
    let contractBalance = '0';
    let stellarBalance = '0';
    
    // Get contract balance (USDC equivalent)
    try {
      const contract = new XRampContract();
      const balance = await contract.getUserBalance(userAddress);
      contractBalance = formatBalance(balance);
    } catch (error) {
      console.error('Failed to get contract balance:', error);
    }
    
    // Get Stellar native balance (XLM)
    try {
      const balances = await getAccountBalance(userAddress);
      const xlmBalance = balances.find(b => b.asset_type === 'native');
      stellarBalance = xlmBalance ? parseFloat(xlmBalance.balance).toFixed(2) : '0';
    } catch (error) {
      console.error('Failed to get Stellar balance:', error);
    }

    return NextResponse.json({
      success: true,
      contractBalance,
      stellarBalance,
      balances: {
        usdc: contractBalance,
        xlm: stellarBalance
      }
    });

  } catch (error) {
    console.error('Get balance error:', error);
    return NextResponse.json(
      { error: 'Failed to get balance' },
      { status: 500 }
    );
  }
}
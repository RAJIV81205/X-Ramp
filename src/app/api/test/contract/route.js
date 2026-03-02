import { NextResponse } from 'next/server';
import { XRampContract } from '../../../../lib/stellar';

export async function GET() {
  try {
    const contractId = process.env.NEXT_PUBLIC_CONTRACT_ID;
    
    if (!contractId) {
      return NextResponse.json({
        success: false,
        error: 'Contract ID not configured',
        contractId: null
      });
    }

    // Test contract initialization
    const contract = new XRampContract();
    
    return NextResponse.json({
      success: true,
      message: 'Contract initialized successfully',
      contractId,
      sorobanUrl: process.env.NEXT_PUBLIC_SOROBAN_URL,
      horizonUrl: process.env.NEXT_PUBLIC_HORIZON_URL,
      network: process.env.NEXT_PUBLIC_STELLAR_NETWORK
    });

  } catch (error) {
    console.error('Contract test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      contractId: process.env.NEXT_PUBLIC_CONTRACT_ID
    }, { status: 500 });
  }
}
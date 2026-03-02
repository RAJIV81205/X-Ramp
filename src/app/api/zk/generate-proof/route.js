import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../lib/auth';
import zkProofGenerator from '../../../../lib/zk';

export async function POST(request) {
  try {
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
    
    const { type, inputs } = await request.json();

    // Validate input
    if (!type || !inputs) {
      return NextResponse.json(
        { error: 'Proof type and inputs are required' },
        { status: 400 }
      );
    }

    console.log(`Generating ${type} proof for user ${userPayload.userId}`);

    let result;

    switch (type) {
      case 'deposit':
        result = await generateDepositProof(inputs);
        break;
      case 'withdrawal':
        result = await generateWithdrawalProof(inputs);
        break;
      case 'inr_transfer':
        result = await generateINRTransferProof(inputs);
        break;
      case 'batch':
        result = await generateBatchProof(inputs);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid proof type. Supported types: deposit, withdrawal, inr_transfer, batch' },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        proof: result.proof,
        publicInputs: result.publicInputs,
        proofType: type,
        generatedAt: new Date().toISOString()
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Proof generation failed' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('ZK proof generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateDepositProof(inputs) {
  try {
    const {
      amount,
      userAddress,
      attestation,
      signature,
      anchorPublicKey
    } = inputs;

    // Validate required inputs
    if (!amount || !userAddress || !attestation || !signature || !anchorPublicKey) {
      throw new Error('Missing required inputs for deposit proof');
    }

    // Initialize ZK proof generator
    if (!zkProofGenerator.initialized) {
      await zkProofGenerator.initialize();
    }

    // Generate deposit proof
    const result = await zkProofGenerator.generateDepositProof({
      amount,
      userAddress,
      attestation,
      signature,
      anchorPublicKey
    });

    return result;
  } catch (error) {
    console.error('Deposit proof generation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function generateWithdrawalProof(inputs) {
  try {
    const {
      amount,
      userAddress,
      balance,
      nonce
    } = inputs;

    // Validate required inputs
    if (!amount || !userAddress || balance === undefined || !nonce) {
      throw new Error('Missing required inputs for withdrawal proof');
    }

    // Initialize ZK proof generator
    if (!zkProofGenerator.initialized) {
      await zkProofGenerator.initialize();
    }

    // Generate withdrawal proof
    const result = await zkProofGenerator.generateWithdrawalProof({
      amount,
      userAddress,
      balance,
      nonce
    });

    return result;
  } catch (error) {
    console.error('Withdrawal proof generation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function generateINRTransferProof(inputs) {
  try {
    const {
      inrAmount,
      xlmAmount,
      exchangeRate,
      recipientAddress,
      senderBankAccount,
      transactionId,
      nonce,
      paymentSignature
    } = inputs;

    // Validate required inputs
    if (!inrAmount || !xlmAmount || !exchangeRate || !recipientAddress || 
        !senderBankAccount || !transactionId || !nonce || !paymentSignature) {
      throw new Error('Missing required inputs for INR transfer proof');
    }

    // Validate amounts are positive
    if (parseFloat(inrAmount) <= 0 || parseFloat(xlmAmount) <= 0) {
      throw new Error('INR and XLM amounts must be positive');
    }

    // Validate exchange rate
    if (parseFloat(exchangeRate) <= 0) {
      throw new Error('Exchange rate must be positive');
    }

    // Initialize ZK proof generator
    if (!zkProofGenerator.initialized) {
      await zkProofGenerator.initialize();
    }

    // Generate INR transfer proof
    const result = await zkProofGenerator.generateINRTransferProof({
      inrAmount,
      xlmAmount,
      exchangeRate,
      recipientAddress,
      senderBankAccount,
      transactionId,
      nonce,
      paymentSignature
    });

    return result;
  } catch (error) {
    console.error('INR transfer proof generation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function generateBatchProof(inputs) {
  try {
    const { attestations } = inputs;

    // Validate required inputs
    if (!attestations || !Array.isArray(attestations) || attestations.length === 0) {
      throw new Error('Missing or invalid attestations for batch proof');
    }

    if (attestations.length > 10) {
      throw new Error('Batch size cannot exceed 10 attestations');
    }

    // Initialize ZK proof generator
    if (!zkProofGenerator.initialized) {
      await zkProofGenerator.initialize();
    }

    // Generate batch proof
    const result = await zkProofGenerator.generateBatchProof(attestations);

    return result;
  } catch (error) {
    console.error('Batch proof generation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
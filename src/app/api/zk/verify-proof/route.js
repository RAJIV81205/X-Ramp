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
    
    const { proof, publicInputs, proofType } = await request.json();

    // Validate input
    if (!proof || !publicInputs || !proofType) {
      return NextResponse.json(
        { error: 'Proof, public inputs, and proof type are required' },
        { status: 400 }
      );
    }

    console.log(`Verifying ${proofType} proof for user ${userPayload.userId}`);

    // Initialize ZK proof generator if needed
    if (!zkProofGenerator.initialized) {
      await zkProofGenerator.initialize();
    }

    // Verify the proof
    const isValid = await zkProofGenerator.verifyProof(proof, publicInputs);

    // Additional validation based on proof type
    let additionalValidation = true;
    let validationDetails = {};

    switch (proofType) {
      case 'deposit':
        additionalValidation = validateDepositProof(publicInputs);
        validationDetails = getDepositValidationDetails(publicInputs);
        break;
      case 'withdrawal':
        additionalValidation = validateWithdrawalProof(publicInputs);
        validationDetails = getWithdrawalValidationDetails(publicInputs);
        break;
      case 'inr_transfer':
        additionalValidation = validateINRTransferProof(publicInputs);
        validationDetails = getINRTransferValidationDetails(publicInputs);
        break;
      case 'batch':
        additionalValidation = validateBatchProof(publicInputs);
        validationDetails = getBatchValidationDetails(publicInputs);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid proof type' },
          { status: 400 }
        );
    }

    const overallValid = isValid && additionalValidation;

    return NextResponse.json({
      success: true,
      valid: overallValid,
      proofValid: isValid,
      inputsValid: additionalValidation,
      proofType,
      validationDetails,
      verifiedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('ZK proof verification error:', error);
    return NextResponse.json(
      { error: 'Proof verification failed: ' + error.message },
      { status: 500 }
    );
  }
}

function validateDepositProof(publicInputs) {
  try {
    // Expected format: [amount, user_address_hash, anchor_pubkey_x, anchor_pubkey_y, current_time]
    if (!Array.isArray(publicInputs) || publicInputs.length !== 5) {
      console.error('Invalid deposit proof public inputs length');
      return false;
    }

    const [amount, userAddressHash, anchorPubkeyX, anchorPubkeyY, currentTime] = publicInputs;

    // Validate amount is positive
    if (BigInt(amount) <= 0) {
      console.error('Invalid amount in deposit proof');
      return false;
    }

    // Validate timestamp is reasonable (within 1 hour)
    const now = Math.floor(Date.now() / 1000);
    const timeDiff = Math.abs(now - parseInt(currentTime));
    if (timeDiff > 3600) {
      console.error('Timestamp too old or too far in future');
      return false;
    }

    // Validate field elements are within bounds
    const BN254_FIELD_SIZE = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617');
    
    for (const input of publicInputs) {
      if (BigInt(input) >= BN254_FIELD_SIZE) {
        console.error('Public input exceeds field size');
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Deposit proof validation error:', error);
    return false;
  }
}

function validateWithdrawalProof(publicInputs) {
  try {
    // Expected format: [amount, user_address_hash, current_time]
    if (!Array.isArray(publicInputs) || publicInputs.length !== 3) {
      console.error('Invalid withdrawal proof public inputs length');
      return false;
    }

    const [amount, userAddressHash, currentTime] = publicInputs;

    // Validate amount is positive
    if (BigInt(amount) <= 0) {
      console.error('Invalid amount in withdrawal proof');
      return false;
    }

    // Validate timestamp is reasonable (within 1 hour)
    const now = Math.floor(Date.now() / 1000);
    const timeDiff = Math.abs(now - parseInt(currentTime));
    if (timeDiff > 3600) {
      console.error('Timestamp too old or too far in future');
      return false;
    }

    // Validate field elements are within bounds
    const BN254_FIELD_SIZE = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617');
    
    for (const input of publicInputs) {
      if (BigInt(input) >= BN254_FIELD_SIZE) {
        console.error('Public input exceeds field size');
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Withdrawal proof validation error:', error);
    return false;
  }
}

function validateINRTransferProof(publicInputs) {
  try {
    // Expected format: [inr_amount, xlm_amount, exchange_rate, recipient_address_hash, current_time]
    if (!Array.isArray(publicInputs) || publicInputs.length !== 5) {
      console.error('Invalid INR transfer proof public inputs length');
      return false;
    }

    const [inrAmount, xlmAmount, exchangeRate, recipientAddressHash, currentTime] = publicInputs;

    // Validate amounts are positive
    if (BigInt(inrAmount) <= 0) {
      console.error('Invalid INR amount in transfer proof');
      return false;
    }

    if (BigInt(xlmAmount) <= 0) {
      console.error('Invalid XLM amount in transfer proof');
      return false;
    }

    if (BigInt(exchangeRate) <= 0) {
      console.error('Invalid exchange rate in transfer proof');
      return false;
    }

    // Validate timestamp is reasonable (within 1 hour)
    const now = Math.floor(Date.now() / 1000);
    const timeDiff = Math.abs(now - parseInt(currentTime));
    if (timeDiff > 3600) {
      console.error('Timestamp too old or too far in future');
      return false;
    }

    // Validate currency conversion (with some tolerance for precision)
    const expectedXlm = (parseFloat(inrAmount) * parseFloat(exchangeRate)) / 10000;
    const actualXlm = parseFloat(xlmAmount);
    const tolerance = 0.001; // 0.1% tolerance
    
    if (Math.abs(expectedXlm - actualXlm) > expectedXlm * tolerance) {
      console.error('Currency conversion validation failed');
      return false;
    }

    // Validate field elements are within bounds
    const BN254_FIELD_SIZE = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617');
    
    for (const input of publicInputs) {
      if (BigInt(input) >= BN254_FIELD_SIZE) {
        console.error('Public input exceeds field size');
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('INR transfer proof validation error:', error);
    return false;
  }
}

function validateBatchProof(publicInputs) {
  try {
    // Batch proof has variable length depending on number of attestations
    if (!Array.isArray(publicInputs) || publicInputs.length === 0) {
      console.error('Invalid batch proof public inputs');
      return false;
    }

    // Last element should be total amount
    const totalAmount = publicInputs[publicInputs.length - 1];
    if (BigInt(totalAmount) <= 0) {
      console.error('Invalid total amount in batch proof');
      return false;
    }

    // Validate field elements are within bounds
    const BN254_FIELD_SIZE = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617');
    
    for (const input of publicInputs) {
      if (BigInt(input) >= BN254_FIELD_SIZE) {
        console.error('Public input exceeds field size');
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Batch proof validation error:', error);
    return false;
  }
}

function getDepositValidationDetails(publicInputs) {
  const [amount, userAddressHash, anchorPubkeyX, anchorPubkeyY, currentTime] = publicInputs;
  
  return {
    amount: amount.toString(),
    userAddressHash: userAddressHash.toString(),
    anchorPublicKey: {
      x: anchorPubkeyX.toString(),
      y: anchorPubkeyY.toString()
    },
    timestamp: parseInt(currentTime),
    timestampDate: new Date(parseInt(currentTime) * 1000).toISOString()
  };
}

function getWithdrawalValidationDetails(publicInputs) {
  const [amount, userAddressHash, currentTime] = publicInputs;
  
  return {
    amount: amount.toString(),
    userAddressHash: userAddressHash.toString(),
    timestamp: parseInt(currentTime),
    timestampDate: new Date(parseInt(currentTime) * 1000).toISOString()
  };
}

function getINRTransferValidationDetails(publicInputs) {
  const [inrAmount, xlmAmount, exchangeRate, recipientAddressHash, currentTime] = publicInputs;
  
  return {
    inrAmount: inrAmount.toString(),
    xlmAmount: xlmAmount.toString(),
    exchangeRate: (parseFloat(exchangeRate) / 10000).toString(),
    recipientAddressHash: recipientAddressHash.toString(),
    timestamp: parseInt(currentTime),
    timestampDate: new Date(parseInt(currentTime) * 1000).toISOString(),
    conversionRate: `1 XLM = ₹${(parseFloat(exchangeRate) / 10000).toFixed(2)}`
  };
}

function getBatchValidationDetails(publicInputs) {
  const totalAmount = publicInputs[publicInputs.length - 1];
  
  return {
    totalAmount: totalAmount.toString(),
    inputCount: publicInputs.length,
    estimatedAttestations: Math.floor((publicInputs.length - 1) / 3) // Rough estimate
  };
}
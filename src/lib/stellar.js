import { 
  Horizon,
  Keypair, 
  TransactionBuilder, 
  Networks, 
  Operation,
  Asset,
  Account,
  Contract,
  SorobanRpc,
  Address,
  nativeToScVal,
  scValToNative,
  xdr
} from '@stellar/stellar-sdk';

// Stellar configuration
const STELLAR_NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet';
const HORIZON_URL = process.env.NEXT_PUBLIC_HORIZON_URL || 'https://horizon-testnet.stellar.org/';
const SOROBAN_URL = process.env.NEXT_PUBLIC_SOROBAN_URL || 'https://soroban-testnet.stellar.org/';
const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID;

// Initialize Stellar SDK
const server = new Horizon.Server(HORIZON_URL);
const sorobanServer = new SorobanRpc.Server(SOROBAN_URL);

// Network passphrase
const networkPassphrase = STELLAR_NETWORK === 'mainnet' 
  ? Networks.PUBLIC 
  : Networks.TESTNET;

/**
 * Create a new Stellar keypair
 */
export function createKeypair() {
  return Keypair.random();
}

/**
 * Create keypair from secret key
 */
export function createKeypairFromSecret(secretKey) {
  return Keypair.fromSecret(secretKey);
}

/**
 * Get account info from Stellar network
 */
export async function getAccountInfo(publicKey) {
  try {
    const account = await server.loadAccount(publicKey);
    return account;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Account not found. Make sure the account is funded.');
    }
    throw error;
  }
}

/**
 * Fund account on testnet (for development)
 */
export async function fundTestnetAccount(publicKey) {
  if (STELLAR_NETWORK !== 'testnet') {
    throw new Error('Account funding only available on testnet');
  }
  
  try {
    const response = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
    if (!response.ok) {
      throw new Error('Failed to fund account');
    }
    const result = await response.json();
    
    // Wait a bit for the account to be created
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return result;
  } catch (error) {
    throw new Error(`Failed to fund account: ${error.message}`);
  }
}

/**
 * Get account balance
 */
export async function getAccountBalance(publicKey) {
  try {
    const account = await getAccountInfo(publicKey);
    const balances = account.balances.map(balance => ({
      asset: balance.asset_type === 'native' ? 'XLM' : `${balance.asset_code}:${balance.asset_issuer}`,
      balance: balance.balance,
      asset_type: balance.asset_type,
      asset_code: balance.asset_code,
      asset_issuer: balance.asset_issuer
    }));
    return balances;
  } catch (error) {
    throw new Error(`Failed to get account balance: ${error.message}`);
  }
}

/**
 * Create and submit a transaction
 */
export async function submitTransaction(sourceKeypair, operations) {
  try {
    const sourceAccount = await getAccountInfo(sourceKeypair.publicKey());
    
    const transaction = new TransactionBuilder(sourceAccount, {
      fee: '100000', // 0.01 XLM
      networkPassphrase
    })
      .setTimeout(30)
      .addOperations(operations)
      .build();
    
    transaction.sign(sourceKeypair);
    
    const result = await server.submitTransaction(transaction);
    return result;
  } catch (error) {
    throw new Error(`Transaction failed: ${error.message}`);
  }
}

/**
 * Contract interaction utilities
 */
export class XRampContract {
  constructor(contractId = CONTRACT_ID) {
    if (!contractId) {
      throw new Error('Contract ID is required');
    }
    this.contractId = contractId;
    this.contract = new Contract(contractId);
  }

  /**
   * Get user balance from contract (simplified for demo)
   */
  async getUserBalance(userAddress) {
    try {
      // For demo purposes, return a mock balance
      // In production, this would query the actual contract
      console.log(`Getting balance for ${userAddress} - returning mock balance`);
      return 0; // Always return 0 for now to avoid XDR errors
    } catch (error) {
      console.error('Error getting user balance:', error);
      return 0;
    }
  }

  /**
   * Prepare deposit transaction with attestation (simplified for demo)
   */
  async prepareDepositWithAttestation(userKeypair, amount, attestation, signature) {
    try {
      // For demo purposes, simulate contract interaction without actual Soroban calls
      console.log(`Simulating deposit of ${amount} for ${userKeypair.publicKey()}`);
      
      // Check if user account exists and is funded
      let userAccount;
      try {
        userAccount = await getAccountInfo(userKeypair.publicKey());
      } catch (error) {
        if (error.message.includes('Account not found')) {
          throw new Error('Account not found. Please fund your wallet first with XLM to pay for transaction fees.');
        }
        throw error;
      }
      
      // Simulate successful contract preparation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return a mock prepared transaction
      return {
        mock: true,
        amount,
        userAddress: userKeypair.publicKey(),
        attestation,
        signature
      };
    } catch (error) {
      throw new Error(`Failed to prepare deposit transaction: ${error.message}`);
    }
  }

  /**
   * Submit deposit transaction (simplified for demo)
   */
  async submitDeposit(preparedTransaction, userKeypair) {
    try {
      // For demo purposes, simulate successful contract submission
      console.log(`Simulating deposit submission for ${userKeypair.publicKey()}`);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock transaction hash
      const mockHash = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        success: true,
        hash: mockHash,
        result: {
          status: 'SUCCESS',
          mock: true
        }
      };
    } catch (error) {
      throw new Error(`Failed to submit deposit: ${error.message}`);
    }
  }

  /**
   * Prepare withdrawal transaction (simplified for demo)
   */
  async prepareWithdrawal(userKeypair, amount, proof, publicInputs) {
    try {
      console.log(`Simulating withdrawal of ${amount} for ${userKeypair.publicKey()}`);
      
      // Check if user account exists and is funded
      let userAccount;
      try {
        userAccount = await getAccountInfo(userKeypair.publicKey());
      } catch (error) {
        if (error.message.includes('Account not found')) {
          throw new Error('Account not found. Please fund your wallet first with XLM to pay for transaction fees.');
        }
        throw error;
      }
      
      // Simulate successful contract preparation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return a mock prepared transaction
      return {
        mock: true,
        amount,
        userAddress: userKeypair.publicKey(),
        proof,
        publicInputs
      };
    } catch (error) {
      throw new Error(`Failed to prepare withdrawal transaction: ${error.message}`);
    }
  }

  /**
   * Submit withdrawal transaction (simplified for demo)
   */
  async submitWithdrawal(preparedTransaction, userKeypair) {
    try {
      console.log(`Simulating withdrawal submission for ${userKeypair.publicKey()}`);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock transaction hash
      const mockHash = `mock_withdrawal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        success: true,
        hash: mockHash,
        result: {
          status: 'SUCCESS',
          mock: true
        }
      };
    } catch (error) {
      throw new Error(`Failed to submit withdrawal: ${error.message}`);
    }
  }

  /**
   * Check if attestation has been used
   */
  async isAttestationUsed(transactionId) {
    try {
      // Use a funded account for simulation (we can use any funded account)
      // In production, this would be handled differently
      const dummyKeypair = Keypair.random();
      
      // Try to fund the dummy account for simulation
      try {
        await fundTestnetAccount(dummyKeypair.publicKey());
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for funding
      } catch (fundingError) {
        console.log('Could not fund dummy account for simulation, using contract ID');
        // Fallback: try to use the contract itself as the source account
      }

      let sourceAccount;
      try {
        sourceAccount = await server.loadAccount(dummyKeypair.publicKey());
      } catch {
        // If dummy account fails, create a minimal account object
        console.log('Using minimal account for attestation check');
        return false; // For now, assume attestation is not used
      }

      const operation = this.contract.call(
        'is_attestation_used',
        nativeToScVal(transactionId)
      );

      const transaction = new TransactionBuilder(sourceAccount, {
        fee: '100000',
        networkPassphrase
      })
        .setTimeout(30)
        .addOperation(operation)
        .build();

      const simulated = await sorobanServer.simulateTransaction(transaction);
      
      if (simulated.result?.retval) {
        return scValToNative(simulated.result.retval);
      }
      
      return false;
    } catch (error) {
      console.error('Error checking attestation usage:', error);
      return false;
    }
  }
}

/**
 * Utility functions
 */
export function formatBalance(balance, decimals = 7) {
  const num = parseFloat(balance);
  return (num / Math.pow(10, decimals)).toFixed(2);
}

export function parseAmount(amount, decimals = 7) {
  const num = parseFloat(amount);
  return Math.floor(num * Math.pow(10, decimals));
}

export function isValidStellarAddress(address) {
  try {
    Keypair.fromPublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Send XLM payment
 */
export async function sendPayment(sourceKeypair, destinationPublicKey, amount) {
  try {
    // Check if source account exists and has sufficient balance
    let sourceAccount;
    try {
      sourceAccount = await getAccountInfo(sourceKeypair.publicKey());
    } catch (error) {
      if (error.message.includes('Account not found')) {
        throw new Error('Sender account not found. Please fund your wallet first.');
      }
      throw error;
    }

    // Check XLM balance
    const balances = await getAccountBalance(sourceKeypair.publicKey());
    const xlmBalance = balances.find(b => b.asset_type === 'native');
    const availableBalance = xlmBalance ? parseFloat(xlmBalance.balance) : 0;
    const requiredAmount = parseFloat(amount) + 0.1; // Amount + fee buffer

    if (availableBalance < requiredAmount) {
      throw new Error(`Insufficient XLM balance. Available: ${availableBalance} XLM, Required: ${requiredAmount} XLM`);
    }

    // Check if destination account exists
    try {
      await getAccountInfo(destinationPublicKey);
    } catch (error) {
      if (error.message.includes('Account not found')) {
        throw new Error('Recipient account not found. They need to fund their wallet first.');
      }
    }
    
    const payment = Operation.payment({
      destination: destinationPublicKey,
      asset: Asset.native(),
      amount: amount.toString()
    });
    
    const transaction = new TransactionBuilder(sourceAccount, {
      fee: '100000', // 0.01 XLM
      networkPassphrase
    })
      .setTimeout(30)
      .addOperation(payment)
      .build();
    
    transaction.sign(sourceKeypair);
    
    const result = await server.submitTransaction(transaction);
    return result;
  } catch (error) {
    console.error('Payment error details:', error);
    throw new Error(`Payment failed: ${error.message}`);
  }
}

export { server, sorobanServer, networkPassphrase };
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Testing ZK proof generator...');
    
    // Try to import the ZK library
    let zkModule;
    try {
      zkModule = await import('../../../../lib/zk');
      console.log('ZK module imported successfully');
    } catch (importError) {
      console.error('Failed to import ZK module:', importError);
      return NextResponse.json({
        success: false,
        error: 'Failed to import ZK module',
        details: importError.message
      });
    }
    
    // Try to get the ZK proof generator
    const zkProofGenerator = zkModule.default || zkModule;
    if (!zkProofGenerator) {
      return NextResponse.json({
        success: false,
        error: 'ZK proof generator not found in module'
      });
    }
    
    console.log('ZK proof generator found');
    
    // Try to initialize
    try {
      await zkProofGenerator.initialize();
      console.log('ZK proof generator initialized');
    } catch (initError) {
      console.error('Failed to initialize ZK proof generator:', initError);
      return NextResponse.json({
        success: false,
        error: 'Failed to initialize ZK proof generator',
        details: initError.message
      });
    }
    
    // Try basic operations
    try {
      // Test Poseidon hash
      const hash = zkProofGenerator.poseidonHash([BigInt(123)]);
      console.log('Poseidon hash test successful:', hash.toString());
      
      // Test address conversion
      const fieldElement = zkProofGenerator.addressToFieldElement('GCLWGQPMKXQSPF776IU33AH4PZNOOWNAWGGKVTBQMIC5IMKUNP3E6NVU');
      console.log('Address conversion test successful:', fieldElement.toString());
      
      return NextResponse.json({
        success: true,
        message: 'ZK proof generator is working correctly',
        tests: {
          import: true,
          initialize: true,
          poseidonHash: hash.toString(),
          addressConversion: fieldElement.toString()
        }
      });
      
    } catch (operationError) {
      console.error('ZK operation failed:', operationError);
      return NextResponse.json({
        success: false,
        error: 'ZK operations failed',
        details: operationError.message
      });
    }
    
  } catch (error) {
    console.error('ZK test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'ZK test failed',
      details: error.message,
      stack: error.stack
    });
  }
}
import { NextResponse } from 'next/server';
import { hashPassword, generateIdentityCommitment, createKeylessWallet, createUserSession } from '../../../../lib/auth';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function POST(request) {
  try {
    await connectDB();
    
    const { action, email, password } = await request.json();
    
    if (action === 'register') {
      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return NextResponse.json({ error: 'User already exists' }, { status: 400 });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Generate identity commitment and keyless wallet
      const { commitment, nonce } = generateIdentityCommitment(email);
      const wallet = createKeylessWallet(commitment);

      // Create user
      const user = new User({
        email: email.toLowerCase(),
        password: hashedPassword,
        identityCommitment: commitment,
        identityNonce: nonce,
        publicKey: wallet.publicKey,
        encryptedSecretKey: wallet.secretKey,
        verified: true,
        walletFunded: false // User needs to fund manually
      });

      await user.save();

      console.log(`Test wallet created: ${wallet.publicKey}`);
      console.log('⚠️  Wallet not funded automatically - user needs to fund manually');

      // Create session
      const session = createUserSession(user, wallet);

      return NextResponse.json({
        success: true,
        message: 'User registered successfully',
        token: session.token,
        user: session.user,
        walletAddress: wallet.publicKey
      });
    }
    
    if (action === 'test-token') {
      const { token } = await request.json();
      
      const response = await fetch(`${request.nextUrl.origin}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      return NextResponse.json({
        success: response.ok,
        status: response.status,
        result
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Test auth error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    
    const userCount = await User.countDocuments();
    
    return NextResponse.json({
      success: true,
      message: 'Database connected',
      userCount,
      mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not set'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
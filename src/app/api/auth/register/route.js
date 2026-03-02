import { NextResponse } from 'next/server';
import { hashPassword, generateIdentityCommitment, createKeylessWallet, createUserSession } from '../../../../lib/auth';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function POST(request) {
  try {
    await connectDB();
    
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
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
      encryptedSecretKey: wallet.secretKey, // In production, this would be properly encrypted
      verified: true, // For demo purposes
      walletFunded: false // User needs to fund manually
    });

    await user.save();

    console.log(`Created wallet for ${email}: ${wallet.publicKey}`);
    console.log('⚠️  Wallet not funded automatically - user needs to fund manually');

    // Create session
    const session = createUserSession(user, wallet);

    return NextResponse.json({
      success: true,
      token: session.token,
      user: session.user,
      walletAddress: wallet.publicKey // Include full wallet address in response
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
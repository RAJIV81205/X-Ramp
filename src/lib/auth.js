import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { createKeypair } from './stellar';
import { createHash, randomBytes } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate JWT token
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Generate identity commitment using deterministic hash
 * In production, this would use actual Poseidon hash
 */
export function generateIdentityCommitment(email, nonce = null) {
  // For hackathon demo, we'll use SHA-256 as a placeholder for Poseidon
  // In production, this would be replaced with actual Poseidon hash
  const nonceValue = nonce || randomBytes(16).toString('hex');
  const input = `${email}:${nonceValue}`;
  
  const hash = createHash('sha256').update(input).digest('hex');
  
  // Return first 32 bytes as commitment
  return {
    commitment: hash.substring(0, 64), // 32 bytes in hex
    nonce: nonceValue
  };
}

/**
 * Create keyless wallet from identity commitment
 */
export function createKeylessWallet(identityCommitment) {
  // Create deterministic seed from commitment
  const seed = createHash('sha256').update(identityCommitment).digest();
  
  // Generate keypair deterministically from seed
  // In production, you'd use proper key derivation (BIP32/BIP44)
  const keypair = createKeypair();
  
  return {
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret(),
    commitment: identityCommitment
  };
}

/**
 * Recover wallet from stored user data
 */
export function recoverWallet(user) {
  // Return the stored wallet data from the database
  return {
    publicKey: user.publicKey,
    secretKey: user.encryptedSecretKey, // In production, this would be decrypted
    commitment: user.identityCommitment
  };
}



/**
 * Validate email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate secure session token
 */
export function generateSessionToken() {
  return createHash('sha256')
    .update(Date.now().toString() + Math.random().toString())
    .digest('hex');
}

/**
 * Create user session data
 */
export function createUserSession(user, wallet) {
  const sessionData = {
    userId: user._id.toString(),
    email: user.email,
    publicKey: wallet.publicKey,
    commitment: wallet.commitment,
    createdAt: new Date().toISOString()
  };
  
  const token = generateToken(sessionData);
  
  return {
    token,
    user: {
      id: user._id.toString(),
      email: user.email,
      publicKey: wallet.publicKey,
      commitment: wallet.commitment
    }
  };
}

/**
 * Middleware to verify authentication for App Router
 */
export function requireAuth(handler) {
  return async (request) => {
    try {
      const authHeader = request.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '');
      
      if (!token) {
        return NextResponse.json({ error: 'No token provided' }, { status: 401 });
      }
      
      const decoded = verifyToken(token);
      
      // Create a new request object with user data
      const requestWithUser = new Request(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body
      });
      requestWithUser.user = decoded;
      
      return handler(requestWithUser);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  };
}

/**
 * Extract user from request
 */
export function getUserFromRequest(req) {
  // Handle Next.js App Router request object
  let token = null;
  
  if (req.headers) {
    // Standard headers object
    const authHeader = req.headers.authorization || req.headers.get?.('authorization');
    token = authHeader?.replace('Bearer ', '');
  }
  
  if (!token) {
    return null;
  }
  
  try {
    return verifyToken(token);
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}
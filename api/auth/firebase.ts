import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getDb } from '../db/client.js';

// Verify Firebase ID Token using Google's public certificates (pure JWT verification)
async function verifyFirebaseIdToken(idToken: string, projectId: string): Promise<any> {
  // 1. Fetch public keys from Google
  const response = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken-system@system.gserviceaccount.com');
  if (!response.ok) {
    throw new Error('Failed to fetch public certificates from Google.');
  }
  const publicKeys: Record<string, string> = await response.json();

  // 2. Decode header to find key ID (kid)
  const decoded: any = jwt.decode(idToken, { complete: true });
  if (!decoded || !decoded.header || !decoded.header.kid) {
    throw new Error('Invalid token structure.');
  }

  const kid = decoded.header.kid;
  const publicKey = publicKeys[kid];
  if (!publicKey) {
    throw new Error('Public key not found for token signature verification.');
  }

  // 3. Verify JWT signature and claims (issuer, audience)
  return new Promise((resolve, reject) => {
    jwt.verify(
      idToken,
      publicKey,
      {
        algorithms: ['RS256'],
        audience: projectId,
        issuer: `https://securetoken.google.com/${projectId}`
      },
      (err, decodedPayload) => {
        if (err) return reject(err);
        resolve(decodedPayload);
      }
    );
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ success: false, message: 'Firebase ID Token is required.' });
  }

  // Use the Firebase Project ID from the environment variables
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;

  if (!projectId) {
    return res.status(500).json({
      success: false,
      message: 'Server configuration error: VITE_FIREBASE_PROJECT_ID is not configured in environment variables.'
    });
  }

  try {
    // 1. Verify the ID token manually using standard JWT checks
    const decodedToken = await verifyFirebaseIdToken(idToken, projectId);
    
    const email = decodedToken.email;
    const firebaseUid = decodedToken.sub; // Firebase UID is stored in the 'sub' (subject) claim
    const emailVerified = decodedToken.email_verified;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google account does not provide an email address.' });
    }

    if (!emailVerified) {
      return res.status(400).json({ success: false, message: 'Google email address is not verified.' });
    }

    const db = getDb();
    let user: any = null;

    // 2. Check if user already exists by firebase_uid
    const userByUid = await db.execute('SELECT * FROM users WHERE firebase_uid = ?', [firebaseUid]);
    const uidRows = Array.isArray(userByUid) ? userByUid : (userByUid as any).rows || [];

    if (uidRows.length > 0) {
      user = uidRows[0];
    } else {
      // 3. Check if user exists by email (could be a legacy email/password user signing in via Google)
      const userByEmail = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
      const emailRows = Array.isArray(userByEmail) ? userByEmail : (userByEmail as any).rows || [];

      if (emailRows.length > 0) {
        // Link the Google account to the existing email record
        const existingUser = emailRows[0];
        await db.execute(
          'UPDATE users SET firebase_uid = ?, auth_provider = ? WHERE id = ?',
          [firebaseUid, 'google', existingUser.id]
        );
        user = { ...existingUser, firebase_uid: firebaseUid, auth_provider: 'google' };
      } else {
        // 4. Create a new user record
        const newId = crypto.randomUUID();
        await db.execute(
          "INSERT INTO users (id, email, password_hash, firebase_uid, auth_provider) VALUES (?, ?, NULL, ?, 'google')",
          [newId, email, firebaseUid]
        );
        user = {
          id: newId,
          email,
          firebase_uid: firebaseUid,
          auth_provider: 'google'
        };
      }
    }

    // 5. Generate local JWT session token
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secure-jwt-secret-string-12345';
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error: any) {
    console.error('Firebase Auth Verification error:', error);
    return res.status(401).json({ success: false, message: `Google Auth Error: ${error.message}` });
  }
}

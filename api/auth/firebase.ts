import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { getDb } from '../db/client.js';

// Initialize Firebase Admin SDK
let isInitialized = false;

// Normalize the private key to standard PEM format (removes all double newlines or copy-paste spaces)
function normalizePrivateKey(key: string): string {
  const header = '-----BEGIN PRIVATE KEY-----';
  const footer = '-----END PRIVATE KEY-----';
  
  const body = key
    .replace(header, '')
    .replace(footer, '')
    .replace(/\\n/g, '')  // Remove escaped newlines
    .replace(/\s+/g, '');  // Remove all physical spaces/newlines

  return `${header}\n${body}\n${footer}\n`;
}

function initFirebaseAdmin() {
  if (isInitialized || getApps().length > 0) {
    isInitialized = true;
    return;
  }

  try {
    let serviceAccount: any;

    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      let rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON.trim();

      // Fix any physical newlines inside the JSON string before parsing
      rawJson = rawJson.replace(/"private_key":\s*"([^"]+)"/gs, (match, p1) => {
        const cleaned = p1.replace(/\r?\n/g, '\\n');
        return `"private_key": "${cleaned}"`;
      });

      serviceAccount = JSON.parse(rawJson);
    } else {
      // Fallback for local development
      const localPath = path.join(process.cwd(), 'firebase-service-account.json');
      if (fs.existsSync(localPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(localPath, 'utf8'));
      } else {
        throw new Error('Firebase service account credentials not found in env or local file.');
      }
    }

    // Always clean the private key string before passing it to cert()
    if (serviceAccount && serviceAccount.private_key) {
      serviceAccount.private_key = normalizePrivateKey(serviceAccount.private_key);
    }

    initializeApp({
      credential: cert(serviceAccount),
    });
    isInitialized = true;
  } catch (error: any) {
    console.error('Firebase Admin initialization error:', error.message);
    throw error; // Re-throw so the server log captures the crash details
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ success: false, message: 'Firebase ID Token is required.' });
  }

  try {
    // Ensure Firebase Admin is initialized
    initFirebaseAdmin();

    const auth = getAuth();

    // 1. Verify the ID token using Firebase Admin Auth SDK
    const decodedToken = await auth.verifyIdToken(idToken);
    const email = decodedToken.email;
    const firebaseUid = decodedToken.uid;
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
    return res.status(500).json({ success: false, message: 'A server error occurred during verification.', error: error.message });
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

function normalizePrivateKey(key: string): string {
  const header = '-----BEGIN PRIVATE KEY-----';
  const footer = '-----END PRIVATE KEY-----';
  
  const body = key
    .replace(header, '')
    .replace(footer, '')
    .replace(/\\n/g, '')
    .replace(/\s+/g, '');

  return `${header}\n${body}\n${footer}\n`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const diagnostics: any = {
    firebaseServiceAccountJsonLength: 0,
    firebaseServiceAccountJsonExists: false,
    parsedSuccessfully: false,
    error: null,
    appsLength: 0,
    initialized: false,
    authCreated: false
  };

  try {
    diagnostics.appsLength = getApps().length;

    const rawEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (rawEnv) {
      diagnostics.firebaseServiceAccountJsonExists = true;
      diagnostics.firebaseServiceAccountJsonLength = rawEnv.length;

      let rawJson = rawEnv.trim();
      rawJson = rawJson.replace(/"private_key":\s*"([^"]+)"/gs, (match, p1) => {
        const cleaned = p1.replace(/\r?\n/g, '\\n');
        return `"private_key": "${cleaned}"`;
      });

      const serviceAccount = JSON.parse(rawJson);
      diagnostics.parsedSuccessfully = true;
      diagnostics.projectId = serviceAccount.project_id;
      diagnostics.clientEmail = serviceAccount.client_email;
      
      if (serviceAccount.private_key) {
        diagnostics.privateKeyNormalizable = true;
        const normalized = normalizePrivateKey(serviceAccount.private_key);
        diagnostics.privateKeyLength = normalized.length;

        if (getApps().length === 0) {
          initializeApp({
            credential: cert({
              ...serviceAccount,
              private_key: normalized
            })
          });
        }
        diagnostics.initialized = true;
        
        const auth = getAuth();
        diagnostics.authCreated = !!auth;
      }
    } else {
      diagnostics.error = "FIREBASE_SERVICE_ACCOUNT_JSON env variable is missing or empty.";
    }
  } catch (err: any) {
    diagnostics.error = err.message;
    diagnostics.stack = err.stack;
  }

  return res.status(200).json(diagnostics);
}

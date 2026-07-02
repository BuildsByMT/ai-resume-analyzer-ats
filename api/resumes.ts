import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { getDb } from './db/client.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET || 'fallback-secure-jwt-secret-string-12345';
  let userId: string;

  try {
    const decoded = jwt.verify(token, jwtSecret) as { userId: string };
    userId = decoded.userId;
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid session token. Please login again.' });
  }

  const db = getDb();

  try {
    if (req.method === 'GET') {
      // Fetch resumes and analyses history
      const resumesRes = await db.execute('SELECT id, resume_name, updated_at FROM resumes WHERE user_id = ? ORDER BY updated_at DESC', [userId]);
      const analysesRes = await db.execute('SELECT id, job_title, overall_score, created_at FROM analyses WHERE user_id = ? ORDER BY created_at DESC', [userId]);

      const resumes = Array.isArray(resumesRes) ? resumesRes : (resumesRes as any).rows || [];
      const analyses = Array.isArray(analysesRes) ? analysesRes : (analysesRes as any).rows || [];

      return res.status(200).json({ success: true, resumes, analyses });
    }

    if (req.method === 'POST') {
      const { action, id } = req.body;

      if (action === 'delete') {
        if (!id) {
          return res.status(400).json({ success: false, message: 'ID is required to delete.' });
        }
        await db.execute('DELETE FROM resumes WHERE id = ? AND user_id = ?', [id, userId]);
        await db.execute('DELETE FROM analyses WHERE id = ? AND user_id = ?', [id, userId]);
        return res.status(200).json({ success: true, message: 'Item deleted successfully.' });
      }

      // Save a new generated resume
      const { resumeName, parsedJson, pdfBase64 } = req.body;
      const crypto = await import('crypto');
      const resumeId = crypto.randomUUID();

      await db.execute(
        'INSERT INTO resumes (id, user_id, resume_name, parsed_json, pdf_base64) VALUES (?, ?, ?, ?, ?)',
        [resumeId, userId, resumeName || 'Untitled Resume', JSON.stringify(parsedJson), pdfBase64]
      );

      return res.status(201).json({ success: true, message: 'Resume saved successfully.', id: resumeId });
    }

    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  } catch (error: any) {
    console.error('History API error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

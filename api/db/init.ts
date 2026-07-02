import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from './client.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const db = getDb();
    
    // Create Users Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Resumes Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS resumes (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36),
        resume_name VARCHAR(100),
        parsed_json LONGTEXT,
        pdf_base64 LONGTEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create Analyses Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS analyses (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36),
        job_title VARCHAR(255),
        job_description TEXT,
        overall_score INT NOT NULL,
        score_breakdown JSON NOT NULL,
        suggestions JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    return res.status(200).json({ success: true, message: 'Database tables initialized successfully in TiDB Cloud.' });
  } catch (error: any) {
    console.error('Database initialization error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

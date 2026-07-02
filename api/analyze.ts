import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import jwt from 'jsonwebtoken';
import { getDb } from './db/client';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { pdfBase64, jobTitle, jobDescription, userApiKey } = req.body;

  if (!pdfBase64) {
    return res.status(400).json({ success: false, message: 'PDF file is required.' });
  }

  // Extract raw base64 by stripping the data URI scheme if present
  let base64Data = pdfBase64;
  if (pdfBase64.includes(';base64,')) {
    base64Data = pdfBase64.split(';base64,')[1];
  }

  // Determine Gemini API Key
  const apiKey = userApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(400).json({ 
      success: false, 
      message: 'Gemini API Key is missing. Please provide your API key in settings or verify server configuration.' 
    });
  }

  try {
    // 1. Initialize Gemini API Client
    const ai = new GoogleGenAI({ apiKey });

    // 2. Prepare analysis prompts
    const jdText = jobDescription 
      ? `Target Job Description: ${jobDescription}` 
      : `No target job description was provided. Perform a general, high-quality resume compatibility check. Focus on standard software/industry layout compliance, action verb strength, keyword balance, formatting issues, and general structural improvements.`;

    const promptText = `
      You are an expert technical recruiter and Applicant Tracking System (ATS) evaluator.
      Analyze the provided resume (PDF document) against the target Job Description (JD).
      Evaluate the match with 100% precision.

      Target Job Title: ${jobTitle || 'General Application'}
      ${jdText}

      Provide your output strictly in JSON format matching this schema:
      {
        "overallScore": 85,
        "breakdown": {
          "keywordScore": 80,
          "experienceScore": 90,
          "formattingScore": 85
        },
        "keywords": {
          "matched": ["React", "Tailwind CSS"],
          "missing": ["TypeScript", "Next.js"]
        },
        "formattingIssues": [
          "Detected multi-column layout. Suggest moving to a clean single-column format."
        ],
        "rewritingSuggestions": [
          {
            "original": "Built some UI pages using React.",
            "suggested": "Engineered 15+ responsive React components, improving load times by 20%.",
            "reason": "Quantify your impact using metrics."
          }
        ]
      }
    `;

    // 3. Call Gemini API to parse and analyze PDF
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: promptText },
            {
              inlineData: {
                data: base64Data,
                mimeType: 'application/pdf',
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawResponseText = response.text || '{}';
    const analysisJson = JSON.parse(rawResponseText);

    // 4. Save to Database if user is logged in
    let userId: string | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const jwtSecret = process.env.JWT_SECRET || 'fallback-secure-jwt-secret-string-12345';
      try {
        const decoded = jwt.verify(token, jwtSecret) as { userId: string };
        userId = decoded.userId;
      } catch (err) {
        console.warn('JWT verification failed during resume analysis logging.');
      }
    }

    if (userId) {
      try {
        const db = getDb();
        const crypto = await import('crypto');
        const id = crypto.randomUUID();

        // Save analysis record
        await db.execute(
          'INSERT INTO analyses (id, user_id, job_title, job_description, overall_score, score_breakdown, suggestions) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            id,
            userId,
            jobTitle || 'General',
            jobDescription || '',
            analysisJson.overallScore || 0,
            JSON.stringify(analysisJson.breakdown || {}),
            JSON.stringify(analysisJson.rewritingSuggestions || []),
          ]
        );

        // Also save/update the parsed JSON in resumes history
        const resumeId = crypto.randomUUID();
        await db.execute(
          'INSERT INTO resumes (id, user_id, resume_name, parsed_json, pdf_base64) VALUES (?, ?, ?, ?, ?)',
          [
            resumeId,
            userId,
            `Analysis - ${jobTitle || 'General'}`,
            JSON.stringify(analysisJson),
            pdfBase64 // Store base64 so user can redownload or review it
          ]
        );
      } catch (dbError) {
        console.error('Failed to log analysis to database:', dbError);
        // Do not crash the API, return results to user even if DB log fails
      }
    }

    return res.status(200).json({ success: true, data: analysisJson });
  } catch (error: any) {
    console.error('Resume analysis error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

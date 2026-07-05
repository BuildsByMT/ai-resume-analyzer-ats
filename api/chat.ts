import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import jwt from 'jsonwebtoken';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET || 'fallback-secure-jwt-secret-string-12345';
  
  try {
    jwt.verify(token, jwtSecret);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid session token. Please login again.' });
  }

  const { messages, userApiKey } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ success: false, message: 'Messages history is required.' });
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
    const ai = new GoogleGenAI({ apiKey });

    // Format chat history to match the Gemini SDK schema
    // Map our frontend message structure to { role: 'user' | 'model', parts: [{ text: string }] }
    const contents = messages.map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const systemInstruction = `
You are the "Resume Optimizer AI Assistant", a specialized helpful chatbot built directly into the Resume Analyzer website.
Your objective is to help the user optimize their resume, choose the best templates, understand the structural difference between a CV and a resume, understand the impact of having a one-page vs. two-page resume, and answer ATS-specific requirements.

Strict limitations on topic scope:
1. You MUST ONLY answer questions that relate to resume writing, resume optimization, ATS optimization, resume design templates, page length, and differences between CV and resume.
2. If the user asks about unrelated topics (such as writing general code, recipes, weather, travel, politics, sports, general science, math, or personal advice unrelated to careers), you MUST politely decline to answer.
   Example refusal: "I'm sorry, but I am specifically designed to help with resume optimization, templates, CV comparison, and ATS formatting. I cannot answer other general questions. Let me know if you'd like tips on how to improve your resume!"
3. If they ask about related topics like careers, jobs, cover letters, or interview preparation, you can give brief answers but redirect them to how it relates to updating or optimizing their resume.
4. Keep answers relatively concise and structured. Use bullet points and bold formatting where appropriate.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents,
      config: {
        systemInstruction,
      }
    });

    const reply = response.text || "I didn't receive a response from the model. Please try again.";
    return res.status(200).json({ success: true, reply });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return res.status(500).json({ success: false, error: error.message || 'An error occurred during chat generation.' });
  }
}

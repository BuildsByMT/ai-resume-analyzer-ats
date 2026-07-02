import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { pdfBase64, userApiKey } = req.body;

  if (!pdfBase64) {
    return res.status(400).json({ success: false, message: 'PDF file is required.' });
  }

  let base64Data = pdfBase64;
  if (pdfBase64.includes(';base64,')) {
    base64Data = pdfBase64.split(';base64,')[1];
  }

  const apiKey = userApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(400).json({ 
      success: false, 
      message: 'Gemini API Key is missing. Please provide your API key in settings or verify server configuration.' 
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const promptText = `
      You are an expert resume parsing assistant.
      Extract all relevant data from the provided resume PDF and format it strictly as JSON.
      Return empty fields or arrays if the information is not present in the resume.
      Do not invent or add details that are not in the resume.

      Output must be strictly JSON format matching this exact schema:
      {
        "contact": {
          "name": "Full Name",
          "email": "email@example.com",
          "phone": "(123) 456-7890",
          "website": "linkedin.com/in/username",
          "location": "City, State"
        },
        "experience": [
          {
            "company": "Company Name",
            "role": "Job Title",
            "duration": "Start Date - End Date",
            "details": "Bullet points detailing achievements and responsibilities (one per line, separated by newline characters)"
          }
        ],
        "education": [
          {
            "school": "University/School Name",
            "degree": "Degree and Major (e.g. B.S. in Computer Science)",
            "duration": "Graduation Date or Date Range"
          }
        ],
        "projects": [
          {
            "title": "Project Name",
            "tech": "Technologies used (comma-separated, e.g. React, Tailwind CSS)",
            "details": "Description of the project and achievements (one per line, separated by newline characters)"
          }
        ],
        "skills": {
          "languages": "Languages, core competencies, or specializations (comma-separated, e.g. JavaScript, Python, Recruiting, Sourcing)",
          "frameworks": "Frameworks, methodologies, policies, or libraries (comma-separated, e.g. React, Onboarding, Benefits Administration)",
          "tools": "Tools, software, platforms, or systems (comma-separated, e.g. Git, Docker, Workday, BambooHR)"
        }
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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
    const parsedJson = JSON.parse(rawResponseText);

    return res.status(200).json({ success: true, data: parsedJson });
  } catch (error: any) {
    console.error('Resume parsing error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

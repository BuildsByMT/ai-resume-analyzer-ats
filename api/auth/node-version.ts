import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({
    nodeVersion: process.version,
    env: process.env.NODE_ENV,
    cwd: process.cwd()
  });
}

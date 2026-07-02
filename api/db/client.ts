import { connect } from '@tidbcloud/serverless';

export const getDb = () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is missing. Please configure it in your Vercel settings.');
  }
  return connect({ url: databaseUrl });
};

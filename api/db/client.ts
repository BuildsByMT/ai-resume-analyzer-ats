import { connect } from '@tidbcloud/serverless';

export const getDb = () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is missing. Please configure it in your Vercel settings.');
  }

  // Dynamically correct the database URL if it points to the restricted system 'sys' database
  let finalUrl = databaseUrl;
  if (databaseUrl.includes('/sys?') || databaseUrl.endsWith('/sys')) {
    finalUrl = databaseUrl.replace(/\/sys(\?|$)/, '/test$1');
  }

  return connect({ url: finalUrl });
};

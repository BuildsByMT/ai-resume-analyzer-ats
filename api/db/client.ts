import { connect } from '@tidbcloud/serverless';

export const getDb = () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is missing. Please configure it in your Vercel settings.');
  }

  // Dynamically override the database name to always connect to 'test' where the tables exist
  let finalUrl = databaseUrl;
  const protocolEnd = databaseUrl.indexOf('//');
  if (protocolEnd !== -1) {
    const slashIdx = databaseUrl.indexOf('/', protocolEnd + 2);
    if (slashIdx !== -1) {
      const queryIdx = databaseUrl.indexOf('?', slashIdx);
      if (queryIdx === -1) {
        finalUrl = databaseUrl.substring(0, slashIdx + 1) + 'test';
      } else {
        finalUrl = databaseUrl.substring(0, slashIdx + 1) + 'test' + databaseUrl.substring(queryIdx);
      }
    }
  }

  return connect({ url: finalUrl });
};

import * as dotenv from 'dotenv';

dotenv.config();

export const env = {
  webBaseUrl: process.env.WEB_BASE_URL || 'https://candidates-qa.contalink.com/',
  webAccessCode: process.env.WEB_ACCESS_CODE || ''
};

export const requireEnv = (key: keyof typeof env): string => {
  const value = env[key];
  if (!value) {
    throw new Error(`Missing required environment variable for ${key}. Check .env configuration.`);
  }
  return value;
};

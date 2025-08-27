import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env robustly regardless of CWD or build output location
(() => {
  const candidatePaths = [
    // When running TS directly from backend/src
    path.resolve(__dirname, '../.env'),
    // When running compiled JS from backend/dist
    path.resolve(__dirname, '../../.env'),
    // Fallback to current working directory
    path.resolve(process.cwd(), '.env'),
  ];
  for (const candidate of candidatePaths) {
    try {
      if (fs.existsSync(candidate)) {
        dotenv.config({ path: candidate });
        break;
      }
    } catch {
      // ignore and try next path
    }
  }
})();

type Env = {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  CLIENT_URL: string;
  MONGODB_URI: string;
  JWT_SECRET: string;
  OPENAI_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
};

function requireString(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

const config: Env = {
  NODE_ENV: (process.env.NODE_ENV as Env['NODE_ENV']) || 'development',
  PORT: Number(process.env.PORT || 5000),
  CLIENT_URL: requireString('CLIENT_URL', 'https://www.cliento.icu'),
  MONGODB_URI: requireString('MONGODB_URI'),
  JWT_SECRET: requireString('JWT_SECRET'),
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
};

console.log("OpenRouter API Key:", process.env.OPENROUTER_API_KEY?.slice(0, 10) + '...');
console.log("Environment loaded successfully!");

export default config;



import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModel } from 'ai';

export const grok = createOpenAI({
  baseURL: 'https://api.x.ai/v1',      // This routes everything to Grok/xAI
  apiKey: process.env.GROK_API_KEY,    // The env var you already set in Vercel
});

export const grokModel: LanguageModel = grok('grok-4-fast');  // Cheap & fast model for testing
// Or use: grok('grok-4-1-fast-reasoning') if you want slightly better reasoning
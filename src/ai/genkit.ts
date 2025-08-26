'use server';

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {initializeApp, getApps} from 'firebase-admin/app';

// This AI configuration now uses the GEMINI_API_KEY from your .env file for all generative AI operations.
export const ai = genkit({
  plugins: [
    googleAI({
        apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
});

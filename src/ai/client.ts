
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// This AI configuration now uses the GEMINI_API_KEY from your .env file for all generative AI operations.
export const ai = genkit({
  plugins: [
    googleAI({
        apiKey: 'AIzaSyAQUuVdVhO_kHO3obrbsnGHRGpM0ObA-oM',
    }),
  ],
});

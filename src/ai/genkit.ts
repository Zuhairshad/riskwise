import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// This AI configuration will now use your specified key for all generative AI operations.
// It is recommended to move this key to a secure environment variable in a production setup.
export const ai = genkit({
  plugins: [googleAI({apiKey: "AIzaSyAOIP62VuRDI2REB4CTZy93iX45dgslTto"})],
});

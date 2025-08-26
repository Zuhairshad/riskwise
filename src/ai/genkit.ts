import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// This AI configuration will now use your specified key for all generative AI operations.
// It is recommended to move this key to a secure environment variable in a production setup.
export const ai = genkit({
  plugins: [googleAI({apiKey: "AIzaSyDbMHlhpz7I2I-d8E4lquvUbwz9-F6ecMg"})],
});

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Read the API key from environment variables
// process.env.YOUR_API_KEY_NAME (e.g., process.env.GEMINI_API_KEY)
// The .env file should be automatically loaded by Next.js or by the `dotenv` config in dev.ts
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

// It's a good practice to ensure the API key is present,
// but Genkit will also throw an error if it's missing and required.
// if (!apiKey) {
//   console.warn("API key for Google AI is not set. Please set GEMINI_API_KEY or GOOGLE_API_KEY in your .env file.");
// }

export const ai = genkit({
  plugins: [
    googleAI({apiKey: apiKey}) // Pass the apiKey here
  ],
  model: 'googleai/gemini-2.0-flash',
});

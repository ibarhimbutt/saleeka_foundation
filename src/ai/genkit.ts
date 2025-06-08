import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {openAI} from 'genkitx-openai'; // Import OpenAI plugin

const googleApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

const plugins = [];

if (googleApiKey) {
  plugins.push(googleAI({apiKey: googleApiKey}));
} else {
  console.warn("Google AI API key is not set. Google AI features will be unavailable.");
}

if (openaiApiKey) {
  plugins.push(openAI({apiKey: openaiApiKey}));
} else {
  console.warn("OpenAI API key is not set. OpenAI features (like DALL-E fallback) will be unavailable.");
}

export const ai = genkit({
  plugins: plugins,
  model: 'googleai/gemini-2.0-flash', // Default text model
});



import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {openAI} from 'genkitx-openai';

const googleApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

const configuredPlugins:any[] = [];

if (googleApiKey) {
  try {
    configuredPlugins.push(googleAI({apiKey: googleApiKey}));
    console.log('Genkit.ts: Google AI plugin configured.');
  } catch (e: any) {
    console.error('Genkit.ts: Error configuring Google AI plugin:', e.message || String(e));
  }
} else {
  console.warn(
    'Genkit.ts: Google AI API key (GEMINI_API_KEY or GOOGLE_API_KEY) is not set. Google AI features will be unavailable.'
  );
}

if (openaiApiKey) {
   try {
    configuredPlugins.push(openAI({apiKey: openaiApiKey}));
    console.log('Genkit.ts: OpenAI plugin configured.');
  } catch (e: any) {
    console.error('Genkit.ts: Error configuring OpenAI plugin:', e.message || String(e));
  }
} else {
  console.warn(
    'CRITICAL Genkit.ts: OpenAI API key (OPENAI_API_KEY) is not set in the environment. OpenAI features (like DALL-E image generation) will be unavailable. Ensure it is set in your .env file and the server has been restarted.'
  );
}

let defaultTextModelChoice: string | undefined = undefined;

const isGoogleActive = configuredPlugins.some(p => p && p.name && p.name.toLowerCase().includes('google'));
const isOpenAIActive = configuredPlugins.some(p => p && p.name && p.name.toLowerCase().includes('openai'));

if (isOpenAIActive) {
    defaultTextModelChoice = 'openai/gpt-3.5-turbo'; // Default for text if OpenAI is primary
    console.log(`Genkit.ts: OpenAI plugin active. Default text model set to: ${defaultTextModelChoice}`);
} else if (isGoogleActive) {
    defaultTextModelChoice = 'googleai/gemini-1.5-flash-latest';
    console.log(`Genkit.ts: Google AI plugin active (OpenAI not). Default text model set to: ${defaultTextModelChoice}`);
} else {
    console.log('Genkit.ts: No primary AI text model could be set as no plugins seem active or recognized by name.');
}

console.log(`Genkit.ts: Initializing Genkit with ${configuredPlugins.length} plugin(s).`);

export const ai = genkit({
  plugins: configuredPlugins,
  model: defaultTextModelChoice, // Sets the default model for ai.generate if not overridden in the call
});

if (configuredPlugins.length > 0) {
    let modelNames = "unknown";
    try {
        const models = ai.listModels ? ai.listModels() : []; // Check if listModels exists
        modelNames = models.map(m => m.name).join(', ') || 'none listed by Genkit';
        console.log(`Genkit.ts: Genkit initialized. Available models from configured plugins: ${modelNames}. Default text model (if not overridden): ${defaultTextModelChoice || 'Not set'}`);
    } catch(e: any) {
        console.warn("Genkit.ts: Could not list models from Genkit after initialization:", e.message || String(e));
    }
} else {
    console.log("Genkit.ts: Genkit initialized with no active plugins. AI operations will likely fail.");
}

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {openAI} from 'genkitx-openai';

const openaiApiKey = process.env.OPENAI_API_KEY;
const googleApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

let aiInstance: any;
let defaultTextModelChoice: string | undefined;
let activePluginsInfo: string[] = [];
let successfullyInitializedPlugin: string | null = null;

console.log("Genkit.ts: Starting AI plugin configuration...");
console.log(`Genkit.ts: OpenAI API Key Present: ${openaiApiKey ? 'Yes' : 'No'}`);
console.log(`Genkit.ts: Google API Key Present: ${googleApiKey ? 'Yes' : 'No'}`);

// Prioritize OpenAI since you mentioned you have the API key
if (openaiApiKey) {
  try {
    const openaiPlugin = openAI({ 
      apiKey: openaiApiKey,
      baseUrl: 'https://api.openai.com/v1'
    });
    
    aiInstance = genkit({ 
      plugins: [openaiPlugin],
      model: 'openai/gpt-3.5-turbo' // Set default model
    });
    
    defaultTextModelChoice = 'openai/gpt-3.5-turbo';
    successfullyInitializedPlugin = 'OpenAI';
    activePluginsInfo.push(`OpenAI plugin configured as primary. Default text model set to: ${defaultTextModelChoice}.`);
    
    console.log(`Genkit.ts: OpenAI plugin successfully initialized with model: ${defaultTextModelChoice}`);
  } catch (e: any) {
    console.error('Genkit.ts: CRITICAL Error configuring OpenAI plugin:', e.message || String(e));
    activePluginsInfo.push(`OpenAI plugin FAILED to configure. Error: ${e.message || String(e)}`);
  }
}

// Fallback to Google AI if OpenAI fails and Google key is available
if (!successfullyInitializedPlugin && googleApiKey) {
  activePluginsInfo.push('OpenAI not configured or failed. Attempting Google AI plugin configuration...');
  try {
    const googleAIPlugin = googleAI({ apiKey: googleApiKey });
    aiInstance = genkit({ 
      plugins: [googleAIPlugin],
      model: 'googleai/gemini-1.5-flash-latest'
    });
    defaultTextModelChoice = 'googleai/gemini-1.5-flash-latest';
    successfullyInitializedPlugin = 'GoogleAI';
    activePluginsInfo.push(`Google AI plugin configured. Default text model set to: ${defaultTextModelChoice}.`);
  } catch (e: any) {
    console.error('Genkit.ts: CRITICAL Error configuring Google AI plugin:', e.message || String(e));
    activePluginsInfo.push(`Google AI plugin FAILED to configure. Error: ${e.message || String(e)}`);
  }
}

// If no plugin was successfully initialized, initialize Genkit with an empty array
if (!successfullyInitializedPlugin) {
  if (openaiApiKey || googleApiKey) {
    activePluginsInfo.push('Neither OpenAI nor Google AI plugins were successfully configured despite API key(s) being present.');
  } else {
    activePluginsInfo.push('No API keys found for OpenAI or Google AI.');
  }
  activePluginsInfo.push('Genkit initialized with NO plugins. AI features will be unavailable.');
  aiInstance = genkit({ plugins: [] });
}

// Log all collected info
activePluginsInfo.forEach(info => console.log(`Genkit.ts: ${info}`));

if (successfullyInitializedPlugin && defaultTextModelChoice) {
  console.log(`Genkit.ts: Successfully initialized ${successfullyInitializedPlugin} with default model: ${defaultTextModelChoice}`);
}

export const ai = aiInstance;
export const defaultModel = defaultTextModelChoice;
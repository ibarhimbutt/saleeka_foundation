import { genkit } from 'genkit';
import { openAI } from 'genkitx-openai';

const openaiApiKey = process.env.OPENAI_API_KEY;

let aiInstance: any;
let defaultTextModelChoice: string | undefined;
let activePluginsInfo: string[] = [];
let successfullyInitializedPlugin: string | null = null;

console.log("Genkit.ts: Starting AI plugin configuration...");
console.log(`Genkit.ts: OpenAI API Key Present: ${openaiApiKey ? 'Yes' : 'No'}`);

// Only use OpenAI since you have the API key and want to avoid Google AI
if (openaiApiKey) {
  try {
    console.log("Genkit.ts: Configuring OpenAI plugin...");
    
    // Initialize Genkit with OpenAI plugin
    aiInstance = genkit({ 
      plugins: [
        openAI({ 
          apiKey: openaiApiKey,
        })
      ]
    });
    
    defaultTextModelChoice = 'openai/gpt-3.5-turbo';
    successfullyInitializedPlugin = 'OpenAI';
    activePluginsInfo.push(`OpenAI plugin configured successfully. Default model: ${defaultTextModelChoice}`);
    
    console.log(`Genkit.ts: OpenAI plugin successfully initialized with model: ${defaultTextModelChoice}`);
    
  } catch (e: any) {
    console.error('Genkit.ts: CRITICAL Error configuring OpenAI plugin:', e.message || String(e));
    activePluginsInfo.push(`OpenAI plugin FAILED to configure. Error: ${e.message || String(e)}`);
    successfullyInitializedPlugin = null;
  }
} else {
  console.error('Genkit.ts: No OpenAI API key found in environment variables');
  activePluginsInfo.push('No OpenAI API key found. Please set OPENAI_API_KEY in your .env.local file.');
}

// If OpenAI failed to initialize, create a basic instance without plugins
if (!successfullyInitializedPlugin) {
  console.warn('Genkit.ts: Initializing Genkit without plugins - AI features will be unavailable');
  activePluginsInfo.push('Genkit initialized with NO plugins. AI features will be unavailable.');
  aiInstance = genkit({ plugins: [] });
}

// Log all collected info
activePluginsInfo.forEach(info => console.log(`Genkit.ts: ${info}`));

if (successfullyInitializedPlugin && defaultTextModelChoice) {
  console.log(`Genkit.ts: Successfully initialized ${successfullyInitializedPlugin} with default model: ${defaultTextModelChoice}`);
} else {
  console.error('Genkit.ts: Failed to initialize any AI provider. Check your API keys and configuration.');
}

export const ai = aiInstance;
export const defaultModel = defaultTextModelChoice;
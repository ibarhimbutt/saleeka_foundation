
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {openAI} from 'genkitx-openai'; // genkitx-openai is the community DALL-E plugin

const openaiApiKey = process.env.OPENAI_API_KEY;
const googleApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

let aiInstance: any; // Use 'any' for now to assign genkit() result flexibly
let defaultTextModelChoice: string | undefined;
let activePluginsInfo: string[] = [];
let successfullyInitializedPlugin: string | null = null;

console.log("Genkit.ts: Starting AI plugin configuration...");
console.log(`Genkit.ts: OpenAI API Key Present: ${openaiApiKey ? 'Yes' : 'No'}`);
console.log(`Genkit.ts: Google API Key Present: ${googleApiKey ? 'Yes' : 'No'}`);

if (openaiApiKey) {
  try {
    const openaiPlugin = openAI({ apiKey: openaiApiKey });
    // Attempt to initialize Genkit with ONLY the OpenAI plugin
    aiInstance = genkit({ plugins: [openaiPlugin] });
    defaultTextModelChoice = 'openai/gpt-3.5-turbo'; // A common text model from OpenAI
    successfullyInitializedPlugin = 'OpenAI';
    activePluginsInfo.push(`OpenAI plugin configured as primary. Default text model set to: ${defaultTextModelChoice}.`);
    
    // Verify by listing models from this instance
    const models = aiInstance.listModels();
    if (models.length > 0) {
      activePluginsInfo.push(`OpenAI Models reported by Genkit: ${models.map((m: any) => m.name).join(', ')}`);
    } else {
      activePluginsInfo.push(`OpenAI plugin configured, but Genkit reported NO models for it. This might indicate an issue with the API key or plugin.`);
    }
  } catch (e: any) {
    console.error('Genkit.ts: CRITICAL Error configuring OpenAI plugin:', e.message || String(e));
    activePluginsInfo.push(`OpenAI plugin FAILED to configure. Error: ${e.message || String(e)}`);
    // Do not set aiInstance here if OpenAI fails, let it fall through or be undefined
  }
}

// If OpenAI was not configured (either no key or failed init) AND Google AI key is present
if (!successfullyInitializedPlugin && googleApiKey) {
  activePluginsInfo.push('OpenAI not configured or failed. Attempting Google AI plugin configuration...');
  try {
    const googleAIPlugin = googleAI({ apiKey: googleApiKey });
    // Attempt to initialize Genkit with ONLY the GoogleAI plugin
    aiInstance = genkit({ plugins: [googleAIPlugin] });
    defaultTextModelChoice = 'googleai/gemini-1.5-flash-latest';
    successfullyInitializedPlugin = 'GoogleAI';
    activePluginsInfo.push(`Google AI plugin configured. Default text model set to: ${defaultTextModelChoice}.`);

    // Verify by listing models
    const models = aiInstance.listModels();
     if (models.length > 0) {
      activePluginsInfo.push(`GoogleAI Models reported by Genkit: ${models.map((m: any) => m.name).join(', ')}`);
    } else {
      activePluginsInfo.push(`Google AI plugin configured, but Genkit reported NO models for it. Check API key or plugin setup.`);
    }
  } catch (e: any) {
    console.error('Genkit.ts: CRITICAL Error configuring Google AI plugin:', e.message || String(e));
    activePluginsInfo.push(`Google AI plugin FAILED to configure. Error: ${e.message || String(e)}`);
  }
}

// If no plugin was successfully initialized, initialize Genkit with an empty array
if (!successfullyInitializedPlugin) {
  if (openaiApiKey || googleApiKey) { // Only log this specific message if keys were present but config failed
    activePluginsInfo.push('Neither OpenAI nor Google AI plugins were successfully configured despite API key(s) being present.');
  } else {
    activePluginsInfo.push('No API keys found for OpenAI or Google AI.');
  }
  activePluginsInfo.push('Genkit initialized with NO plugins. AI features will be unavailable.');
  aiInstance = genkit({ plugins: [] });
}

// Log all collected info at the end
activePluginsInfo.forEach(info => console.log(`Genkit.ts: ${info}`));

// Export the configured aiInstance. It might be an instance with a plugin or a base Genkit instance with no plugins.
export const ai = aiInstance;

// Optional: Log the intended default model if one was set during successful plugin init.
// Note: Genkit v1.x doesn't take a 'model' in its main config. Defaulting is handled by specifying in calls or Genkit's internal priority.
if (successfullyInitializedPlugin && defaultTextModelChoice) {
  console.log(`Genkit.ts: Based on successful initialization of ${successfullyInitializedPlugin}, the intended default TEXT model for ai.generate() calls (if not overridden) is: ${defaultTextModelChoice}`);
} else if (defaultTextModelChoice) {
    // This case might happen if defaultTextModelChoice was set but plugin init failed
    console.warn(`Genkit.ts: A default text model (${defaultTextModelChoice}) was determined, but the associated plugin (${openaiApiKey ? 'OpenAI' : 'GoogleAI'}) might not have initialized correctly. Check logs.`);
} else {
    console.log(`Genkit.ts: No default text model determined as no AI plugins were successfully configured.`);
}

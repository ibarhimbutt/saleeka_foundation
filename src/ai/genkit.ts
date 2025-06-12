
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {openAI} from 'genkitx-openai';

const googleApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

const activePlugins: any[] = [];

if (googleApiKey) {
  try {
    const pluginInstance = googleAI({apiKey: googleApiKey});
    if (pluginInstance && typeof pluginInstance === 'object' && pluginInstance !== null) {
      activePlugins.push(pluginInstance);
      console.log('Genkit.ts: Google AI plugin initialized and added.');
    } else {
      console.warn('Genkit.ts: Google AI plugin failed to initialize properly (returned falsy or non-object).');
    }
  } catch (e: any) {
    console.error('Genkit.ts: Error during Google AI plugin initialization:', e.message || String(e));
  }
} else {
  console.warn(
    'Genkit.ts: Google AI API key (GEMINI_API_KEY or GOOGLE_API_KEY) is not set. Google AI features will be unavailable.'
  );
}

if (openaiApiKey) {
   try {
    const pluginInstance = openAI({apiKey: openaiApiKey});
    if (pluginInstance && typeof pluginInstance === 'object' && pluginInstance !== null) {
      activePlugins.push(pluginInstance);
      console.log('Genkit.ts: OpenAI plugin initialized and added.');
    } else {
      console.warn('Genkit.ts: OpenAI plugin failed to initialize properly (returned falsy or non-object).');
    }
  } catch (e: any) {
    console.error('Genkit.ts: Error during OpenAI plugin initialization:', e.message || String(e));
  }
} else {
  console.warn(
    'CRITICAL Genkit.ts: OpenAI API key (OPENAI_API_KEY) is not set in the environment. OpenAI features (like DALL-E image generation) will be unavailable. Ensure it is set in your .env file and the server has been restarted.'
  );
}


if (activePlugins.length === 0) {
    console.warn("Genkit.ts: No AI plugins configured. Genkit might not function as expected for AI operations.");
}

const isGoogleAIPluginActive = activePlugins.some(
  (p: any) => p && typeof p.name === 'string' && p.name.toLowerCase().includes('google')
);

const isOpenAIPluginActive = activePlugins.some(
  (p: any) => p && typeof p.name === 'string' && p.name.toLowerCase().includes('openai')
);

let defaultTextModel: string | undefined = undefined;
let defaultImageModel: string | undefined = undefined;

if (isOpenAIPluginActive) {
  defaultTextModel = 'openai/gpt-3.5-turbo'; // Example text model
  defaultImageModel = 'openai/dall-e-3';    // Default DALL-E model
  console.log(`Genkit.ts: OpenAI plugin is active. Default text model: ${defaultTextModel}, Default image model: ${defaultImageModel}`);
} else if (isGoogleAIPluginActive) {
  defaultTextModel = 'googleai/gemini-1.5-flash-latest';
  // Note: Gemini image generation model specified directly in flow
  console.log(`Genkit.ts: Google AI plugin is active (OpenAI not). Default text model: ${defaultTextModel}`);
}


export const ai = genkit({
  plugins: activePlugins,
  model: defaultTextModel,
  // We don't set a default image model globally here as flows specify it.
});


if (activePlugins.length > 0) {
    let modelNames = "unknown";
    try {
        const models = ai.listModels ? ai.listModels() : [];
        modelNames = models.map(m => m.name).join(', ') || 'none listed by Genkit';
    } catch(e: any) {
        console.warn("Genkit.ts: Could not list models from Genkit after initialization:", e.message || String(e));
    }
    
    const defaultModelForLog = defaultTextModel || 'not set explicitly or unavailable';

    console.log(`Genkit.ts: Genkit initialized with ${activePlugins.length} plugin(s). Default text model for ai.generate (if not overridden): ${defaultModelForLog}. Available models from initialized plugins: ${modelNames}`);
} else {
    console.log("Genkit.ts: Genkit initialized with no active plugins.");
}

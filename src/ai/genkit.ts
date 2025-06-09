
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
// import {openAI} from 'genkitx-openai'; // OpenAI plugin remains commented out

const googleApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
// const openaiApiKey = process.env.OPENAI_API_KEY;

const activePlugins: any[] = []; // Initialize as any[] or a more specific Genkit Plugin type if available

if (googleApiKey) {
  try {
    const pluginInstance = googleAI({apiKey: googleApiKey});
    // Basic check to see if the plugin initialized to something sensible
    if (pluginInstance && typeof pluginInstance === 'object' && pluginInstance !== null) {
      activePlugins.push(pluginInstance);
      console.log('Google AI plugin initialized and added.');
    } else {
      console.warn('Google AI plugin failed to initialize properly (returned falsy or non-object).');
    }
  } catch (e: any) {
    console.error('Error during Google AI plugin initialization:', e.message || String(e));
  }
} else {
  console.warn(
    'Google AI API key is not set. Google AI features will be unavailable.'
  );
}

/*
// OpenAI plugin section remains commented out to prevent "plugin is not a function" errors
// and because its model is also reported as "Not Found".
if (openaiApiKey) {
   try {
    const pluginInstance = openAI({apiKey: openaiApiKey});
    if (pluginInstance && typeof pluginInstance === 'object' && pluginInstance !== null) {
      activePlugins.push(pluginInstance);
      console.log('OpenAI plugin initialized and added.');
    } else {
      console.warn('OpenAI plugin failed to initialize properly (returned falsy or non-object).');
    }
  } catch (e: any) {
    console.error('Error during OpenAI plugin initialization:', e.message || String(e));
  }
} else {
  console.warn(
    'OpenAI API key is not set. OpenAI features (like DALL-E fallback) will be unavailable.'
  );
}
*/

if (activePlugins.length === 0) {
    console.warn("No AI plugins configured. Genkit might not function as expected for AI operations.");
}

// Determine if googleAI plugin is present by checking the name property of initialized plugins
const isGoogleAIPluginActive = activePlugins.some(
  (p: any) => p && typeof p.name === 'string' && p.name.toLowerCase().includes('google')
);

export const ai = genkit({
  plugins: activePlugins,
  // Default text model updated to a more common one.
  // Set default model only if Google AI plugin is active, otherwise it might cause issues if no plugins are loaded.
  model: isGoogleAIPluginActive ? 'googleai/gemini-1.5-flash-latest' : undefined,
});


// Logging for loaded plugins and default model
if (activePlugins.length > 0) {
    let modelNames = "unknown";
    try {
        // Ensure ai.listModels() is available and a function before calling
        const models = ai.listModels ? ai.listModels() : [];
        modelNames = models.map(m => m.name).join(', ') || 'none listed by Genkit';
    } catch(e: any) {
        console.warn("Could not list models from Genkit after initialization:", e.message || String(e));
    }
    
    const defaultModelArray = ai.listModels ? ai.listModels().filter(m => m.name === (isGoogleAIPluginActive ? 'googleai/gemini-1.5-flash-latest' : undefined)) : [];
    const defaultModelName = defaultModelArray.length > 0 && defaultModelArray[0] ? defaultModelArray[0].name : 'not set explicitly or default model unavailable';

    console.log(`Genkit initialized with ${activePlugins.length} plugin(s). Default model: ${defaultModelName}. Available models from initialized plugins: ${modelNames}`);
} else {
    console.log("Genkit initialized with no active plugins.");
}

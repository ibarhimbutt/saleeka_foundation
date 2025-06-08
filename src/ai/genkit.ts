
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
// import {openAI} from 'genkitx-openai'; // Re-enable OpenAI plugin

const googleApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
// const openaiApiKey = process.env.OPENAI_API_KEY; 

const activePlugins = [];

if (googleApiKey) {
  try {
    const pluginInstance = googleAI({apiKey: googleApiKey});
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
  model: isGoogleAIPluginActive ? 'googleai/gemini-1.5-flash-latest' : undefined, // Default text model updated
});

if (activePlugins.length > 0) {
    let modelNames = "unknown";
    try {
        const models = ai.listModels(); 
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

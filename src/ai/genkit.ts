// This file is no longer needed for the direct OpenAI implementation
// but keeping it for potential future use with other AI features

import OpenAI from 'openai';

const openaiApiKey = process.env.OPENAI_API_KEY;

console.log("AI: Starting OpenAI configuration...");
console.log(`AI: OpenAI API Key Present: ${openaiApiKey ? 'Yes' : 'No'}`);

// Initialize OpenAI client
let openaiClient: OpenAI | null = null;

if (openaiApiKey) {
  try {
    openaiClient = new OpenAI({
      apiKey: openaiApiKey,
    });
    console.log("AI: OpenAI client initialized successfully");
  } catch (error: any) {
    console.error("AI: Error initializing OpenAI client:", error.message);
  }
} else {
  console.error("AI: OpenAI API key not found in environment variables");
}

export { openaiClient };
export const isOpenAIAvailable = !!openaiClient;
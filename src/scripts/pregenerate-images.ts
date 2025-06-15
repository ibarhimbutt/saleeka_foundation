
/**
 * @fileOverview Script to pre-generate images for a predefined set of prompts
 * by calling the /api/generate-image route.
 * This script requires the Next.js development or production server to be running.
 */
// This script is intended to be run in a Node.js environment that can make HTTP requests.
// Using 'node-fetch' for making requests from a Node script.
// Ensure 'node-fetch' is in your dependencies if it's not already.

import fetch from 'node-fetch'; // Or use global fetch if your Node version supports it natively
import { predefinedImagePrompts } from '@/lib/predefined-prompts';

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'; // Adjust if your dev port is different or for production

async function pregenerateAllImagesViaApi() {
  console.log(`[PregenerateScriptAPI] Starting pregeneration for ${predefinedImagePrompts.length} prompts via API: ${API_BASE_URL}/api/generate-image`);

  for (const prompt of predefinedImagePrompts) {
    if (!prompt || prompt.trim() === "") {
        console.warn(`[PregenerateScriptAPI] Skipping empty or invalid prompt.`);
        continue;
    }
    console.log(`[PregenerateScriptAPI] Requesting generation for prompt: "${prompt.substring(0, 100)}..."`);
    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const result = await response.json() as any; // Type assertion for result

      if (response.ok && result.imageUrl) {
        console.log(`[PregenerateScriptAPI] SUCCESS for prompt "${prompt.substring(0, 50)}...". URL: ${result.imageUrl.substring(0, 60)}... ${result.cached ? '(from server cache)' : '(new generation)'}`);
      } else {
        console.error(`[PregenerateScriptAPI] FAILED for prompt "${prompt.substring(0, 50)}...". Status: ${response.status}. Error: ${result.error || 'Unknown API error.'}`);
      }
    } catch (error: any) {
      console.error(`[PregenerateScriptAPI] CRITICAL HTTP ERROR for prompt "${prompt.substring(0, 50)}...": ${error.message || String(error)}`);
    }
    // Add a small delay to avoid overwhelming the API route or OpenAI
    await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
  }

  console.log("[PregenerateScriptAPI] Pregeneration process via API completed.");
}

export async function runImagePregeneration() {
  await pregenerateAllImagesViaApi();
}

// If running this script directly (e.g., node -r ts-node/register src/scripts/pregenerate-images.ts or tsx src/scripts/pregenerate-images.ts)
if (require.main === module) {
  console.log("[PregenerateScriptAPI] Running script directly...");
  (async () => {
    // Load environment variables if needed, e.g., using dotenv
    // require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env') });
    // console.log("API_BASE_URL will be:", process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002');
    
    await pregenerateAllImagesViaApi().catch(err => {
      console.error("[PregenerateScriptAPI] Unhandled error in direct script execution:", err);
      process.exit(1);
    });
  })();
}

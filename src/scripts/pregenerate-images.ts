
/**
 * @fileOverview Script to pre-generate images for a predefined set of prompts.
 * This helps populate the cache and ensure essential images are available.
 */
'use server'; // Although this is a script, mark as server to align with flow usage

import { generateIllustration } from '@/ai/flows/generate-illustration-flow';
import { predefinedImagePrompts } from '@/lib/predefined-prompts';

async function pregenerateAllImages() {
  console.log(`[PregenerateScript] Starting pregeneration for ${predefinedImagePrompts.length} prompts...`);

  for (const prompt of predefinedImagePrompts) {
    if (!prompt || prompt.trim() === "") {
        console.warn(`[PregenerateScript] Skipping empty or invalid prompt.`);
        continue;
    }
    console.log(`[PregenerateScript] Requesting generation for prompt: "${prompt.substring(0, 100)}..."`);
    try {
      const result = await generateIllustration({ prompt });
      if (result.imageUrl) {
        console.log(`[PregenerateScript] SUCCESS for prompt "${prompt.substring(0, 50)}...". URL: ${result.imageUrl.substring(0, 60)}...`);
      } else {
        console.error(`[PregenerateScript] FAILED for prompt "${prompt.substring(0, 50)}...". Error: ${result.error || 'Unknown error, no URL returned.'}`);
      }
    } catch (error: any) {
      console.error(`[PregenerateScript] CRITICAL ERROR for prompt "${prompt.substring(0, 50)}...": ${error.message || String(error)}`);
    }
    // Add a small delay to avoid hitting rate limits too quickly if any apply broadly
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
  }

  console.log("[PregenerateScript] Pregeneration process completed.");
}

// Export a main function to be called from elsewhere (e.g., dev.ts)
export async function runImagePregeneration() {
  await pregenerateAllImages();
}

// If running this script directly (e.g., node -r tsx src/scripts/pregenerate-images.ts)
if (require.main === module) {
  console.log("[PregenerateScript] Running script directly...");
  pregenerateAllImages().catch(err => {
    console.error("[PregenerateScript] Unhandled error in direct script execution:", err);
    process.exit(1);
  });
}

    
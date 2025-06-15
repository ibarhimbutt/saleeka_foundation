
import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-content.ts';
// import '@/ai/flows/generate-illustration-flow.ts'; // REMOVED - Replaced by API route
import { runImagePregeneration } from '@/scripts/pregenerate-images'; // This script now calls the API route

async function initializeDevelopment() {
  console.log("[DevEnv] Initializing Genkit development environment...");
  
  if (process.env.NODE_ENV === 'development' && process.env.RUN_IMAGE_PREGENERATION_ON_DEV_START === 'true') {
    console.log("[DevEnv] Triggering image pregeneration script (via API)...");
    try {
      // Ensure your Next.js server (hosting /api/generate-image) is running before this script executes effectively.
      // This script now makes HTTP requests to your app's API.
      console.log("[DevEnv] NOTE: The pregeneration script calls /api/generate-image. Ensure your Next.js server is running on the expected port (e.g., 9002).");
      await runImagePregeneration();
      console.log("[DevEnv] Image pregeneration script (via API) completed.");
    } catch (error) {
      console.error("[DevEnv] Error during image pregeneration script (via API):", error);
    }
  } else {
    console.log("[DevEnv] Skipping image pregeneration script on startup. Set RUN_IMAGE_PREGENERATION_ON_DEV_START=true in .env to enable.");
  }
  
  console.log("[DevEnv] Genkit flows registered (excluding image generation). Ready for development.");
}

initializeDevelopment().catch(error => {
  console.error("[DevEnv] Failed to initialize development environment:", error);
  process.exit(1); // Exit if critical initialization fails
});

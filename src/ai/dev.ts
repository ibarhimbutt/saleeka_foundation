
import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-content.ts';
import '@/ai/flows/generate-illustration-flow.ts';
import { runImagePregeneration } from '@/scripts/pregenerate-images'; // Import the pregeneration script

async function initializeDevelopment() {
  console.log("[DevEnv] Initializing Genkit development environment...");
  
  // Conditionally run pregeneration, e.g., based on an environment variable or if it's the first run.
  // For now, let's run it every time the Genkit dev server starts.
  // In a production scenario, you'd run this as a separate build/deployment step.
  if (process.env.NODE_ENV === 'development' && process.env.RUN_IMAGE_PREGENERATION_ON_DEV_START === 'true') {
    console.log("[DevEnv] Triggering image pregeneration script...");
    try {
      await runImagePregeneration();
      console.log("[DevEnv] Image pregeneration script completed.");
    } catch (error) {
      console.error("[DevEnv] Error during image pregeneration script:", error);
    }
  } else {
    console.log("[DevEnv] Skipping image pregeneration script on startup. Set RUN_IMAGE_PREGENERATION_ON_DEV_START=true in .env to enable.");
  }
  
  console.log("[DevEnv] Genkit flows registered. Ready for development.");
}

initializeDevelopment().catch(error => {
  console.error("[DevEnv] Failed to initialize development environment:", error);
  process.exit(1); // Exit if critical initialization fails
});

    
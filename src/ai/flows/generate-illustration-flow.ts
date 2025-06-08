
'use server';
/**
 * @fileOverview An AI flow for generating illustrations with fallback to OpenAI DALL-E.
 * This flow aims to implement server-side caching (TODO).
 *
 * - generateIllustration - A function that handles the image generation process.
 * - GenerateIllustrationInput - The input type for the generateIllustration function.
 * - GenerateIllustrationOutput - The return type for the generateIllustration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
// TODO: Import Firebase Admin SDK for Storage and Firestore if implementing server-side caching
// import { initializeApp, cert } from 'firebase-admin/app';
// import { getStorage } from 'firebase-admin/storage';
// import { getFirestore } from 'firebase-admin/firestore';

// TODO: Initialize Firebase Admin (do this once, typically in a separate firebaseAdmin.ts file)
// if (!admin.apps.length) {
//   initializeApp({
//     credential: cert(serviceAccount), // Ensure your service account key is available
//     storageBucket: 'your-project-id.appspot.com'
//   });
// }
// const db = getFirestore();
// const storage = getStorage().bucket();

const GOOGLE_IMAGE_MODEL = 'googleai/gemini-2.0-flash-exp';

const GenerateIllustrationInputSchema = z.object({
  prompt: z.string().describe('A textual prompt describing the illustration to generate.'),
});
export type GenerateIllustrationInput = z.infer<typeof GenerateIllustrationInputSchema>;

const GenerateIllustrationOutputSchema = z.object({
  imageUrl: z.string().url().nullable().describe("The public URL of the generated or cached image, or null if generation failed."),
  error: z.string().optional().describe("An error message if image generation failed."),
  provider: z.string().optional().describe("The AI provider used for generation (e.g., 'googleai', 'openai')."),
});
export type GenerateIllustrationOutput = z.infer<typeof GenerateIllustrationOutputSchema>;

export async function generateIllustration(input: GenerateIllustrationInput): Promise<GenerateIllustrationOutput> {
  return generateIllustrationFlow(input);
}

const generateIllustrationFlow = ai.defineFlow(
  {
    name: 'generateIllustrationFlow',
    inputSchema: GenerateIllustrationInputSchema,
    outputSchema: GenerateIllustrationOutputSchema,
  },
  async (input): Promise<GenerateIllustrationOutput> => {
    const promptKey = input.prompt.toLowerCase().replace(/\s+/g, '-'); // Simple key generation

    // TODO: Step 1: Check Firestore for an existing image URL for this promptKey
    // const imageDocRef = db.collection('generatedImages').doc(promptKey);
    // const imageDoc = await imageDocRef.get();
    // if (imageDoc.exists && imageDoc.data()?.imageUrl) {
    //   return { imageUrl: imageDoc.data()?.imageUrl, provider: imageDoc.data()?.provider || 'cache' };
    // }

    let imageUrl: string | null = null;
    let errorMessage: string | undefined;
    let providerUsed: string | undefined;
    let attemptFallback = false;

    // Attempt 1: Google Gemini
    try {
      console.log(`generateIllustrationFlow: Attempting Google Gemini (${GOOGLE_IMAGE_MODEL}) for prompt: "${input.prompt}"`);
      const {media} = await ai.generate({
        model: GOOGLE_IMAGE_MODEL,
        prompt: `Generate a vibrant and professional illustration for a website. Prompt: ${input.prompt}`,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      if (media && media.url && media.url.startsWith('data:image/png;base64,')) {
        imageUrl = media.url; // This is a data URI
        providerUsed = 'googleai';
        // TODO: Upload to Firebase Storage and get public URL
        // const base64Data = media.url.replace(/^data:image\/png;base64,/, "");
        // const imageBuffer = Buffer.from(base64Data, 'base64');
        // const fileName = `illustrations/googleai/${promptKey}-${Date.now()}.png`;
        // const file = storage.file(fileName);
        // await file.save(imageBuffer, { metadata: { contentType: 'image/png' }, public: true });
        // imageUrl = file.publicUrl();
      } else {
        errorMessage = 'Google Gemini returned invalid image data.';
        console.warn(`generateIllustrationFlow (Google): Image generation for prompt "${input.prompt}" returned invalid data URI format or no media.`);
        attemptFallback = true; // Attempt fallback if data is invalid
      }
    } catch (e: any) {
      let originalError = e instanceof Error ? e.message : String(e);
      console.warn(`generateIllustrationFlow (Google): Error for prompt "${input.prompt}": ${originalError}`);
      if (originalError.includes('429') || originalError.includes('QuotaFailure') || originalError.toLowerCase().includes('rate limit')) {
        errorMessage = `Google Gemini API rate limit reached. Fallback to DALL-E will be attempted. Error: ${originalError.substring(0,100)}`;
        attemptFallback = true;
      } else if ((originalError.toLowerCase().includes('model') && originalError.toLowerCase().includes('not found')) || originalError.toLowerCase().includes('not_found')) {
        errorMessage = `Google Gemini model '${GOOGLE_IMAGE_MODEL}' not found or inaccessible. Fallback to DALL-E will be attempted. Error: ${originalError.substring(0,100)}`;
        attemptFallback = true;
      }
      else {
        errorMessage = `Google Gemini generation failed: ${originalError.substring(0,100)}`;
        // For other generic errors, we might still want to attempt fallback if critical
        attemptFallback = true; 
      }
    }

    // Attempt 2: OpenAI DALL-E (if Google Gemini failed and fallback is indicated)
    if (!imageUrl && attemptFallback) {
      console.log(`generateIllustrationFlow: Google Gemini attempt failed or indicated issues. Attempting OpenAI DALL-E for prompt: "${input.prompt}". Previous error: ${errorMessage}`);
      // Reset error message for DALL-E attempt, but keep the reason for fallback if needed for context.
      const googleErrorMessage = errorMessage; // Store previous error for context if needed
      errorMessage = undefined; 

      try {
        const dalleResponse = await ai.generate({
          model: 'openai/dall-e-3', 
          prompt: input.prompt, 
          config: {
            // DALL-E specific config if needed e.g. size, quality for DALL-E 2/3:
            // size: "1024x1024", n: 1, response_format: "url" (or b64_json for data URI)
            // Genkit plugin should abstract this. Check plugin docs for exact config options.
          },
        });
        
        let dalleImageUrl: string | undefined;
        // The Genkit OpenAI plugin for DALL-E might return the image in `media.url` or `output` (e.g., as a URL or base64 data URI)
        // Check for common patterns.
        if (dalleResponse.media && dalleResponse.media.url) {
            dalleImageUrl = dalleResponse.media.url;
        } else if (dalleResponse.output && typeof dalleResponse.output === 'string' && (dalleResponse.output.startsWith('http') || dalleResponse.output.startsWith('data:'))) {
            dalleImageUrl = dalleResponse.output; // Direct URL or data URI in output
        } else if (dalleResponse.output && typeof dalleResponse.output === 'object') {
            const outputObj = dalleResponse.output as any;
            if (outputObj.url && typeof outputObj.url === 'string') { // e.g. { url: '...' }
                dalleImageUrl = outputObj.url;
            } else if (Array.isArray(outputObj.images) && outputObj.images.length > 0 && outputObj.images[0].url) { // e.g. { images: [{url: '...'}]}
                dalleImageUrl = outputObj.images[0].url;
            } else if (Array.isArray(dalleResponse.output) && dalleResponse.output.length > 0 && (dalleResponse.output[0] as any).url) { // e.g. [{url: '...'}]
                dalleImageUrl = (dalleResponse.output[0] as any).url;
            }
        }


        if (dalleImageUrl) {
          imageUrl = dalleImageUrl; 
          providerUsed = 'openai';
          // TODO: If you want to store DALL-E images in your Firebase Storage too (optional, as DALL-E URLs are public but might expire)
          // You might download it and re-upload, or just use the DALL-E URL.
          // For consistency, re-uploading might be better.
          // If dalleImageUrl is a data URI, it can be handled similarly to the Gemini data URI.
          // const response = await fetch(dalleImageUrl);
          // const imageBuffer = Buffer.from(await response.arrayBuffer());
          // const fileName = `illustrations/openai/${promptKey}-${Date.now()}.png`;
          // const file = storage.file(fileName);
          // await file.save(imageBuffer, { metadata: { contentType: 'image/png' }, public: true });
          // imageUrl = file.publicUrl();
        } else {
          errorMessage = `OpenAI DALL-E generation did not return a valid image URL. Google Error: ${googleErrorMessage || 'N/A'}`;
          console.warn(`generateIllustrationFlow (OpenAI): DALL-E for prompt "${input.prompt}" did not return a valid URL. Response:`, JSON.stringify(dalleResponse));
        }
      } catch (e: any) {
        let originalError = e instanceof Error ? e.message : String(e);
        console.error(`generateIllustrationFlow (OpenAI): Error for prompt "${input.prompt}":`, originalError, e);
        errorMessage = `OpenAI DALL-E generation failed: ${originalError.substring(0,100)}. Initial Google Error: ${googleErrorMessage || 'N/A'}`;
      }
    }

    if (!imageUrl && !errorMessage) {
      errorMessage = "Image generation failed with an unknown error from all providers.";
    }
    
    // TODO: Step 4: Save the publicUrl (and providerUsed) to Firestore if an image was generated
    // if (imageUrl) {
    //   await imageDocRef.set({
    //     prompt: input.prompt,
    //     imageUrl: imageUrl,
    //     provider: providerUsed,
    //     createdAt: new Date(),
    //   });
    // }

    return { imageUrl, error: errorMessage, provider: providerUsed };
  }
);


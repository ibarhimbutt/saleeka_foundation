
'use server';
/**
 * @fileOverview An AI flow for generating illustrations with Firestore & Firebase Storage caching.
 *
 * - generateIllustration - A function that handles the image generation and caching process.
 * - GenerateIllustrationInput - The input type for the generateIllustration function.
 * - GenerateIllustrationOutput - The return type for the generateIllustration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as admin from 'firebase-admin';
import type { DecodedIdToken } from 'firebase-admin/auth'; // For potential future use with auth
import { FieldValue } from 'firebase-admin/firestore';
import type { MediaItem } from '@/lib/firestoreTypes';

// Initialize Firebase Admin SDK if not already initialized.
// For App Hosting, this might be automatic. For local dev, GOOGLE_APPLICATION_CREDENTIALS env var is needed.
if (!admin.apps.length) {
  try {
    // In a managed environment like Cloud Functions or App Hosting,
    // initializeApp() can often be called without arguments.
    // Locally, GOOGLE_APPLICATION_CREDENTIALS environment variable must point to your service account key JSON file.
    admin.initializeApp();
    console.log("generateIllustrationFlow: Firebase Admin SDK initialized.");
  } catch (e: any) {
    console.error("generateIllustrationFlow: Firebase Admin SDK failed to initialize. Ensure GOOGLE_APPLICATION_CREDENTIALS is set for local dev or the service account has permissions in the deployed environment.", e.message);
    // Depending on the app's requirements, you might want to throw this error
    // or handle it by disabling caching. For now, we'll log and continue,
    // and image generation will proceed without caching if admin init fails.
  }
}

const db = admin.firestore();
const storageBucket = admin.storage().bucket(); // Default bucket

const GOOGLE_IMAGE_MODEL = 'googleai/gemini-2.0-flash-exp';
const MEDIA_COLLECTION_NAME = 'media';
const ILLUSTRATION_STORAGE_PATH = 'illustrations/cache';


const GenerateIllustrationInputSchema = z.object({
  prompt: z.string().min(3, { message: "Prompt must be at least 3 characters long."})
    .describe('A textual prompt describing the illustration to generate.'),
});
export type GenerateIllustrationInput = z.infer<typeof GenerateIllustrationInputSchema>;

const GenerateIllustrationOutputSchema = z.object({
  imageUrl: z.string().url().nullable().describe("The public URL of the generated or cached image, or null if generation failed."),
  error: z.string().optional().describe("An error message if image generation failed."),
  provider: z.string().optional().describe("The AI provider used for generation (e.g., 'googleai', 'cache')."),
  cached: z.boolean().optional().describe("Indicates if the image was served from cache.")
});
export type GenerateIllustrationOutput = z.infer<typeof GenerateIllustrationOutputSchema>;


// Helper to create a sanitized key from the prompt for use as a document ID
const createPromptKey = (prompt: string): string => {
  return prompt
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove non-alphanumeric (excluding hyphens)
    .slice(0, 150); // Truncate to a reasonable length for a document ID
};

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
    if (!admin.apps.length) {
        console.warn("generateIllustrationFlow: Firebase Admin SDK not initialized. Proceeding without caching.");
        // Fallback to direct generation without caching if admin features are unavailable
        return directGenerate(input.prompt);
    }

    const promptKey = createPromptKey(input.prompt);

    try {
      // Step 1: Check Firestore for an existing image URL for this promptKey
      const mediaDocRef = db.collection(MEDIA_COLLECTION_NAME).doc(promptKey);
      const mediaDocSnap = await mediaDocRef.get();

      if (mediaDocSnap.exists) {
        const cachedMedia = mediaDocSnap.data() as MediaItem;
        if (cachedMedia.imageUrl) {
          console.log(`generateIllustrationFlow: Cache hit for prompt "${input.prompt}" (key: ${promptKey}).`);
          return { imageUrl: cachedMedia.imageUrl, provider: cachedMedia.provider || 'cache-firestore', cached: true };
        }
      }
      console.log(`generateIllustrationFlow: Cache miss for prompt "${input.prompt}" (key: ${promptKey}). Generating new image.`);
    } catch (e: any) {
      console.error(`generateIllustrationFlow: Error checking Firestore cache for promptKey "${promptKey}":`, e.message);
      // Proceed to generation if cache check fails
    }

    // Step 2: Generate Image using Genkit (if not found in cache)
    let generatedDataUri: string | null = null;
    let genProvider: string | undefined;
    let genError: string | undefined;

    try {
      console.log(`generateIllustrationFlow: Attempting Google Gemini (${GOOGLE_IMAGE_MODEL}) for prompt: "${input.prompt}"`);
      const {media} = await ai.generate({
        model: GOOGLE_IMAGE_MODEL,
        prompt: `Generate a vibrant and professional illustration for a website. Prompt: ${input.prompt}`,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
           safetySettings: [ // Add safety settings to be less restrictive for typical illustration prompts
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ],
        },
      });

      if (media && media.url && media.url.startsWith('data:')) {
        generatedDataUri = media.url;
        genProvider = 'googleai';
      } else {
        genError = 'Google Gemini returned invalid image data or no media URL.';
        console.warn(`generateIllustrationFlow (Google): Image generation for prompt "${input.prompt}" returned invalid data or no media.`);
      }
    } catch (e: any) {
      let originalError = e instanceof Error ? e.message : String(e);
      console.warn(`generateIllustrationFlow (Google): Error for prompt "${input.prompt}": ${originalError}`);
       if (originalError.includes('429') || originalError.includes('QuotaFailure') || originalError.toLowerCase().includes('rate limit')) {
        genError = `Google Gemini API rate limit reached.`;
      } else if ((originalError.toLowerCase().includes('model') && originalError.toLowerCase().includes('not found')) || originalError.toLowerCase().includes('not_found')) {
        genError = `Google Gemini model '${GOOGLE_IMAGE_MODEL}' not found or inaccessible.`;
      } else if (originalError.toLowerCase().includes('safety settings') || originalError.toLowerCase().includes('blocked for safety')) {
        genError = `Image generation blocked due to safety settings. Original: ${originalError.substring(0,150)}`;
      }
      else {
        genError = `Google Gemini generation failed: ${originalError.substring(0,150)}`;
      }
    }

    if (!generatedDataUri) {
      return { imageUrl: null, error: genError || "Image generation failed with an unknown error.", provider: genProvider, cached: false };
    }

    // Step 3: Upload to Firebase Storage
    try {
      const mimeTypeMatch = generatedDataUri.match(/^data:(image\/\w+);base64,/);
      if (!mimeTypeMatch || !mimeTypeMatch[1]) {
        throw new Error("Invalid data URI format: MIME type not found.");
      }
      const mimeType = mimeTypeMatch[1];
      const base64Data = generatedDataUri.replace(/^data:image\/\w+;base64,/, "");
      const imageBuffer = Buffer.from(base64Data, 'base64');
      const imageSizeBytes = imageBuffer.length;

      const fileName = `${promptKey}-${Date.now()}.${mimeType.split('/')[1] || 'png'}`;
      const filePath = `${ILLUSTRATION_STORAGE_PATH}/${fileName}`;
      const file = storageBucket.file(filePath);

      await file.save(imageBuffer, {
        metadata: { contentType: mimeType },
        public: true, // Make the file publicly readable
      });
      
      // Ensure file is public. If default ACLs aren't public, explicitly make it so.
      // await file.makePublic(); // This might be needed depending on bucket ACLs. Usually `public: true` in save is enough.

      const publicUrl = file.publicUrl(); // For GCS, ensure this format is correct or use `getSignedUrl` for temporary access.
                                        // `publicUrl()` is often `https://storage.googleapis.com/[BUCKET_NAME]/[OBJECT_PATH]`
                                        // Ensure your bucket has public access enabled for these files if using publicUrl directly.
                                        // A more robust way for web clients to access is via getDownloadURL from client SDK,
                                        // but since this is a server flow returning a URL, publicUrl() is standard if bucket is public.

      // Step 4: Save metadata to Firestore
      const mediaItem: MediaItem = {
        prompt: input.prompt,
        promptKey: promptKey,
        imageUrl: publicUrl,
        provider: genProvider!,
        createdAt: FieldValue.serverTimestamp() as admin.firestore.Timestamp, // Firestore Admin SDK timestamp
        imageSizeBytes,
        mimeType,
      };
      await db.collection(MEDIA_COLLECTION_NAME).doc(promptKey).set(mediaItem);
      console.log(`generateIllustrationFlow: Successfully generated, uploaded, and cached image for promptKey "${promptKey}". URL: ${publicUrl}`);

      return { imageUrl: publicUrl, provider: genProvider, cached: false };

    } catch (e: any) {
      console.error(`generateIllustrationFlow: Error during upload to Storage or saving to Firestore for promptKey "${promptKey}":`, e.message);
      return { imageUrl: null, error: `Failed to store generated image: ${e.message.substring(0,150)}`, provider: genProvider, cached: false };
    }
  }
);


// Fallback function for direct generation if Firebase Admin is not available
async function directGenerate(prompt: string): Promise<GenerateIllustrationOutput> {
  console.log(`directGenerate: Attempting Google Gemini (${GOOGLE_IMAGE_MODEL}) for prompt: "${prompt}" (NO CACHING)`);
  try {
    const {media} = await ai.generate({
      model: GOOGLE_IMAGE_MODEL,
      prompt: `Generate a vibrant and professional illustration for a website. Prompt: ${prompt}`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
         safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      },
    });

    if (media && media.url && media.url.startsWith('data:')) {
      return { imageUrl: media.url, provider: 'googleai', cached: false };
    } else {
      return { imageUrl: null, error: 'Google Gemini returned invalid image data or no media URL (direct generation).', provider: 'googleai', cached: false };
    }
  } catch (e: any) {
    let originalError = e instanceof Error ? e.message : String(e);
    let genError;
     if (originalError.includes('429') || originalError.includes('QuotaFailure') || originalError.toLowerCase().includes('rate limit')) {
      genError = `Google Gemini API rate limit reached.`;
    } else if ((originalError.toLowerCase().includes('model') && originalError.toLowerCase().includes('not found')) || originalError.toLowerCase().includes('not_found')) {
      genError = `Google Gemini model '${GOOGLE_IMAGE_MODEL}' not found or inaccessible.`;
    } else if (originalError.toLowerCase().includes('safety settings') || originalError.toLowerCase().includes('blocked for safety')) {
        genError = `Image generation blocked due to safety settings. Original: ${originalError.substring(0,150)}`;
    }
    else {
      genError = `Google Gemini generation failed (direct): ${originalError.substring(0,150)}`;
    }
    console.warn(`directGenerate (Google): Error for prompt "${prompt}": ${originalError}`);
    return { imageUrl: null, error: genError, provider: 'googleai', cached: false };
  }
}

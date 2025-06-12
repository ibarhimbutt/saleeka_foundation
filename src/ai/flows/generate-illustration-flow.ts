
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
import type { DecodedIdToken } from 'firebase-admin/auth';
import { FieldValue } from 'firebase-admin/firestore';
import type { MediaItem } from '@/lib/firestoreTypes';
import fetch from 'node-fetch'; // For fetching image from URL if OpenAI returns URL

if (!admin.apps.length) {
  try {
    admin.initializeApp();
    console.log("generateIllustrationFlow: Firebase Admin SDK initialized successfully.");
  } catch (e: any) {
    console.error("generateIllustrationFlow: Firebase Admin SDK failed to initialize. Ensure GOOGLE_APPLICATION_CREDENTIALS is set for local dev or the service account has permissions in the deployed environment. Caching will be disabled. Error:", e.message);
  }
}

const db = admin.apps.length ? admin.firestore() : null;
const storageBucket = admin.apps.length ? admin.storage().bucket() : null;

const OPENAI_IMAGE_MODEL = 'openai/dall-e-3'; // Using DALL-E 3
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
  provider: z.string().optional().describe("The AI provider used for generation (e.g., 'openai', 'cache')."),
  cached: z.boolean().optional().describe("Indicates if the image was served from cache.")
});
export type GenerateIllustrationOutput = z.infer<typeof GenerateIllustrationOutputSchema>;


const createPromptKey = (prompt: string): string => {
  return prompt
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 150);
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
    if (!db || !storageBucket) {
        console.warn("generateIllustrationFlow: Firebase Admin SDK (Firestore or Storage) not available. Proceeding with direct generation without caching.");
        return directGenerate(input.prompt);
    }

    const promptKey = createPromptKey(input.prompt);

    try {
      const mediaDocRef = db.collection(MEDIA_COLLECTION_NAME).doc(promptKey);
      const mediaDocSnap = await mediaDocRef.get();

      if (mediaDocSnap.exists) {
        const cachedMedia = mediaDocSnap.data() as MediaItem;
        if (cachedMedia.imageUrl) {
          console.log(`generateIllustrationFlow: Cache hit for prompt "${input.prompt}" (key: ${promptKey}). URL: ${cachedMedia.imageUrl}`);
          return { imageUrl: cachedMedia.imageUrl, provider: cachedMedia.provider || 'cache-firestore', cached: true };
        }
      }
      console.log(`generateIllustrationFlow: Cache miss for prompt "${input.prompt}" (key: ${promptKey}). Generating new image.`);
    } catch (e: any) {
      console.error(`generateIllustrationFlow: Error checking Firestore cache for promptKey "${promptKey}":`, e.message);
    }

    let generatedDataUri: string | null = null;
    let genProvider: string | undefined;
    let genError: string | undefined;

    try {
      console.log(`generateIllustrationFlow: Attempting OpenAI DALL-E (${OPENAI_IMAGE_MODEL}) for prompt: "${input.prompt}"`);
      const {media} = await ai.generate({
        model: OPENAI_IMAGE_MODEL, // Using DALL-E model
        prompt: `A highly detailed, vibrant, and professional illustration suitable for a website. Ensure the style is modern and appealing. Prompt: ${input.prompt}`,
        // No Gemini-specific config like responseModalities or safetySettings array needed for DALL-E.
        // DALL-E 3 might support 'size' (e.g., '1024x1024') or 'quality' (e.g., 'hd') in config if genkitx-openai supports passing them.
        // For now, keeping it simple.
      });

      if (media && media.url) {
        if (media.url.startsWith('data:')) {
          generatedDataUri = media.url;
        } else if (media.url.startsWith('http')) {
          // OpenAI returned an HTTPS URL, download it and convert to data URI
          console.log(`generateIllustrationFlow: OpenAI returned URL, downloading: ${media.url}`);
          const response = await fetch(media.url);
          if (!response.ok) {
            throw new Error(`Failed to download image from OpenAI URL (${media.url}): ${response.status} ${response.statusText}`);
          }
          const imageBuffer = Buffer.from(await response.arrayBuffer());
          const contentType = response.headers.get('content-type') || 'image/png'; // Default to png
          generatedDataUri = `data:${contentType};base64,${imageBuffer.toString('base64')}`;
          console.log(`generateIllustrationFlow: Successfully downloaded and converted image from OpenAI URL. Content-Type: ${contentType}`);
        } else {
           throw new Error(`OpenAI returned an unexpected media URL format: ${media.url}`);
        }
        genProvider = 'openai';
      } else {
        genError = 'OpenAI/DALL-E returned invalid image data or no media URL.';
        console.warn(`generateIllustrationFlow (OpenAI): Image generation for prompt "${input.prompt}" returned invalid data or no media.`);
      }
    } catch (e: any) {
      let originalError = e instanceof Error ? e.message : String(e);
      console.warn(`generateIllustrationFlow (OpenAI): Error for prompt "${input.prompt}": ${originalError}`);
      if (originalError.includes('429') || originalError.toLowerCase().includes('rate limit') || originalError.toLowerCase().includes('quota')) {
        genError = `OpenAI API rate limit or quota reached.`;
      } else if (originalError.toLowerCase().includes('billing') || originalError.toLowerCase().includes('credit')) {
        genError = `OpenAI API billing issue. Please check your account.`;
      } else if (originalError.toLowerCase().includes('safety') || originalError.toLowerCase().includes('policy')) {
        genError = `Image generation blocked by OpenAI's safety policy. Original: ${originalError.substring(0,150)}`;
      } else {
        genError = `OpenAI/DALL-E generation failed: ${originalError.substring(0,150)}`;
      }
    }

    if (!generatedDataUri) {
      return { imageUrl: null, error: genError || "Image generation failed with an unknown error.", provider: genProvider, cached: false };
    }

    try {
      const mimeTypeMatch = generatedDataUri.match(/^data:(image\/\w+);base64,/);
      if (!mimeTypeMatch || !mimeTypeMatch[1]) {
        throw new Error("Invalid data URI format: MIME type not found after processing.");
      }
      const mimeType = mimeTypeMatch[1];
      const base64Data = generatedDataUri.replace(/^data:image\/\w+;base64,/, "");
      const imageBuffer = Buffer.from(base64Data, 'base64');
      const imageSizeBytes = imageBuffer.length;

      const fileExtension = mimeType.split('/')[1] || 'png';
      const fileName = `${promptKey}-${Date.now()}.${fileExtension}`;
      const filePath = `${ILLUSTRATION_STORAGE_PATH}/${fileName}`;
      const file = storageBucket.file(filePath);

      await file.save(imageBuffer, {
        metadata: { contentType: mimeType },
        public: true,
      });
      
      const publicUrl = file.publicUrl();

      const mediaItem: MediaItem = {
        prompt: input.prompt,
        promptKey: promptKey,
        imageUrl: publicUrl,
        provider: genProvider!,
        createdAt: FieldValue.serverTimestamp() as admin.firestore.Timestamp,
        imageSizeBytes,
        mimeType,
      };
      await db.collection(MEDIA_COLLECTION_NAME).doc(promptKey).set(mediaItem);
      console.log(`generateIllustrationFlow: Successfully generated with ${genProvider}, uploaded, and cached image for promptKey "${promptKey}". URL: ${publicUrl}`);

      return { imageUrl: publicUrl, provider: genProvider, cached: false };

    } catch (e: any) {
      console.error(`generateIllustrationFlow: Error during upload to Storage or saving to Firestore for promptKey "${promptKey}":`, e.message);
      return { imageUrl: generatedDataUri, error: `Failed to store generated image for caching: ${e.message.substring(0,150)}. Displaying non-cached version.`, provider: genProvider, cached: false };
    }
  }
);


async function directGenerate(prompt: string): Promise<GenerateIllustrationOutput> {
  console.log(`directGenerate: Attempting OpenAI DALL-E (${OPENAI_IMAGE_MODEL}) for prompt: "${prompt}" (NO CACHING)`);
  let generatedDataUri: string | null = null;

  try {
    const {media} = await ai.generate({
      model: OPENAI_IMAGE_MODEL,
      prompt: `A highly detailed, vibrant, and professional illustration suitable for a website. Ensure the style is modern and appealing. Prompt: ${prompt}`,
    });

    if (media && media.url) {
      if (media.url.startsWith('data:')) {
        generatedDataUri = media.url;
      } else if (media.url.startsWith('http')) {
        console.log(`directGenerate: OpenAI returned URL, downloading: ${media.url}`);
        const response = await fetch(media.url);
        if (!response.ok) {
          throw new Error(`Failed to download image from OpenAI URL (${media.url}): ${response.status} ${response.statusText}`);
        }
        const imageBuffer = Buffer.from(await response.arrayBuffer());
        const contentType = response.headers.get('content-type') || 'image/png';
        generatedDataUri = `data:${contentType};base64,${imageBuffer.toString('base64')}`;
        console.log(`directGenerate: Successfully downloaded and converted image from OpenAI URL. Content-Type: ${contentType}`);
      } else {
        throw new Error(`OpenAI returned an unexpected media URL format: ${media.url}`);
      }
      return { imageUrl: generatedDataUri, provider: 'openai', cached: false };
    } else {
      return { imageUrl: null, error: 'OpenAI/DALL-E returned invalid image data or no media URL (direct generation).', provider: 'openai', cached: false };
    }
  } catch (e: any) {
    let originalError = e instanceof Error ? e.message : String(e);
    let genError;
    if (originalError.includes('429') || originalError.toLowerCase().includes('rate limit') || originalError.toLowerCase().includes('quota')) {
      genError = `OpenAI API rate limit or quota reached.`;
    } else if (originalError.toLowerCase().includes('billing') || originalError.toLowerCase().includes('credit')) {
        genError = `OpenAI API billing issue. Please check your account.`;
    } else if (originalError.toLowerCase().includes('safety') || originalError.toLowerCase().includes('policy')) {
      genError = `Image generation blocked by OpenAI's safety policy. Original: ${originalError.substring(0,150)}`;
    } else {
      genError = `OpenAI/DALL-E generation failed (direct): ${originalError.substring(0,150)}`;
    }
    console.warn(`directGenerate (OpenAI): Error for prompt "${prompt}": ${originalError}`);
    return { imageUrl: null, error: genError, provider: 'openai', cached: false };
  }
}

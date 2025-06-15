
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

const OPENAI_IMAGE_MODEL = 'dall-e-3';
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
        console.warn(`generateIllustrationFlow: Firebase Admin SDK (Firestore or Storage) not available. Proceeding with direct generation (model: ${OPENAI_IMAGE_MODEL}) without caching for prompt:`, input.prompt.substring(0, 50) + "...");
        return directGenerate(input.prompt);
    }

    const promptKey = createPromptKey(input.prompt);

    try {
      const mediaDocRef = db.collection(MEDIA_COLLECTION_NAME).doc(promptKey);
      const mediaDocSnap = await mediaDocRef.get();

      if (mediaDocSnap.exists) {
        const cachedMedia = mediaDocSnap.data() as MediaItem;
        if (cachedMedia.imageUrl) {
          console.log(`generateIllustrationFlow: Cache hit for prompt "${input.prompt.substring(0, 50)}..." (key: ${promptKey}). URL: ${cachedMedia.imageUrl.substring(0,60)}...`);
          return { imageUrl: cachedMedia.imageUrl, provider: cachedMedia.provider || 'cache-firestore', cached: true };
        }
      }
      console.log(`generateIllustrationFlow: Cache miss for prompt "${input.prompt.substring(0, 50)}..." (key: ${promptKey}). Generating new image with model: ${OPENAI_IMAGE_MODEL}.`);
    } catch (e: any) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.error(`generateIllustrationFlow: Error checking Firestore cache for promptKey "${promptKey}": ${errorMessage}. This could be a permissions issue with the Admin SDK service account if the error indicates "Missing or insufficient permissions".`, e);
      // Continue to generation even if Firestore check fails, but log the error
    }

    let generatedDataUri: string | null = null;
    let genProvider: string | undefined;
    let genError: string | undefined;

    try {
      // Diagnostic: Log available models to the 'ai' instance in this flow's scope
      try {
        const availableModels = ai.listModels();
        console.log(`generateIllustrationFlow: Models available to 'ai' instance before generation call:`, availableModels.map((m: any) => m.name).join(', ') || 'NONE LISTED');
      } catch (listModelsError: any) {
        console.error(`generateIllustrationFlow: Error trying to list models from 'ai' instance:`, listModelsError.message || String(listModelsError));
      }

      console.log(`generateIllustrationFlow: Attempting AI generation (model: ${OPENAI_IMAGE_MODEL}) for prompt: "${input.prompt.substring(0, 50)}..."`);
      const generationResult = await ai.generate({
        model: OPENAI_IMAGE_MODEL,
        prompt: `A highly detailed, vibrant, and professional illustration suitable for a website. Ensure the style is modern and appealing. Prompt: ${input.prompt}`,
      });

      if (!generationResult || !generationResult.media) {
        genError = `AI model (${OPENAI_IMAGE_MODEL}) returned no result or no media object. GenerationResult: ${JSON.stringify(generationResult)}`;
        console.warn(`generateIllustrationFlow (${OPENAI_IMAGE_MODEL}): Image generation for prompt "${input.prompt.substring(0, 50)}..." returned no media. Result:`, generationResult);
      } else if (generationResult.media && generationResult.media.url) {
        const mediaUrl = generationResult.media.url;
        console.log(`generateIllustrationFlow (${OPENAI_IMAGE_MODEL}): Received media URL: ${mediaUrl.substring(0,100)}...`);
        if (mediaUrl.startsWith('data:')) {
          generatedDataUri = mediaUrl;
        } else if (mediaUrl.startsWith('http')) {
          console.log(`generateIllustrationFlow: AI model (${OPENAI_IMAGE_MODEL}) returned URL, downloading: ${mediaUrl}`);
          const response = await fetch(mediaUrl);
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to download image from AI model URL (${mediaUrl}): ${response.status} ${response.statusText}. Response: ${errorText}`);
          }
          const imageBuffer = Buffer.from(await response.arrayBuffer());
          const contentType = response.headers.get('content-type') || 'image/png';
          generatedDataUri = `data:${contentType};base64,${imageBuffer.toString('base64')}`;
          console.log(`generateIllustrationFlow: Successfully downloaded and converted image from AI model URL. Content-Type: ${contentType}`);
        } else {
           throw new Error(`AI model (${OPENAI_IMAGE_MODEL}) returned an unexpected media URL format: ${mediaUrl}`);
        }
        genProvider = OPENAI_IMAGE_MODEL.startsWith('openai/') || OPENAI_IMAGE_MODEL.includes('dall-e') ? 'openai' : 'unknown-ai';
      } else {
        genError = `AI model (${OPENAI_IMAGE_MODEL}) returned invalid image data or no media URL. Media object: ${JSON.stringify(generationResult.media)}`;
        console.warn(`generateIllustrationFlow (${OPENAI_IMAGE_MODEL}): Image generation for prompt "${input.prompt.substring(0, 50)}..." returned invalid data or no media URL. Media:`, generationResult.media);
      }
    } catch (e: any) {
      let originalError = e instanceof Error ? e.message : String(e);
      console.error(`generateIllustrationFlow (AI CRITICAL - Model: ${OPENAI_IMAGE_MODEL}): Error during AI generation for prompt "${input.prompt.substring(0, 50)}...": ${originalError}`, e);
      if (originalError.includes('429') || originalError.toLowerCase().includes('rate limit') || originalError.toLowerCase().includes('quota')) {
        genError = `AI API (${OPENAI_IMAGE_MODEL}) rate limit or quota reached.`;
      } else if (originalError.toLowerCase().includes('billing') || originalError.toLowerCase().includes('credit')) {
        genError = `AI API (${OPENAI_IMAGE_MODEL}) billing issue. Please check your account.`;
      } else if (originalError.toLowerCase().includes('safety') || originalError.toLowerCase().includes('policy')) {
        genError = `Image generation blocked by AI's (${OPENAI_IMAGE_MODEL}) safety policy. Original: ${originalError.substring(0,150)}`;
      } else if (originalError.toLowerCase().includes('plugin is not a function')) {
        genError = `Genkit plugin error: "plugin is not a function". Check Genkit setup and AI plugin (${OPENAI_IMAGE_MODEL}). Original: ${originalError.substring(0,150)}`;
      } else if (originalError.toLowerCase().includes('permission') || originalError.toLowerCase().includes('denied')) {
        genError = `AI generation failed due to permissions with the AI provider (${OPENAI_IMAGE_MODEL}). Original: ${originalError.substring(0,150)}`;
      } else if (originalError.toLowerCase().includes('not found') && originalError.toLowerCase().includes('model')) {
        genError = `AI model (${OPENAI_IMAGE_MODEL}) not found. Check API key access and **see server logs for 'ai.listModels()' output** to verify model availability. Original: ${originalError.substring(0,100)}`;
      }
       else {
        genError = `AI model (${OPENAI_IMAGE_MODEL}) generation failed: ${originalError.substring(0,150)}`;
      }
    }

    if (!generatedDataUri) {
      console.error(`generateIllustrationFlow: No generatedDataUri after attempting generation (model: ${OPENAI_IMAGE_MODEL}) for prompt "${input.prompt.substring(0, 50)}...". Error: ${genError}`);
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
        public: true, // Make file public for direct URL access
      });

      // Ensure file is public (some SDK versions might require explicit marking)
      await file.makePublic();
      const publicUrl = file.publicUrl(); // Get the public URL

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
      console.log(`generateIllustrationFlow: Successfully generated with ${genProvider} (model ${OPENAI_IMAGE_MODEL}), uploaded, and cached image for promptKey "${promptKey}". URL: ${publicUrl.substring(0,60)}...`);

      return { imageUrl: publicUrl, provider: genProvider, cached: false };

    } catch (e: any) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      let storageOrFirestoreError = `Failed to store generated image for caching: ${errorMessage.substring(0,150)}.`;
      if (errorMessage.toLowerCase().includes('permission') || errorMessage.toLowerCase().includes('denied')) {
        storageOrFirestoreError += " This often indicates the Admin SDK service account lacks Storage Admin or Firestore (Datastore User) IAM permissions.";
      }
      console.error(`generateIllustrationFlow: Error during upload to Storage or saving to Firestore for promptKey "${promptKey}": ${errorMessage}`, e);
      // Return the generatedDataUri (base64) here because upload/caching failed, but generation might have succeeded.
      // This allows AiImage to at least display it temporarily if it can handle data URIs directly.
      return { imageUrl: generatedDataUri, error: storageOrFirestoreError, provider: genProvider, cached: false };
    }
  }
);


async function directGenerate(prompt: string): Promise<GenerateIllustrationOutput> {
  console.log(`directGenerate: Attempting AI generation (model: ${OPENAI_IMAGE_MODEL}) for prompt: "${prompt.substring(0, 50)}..." (NO CACHING)`);
  let generatedDataUri: string | null = null;
  let genProvider: string | undefined;

   try {
      // Diagnostic: Log available models to the 'ai' instance in this flow's scope
      try {
        const availableModels = ai.listModels();
        console.log(`directGenerate: Models available to 'ai' instance before generation call:`, availableModels.map((m: any) => m.name).join(', ') || 'NONE LISTED');
      } catch (listModelsError: any) {
        console.error(`directGenerate: Error trying to list models from 'ai' instance:`, listModelsError.message || String(listModelsError));
      }

    const generationResult = await ai.generate({
      model: OPENAI_IMAGE_MODEL,
      prompt: `A highly detailed, vibrant, and professional illustration suitable for a website. Ensure the style is modern and appealing. Prompt: ${prompt}`,
    });
     genProvider = OPENAI_IMAGE_MODEL.startsWith('openai/') || OPENAI_IMAGE_MODEL.includes('dall-e') ? 'openai' : 'unknown-ai';


    if (!generationResult || !generationResult.media) {
      console.warn(`directGenerate (${OPENAI_IMAGE_MODEL}): Image generation for prompt "${prompt.substring(0, 50)}..." returned no media. Result:`, generationResult);
      return { imageUrl: null, error: `AI model (${OPENAI_IMAGE_MODEL}) returned no result or no media object (direct generation). Result: ${JSON.stringify(generationResult)}`, provider: genProvider, cached: false };
    } else if (generationResult.media && generationResult.media.url) {
      const mediaUrl = generationResult.media.url;
      console.log(`directGenerate (${OPENAI_IMAGE_MODEL}): Received media URL: ${mediaUrl.substring(0,100)}...`);
      if (mediaUrl.startsWith('data:')) {
        generatedDataUri = mediaUrl;
      } else if (mediaUrl.startsWith('http')) {
        console.log(`directGenerate: AI model (${OPENAI_IMAGE_MODEL}) returned URL, downloading: ${mediaUrl}`);
        const response = await fetch(mediaUrl);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to download image from AI model URL (${mediaUrl}): ${response.status} ${response.statusText}. Response: ${errorText}`);
        }
        const imageBuffer = Buffer.from(await response.arrayBuffer());
        const contentType = response.headers.get('content-type') || 'image/png';
        generatedDataUri = `data:${contentType};base64,${imageBuffer.toString('base64')}`;
        console.log(`directGenerate: Successfully downloaded and converted image from AI model URL. Content-Type: ${contentType}`);
      } else {
        throw new Error(`AI model (${OPENAI_IMAGE_MODEL}) returned an unexpected media URL format: ${mediaUrl}`);
      }
      return { imageUrl: generatedDataUri, provider: genProvider, cached: false };
    } else {
       console.warn(`directGenerate (${OPENAI_IMAGE_MODEL}): Image generation for prompt "${prompt.substring(0, 50)}..." returned invalid data or no media URL. Media:`, generationResult.media);
      return { imageUrl: null, error: `AI model (${OPENAI_IMAGE_MODEL}) returned invalid image data or no media URL (direct generation). Media object: ${JSON.stringify(generationResult.media)}`, provider: genProvider, cached: false };
    }
  } catch (e: any) {
    let originalError = e instanceof Error ? e.message : String(e);
    let genError;
    // genProvider might not be set if ai.generate itself throws an error before model identification logic
    const modelContext = genProvider || OPENAI_IMAGE_MODEL;

    if (originalError.includes('429') || originalError.toLowerCase().includes('rate limit') || originalError.toLowerCase().includes('quota')) {
      genError = `AI API (${modelContext}) rate limit or quota reached.`;
    } else if (originalError.toLowerCase().includes('billing') || originalError.toLowerCase().includes('credit')) {
        genError = `AI API (${modelContext}) billing issue. Please check your account.`;
    } else if (originalError.toLowerCase().includes('safety') || originalError.toLowerCase().includes('policy')) {
      genError = `Image generation blocked by AI's (${modelContext}) safety policy. Original: ${originalError.substring(0,150)}`;
    } else if (originalError.toLowerCase().includes('plugin is not a function')) {
        genError = `Genkit plugin error: "plugin is not a function". Check Genkit setup and AI plugin (${modelContext}). Original: ${originalError.substring(0,150)}`;
    } else if (originalError.toLowerCase().includes('permission') || originalError.toLowerCase().includes('denied')) {
        genError = `AI generation failed due to permissions with the AI provider (${modelContext}) (direct). Original: ${originalError.substring(0,150)}`;
    } else if (originalError.toLowerCase().includes('not found') && originalError.toLowerCase().includes('model')) {
        genError = `AI model (${modelContext}) not found. Check API key access and **see server logs for 'ai.listModels()' output** to verify model availability. Original: ${originalError.substring(0,100)}`;
    } else {
      genError = `AI model (${modelContext}) generation failed (direct): ${originalError.substring(0,150)}`;
    }
    console.error(`directGenerate (AI CRITICAL - Model: ${modelContext}): Error for prompt "${prompt.substring(0, 50)}...": ${originalError}`, e);
    return { imageUrl: null, error: genError, provider: genProvider, cached: false };
  }
}

    

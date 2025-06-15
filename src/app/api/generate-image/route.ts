
import { NextResponse, type NextRequest } from 'next/server';
import OpenAI from 'openai';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { MediaItem } from '@/lib/firestoreTypes';
import { sanitizePromptForClientCacheKey } from '@/lib/utils'; // Using the same sanitizer for consistency
import fetch from 'node-fetch'; // For downloading image from OpenAI URL

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Check for explicit service account path or rely on default credentials
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        // storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET // Ensure this env var is set if needed
      });
    } else {
      admin.initializeApp(); // For environments with auto-configured Admin SDK (e.g., Cloud Functions, App Engine)
    }
    console.log("api/generate-image: Firebase Admin SDK initialized.");
  } catch (e: any) {
    console.error("api/generate-image: Firebase Admin SDK failed to initialize. Error:", e.message);
    // If Admin SDK fails, the route might not function correctly for storage/firestore operations.
  }
}

const db = admin.apps.length ? admin.firestore() : null;
const storageBucket = admin.apps.length ? admin.storage().bucket() : null;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MEDIA_COLLECTION_NAME = 'media';
const ILLUSTRATION_STORAGE_PATH = 'illustrations/cache'; // Firebase Storage path

export async function POST(req: NextRequest) {
  if (!db || !storageBucket) {
    console.error("api/generate-image: Firestore or Storage not available due to Admin SDK init failure.");
    return NextResponse.json({ error: "Server configuration error for Firebase." }, { status: 500 });
  }

  const { prompt } = await req.json();

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
    return NextResponse.json({ error: 'A valid prompt is required (min 3 characters).' }, { status: 400 });
  }

  const promptKey = sanitizePromptForClientCacheKey(prompt);

  try {
    // 1. Check Firestore Cache
    const mediaDocRef = db.collection(MEDIA_COLLECTION_NAME).doc(promptKey);
    const mediaDocSnap = await mediaDocRef.get();

    if (mediaDocSnap.exists) {
      const cachedMedia = mediaDocSnap.data() as MediaItem;
      if (cachedMedia.imageUrl) {
        console.log(`api/generate-image: Cache hit for promptKey "${promptKey}". URL: ${cachedMedia.imageUrl.substring(0, 60)}...`);
        return NextResponse.json({ imageUrl: cachedMedia.imageUrl, cached: true });
      }
    }
    console.log(`api/generate-image: Cache miss for promptKey "${promptKey}". Generating new image.`);

    // 2. Generate Image with OpenAI
    const aiResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `A highly detailed, vibrant, and professional illustration suitable for a website. Ensure the style is modern and appealing. Prompt: ${prompt}`,
      n: 1,
      size: "1024x1024", // DALL-E 3 standard size
      response_format: "url", // DALL-E 3 returns a URL by default
    });

    const openAiImageUrl = aiResponse.data[0]?.url;

    if (!openAiImageUrl) {
      console.error("api/generate-image: OpenAI did not return an image URL for prompt:", prompt);
      return NextResponse.json({ error: "Image generation failed (OpenAI did not return URL)." }, { status: 500 });
    }
    console.log(`api/generate-image: OpenAI generated image URL: ${openAiImageUrl.substring(0, 100)}...`);

    // 3. Download image from OpenAI's URL
    const imageResponse = await fetch(openAiImageUrl);
    if (!imageResponse.ok) {
        const errorText = await imageResponse.text();
        throw new Error(`Failed to download image from OpenAI URL (${openAiImageUrl}): ${imageResponse.status} ${imageResponse.statusText}. Response: ${errorText}`);
    }
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    const mimeType = imageResponse.headers.get('content-type') || 'image/png';
    const fileExtension = mimeType.split('/')[1] || 'png';

    // 4. Upload to Firebase Storage
    const fileName = `${promptKey}-${Date.now()}.${fileExtension}`;
    const filePath = `${ILLUSTRATION_STORAGE_PATH}/${fileName}`;
    const file = storageBucket.file(filePath);

    await file.save(imageBuffer, {
      metadata: { contentType: mimeType },
      public: true, // Make file public for direct URL access
    });
    // Ensure file is public (some SDK versions might require explicit marking)
    await file.makePublic(); 
    const publicUrl = file.publicUrl();
    console.log(`api/generate-image: Uploaded to Firebase Storage. Public URL: ${publicUrl.substring(0,60)}...`);

    // 5. Save to Firestore Cache
    const mediaItem: MediaItem = {
      prompt: prompt,
      promptKey: promptKey,
      imageUrl: publicUrl,
      provider: 'openai_dall-e-3', // Indicate source
      createdAt: FieldValue.serverTimestamp() as admin.firestore.Timestamp,
      imageSizeBytes: imageBuffer.length,
      mimeType,
    };
    await db.collection(MEDIA_COLLECTION_NAME).doc(promptKey).set(mediaItem);
    console.log(`api/generate-image: Saved metadata to Firestore for promptKey "${promptKey}".`);

    return NextResponse.json({ imageUrl: publicUrl, cached: false });

  } catch (error: any) {
    console.error(`api/generate-image: Error processing prompt "${prompt}":`, error.message || String(error));
    let userErrorMessage = "Image generation failed.";
    if (error.message && error.message.toLowerCase().includes('billing')) {
        userErrorMessage = "Image generation failed due to a billing issue with the AI provider.";
    } else if (error.message && error.message.toLowerCase().includes('quota')) {
        userErrorMessage = "Image generation failed due to quota limits with the AI provider.";
    } else if (error.message && error.message.toLowerCase().includes('safety') || error.message.toLowerCase().includes('policy')) {
        userErrorMessage = "Image generation blocked by AI safety policy.";
    }
    return NextResponse.json({ error: userErrorMessage, details: error.message }, { status: 500 });
  }
}

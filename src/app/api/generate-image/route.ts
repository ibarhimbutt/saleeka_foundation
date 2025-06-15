
import { NextResponse, type NextRequest } from 'next/server';
import OpenAI from 'openai';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { MediaItem } from '@/lib/firestoreTypes';
import { sanitizePromptForClientCacheKey } from '@/lib/utils';
import fetch from 'node-fetch';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const adminConfigOptions: admin.AppOptions = {};

    // Use explicit GOOGLE_APPLICATION_CREDENTIALS if set
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      adminConfigOptions.credential = admin.credential.applicationDefault();
      console.log("api/generate-image: Using GOOGLE_APPLICATION_CREDENTIALS for Admin SDK.");
    } else {
      console.log("api/generate-image: GOOGLE_APPLICATION_CREDENTIALS not set. Relying on Application Default Credentials or other auto-configuration.");
    }

    // Explicitly set projectId and storageBucket if available from env vars
    // These should match your client-side Firebase config for consistency.
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

    if (projectId) {
      adminConfigOptions.projectId = projectId;
    } else {
      console.warn("api/generate-image: NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable is not set. Admin SDK might have issues inferring project ID.");
    }

    if (storageBucket) {
      adminConfigOptions.storageBucket = storageBucket;
    } else {
      console.warn("api/generate-image: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET environment variable is not set. Admin SDK might have issues inferring storage bucket.");
    }
    
    admin.initializeApp(adminConfigOptions);
    console.log("api/generate-image: Firebase Admin SDK initialized (or attempted).");
    if (admin.apps.length) {
        console.log(`api/generate-image: Admin SDK for project ${admin.app().options.projectId} initialized.`);
    } else {
        console.error("api/generate-image: Firebase Admin SDK initializeApp was called, but admin.apps is still empty. This indicates a critical failure in initialization.");
    }

  } catch (e: any) {
    console.error("api/generate-image: Firebase Admin SDK CRITICAL FAILURE during initializeApp. Error:", e.message, e.stack);
  }
}

const db = admin.apps.length ? admin.firestore() : null;
const storage = admin.apps.length ? admin.storage() : null; // Get storage service
const defaultBucket = storage ? storage.bucket() : null; // Get default bucket from storage service

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MEDIA_COLLECTION_NAME = 'media';
const ILLUSTRATION_STORAGE_PATH = 'illustrations/cache';

export async function POST(req: NextRequest) {
  if (!db || !defaultBucket) {
    console.error("api/generate-image: Firestore or Storage Bucket not available. This is likely due to Firebase Admin SDK initialization failure. Check server logs for details about 'admin.initializeApp'. Ensure GOOGLE_APPLICATION_CREDENTIALS is set correctly for local dev or that the runtime service account has permissions.");
    return NextResponse.json({ error: "Server configuration error for Firebase. Admin SDK services not available." }, { status: 500 });
  }

  const { prompt } = await req.json();

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
    return NextResponse.json({ error: 'A valid prompt is required (min 3 characters).' }, { status: 400 });
  }

  const promptKey = sanitizePromptForClientCacheKey(prompt);

  try {
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

    const aiResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `A highly detailed, vibrant, and professional illustration suitable for a website. Ensure the style is modern and appealing. Prompt: ${prompt}`,
      n: 1,
      size: "1024x1024",
      response_format: "url",
    });

    const openAiImageUrl = aiResponse.data[0]?.url;

    if (!openAiImageUrl) {
      console.error("api/generate-image: OpenAI did not return an image URL for prompt:", prompt);
      return NextResponse.json({ error: "Image generation failed (OpenAI did not return URL)." }, { status: 500 });
    }
    console.log(`api/generate-image: OpenAI generated image URL: ${openAiImageUrl.substring(0, 100)}...`);

    const imageResponse = await fetch(openAiImageUrl);
    if (!imageResponse.ok) {
        const errorText = await imageResponse.text();
        throw new Error(`Failed to download image from OpenAI URL (${openAiImageUrl}): ${imageResponse.status} ${imageResponse.statusText}. Response: ${errorText}`);
    }
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    const mimeType = imageResponse.headers.get('content-type') || 'image/png';
    const fileExtension = mimeType.split('/')[1] || 'png';

    const fileName = `${promptKey}-${Date.now()}.${fileExtension}`;
    const filePath = `${ILLUSTRATION_STORAGE_PATH}/${fileName}`;
    const file = defaultBucket.file(filePath); // Use the defaultBucket obtained earlier

    await file.save(imageBuffer, {
      metadata: { contentType: mimeType },
      public: true,
    });
    await file.makePublic(); 
    const publicUrl = file.publicUrl();
    console.log(`api/generate-image: Uploaded to Firebase Storage. Public URL: ${publicUrl.substring(0,60)}...`);

    const mediaItem: MediaItem = {
      prompt: prompt,
      promptKey: promptKey,
      imageUrl: publicUrl,
      provider: 'openai_dall-e-3',
      createdAt: FieldValue.serverTimestamp() as admin.firestore.Timestamp,
      imageSizeBytes: imageBuffer.length,
      mimeType,
    };
    await db.collection(MEDIA_COLLECTION_NAME).doc(promptKey).set(mediaItem);
    console.log(`api/generate-image: Saved metadata to Firestore for promptKey "${promptKey}".`);

    return NextResponse.json({ imageUrl: publicUrl, cached: false });

  } catch (error: any) {
    console.error(`api/generate-image: Error processing prompt "${prompt}":`, error.message || String(error), error.stack);
    let userErrorMessage = "Image generation failed.";
    if (error.message && error.message.toLowerCase().includes('billing')) {
        userErrorMessage = "Image generation failed due to a billing issue with the AI provider.";
    } else if (error.message && error.message.toLowerCase().includes('quota')) {
        userErrorMessage = "Image generation failed due to quota limits with the AI provider.";
    } else if (error.message && (error.message.toLowerCase().includes('safety') || error.message.toLowerCase().includes('policy'))) {
        userErrorMessage = "Image generation blocked by AI safety policy.";
    }
    return NextResponse.json({ error: userErrorMessage, details: error.message }, { status: 500 });
  }
}

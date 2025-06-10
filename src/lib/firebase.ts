
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Define types for services, potentially undefined if init fails
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

const firebaseConfigValues = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID // Optional
};

const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName as keyof typeof process.env]);

if (typeof window !== 'undefined') {
  if (!getApps().length) { // Only initialize if no apps exist yet on the client
    if (missingEnvVars.length > 0) {
      console.error(
        `CRITICAL Firebase Initialization Error: The following environment variables required by 'src/lib/firebase.ts' were not found: ${missingEnvVars.join(', ')}. ` +
        "These variables are expected to be in a '.env' or '.env.local' file in your project's ROOT directory. " +
        "Ensure the file exists, is correctly named (e.g., '.env'), contains these variables with the 'NEXT_PUBLIC_' prefix and valid values from your Firebase project. " +
        "Most importantly, you MUST FULLY RESTART your Next.js development server (e.g., stop and re-run 'npm run dev') after any changes to this file. " +
        "Firebase will not initialize correctly without these steps."
      );
      // app, auth, db, storage remain undefined
    } else {
      // Log the actual config being used, masking sensitive parts if necessary in future, but for now, full log for debugging.
      console.log("Firebase Config being used for initialization:", firebaseConfigValues);
      try {
        console.log("Attempting to initialize Firebase client SDK...");
        const initializedApp = initializeApp(firebaseConfigValues);
        app = initializedApp;
        auth = getAuth(initializedApp);
        db = getFirestore(initializedApp);
        storage = getStorage(initializedApp);
        console.log("Firebase client SDK initialized successfully.");
      } catch (error: any) {
        console.error(
          "CRITICAL Error during Firebase client SDK initialization (initializeApp call failed):",
          error.message || String(error),
          "\nEnsure all Firebase config values in your .env file are correct, especially 'storageBucket' (usually 'YOUR_PROJECT_ID.appspot.com') and 'projectId'."
        );
        console.error("Firebase config that caused error:", firebaseConfigValues);
        // app, auth, db, storage remain undefined
      }
    }
  } else { // Firebase app already initialized on the client
    const existingApp = getApp(); // Get the default app
    app = existingApp;
    // Ensure services are assigned if re-evaluating module (e.g. HMR)
    if (!auth) auth = getAuth(existingApp);
    if (!db) db = getFirestore(existingApp);
    if (!storage) storage = getStorage(existingApp);
    // console.log("Firebase client SDK already initialized. Reusing existing instance.");
  }
}

// Export possibly undefined services. Components using them must check for their existence.
export { app, auth, db, storage };

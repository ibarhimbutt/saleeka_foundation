
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Construct Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID // Optional
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

// Check if all essential Firebase config values are present
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName as keyof typeof process.env]);

if (typeof window !== 'undefined' && !getApps().length) {
  if (missingEnvVars.length > 0) {
    console.error(
      `CRITICAL Firebase Initialization Error: The following environment variables required by 'src/lib/firebase.ts' were not found: ${missingEnvVars.join(', ')}. ` +
      "These variables are expected to be in a '.env' or '.env.local' file in your project's ROOT directory. " +
      "Ensure the file exists, is correctly named (e.g., '.env'), contains these variables with the 'NEXT_PUBLIC_' prefix and valid values from your Firebase project. " +
      "Most importantly, you MUST FULLY RESTART your Next.js development server (e.g., stop and re-run 'npm run dev') after any changes to this file. " +
      "Firebase will not initialize correctly without these steps."
    );
    // Assign dummy objects to prevent immediate crashes when these are imported elsewhere,
    // but Firebase functionality will be broken.
    app = {} as FirebaseApp;
    auth = {} as Auth;
    db = {} as Firestore;
    storage = {} as FirebaseStorage;
  } else {
    try {
      console.log("Attempting to initialize Firebase with config:", {
        apiKey: firebaseConfig.apiKey ? "********" : "MISSING/EMPTY", // Mask API key
        authDomain: firebaseConfig.authDomain || "MISSING/EMPTY",
        projectId: firebaseConfig.projectId || "MISSING/EMPTY",
      });
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
      console.log("Firebase client SDK initialized successfully.");
    } catch (error: any) {
      console.error("Error during Firebase client SDK initialization:", error.message || String(error));
      app = {} as FirebaseApp;
      auth = {} as Auth;
      db = {} as Firestore;
      storage = {} as FirebaseStorage;
    }
  }
} else if (getApps().length > 0) {
  app = getApps()[0];
  // Ensure auth, db, storage are assigned if app was already initialized (e.g. HMR)
  if (!auth) auth = getAuth(app);
  if (!db) db = getFirestore(app);
  if (!storage) storage = getStorage(app);
  // console.log("Firebase client SDK already initialized.");
} else {
  // Fallback for non-browser or unexpected scenarios
  console.warn("Firebase client SDK: Non-browser environment or unexpected initialization path. Using dummy objects.");
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as Firestore;
  storage = {} as FirebaseStorage;
}

export { app, auth, db, storage };

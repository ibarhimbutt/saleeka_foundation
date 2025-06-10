
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (typeof window !== 'undefined' && !getApps().length) {
  if (!firebaseConfig.apiKey) {
    console.error(
      'Firebase API key (NEXT_PUBLIC_FIREBASE_API_KEY) is missing. ' +
      'Please check your environment variables. Firebase will not initialize correctly.'
    );
  }
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log("Firebase client SDK initialized successfully.");
  } catch (error) {
    console.error("Error initializing Firebase client SDK:", error);
    // Fallback or dummy objects to prevent further errors if initialization fails
    app = {} as FirebaseApp; 
    auth = {} as Auth;
    db = {} as Firestore;
    storage = {} as FirebaseStorage;
  }
} else if (getApps().length > 0) {
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  // console.log("Firebase client SDK already initialized."); // Optional: uncomment for debugging
} else {
  // This case should ideally not be hit in a typical client-side scenario
  console.warn("Firebase client SDK: Non-browser environment or unexpected initialization scenario.");
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as Firestore;
  storage = {} as FirebaseStorage;
}

export { app, auth, db, storage };

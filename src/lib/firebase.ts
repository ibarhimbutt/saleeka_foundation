
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";



const firebaseConfig = {
  apiKey: "AIzaSyDCIkAgbB36p2u-xWXcVLHKWCKeIIAW364",
  authDomain: "saleeka-connect.firebaseapp.com",
  projectId: "saleeka-connect",
  storageBucket: "saleeka-connect.firebasestorage.app",
  messagingSenderId: "429561316956",
  appId: "1:429561316956:web:e935d62db3111a62ca8899"
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

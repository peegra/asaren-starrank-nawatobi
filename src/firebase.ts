import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const env = (import.meta as Record<string, any>).env ?? process.env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: env.VITE_FIREBASE_APP_ID || "",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

const requiredFirebaseKeys: Array<keyof typeof firebaseConfig> = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
];

const missingFirebaseKeys = requiredFirebaseKeys.filter((key) => !firebaseConfig[key]);
if (missingFirebaseKeys.length > 0) {
  console.error(
    `[firebase] Missing required Firebase config: ${missingFirebaseKeys.join(", ")}. ` +
      "For GitHub Pages, set VITE_FIREBASE_* in GitHub Actions Secrets."
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics conditionally
// if (typeof window !== 'undefined') {
//   isSupported().then((supported) => {
//     if (supported) {
//       getAnalytics(app);
//     }
//   });
// }

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore } from "firebase/firestore";

const env = (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};

function getRequiredEnv(name: string): string {
  const value = env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const firebaseConfig = {
  apiKey: getRequiredEnv("VITE_FIREBASE_API_KEY"),
  authDomain: getRequiredEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: getRequiredEnv("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: getRequiredEnv("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getRequiredEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getRequiredEnv("VITE_FIREBASE_APP_ID"),
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const collectionNames = ["players", "missions", "achievements"] as const;

const payload = await Promise.all(
  collectionNames.map(async (name) => {
    const snapshot = await getDocs(collection(db, name));
    return {
      name,
      docs: snapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data()
      }))
    };
  })
);

const outputDir = resolve(dirname(fileURLToPath(import.meta.url)), "..", "data");
mkdirSync(outputDir, { recursive: true });
const outputPath = resolve(outputDir, "firestore-export.json");
writeFileSync(outputPath, JSON.stringify(payload, null, 2));

const totalDocs = payload.reduce((sum, entry) => sum + entry.docs.length, 0);
console.log(`Exported ${totalDocs} documents to ${outputPath}`);

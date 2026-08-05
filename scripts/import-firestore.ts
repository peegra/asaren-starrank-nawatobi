import { mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import { initializeApp } from "firebase/app";
import { addDoc, collection, deleteDoc, doc, getDocs, getFirestore, setDoc } from "firebase/firestore";

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

const exportPath = resolve(dirname(fileURLToPath(import.meta.url)), "..", "data", "firestore-export.json");
const raw = readFileSync(exportPath, "utf8");
const payload = JSON.parse(raw) as Array<{ name: string; docs: Array<{ id: string; data: Record<string, unknown> }> }>;

for (const entry of payload) {
  const ref = collection(db, entry.name);
  const snapshot = await getDocs(ref);
  for (const docSnap of snapshot.docs) {
    await deleteDoc(doc(db, entry.name, docSnap.id));
  }

  for (const item of entry.docs) {
    await setDoc(doc(db, entry.name, item.id), item.data);
  }
}

console.log("Imported Firestore data into the copied app's Firestore project");

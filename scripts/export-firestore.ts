import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore } from "firebase/firestore";

const env = (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyC-oHZKSvRGj5MRCmxG7yJ7r_Rbu7rPqEg",
  authDomain: "asaren-starrank.firebaseapp.com",
  projectId: "asaren-starrank",
  storageBucket: "asaren-starrank.firebasestorage.app",
  messagingSenderId: "142760528885",
  appId: "1:142760528885:web:a1ade05fa4a38193e1aebc",
  measurementId: "G-W7Y69S7CH6"
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

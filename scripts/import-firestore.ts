import { mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp } from "firebase/app";
import { addDoc, collection, deleteDoc, doc, getDocs, getFirestore, setDoc } from "firebase/firestore";

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

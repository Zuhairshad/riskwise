// src/lib/firebase.ts
"use client";

import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// This configuration is now hardcoded to ensure the correct project is always used.
const firebaseConfig = {
  apiKey: "API_KEY_REDACTED",
  authDomain: "proactify-99042.firebaseapp.com",
  projectId: "proactify-99042",
  storageBucket: "proactify-99042.appspot.com",
  messagingSenderId: "325492193792",
  appId: "1:325492193792:web:72895204439c235774a353",
  measurementId: "G-L0M2GV36E1"
};

// Masked log for quick sanity check
if (typeof window !== "undefined") {
  const masked = Object.fromEntries(
    Object.entries(firebaseConfig).map(([k, v]) => [k, String(v ?? "").slice(0, 6) + "…"])
  );
  // eslint-disable-next-line no-console
  console.log("[firebase cfg]", masked);
}

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { db, auth, app };

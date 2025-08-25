
"use client";

import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCyDlDFgpTAxkPibgdDs-vFuXA0Vy1ny5A",
  authDomain: "proactify-99042.firebaseapp.com",
  projectId: "proactify-99042",
  storageBucket: "proactify-99042.appspot.com",
  messagingSenderId: "325492193792",
  appId: "1:325492193792:web:72895204439c235774a353",
  measurementId: "G-L0M2GV36E1"
};


// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { db, auth, app };

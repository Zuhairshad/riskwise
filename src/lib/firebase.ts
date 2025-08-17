
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "riskwise-l2td9.firebaseapp.com",
  projectId: "riskwise-l2td9",
  storageBucket: "riskwise-l2td9.appspot.com",
  messagingSenderId: "954229157369",
  appId: "1:954229157369:web:26d2fe18decfaaa5176128",
  measurementId: "G-XXXXXXXXXX",
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

export { db };

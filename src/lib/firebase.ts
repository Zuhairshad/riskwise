
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  "projectId": "riskwise-l2td9",
  "appId": "1:954229157369:web:26d2fe18decfaaa5176128",
  "storageBucket": "riskwise-l2td9.firebasestorage.app",
  "apiKey": "AIzaSyBlh8BoBA3L4E4Uk6AKRCoHGxCb38cuPVQ",
  "authDomain": "riskwise-l2td9.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "954229157369"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };

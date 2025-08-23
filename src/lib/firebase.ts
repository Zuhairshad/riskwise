
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

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
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };


import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "riskwise-c9df3.firebaseapp.com",
  projectId: "riskwise-c9df3",
  storageBucket: "riskwise-c9df3.appspot.com",
  messagingSenderId: "1083013340579",
  appId: "1:1083013340579:web:9643d3995874421b458210",
  measurementId: "G-R5002S021C",
};


// Initialize Firebase
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage = getStorage(app);

export { db, auth, app, storage, firebaseConfig };

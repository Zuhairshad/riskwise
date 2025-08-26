import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDjpBvQ6ixJjyZbXFJ4er9Ow8Du4dSb7Cs",
  authDomain: "proactify-99042.firebaseapp.com",
  projectId: "proactify-99042",
  storageBucket: "proactify-99042.appspot.com",
  messagingSenderId: "325492193792",
  appId: "1:325492193792:web:72895204439c235774a353",
  measurementId: "G-L0M2GV36E1"
};


// Initialize Firebase
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage = getStorage(app);

export { db, auth, app, storage };

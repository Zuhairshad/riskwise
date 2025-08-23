
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA8Y57s-aUAIMU51D8oYOMmHGSa0K7Y1jY",
  authDomain: "riskwise-c9df3.firebaseapp.com",
  projectId: "riskwise-c9df3",
  storageBucket: "riskwise-c9df3.appspot.com",
  messagingSenderId: "290153782628",
  appId: "1:290153782628:web:e9eb93421d972053da6e71",
  measurementId: "G-EMYKZN4N92"
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

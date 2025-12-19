// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBUtzV-Mb0gfQQ4VLmqqH9A1omykJuLTzA",
  authDomain: "portfolio-6ec26.firebaseapp.com",
  projectId: "portfolio-6ec26",
  storageBucket: "portfolio-6ec26.firebasestorage.app",
  messagingSenderId: "854245093972",
  appId: "1:854245093972:web:b829f57ea0dffafbfdf3c1",
  measurementId: "G-LDJ3GRDX21"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services so other files can use them
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
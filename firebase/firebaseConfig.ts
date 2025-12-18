// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCe1gW6HNy1JMZ168u1mnqCuu0NXKiLO-c",
  authDomain: "trip-tales-2ad59.firebaseapp.com",
  projectId: "trip-tales-2ad59",
  storageBucket: "trip-tales-2ad59.firebasestorage.app",
  messagingSenderId: "779217580470",
  appId: "1:779217580470:web:b0d4baff3e0e1dd01fd117"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
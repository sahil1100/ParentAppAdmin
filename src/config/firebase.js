import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyDkUP8Cz9t6gbjRV0-tyJt4bUFFL0VNZx8",
  authDomain: "parentalcontrol-cd773.firebaseapp.com",
  projectId: "parentalcontrol-cd773",
  storageBucket: "parentalcontrol-cd773.firebasestorage.app",
  messagingSenderId: "245911494298",
  appId: "1:245911494298:web:013a3c2e51721c270f8923",
  measurementId: "G-5DKKYQYSRM"
};

// Initialize Firebase once
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

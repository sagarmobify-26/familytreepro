import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyABEVDENbdgC4qC8qxreUso3i5vlocDBRk",
  authDomain: "famil-c137b.firebaseapp.com",
  projectId: "famil-c137b",
  storageBucket: "famil-c137b.firebasestorage.app",
  messagingSenderId: "481550851665",
  appId: "1:481550851665:web:d5226f5421fea78a4ba270",
  measurementId: "G-DJ6T6GK5NL"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

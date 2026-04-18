// ── FIREBASE CONFIG ──────────────────────────────────────────────────────────
// Replace these values with your actual Firebase project config
// Go to: Firebase Console → Project Settings → Your Apps → SDK setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment,
  collection, query, orderBy, limit, getDocs, where, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDYg8e2YylcRTsnChW72tY2AZLp8Rojtls",
  authDomain: "neurolearn-a2ec9.firebaseapp.com",
  projectId: "neurolearn-a2ec9",
  storageBucket: "neurolearn-a2ec9.firebasestorage.app",
  messagingSenderId: "462084371700",
  appId: "1:462084371700:web:c52c8ef48f5a970d3d5aa1"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

export { auth, db, GoogleAuthProvider, signInWithPopup, signOut,
  onAuthStateChanged, doc, getDoc, setDoc, updateDoc, increment,
  collection, query, orderBy, limit, getDocs, where, serverTimestamp };

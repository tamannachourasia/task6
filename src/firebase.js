// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA_IMOb-m_3Wc5LbgS0pw5pQ0DIpQVU_F8",
  authDomain: "reacttask6.firebaseapp.com",
  projectId: "reacttask6",
  storageBucket: "reacttask6.appspot.com",
  messagingSenderId: "530849632574",
  appId: "1:530849632574:web:f919eb855de9be5e781c6f",
  measurementId: "G-ZTF59TL5EY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

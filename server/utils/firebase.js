// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBUVp7_UA1ugXF9NxOPxEWKtyX4wGfNC2E",
  authDomain: "kraken-20042.firebaseapp.com",
  projectId: "kraken-20042",
  storageBucket: "kraken-20042.firebasestorage.app",
  messagingSenderId: "292491760773",
  appId: "1:292491760773:web:1f8f1f5ab946a596be45ec"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
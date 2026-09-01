// Import the functions you need from the SDKs you need
import { getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const config = useRuntimeConfig();
const firebaseConfig = {
  apiKey: config.firebaseApiKey,
  authDomain: config.firebaseAuthDomain,
  projectId: config.firebaseProjectId,
  storageBucket: config.firebaseStorageBucket,
  messagingSenderId: config.firebaseMessagingSenderId,
  appId: config.firebaseAppId,
};

if (Object.values(firebaseConfig).some((value) => !value)) {
  throw new Error("Faltan variables de entorno de Firebase. Revisá el archivo .env.");
}

const app = getApps()[0] || initializeApp(firebaseConfig);
export const db = getFirestore(app);

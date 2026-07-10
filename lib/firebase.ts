import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDv9I3W_xl5PqcWvInfJKwWQWFuwU5wT3I",
  authDomain: "notevault-e25c7.firebaseapp.com",
  projectId: "notevault-e25c7",
  storageBucket: "notevault-e25c7.firebasestorage.app",
  messagingSenderId: "1025053196739",
  appId: "1:1025053196739:web:0357a63ce2b55313053d76",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
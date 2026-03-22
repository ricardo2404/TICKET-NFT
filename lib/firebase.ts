import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// lib/firebase.ts
const firebaseConfig = {
  apiKey: "AIzaSyAs3WxviaxYquTfAq4lOEm-TWHwu6n2Nrc", // Aquí pega la clave que viste en la imagen
  authDomain: "ticket-nft-90f77.firebaseapp.com",
  projectId: "ticket-nft-90f77",
  storageBucket: "ticket-nft-90f77.firebasestorage.app",
  messagingSenderId: "444558724878",
  appId: "1:444558724878:web:db15054a306d1de2e4515f"
};
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
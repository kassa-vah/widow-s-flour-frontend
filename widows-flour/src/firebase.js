// src/firebase.js
import { initializeApp } from "firebase/app";

const firebaseConfig = {
     apiKey: "AIzaSyAp2QIrRFx05XpHkw3YaJofJUa8_vda5n4",
  authDomain: "widow-s-flour.firebaseapp.com",
  projectId: "widow-s-flour",
  storageBucket: "widow-s-flour.firebasestorage.app",
  messagingSenderId: "420422616715",
  appId: "1:420422616715:web:57c9a5873a3ef60aa8b68e",
  measurementId: "G-KF9W7LMYSG"

};

export const app = initializeApp(firebaseConfig);
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "aulamuseu.firebaseapp.com",
  projectId: "aulamuseu",
  storageBucket: "aulamuseu.appspot.com",
  messagingSenderId: "443801106208",
  appId: "1:443801106208:web:636bae04aa1875d4bec945"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };

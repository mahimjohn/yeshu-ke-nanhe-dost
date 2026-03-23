// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyB6-aF6ycLVrmLBAr-1X4fL6ZVgwF0agFc",
  authDomain: "yeshu-ke-nanhe-dost.firebaseapp.com",
  databaseURL: "https://yeshu-ke-nanhe-dost-default-rtdb.firebaseio.com",
  projectId: "yeshu-ke-nanhe-dost",
  storageBucket: "yeshu-ke-nanhe-dost.firebasestorage.app",
  messagingSenderId: "496839768513",
  appId: "1:496839768513:web:e49e55eb2d196c8e095740"
};

const app = initializeApp(firebaseConfig);

export const rtdb    = getDatabase(app);
export const fdb     = getFirestore(app);
export const auth    = getAuth(app);
export const storage = getStorage(app);

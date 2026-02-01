// firebase.js

const firebaseConfig = {
  apiKey: "AIzaSyB6-aF6ycLVrmLBAr-1X4fL6ZVgwF0agFc",
  authDomain: "yeshu-ke-nanhe-dost.firebaseapp.com",
  databaseURL: "https://yeshu-ke-nanhe-dost-default-rtdb.firebaseio.com",
  projectId: "yeshu-ke-nanhe-dost",
  storageBucket: "yeshu-ke-nanhe-dost.appspot.com",
  messagingSenderId: "496839768513",
  appId: "1:496839768513:web:e49e55eb2d196c8e095740"
};

// Prevent double init
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Make global
window.db = firebase.database();
window.storage = firebase.storage();
window.auth = firebase.auth();

console.log("Firebase Connected");

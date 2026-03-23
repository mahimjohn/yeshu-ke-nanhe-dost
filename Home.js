// ===============================
// FIREBASE CONFIGURATION
// ===============================

const firebaseConfig = {
  apiKey: "AIzaSyB6-aF6ycLVrmLBAr-1X4fL6ZVgwF0agFc",
  authDomain: "yeshu-ke-nanhe-dost.firebaseapp.com",
  projectId: "yeshu-ke-nanhe-dost",
  storageBucket: "yeshu-ke-nanhe-dost.firebasestorage.app",
  messagingSenderId: "496839768513",
  appId: "1:496839768513:web:e49e55eb2d196c8e095740"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// ===============================
// AUTH & ELEMENTS
// ===============================

const auth = firebase.auth();

const loginLink = document.getElementById("loginLink");
const profileBox = document.getElementById("profileBox");
const userAvatar = document.getElementById("userAvatar");
const userName = document.getElementById("userName");

// ===============================
// CHECK LOGIN STATUS
// ===============================

auth.onAuthStateChanged((user) => {

  console.log("Auth state:", user);

  if (user) {
    // User logged in
    loginLink.style.display = "none";
    profileBox.style.display = "flex";

    userAvatar.src = user.photoURL || "logos/logo.png";
    userName.textContent = user.displayName || "User";
  } 
  else {
    // User logged out
    loginLink.style.display = "block";
    profileBox.style.display = "none";
  }

});

// ===============================
// LOGOUT
// ===============================

userAvatar.addEventListener("click", () => {
  auth.signOut();
  alert("Logged out successfully");
});

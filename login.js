// 🔥 Firebase Config
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
const auth = firebase.auth();

/* ==========================
   TAB SLIDER
========================== */

const signinBtn = document.getElementById("signinBtn");
const signupBtn = document.getElementById("signupBtn");
const slider = document.querySelector(".slider");

signinBtn.onclick = () => {
  slider.style.left = "0%";
  signinBtn.classList.add("active");
  signupBtn.classList.remove("active");
};

signupBtn.onclick = () => {
  slider.style.left = "50%";
  signupBtn.classList.add("active");
  signinBtn.classList.remove("active");
};

/* ==========================
   GOOGLE LOGIN
========================== */

function googleLogin(){
  const provider = new firebase.auth.GoogleAuthProvider();

  auth.signInWithPopup(provider)
    .then((result)=>{
      alert("Welcome " + result.user.displayName);
      window.location.href = "Home.html";
    })
    .catch((error)=>{
      alert(error.message);
    });
}

/* ==========================
   FACEBOOK LOGIN
========================== */

function facebookLogin(){
  const provider = new firebase.auth.FacebookAuthProvider();

  auth.signInWithPopup(provider)
    .then((result)=>{
      alert("Welcome " + result.user.displayName);
      window.location.href = "Home.html";
    })
    .catch((error)=>{
      alert(error.message);
    });
}

/* ==========================
   APPLE LOGIN
========================== */

function appleLogin(){
  const provider = new firebase.auth.OAuthProvider('apple.com');

  auth.signInWithPopup(provider)
    .then((result)=>{
      alert("Welcome " + result.user.displayName);
      window.location.href = "Home.html";
    })
    .catch((error)=>{
      alert(error.message);
    });
}

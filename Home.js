// FIREBASE CONFIG (paste your own keys here)

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "yeshu-ke-nanhe-dost.firebaseapp.com",
  projectId: "yeshu-ke-nanhe-dost",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

const loginLink = document.getElementById("loginLink");
const profileBox = document.getElementById("profileBox");
const userAvatar = document.getElementById("userAvatar");
const userName = document.getElementById("userName");

/* CHECK LOGIN STATUS */

auth.onAuthStateChanged(user => {

    if(user){
        loginLink.style.display = "none";
        profileBox.style.display = "flex";

        userAvatar.src = user.photoURL;
        userName.textContent = user.displayName;
    }
    else{
        loginLink.style.display = "block";
        profileBox.style.display = "none";
    }

});

/* LOGOUT */

userAvatar.onclick = function(){
    auth.signOut();
};

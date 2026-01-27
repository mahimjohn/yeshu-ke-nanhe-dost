const menuBtn = document.getElementById("menuBtn");
const sidebar = document.querySelector(".sidebar");
const main = document.querySelector(".main");

const auth = firebase.auth();

const userPhoto = document.getElementById("userPhoto");
const userName = document.getElementById("userName");

const sidePhoto = document.getElementById("sidePhoto");
const sideName = document.getElementById("sideName");

const logoutBtn = document.getElementById("logoutBtn");

/* CHECK LOGIN */

auth.onAuthStateChanged(user => {

  if(!user){
    window.location.href = "index.html";
  }else{

    userPhoto.src = user.photoURL || "logos/logo.png";
    userName.innerText = user.displayName || "User";

    sidePhoto.src = user.photoURL || "logos/logo.png";
    sideName.innerText = user.displayName || "User";

  }

});

/* LOGOUT */

logoutBtn.onclick = () => {
  auth.signOut().then(()=>{
    window.location.href="index.html";
  });
};

/* SIDEBAR TOGGLE */

menuBtn.onclick = ()=>{
  sidebar.classList.toggle("show");
  main.classList.toggle("shift");
};

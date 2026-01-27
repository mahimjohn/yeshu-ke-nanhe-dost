const menuBtn = document.getElementById("menuBtn");
const sidebar = document.querySelector(".sidebar");

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

    // Top bar
    userPhoto.src = user.photoURL || "logos/logo.png";
    userName.innerText = user.displayName || "User";

    // Sidebar
    sidePhoto.src = user.photoURL || "logos/logo.png";
    sideName.innerText = user.displayName || "User";

  }

});

/* LOGOUT */

logoutBtn.addEventListener("click", () => {

  auth.signOut()
  .then(() => {
    window.location.href = "index.html";
  })
  .catch(err => alert(err.message));

});

menuBtn.onclick = () => {
  sidebar.classList.toggle("show");
};

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.querySelector(".sidebar");
const main = document.querySelector(".main");

menuBtn.onclick = ()=>{
  sidebar.classList.toggle("closed");
  main.classList.toggle("full");
};


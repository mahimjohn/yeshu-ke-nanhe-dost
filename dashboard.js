const menuBtn = document.getElementById("menuBtn");
const sidebar = document.querySelector(".sidebar");
const main = document.querySelector(".main");

const auth = firebase.auth();
const db = firebase.database();   // ✅ IMPORTANT

const userPhoto = document.getElementById("userPhoto");
const userName = document.getElementById("userName");
const sidePhoto = document.getElementById("sidePhoto");
const sideName = document.getElementById("sideName");
const logoutBtn = document.getElementById("logoutBtn");

const prayerCountText = document.getElementById("prayerCount");

/* ================= AUTH ================= */

auth.onAuthStateChanged(user => {

  if(!user){
    window.location.href="index.html";
    return;
  }

  userPhoto.src = user.photoURL || "logos/logo.png";
  userName.innerText = user.displayName || "User";

  sidePhoto.src = user.photoURL || "logos/logo.png";
  sideName.innerText = user.displayName || "User";

  /* 🔥 PRAYER COUNT */
  db.ref("prayers/" + user.uid).on("value", snap => {

    const count = snap.numChildren();

    if(count === 0){
      prayerCountText.innerText = "No requests submitted";
    }
    else if(count === 1){
      prayerCountText.innerText = "1 request submitted";
    }
    else{
      prayerCountText.innerText = count + " requests submitted";
    }

  });

});

/* ================= LOGOUT ================= */

logoutBtn.onclick = () => {
  auth.signOut().then(()=>{
    window.location.href="index.html";
  });
};

/* ================= SIDEBAR ================= */

menuBtn.onclick = ()=>{
  sidebar.classList.toggle("show");
  main.classList.toggle("shift");
};

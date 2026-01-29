const menuBtn = document.getElementById("menuBtn");
const sidebar = document.querySelector(".sidebar");
const main = document.querySelector(".main");

const auth = firebase.auth();

const userPhoto = document.getElementById("userPhoto");
const userName = document.getElementById("userName");
const sidePhoto = document.getElementById("sidePhoto");
const sideName = document.getElementById("sideName");
const logoutBtn = document.getElementById("logoutBtn");

/* AUTH CHECK */

auth.onAuthStateChanged(user=>{
  if(!user){
    window.location.href="index.html";
  }else{
    userPhoto.src = user.photoURL || "logos/logo.png";
    userName.innerText = user.displayName || "User";

    sidePhoto.src = user.photoURL || "logos/logo.png";
    sideName.innerText = user.displayName || "User";
  }
});

/* LOGOUT */

logoutBtn.onclick = ()=>{
  auth.signOut().then(()=>{
    window.location.href="index.html";
  });
};

/* SIDEBAR TOGGLE */

menuBtn.onclick = ()=>{
  sidebar.classList.toggle("show");
  main.classList.toggle("shift");
};

const prayerCountText = document.getElementById("prayerCount");

auth.onAuthStateChanged(user => {

  if(user){
    db.ref("prayers/" + user.uid).on("value", snap => {

      const count = snap.numChildren();

      if(count === 0){
        prayerCountText.innerText = "No requests submitted";
      }else if(count === 1){
        prayerCountText.innerText = "1 request submitted";
      }else{
        prayerCountText.innerText = count + " requests submitted";
      }

    });
  }

});


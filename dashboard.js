/* ================= SIDEBAR ELEMENTS ================= */

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.querySelector(".sidebar");
const main = document.querySelector(".main");

/* ================= FIREBASE ================= */

const auth = firebase.auth();
const db = firebase.database();

/* ================= USER UI ================= */

const userPhoto = document.getElementById("userPhoto");
const userName = document.getElementById("userName");
const sidePhoto = document.getElementById("sidePhoto");
const sideName = document.getElementById("sideName");
const logoutBtn = document.getElementById("logoutBtn");

const prayerCountText = document.getElementById("prayerCount");

/* ================= AUTH CHECK ================= */

auth.onAuthStateChanged(user => {

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  // Profile info
  userPhoto.src = user.photoURL || "logos/logo.png";
  sidePhoto.src = user.photoURL || "logos/logo.png";

  userName.innerText = user.displayName || "User";
  sideName.innerText = user.displayName || "User";

  // Load prayer request count
  loadPrayerCount(user.uid);

});

/* ================= PRAYER COUNT ================= */

function loadPrayerCount(uid) {

  db.ref("prayers/" + uid).on("value", snapshot => {

    if (!snapshot.exists()) {
      prayerCountText.innerText = "No requests submitted";
      return;
    }

    const count = snapshot.numChildren();

    if (count === 1) {
      prayerCountText.innerText = "1 request submitted";
    } else {
      prayerCountText.innerText = count + " requests submitted";
    }

  });

}

/* ================= LOGOUT ================= */

logoutBtn.onclick = () => {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
};

/* ================= SIDEBAR TOGGLE ================= */

menuBtn.onclick = () => {
  sidebar.classList.toggle("show");
  main.classList.toggle("shift");
};

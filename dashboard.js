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

/* ========== VERSE OF THE DAY ========== */

const verses = [
  { text:"The Lord is my shepherd; I shall not want.", ref:"Psalm 23:1" },
  { text:"I can do all things through Christ who strengthens me.", ref:"Philippians 4:13" },
  { text:"For God so loved the world that He gave His only Son.", ref:"John 3:16" },
  { text:"Be still, and know that I am God.", ref:"Psalm 46:10" },
  { text:"Trust in the Lord with all your heart.", ref:"Proverbs 3:5" }
];

const today = new Date().getDate();
const verse = verses[today % verses.length];

document.getElementById("verseText").innerText = verse.text;
document.getElementById("verseRef").innerText = verse.ref;

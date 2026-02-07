console.log("Dashboard JS Loaded");
/* ================= FIREBASE ================= */

const auth = firebase.auth();
const db = firebase.database();

/* ================= UI ELEMENTS ================= */

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.querySelector(".sidebar");
const main = document.querySelector(".main");

const userPhoto = document.getElementById("userPhoto");
const userName = document.getElementById("userName");
const sidePhoto = document.getElementById("sidePhoto");
const sideName = document.getElementById("sideName");
const logoutBtn = document.getElementById("logoutBtn");

const prayerCountText = document.getElementById("prayerCount");
const savedBlogText = document.getElementById("savedBlogCount");

const verseText = document.getElementById("verseText");
const verseRef = document.getElementById("verseRef");

const featuredBlogsDiv = document.getElementById("featuredBlogs");

/* ================= AUTH ================= */

auth.onAuthStateChanged(user => {

  if(!user){
    window.location.href = "index.html";
    return;
  }

  userPhoto.src = user.photoURL || "logos/logo.png";
  sidePhoto.src = user.photoURL || "logos/logo.png";

  userName.innerText = user.displayName || "User";
  sideName.innerText = user.displayName || "User";

  loadPrayerCount(user.uid);
  loadSavedBlogsCount(user.uid);
});

/* ================= SIDEBAR ================= */

menuBtn.onclick = () => {
  sidebar.classList.toggle("show");
  main.classList.toggle("shift");
};

/* ================= LOGOUT ================= */

logoutBtn.onclick = () => {
  auth.signOut().then(()=>{
    window.location.href="index.html";
  });
};

/* ================= PRAYER COUNT ================= */

function loadPrayerCount(uid){

  db.ref("prayers/"+uid).on("value", snap=>{

    if(!snap.exists()){
      prayerCountText.innerText = "No requests submitted";
      return;
    }

    const count = snap.numChildren();

    prayerCountText.innerText =
      count===1 ? "1 request submitted" :
      count+" requests submitted";

  });

}

/* ================= SAVED BLOG COUNT ================= */

function loadSavedBlogsCount(uid){

  db.ref("savedBlogs/"+uid).on("value", snap=>{

    const count = snap.numChildren();

    savedBlogText.innerText =
      count===0 ? "0 blogs saved" :
      count+" blogs saved";

  });

}

/* ================= FEATURED BLOGS ================= */

const API_KEY = "AIzaSyDKLvTHoh1XOfSnJcmGy_7Y4Da00zEJBbA";
const BLOG_ID = "571259613266997453";

fetch(`https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts?key=${API_KEY}&maxResults=100`)
.then(res=>res.json())
.then(data=>{

  /* Same blogs for whole day */
  const seed = new Date().toDateString();
  data.items.sort((a,b)=>{
    return (a.id+seed).localeCompare(b.id+seed);
  });

  const posts = data.items.slice(0,5);

  posts.forEach(post=>{

    const temp=document.createElement("div");
    temp.innerHTML=post.content;
    const img=temp.querySelector("img");
    const image=img?img.src:"https://via.placeholder.com/300";

    const card=document.createElement("div");
    card.className="blog-card";

    card.innerHTML=`
      <img src="${image}">
      <h3>${post.title}</h3>
    `;

    card.onclick=()=>{
      window.location.href =
        "dashboard-blogs.html?postId="+post.id;
    };

    featuredBlogsDiv.appendChild(card);

  });

});

/* ================= VERSE OF THE DAY ================= */

fetch("https://beta.ourmanna.com/api/v1/get/?format=json")
  .then(res => res.json())
  .then(data => {
    const verse = data.verse.details.text;
    const reference = data.verse.details.reference;

    document.getElementById("verseText").innerText = verse;
    document.getElementById("verseRef").innerText = reference;
  })
  .catch(err=>{
    document.getElementById("verseText").innerText =
      "Unable to load verse today.";
    console.log(err);
  });

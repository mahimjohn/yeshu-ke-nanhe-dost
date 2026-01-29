/* ================= FIREBASE ================= */

const auth = firebase.auth();
const db = firebase.database();

/* ================= UI ================= */

const savedBlogsDiv = document.getElementById("savedBlogs");

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.querySelector(".sidebar");
const main = document.querySelector(".main");

const userPhoto = document.getElementById("userPhoto");
const userName = document.getElementById("userName");
const sidePhoto = document.getElementById("sidePhoto");
const sideName = document.getElementById("sideName");
const logoutBtn = document.getElementById("logoutBtn");

/* ================= SIDEBAR ================= */

menuBtn.onclick = () => {
  sidebar.classList.toggle("show");
  main.classList.toggle("shift");
};

/* ================= AUTH ================= */

auth.onAuthStateChanged(user => {

  if(!user){
    window.location.href="index.html";
    return;
  }

  userPhoto.src = user.photoURL || "logos/logo.png";
  sidePhoto.src = user.photoURL || "logos/logo.png";
  userName.innerText = user.displayName || "User";
  sideName.innerText = user.displayName || "User";

  loadSavedBlogs(user.uid);
});

/* ================= LOAD SAVED BLOGS ================= */

function loadSavedBlogs(uid){

  db.ref("savedBlogs/"+uid).on("value", snap=>{

    savedBlogsDiv.innerHTML="";

    if(!snap.exists()){
      savedBlogsDiv.innerHTML="<p>No saved blogs yet.</p>";
      return;
    }

    snap.forEach(child=>{

      const blog = child.val();

      const card = document.createElement("div");
      card.className="card";

      card.innerHTML = `
        <h3>${blog.title}</h3>
        <div class="actions">
          <button class="open-btn">Open</button>
          <button class="remove-btn">Remove</button>
        </div>
      `;

      card.querySelector(".open-btn").onclick = ()=>{
        window.location.href =
          "dashboard-blogs.html?postId="+blog.postId;
      };

      card.querySelector(".remove-btn").onclick = ()=>{
        removeBlog(uid, child.key);
      };

      savedBlogsDiv.appendChild(card);

    });

  });

}

/* ================= REMOVE BLOG ================= */

function removeBlog(uid,key){
  db.ref("savedBlogs/"+uid+"/"+key).remove();
}

/* ================= LOGOUT ================= */

logoutBtn.onclick = ()=>{
  auth.signOut().then(()=>{
    window.location.href="index.html";
  });
};

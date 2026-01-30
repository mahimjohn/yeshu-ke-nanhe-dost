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
      card.className="saved-blog-card";

      card.innerHTML = `
        <img src="${blog.image || 'https://via.placeholder.com/400'}">
        <h3>${blog.title}</h3>

        <div class="actions">
          <i class="fa-solid fa-book-open open"></i>
          <i class="fa-solid fa-trash remove"></i>
        </div>
      `;

      // OPEN BLOG
      card.querySelector(".open").onclick = ()=>{
        window.location.href =
          "dashboard-blogs.html?postId="+blog.postId;
      };

      // REMOVE BLOG
      card.querySelector(".remove").onclick = ()=>{
        db.ref("savedBlogs/"+uid+"/"+blog.postId).remove();
      };

      savedBlogsDiv.appendChild(card);

    });

  });

}

/* ================= LOGOUT ================= */

logoutBtn.onclick = ()=>{
  auth.signOut().then(()=>{
    window.location.href="index.html";
  });
};

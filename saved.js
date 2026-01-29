const auth = firebase.auth();
const db = firebase.database();

/* UI */

const savedBlogsDiv = document.getElementById("savedBlogs");
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.querySelector(".sidebar");
const main = document.querySelector(".main");

const userPhoto = document.getElementById("userPhoto");
const userName = document.getElementById("userName");
const sidePhoto = document.getElementById("sidePhoto");
const sideName = document.getElementById("sideName");
const logoutBtn = document.getElementById("logoutBtn");

/* Sidebar */

menuBtn.onclick=()=>{
  sidebar.classList.toggle("show");
  main.classList.toggle("shift");
};

/* Auth */

auth.onAuthStateChanged(user=>{

  if(!user){
    window.location.href="index.html";
    return;
  }

  userPhoto.src=user.photoURL;
  sidePhoto.src=user.photoURL;
  userName.innerText=user.displayName;
  sideName.innerText=user.displayName;

  loadSavedBlogs(user.uid);
});

/* Load Saved Blogs */

function loadSavedBlogs(uid){

  db.ref("savedBlogs/"+uid).on("value", snap=>{

    savedBlogsDiv.innerHTML="";

    if(!snap.exists()){
      savedBlogsDiv.innerHTML="<p>No saved blogs yet.</p>";
      return;
    }

    snap.forEach(child=>{

      const blog=child.val();

      const card=document.createElement("div");
      card.className="card";

      card.innerHTML=`
        <h3>${blog.title}</h3>
        <button onclick="openBlog('${blog.postId}')">Open</button>
        <button onclick="removeBlog('${child.key}')">Remove</button>
      `;

      savedBlogsDiv.appendChild(card);

    });

  });

}

/* Open Blog */

function openBlog(postId){
  window.location.href="blog.html?post="+postId;
}

/* Remove Blog */

function removeBlog(key){

  const user=auth.currentUser;

  db.ref("savedBlogs/"+user.uid+"/"+key).remove();

}

/* Logout */

logoutBtn.onclick=()=>{
  auth.signOut().then(()=>{
    window.location.href="index.html";
  });
};

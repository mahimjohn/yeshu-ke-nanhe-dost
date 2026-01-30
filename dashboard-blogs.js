/* ================= FIREBASE ================= */

const auth = firebase.auth();
const db = firebase.database();

/* ================= BLOG CONFIG ================= */

const API_KEY = "AIzaSyDKLvTHoh1XOfSnJcmGy_7Y4Da00zEJBbA";
const BLOG_ID = "571259613266997453";

/* ================= ELEMENTS ================= */

const blogsDiv = document.getElementById("blogs");
const loading = document.getElementById("loading");
const reader = document.getElementById("reader");
const list = document.getElementById("list");

const blogTitle = document.getElementById("blogTitle");
const blogContent = document.getElementById("blogContent");

let currentPostId = null;

/* ================= AUTH ================= */

auth.onAuthStateChanged(user=>{
  if(!user){
    window.location.href="login.html";
  }
});

/* ================= URL PARAM ================= */

const params = new URLSearchParams(window.location.search);
const openPostId = params.get("postId");

/* ================= LOAD BLOG LIST ================= */

fetch(`https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts?key=${API_KEY}&maxResults=100`)
.then(res=>res.json())
.then(data=>{

  loading.remove();

  data.items.forEach(post=>{

    const temp = document.createElement("div");
    temp.innerHTML = post.content;
    const img = temp.querySelector("img");
    const image = img ? img.src : "https://via.placeholder.com/400";

    const card = document.createElement("div");
    card.className = "blog-card";

    card.innerHTML = `
      <img src="${image}">
      <h3>${post.title}</h3>
    `;

    card.onclick = ()=>{
      window.location.href =
        "dashboard-blogs.html?postId="+post.id;
    };

    blogsDiv.appendChild(card);

  });

  if(openPostId){
    openBlog(openPostId);
  }

});

/* ================= OPEN BLOG ================= */

function openBlog(postId){

  currentPostId = postId;

  fetch(`https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts/${postId}?key=${API_KEY}`)
  .then(res=>res.json())
  .then(post=>{

    list.style.display="none";
    reader.style.display="block";

    blogTitle.innerText = post.title;

    blogContent.innerHTML = `
      <div style="text-align:right;margin-bottom:15px;">
        <i id="bookmarkBtn"
           class="fa-regular fa-bookmark"
           style="font-size:26px;cursor:pointer;"></i>
      </div>
      ${post.content}
    `;

    checkSaved(post.id, post.title);

  });

}

/* ================= CHECK SAVED ================= */

function checkSaved(postId,title){

  const user = auth.currentUser;
  const ref = db.ref("savedBlogs/"+user.uid+"/"+postId);

  ref.once("value", snap=>{

    const btn = document.getElementById("bookmarkBtn");

    if(snap.exists()){
      btn.className="fa-solid fa-bookmark";
      btn.style.color="#f5c400";
    }else{
      btn.className="fa-regular fa-bookmark";
      btn.style.color="gray";
    }

    btn.onclick=()=>{
      toggleSave(postId,title);
    };

  });

}

/* ================= TOGGLE SAVE ================= */

function toggleSave(postId,title){

  const user = auth.currentUser;
  const ref = db.ref("savedBlogs/"+user.uid+"/"+postId);

  ref.once("value", snap=>{

    const btn=document.getElementById("bookmarkBtn");

    if(snap.exists()){
      ref.remove();
      btn.className="fa-regular fa-bookmark";
      btn.style.color="gray";
    }else{
      ref.set({
        postId,
        title,
        time:Date.now()
      });
      btn.className="fa-solid fa-bookmark";
      btn.style.color="#f5c400";
    }

  });

}

/* ================= BACK ================= */

function goBack(){
  reader.style.display="none";
  list.style.display="block";
  history.replaceState({}, document.title, "dashboard-blogs.html");
}

const API_KEY = "AIzaSyDKLvTHoh1XOfSnJcmGy_7Y4Da00zEJBbA";
const BLOG_ID = "571259613266997453";

const blogsDiv = document.getElementById("blogs");
const loading = document.getElementById("loading");
const reader = document.getElementById("reader");
const list = document.getElementById("list");

const blogTitle = document.getElementById("blogTitle");
const blogContent = document.getElementById("blogContent");

/* ================= LOAD BLOG LIST ================= */

fetch(`https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts?key=${API_KEY}&maxResults=100&timestamp=${new Date().getTime()}`)

.then(res => res.json())
.then(data => {

  loading.remove();

  data.items.forEach(post => {

    const temp = document.createElement("div");
    temp.innerHTML = post.content;
    const img = temp.querySelector("img");
    const image = img ? img.src : "https://via.placeholder.com/400";

    const card = document.createElement("div");
    card.className = "blog-card";

    card.innerHTML = `
      <img src="${image}">
      <div class="blog-card-content">
        <h3>${post.title}</h3>
        <p>${post.published.split("T")[0]}</p>
      </div>
    `;

    card.onclick = () => openBlog(post.id);

    blogsDiv.appendChild(card);

  });

});

/* ================= OPEN SINGLE BLOG ================= */

function openBlog(postId){

  fetch(`https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts/${postId}?key=${API_KEY}`)
  .then(res => res.json())
  .then(post => {

    list.style.display = "none";
    reader.style.display = "block";

    blogTitle.innerText = post.title;

    // Clear first
    blogContent.innerHTML = "";

    // CREATE SAVE BUTTON
    const saveBtn = document.createElement("button");
    saveBtn.innerText = "Save Blog";
    saveBtn.style.marginBottom = "15px";
    saveBtn.style.background = "#0b3d2e";
    saveBtn.style.color = "white";
    saveBtn.style.border = "none";
    saveBtn.style.padding = "10px 18px";
    saveBtn.style.borderRadius = "6px";
    saveBtn.style.cursor = "pointer";

    saveBtn.onclick = () => saveBlog(post.id, post.title);

    // ADD BUTTON + BLOG CONTENT
    blogContent.appendChild(saveBtn);
    blogContent.innerHTML += post.content;

  });

}

/* ================= BACK ================= */

function goBack(){
  reader.style.display = "none";
  list.style.display = "block";
}

/* ================= SAVE BLOG ================= */

function saveBlog(postId, title){

  const user = firebase.auth().currentUser;

  if(!user){
    alert("Please login first");
    return;
  }

  firebase.database()
  .ref("savedBlogs/" + user.uid)
  .push({
    postId: postId,
    title: title
  });

  alert("Blog Saved Successfully!");
}

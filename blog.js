const API_KEY = "AIzaSyDKLvTHoh1XOfSnJcmGy_7Y4Da00zEJBbA";
const BLOG_ID = "571259613266997453";

const blogsDiv = document.getElementById("blogs");
const loading = document.getElementById("loading");
const reader = document.getElementById("reader");
const list = document.getElementById("list");

const blogTitle = document.getElementById("blogTitle");
const blogContent = document.getElementById("blogContent");

// LOAD BLOG LIST
fetch(`https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts?key=${API_KEY}&maxResults=50`)

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

// OPEN SINGLE BLOG
function openBlog(postId){

  fetch(`https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts/${postId}?key=${API_KEY}`)
  .then(res => res.json())
  .then(post => {

    list.style.display = "none";
    reader.style.display = "block";

    blogTitle.innerText = post.title;
    blogContent.innerHTML = post.content;

  });

}

// BACK
function goBack(){
  reader.style.display = "none";
  list.style.display = "block";
}

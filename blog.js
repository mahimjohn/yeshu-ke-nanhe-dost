const BLOGGER_API =
"https://api.allorigins.win/raw?url=https://yeshukenanhedost.blogspot.com/feeds/posts/default?alt=json";

const blogsDiv = document.getElementById("blogs");
const loading = document.getElementById("loading");
const reader = document.getElementById("reader");
const list = document.getElementById("list");
const frame = document.getElementById("frame");

fetch(BLOGGER_API)
.then(res => res.json())
.then(data => {

  loading.remove();
  const posts = data.feed.entry;

  posts.forEach(post => {

    const title = post.title.$t;
    const content = post.content.$t;
    const link = post.link.find(l => l.rel === "alternate").href;

    const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
    const image = imgMatch ? imgMatch[1] :
      "https://via.placeholder.com/400x250";

    const text = content
      .replace(/(<([^>]+)>)/gi,"")
      .substring(0,120) + "...";

    const card = document.createElement("div");
    card.className = "blog-card";

    card.innerHTML = `
      <img src="${image}">
      <div class="blog-card-content">
        <h3>${title}</h3>
        <p>${text}</p>
      </div>
    `;

    card.onclick = () => openBlog(link);

    blogsDiv.appendChild(card);

  });

});

function openBlog(url){
  list.style.display = "none";
  reader.style.display = "block";
  frame.src = url;
}

function goBack(){
  reader.style.display = "none";
  list.style.display = "block";
}

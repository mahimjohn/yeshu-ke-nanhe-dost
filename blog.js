const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

const blogTitle = document.getElementById("blogTitle");
const blogContent = document.getElementById("blogContent");

// If user opens page directly
if (!postId) {
  blogTitle.innerText = "No blog selected";
  blogContent.innerHTML = "<p>Please open a blog from homepage.</p>";
} else {

  fetch("https://yeshukenanhedost.blogspot.com/feeds/posts/default?alt=json")
    .then(res => res.json())
    .then(data => {

      const posts = data.feed.entry;

      let foundPost = null;

      posts.forEach(post => {
        if (post.id.$t.includes(postId)) {
          foundPost = post;
        }
      });

      if (!foundPost) {
        blogTitle.innerText = "Post not found";
        blogContent.innerHTML = "<p>This blog does not exist.</p>";
        return;
      }

      const blogContainer = document.getElementById("blogContainer");
const loadingText = document.getElementById("loadingText");

fetch("https://yeshukenanhedost.blogspot.com/feeds/posts/default?alt=json")
  .then(res => res.json())
  .then(data => {

    loadingText.remove();

    const posts = data.feed.entry.slice(0,6); // show 6 blogs

    posts.forEach(post => {

      const title = post.title.$t;
      const content = post.content.$t;
      const link = post.link.find(l => l.rel === "alternate").href;

      // get first image
      const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
      const image = imgMatch ? imgMatch[1] : "https://via.placeholder.com/400x250";

      // remove html tags
      const text = content.replace(/(<([^>]+)>)/gi, "").substring(0,120) + "...";

      const card = document.createElement("div");
      card.className = "blog-card";
      card.innerHTML = `
        <img src="${image}">
        <div class="blog-card-content">
          <h3>${title}</h3>
          <p>${text}</p>
        </div>
      `;

      card.onclick = () => {
        window.location.href = `blog.html?url=${encodeURIComponent(link)}`;
      };

      blogContainer.appendChild(card);

    });

  })
  .catch(err => {
    loadingText.innerText = "Failed to load blogs.";
    console.error(err);
  });


      blogTitle.innerText = foundPost.title.$t;
      blogContent.innerHTML = foundPost.content.$t;

    })
    .catch(err => {
      blogTitle.innerText = "Error loading blog";
      blogContent.innerHTML = "<p>Unable to load post.</p>";
      console.log(err);
    });

}

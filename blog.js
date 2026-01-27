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

      blogTitle.innerText = foundPost.title.$t;
      blogContent.innerHTML = foundPost.content.$t;

    })
    .catch(err => {
      blogTitle.innerText = "Error loading blog";
      blogContent.innerHTML = "<p>Unable to load post.</p>";
      console.log(err);
    });

}
